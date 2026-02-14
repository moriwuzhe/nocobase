/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Select, Radio, Tag, Space, Spin } from 'antd';
import { connect, mapProps, mapReadPretty } from '@formily/react';
import { useAPIClient } from '@nocobase/client';

interface DictionaryItem {
  value: string;
  label: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

interface DictionarySelectProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  dictionaryCode?: string;
  mode?: 'select' | 'radio' | 'tag';
  allowMultiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * DictionarySelect — a form component that loads options from a data dictionary.
 * Used as the x-component for dictionary field interface.
 */
const InternalDictionarySelect: React.FC<DictionarySelectProps> = ({
  value,
  onChange,
  dictionaryCode,
  mode = 'select',
  allowMultiple = false,
  disabled = false,
  placeholder,
}) => {
  const api = useAPIClient();
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!dictionaryCode) return;
    setLoading(true);
    try {
      const res = await api.request({
        url: 'dictionaries:getByCode',
        params: { code: dictionaryCode },
      });
      const dict = res.data?.data;
      setItems(
        (dict?.items || []).map((item: any) => ({
          value: item.value,
          label: item.label,
          color: item.color,
          icon: item.icon,
          isDefault: item.isDefault,
        })),
      );
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [api, dictionaryCode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) return <Spin size="small" />;

  if (mode === 'radio' && !allowMultiple) {
    return (
      <Radio.Group value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}>
        <Space wrap>
          {items.map((item) => (
            <Radio key={item.value} value={item.value}>
              {item.color ? <Tag color={item.color}>{item.label}</Tag> : item.label}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    );
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      mode={allowMultiple ? 'multiple' : undefined}
      disabled={disabled}
      placeholder={placeholder || 'Select...'}
      allowClear
      showSearch
      optionFilterProp="label"
      options={items.map((item) => ({
        value: item.value,
        label: item.color ? (
          <Space size={4}><Tag color={item.color} style={{ marginRight: 0 }}>{item.label}</Tag></Space>
        ) : item.label,
      }))}
    />
  );
};

/**
 * Read-pretty mode: displays the dictionary value as a colored tag.
 */
const DictionarySelectReadPretty: React.FC<DictionarySelectProps> = ({
  value,
  dictionaryCode,
}) => {
  const api = useAPIClient();
  const [items, setItems] = useState<DictionaryItem[]>([]);

  useEffect(() => {
    if (!dictionaryCode) return;
    (async () => {
      try {
        const res = await api.request({
          url: 'dictionaries:getByCode',
          params: { code: dictionaryCode },
        });
        setItems(res.data?.data?.items || []);
      } catch { /* ignore */ }
    })();
  }, [api, dictionaryCode]);

  if (!value) return null;

  const values = Array.isArray(value) ? value : [value];
  return (
    <Space size={4} wrap>
      {values.map((v) => {
        const item = items.find((i) => i.value === v);
        return item ? (
          <Tag key={v} color={item.color}>{item.label}</Tag>
        ) : (
          <Tag key={v}>{v}</Tag>
        );
      })}
    </Space>
  );
};

export const DictionarySelect = connect(
  InternalDictionarySelect,
  mapProps({ dataSource: 'items' }),
  mapReadPretty(DictionarySelectReadPretty),
);
