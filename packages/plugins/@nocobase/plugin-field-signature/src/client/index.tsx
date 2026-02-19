/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button, Space } from 'antd';
import { ClearOutlined, CheckOutlined } from '@ant-design/icons';
import { connect, mapReadPretty } from '@formily/react';
import { Plugin } from '@nocobase/client';

interface SignaturePadProps {
  value?: string;
  onChange?: (value: string) => void;
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  disabled?: boolean;
}

/**
 * SignaturePad — a canvas-based hand signature input.
 * Stores the result as a base64 PNG data URL.
 */
const InternalSignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  width = 400,
  height = 200,
  penColor = '#000000',
  penWidth = 2,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  // Load existing value
  useEffect(() => {
    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, width, height);
        ctx?.drawImage(img, 0, 0);
        setHasContent(true);
      };
      img.src = value;
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Export canvas as data URL
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (dataUrl) onChange?.(dataUrl);
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, width, height);
    setHasContent(false);
    onChange?.('');
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          cursor: disabled ? 'not-allowed' : 'crosshair',
          touchAction: 'none',
          background: '#fff',
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      {!disabled && (
        <Space style={{ marginTop: 8 }}>
          <Button size="small" icon={<ClearOutlined />} onClick={clear} disabled={!hasContent}>
            Clear
          </Button>
        </Space>
      )}
    </div>
  );
};

const SignatureReadPretty: React.FC<{ value?: string }> = ({ value }) => {
  if (!value) return <span style={{ color: '#999' }}>No signature</span>;
  return <img src={value} alt="Signature" style={{ maxWidth: 300, maxHeight: 150, border: '1px solid #eee', borderRadius: 4 }} />;
};

export const SignaturePad = connect(InternalSignaturePad, mapReadPretty(SignatureReadPretty));

export class PluginFieldSignatureClient extends Plugin {
  async load() {
    this.app.addComponents({ SignaturePad });
  }
}

export default PluginFieldSignatureClient;
