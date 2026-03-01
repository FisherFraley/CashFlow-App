import type { Transaction, BudgetItem, BudgetComparison } from '../types';
import { toMonthly } from './formatCurrency';

/**
 * Get monthly income and expense totals grouped by YYYY-MM.
 */
export function getMonthlyTotals(
  transactions: Transaction[]
): Map<string, { income: number; expenses: number }> {
  const map = new Map<string, { income: number; expenses: number }>();

  for (const tx of transactions) {
    const key = tx.transactionDate.slice(0, 7); // YYYY-MM
    const entry = map.get(key) ?? { income: 0, expenses: 0 };
    if (tx.type === 'income') {
      entry.income += tx.amount;
    } else {
      entry.expenses += tx.amount;
    }
    map.set(key, entry);
  }

  return map;
}

/**
 * Get spending totals grouped by category, optionally filtered to a single month.
 */
export function getCategoryTotals(
  transactions: Transaction[],
  month?: string
): Map<string, number> {
  const map = new Map<string, number>();
  const filtered = month
    ? transactions.filter((tx) => tx.transactionDate.startsWith(month))
    : transactions;

  for (const tx of filtered) {
    if (tx.type === 'expense') {
      const current = map.get(tx.category) ?? 0;
      map.set(tx.category, current + tx.amount);
    }
  }

  return map;
}

/**
 * Compare budgeted amounts against actual spending for a given month.
 * Budget items are converted to monthly equivalents for fair comparison.
 */
export function getBudgetComparison(
  budgetItems: BudgetItem[],
  transactions: Transaction[],
  month: string
): BudgetComparison[] {
  // Get actual spending per category for the month
  const actuals = getCategoryTotals(transactions, month);

  // Get budgeted amounts per category (only expenses)
  const budgetedMap = new Map<string, number>();
  for (const item of budgetItems) {
    if (item.type === 'expense') {
      const monthlyAmount = toMonthly(item.rawAmount, item.frequency);
      const current = budgetedMap.get(item.category) ?? 0;
      budgetedMap.set(item.category, current + monthlyAmount);
    }
  }

  // Merge all category keys from both budgeted and actual
  const allCategories = new Set([...budgetedMap.keys(), ...actuals.keys()]);

  const comparisons: BudgetComparison[] = [];
  for (const category of allCategories) {
    const budgeted = budgetedMap.get(category) ?? 0;
    const actual = actuals.get(category) ?? 0;
    const difference = budgeted - actual;
    const percentUsed = budgeted > 0 ? (actual / budgeted) * 100 : actual > 0 ? Infinity : 0;

    comparisons.push({
      category,
      budgeted,
      actual,
      difference,
      percentUsed,
    });
  }

  // Sort by highest % used first, with unbudgeted categories at top
  return comparisons.sort((a, b) => {
    if (a.percentUsed === Infinity && b.percentUsed !== Infinity) return -1;
    if (b.percentUsed === Infinity && a.percentUsed !== Infinity) return 1;
    return b.percentUsed - a.percentUsed;
  });
}

/**
 * Get the total spending for a specific month.
 */
export function getMonthTotal(transactions: Transaction[], month: string): number {
  return transactions
    .filter((tx) => tx.type === 'expense' && tx.transactionDate.startsWith(month))
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get income total for a specific month.
 */
export function getMonthIncome(transactions: Transaction[], month: string): number {
  return transactions
    .filter((tx) => tx.type === 'income' && tx.transactionDate.startsWith(month))
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get the net (income - expenses) for a specific month.
 */
export function getMonthNet(transactions: Transaction[], month: string): number {
  return getMonthIncome(transactions, month) - getMonthTotal(transactions, month);
}
