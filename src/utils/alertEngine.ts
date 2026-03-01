import { v4 as uuidv4 } from 'uuid';
import type { BudgetLimit, Alert, Transaction } from '../types';

/**
 * Check budget limits against actual spending for a given month.
 * Returns alerts for categories approaching or exceeding limits.
 */
export function checkBudgetAlerts(
  limits: BudgetLimit[],
  transactions: Transaction[],
  month: string
): Alert[] {
  const alerts: Alert[] = [];

  // Sum expenses by category for the month
  const spending = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.transactionDate.startsWith(month)) {
      const current = spending.get(tx.category) ?? 0;
      spending.set(tx.category, current + tx.amount);
    }
  }

  for (const limit of limits) {
    const currentSpend = spending.get(limit.category) ?? 0;
    const percentage = limit.monthlyLimit > 0 ? currentSpend / limit.monthlyLimit : 0;

    if (percentage >= 1) {
      alerts.push({
        id: uuidv4(),
        type: 'exceeded',
        category: limit.category,
        budgetLimit: limit.monthlyLimit,
        currentSpend,
        month,
        acknowledged: false,
      });
    } else if (percentage >= limit.warningThreshold) {
      alerts.push({
        id: uuidv4(),
        type: 'warning',
        category: limit.category,
        budgetLimit: limit.monthlyLimit,
        currentSpend,
        month,
        acknowledged: false,
      });
    }
  }

  return alerts;
}
