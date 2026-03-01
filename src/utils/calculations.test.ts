import { describe, it, expect } from 'vitest';
import { calculateSummary } from './calculations';
import type { BudgetItem } from '../types';

function makeItem(overrides: Partial<BudgetItem>): BudgetItem {
  return {
    id: Math.random().toString(),
    type: 'expense',
    name: 'Test',
    amount: 0,
    rawAmount: 0,
    category: 'Other',
    frequency: 'monthly',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateSummary', () => {
  it('returns zeros for empty items', () => {
    const summary = calculateSummary([]);
    expect(summary.totalGrossIncome).toBe(0);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.totalSavings).toBe(0);
    expect(summary.totalOneTime).toBe(0);
    expect(summary.netCashFlow).toBe(0);
    expect(summary.savingsRate).toBe(0);
  });

  it('calculates total gross income', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000 }),
      makeItem({ type: 'income', amount: 500 }),
    ];
    const summary = calculateSummary(items);
    expect(summary.totalGrossIncome).toBe(5500);
  });

  it('calculates total expenses', () => {
    const items = [
      makeItem({ type: 'expense', amount: 1500, category: 'Housing' }),
      makeItem({ type: 'expense', amount: 400, category: 'Groceries' }),
    ];
    const summary = calculateSummary(items);
    expect(summary.totalExpenses).toBe(1900);
  });

  it('calculates total savings', () => {
    const items = [
      makeItem({ type: 'savings', amount: 400 }),
      makeItem({ type: 'savings', amount: 300 }),
    ];
    const summary = calculateSummary(items);
    expect(summary.totalSavings).toBe(700);
  });

  it('calculates total one-time purchases', () => {
    const items = [
      makeItem({ type: 'oneTime', amount: 100 }),
      makeItem({ type: 'oneTime', amount: 50 }),
    ];
    const summary = calculateSummary(items);
    expect(summary.totalOneTime).toBe(150);
  });

  it('calculates net cash flow correctly', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000 }),
      makeItem({ type: 'expense', amount: 2000 }),
      makeItem({ type: 'savings', amount: 500 }),
      makeItem({ type: 'oneTime', amount: 200 }),
    ];
    const summary = calculateSummary(items);
    expect(summary.netCashFlow).toBe(5000 - 2000 - 500 - 200);
  });

  it('handles tax expenses separately', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000 }),
      makeItem({ type: 'expense', amount: 1000, category: 'Tax' }),
      makeItem({ type: 'expense', amount: 500, category: 'Housing' }),
    ];
    const summary = calculateSummary(items);
    expect(summary.totalTaxes).toBe(1000);
    expect(summary.totalNetIncome).toBe(4000);
    expect(summary.totalExpenses).toBe(1500);
  });

  it('calculates savings rate as percentage of net income', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000 }),
      makeItem({ type: 'savings', amount: 1000 }),
    ];
    const summary = calculateSummary(items);
    expect(summary.savingsRate).toBe(20);
  });

  it('returns 0 savings rate when no net income', () => {
    const items = [
      makeItem({ type: 'savings', amount: 1000 }),
    ];
    const summary = calculateSummary(items);
    expect(summary.savingsRate).toBe(0);
  });

  it('handles negative net cash flow', () => {
    const items = [
      makeItem({ type: 'income', amount: 1000 }),
      makeItem({ type: 'expense', amount: 2000 }),
    ];
    const summary = calculateSummary(items);
    expect(summary.netCashFlow).toBe(-1000);
  });
});
