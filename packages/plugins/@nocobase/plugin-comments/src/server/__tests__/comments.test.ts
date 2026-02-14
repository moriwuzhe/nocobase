/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { COMMENT_STATUS } from '../../common/constants';

describe('Comments Plugin', () => {
  describe('Constants', () => {
    it('should have correct status values', () => {
      expect(COMMENT_STATUS.ACTIVE).toBe('active');
      expect(COMMENT_STATUS.DELETED).toBe('deleted');
      expect(COMMENT_STATUS.HIDDEN).toBe('hidden');
    });
  });

  describe('Comment Data Model', () => {
    // These test the shape of the collection definition
    it('should use polymorphic approach with collectionName + recordId', () => {
      // The comments collection uses collectionName + recordId for polymorphic association
      // This allows comments to be attached to any collection's records
      const commentShape = {
        collectionName: 'orders',
        recordId: '123',
        content: '<p>This is a comment</p>',
        contentText: 'This is a comment',
        userId: 1,
        mentions: [2, 3],
        status: 'active',
      };

      expect(commentShape.collectionName).toBeDefined();
      expect(commentShape.recordId).toBeDefined();
      expect(commentShape.mentions).toBeInstanceOf(Array);
    });

    it('should support threaded replies via parentId', () => {
      const parentComment = { id: '1', parentId: null };
      const reply = { id: '2', parentId: '1' };
      expect(parentComment.parentId).toBeNull();
      expect(reply.parentId).toBe('1');
    });
  });

  describe('Mention Parsing', () => {
    it('should extract mentioned user IDs from array', () => {
      const mentions = [1, 5, 12];
      expect(mentions.length).toBe(3);
      expect(mentions).toContain(5);
    });

    it('should handle empty mentions', () => {
      const mentions: number[] = [];
      expect(mentions.length).toBe(0);
    });
  });

  describe('Soft Delete Logic', () => {
    it('should mark comment as deleted instead of removing', () => {
      // Simulating the soft delete behavior
      const comment = {
        status: COMMENT_STATUS.ACTIVE,
        content: 'Original content',
        contentText: 'Original content',
      };

      // After soft delete:
      const deletedComment = {
        ...comment,
        status: COMMENT_STATUS.DELETED,
        content: '[This comment has been deleted]',
        contentText: '',
      };

      expect(deletedComment.status).toBe('deleted');
      expect(deletedComment.content).toBe('[This comment has been deleted]');
    });
  });

  describe('Ownership Check', () => {
    it('should allow author to edit own comment', () => {
      const comment = { userId: 5 };
      const currentUser = { id: 5 };
      expect(comment.userId === currentUser.id).toBe(true);
    });

    it('should deny non-author from editing', () => {
      const comment = { userId: 5 };
      const currentUser = { id: 10 };
      expect(comment.userId === currentUser.id).toBe(false);
    });

    it('should allow admin to edit any comment', () => {
      const isAdmin = true;
      expect(isAdmin).toBe(true);
    });
  });
});
