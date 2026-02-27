/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@formily/shared';
import { App, Card, Col, Row, Spin, Tag, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAPIClient } from '../../../api-client/hooks/useAPIClient';
import {
  builtInTemplates,
  CalendarConfig,
  CollectionDef,
  FieldDef,
  GanttConfig,
  KanbanConfig,
  MenuItemDef,
  RelationDef,
  TemplateDef,
} from './templates';
import { templateSampleData, SampleBatch, isRef } from './sampleData';
import { HIGHLIGHT_I18N_KEYS, TEMPLATE_I18N_KEYS } from './templateConstants';

const { Title, Paragraph, Text } = Typography;

// ─── Schema builders ──────────────────────────────────────

function buildColumn(fieldName: string) {
  return {
    type: 'void',
    'x-decorator': 'TableV2.Column.Decorator',
    'x-component': 'TableV2.Column',
    'x-toolbar': 'TableColumnSchemaToolbar',
    'x-settings': 'fieldSettings:TableColumn',
    properties: {
      [fieldName]: {
        'x-component': 'CollectionField',
        'x-read-pretty': true,
      },
    },
  };
}

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

function buildDetailField(collectionName: string, fieldName: string) {
  return {
    type: 'void',
    'x-component': 'Grid.Col',
    properties: {
      [fieldName]: {
        type: 'string',
        'x-toolbar': 'FormItemSchemaToolbar',
        'x-settings': 'fieldSettings:FormItem',
        'x-component': 'CollectionField',
        'x-decorator': 'FormItem',
        'x-collection-field': `${collectionName}.${fieldName}`,
        'x-read-pretty': true,
      },
    },
  };
}

function buildDetailBlock(collectionName: string, fieldNames: string[]) {
  const gridProperties: Record<string, any> = {};
  for (let i = 0; i < fieldNames.length; i += 2) {
    const rowProps: Record<string, any> = {
      [uid()]: buildDetailField(collectionName, fieldNames[i]),
    };
    if (i + 1 < fieldNames.length) {
      rowProps[uid()] = buildDetailField(collectionName, fieldNames[i + 1]);
    }
    gridProperties[uid()] = { type: 'void', 'x-component': 'Grid.Row', properties: rowProps };
  }

  const printAction = buildPrintAction();

  return {
    type: 'void',
    'x-acl-action': `${collectionName}:get`,
    'x-decorator': 'DetailsBlockProvider',
    'x-use-decorator-props': 'useDetailsDecoratorProps',
    'x-decorator-props': { dataSource: 'main', collection: collectionName, readPretty: true, action: 'get' },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:details',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Details',
        'x-read-pretty': true,
        'x-use-component-props': 'useDetailsProps',
        properties: {
          [uid()]: {
            type: 'void',
            'x-initializer': 'details:configureActions',
            'x-component': 'ActionBar',
            'x-component-props': { style: { marginBottom: 24 } },
            properties: {
              [uid()]: printAction,
            },
          },
          [uid()]: {
            type: 'void',
            'x-component': 'Grid',
            'x-initializer': 'details:configureFields',
            properties: gridProperties,
          },
        },
      },
    },
  };
}

function buildPrintAction() {
  return {
    type: 'void',
    title: '{{ t("Print") }}',
    'x-action': 'print',
    'x-component': 'Action',
    'x-use-component-props': 'useDetailPrintActionProps',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:print',
    'x-component-props': { icon: 'PrinterOutlined' },
  };
}

function buildBulkEditAction() {
  return {
    type: 'void',
    title: '{{ t("Bulk edit") }}',
    'x-action': 'customize:bulkEdit',
    'x-component': 'Action',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:bulkEdit',
    'x-component-props': { icon: 'EditOutlined', openMode: 'drawer' },
    'x-action-settings': { assignedValues: {}, updateMode: 'selected' },
    'x-align': 'right',
    'x-decorator': 'ACLActionProvider',
    'x-acl-action': 'update',
    'x-acl-action-props': {
      skipScopeCheck: true,
    },
  };
}

function buildExportAction(collectionName: string, columnFieldNames: string[]) {
  return {
    type: 'void',
    title: '{{ t("Export") }}',
    'x-action': 'export',
    'x-component': 'Action',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:export',
    'x-component-props': { icon: 'UploadOutlined', useAction: '{{ useExportAction }}' },
    'x-action-settings': {
      exportSettings: columnFieldNames.map((fn) => ({
        dataIndex: [fn],
        title: fn,
      })),
    },
  };
}

function buildImportAction(collectionName: string, columnFieldNames: string[]) {
  return {
    type: 'void',
    title: '{{ t("Import") }}',
    'x-action': 'import',
    'x-component': 'Action',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:import',
    'x-component-props': { icon: 'DownloadOutlined', openMode: 'modal' },
    'x-action-settings': {
      importSettings: { importColumns: columnFieldNames.map((fn) => ({ dataIndex: [fn], title: fn })), explain: '' },
    },
  };
}

function buildKanbanCardField(collectionName: string, fieldName: string) {
  return {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          [fieldName]: {
            'x-component': 'CollectionField',
            'x-read-pretty': true,
            'x-decorator': 'FormItem',
            'x-decorator-props': { labelStyle: { display: 'none' } },
            'x-collection-field': `${collectionName}.${fieldName}`,
          },
        },
      },
    },
  };
}

function buildKanbanViewFormBlock(collectionName: string, fieldNames: string[]) {
  const formGridProperties: Record<string, any> = {};
  const names = fieldNames.length > 0 ? fieldNames : ['id'];
  for (const fn of names) {
    formGridProperties[uid()] = buildFormField(collectionName, fn, false);
  }
  return {
    type: 'void',
    'x-acl-action': `${collectionName}:get`,
    'x-decorator': 'FormBlockProvider',
    'x-use-decorator-props': 'useEditFormBlockDecoratorProps',
    'x-decorator-props': { action: 'get', dataSource: 'main', collection: collectionName, readPretty: true },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:editForm',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'FormV2',
        'x-pattern': 'readPretty',
        'x-use-component-props': 'useEditFormBlockProps',
        properties: {
          grid: {
            type: 'void',
            'x-component': 'Grid',
            properties: formGridProperties,
          },
        },
      },
    },
  };
}

