import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, formatRelativeDate } from './date';

describe('date utilities', () => {
  const testIso = '2024-06-15T10:00:00.000Z';

  describe('formatDate', () => {
    it('formats ISO date string into long Indian English date format', () => {
      const formatted = formatDate(testIso);
      expect(formatted).toContain('15');
      expect(formatted).toContain('June');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatDateShort', () => {
    it('formats ISO date string into short Indian English date format', () => {
      const formatted = formatDateShort(testIso);
      expect(formatted).toContain('15');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatRelativeDate', () => {
    it('formats past dates older than 30 days as short dates', () => {
      const formatted = formatRelativeDate(testIso);
      expect(formatted).toContain('15');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('2024');
    });

    it('formats recent past dates within days', () => {
      const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const formatted = formatRelativeDate(recent);
      expect(formatted).toMatch(/3 days ago/);
    });

    it('formats recent past dates within hours', () => {
      const hoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const formatted = formatRelativeDate(hoursAgo);
      expect(formatted).toMatch(/2 hours ago/);
    });
  });
});
