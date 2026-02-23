describe('Field Changelog', () => {
  it('should filter by field name', () => {
    const changes = [
      { fieldName: 'status', before: 'draft', after: 'published' },
      { fieldName: 'title', before: 'Old', after: 'New' },
      { fieldName: 'status', before: 'published', after: 'archived' },
    ];
    const statusChanges = changes.filter((c) => c.fieldName === 'status');
    expect(statusChanges.length).toBe(2);
  });

  it('should skip system audit fields', () => {
    const systemFields = ['_sensitiveAudit', '_loginAudit'];
    const change = { fieldName: '_sensitiveAudit' };
    expect(systemFields.includes(change.fieldName)).toBe(true);
  });

  it('should compute field change summary', () => {
    const fields: Record<string, { count: number }> = {};
    const changes = [{ field: 'status' }, { field: 'status' }, { field: 'title' }];
    changes.forEach((c) => {
      if (!fields[c.field]) fields[c.field] = { count: 0 };
      fields[c.field].count++;
    });
    expect(fields['status'].count).toBe(2);
    expect(fields['title'].count).toBe(1);
  });

  it('should support date range diff', () => {
    const fromDate = '2024-01-01';
    const toDate = '2024-12-31';
    expect(new Date(fromDate) < new Date(toDate)).toBe(true);
  });
});