function buildKanbanBlock(collectionName: string, groupField: string, cardFields?: string[]) {
  const cardGridProps: Record<string, any> = {};
  if (cardFields && cardFields.length > 0) {
    for (const fn of cardFields) {
      cardGridProps[uid()] = buildKanbanCardField(collectionName, fn);
    }
  }

  return {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          [uid()]: {
            type: 'void',
            'x-acl-action': `${collectionName}:list`,
            'x-decorator': 'KanbanBlockProvider',
            'x-use-decorator-props': 'useKanbanBlockDecoratorProps',
            'x-decorator-props': {
              collection: collectionName,
              dataSource: 'main',
              action: 'list',
              groupField,
              params: { paginate: false },
            },
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:kanban',
            'x-component': 'CardItem',
            properties: {
              actions: {
                type: 'void',
                'x-initializer': 'kanban:configureActions',
                'x-component': 'ActionBar',
                'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
                properties: {
                  addNew: {
                    type: 'void',
                    title: "{{ t('Add new') }}",
                    'x-action': 'create',
                    'x-acl-action': 'create',
                    'x-decorator': 'ACLActionProvider',
                    'x-acl-action-props': { skipScopeCheck: true },
                    'x-component': 'Action',
                    'x-component-props': { type: 'primary', icon: 'PlusOutlined' },
                    'x-align': 'right',
                    properties: {
                      drawer: {
                        type: 'void',
                        title: '{{ t("Add record") }}',
                        'x-component': 'Action.Drawer',
                        'x-component-props': { className: 'nb-action-popup' },
                        properties: {
                          grid: {
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
                                      [uid()]: buildCreateFormBlock(
                                        collectionName,
                                        [...new Set([groupField, ...(cardFields || [])])],
                                        new Set([groupField]),
                                      ),
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              [uid()]: {
                type: 'array',
                'x-component': 'Kanban',
                'x-use-component-props': 'useKanbanBlockProps',
                properties: {
                  card: {
                    type: 'void',
                    name: 'card',
                    'x-read-pretty': true,
                    'x-label-disabled': true,
                    'x-decorator': 'BlockItem',
                    'x-component': 'Kanban.Card',
                    'x-use-component-props': 'useKanbanCardProps',
                    'x-component-props': { openMode: 'drawer' },
                    properties: {
                      grid: {
                        type: 'void',
                        'x-component': 'Grid',
                        'x-initializer': 'details:configureFields',
                        properties: cardGridProps,
                      },
                    },
                  },
                  cardViewer: {
                    type: 'void',
                    title: '{{ t("View") }}',
                    'x-component': 'Kanban.CardViewer',
                    'x-component-props': { openMode: 'drawer' },
                    properties: {
                      drawer: {
                        type: 'void',
                        title: '{{ t("View record") }}',
                        'x-component': 'Action.Drawer',
                        'x-component-props': { className: 'nb-action-popup' },
                        properties: {
                          grid: {
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
                                      [uid()]: {
                                        type: 'void',
                                        'x-component': 'PopupRecordProvider',
                                        properties: {
                                          [uid()]: buildKanbanViewFormBlock(collectionName, cardFields || []),
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function buildCalendarBlock(collectionName: string, titleField: string, startDateField: string, endDateField?: string) {
  const fieldNames: Record<string, any> = { title: titleField, start: startDateField };
  if (endDateField) fieldNames.end = endDateField;

  return {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          [uid()]: {
            type: 'void',
            'x-acl-action': `${collectionName}:list`,
            'x-decorator': 'CalendarBlockProvider',
            'x-use-decorator-props': 'useCalendarBlockDecoratorProps',
            'x-decorator-props': {
              collection: collectionName,
              dataSource: 'main',
              action: 'list',
              fieldNames,
              params: { paginate: false },
            },
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:calendar',
            'x-component': 'CardItem',
            properties: {
              [uid()]: {
                type: 'void',
                'x-component': 'CalendarV2',
                'x-use-component-props': 'useCalendarBlockProps',
                properties: {
                  toolBar: {
                    type: 'void',
                    'x-component': 'CalendarV2.ActionBar',
                    'x-initializer': 'calendar:configureActions',
                    'x-component-props': { style: { marginBottom: 24 } },
                    properties: {
                      today: {
                        type: 'void',
                        title: '{{ t("Today") }}',
                        'x-component': 'CalendarV2.Today',
                        'x-action': 'calendar:today',
                        'x-align': 'left',
                      },
                      nav: {
                        type: 'void',
                        title: '{{ t("Navigate") }}',
                        'x-component': 'CalendarV2.Nav',
                        'x-action': 'calendar:nav',
                        'x-align': 'left',
                      },
                      title: {
                        type: 'void',
                        'x-component': 'CalendarV2.Title',
                        'x-action': 'calendar:title',
                        'x-align': 'left',
                      },
                      viewSelect: {
                        type: 'void',
                        title: '{{ t("Select view") }}',
                        'x-component': 'CalendarV2.ViewSelect',
                        'x-action': 'calendar:viewSelect',
                        'x-align': 'right',
                        'x-designer': 'Action.Designer',
                      },
                      addNew: {
                        type: 'void',
                        title: "{{ t('Add new') }}",
                        'x-action': 'create',
                        'x-acl-action': 'create',
                        'x-decorator': 'ACLActionProvider',
                        'x-component': 'Action',
                        'x-component-props': { type: 'primary', icon: 'PlusOutlined' },
                        'x-align': 'right',
                        properties: {
                          drawer: {
                            type: 'void',
                            title: '{{ t("Add record") }}',
                            'x-component': 'Action.Drawer',
                            'x-component-props': { className: 'nb-action-popup' },
                            properties: {
                              grid: {
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
                                          [uid()]: buildCreateFormBlock(
                                            collectionName,
                                            [titleField, startDateField, ...(endDateField ? [endDateField] : [])],
                                            new Set([titleField, startDateField]),
                                          ),
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  event: {
                    type: 'void',
                    'x-component': 'CalendarV2.Event',
                    'x-component-props': { openMode: 'drawer' },
                    properties: {
                      drawer: {
                        type: 'void',
                        'x-component': 'Action.Drawer',
                        'x-component-props': { className: 'nb-action-popup' },
                        title: '{{ t("View record") }}',
                        properties: {
                          grid: {
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
                                      [uid()]: {
                                        type: 'void',
                                        'x-component': 'PopupRecordProvider',
                                        properties: {
                                          [uid()]: buildKanbanViewFormBlock(collectionName, [
                                            titleField,
                                            startDateField,
                                            ...(endDateField ? [endDateField] : []),
                                          ]),
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function buildGanttBlock(
  collectionName: string,
  titleField: string,
  startField: string,
  endField: string,
  progressField?: string,
) {
  const fieldNames: Record<string, any> = { title: titleField, start: startField, end: endField };
  if (progressField) fieldNames.progress = progressField;

  return {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          [uid()]: {
            type: 'void',
            'x-acl-action': `${collectionName}:list`,
            'x-decorator': 'GanttBlockProvider',
            'x-use-decorator-props': 'useGanttBlockDecoratorProps',
            'x-decorator-props': {
              collection: collectionName,
              dataSource: 'main',
              action: 'list',
              fieldNames,
              params: { paginate: false, sort: [startField] },
            },
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:gantt',
            'x-component': 'CardItem',
            properties: {
              [uid()]: {
                type: 'void',
                'x-component': 'Gantt',
                'x-use-component-props': 'useGanttBlockProps',
                properties: {
                  toolBar: {
                    type: 'void',
                    'x-component': 'ActionBar',
                    'x-initializer': 'gantt:configureActions',
                    'x-component-props': { style: { marginBottom: 24 } },
                    properties: {
                      addNew: {
                        type: 'void',
                        title: "{{ t('Add new') }}",
                        'x-action': 'create',
                        'x-acl-action': 'create',
                        'x-decorator': 'ACLActionProvider',
                        'x-acl-action-props': { skipScopeCheck: true },
                        'x-component': 'Action',
                        'x-component-props': { type: 'primary', icon: 'PlusOutlined' },
                        'x-align': 'right',
                        properties: {
                          drawer: {
                            type: 'void',
                            title: '{{ t("Add record") }}',
                            'x-component': 'Action.Drawer',
                            'x-component-props': { className: 'nb-action-popup' },
                            properties: {
                              grid: {
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
                                          [uid()]: buildCreateFormBlock(
                                            collectionName,
                                            [
                                              titleField,
                                              startField,
                                              endField,
                                              ...(progressField ? [progressField] : []),
                                            ],
                                            new Set([titleField, startField]),
                                          ),
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  table: {
                    type: 'void',
                    'x-decorator': 'div',
                    'x-decorator-props': { style: { float: 'left', maxWidth: '35%' } },
                    'x-initializer': 'table:configureColumns',
                    'x-component': 'TableV2',
                    'x-use-component-props': 'useTableBlockProps',
                    'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                    properties: {
                      [uid()]: buildColumn(titleField),
                    },
                  },
                  detail: {
                    type: 'void',
                    'x-component': 'Gantt.Event',
                    properties: {
                      drawer: {
                        type: 'void',
                        'x-component': 'Action.Drawer',
                        'x-component-props': { className: 'nb-action-popup' },
                        title: '{{ t("View record") }}',
                        properties: {
                          grid: {
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
                                      [uid()]: {
                                        type: 'void',
                                        'x-component': 'PopupRecordProvider',
                                        properties: {
                                          [uid()]: buildKanbanViewFormBlock(collectionName, [
                                            titleField,
                                            startField,
                                            endField,
                                            ...(progressField ? [progressField] : []),
                                          ]),
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
            'x-initializer': 'form:configureFields',
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

function buildEditFormBlock(collectionName: string, formFieldNames: string[], requiredFields?: Set<string>) {
  const formGridProperties: Record<string, any> = {};
  for (const fn of formFieldNames) {
    formGridProperties[uid()] = buildFormField(collectionName, fn, requiredFields?.has(fn));
  }

  return {
    type: 'void',
    'x-acl-action-props': { skipScopeCheck: false },
    'x-acl-action': `${collectionName}:update`,
    'x-decorator': 'FormBlockProvider',
    'x-use-decorator-props': 'useEditFormBlockDecoratorProps',
    'x-decorator-props': { action: 'get', dataSource: 'main', collection: collectionName },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:editForm',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'FormV2',
        'x-use-component-props': 'useEditFormBlockProps',
        properties: {
          grid: {
            type: 'void',
            'x-component': 'Grid',
            'x-initializer': 'form:configureFields',
            properties: formGridProperties,
          },
          [uid()]: {
            type: 'void',
            'x-initializer': 'editForm:configureActions',
            'x-component': 'ActionBar',
            'x-component-props': { layout: 'one-column', style: { marginTop: 24 } },
            properties: {
              [uid()]: {
                title: '{{ t("Submit") }}',
                'x-action': 'submit',
                'x-component': 'Action',
                'x-use-component-props': 'useUpdateActionProps',
                'x-toolbar': 'ActionSchemaToolbar',
                'x-settings': 'actionSettings:updateSubmit',
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

function buildViewFormBlock(collectionName: string, formFieldNames: string[]) {
  const formGridProperties: Record<string, any> = {};
  for (const fn of formFieldNames) {
    formGridProperties[uid()] = buildFormField(collectionName, fn, false);
  }
  return {
    type: 'void',
    'x-acl-action': `${collectionName}:get`,
    'x-decorator': 'FormBlockProvider',
    'x-use-decorator-props': 'useEditFormBlockDecoratorProps',
    'x-decorator-props': { action: 'get', dataSource: 'main', collection: collectionName, readPretty: true },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:editForm',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'FormV2',
        'x-pattern': 'readPretty',
        'x-use-component-props': 'useEditFormBlockProps',
        properties: {
          grid: {
            type: 'void',
            'x-component': 'Grid',
            properties: formGridProperties,
          },
        },
      },
    },
  };
}

function buildViewAction(collectionName: string, formFieldNames: string[], detailFieldNames: string[]) {
  const viewFormBlock = buildViewFormBlock(collectionName, formFieldNames.length > 0 ? formFieldNames : detailFieldNames);
  return {
    type: 'void',
    title: '{{ t("View") }}',
    'x-action': 'view',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:view',
    'x-component': 'Action.Link',
    'x-component-props': { openMode: 'drawer' },
    'x-action-context': { dataSource: 'main', collection: collectionName },
    'x-decorator': 'ACLActionProvider',
    properties: {
      drawer: {
        type: 'void',
        title: '{{ t("View record") }}',
        'x-component': 'Action.Drawer',
        'x-component-props': { className: 'nb-action-popup' },
        properties: {
          grid: {
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
                    properties: { [uid()]: viewFormBlock },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function buildEditAction(collectionName: string, formFieldNames: string[], requiredFields?: Set<string>) {
  const editFormBlock = buildEditFormBlock(collectionName, formFieldNames, requiredFields);
  return {
    type: 'void',
    title: '{{ t("Edit") }}',
    'x-action': 'update',
    'x-acl-action': 'update',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:edit',
    'x-component': 'Action.Link',
    'x-component-props': { openMode: 'drawer', icon: 'EditOutlined' },
    'x-decorator': 'ACLActionProvider',
    properties: {
      drawer: {
        type: 'void',
        title: '{{ t("Edit record") }}',
        'x-component': 'Action.Drawer',
        'x-component-props': { className: 'nb-action-popup' },
        properties: {
          grid: {
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
                    properties: { [uid()]: editFormBlock },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function buildDuplicateAction(collectionName: string, formFieldNames: string[], requiredFields?: Set<string>) {
  const duplicateFormBlock = buildCreateFormBlock(collectionName, formFieldNames, requiredFields);
  const duplicateFields = [...formFieldNames];
  return {
    type: 'void',
    title: '{{ t("Duplicate") }}',
    'x-action': 'duplicate',
    'x-acl-action': 'create',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:duplicate',
    'x-component': 'Action.Link',
    'x-component-props': {
      openMode: 'drawer',
      icon: 'CopyOutlined',
      component: 'DuplicateAction',
      duplicateMode: 'quickDulicate',
      duplicateFields,
      duplicateCollection: collectionName,
    },
    'x-decorator': 'DuplicateActionDecorator',
    'x-action-settings': { duplicateMode: 'quickDulicate', duplicateFields },
    properties: {
      drawer: {
        type: 'void',
        title: '{{ t("Duplicate") }}',
        'x-component': 'Action.Drawer',
        'x-component-props': { className: 'nb-action-popup' },
        properties: {
          grid: {
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
                    properties: { [uid()]: duplicateFormBlock },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function buildDeleteAction() {
  return {
    type: 'void',
    title: '{{ t("Delete") }}',
    'x-action': 'destroy',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:delete',
    'x-component': 'Action.Link',
    'x-component-props': {
      icon: 'DeleteOutlined',
      confirm: { title: "{{t('Delete record')}}", content: "{{t('Are you sure you want to delete it?')}}" },
    },
    'x-use-component-props': 'useDestroyActionProps',
  };
}

function buildActionsColumn(
  collectionName: string,
  formFieldNames: string[],
  detailFieldNames: string[],
  requiredFields?: Set<string>,
) {
  const actionProperties: Record<string, any> = {
    [uid()]: buildViewAction(collectionName, formFieldNames, detailFieldNames),
    [uid()]: buildEditAction(collectionName, formFieldNames, requiredFields),
    [uid()]: buildDeleteAction(),
  };
  if (formFieldNames.length > 0) {
    actionProperties[uid()] = buildDuplicateAction(collectionName, formFieldNames, requiredFields);
  }

  return {
    type: 'void',
    title: '{{ t("Actions") }}',
    'x-decorator': 'TableV2.Column.ActionBar',
    'x-component': 'TableV2.Column',
    'x-toolbar': 'TableColumnSchemaToolbar',
    'x-settings': 'fieldSettings:TableColumn',
    'x-initializer': 'table:configureItemActions',
    'x-action-column': 'actions',
    properties: {
      [uid()]: {
        type: 'void',
        'x-decorator': 'DndContext',
        'x-component': 'Space',
        'x-component-props': { split: '|' },
        properties: actionProperties,
      },
    },
  };
}

function getRequiredFields(collection: CollectionDef): Set<string> {
  const reqSet = new Set<string>();
  for (const f of collection.fields) {
    if (f.required || f.uiSchema?.required) {
      reqSet.add(f.name);
    }
  }
  return reqSet;
}

function buildActionBar(
  collectionName: string,
  formFieldNames: string[],
  collection: CollectionDef,
  requiredFields?: Set<string>,
) {
  const columnFieldNames = collection.fields.filter((f) => f.showInTable !== false).map((f) => f.name);
  const exportAction = buildExportAction(collectionName, columnFieldNames);
  const importAction = buildImportAction(collectionName, columnFieldNames);
  const createBlock = buildCreateFormBlock(collectionName, formFieldNames, requiredFields);

  return {
    type: 'void',
    'x-initializer': 'table:configureActions',
    'x-component': 'ActionBar',
    'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
    properties: {
      filter: {
        type: 'void',
        title: '{{ t("Filter") }}',
        'x-action': 'filter',
        'x-toolbar': 'ActionSchemaToolbar',
        'x-settings': 'actionSettings:filter',
        'x-component': 'Filter.Action',
        'x-use-component-props': 'useFilterActionProps',
        'x-component-props': { icon: 'FilterOutlined' },
        'x-align': 'left',
      },
      [uid()]: exportAction,
      [uid()]: importAction,
      [uid()]: buildBulkEditAction(),
      [uid()]: {
        type: 'void',
        title: '{{ t("Delete") }}',
        'x-action': 'destroy',
        'x-toolbar': 'ActionSchemaToolbar',
        'x-settings': 'actionSettings:bulkDelete',
        'x-component': 'Action',
        'x-use-component-props': 'useBulkDestroyActionProps',
        'x-component-props': {
          icon: 'DeleteOutlined',
          confirm: { title: "{{t('Delete record')}}", content: "{{t('Are you sure you want to delete it?')}}" },
        },
      },
      [uid()]: {
        type: 'void',
        title: '{{ t("Add new") }}',
        'x-action': 'create',
        'x-toolbar': 'ActionSchemaToolbar',
        'x-settings': 'actionSettings:addNew',
        'x-component': 'Action',
        'x-component-props': { openMode: 'drawer', type: 'primary', icon: 'PlusOutlined' },
        properties: {
          drawer: {
            type: 'void',
            title: '{{ t("Add record") }}',
            'x-component': 'Action.Drawer',
            'x-component-props': { className: 'nb-action-popup' },
            properties: {
              grid: {
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
                        properties: { [uid()]: createBlock },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function buildTableBlockSchema(
  collectionName: string,
  columnFieldNames: string[],
  formFieldNames: string[],
  detailFieldNames: string[],
  collection: CollectionDef,
) {
  const requiredFields = getRequiredFields(collection);
  const columnProperties: Record<string, any> = {};
  for (const fn of columnFieldNames) {
    columnProperties[uid()] = buildColumn(fn);
  }
  columnProperties[uid()] = buildActionsColumn(collectionName, formFieldNames, detailFieldNames, requiredFields);

  return {
    type: 'void',
    'x-decorator': 'TableBlockProvider',
    'x-acl-action': `${collectionName}:list`,
    'x-use-decorator-props': 'useTableBlockDecoratorProps',
    'x-decorator-props': {
      collection: collectionName,
      dataSource: 'main',
      action: 'list',
      // Use id sort to avoid runtime failures when legacy/partial tables miss createdAt.
      params: { pageSize: 20, sort: ['-id'] },
      showIndex: true,
      dragSort: false,
    },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:table',
    'x-component': 'CardItem',
    'x-filter-targets': [],
    properties: {
      actions: buildActionBar(collectionName, formFieldNames, collection, requiredFields),
      [uid()]: {
        type: 'array',
        'x-initializer': 'table:configureColumns',
        'x-component': 'TableV2',
        'x-use-component-props': 'useTableBlockProps',
        'x-component-props': {
          rowKey: 'id',
          rowSelection: { type: 'checkbox' },
        },
        properties: columnProperties,
      },
    },
  };
}

function getFieldNames(collection: CollectionDef, relations: RelationDef[]) {
  const collectionRelations = relations.filter((r) => r.sourceCollection === collection.name);
  const columnFieldNames = collection.fields.filter((f) => f.showInTable !== false).map((f) => f.name);
  for (const rel of collectionRelations) {
    if (rel.showInTable !== false) columnFieldNames.push(rel.name);
  }

  const formFieldNames = collection.fields.filter((f) => f.showInForm !== false).map((f) => f.name);
  for (const rel of collectionRelations) {
    if (rel.showInForm !== false) formFieldNames.push(rel.name);
  }

  const detailFieldNames = [...collection.fields.map((f) => f.name)];
  for (const rel of collectionRelations) {
    detailFieldNames.push(rel.name);
  }

  return { columnFieldNames, formFieldNames, detailFieldNames };
}

// ─── Page view config ─────────────────────────────────────

interface PageViewConfig {
  kanban?: KanbanConfig;
  calendar?: CalendarConfig;
  gantt?: GanttConfig;
}

function buildPageSchema(
  collectionName: string,
  columnFieldNames: string[],
  formFieldNames: string[],
  detailFieldNames: string[],
  collection: CollectionDef,
  viewConfig?: PageViewConfig,
) {
  const pageSchemaUid = uid();
  const tableBlock = buildTableBlockSchema(
    collectionName,
    columnFieldNames,
    formFieldNames,
    detailFieldNames,
    collection,
  );
  const hasTabs = !!(viewConfig?.kanban || viewConfig?.calendar || viewConfig?.gantt);

  if (!hasTabs) {
    const tabSchemaUid = uid();
    const tabSchemaName = uid();
    return {
      pageSchemaUid,
      enableTabs: false,
      tabs: [{ schemaUid: tabSchemaUid, tabSchemaName, title: undefined as string | undefined }],
      schema: {
        type: 'void',
        'x-component': 'Page',
        'x-uid': pageSchemaUid,
        properties: {
          [tabSchemaName]: {
            type: 'void',
            'x-component': 'Grid',
            'x-initializer': 'page:addBlock',
            'x-uid': tabSchemaUid,
            'x-async': true,
            properties: {
              [uid()]: {
                type: 'void',
                'x-component': 'Grid.Row',
                properties: {
                  [uid()]: {
                    type: 'void',
                    'x-component': 'Grid.Col',
                    properties: { [uid()]: tableBlock },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  const tabs: { schemaUid: string; tabSchemaName: string; title?: string }[] = [];
  const pageProperties: Record<string, any> = {};

  const tableTabName = uid();
  const tableTabUid = uid();
  tabs.push({ schemaUid: tableTabUid, tabSchemaName: tableTabName, title: '{{t("List")}}' });
  pageProperties[tableTabName] = {
    type: 'void',
    'x-component': 'Grid',
    'x-initializer': 'page:addBlock',
    'x-uid': tableTabUid,
    'x-async': true,
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: { [uid()]: { type: 'void', 'x-component': 'Grid.Col', properties: { [uid()]: tableBlock } } },
      },
    },
  };

  if (viewConfig?.kanban) {
    const kanbanTabName = uid();
    const kanbanTabUid = uid();
    tabs.push({ schemaUid: kanbanTabUid, tabSchemaName: kanbanTabName, title: '{{t("Kanban")}}' });
    const kanbanCardFields = collection.fields
      .filter((f) => f.showInTable !== false && f.name !== viewConfig?.kanban?.groupField)
      .slice(0, 3)
      .map((f) => f.name);
    const kanbanBlock = buildKanbanBlock(collectionName, viewConfig.kanban.groupField, kanbanCardFields);
    pageProperties[kanbanTabName] = {
      type: 'void',
      'x-component': 'Grid',
      'x-initializer': 'page:addBlock',
      'x-uid': kanbanTabUid,
      'x-async': true,
      properties: { [uid()]: kanbanBlock },
    };
  }

  if (viewConfig?.calendar) {
    const calendarTabName = uid();
    const calendarTabUid = uid();
    tabs.push({ schemaUid: calendarTabUid, tabSchemaName: calendarTabName, title: '{{t("Calendar")}}' });
    const calendarBlock = buildCalendarBlock(
      collectionName,
      viewConfig.calendar.titleField,
      viewConfig.calendar.startDateField,
      viewConfig.calendar.endDateField,
    );
    pageProperties[calendarTabName] = {
      type: 'void',
      'x-component': 'Grid',
      'x-initializer': 'page:addBlock',
      'x-uid': calendarTabUid,
      'x-async': true,
      properties: { [uid()]: calendarBlock },
    };
  }

  if (viewConfig?.gantt) {
    const ganttTabName = uid();
    const ganttTabUid = uid();
    tabs.push({ schemaUid: ganttTabUid, tabSchemaName: ganttTabName, title: '{{t("Gantt")}}' });
    const ganttBlock = buildGanttBlock(
      collectionName,
      viewConfig.gantt.titleField,
      viewConfig.gantt.startField,
      viewConfig.gantt.endField,
      viewConfig.gantt.progressField,
    );
    pageProperties[ganttTabName] = {
      type: 'void',
      'x-component': 'Grid',
      'x-initializer': 'page:addBlock',
      'x-uid': ganttTabUid,
      'x-async': true,
      properties: { [uid()]: ganttBlock },
    };
  }

  return {
    pageSchemaUid,
    enableTabs: true,
    tabs,
    schema: {
      type: 'void',
      'x-component': 'Page',
      'x-uid': pageSchemaUid,
      'x-component-props': { enableTabs: true },
      properties: pageProperties,
    },
  };
}

// ─── Install template ─────────────────────────────────────

function countViewConfigs(menuItems: MenuItemDef[], type: 'kanban' | 'calendar' | 'gantt'): number {
  let count = 0;
  for (const item of menuItems) {
    if (item.type === 'page' && item[type]) count++;
    if (item.children) count += countViewConfigs(item.children, type);
  }
  return count;
}

interface TemplateInstallUI {
  modal: { confirm: (config: any) => void };
  message: {
    loading: (config: any) => void;
    error: (config: any) => void;
    success: (config: any) => void;
  };
}

interface TemplateInstallErrorDetail {
  step: string;
  message: string;
}

export interface TemplateInstallHealthReport {
  templateKey: string;
  expectedCollections: number;
  actualCollections: number;
  missingCollections: string[];
  expectedPages: number;
  actualPages: number;
  missingPages: string[];
  expectedWorkflows: number;
  actualWorkflows: number;
  missingWorkflows: string[];
  checkedAt: string;
}

interface TemplateInstallOptions {
  skipConfirm?: boolean;
  onError?: (detail: TemplateInstallErrorDetail) => void;
  onHealthReport?: (report: TemplateInstallHealthReport) => void;
  messageKey?: string;
  skipAppReadyCheck?: boolean;
  /** Translation function for install UI messages */
  t?: (key: string, options?: Record<string, any>) => string;
}

function getAxiosErrorMessage(err: any): string {
  const responseData = err?.response?.data;
  const serverMessage =
    responseData?.message ||
    responseData?.error?.message ||
    (Array.isArray(responseData?.errors)
      ? responseData.errors
          .map((e: any) => e?.message)
          .filter(Boolean)
          .join('; ')
      : '');
  return String(serverMessage || err?.message || 'Unknown error');
}

function isAlreadyExistsError(err: any): boolean {
  const status = err?.response?.status;
  const text = getAxiosErrorMessage(err).toLowerCase();
  return status === 409 || text.includes('already exists') || text.includes('duplicate') || text.includes('unique');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientStartupError(err: any): boolean {
  const status = err?.response?.status;
  if ([502, 503, 504].includes(status)) {
    return true;
  }
  const message = getAxiosErrorMessage(err).toLowerCase();
  return (
    message.includes('application may be starting up') ||
    message.includes('app_initializing') ||
    message.includes('bad gateway') ||
    message.includes('app_commanding') ||
    message.includes('maintaining')
  );
}

async function requestWithRetry(
  api: any,
  config: Record<string, any>,
  options?: { maxAttempts?: number; initialDelayMs?: number },
) {
  const maxAttempts = options?.maxAttempts ?? 3;
  let delayMs = options?.initialDelayMs ?? 1000;
  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await api.request(config);
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !isTransientStartupError(error)) {
        throw error;
      }
      await sleep(delayMs);
      delayMs = Math.min(5000, delayMs + 800);
    }
  }
  throw lastError;
}

async function waitForAppReady(
  api: any,
  headers: Record<string, string>,
  options?: { maxAttempts?: number; initialDelayMs?: number },
) {
  const maxAttempts = options?.maxAttempts ?? 15;
  const initialDelayMs = options?.initialDelayMs ?? 1500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await api.silent().request({
        url: 'app:getInfo',
        method: 'get',
        headers,
        skipNotify: true,
      });
      return true;
    } catch (e: any) {
      const status = e?.response?.status;
      // 401/403 means sub-app is running but current token is not accepted by this app.
      if (status === 401 || status === 403) {
        return true;
      }
      // Fast-fail non-transient errors to avoid noisy loops.
      if (status && status !== 404 && !isTransientStartupError(e)) {
        return false;
      }
      await sleep(Math.min(6000, initialDelayMs + attempt * 350));
    }
  }

  return false;
}

function normalizeListRows(res: any): any[] {
  const payload = res?.data?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(res?.data?.rows)) return res.data.rows;
  return [];
}

function buildTemplateFieldPayload(field: FieldDef): Record<string, any> {
  const { name, type, interface: fieldInterface, title, uiSchema, required, showInTable, showInForm, ...rest } = field;
  void showInTable;
  void showInForm;
  return {
    ...rest,
    name,
    type,
    interface: fieldInterface,
    uiSchema: uiSchema || { type: 'string', title, 'x-component': 'Input' },
    ...(required ? { required: true } : {}),
  };
}

export async function installTemplate(
  api: any,
  appName: string,
  templateKey: string,
  ui: TemplateInstallUI,
  options?: TemplateInstallOptions,
): Promise<boolean> {
  const tpl = builtInTemplates.find((t) => t.key === templateKey);
  if (!tpl) return false;
  const messageKey = options?.messageKey || 'tpl';

  const kanbanCount = countViewConfigs(tpl.menu, 'kanban');
  const calendarCount = countViewConfigs(tpl.menu, 'calendar');
  const ganttCount = countViewConfigs(tpl.menu, 'gantt');
  const sampleBatches = templateSampleData[templateKey] || [];
  const sampleCount = sampleBatches.reduce((sum, b) => sum + b.records.length, 0);

  const t = options?.t;
  const msg = (key: string, opts?: Record<string, any>) => (t ? t(key, opts) : key);
  const displayTitle = t && TEMPLATE_I18N_KEYS[tpl.key] ? t(TEMPLATE_I18N_KEYS[tpl.key].title) : tpl.title;
  const displayDesc = t && TEMPLATE_I18N_KEYS[tpl.key] ? t(TEMPLATE_I18N_KEYS[tpl.key].description) : tpl.description;

  return new Promise((resolve) => {
    const confirmConfig: any = {
      title: msg('Install template: {{title}}', { title: displayTitle }),
      width: 560,
      content: (
        <div>
          <p>{displayDesc}</p>
          <p>
            {msg('Template install confirm collections', {
              collections: tpl.collections.length,
              relations: tpl.relations.length,
            })}
            {kanbanCount > 0 && msg('Template install confirm kanban', { count: kanbanCount })}
            {calendarCount > 0 && msg('Template install confirm calendar', { count: calendarCount })}
            {ganttCount > 0 && msg('Template install confirm gantt', { count: ganttCount })}
            {msg('Template install confirm workflows', { workflows: tpl.workflows.length })}
          </p>
          <p dangerouslySetInnerHTML={{ __html: msg('Template install features') }} />
          <p dangerouslySetInnerHTML={{ __html: msg('Template install sample data', { count: sampleCount }) }} />
        </div>
      ),
      okText: msg('Start install'),
      cancelText: msg('Cancel'),
      onOk: async () => {
        let currentStep = 'prepare';
        const notifyError = (detail: TemplateInstallErrorDetail) => {
          try {
            options?.onError?.(detail);
          } catch {
            // Keep installation flow unaffected by diagnostics callback failures.
          }
        };

        const notifyHealthReport = (report: TemplateInstallHealthReport) => {
          try {
            options?.onHealthReport?.(report);
          } catch {
            // Keep installation flow unaffected by diagnostics callback failures.
          }
        };
        try {
          const headers = { 'X-App': appName };
          let missingWorkflows: string[] = [];
          let sampleFailed: { collection: string; count: number }[] = [];
          let unresolvedRefs: { collection: string; ref: string }[] = [];

          if (!options?.skipAppReadyCheck) {
            // Wait for sub-app to be ready with retry
            currentStep = 'waitForAppReady';
            ui.message.loading({ content: msg('Waiting for app startup...'), key: messageKey, duration: 0 });
            const appReady = await waitForAppReady(api, headers, { maxAttempts: 15, initialDelayMs: 1500 });
            if (!appReady) {
              notifyError({ step: currentStep, message: 'app_start_timeout' });
              ui.message.error({ content: msg('App startup timeout, please try again later'), key: messageKey });
              resolve(false);
              return;
            }
          }

          let authHeaders: Record<string, string> = { ...headers };
          try {
            currentStep = 'authSignIn';
            const authRes = await requestWithRetry(
              api,
              {
                url: 'auth:signIn',
                method: 'post',
                data: { account: 'admin@nocobase.com', password: 'admin123' },
                headers,
              },
              { maxAttempts: 2, initialDelayMs: 1000 },
            );
            const subToken = authRes?.data?.data?.token;
            if (subToken) authHeaders = { ...headers, Authorization: `Bearer ${subToken}` };
          } catch {
            // Auth may fail if password changed, continue with main app token
          }

          const listCollectionFields = async (collectionName: string) => {
            currentStep = `listCollectionFields:${collectionName}`;
            const fieldRes = await requestWithRetry(
              api,
              {
                url: `collections/${collectionName}/fields:list`,
                method: 'get',
                headers: authHeaders,
                params: { paginate: false },
              },
              { maxAttempts: 3, initialDelayMs: 700 },
            );
            return normalizeListRows(fieldRes);
          };

          const ensureCollectionFields = async (collectionName: string, fieldDefs: Record<string, any>[]) => {
            const existingRows = await listCollectionFields(collectionName);
            const existingNames = new Set(
              existingRows.map((row: any) => String(row?.name || '').trim()).filter(Boolean),
            );
            const missingFields = fieldDefs.filter(
              (fieldDef) => !existingNames.has(String(fieldDef?.name || '').trim()),
            );

            for (const fieldDef of missingFields) {
              currentStep = `repairCollectionField:${collectionName}.${fieldDef.name}`;
              try {
                await requestWithRetry(
                  api,
                  {
                    url: `collections/${collectionName}/fields:create`,
                    method: 'post',
                    headers: authHeaders,
                    data: fieldDef,
                  },
                  { maxAttempts: 3, initialDelayMs: 700 },
                );
              } catch (fieldErr) {
                if (isAlreadyExistsError(fieldErr)) {
                  continue;
                }
                throw new Error(
                  `Failed to repair field "${collectionName}.${fieldDef.name}": ${getAxiosErrorMessage(fieldErr)}`,
                );
              }
            }

            const repairedRows = await listCollectionFields(collectionName);
            const repairedNames = new Set(
              repairedRows.map((row: any) => String(row?.name || '').trim()).filter(Boolean),
            );
            const stillMissing = fieldDefs
              .map((fieldDef) => String(fieldDef?.name || '').trim())
              .filter((name) => !!name && !repairedNames.has(name));
            if (stillMissing.length > 0) {
              throw new Error(`Collection "${collectionName}" missing fields after repair: ${stillMissing.join(', ')}`);
            }
          };

          for (let i = 0; i < tpl.collections.length; i++) {
            const col = tpl.collections[i];
            currentStep = `createCollection:${col.name}`;
            ui.message.loading({
              content: msg('Creating data tables... {{current}}/{{total}}', {
                current: i + 1,
                total: tpl.collections.length,
              }),
              key: messageKey,
              duration: 0,
            });
            const businessFields = col.fields.map((f) => buildTemplateFieldPayload(f));
            const systemRepairFields: Record<string, any>[] = [
              {
                name: 'createdAt',
                type: 'date',
                interface: 'createdAt',
                field: 'createdAt',
                uiSchema: {
                  type: 'datetime',
                  title: '{{t("Created at")}}',
                  'x-component': 'DatePicker',
                  'x-component-props': { showTime: true },
                },
              },
              {
                name: 'updatedAt',
                type: 'date',
                interface: 'updatedAt',
                field: 'updatedAt',
                uiSchema: {
                  type: 'datetime',
                  title: '{{t("Last updated at")}}',
                  'x-component': 'DatePicker',
                  'x-component-props': { showTime: true },
                },
              },
            ];

            try {
              await requestWithRetry(
                api,
                {
                  url: 'collections:create',
                  method: 'post',
                  headers: authHeaders,
                  data: {
                    name: col.name,
                    title: col.title,
                    fields: [
                      ...businessFields,
                      {
                        name: 'id',
                        type: 'bigInt',
                        autoIncrement: true,
                        primaryKey: true,
                        allowNull: false,
                        interface: 'id',
                      },
                      {
                        name: 'createdAt',
                        type: 'date',
                        interface: 'createdAt',
                        field: 'createdAt',
                        uiSchema: {
                          type: 'datetime',
                          title: '{{t("Created at")}}',
                          'x-component': 'DatePicker',
                          'x-component-props': { showTime: true },
                        },
                      },
                      {
                        name: 'updatedAt',
                        type: 'date',
                        interface: 'updatedAt',
                        field: 'updatedAt',
                        uiSchema: {
                          type: 'datetime',
                          title: '{{t("Last updated at")}}',
                          'x-component': 'DatePicker',
                          'x-component-props': { showTime: true },
                        },
                      },
                    ],
                    createdBy: true,
                    updatedBy: true,
                    sortable: true,
                    autoGenId: false,
                    logging: true,
                  },
                },
                { maxAttempts: 3, initialDelayMs: 800 },
              );
            } catch (e) {
              if (isAlreadyExistsError(e)) {
                // Support repair/retry flow: continue installation if collection already exists.
              } else {
                throw e;
              }
            }

            currentStep = `repairCollection:${col.name}`;
            await ensureCollectionFields(col.name, [...businessFields, ...systemRepairFields]);
          }

          for (let i = 0; i < tpl.relations.length; i++) {
            const rel = tpl.relations[i];
            ui.message.loading({
              content: msg('Creating relations... {{current}}/{{total}}', {
                current: i + 1,
                total: tpl.relations.length,
              }),
              key: messageKey,
              duration: 0,
            });
            try {
              currentStep = `createRelation:${rel.sourceCollection}.${rel.name}`;
              await requestWithRetry(
                api,
                {
                  url: `collections/${rel.sourceCollection}/fields:create`,
                  method: 'post',
                  headers: authHeaders,
                  data: {
                    name: rel.name,
                    type: rel.type,
                    interface: rel.interface,
                    target: rel.target,
                    foreignKey: rel.foreignKey,
                    targetKey: rel.targetKey,
                    uiSchema: {
                      type: 'object',
                      title: rel.title,
                      'x-component': 'AssociationField',
                      'x-component-props': { fieldNames: { label: rel.labelField, value: 'id' } },
                    },
                  },
                },
                { maxAttempts: 3, initialDelayMs: 800 },
              );
            } catch (e) {
              if (isAlreadyExistsError(e)) {
                // Support repair/retry flow: continue when relation already exists.
                continue;
              }
              const detail = getAxiosErrorMessage(e);
              throw new Error(`Failed to create relation "${rel.sourceCollection}.${rel.name}": ${detail}`);
            }
          }

          ui.message.loading({ content: msg('Configuring pages...'), key: messageKey, duration: 0 });

          const collectionMap = new Map<string, CollectionDef>();
          for (const col of tpl.collections) {
            collectionMap.set(col.name, col);
          }

          const listDesktopRoutes = async (filter: Record<string, any>) => {
            try {
              const res = await requestWithRetry(
                api,
                {
                  url: 'desktopRoutes:list',
                  method: 'get',
                  headers: authHeaders,
                  params: { filter, paginate: false },
                },
                { maxAttempts: 3, initialDelayMs: 600 },
              );
              return normalizeListRows(res);
            } catch {
              const res = await requestWithRetry(
                api,
                {
                  url: 'routes:list',
                  method: 'get',
                  headers: authHeaders,
                  params: { filter, paginate: false },
                },
                { maxAttempts: 3, initialDelayMs: 600 },
              );
              return normalizeListRows(res);
            }
          };

          const findDesktopRoute = async (filter: Record<string, any>) => {
            const rows = await listDesktopRoutes(filter);
            return rows[0];
          };

          const updateDesktopRoute = async (id: number | string, values: Record<string, any>) => {
            try {
              return await requestWithRetry(
                api,
                {
                  url: 'desktopRoutes:update',
                  method: 'post',
                  headers: authHeaders,
                  params: { filterByTk: id },
                  data: { values },
                },
                { maxAttempts: 3, initialDelayMs: 600 },
              );
            } catch {
              return await requestWithRetry(
                api,
                {
                  url: 'routes:update',
                  method: 'post',
                  headers: authHeaders,
                  params: { filterByTk: id },
                  data: { values },
                },
                { maxAttempts: 3, initialDelayMs: 600 },
              );
            }
          };

          const createDesktopRoute = async (routeData: Record<string, any>) => {
            const routeFilter: Record<string, any> = {
              type: routeData.type,
              title: routeData.title,
            };
            if (routeData.parentId !== undefined && routeData.parentId !== null) {
              routeFilter.parentId = routeData.parentId;
            }

            try {
              return await requestWithRetry(
                api,
                {
                  url: 'desktopRoutes:create',
                  method: 'post',
                  headers: authHeaders,
                  data: routeData,
                },
                { maxAttempts: 3, initialDelayMs: 600 },
              );
            } catch (desktopErr: any) {
              if (isAlreadyExistsError(desktopErr)) {
                const existingRoute = await findDesktopRoute(routeFilter);
                if (existingRoute?.id) {
                  if (routeData.type === 'page') {
                    await updateDesktopRoute(existingRoute.id, {
                      icon: routeData.icon,
                      schemaUid: routeData.schemaUid,
                      parentId: routeData.parentId,
                      hideInMenu: routeData.hideInMenu,
                      enableTabs: routeData.enableTabs,
                      children: routeData.children,
                    });
                  }
                  return { data: { data: existingRoute } };
                }
              }

              try {
                return await requestWithRetry(
                  api,
                  {
                    url: 'routes:create',
                    method: 'post',
                    headers: authHeaders,
                    data: routeData,
                  },
                  { maxAttempts: 3, initialDelayMs: 600 },
                );
              } catch (routeErr: any) {
                if (isAlreadyExistsError(routeErr)) {
                  const existingRoute = await findDesktopRoute(routeFilter);
                  if (existingRoute?.id) {
                    if (routeData.type === 'page') {
                      await updateDesktopRoute(existingRoute.id, {
                        icon: routeData.icon,
                        schemaUid: routeData.schemaUid,
                        parentId: routeData.parentId,
                        hideInMenu: routeData.hideInMenu,
                        enableTabs: routeData.enableTabs,
                        children: routeData.children,
                      });
                    }
                    return { data: { data: existingRoute } };
                  }
                }

                const routeTitle = routeData?.title || routeData?.type || 'unknown';
                const detail = getAxiosErrorMessage(routeErr) || getAxiosErrorMessage(desktopErr);
                throw new Error(`Failed to create route "${routeTitle}": ${detail}`);
              }
            }
          };

          const createMenuGroup = async (title: string, icon?: string): Promise<number | string | undefined> => {
            currentStep = `createMenuGroup:${title}`;
            const routeRes = await createDesktopRoute({
              type: 'group',
              title,
              icon,
              hideInMenu: false,
            });
            return routeRes?.data?.data?.id;
          };

          const createPageRoute = async (
            parentRouteId: number | string | undefined,
            page: {
              title: string;
              icon?: string;
              collectionName?: string;
              kanban?: KanbanConfig;
              calendar?: CalendarConfig;
              gantt?: GanttConfig;
            },
          ) => {
            if (!page.collectionName) return;
            const collection = collectionMap.get(page.collectionName);
            if (!collection) return;
            currentStep = `createPageRoute:${page.title}`;

            const { columnFieldNames, formFieldNames, detailFieldNames } = getFieldNames(collection, tpl.relations);

            const viewConfig: PageViewConfig = {};
            if (page.kanban) viewConfig.kanban = page.kanban;
            if (page.calendar) viewConfig.calendar = page.calendar;
            if (page.gantt) viewConfig.gantt = page.gantt;

            const hasViewConfig = Object.keys(viewConfig).length > 0;
            const pageResult = buildPageSchema(
              page.collectionName,
              columnFieldNames,
              formFieldNames,
              detailFieldNames,
              collection,
              hasViewConfig ? viewConfig : undefined,
            );

            await requestWithRetry(
              api,
              {
                url: 'uiSchemas:insert',
                method: 'post',
                headers: authHeaders,
                data: pageResult.schema,
              },
              { maxAttempts: 3, initialDelayMs: 600 },
            );

            const routeData = {
              type: 'page',
              title: page.title,
              icon: page.icon,
              schemaUid: pageResult.pageSchemaUid,
              parentId: parentRouteId,
              hideInMenu: false,
              enableTabs: pageResult.enableTabs,
              children: pageResult.tabs.map((tab) => ({
                type: 'tabs',
                title: tab.title || '{{t("Unnamed")}}',
                schemaUid: tab.schemaUid,
                tabSchemaName: tab.tabSchemaName,
                hideInMenu: false,
              })),
            };

            await createDesktopRoute(routeData);
          };

          for (const menuItem of tpl.menu) {
            if (menuItem.type === 'group') {
              const groupRouteId = await createMenuGroup(menuItem.title, menuItem.icon);
              if (menuItem.children) {
                for (const child of menuItem.children) {
                  if (child.type === 'page') {
                    await createPageRoute(groupRouteId, child);
                  }
                }
              }
            } else if (menuItem.type === 'page') {
              await createPageRoute(undefined, menuItem);
            }
          }

          if (tpl.workflows.length > 0) {
            currentStep = 'createWorkflowMenuLink';
            try {
              await createDesktopRoute({
                type: 'link',
                title: msg('Workflow'),
                icon: 'PartitionOutlined',
                hideInMenu: false,
                options: {
                  href: '/admin/settings/workflow',
                  openInNewWindow: false,
                },
              });
            } catch (e) {
              console.warn('Failed to create workflow menu link:', e);
            }
          }

          const expectedPageTitles: string[] = [];
          for (const menuItem of tpl.menu) {
            if (menuItem.type === 'page') {
              expectedPageTitles.push(menuItem.title);
            } else if (menuItem.children?.length) {
              for (const child of menuItem.children) {
                if (child.type === 'page') expectedPageTitles.push(child.title);
              }
            }
          }

          const missingPages: string[] = [];
          for (const title of expectedPageTitles) {
            currentStep = `validatePageRoute:${title}`;
            try {
              const route = await findDesktopRoute({ type: 'page', title });
              const schemaUid = route?.schemaUid;
              if (!schemaUid) {
                missingPages.push(title);
                continue;
              }
              await requestWithRetry(
                api,
                {
                  url: `uiSchemas:getJsonSchema/${schemaUid}`,
                  method: 'get',
                  headers: authHeaders,
                },
                { maxAttempts: 3, initialDelayMs: 600 },
              );
            } catch {
              missingPages.push(title);
            }
          }
          if (missingPages.length > 0) {
            throw new Error(`Template pages missing after install: ${missingPages.join(', ')}`);
          }

          // Refresh sub-app caches after route/schema writes so pages are immediately available.
          try {
            currentStep = 'refreshApp';
            await requestWithRetry(
              api,
              {
                url: 'app:refresh',
                method: 'post',
                headers: authHeaders,
              },
              { maxAttempts: 2, initialDelayMs: 800 },
            );
            const readyAfterRefresh = await waitForAppReady(api, authHeaders, {
              maxAttempts: 20,
              initialDelayMs: 1200,
            });
            if (!readyAfterRefresh) {
              throw new Error('app_not_ready_after_refresh');
            }
          } catch {
            // refresh may be unavailable in some deployments
          }

          const totalSampleCount = sampleBatches.reduce((sum, b) => sum + b.records.length, 0);
          let sampleInserted = 0;
          const idMap: Record<string, Record<string, number>> = {};

          for (const batch of sampleBatches) {
            if (!idMap[batch.collection]) idMap[batch.collection] = {};
            let batchFailed = 0;

            for (const record of batch.records) {
              currentStep = `insertSample:${batch.collection}`;
              ui.message.loading({
                content: msg('Inserting sample data... {{current}}/{{total}}', {
                  current: sampleInserted + 1,
                  total: totalSampleCount,
                }),
                key: messageKey,
                duration: 0,
              });
              const cleanRecord: Record<string, any> = {};
              for (const [k, v] of Object.entries(record)) {
                if (isRef(v)) {
                  const refMap = idMap[v.__ref];
                  if (refMap) {
                    const matchKey = Object.keys(v.__match)[0];
                    const matchVal = v.__match[matchKey];
                    const refId = refMap[`${matchKey}:${matchVal}`];
                    if (refId) {
                      cleanRecord[k] = refId;
                    } else {
                      unresolvedRefs.push({
                        collection: batch.collection,
                        ref: `${v.__ref}.${matchKey}=${matchVal}`,
                      });
                    }
                  } else {
                    unresolvedRefs.push({
                      collection: batch.collection,
                      ref: `${v.__ref} (batch order?)`,
                    });
                  }
                } else {
                  cleanRecord[k] = v;
                }
              }

              try {
                const res = await requestWithRetry(
                  api,
                  {
                    url: `${batch.collection}:create`,
                    method: 'post',
                    headers: authHeaders,
                    data: cleanRecord,
                  },
                  { maxAttempts: 8, initialDelayMs: 700 },
                );
                const createdId = res?.data?.data?.id ?? res?.data?.id;
                if (createdId) {
                  sampleInserted += 1;
                  for (const [k, v] of Object.entries(record)) {
                    if (typeof v === 'string' || typeof v === 'number') {
                      idMap[batch.collection][`${k}:${v}`] = createdId;
                    }
                  }
                } else {
                  batchFailed += 1;
                }
              } catch (e) {
                batchFailed += 1;
                console.warn(`Failed to insert ${batch.collection} record:`, e);
              }
            }
            if (batchFailed > 0) {
              sampleFailed.push({ collection: batch.collection, count: batchFailed });
            }
          }

          if (tpl.workflows.length > 0) {
            ui.message.loading({ content: msg('Creating workflows...'), key: messageKey, duration: 0 });

            const toNumericId = (value: any): number | null => {
              if (value == null || value === '') return null;
              const num = Number(value);
              return Number.isFinite(num) && num > 0 ? num : null;
            };

            const extractCreatedId = (res: any): number | null => {
              const body = res?.data;
              const payload = body?.data ?? body;
              if (Array.isArray(payload)) {
                return toNumericId(payload[0]?.id);
              }
              return toNumericId(payload?.id);
            };

            const mainAppHeaders: Record<string, string> = { ...authHeaders };
            if (mainAppHeaders['X-App']) delete mainAppHeaders['X-App'];
            const workflowHeadersToTry: Record<string, string>[] =
              authHeaders['X-App'] ? [mainAppHeaders, authHeaders] : [authHeaders];

            const createWorkflowWithCompat = async (wf: (typeof tpl.workflows)[number]): Promise<number | null> => {
              const workflowValues = {
                title: wf.title,
                description: wf.description,
                type: wf.type,
                enabled: true,
                config: wf.triggerConfig,
              };
              const attemptPayloads = [
                { label: 'direct', data: workflowValues },
                { label: 'values', data: { values: workflowValues } },
              ];
              let lastError: any;

              for (const headers of workflowHeadersToTry) {
                for (const attempt of attemptPayloads) {
                  try {
                    currentStep = `createWorkflow:${wf.title}:${attempt.label}`;
                    const wfRes = await requestWithRetry(
                      api,
                      {
                        url: 'workflows:create',
                        method: 'post',
                        headers,
                        data: attempt.data,
                      },
                      { maxAttempts: 3, initialDelayMs: 700 },
                    );
                    const workflowId = extractCreatedId(wfRes);
                    if (workflowId) {
                      return workflowId;
                    }
                    lastError = new Error(`empty workflow id (${attempt.label})`);
                  } catch (err) {
                    lastError = err;
                  }
                }
              }

              console.warn(`Workflow "${wf.title}" creation failed:`, getAxiosErrorMessage(lastError));
              return null;
            };

            const createWorkflowNodeWithCompat = async (
              workflowId: number,
              wfTitle: string,
              node: (typeof tpl.workflows)[number]['nodes'][number],
              upstreamId: number | null,
            ): Promise<number | null> => {
              const nodeValues = {
                title: node.title,
                type: node.type,
                upstreamId,
                config: node.config,
              };
              const attemptPayloads = [
                { label: 'direct', data: nodeValues },
                { label: 'values', data: { values: nodeValues } },
              ];
              let lastError: any;

              for (const headers of workflowHeadersToTry) {
                for (const attempt of attemptPayloads) {
                  try {
                    currentStep = `createWorkflowNode:${wfTitle}:${node.title}:${attempt.label}`;
                    const nodeRes = await requestWithRetry(
                      api,
                      {
                        url: `workflows/${workflowId}/nodes:create`,
                        method: 'post',
                        headers,
                        data: attempt.data,
                      },
                      { maxAttempts: 3, initialDelayMs: 700 },
                    );
                    const nodeId = extractCreatedId(nodeRes);
                    if (nodeId) {
                      return nodeId;
                    }
                    lastError = new Error(`empty workflow node id (${attempt.label})`);
                  } catch (err) {
                    lastError = err;
                  }
                }
              }

              console.warn(`Workflow node "${wfTitle}:${node.title}" creation failed:`, getAxiosErrorMessage(lastError));
              return null;
            };

            const countWorkflowNodes = async (workflowId: number): Promise<number | null> => {
              try {
                currentStep = `validateWorkflowNodes:${workflowId}`;
                const listRes = await requestWithRetry(
                  api,
                  {
                    url: 'flow_nodes:list',
                    method: 'get',
                    headers: authHeaders,
                    params: { filter: { workflowId }, paginate: false },
                  },
                  { maxAttempts: 2, initialDelayMs: 600 },
                );
                return normalizeListRows(listRes).length;
              } catch {
                return null;
              }
            };

            for (const wf of tpl.workflows) {
              const workflowId = await createWorkflowWithCompat(wf);
              if (workflowId != null && wf.nodes.length > 0) {
                let upstreamId: number | null = null;
                for (const node of wf.nodes) {
                  const nodeId = await createWorkflowNodeWithCompat(workflowId, wf.title, node, upstreamId);
                  upstreamId = nodeId ?? upstreamId;
                }
              }
              if (workflowId == null) {
                missingWorkflows.push(wf.title);
              }
            }

            currentStep = 'validateWorkflows';
            let workflowListRes: any;
            for (const headers of workflowHeadersToTry) {
              try {
                workflowListRes = await requestWithRetry(
                  api,
                  {
                    url: 'workflows:list',
                    method: 'get',
                    headers,
                    params: { paginate: false },
                  },
                  { maxAttempts: 2, initialDelayMs: 600 },
                );
                break;
              } catch {
                workflowListRes = null;
              }
            }
            if (workflowListRes) {
              const workflowRows = normalizeListRows(workflowListRes);
              const existingWorkflowTitles = new Set(
                workflowRows.map((row: any) => String(row?.title || '').trim()).filter(Boolean),
              );
              missingWorkflows = tpl.workflows
                .map((wf) => String(wf?.title || '').trim())
                .filter((title) => !!title && !existingWorkflowTitles.has(title));
            }
          }

          const expectedCollectionNames = tpl.collections.map((collection) => String(collection?.name || '').trim());
          const missingCollections: string[] = [];
          for (const collectionName of expectedCollectionNames) {
            if (!collectionName) {
              continue;
            }
            try {
              await listCollectionFields(collectionName);
            } catch {
              missingCollections.push(collectionName);
            }
          }
          if (missingCollections.length > 0) {
            throw new Error(`Missing collections after installation: ${missingCollections.join(', ')}`);
          }

          notifyHealthReport({
            templateKey: tpl.key,
            expectedCollections: expectedCollectionNames.length,
            actualCollections: expectedCollectionNames.length - missingCollections.length,
            missingCollections,
            expectedPages: expectedPageTitles.length,
            actualPages: expectedPageTitles.length - missingPages.length,
            missingPages,
            expectedWorkflows: tpl.workflows.length,
            actualWorkflows: tpl.workflows.length - missingWorkflows.length,
            missingWorkflows,
            checkedAt: new Date().toISOString(),
          });

          // Refresh once more after sample/workflow creation to avoid stale metadata in newly opened app.
          try {
            currentStep = 'finalRefreshApp';
            await requestWithRetry(
              api,
              {
                url: 'app:refresh',
                method: 'post',
                headers: authHeaders,
              },
              { maxAttempts: 2, initialDelayMs: 800 },
            );
          } catch {
            // refresh may be unavailable in some deployments
          }

          const successParts: string[] = [];
          if (missingWorkflows.length > 0) {
            successParts.push(msg('{{count}} workflow(s) could not be created', { count: missingWorkflows.length }));
          }
          if (sampleFailed.length > 0) {
            const failedCount = sampleFailed.reduce((s, x) => s + x.count, 0);
            successParts.push(msg('{{count}} sample record(s) failed', { count: failedCount }));
          }
          if (unresolvedRefs.length > 0) {
            successParts.push(msg('{{count}} reference(s) unresolved', { count: unresolvedRefs.length }));
          }
          const successContent =
            successParts.length > 0
              ? msg('Template "{{title}}" installed. {{issues}}', {
                  title: displayTitle,
                  issues: successParts.join('; '),
                })
              : msg('Template "{{title}}" installed successfully', { title: displayTitle });
          ui.message.success({
            content: successContent,
            key: messageKey,
          });
          resolve(true);
        } catch (err: any) {
          notifyError({ step: currentStep, message: getAxiosErrorMessage(err) });
          console.error('Template installation failed:', err);
          ui.message.error({
            content: msg('Installation failed: {{message}}', { message: err?.message || 'Unknown error' }),
            key: messageKey,
          });
          resolve(false);
        }
      },
      onCancel: () => resolve(false),
    };

    if (options?.skipConfirm) {
      void confirmConfig.onOk();
      return;
    }

    ui.modal.confirm(confirmConfig);
  });
}

// ─── Template Selector component ──────────────────────────

export const TemplateSelector: React.FC<{ appName: string; onInstalled?: () => void }> = ({ appName, onInstalled }) => {
  const api = useAPIClient();
  const { modal, message } = App.useApp();
  const { t } = useTranslation();
  const [installing, setInstalling] = useState(false);

  const handleInstall = useCallback(
    async (templateKey: string) => {
      setInstalling(true);
      try {
        const ok = await installTemplate(api, appName, templateKey, { modal, message }, { t });
        if (ok) {
          onInstalled?.();
        }
      } finally {
        setInstalling(false);
      }
    },
    [api, appName, message, modal, onInstalled, t],
  );

  return (
    <Spin spinning={installing} tip={t('Installing template...')}>
      <div style={{ padding: '24px 0' }}>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>
          {t('Select template')}
        </Title>
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          {t('Select template for new app')}
        </Paragraph>
        <Row gutter={[16, 16]}>
          {builtInTemplates.length === 0 ? (
            <Col span={24}>
              <Paragraph type="secondary" style={{ textAlign: 'center', padding: 24 }}>
                {t('No templates available')}
              </Paragraph>
            </Col>
          ) : (
          builtInTemplates.map((tpl) => {
            const i18n = TEMPLATE_I18N_KEYS[tpl.key];
            const displayTitle = i18n ? t(i18n.title) : tpl.title;
            const displayDesc = i18n ? t(i18n.description) : tpl.description;
            return (
              <Col span={12} key={tpl.key}>
                <div
                  role="button"
                  tabIndex={installing ? -1 : 0}
                  aria-disabled={installing}
                  aria-label={displayTitle}
                  onClick={() => !installing && handleInstall(tpl.key)}
                  onKeyDown={(e) => {
                    if (!installing && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleInstall(tpl.key);
                    }
                  }}
                  style={{
                    height: '100%',
                    cursor: installing ? 'not-allowed' : 'pointer',
                    opacity: installing ? 0.7 : 1,
                  }}
                >
                <Card
                  hoverable={!installing}
                  style={{ borderColor: tpl.color, borderWidth: 2, height: '100%', pointerEvents: 'none' }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 28, marginRight: 12 }}>{tpl.icon}</span>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>
                        {displayTitle}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {t('Template stats', {
                          collections: tpl.collections.length,
                          relations: tpl.relations.length,
                        })}
                      </Text>
                    </div>
                  </div>
                  <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                    {displayDesc}
                  </Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {tpl.highlights.slice(0, 8).map((h) => (
                    <Tag key={h} color={tpl.color} style={{ fontSize: 11, margin: 0 }}>
                      {HIGHLIGHT_I18N_KEYS[h] ? t(HIGHLIGHT_I18N_KEYS[h]) : h}
                    </Tag>
                  ))}
                  {tpl.highlights.length > 8 && (
                    <Tag style={{ fontSize: 11, margin: 0 }}>+{tpl.highlights.length - 8}</Tag>
                  )}
                </div>
              </Card>
                </div>
            </Col>
            );
          })
          )}
        </Row>
      </div>
    </Spin>
  );
};
