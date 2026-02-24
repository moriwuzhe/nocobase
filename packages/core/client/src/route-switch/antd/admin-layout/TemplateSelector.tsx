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
    'x-component-props': { icon: 'EditOutlined' },
    'x-action-settings': { assignedValues: {}, updateMode: 'selected' },
    'x-decorator': 'Action.Decorator',
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
                        'x-component': 'Action.Container',
                        'x-component-props': { className: 'nb-action-popup' },
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
                        'x-component': 'CalendarV2.ActionBar.Today',
                        'x-action': 'calendar:today',
                        'x-align': 'left',
                      },
                      nav: {
                        type: 'void',
                        title: '{{ t("Navigate") }}',
                        'x-component': 'CalendarV2.ActionBar.Nav',
                        'x-action': 'calendar:nav',
                        'x-align': 'left',
                      },
                      title: {
                        type: 'void',
                        'x-component': 'CalendarV2.ActionBar.Title',
                        'x-action': 'calendar:title',
                        'x-align': 'left',
                      },
                      viewSelect: {
                        type: 'void',
                        title: '{{ t("Select view") }}',
                        'x-component': 'CalendarV2.ActionBar.ViewSelect',
                        'x-action': 'calendar:viewSelect',
                        'x-align': 'right',
                        'x-designer': 'CalendarV2.ActionBar.ViewSelect.Designer',
                      },
                    },
                  },
                  event: {
                    type: 'void',
                    'x-component': 'CalendarV2.Event',
                    properties: {
                      drawer: {
                        type: 'void',
                        'x-component': 'Action.Drawer',
                        title: '{{ t("View record") }}',
                        properties: {},
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
                        title: '{{ t("View record") }}',
                        properties: {},
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

function buildViewAction(collectionName: string, formFieldNames: string[], detailFieldNames: string[]) {
  const detailBlock = buildDetailBlock(collectionName, detailFieldNames);
  return {
    type: 'void',
    title: '{{ t("View") }}',
    'x-action': 'view',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:view',
    'x-component': 'Action.Link',
    'x-component-props': { openMode: 'drawer' },
    'x-action-context': { dataSource: 'main', collection: collectionName },
    properties: {
      drawer: {
        type: 'void',
        title: '{{ t("View record") }}',
        'x-component': 'Action.Container',
        'x-component-props': { className: 'nb-action-popup' },
        properties: {
          tabs: {
            type: 'void',
            'x-component': 'Tabs',
            properties: {
              tab1: {
                type: 'void',
                title: '{{ t("Details") }}',
                'x-component': 'Tabs.TabPane',
                properties: {
                  grid: {
                    type: 'void',
                    'x-component': 'Grid',
                    properties: {
                      [uid()]: {
                        type: 'void',
                        'x-component': 'Grid.Row',
                        properties: {
                          [uid()]: { type: 'void', 'x-component': 'Grid.Col', properties: { [uid()]: detailBlock } },
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

function buildEditAction(collectionName: string, formFieldNames: string[]) {
  return {
    type: 'void',
    title: '{{ t("Edit") }}',
    'x-action': 'update',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:edit',
    'x-component': 'Action.Link',
    'x-component-props': { openMode: 'drawer', icon: 'EditOutlined' },
    properties: {
      drawer: {
        type: 'void',
        title: '{{ t("Edit record") }}',
        'x-component': 'Action.Container',
        'x-component-props': { className: 'nb-action-popup' },
      },
    },
  };
}

function buildDuplicateAction() {
  return {
    type: 'void',
    title: '{{ t("Duplicate") }}',
    'x-action': 'duplicate',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:duplicate',
    'x-component': 'Action.Link',
    'x-component-props': { openMode: 'drawer', icon: 'CopyOutlined' },
    'x-decorator': 'DuplicateActionDecorator',
    'x-action-settings': { duplicateMode: 'quickDuplicate', duplicateFields: [] },
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

function buildActionsColumn(collectionName: string, formFieldNames: string[], detailFieldNames: string[]) {
  return {
    type: 'void',
    title: '{{ t("Actions") }}',
    'x-decorator': 'TableV2.Column.Decorator',
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
        properties: {
          [uid()]: buildViewAction(collectionName, formFieldNames, detailFieldNames),
          [uid()]: buildEditAction(collectionName, formFieldNames),
          [uid()]: buildDuplicateAction(),
          [uid()]: buildDeleteAction(),
        },
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
            'x-component': 'Action.Container',
            'x-component-props': { className: 'nb-action-popup' },
            properties: {
              tabs: {
                type: 'void',
                'x-component': 'Tabs',
                properties: {
                  tab1: {
                    type: 'void',
                    title: '{{ t("Add new") }}',
                    'x-component': 'Tabs.TabPane',
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
  const columnProperties: Record<string, any> = {};
  for (const fn of columnFieldNames) {
    columnProperties[uid()] = buildColumn(fn);
  }
  columnProperties[uid()] = buildActionsColumn(collectionName, formFieldNames, detailFieldNames);

  const requiredFields = getRequiredFields(collection);

  return {
    type: 'void',
    'x-decorator': 'TableBlockProvider',
    'x-acl-action': `${collectionName}:list`,
    'x-use-decorator-props': 'useTableBlockDecoratorProps',
    'x-decorator-props': {
      collection: collectionName,
      dataSource: 'main',
      action: 'list',
      params: { pageSize: 20, sort: ['-createdAt'] },
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
  tabs.push({ schemaUid: tableTabUid, tabSchemaName: tableTabName, title: '列表' });
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
    tabs.push({ schemaUid: kanbanTabUid, tabSchemaName: kanbanTabName, title: '看板' });
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
    tabs.push({ schemaUid: calendarTabUid, tabSchemaName: calendarTabName, title: '日历' });
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
    tabs.push({ schemaUid: ganttTabUid, tabSchemaName: ganttTabName, title: '甘特图' });
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

export async function installTemplate(
  api: any,
  appName: string,
  templateKey: string,
  ui: TemplateInstallUI,
): Promise<boolean> {
  const tpl = builtInTemplates.find((t) => t.key === templateKey);
  if (!tpl) return false;

  const kanbanCount = countViewConfigs(tpl.menu, 'kanban');
  const calendarCount = countViewConfigs(tpl.menu, 'calendar');
  const ganttCount = countViewConfigs(tpl.menu, 'gantt');
  const sampleBatches = templateSampleData[templateKey] || [];
  const sampleCount = sampleBatches.reduce((sum, b) => sum + b.records.length, 0);

  return new Promise((resolve) => {
    ui.modal.confirm({
      title: `安装模板：${tpl.title}`,
      width: 560,
      content: (
        <div>
          <p>{tpl.description}</p>
          <p>
            将创建 <strong>{tpl.collections.length}</strong> 个数据表、
            <strong>{tpl.relations.length}</strong> 个关联关系、
            {kanbanCount > 0 && (
              <>
                <strong>{kanbanCount}</strong> 个看板视图、
              </>
            )}
            {calendarCount > 0 && (
              <>
                <strong>{calendarCount}</strong> 个日历视图、
              </>
            )}
            {ganttCount > 0 && (
              <>
                <strong>{ganttCount}</strong> 个甘特图视图、
              </>
            )}
            <strong>{tpl.workflows.length}</strong> 个工作流。
          </p>
          <p>
            页面功能含 <strong>批量编辑</strong>、<strong>打印</strong>、<strong>复制</strong>、
            <strong>导入导出</strong>。
          </p>
          <p>
            将插入 <strong>{sampleCount}</strong> 条示例数据。
          </p>
        </div>
      ),
      okText: '开始安装',
      cancelText: '取消',
      onOk: async () => {
        try {
          const headers = { 'X-App': appName };

          // Wait for sub-app to be ready with retry
          ui.message.loading({ content: '等待应用启动...', key: 'tpl', duration: 0 });
          let appReady = false;
          for (let attempt = 0; attempt < 15; attempt++) {
            try {
              await api.request({ url: 'app:getInfo', headers });
              appReady = true;
              break;
            } catch {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          }
          if (!appReady) {
            ui.message.error({ content: '应用启动超时，请稍后重试', key: 'tpl' });
            resolve(false);
            return;
          }

          let authHeaders: Record<string, string> = { ...headers };
          try {
            const authRes = await api.request({
              url: 'auth:signIn',
              method: 'post',
              data: { account: 'admin@nocobase.com', password: 'admin123' },
              headers,
            });
            const subToken = authRes?.data?.data?.token;
            if (subToken) authHeaders = { ...headers, Authorization: `Bearer ${subToken}` };
          } catch {
            // Auth may fail if password changed, continue with main app token
          }

          ui.message.loading({ content: '正在创建数据表...', key: 'tpl', duration: 0 });

          for (const col of tpl.collections) {
            const fields = col.fields.map((f) => {
              const fieldDef: Record<string, any> = {
                name: f.name,
                type: f.type,
                interface: f.interface,
                uiSchema: f.uiSchema || { type: 'string', title: f.title, 'x-component': 'Input' },
              };
              return fieldDef;
            });

            await api.request({
              url: 'collections:create',
              method: 'post',
              headers: authHeaders,
              data: {
                name: col.name,
                title: col.title,
                fields: [
                  ...fields,
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
            });
          }

          ui.message.loading({ content: '正在创建关联关系...', key: 'tpl', duration: 0 });

          for (const rel of tpl.relations) {
            try {
              await api.request({
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
              });
            } catch (e) {
              console.warn(`Failed to create relation ${rel.sourceCollection}.${rel.name}:`, e);
            }
          }

          ui.message.loading({ content: '正在配置页面...', key: 'tpl', duration: 0 });

          const collectionMap = new Map<string, CollectionDef>();
          for (const col of tpl.collections) {
            collectionMap.set(col.name, col);
          }

          const createMenuGroup = async (title: string, icon?: string): Promise<string> => {
            const groupSchemaUid = uid();
            await api.request({
              url: 'uiSchemas:insertAdjacent/admin',
              method: 'post',
              headers: authHeaders,
              params: { position: 'beforeEnd' },
              data: {
                schema: {
                  type: 'void',
                  title,
                  'x-component': 'Menu.SubMenu',
                  'x-component-props': { icon },
                  'x-uid': groupSchemaUid,
                },
              },
            });
            return groupSchemaUid;
          };

          const createPageRoute = async (
            parentSchemaUid: string,
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

            const menuItemSchemaUid = uid();

            await api.request({
              url: `uiSchemas:insertAdjacent/${parentSchemaUid}`,
              method: 'post',
              headers: authHeaders,
              params: { position: 'beforeEnd' },
              data: {
                schema: {
                  type: 'void',
                  title: page.title,
                  'x-component': 'Menu.Item',
                  'x-component-props': { icon: page.icon },
                  'x-uid': menuItemSchemaUid,
                },
              },
            });

            const routeData = {
              type: 'page',
              title: page.title,
              icon: page.icon,
              schemaUid: pageResult.pageSchemaUid,
              menuSchemaUid: menuItemSchemaUid,
              enableTabs: pageResult.enableTabs,
            };

            // Try desktopRoutes first, fallback to routes
            try {
              await api.request({ url: 'desktopRoutes:create', method: 'post', headers: authHeaders, data: routeData });
            } catch {
              try {
                await api.request({ url: 'routes:create', method: 'post', headers: authHeaders, data: routeData });
              } catch {
                // Route creation not available in this app version
              }
            }

            await api.request({
              url: 'uiSchemas:insert',
              method: 'post',
              headers: authHeaders,
              data: { schema: pageResult.schema },
            });

            if (pageResult.enableTabs && pageResult.tabs.length > 0) {
              for (const tab of pageResult.tabs) {
                try {
                  await api.request({
                    url: 'desktopRoutes:create',
                    method: 'post',
                    headers: authHeaders,
                    data: {
                      type: 'tabs',
                      title: tab.title,
                      schemaUid: tab.schemaUid,
                      tabSchemaName: tab.tabSchemaName,
                    },
                  });
                } catch {
                  try {
                    await api.request({
                      url: 'routes:create',
                      method: 'post',
                      headers: authHeaders,
                      data: {
                        type: 'tabs',
                        title: tab.title,
                        schemaUid: tab.schemaUid,
                        tabSchemaName: tab.tabSchemaName,
                      },
                    });
                  } catch {
                    // tab routes not supported
                  }
                }
              }
            }
          };

          for (const menuItem of tpl.menu) {
            if (menuItem.type === 'group') {
              const groupUid = await createMenuGroup(menuItem.title, menuItem.icon);
              if (menuItem.children) {
                for (const child of menuItem.children) {
                  if (child.type === 'page') {
                    await createPageRoute(groupUid, child);
                  }
                }
              }
            } else if (menuItem.type === 'page') {
              await createPageRoute('admin', menuItem);
            }
          }

          ui.message.loading({ content: '正在插入示例数据...', key: 'tpl', duration: 0 });

          const idMap: Record<string, Record<string, number>> = {};

          for (const batch of sampleBatches) {
            if (!idMap[batch.collection]) idMap[batch.collection] = {};

            for (const record of batch.records) {
              const cleanRecord: Record<string, any> = {};
              for (const [k, v] of Object.entries(record)) {
                if (isRef(v)) {
                  const refMap = idMap[v.__ref];
                  if (refMap) {
                    const matchKey = Object.keys(v.__match)[0];
                    const matchVal = v.__match[matchKey];
                    const refId = refMap[`${matchKey}:${matchVal}`];
                    if (refId) cleanRecord[k] = refId;
                  }
                } else {
                  cleanRecord[k] = v;
                }
              }

              try {
                const res = await api.request({
                  url: `${batch.collection}:create`,
                  method: 'post',
                  headers: authHeaders,
                  data: cleanRecord,
                });
                const createdId = res?.data?.data?.id;
                if (createdId) {
                  for (const [k, v] of Object.entries(record)) {
                    if (typeof v === 'string' || typeof v === 'number') {
                      idMap[batch.collection][`${k}:${v}`] = createdId;
                    }
                  }
                }
              } catch (e) {
                console.warn(`Failed to insert ${batch.collection} record:`, e);
              }
            }
          }

          if (tpl.workflows.length > 0) {
            ui.message.loading({ content: '正在创建工作流...', key: 'tpl', duration: 0 });

            for (const wf of tpl.workflows) {
              try {
                const wfRes = await api.request({
                  url: 'workflows:create',
                  method: 'post',
                  headers: authHeaders,
                  data: {
                    title: wf.title,
                    description: wf.description,
                    type: wf.type,
                    enabled: true,
                    config: wf.triggerConfig,
                  },
                });
                const workflowId = wfRes?.data?.data?.id;
                if (workflowId && wf.nodes.length > 0) {
                  let upstreamId: number | null = null;
                  for (const node of wf.nodes) {
                    const nodeRes = await api.request({
                      url: 'flow_nodes:create',
                      method: 'post',
                      headers: authHeaders,
                      data: {
                        title: node.title,
                        type: node.type,
                        workflowId,
                        upstreamId,
                        config: node.config,
                      },
                    });
                    upstreamId = nodeRes?.data?.data?.id || null;
                  }
                }
              } catch (e) {
                console.warn(`Failed to create workflow ${wf.title}:`, e);
              }
            }
          }

          ui.message.success({ content: `模板 "${tpl.title}" 安装完成！`, key: 'tpl' });
          resolve(true);
        } catch (err: any) {
          console.error('Template installation failed:', err);
          ui.message.error({ content: `安装失败: ${err?.message || '未知错误'}`, key: 'tpl' });
          resolve(false);
        }
      },
      onCancel: () => resolve(false),
    });
  });
}

// ─── Template Selector component ──────────────────────────

export const TemplateSelector: React.FC<{ appName: string; onInstalled?: () => void }> = ({ appName, onInstalled }) => {
  const api = useAPIClient();
  const { modal, message } = App.useApp();
  const [installing, setInstalling] = useState(false);

  const handleInstall = useCallback(
    async (templateKey: string) => {
      setInstalling(true);
      try {
        const ok = await installTemplate(api, appName, templateKey, { modal, message });
        if (ok) {
          onInstalled?.();
        }
      } finally {
        setInstalling(false);
      }
    },
    [api, appName, message, modal, onInstalled],
  );

  return (
    <Spin spinning={installing} tip="正在安装模板...">
      <div style={{ padding: '24px 0' }}>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>
          选择模板
        </Title>
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          为新应用选择一个模板，将自动创建数据表、页面、示例数据和工作流
        </Paragraph>
        <Row gutter={[16, 16]}>
          {builtInTemplates.map((tpl) => (
            <Col span={12} key={tpl.key}>
              <Card
                hoverable
                onClick={() => handleInstall(tpl.key)}
                style={{ borderColor: tpl.color, borderWidth: 2, height: '100%' }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 28, marginRight: 12 }}>{tpl.icon}</span>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {tpl.title}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {tpl.collections.length}表 · {tpl.relations.length}关联
                    </Text>
                  </div>
                </div>
                <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                  {tpl.description}
                </Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {tpl.highlights.slice(0, 8).map((h) => (
                    <Tag key={h} color={tpl.color} style={{ fontSize: 11, margin: 0 }}>
                      {h}
                    </Tag>
                  ))}
                  {tpl.highlights.length > 8 && (
                    <Tag style={{ fontSize: 11, margin: 0 }}>+{tpl.highlights.length - 8}</Tag>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Spin>
  );
};
