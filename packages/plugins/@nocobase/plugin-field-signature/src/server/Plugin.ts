/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

/**
 * Signature Field Plugin
 *
 * Adds a "signature" field type that stores a hand-drawn signature
 * as a base64-encoded PNG data URL. The client renders a canvas
 * for drawing and a read-pretty mode that displays the image.
 */
export default class PluginFieldSignatureServer extends Plugin {
  async load() {
    // Register the signature field interface
    this.db.interfaceManager?.registerInterfaceType?.('signature', {
      name: 'signature',
      type: 'object',
      group: 'media',
      order: 10,
      title: '{{t("Signature")}}',
      description: '{{t("Hand-drawn signature")}}',
      default: {
        type: 'text',
        uiSchema: {
          type: 'string',
          'x-component': 'SignaturePad',
        },
      },
      availableTypes: ['text', 'string'],
      properties: {
        'uiSchema.x-component-props.width': {
          type: 'number',
          title: '{{t("Width")}}',
          'x-decorator': 'FormItem',
          'x-component': 'InputNumber',
          default: 400,
        },
        'uiSchema.x-component-props.height': {
          type: 'number',
          title: '{{t("Height")}}',
          'x-decorator': 'FormItem',
          'x-component': 'InputNumber',
          default: 200,
        },
        'uiSchema.x-component-props.penColor': {
          type: 'string',
          title: '{{t("Pen Color")}}',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          default: '#000000',
        },
        'uiSchema.x-component-props.penWidth': {
          type: 'number',
          title: '{{t("Pen Width")}}',
          'x-decorator': 'FormItem',
          'x-component': 'InputNumber',
          default: 2,
        },
      },
    });
  }
}
