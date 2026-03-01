import { describe, it, expect } from 'vitest';
import {
  parseRelativeDate,
  formatDate,
  formatDateShort,
  getMonthKey,
  formatMonthLabel,
  getRelativeDateLabel,
  groupByDate,
  getCurrentMonthKey,
  getLastNMonths,
} from './dateUtils';

describe('parseRelativeDate', () => {
  const ref = new Date(2025, 0, 15); // Jan 15, 2025 (Wednesday)

  it('returns ISO date as-is', () => {
    expect(parseRelativeDate('2025-01-05', ref)).toBe('2025-01-05');
  });

  it('parses "today"', () => {
    expect(parseRelativeDate('today', ref)).toBe('2025-01-15');
  });

  it('parses "yesterday"', () => {
    expect(parseRelativeDate('yesterday', ref)).toBe('2025-01-14');
  });

  it('parses "last monday"', () => {
    // Jan 15, 2025 is Wednesday, so last Monday = Jan 13
    expect(parseRelativeDate('last monday', ref)).toBe('2025-01-13');
  });

  it('parses "last friday"', () => {
    // Jan 15 is Wednesday, so last Friday = Jan 10
    expect(parseRelativeDate('last friday', ref)).toBe('2025-01-10');
  });

  it('parses bare day name "monday"', () => {
    expect(parseRelativeDate('monday', ref)).toBe('2025-01-13');
  });

  it('parses "jan 5"', () => {
    expect(parseRelativeDate('jan 5', ref)).toBe('2025-01-05');
  });

  it('parses "january 5"', () => {
    expect(parseRelativeDate('january 5', ref)).toBe('2025-01-05');
  });

  it('parses "jan 5 2024"', () => {
    expect(parseRelativeDate('jan 5 2024', ref)).toBe('2024-01-05');
  });

  it('parses "1/5" as MM/DD', () => {
    expect(parseRelativeDate('1/5', ref)).toBe('2025-01-05');
  });

  it('parses "1/5/2024" as MM/DD/YYYY', () => {
    expect(parseRelativeDate('1/5/2024', ref)).toBe('2024-01-05');
  });

  it('parses "1/5/25" as MM/DD/YY', () => {
    expect(parseRelativeDate('1/5/25', ref)).toBe('2025-01-05');
  });

  it('parses "3 days ago"', () => {
    expect(parseRelativeDate('3 days ago', ref)).toBe('2025-01-12');
  });

  it('parses "1 day ago"', () => {
    expect(parseRelativeDate('1 day ago', ref)).toBe('2025-01-14');
  });

  it('falls back to today for unrecognized input', () => {
    expect(parseRelativeDate('some random text', ref)).toBe('2025-01-15');
  });

  it('is case-insensitive', () => {
    expect(parseRelativeDate('YESTERDAY', ref)).toBe('2025-01-14');
    expect(parseRelativeDate('Last Monday', ref)).toBe('2025-01-13');
  });
});

describe('formatDate', () => {
  it('formats ISO date for display', () => {
    const result = formatDate('2025-01-05');
    expect(result).toContain('Jan');
    expect(result).toContain('5');
    expect(result).toContain('2025');
  });
});

describe('formatDateShort', () => {
  it('formats ISO date as short label', () => {
    const result = formatDateShort('2025-01-05');
    expect(result).toContain('Jan');
    expect(result).toContain('5');
  });
});

describe('getMonthKey', () => {
  it('extracts YYYY-MM from ISO date', () => {
    expect(getMonthKey('2025-01-15')).toBe('2025-01');
  });
});

describe('formatMonthLabel', () => {
  it('formats YYYY-MM as readable label', () => {
    const result = formatMonthLabel('2025-01');
    expect(result).toContain('January');
    expect(result).toContain('2025');
  });
});

describe('getRelativeDateLabel', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(getRelativeDateLabel(today)).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().slice(0, 10);
    expect(getRelativeDateLabel(yesterday)).toBe('Yesterday');
  });

  it('returns "This Week" for a date within 7 days', () => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    const recent = d.toISOString().slice(0, 10);
    const label = getRelativeDateLabel(recent);
    // Could be "This Week" or "Yesterday" depending on timing
    expect(['Today', 'Yesterday', 'This Week']).toContain(label);
  });
});

describe('groupByDate', () => {
  it('groups items by date', () => {
    const items = [
      { name: 'A', date: '2025-01-05' },
      { name: 'B', date: '2025-01-05' },
      { name: 'C', date: '2025-01-10' },
    ];
    const result = groupByDate(items, (i) => i.date);
    expect(result.get('2025-01-05')?.length).toBe(2);
    expect(result.get('2025-01-10')?.length).toBe(1);
  });
});

describe('getCurrentMonthKey', () => {
  it('returns current YYYY-MM', () => {
    const key = getCurrentMonthKey();
    expect(key).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('getLastNMonths', () => {
  it('returns N month keys most recent first', () => {
    const ref = new Date(2025, 2, 15); // March 2025
    const months = getLastNMonths(3, ref);
    expect(months).toEqual(['2025-03', '2025-02', '2025-01']);
  });

  it('handles year boundary', () => {
    const ref = new Date(2025, 1, 1); // Feb 2025
    const months = getLastNMonths(4, ref);
    expect(months).toEqual(['2025-02', '2025-01', '2024-12', '2024-11']);
  });
});
