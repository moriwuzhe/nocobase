/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Row-level ACL Middleware
 *
 * Applies row-level data filtering based on the current user's role
 * and the configured data scope rules.
 *
 * Data scope types:
 * - "all": No restriction
 * - "own": Only records created by the current user (createdById = currentUser.id)
 * - "department": Records belonging to the current user's department
 * - "departmentAndChildren": Department + subordinate departments
 * - "custom": Custom filter expression
 *
 * This middleware injects filter conditions into the query before
 * it reaches the database, ensuring data isolation.
 */
export async function rowLevelAclMiddleware(ctx: any, next: any) {
  const { resourceName, actionName } = ctx.action;

  // Skip for admin role
  if (ctx.state.currentRole === 'root' || ctx.state.currentRole === 'admin') {
    return next();
  }

  const roleName = ctx.state.currentRole;
  if (!roleName || !resourceName) {
    return next();
  }

  try {
    // Look up the row-level filter for this role + resource + action
    const actionModel = await ctx.db.getRepository('rolesResourcesActions').findOne({
      filter: {
        name: ctx.app.acl.resolveActionAlias(actionName),
        resource: {
          name: resourceName,
          roleName,
        },
      },
      appends: ['scope'],
    });

    if (!actionModel?.scope?.filter) {
      return next();
    }

    const scopeFilter = actionModel.scope.filter;

    // Replace dynamic variables in the filter
    const resolvedFilter = resolveFilterVariables(scopeFilter, {
      currentUser: ctx.state.currentUser,
      currentRole: roleName,
      now: new Date(),
    });

    // Merge the row-level filter into the request's existing filter
    const existingFilter = ctx.action.params.filter || {};
    ctx.action.params.filter = {
      $and: [existingFilter, resolvedFilter].filter(
        (f) => f && Object.keys(f).length > 0,
      ),
    };
  } catch (err) {
    ctx.app.logger.warn('[ACL] Row-level filter error:', err);
  }

  return next();
}

/**
 * Replace template variables in filter expressions:
 * - {{currentUser.id}} → current user's ID
 * - {{currentUser.departmentId}} → current user's department
 * - {{currentRole}} → current role name
 * - {{now}} → current timestamp
 */
function resolveFilterVariables(
  filter: Record<string, any>,
  context: { currentUser: any; currentRole: string; now: Date },
): Record<string, any> {
  const json = JSON.stringify(filter);
  const resolved = json
    .replace(/\{\{currentUser\.id\}\}/g, String(context.currentUser?.id || ''))
    .replace(/\{\{currentUser\.departmentId\}\}/g, String(context.currentUser?.departmentId || ''))
    .replace(/\{\{currentRole\}\}/g, context.currentRole)
    .replace(/\{\{now\}\}/g, context.now.toISOString());

  return JSON.parse(resolved);
}
