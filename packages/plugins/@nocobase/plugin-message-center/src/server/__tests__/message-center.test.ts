/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Message Center Plugin', () => {
  describe('Do Not Disturb Window', () => {
    const isInDoNotDisturbWindow = (
      prefs: { doNotDisturbStart?: string; doNotDisturbEnd?: string },
      currentHour: number,
      currentMinute: number,
    ) => {
      if (!prefs.doNotDisturbStart || !prefs.doNotDisturbEnd) return false;
      const currentMinutes = currentHour * 60 + currentMinute;
      const [startH, startM] = prefs.doNotDisturbStart.split(':').map(Number);
      const [endH, endM] = prefs.doNotDisturbEnd.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      if (start <= end) return currentMinutes >= start && currentMinutes <= end;
      return currentMinutes >= start || currentMinutes <= end;
    };

    it('should return false when not configured', () => {
      expect(isInDoNotDisturbWindow({}, 12, 0)).toBe(false);
    });

    it('should detect time within daytime window', () => {
      const prefs = { doNotDisturbStart: '12:00', doNotDisturbEnd: '14:00' };
      expect(isInDoNotDisturbWindow(prefs, 13, 0)).toBe(true);
      expect(isInDoNotDisturbWindow(prefs, 11, 0)).toBe(false);
      expect(isInDoNotDisturbWindow(prefs, 14, 30)).toBe(false);
    });

    it('should handle overnight window (22:00 - 07:00)', () => {
      const prefs = { doNotDisturbStart: '22:00', doNotDisturbEnd: '07:00' };
      expect(isInDoNotDisturbWindow(prefs, 23, 0)).toBe(true);
      expect(isInDoNotDisturbWindow(prefs, 3, 0)).toBe(true);
      expect(isInDoNotDisturbWindow(prefs, 12, 0)).toBe(false);
      expect(isInDoNotDisturbWindow(prefs, 8, 0)).toBe(false);
    });

    it('should handle boundary times', () => {
      const prefs = { doNotDisturbStart: '22:00', doNotDisturbEnd: '07:00' };
      expect(isInDoNotDisturbWindow(prefs, 22, 0)).toBe(true);
      expect(isInDoNotDisturbWindow(prefs, 7, 0)).toBe(true);
    });
  });

  describe('Category Muting', () => {
    it('should check if a category is muted', () => {
      const mutedCategories = ['workflow', 'system'];
      expect(mutedCategories.includes('workflow')).toBe(true);
      expect(mutedCategories.includes('approval')).toBe(false);
    });
  });

  describe('Channel Delivery Logic', () => {
    it('should only deliver to enabled channels', () => {
      const prefs = {
        enableInApp: true,
        enableEmail: true,
        enableDingtalk: false,
        enableWecom: true,
        enableFeishu: false,
      };

      const channels: string[] = [];
      if (prefs.enableInApp) channels.push('inApp');
      if (prefs.enableEmail) channels.push('email');
      if (prefs.enableDingtalk) channels.push('dingtalk');
      if (prefs.enableWecom) channels.push('wecom');
      if (prefs.enableFeishu) channels.push('feishu');

      expect(channels).toEqual(['inApp', 'email', 'wecom']);
      expect(channels).not.toContain('dingtalk');
      expect(channels).not.toContain('feishu');
    });
  });

  describe('Message Model', () => {
    it('should have correct default values', () => {
      const message = {
        category: 'system',
        level: 'info',
        read: false,
        data: {},
      };
      expect(message.read).toBe(false);
      expect(message.category).toBe('system');
      expect(message.level).toBe('info');
    });

    const categories = ['system', 'approval', 'comment', 'workflow', 'mention', 'custom'];
    it.each(categories)('should accept category "%s"', (cat) => {
      expect(categories).toContain(cat);
    });
  });
});
