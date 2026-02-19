/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Field-level ACL Middleware
 *
 * Enforces field-level permissions:
 * - Hidden fields: completely invisible in responses (stripped from output)
 * - Read-only fields: visible but rejected if present in write payloads
 *
 * This works in conjunction with the existing `fields` array in
 * rolesResourcesActions — that array already controls which fields
 * are allowed. This middleware extends it with hidden/readonly semantics.
 *
 * Configuration is stored in rolesResourcesActions.fieldPermissions:
 * {
 *   "fieldName": "hidden" | "readonly" | "writable"
 * }
 */
export async function fieldLevelAclMiddleware(ctx: any, next: any) {
  const { resourceName, actionName } = ctx.action;

  // Skip for admin roles
  if (ctx.state.currentRole === 'root' || ctx.state.currentRole === 'admin') {
    return next();
  }

  const roleName = ctx.state.currentRole;
  if (!roleName || !resourceName) {
    return next();
  }

  try {
    const actionModel = await ctx.db.getRepository('rolesResourcesActions').findOne({
      filter: {
        name: ctx.app.acl.resolveActionAlias(actionName),
        resource: {
          name: resourceName,
          roleName,
        },
      },
    });

    if (!actionModel) {
      return next();
    }

    const fieldPermissions: Record<string, string> = actionModel.get('fieldPermissions') || {};
    const hiddenFields = Object.entries(fieldPermissions)
      .filter(([, perm]) => perm === 'hidden')
      .map(([field]) => field);

    const readonlyFields = Object.entries(fieldPermissions)
      .filter(([, perm]) => perm === 'readonly')
      .map(([field]) => field);

    // For read actions: strip hidden fields from the result
    const resolvedAction = ctx.app.acl.resolveActionAlias(actionName);
    if (['view', 'list', 'get', 'export'].includes(resolvedAction)) {
      await next();

      // Post-process: remove hidden fields from response
      if (hiddenFields.length > 0 && ctx.body) {
        const stripFields = (record: any) => {
          if (!record) return record;
          const data = record.toJSON ? record.toJSON() : { ...record };
          for (const field of hiddenFields) {
            delete data[field];
          }
          return data;
        };

        if (Array.isArray(ctx.body)) {
          ctx.body = ctx.body.map(stripFields);
        } else if (ctx.body.data && Array.isArray(ctx.body.data)) {
          ctx.body.data = ctx.body.data.map(stripFields);
        } else if (ctx.body.data) {
          ctx.body.data = stripFields(ctx.body.data);
        }
      }
      return;
    }

    // For write actions: reject readonly and hidden fields in the payload
    if (['create', 'update'].includes(resolvedAction)) {
      const values = ctx.action.params.values;
      if (values) {
        const restrictedFields = [...hiddenFields, ...readonlyFields];
        for (const field of restrictedFields) {
          if (field in values) {
            delete values[field];
          }
        }
        ctx.action.params.values = values;
      }
    }
  } catch (err) {
    ctx.app.logger.warn('[ACL] Field-level permission error:', err);
  }

  return next();
}
