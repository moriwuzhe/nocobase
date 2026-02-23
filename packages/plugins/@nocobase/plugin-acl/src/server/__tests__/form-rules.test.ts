import { evaluateRule, evaluateRules, OPERATORS } from '../form-rules-engine';

describe('Form Rules Engine', () => {
  describe('Operators', () => {
    it('eq: should match equal values', () => {
      expect(OPERATORS.eq('a', 'a')).toBe(true);
      expect(OPERATORS.eq('a', 'b')).toBe(false);
      expect(OPERATORS.eq(1, '1')).toBe(true);
    });

    it('ne: should match unequal values', () => {
      expect(OPERATORS.ne('a', 'b')).toBe(true);
      expect(OPERATORS.ne('a', 'a')).toBe(false);
    });

    it('in: should check array inclusion', () => {
      expect(OPERATORS.in('a', ['a', 'b', 'c'])).toBe(true);
      expect(OPERATORS.in('d', ['a', 'b', 'c'])).toBe(false);
    });

    it('gt/lt: should compare numbers', () => {
      expect(OPERATORS.gt(10, 5)).toBe(true);
      expect(OPERATORS.lt(3, 7)).toBe(true);
      expect(OPERATORS.gte(5, 5)).toBe(true);
      expect(OPERATORS.lte(5, 5)).toBe(true);
    });

    it('contains: should check substring', () => {
      expect(OPERATORS.contains('hello world', 'world')).toBe(true);
      expect(OPERATORS.contains('hello', 'xyz')).toBe(false);
    });

    it('empty/notEmpty: should check null/empty', () => {
      expect(OPERATORS.empty(null)).toBe(true);
      expect(OPERATORS.empty('')).toBe(true);
      expect(OPERATORS.empty([])).toBe(true);
      expect(OPERATORS.notEmpty('value')).toBe(true);
      expect(OPERATORS.notEmpty(0)).toBe(true);
    });
  });

  describe('Rule evaluation', () => {
    it('should return actions when condition matches', () => {
      const rule = {
        collectionName: 'orders', title: 'test', triggerField: 'type', triggerOperator: 'eq', triggerValue: 'urgent',
        actions: [{ targetField: 'priority', action: 'setValue' as const, value: 'high' }], enabled: true,
      };
      const result = evaluateRule(rule, { type: 'urgent' });
      expect(result).toHaveLength(1);
      expect(result![0].targetField).toBe('priority');
    });

    it('should return null when condition does not match', () => {
      const rule = {
        collectionName: 'orders', title: 'test', triggerField: 'type', triggerOperator: 'eq', triggerValue: 'urgent',
        actions: [{ targetField: 'priority', action: 'show' as const }], enabled: true,
      };
      expect(evaluateRule(rule, { type: 'normal' })).toBeNull();
    });
  });

  describe('Multiple rules evaluation', () => {
    it('should combine actions from matching rules', () => {
      const rules = [
        { collectionName: 'x', title: 'r1', triggerField: 'status', triggerOperator: 'eq', triggerValue: 'active', actions: [{ targetField: 'name', action: 'required' as const }], enabled: true },
        { collectionName: 'x', title: 'r2', triggerField: 'type', triggerOperator: 'eq', triggerValue: 'vip', actions: [{ targetField: 'discount', action: 'show' as const }], enabled: true },
        { collectionName: 'x', title: 'r3', triggerField: 'status', triggerOperator: 'eq', triggerValue: 'closed', actions: [{ targetField: 'notes', action: 'hide' as const }], enabled: true },
      ];
      const actions = evaluateRules(rules, { status: 'active', type: 'vip' });
      expect(actions).toHaveLength(2);
    });

    it('should skip disabled rules', () => {
      const rules = [
        { collectionName: 'x', title: 'r1', triggerField: 'a', triggerOperator: 'eq', triggerValue: '1', actions: [{ targetField: 'b', action: 'show' as const }], enabled: false },
      ];
      expect(evaluateRules(rules, { a: '1' })).toHaveLength(0);
    });
  });
});
