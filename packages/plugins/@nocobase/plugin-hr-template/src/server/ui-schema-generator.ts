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

function buildFormBlock(collectionName: string, formFields: string[], mode: 'create' | 'edit') {
  const fp: Record<string, any> = {};
  for (const f of formFields) fp[uid()] = buildFormField(f);

  const isCreate = mode === 'create';
  return {
    type: 'void',
    'x-acl-action': `${collectionName}:${isCreate ? 'create' : 'update'}`,
    'x-decorator': 'FormBlockProvider',
    'x-use-decorator-props': isCreate ? 'useCreateFormBlockDecoratorProps' : 'useEditFormBlockDecoratorProps',
    'x-decorator-props': {
      dataSource: 'main',
      collection: collectionName,
      ...(isCreate ? {} : { action: 'get', useParams: '{{ useParamsFromRecord }}' }),
    },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': isCreate ? 'blockSettings:createForm' : 'blockSettings:editForm',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': 'FormV2',
        'x-use-component-props': isCreate ? 'useCreateFormBlockProps' : 'useEditFormBlockProps',
        properties: {
          grid: { type: 'void', 'x-component': 'Grid', 'x-initializer': 'form:configureFields', properties: fp },
          [uid()]: {
            type: 'void',
            'x-initializer': isCreate ? 'createForm:configureActions' : 'editForm:configureActions',
            'x-component': 'ActionBar',
            'x-component-props': { layout: 'one-column' },
            properties: {
              [uid()]: {
                title: '{{ t("Submit") }}',
                'x-action': 'submit',
                'x-component': 'Action',
                'x-use-component-props': isCreate ? 'useCreateActionProps' : 'useUpdateActionProps',
                'x-component-props': { type: 'primary', htmlType: 'submit' },
                'x-settings': isCreate ? 'actionSettings:createSubmit' : 'actionSettings:updateSubmit',
                type: 'void',
              },
            },
          },
        },
      },
    },
  };
}

