import { describe, it, expect } from 'vitest';
import {
  getMonthlyTotals,
  getCategoryTotals,
  getBudgetComparison,
  getMonthTotal,
  getMonthIncome,
  getMonthNet,
} from './transactionCalculations';
import type { Transaction, BudgetItem } from '../types';

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

function makeItem(overrides: Partial<BudgetItem>): BudgetItem {
  return {
    id: Math.random().toString(),
    type: 'expense',
    name: 'Test',
    amount: 0,
    rawAmount: 0,
    category: 'Other',
    frequency: 'monthly',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getMonthlyTotals', () => {
  it('returns empty map for no transactions', () => {
    const result = getMonthlyTotals([]);
    expect(result.size).toBe(0);
  });

  it('groups income and expenses by month', () => {
    const txs = [
      makeTx({ type: 'income', amount: 5000, transactionDate: '2025-01-15' }),
      makeTx({ type: 'expense', amount: 200, transactionDate: '2025-01-20' }),
      makeTx({ type: 'expense', amount: 100, transactionDate: '2025-01-25' }),
      makeTx({ type: 'income', amount: 3000, transactionDate: '2025-02-01' }),
    ];
    const result = getMonthlyTotals(txs);
    expect(result.get('2025-01')).toEqual({ income: 5000, expenses: 300 });
    expect(result.get('2025-02')).toEqual({ income: 3000, expenses: 0 });
  });
});

describe('getCategoryTotals', () => {
  it('returns empty map for no transactions', () => {
    const result = getCategoryTotals([]);
    expect(result.size).toBe(0);
  });

  it('sums expenses by category', () => {
    const txs = [
      makeTx({ type: 'expense', amount: 1500, category: 'Housing' }),
      makeTx({ type: 'expense', amount: 400, category: 'Groceries' }),
      makeTx({ type: 'expense', amount: 100, category: 'Groceries' }),
      makeTx({ type: 'income', amount: 5000, category: 'Employment' }),
    ];
    const result = getCategoryTotals(txs);
    expect(result.get('Housing')).toBe(1500);
    expect(result.get('Groceries')).toBe(500);
    expect(result.has('Employment')).toBe(false); // income excluded
  });

  it('filters by month when specified', () => {
    const txs = [
      makeTx({ type: 'expense', amount: 200, category: 'Dining', transactionDate: '2025-01-10' }),
      makeTx({ type: 'expense', amount: 150, category: 'Dining', transactionDate: '2025-02-05' }),
    ];
    const result = getCategoryTotals(txs, '2025-01');
    expect(result.get('Dining')).toBe(200);
  });
});

describe('getBudgetComparison', () => {
  it('compares budgeted vs actual spending', () => {
    const budgetItems = [
      makeItem({ type: 'expense', rawAmount: 1500, category: 'Housing', frequency: 'monthly' }),
      makeItem({ type: 'expense', rawAmount: 400, category: 'Groceries', frequency: 'monthly' }),
    ];
    const txs = [
      makeTx({ type: 'expense', amount: 1500, category: 'Housing', transactionDate: '2025-01-05' }),
      makeTx({ type: 'expense', amount: 350, category: 'Groceries', transactionDate: '2025-01-12' }),
    ];
    const result = getBudgetComparison(budgetItems, txs, '2025-01');
    const housing = result.find((c) => c.category === 'Housing')!;
    expect(housing.budgeted).toBe(1500);
    expect(housing.actual).toBe(1500);
    expect(housing.percentUsed).toBe(100);

    const groceries = result.find((c) => c.category === 'Groceries')!;
    expect(groceries.budgeted).toBe(400);
    expect(groceries.actual).toBe(350);
    expect(groceries.percentUsed).toBeCloseTo(87.5);
    expect(groceries.difference).toBe(50);
  });

  it('includes unbudgeted spending categories', () => {
    const budgetItems: BudgetItem[] = [];
    const txs = [
      makeTx({ type: 'expense', amount: 50, category: 'Dining', transactionDate: '2025-01-10' }),
    ];
    const result = getBudgetComparison(budgetItems, txs, '2025-01');
    const dining = result.find((c) => c.category === 'Dining')!;
    expect(dining.budgeted).toBe(0);
    expect(dining.actual).toBe(50);
    expect(dining.percentUsed).toBe(Infinity);
  });

  it('handles budget with no actual spending', () => {
    const budgetItems = [
      makeItem({ type: 'expense', rawAmount: 200, category: 'Entertainment', frequency: 'monthly' }),
    ];
    const result = getBudgetComparison(budgetItems, [], '2025-01');
    const ent = result.find((c) => c.category === 'Entertainment')!;
    expect(ent.budgeted).toBe(200);
    expect(ent.actual).toBe(0);
    expect(ent.percentUsed).toBe(0);
    expect(ent.difference).toBe(200);
  });
});

describe('getMonthTotal', () => {
  it('sums expenses for a month', () => {
    const txs = [
      makeTx({ type: 'expense', amount: 100, transactionDate: '2025-01-05' }),
      makeTx({ type: 'expense', amount: 200, transactionDate: '2025-01-15' }),
      makeTx({ type: 'expense', amount: 300, transactionDate: '2025-02-01' }),
    ];
    expect(getMonthTotal(txs, '2025-01')).toBe(300);
  });
});

describe('getMonthIncome', () => {
  it('sums income for a month', () => {
    const txs = [
      makeTx({ type: 'income', amount: 3000, transactionDate: '2025-01-01' }),
      makeTx({ type: 'income', amount: 500, transactionDate: '2025-01-15' }),
      makeTx({ type: 'expense', amount: 200, transactionDate: '2025-01-10' }),
    ];
    expect(getMonthIncome(txs, '2025-01')).toBe(3500);
  });
});

describe('getMonthNet', () => {
  it('calculates net for a month', () => {
    const txs = [
      makeTx({ type: 'income', amount: 5000, transactionDate: '2025-01-01' }),
      makeTx({ type: 'expense', amount: 2000, transactionDate: '2025-01-15' }),
    ];
    expect(getMonthNet(txs, '2025-01')).toBe(3000);
  });

  it('returns negative when expenses exceed income', () => {
    const txs = [
      makeTx({ type: 'income', amount: 1000, transactionDate: '2025-01-01' }),
      makeTx({ type: 'expense', amount: 2000, transactionDate: '2025-01-15' }),
    ];
    expect(getMonthNet(txs, '2025-01')).toBe(-1000);
  });
});
