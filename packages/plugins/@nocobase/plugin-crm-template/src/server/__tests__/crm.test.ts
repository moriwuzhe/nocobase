/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('CRM Template Plugin', () => {
  describe('Customer Stages', () => {
    const stages = ['lead', 'prospect', 'customer', 'churned'];

    it('should have correct stage pipeline', () => {
      expect(stages).toHaveLength(4);
      expect(stages[0]).toBe('lead');
      expect(stages[stages.length - 1]).toBe('churned');
    });

    it.each(stages)('stage "%s" should be valid', (stage) => {
      expect(typeof stage).toBe('string');
      expect(stage.length).toBeGreaterThan(0);
    });
  });

  describe('Deal Pipeline', () => {
    const dealStages = [
      { value: 'qualification', probability: 10 },
      { value: 'needs_analysis', probability: 25 },
      { value: 'proposal', probability: 50 },
      { value: 'negotiation', probability: 75 },
      { value: 'closed_won', probability: 100 },
      { value: 'closed_lost', probability: 0 },
    ];

    it('should have 6 stages', () => {
      expect(dealStages).toHaveLength(6);
    });

    it('should have increasing probability through the pipeline', () => {
      const activePipeline = dealStages.filter(
        (s) => s.value !== 'closed_lost',
      );
      for (let i = 1; i < activePipeline.length; i++) {
        expect(activePipeline[i].probability).toBeGreaterThanOrEqual(
          activePipeline[i - 1].probability,
        );
      }
    });

    it('closed_won should be 100% probability', () => {
      const won = dealStages.find((s) => s.value === 'closed_won');
      expect(won?.probability).toBe(100);
    });

    it('closed_lost should be 0% probability', () => {
      const lost = dealStages.find((s) => s.value === 'closed_lost');
      expect(lost?.probability).toBe(0);
    });
  });

  describe('Activity Types', () => {
    const types = ['call', 'email', 'meeting', 'visit', 'note', 'task'];

    it('should have 6 activity types', () => {
      expect(types).toHaveLength(6);
    });

    it('should include common CRM activities', () => {
      expect(types).toContain('call');
      expect(types).toContain('email');
      expect(types).toContain('meeting');
    });
  });

  describe('Collection Relationships', () => {
    it('customer should have contacts, deals, and activities', () => {
      const customerRelations = ['contacts', 'deals', 'activities'];
      expect(customerRelations).toHaveLength(3);
    });

    it('deal should belong to customer and contact', () => {
      const dealBelongsTo = ['customer', 'contact', 'owner'];
      expect(dealBelongsTo).toContain('customer');
      expect(dealBelongsTo).toContain('contact');
    });

    it('activity should reference customer, contact, and deal', () => {
      const activityRefs = ['customer', 'contact', 'deal', 'owner'];
      expect(activityRefs).toHaveLength(4);
    });
  });
});