function buildDrawer(title: string, content: any) {
  return {
    type: 'void',
    title,
    'x-component': 'Action.Container',
    'x-component-props': { className: 'nb-action-popup' },
    properties: {
      tabs: {
        type: 'void',
        'x-component': 'Tabs',
        properties: {
          tab1: {
            type: 'void',
            title,
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
                        properties: { [uid()]: content },
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

function buildTableBlock(collectionName: string, columnFields: string[], formFields: string[]) {
  const colProps: Record<string, any> = {};
  for (const f of columnFields) colProps[uid()] = buildColumn(f);

  colProps[uid()] = {
    type: 'void',
    title: '{{ t("Actions") }}',
    'x-decorator': 'TableV2.Column.Decorator',
    'x-component': 'TableV2.Column',
    'x-initializer': 'table:configureItemActions',
    'x-action-column': 'actions',
    properties: {
      [uid()]: {
        type: 'void',
        'x-decorator': 'DndContext',
        'x-component': 'Space',
        'x-component-props': { split: '|' },
        properties: {
          [uid()]: {
            type: 'void',
            title: '{{ t("Edit") }}',
            'x-action': 'update',
            'x-component': 'Action.Link',
            'x-component-props': { openMode: 'drawer', icon: 'EditOutlined' },
            properties: { drawer: buildDrawer('{{ t("Edit record") }}', buildFormBlock(collectionName, formFields, 'edit')) },
          },
          [uid()]: {
            type: 'void',
            title: '{{ t("Delete") }}',
            'x-action': 'destroy',
            'x-component': 'Action.Link',
            'x-component-props': { icon: 'DeleteOutlined', confirm: { title: "{{t('Delete record')}}", content: "{{t('Are you sure you want to delete it?')}}" } },
            'x-use-component-props': 'useDestroyActionProps',
          },
        },
      },
    },
  };

  return {
    type: 'void',
    'x-decorator': 'TableBlockProvider',
    'x-acl-action': `${collectionName}:list`,
    'x-use-decorator-props': 'useTableBlockDecoratorProps',
    'x-decorator-props': { collection: collectionName, dataSource: 'main', action: 'list', params: { pageSize: 20, sort: ['-createdAt'] }, showIndex: true, dragSort: false },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:table',
    'x-component': 'CardItem',
    properties: {
      actions: {
        type: 'void',
        'x-initializer': 'table:configureActions',
        'x-component': 'ActionBar',
        'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
        properties: {
          filter: {
            type: 'void',
            title: '{{ t("Filter") }}',
            'x-action': 'filter',
            'x-component': 'Filter.Action',
            'x-use-component-props': 'useFilterActionProps',
            'x-component-props': { icon: 'FilterOutlined' },
            'x-align': 'left',
          },
          [uid()]: {
            type: 'void',
            title: '{{ t("Add new") }}',
            'x-action': 'create',
            'x-component': 'Action',
            'x-component-props': { openMode: 'drawer', type: 'primary', icon: 'PlusOutlined' },
            properties: { drawer: buildDrawer('{{ t("Add record") }}', buildFormBlock(collectionName, formFields, 'create')) },
          },
        },
      },
      [uid()]: {
        type: 'array',
        'x-initializer': 'table:configureColumns',
        'x-component': 'TableV2',
        'x-use-component-props': 'useTableBlockProps',
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
    app.logger.warn('[template-ui] Required repositories not available');
    return;
  }

  try {
    const existingRoute = await routeRepo.findOne({ filter: { title: groupTitle, type: 'group' } });
    if (existingRoute) {
      app.logger.info(`[template-ui] "${groupTitle}" already exists, skipping`);
      return;
    }

    // Step 1: Create menu group schema node under admin
    const groupMenuUid = uid();
    try {
      await uiSchemaRepo.insertAdjacent('beforeEnd', 'admin', {
        type: 'void',
        title: groupTitle,
        'x-component': 'Menu.SubMenu',
        'x-component-props': { icon: groupIcon },
        'x-uid': groupMenuUid,
      });
    } catch (e) {
      app.logger.debug(`[template-ui] Menu schema insert fallback: ${(e as any).message}`);
    }

    // Step 2: Create group route
    const groupRoute = await routeRepo.create({
      values: { type: 'group', title: groupTitle, icon: groupIcon, menuSchemaUid: groupMenuUid },
    });

    // Step 3: Create pages
    for (const page of pages) {
      try {
        const pageSchemaUid = uid();
        const tabSchemaUid = uid();
        const tabSchemaName = uid();
        const menuItemUid = uid();

        // 3a: Create menu item schema under group
        try {
          await uiSchemaRepo.insertAdjacent('beforeEnd', groupMenuUid, {
            type: 'void',
            title: page.title,
            'x-component': 'Menu.Item',
            'x-component-props': { icon: page.icon },
            'x-uid': menuItemUid,
          });
        } catch (e) {
          app.logger.debug(`[template-ui] Menu item fallback: ${(e as any).message}`);
        }

        // 3b: Create page schema with table block
        const tableBlock = buildTableBlock(page.collectionName, page.fields, page.formFields || page.fields);
        const pageSchema = {
          type: 'void',
          'x-component': 'Page',
          'x-uid': pageSchemaUid,
          properties: {
            [tabSchemaName]: {
              type: 'void',
              'x-component': 'Grid',
              'x-initializer': 'page:addBlock',
              'x-uid': tabSchemaUid,
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
        };

        await uiSchemaRepo.insert(pageSchema);

        // 3c: Create page route
        await routeRepo.create({
          values: {
            type: 'page',
            title: page.title,
            icon: page.icon,
            schemaUid: pageSchemaUid,
            menuSchemaUid: menuItemUid,
            enableTabs: false,
            parentId: groupRoute?.id,
          },
        });

        app.logger.info(`[template-ui] Created: ${page.title}`);
      } catch (err) {
        app.logger.warn(`[template-ui] "${page.title}" failed: ${(err as any).message}`);
      }
    }
  } catch (err) {
    app.logger.warn(`[template-ui] Error: ${(err as any).message}`);
  }
}
