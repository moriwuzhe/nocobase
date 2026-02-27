/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@formily/shared';

function buildFormField(collectionName: string, fieldName: string, required?: boolean) {
  const fieldSchema: Record<string, any> = {
    type: 'string',
    'x-toolbar': 'FormItemSchemaToolbar',
    'x-settings': 'fieldSettings:FormItem',
    'x-component': 'CollectionField',
    'x-decorator': 'FormItem',
    'x-collection-field': `${collectionName}.${fieldName}`,
  };
  if (required) {
    fieldSchema.required = true;
  }
  return {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          [fieldName]: fieldSchema,
        },
      },
    },
  };
}

function buildCreateFormBlock(collectionName: string, formFieldNames: string[], requiredFields?: Set<string>) {
  const formGridProperties: Record<string, any> = {};
  for (const fn of formFieldNames) {
    formGridProperties[uid()] = buildFormField(collectionName, fn, requiredFields?.has(fn));
  }

  return {
    type: 'void',
    'x-acl-action-props': { skipScopeCheck: true },
    'x-acl-action': `${collectionName}:create`,
    'x-decorator': 'FormBlockProvider',
    'x-use-decorator-props': 'useCreateFormBlockDecoratorProps',
    'x-decorator-props': { dataSource: 'main', collection: collectionName },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:createForm',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'FormV2',
        'x-use-component-props': 'useCreateFormBlockProps',
        properties: {
          grid: {
            type: 'void',
            'x-component': 'Grid',
            properties: formGridProperties,
          },
          [uid()]: {
            type: 'void',
            'x-initializer': 'createForm:configureActions',
            'x-component': 'ActionBar',
            'x-component-props': { layout: 'one-column', style: { marginTop: 24 } },
            properties: {
              [uid()]: {
                title: '{{ t("Submit") }}',
                'x-action': 'submit',
                'x-component': 'Action',
                'x-use-component-props': 'useCreateActionProps',
                'x-toolbar': 'ActionSchemaToolbar',
                'x-settings': 'actionSettings:createSubmit',
                'x-component-props': { type: 'primary', htmlType: 'submit' },
                'x-action-settings': { triggerWorkflows: [] },
                type: 'void',
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Build addNew schema for calendar slot click - with pre-built create form instead of empty tabs
 */
export function buildAddNewSchema(
  collectionName: string,
  titleField: string,
  startField: string,
  endField?: string,
) {
  const fields = [titleField, startField, ...(endField ? [endField] : [])];
  const required = new Set([titleField, startField]);

  return {
    type: 'void',
    'x-component': 'AssociationField.AddNewer',
    'x-action': 'create',
    title: '{{ t("Add record") }}',
    'x-component-props': {
      className: 'nb-action-popup',
    },
    properties: {
      form: {
        type: 'void',
        'x-component': 'Grid',
        properties: {
          [uid()]: {
            type: 'void',
            'x-component': 'Grid.Row',
            properties: {
              [uid()]: {
                type: 'void',
                'x-component': 'Grid.Col',
                properties: {
                  [uid()]: buildCreateFormBlock(collectionName, fields, required),
                },
              },
            },
          },
        },
      },
    },
  };
}

const addNew = {
  type: 'void',
  'x-component': 'AssociationField.AddNewer',
  'x-action': 'create',
  title: '{{ t("Add record") }}',
  'x-component-props': {
    className: 'nb-action-popup',
  },
  properties: {
    tabs: {
      type: 'void',
      'x-component': 'Tabs',
      'x-component-props': {},
      'x-initializer': 'popup:addTab',
      'x-initializer-props': {
        gridInitializer: 'popup:addNew:addBlock',
      },
      properties: {
        tab1: {
          type: 'void',
          title: '{{t("Add new")}}',
          'x-component': 'Tabs.TabPane',
          'x-designer': 'Tabs.Designer',
          'x-component-props': {},
          properties: {
            grid: {
              type: 'void',
              'x-component': 'Grid',
              'x-initializer': 'popup:addNew:addBlock',
              properties: {},
            },
          },
        },
      },
    },
  },
};
export { addNew };
