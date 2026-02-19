/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, Space, Spin, message, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useAPIClient, useRecord, useCollection } from '@nocobase/client';

const { Text } = Typography;

/**
 * PrintTemplateAction — an action button that renders a record through a print template.
 * Can be placed in table row actions or detail page action bars.
 */
export const PrintTemplateAction: React.FC<{ buttonText?: string }> = ({ buttonText }) => {
  const api = useAPIClient();
  const record = useRecord();
  const collection = useCollection();
  const [visible, setVisible] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (!visible || !collection?.name) return;
    (async () => {
      try {
        const res = await api.request({
          url: 'printTemplates:list',
          params: {
            filter: { collectionName: collection.name, enabled: true },
          },
        });
        setTemplates(res.data?.data || []);
      } catch { /* ignore */ }
    })();
  }, [visible, collection?.name, api]);

  const handlePrint = async () => {
    if (!selectedTemplate || !record?.id) return;
    setLoading(true);
    try {
      const res = await api.request({
        url: 'printTemplates:render',
        params: {
          templateId: selectedTemplate,
          collectionName: collection?.name,
          recordId: record.id,
        },
      });
      const html = res.data?.data?.html;
      if (html) {
        setPreviewHtml(html);
        setPreviewVisible(true);
        setVisible(false);
      }
    } catch (err: any) {
      message.error(err.message || 'Render failed');
    }
    setLoading(false);
  };

  const handleActualPrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Print</title></head>
        <body onload="window.print(); window.close();">
          ${previewHtml}
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <>
      <Button icon={<PrinterOutlined />} onClick={() => setVisible(true)}>
        {buttonText || 'Print'}
      </Button>

      {/* Template selection */}
      <Modal
        title="Select Print Template"
        open={visible}
        onOk={handlePrint}
        onCancel={() => setVisible(false)}
        okText="Preview"
        okButtonProps={{ disabled: !selectedTemplate, loading }}
      >
        {templates.length === 0 ? (
          <Text type="secondary">
            No print templates configured for this collection.
            Go to Settings → Print Templates to create one.
          </Text>
        ) : (
          <Select
            style={{ width: '100%' }}
            placeholder="Select a template..."
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            options={templates.map((t) => ({
              label: `${t.name} (${t.paperSize} ${t.orientation})`,
              value: t.id,
            }))}
          />
        )}
      </Modal>

      {/* Print preview */}
      <Modal
        title="Print Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setPreviewVisible(false)}>Close</Button>
            <Button type="primary" icon={<PrinterOutlined />} onClick={handleActualPrint}>
              Print
            </Button>
          </Space>
        }
      >
        <div
          style={{
            border: '1px solid #d9d9d9',
            padding: 32,
            minHeight: 400,
            background: '#fff',
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Modal>
    </>
  );
};
