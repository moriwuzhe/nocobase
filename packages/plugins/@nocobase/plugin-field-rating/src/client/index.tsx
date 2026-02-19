/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Rate } from 'antd';
import { connect, mapProps, mapReadPretty } from '@formily/react';
import { Plugin } from '@nocobase/client';

interface RatingStarsProps {
  value?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  color?: string;
  disabled?: boolean;
}

const InternalRatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  count = 5,
  allowHalf = true,
  color = '#fadb14',
  disabled = false,
}) => {
  return (
    <Rate
      value={value}
      onChange={onChange}
      count={count}
      allowHalf={allowHalf}
      disabled={disabled}
      style={{ color }}
    />
  );
};

const RatingReadPretty: React.FC<RatingStarsProps> = ({
  value,
  count = 5,
  allowHalf = true,
  color = '#fadb14',
}) => {
  return (
    <Rate
      value={value || 0}
      count={count}
      allowHalf={allowHalf}
      disabled
      style={{ color, fontSize: 16 }}
    />
  );
};

export const RatingStars = connect(
  InternalRatingStars,
  mapProps({ dataSource: 'options' }),
  mapReadPretty(RatingReadPretty),
);

export class PluginFieldRatingClient extends Plugin {
  async load() {
    this.app.addComponents({ RatingStars });
  }
}

export default PluginFieldRatingClient;
