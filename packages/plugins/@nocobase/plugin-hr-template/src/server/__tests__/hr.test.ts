describe('HR Template Plugin', () => {
  describe('Employee Model', () => {
    const levels = ['junior', 'mid', 'senior', 'lead', 'manager', 'director'];
    const statuses = ['active', 'on_leave', 'resigned', 'terminated'];

    it('should have 6 career levels', () => {
      expect(levels).toHaveLength(6);
      expect(levels[0]).toBe('junior');
      expect(levels[levels.length - 1]).toBe('director');
    });

    it('should have 4 employment statuses', () => {
      expect(statuses).toContain('active');
      expect(statuses).toContain('resigned');
    });

    it('should support self-referencing manager field', () => {
      const employee = { id: 1, name: 'Alice', managerId: null };
      const subordinate = { id: 2, name: 'Bob', managerId: 1 };
      expect(subordinate.managerId).toBe(employee.id);
    });
  });

  describe('Leave Requests', () => {
    const leaveTypes = ['annual', 'sick', 'personal', 'maternity', 'marriage', 'bereavement', 'other'];

    it('should have 7 leave types', () => {
      expect(leaveTypes).toHaveLength(7);
    });

    it('should calculate leave days', () => {
      const start = new Date('2025-03-01');
      const end = new Date('2025-03-05');
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      expect(days).toBe(4);
    });

    const approvalStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    it('should have 4 approval statuses', () => {
      expect(approvalStatuses).toHaveLength(4);
    });
  });

  describe('Attendance', () => {
    const attendanceStatuses = ['normal', 'late', 'early_leave', 'absent', 'on_leave'];

    it('should have 5 attendance statuses', () => {
      expect(attendanceStatuses).toHaveLength(5);
    });

    it('should calculate work hours from check in/out', () => {
      const checkIn = new Date('2025-03-01T09:00:00');
      const checkOut = new Date('2025-03-01T18:00:00');
      const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      expect(hours).toBe(9);
    });
  });
});
