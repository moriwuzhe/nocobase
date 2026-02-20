/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

interface PageDef {
  title: string;
  icon?: string;
  collectionName: string;
  fields: string[];
  formFields?: string[];
}

function buildColumn(fieldName: string) {
  return {
    type: 'void',
    'x-decorator': 'TableV2.Column.Decorator',
    'x-component': 'TableV2.Column',
    'x-toolbar': 'TableColumnSchemaToolbar',
    'x-settings': 'fieldSettings:TableColumn',
    properties: {
      [fieldName]: {
        'x-collection-field': fieldName,
        'x-component': 'CollectionField',
        'x-component-props': {},
        'x-read-pretty': true,
      },
    },
  };
}

function buildFormField(fieldName: string) {
  return {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          [fieldName]: {
            'x-collection-field': fieldName,
            'x-component': 'CollectionField',
            'x-decorator': 'FormItem',
          },
        },
      },
    },
  };
}

function buildEditFormBlock(collectionName: string, formFields: string[]) {
  const fp: Record<string, any> = {};
  for (const f of formFields) fp[uid()] = buildFormField(f);
  return {
    type: 'void',
    'x-acl-action': `${collectionName}:update`,
    'x-decorator': 'FormBlockProvider',
    'x-use-decorator-props': 'useEditFormBlockDecoratorProps',
    'x-decorator-props': { dataSource: 'main', collection: collectionName, action: 'get', useParams: '{{ useParamsFromRecord }}' },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:editForm',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'FormV2',
        'x-use-component-props': 'useEditFormBlockProps',
        properties: {
          grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'form:configureFields', properties: fp },
          [uid()]: {
            type: 'void', 'x-initializer': 'editForm:configureActions', 'x-component': 'ActionBar', 'x-component-props': { layout: 'one-column' },
            properties: {
              [uid()]: { title: '{{ t("Submit") }}', 'x-action': 'submit', 'x-component': 'Action', 'x-toolbar': 'ActionSchemaToolbar', 'x-settings': 'actionSettings:updateSubmit', 'x-use-component-props': 'useUpdateActionProps', 'x-component-props': { type: 'primary', htmlType: 'submit' }, type: 'void' },
            },
          },
        },
      },
    },
  };
}

function buildCreateFormBlock(collectionName: string, formFields: string[]) {
  const fp: Record<string, any> = {};
  for (const f of formFields) fp[uid()] = buildFormField(f);
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
        type: 'void', 'x-component': 'FormV2', 'x-use-component-props': 'useCreateFormBlockProps',
        properties: {
          grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'form:configureFields', properties: fp },
          [uid()]: {
            type: 'void', 'x-initializer': 'createForm:configureActions', 'x-component': 'ActionBar', 'x-component-props': { layout: 'one-column' },
            properties: {
              [uid()]: { title: '{{ t("Submit") }}', 'x-action': 'submit', 'x-component': 'Action', 'x-toolbar': 'ActionSchemaToolbar', 'x-settings': 'actionSettings:createSubmit', 'x-use-component-props': 'useCreateActionProps', 'x-component-props': { type: 'primary', htmlType: 'submit' }, 'x-action-settings': { triggerWorkflows: [] }, type: 'void' },
            },
          },
        },
      },
    },
  };
}

