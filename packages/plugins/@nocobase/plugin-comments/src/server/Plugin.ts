/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { NAMESPACE } from '../common/constants';

export default class PluginCommentsServer extends Plugin {
  async load() {
    // Resource definition with custom actions
    this.app.resourceManager.define({
      name: 'comments',
      actions: {
        listByRecord: this.listByRecord.bind(this),
        mentionUsers: this.searchMentionableUsers.bind(this),
      },
    });

    // ACL: logged-in users can manage their own comments
    this.app.acl.allow('comments', ['list', 'get', 'create', 'update', 'destroy', 'listByRecord', 'mentionUsers'], 'loggedIn');

    this.app.acl.registerSnippet({
      name: `pm.${this.name}.comments`,
      actions: ['comments:*'],
    });

    // --- Database hooks ---

    // After a comment is created, send mention notifications
    this.db.on('comments.afterCreate', async (comment, { transaction }) => {
      // Auto-set userId from current user
      if (!comment.userId && comment._ctx?.state?.currentUser) {
        await comment.update({ userId: comment._ctx.state.currentUser.id }, { transaction });
      }
      await this.sendMentionNotifications(comment, transaction);
    });

    // Track edits
    this.db.on('comments.beforeUpdate', async (comment) => {
      if (comment.changed('content')) {
        comment.set('edited', true);
        comment.set('editedAt', new Date());
      }
    });

    // Only allow users to edit/delete their own comments (unless admin)
    this.app.resourceManager.use(async (ctx, next) => {
      const { resourceName, actionName } = ctx.action;
      if (resourceName !== 'comments') return next();
      if (!['update', 'destroy'].includes(actionName)) return next();

      const { filterByTk } = ctx.action.params;
      if (!filterByTk) return next();

      const comment = await ctx.db.getRepository('comments').findOne({ filterByTk });
      if (!comment) return ctx.throw(404, 'Comment not found');

      const currentUserId = ctx.state.currentUser?.id;
      const isAdmin = ctx.state.currentRole === 'root' || ctx.state.currentRole === 'admin';
      if (comment.userId !== currentUserId && !isAdmin) {
        return ctx.throw(403, 'You can only modify your own comments');
      }

      // Soft delete: mark as deleted instead of removing
      if (actionName === 'destroy') {
        await ctx.db.getRepository('comments').update({
          filterByTk,
          values: { status: 'deleted', content: '[This comment has been deleted]', contentText: '' },
        });
        ctx.body = { success: true };
        return;
      }

      return next();
    });
  }

  /**
   * List comments for a specific record, with threaded structure.
   */
  async listByRecord(ctx, next) {
    const { collectionName, recordId, page = 1, pageSize = 20 } = ctx.action.params;

    if (!collectionName || !recordId) {
      return ctx.throw(400, 'collectionName and recordId are required');
    }

    const repository = ctx.db.getRepository('comments');
    const [rows, count] = await repository.findAndCount({
      filter: {
        collectionName,
        recordId: String(recordId),
        parentId: null, // Only top-level comments
        status: 'active',
      },
      appends: ['user', 'replies', 'replies.user'],
      sort: ['-createdAt'],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    ctx.body = {
      data: rows,
      meta: { count, page, pageSize, totalPages: Math.ceil(count / pageSize) },
    };

    await next();
  }

  /**
   * Search for users that can be @mentioned.
   */
  async searchMentionableUsers(ctx, next) {
    const { keyword } = ctx.action.params;

    const UserRepo = ctx.db.getRepository('users');
    const users = await UserRepo.find({
      filter: keyword
        ? {
            $or: [
              { nickname: { $includes: keyword } },
              { username: { $includes: keyword } },
              { email: { $includes: keyword } },
            ],
          }
        : {},
      fields: ['id', 'nickname', 'username', 'email'],
      limit: 20,
    });

    ctx.body = users;
    await next();
  }

  /**
   * Send notifications to users mentioned in a comment.
   */
  private async sendMentionNotifications(comment, transaction) {
    const mentions = comment.get('mentions');
    if (!mentions?.length) return;

    try {
      const notificationPlugin = this.app.pm.get('notification-manager') as any;
      if (!notificationPlugin) return;

      const author = await this.db.getRepository('users').findOne({
        filterByTk: comment.userId,
        fields: ['nickname'],
        transaction,
      });

      const authorName = author?.nickname || 'Someone';

      await notificationPlugin.sendToUsers?.({
        userIds: mentions,
        title: `${authorName} mentioned you in a comment`,
        content: comment.contentText || comment.content,
        data: {
          type: 'comment_mention',
          commentId: comment.id,
          collectionName: comment.collectionName,
          recordId: comment.recordId,
        },
      });
    } catch (err) {
      this.app.logger.warn('[comments] Failed to send mention notifications:', err);
    }
  }
}
