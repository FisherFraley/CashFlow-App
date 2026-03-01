import { describe, it, expect } from 'vitest';
import { formatCurrency, toMonthly } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats cents', () => {
    expect(formatCurrency(4.5)).toBe('$4.50');
  });

  it('formats large amounts with commas', () => {
    expect(formatCurrency(100000)).toBe('$100,000.00');
  });

  it('formats negative amounts', () => {
    const formatted = formatCurrency(-500);
    expect(formatted).toContain('500.00');
  });
});

describe('toMonthly', () => {
  it('returns monthly amount as-is', () => {
    expect(toMonthly(1000, 'monthly')).toBe(1000);
  });

  it('converts weekly to monthly (×52/12)', () => {
    const result = toMonthly(100, 'weekly');
    expect(result).toBeCloseTo(433.33, 1);
  });

  it('converts biweekly to monthly (×26/12)', () => {
    const result = toMonthly(2000, 'biweekly');
    expect(result).toBeCloseTo(4333.33, 1);
  });

  it('converts yearly to monthly (÷12)', () => {
    expect(toMonthly(12000, 'yearly')).toBe(1000);
  });

  it('converts once to monthly (÷12)', () => {
    expect(toMonthly(1200, 'once')).toBe(100);
  });
});
