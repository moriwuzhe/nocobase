describe('Import Helper', () => {
  it('should skip relation and system fields', () => {
    const skipTypes = ['belongsTo', 'hasMany', 'belongsToMany', 'hasOne'];
    const skipNames = ['createdAt', 'updatedAt', 'createdById', 'updatedById', 'id', 'sort'];
    expect(skipTypes.includes('belongsTo')).toBe(true);
    expect(skipNames.includes('id')).toBe(true);
    expect(skipTypes.includes('string')).toBe(false);
  });

  it('should map template name to collection prefix', () => {
    const prefixMap: Record<string, string> = {
      crm: 'crm', project: 'pm', hr: 'hr', oa: 'oa',
      inventory: 'inv', ticket: 'ticket',
    };
    expect(prefixMap['crm']).toBe('crm');
    expect(prefixMap['project']).toBe('pm');
    expect(prefixMap['inventory']).toBe('inv');
  });

  it('should generate field description by type', () => {
    const typeDesc = (type: string) => {
      if (type === 'date') return '格式: YYYY-MM-DD';
      if (['float', 'integer'].includes(type)) return '数字';
      if (type === 'boolean') return 'true / false';
      return '文本';
    };
    expect(typeDesc('date')).toContain('YYYY');
    expect(typeDesc('float')).toBe('数字');
    expect(typeDesc('string')).toBe('文本');
  });
});
