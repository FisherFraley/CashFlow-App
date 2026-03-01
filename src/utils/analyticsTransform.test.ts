import { describe, it, expect } from 'vitest';
import {
  buildMonthlyTrend,
  buildCategoryDistribution,
  buildIncomeVsExpense,
} from './analyticsTransform';
import type { Transaction } from '../types';

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: Math.random().toString(),
    description: 'Test',
    amount: 0,
    type: 'expense',
    category: 'Other',
    transactionDate: '2025-01-15',
    source: 'manual',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildMonthlyTrend', () => {
  it('returns empty array for no months', () => {
    expect(buildMonthlyTrend([], [])).toEqual([]);
  });

  it('computes income and expenses per month', () => {
    const txs = [
      makeTx({ type: 'income', amount: 5000, transactionDate: '2025-01-15' }),
      makeTx({ type: 'expense', amount: 1500, transactionDate: '2025-01-20' }),
      makeTx({ type: 'expense', amount: 200, transactionDate: '2025-01-25' }),
      makeTx({ type: 'income', amount: 3000, transactionDate: '2025-02-01' }),
      makeTx({ type: 'expense', amount: 800, transactionDate: '2025-02-15' }),
    ];
    const months = ['2025-02', '2025-01'];
    const result = buildMonthlyTrend(txs, months);

    // Reversed: oldest first
    expect(result[0].month).toBe('2025-01');
    expect(result[0].income).toBe(5000);
    expect(result[0].expenses).toBe(1700);
    expect(result[0].net).toBe(3300);

    expect(result[1].month).toBe('2025-02');
    expect(result[1].income).toBe(3000);
    expect(result[1].expenses).toBe(800);
    expect(result[1].net).toBe(2200);
  });

  it('returns zeros for months with no transactions', () => {
    const result = buildMonthlyTrend([], ['2025-03']);
    expect(result[0].income).toBe(0);
    expect(result[0].expenses).toBe(0);
    expect(result[0].net).toBe(0);
  });
});

describe('buildCategoryDistribution', () => {
  it('returns empty for no expense transactions', () => {
    const txs = [
      makeTx({ type: 'income', amount: 5000 }),
    ];
    expect(buildCategoryDistribution(txs)).toEqual([]);
  });

  it('groups expenses by category with percentages', () => {
    const txs = [
      makeTx({ type: 'expense', amount: 600, category: 'Housing' }),
      makeTx({ type: 'expense', amount: 200, category: 'Groceries' }),
      makeTx({ type: 'expense', amount: 200, category: 'Dining' }),
    ];
    const result = buildCategoryDistribution(txs);
    expect(result[0].category).toBe('Housing');
    expect(result[0].amount).toBe(600);
    expect(result[0].percentage).toBe(60);
    expect(result[1].percentage).toBe(20);
    expect(result[2].percentage).toBe(20);
  });

  it('filters by month', () => {
    const txs = [
      makeTx({ type: 'expense', amount: 500, category: 'Housing', transactionDate: '2025-01-15' }),
      makeTx({ type: 'expense', amount: 300, category: 'Dining', transactionDate: '2025-02-05' }),
    ];
    const result = buildCategoryDistribution(txs, '2025-01');
    expect(result.length).toBe(1);
    expect(result[0].category).toBe('Housing');
  });
});

describe('buildIncomeVsExpense', () => {
  it('returns monthly labels with income and expense arrays', () => {
    const txs = [
      makeTx({ type: 'income', amount: 5000, transactionDate: '2025-01-15' }),
      makeTx({ type: 'expense', amount: 2000, transactionDate: '2025-01-20' }),
    ];
    const result = buildIncomeVsExpense(txs, ['2025-01']);
    expect(result.months.length).toBe(1);
    expect(result.income[0]).toBe(5000);
    expect(result.expenses[0]).toBe(2000);
  });
});