function buildTableBlock(collectionName: string, columnFields: string[], formFields: string[]) {
  const colProps: Record<string, any> = {};
  for (const f of columnFields) colProps[uid()] = buildColumn(f);
  colProps[uid()] = {
    type: 'void', title: '{{ t("Actions") }}', 'x-decorator': 'TableV2.Column.Decorator', 'x-component': 'TableV2.Column',
    'x-toolbar': 'TableColumnSchemaToolbar', 'x-settings': 'fieldSettings:TableColumn', 'x-initializer': 'table:configureItemActions', 'x-action-column': 'actions',
    properties: {
      [uid()]: {
        type: 'void', 'x-decorator': 'DndContext', 'x-component': 'Space', 'x-component-props': { split: '|' },
        properties: {
          [uid()]: {
            type: 'void', title: '{{ t("Edit") }}', 'x-action': 'update', 'x-toolbar': 'ActionSchemaToolbar', 'x-settings': 'actionSettings:edit',
            'x-component': 'Action.Link', 'x-component-props': { openMode: 'drawer', icon: 'EditOutlined' },
            properties: {
              drawer: {
                type: 'void', title: '{{ t("Edit record") }}', 'x-component': 'Action.Container', 'x-component-props': { className: 'nb-action-popup' },
                properties: {
                  tabs: { type: 'void', 'x-component': 'Tabs', properties: {
                    tab1: { type: 'void', title: '{{ t("Edit") }}', 'x-component': 'Tabs.TabPane', properties: {
                      grid: { type: 'void', 'x-component': 'Grid', properties: {
                        [uid()]: { type: 'void', 'x-component': 'Grid.Row', properties: { [uid()]: { type: 'void', 'x-component': 'Grid.Col', properties: { [uid()]: buildEditFormBlock(collectionName, formFields) } } } },
                      } },
                    } },
                  } },
                },
              },
            },
          },
          [uid()]: {
            type: 'void', title: '{{ t("Delete") }}', 'x-action': 'destroy', 'x-toolbar': 'ActionSchemaToolbar', 'x-settings': 'actionSettings:delete',
            'x-component': 'Action.Link', 'x-component-props': { icon: 'DeleteOutlined', confirm: { title: "{{t('Delete record')}}", content: "{{t('Are you sure you want to delete it?')}}" } },
            'x-use-component-props': 'useDestroyActionProps',
          },
        },
      },
    },
  };

  return {
    type: 'void',
    'x-decorator': 'TableBlockProvider', 'x-acl-action': `${collectionName}:list`,
    'x-use-decorator-props': 'useTableBlockDecoratorProps',
    'x-decorator-props': { collection: collectionName, dataSource: 'main', action: 'list', params: { pageSize: 20, sort: ['-createdAt'] }, showIndex: true, dragSort: false },
    'x-toolbar': 'BlockSchemaToolbar', 'x-settings': 'blockSettings:table', 'x-component': 'CardItem',
    properties: {
      actions: {
        type: 'void', 'x-initializer': 'table:configureActions', 'x-component': 'ActionBar',
        'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
        properties: {
          filter: { type: 'void', title: '{{ t("Filter") }}', 'x-action': 'filter', 'x-toolbar': 'ActionSchemaToolbar', 'x-settings': 'actionSettings:filter', 'x-component': 'Filter.Action', 'x-use-component-props': 'useFilterActionProps', 'x-component-props': { icon: 'FilterOutlined' }, 'x-align': 'left' },
          [uid()]: {
            type: 'void', title: '{{ t("Add new") }}', 'x-action': 'create', 'x-toolbar': 'ActionSchemaToolbar', 'x-settings': 'actionSettings:addNew',
            'x-component': 'Action', 'x-component-props': { openMode: 'drawer', type: 'primary', icon: 'PlusOutlined' },
            properties: {
              drawer: {
                type: 'void', title: '{{ t("Add record") }}', 'x-component': 'Action.Container', 'x-component-props': { className: 'nb-action-popup' },
                properties: {
                  tabs: { type: 'void', 'x-component': 'Tabs', properties: {
                    tab1: { type: 'void', title: '{{ t("Add new") }}', 'x-component': 'Tabs.TabPane', properties: {
                      grid: { type: 'void', 'x-component': 'Grid', properties: {
                        [uid()]: { type: 'void', 'x-component': 'Grid.Row', properties: { [uid()]: { type: 'void', 'x-component': 'Grid.Col', properties: { [uid()]: buildCreateFormBlock(collectionName, formFields) } } } },
                      } },
                    } },
                  } },
                },
              },
            },
          },
        },
      },
      [uid()]: {
        type: 'array', 'x-initializer': 'table:configureColumns', 'x-component': 'TableV2', 'x-use-component-props': 'useTableBlockProps',
        'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
        properties: colProps,
      },
    },
  };
}

export async function createTemplateUI(app: any, groupTitle: string, groupIcon: string, pages: PageDef[]): Promise<void> {
  const db = app.db;
  const uiSchemaRepo = db.getRepository('uiSchemas');
  const routeRepo = db.getRepository('desktopRoutes');
  if (!uiSchemaRepo || !routeRepo) {
    app.logger.warn('[template-ui] uiSchemas or desktopRoutes not available');
    return;
  }

  try {
    const existingRoute = await routeRepo.findOne({ filter: { title: groupTitle, type: 'group' } });
    if (existingRoute) {
      app.logger.info(`[template-ui] Menu group "${groupTitle}" already exists, skipping`);
      return;
    }

    const groupRoute = await routeRepo.create({
      values: { type: 'group', title: groupTitle, icon: groupIcon },
    });
    const groupRouteId = groupRoute?.id;

    for (const page of pages) {
      try {
        const pageSchemaUid = uid();
        const tabUid = uid();

        const tableBlock = buildTableBlock(page.collectionName, page.fields, page.formFields || page.fields);
        const pageSchema = {
          type: 'void', 'x-component': 'Page', 'x-uid': pageSchemaUid,
          properties: {
            [uid()]: {
              type: 'void', 'x-component': 'Grid', 'x-initializer': 'page:addBlock', 'x-uid': tabUid,
              properties: {
                [uid()]: { type: 'void', 'x-component': 'Grid.Row', properties: { [uid()]: { type: 'void', 'x-component': 'Grid.Col', properties: { [uid()]: tableBlock } } } },
              },
            },
          },
        };

        await uiSchemaRepo.insert(pageSchema);

        await routeRepo.create({
          values: { type: 'page', title: page.title, icon: page.icon, schemaUid: pageSchemaUid, parentId: groupRouteId },
        });

        app.logger.info(`[template-ui] Created page: ${page.title}`);
      } catch (err) {
        app.logger.warn(`[template-ui] Page "${page.title}" skipped: ${(err as any).message}`);
      }
    }
  } catch (err) {
    app.logger.warn(`[template-ui] Failed: ${(err as any).message}`);
  }
}
