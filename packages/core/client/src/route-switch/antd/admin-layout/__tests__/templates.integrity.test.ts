/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { builtInTemplates, MenuItemDef, TemplateDef, WorkflowDef } from '../templates';

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function collectPageCollections(menu: MenuItemDef[], result: string[] = []) {
  for (const item of menu) {
    if (item.type === 'page' && item.collectionName) {
      result.push(item.collectionName);
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      collectPageCollections(item.children, result);
    }
  }
  return result;
}

function assertWorkflowFieldExists(
  template: TemplateDef,
  collectionFieldMap: Map<string, Set<string>>,
  collectionName: string,
  fieldName: string,
  context: string,
) {
  const fieldSet = collectionFieldMap.get(collectionName);
  expect(fieldSet, `[${template.key}] ${context}: collection "${collectionName}" should exist`).toBeDefined();
  expect(
    fieldSet?.has(fieldName),
    `[${template.key}] ${context}: field "${collectionName}.${fieldName}" should exist`,
  ).toBeTruthy();
}

function assertWorkflowIntegrity(
  template: TemplateDef,
  collectionFieldMap: Map<string, Set<string>>,
  workflow: WorkflowDef,
) {
  const triggerCollection = workflow.triggerConfig?.collection;
  expect(
    collectionFieldMap.has(triggerCollection),
    `[${template.key}] workflow "${workflow.title}" trigger collection "${triggerCollection}" should exist`,
  ).toBeTruthy();

  if (Array.isArray(workflow.triggerConfig?.changed)) {
    for (const changedField of workflow.triggerConfig.changed) {
      assertWorkflowFieldExists(
        template,
        collectionFieldMap,
        triggerCollection,
        changedField,
        `workflow "${workflow.title}" trigger changed field`,
      );
    }
  }

  for (const node of workflow.nodes) {
    const nodeCollection = node?.config?.collection;
    if (typeof nodeCollection === 'string' && nodeCollection.length > 0) {
      expect(
        collectionFieldMap.has(nodeCollection),
        `[${template.key}] workflow "${workflow.title}" node "${node.title}" collection "${nodeCollection}" should exist`,
      ).toBeTruthy();

      const values = node?.config?.params?.values;
      if (isPlainObject(values)) {
        for (const fieldName of Object.keys(values)) {
          assertWorkflowFieldExists(
            template,
            collectionFieldMap,
            nodeCollection,
            fieldName,
            `workflow "${workflow.title}" node "${node.title}" values`,
          );
        }
      }

      const filter = node?.config?.params?.filter;
      if (isPlainObject(filter)) {
        for (const fieldName of Object.keys(filter)) {
          if (fieldName === 'id') {
            continue;
          }
          assertWorkflowFieldExists(
            template,
            collectionFieldMap,
            nodeCollection,
            fieldName,
            `workflow "${workflow.title}" node "${node.title}" filter`,
          );
        }
      }
    }
  }
}

describe('built-in template integrity', () => {
  it('menu and relation references should point to existing collections', () => {
    for (const template of builtInTemplates) {
      const collectionNames = new Set(template.collections.map((collection) => collection.name));

      for (const relation of template.relations) {
        expect(
          collectionNames.has(relation.sourceCollection),
          `[${template.key}] relation source collection "${relation.sourceCollection}" should exist`,
        ).toBeTruthy();
        expect(
          collectionNames.has(relation.target),
          `[${template.key}] relation target collection "${relation.target}" should exist`,
        ).toBeTruthy();
      }

      const pageCollections = collectPageCollections(template.menu);
      for (const collectionName of pageCollections) {
        expect(
          collectionNames.has(collectionName),
          `[${template.key}] menu page collection "${collectionName}" should exist`,
        ).toBeTruthy();
      }
    }
  });

  it('workflow trigger and update fields should be valid', () => {
    for (const template of builtInTemplates) {
      const collectionFieldMap = new Map<string, Set<string>>();
      for (const collection of template.collections) {
        collectionFieldMap.set(
          collection.name,
          new Set(['id', 'createdAt', 'updatedAt', ...collection.fields.map((field) => field.name)]),
        );
      }

      for (const workflow of template.workflows) {
        assertWorkflowIntegrity(template, collectionFieldMap, workflow);
      }
    }
  });
});
