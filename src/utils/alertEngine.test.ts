import { describe, it, expect } from 'vitest';
import { checkBudgetAlerts } from './alertEngine';
import type { BudgetLimit, Transaction } from '../types';

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

describe('checkBudgetAlerts', () => {
  it('returns no alerts when spending is below threshold', () => {
    const limits: BudgetLimit[] = [
      { category: 'Dining', monthlyLimit: 500, warningThreshold: 0.8 },
    ];
    const txs = [
      makeTx({ category: 'Dining', amount: 100, transactionDate: '2025-01-10' }),
    ];
    const alerts = checkBudgetAlerts(limits, txs, '2025-01');
    expect(alerts).toHaveLength(0);
  });

  it('returns warning when spending exceeds warning threshold', () => {
    const limits: BudgetLimit[] = [
      { category: 'Dining', monthlyLimit: 500, warningThreshold: 0.8 },
    ];
    const txs = [
      makeTx({ category: 'Dining', amount: 420, transactionDate: '2025-01-10' }),
    ];
    const alerts = checkBudgetAlerts(limits, txs, '2025-01');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('warning');
    expect(alerts[0].category).toBe('Dining');
    expect(alerts[0].currentSpend).toBe(420);
  });

  it('returns exceeded when spending exceeds limit', () => {
    const limits: BudgetLimit[] = [
      { category: 'Dining', monthlyLimit: 500, warningThreshold: 0.8 },
    ];
    const txs = [
      makeTx({ category: 'Dining', amount: 550, transactionDate: '2025-01-10' }),
    ];
    const alerts = checkBudgetAlerts(limits, txs, '2025-01');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('exceeded');
  });

  it('only counts transactions from the specified month', () => {
    const limits: BudgetLimit[] = [
      { category: 'Dining', monthlyLimit: 500, warningThreshold: 0.8 },
    ];
    const txs = [
      makeTx({ category: 'Dining', amount: 450, transactionDate: '2025-02-10' }),
    ];
    const alerts = checkBudgetAlerts(limits, txs, '2025-01');
    expect(alerts).toHaveLength(0);
  });

  it('handles multiple limits', () => {
    const limits: BudgetLimit[] = [
      { category: 'Dining', monthlyLimit: 500, warningThreshold: 0.8 },
      { category: 'Entertainment', monthlyLimit: 200, warningThreshold: 0.8 },
    ];
    const txs = [
      makeTx({ category: 'Dining', amount: 600, transactionDate: '2025-01-10' }),
      makeTx({ category: 'Entertainment', amount: 50, transactionDate: '2025-01-15' }),
    ];
    const alerts = checkBudgetAlerts(limits, txs, '2025-01');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].category).toBe('Dining');
  });

  it('ignores income transactions', () => {
    const limits: BudgetLimit[] = [
      { category: 'Other', monthlyLimit: 100, warningThreshold: 0.8 },
    ];
    const txs = [
      makeTx({ type: 'income', category: 'Other', amount: 5000, transactionDate: '2025-01-01' }),
    ];
    const alerts = checkBudgetAlerts(limits, txs, '2025-01');
    expect(alerts).toHaveLength(0);
  });
});
