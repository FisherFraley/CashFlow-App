import type { Transaction } from '../types';

export interface MonthlyTrendPoint {
  month: string;       // YYYY-MM
  monthLabel: string;  // "Jan 2025"
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryDistribution {
  category: string;
  amount: number;
  percentage: number;
}

export interface IncomeVsExpenseData {
  months: string[];      // month labels
  income: number[];
  expenses: number[];
}

/**
 * Build monthly trend data for the last N months.
 */
export function buildMonthlyTrend(
  transactions: Transaction[],
  monthKeys: string[]
): MonthlyTrendPoint[] {
  return monthKeys.map((month) => {
    const monthTxs = transactions.filter((tx) =>
      tx.transactionDate.startsWith(month)
    );

    const income = monthTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = monthTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Format month label
    const [year, mo] = month.split('-').map(Number);
    const d = new Date(year, mo - 1, 1);
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      month,
      monthLabel,
      income,
      expenses,
      net: income - expenses,
    };
  }).reverse(); // oldest first for charts
}

/**
 * Build category distribution for expense transactions.
 * Optionally filter to a specific month.
 */
export function buildCategoryDistribution(
  transactions: Transaction[],
  month?: string
): CategoryDistribution[] {
  const filtered = transactions.filter((tx) => {
    if (tx.type !== 'expense') return false;
    if (month && !tx.transactionDate.startsWith(month)) return false;
    return true;
  });

  const totals = new Map<string, number>();
  let total = 0;
  for (const tx of filtered) {
    const current = totals.get(tx.category) ?? 0;
    totals.set(tx.category, current + tx.amount);
    total += tx.amount;
  }

  return Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Build income vs expense comparison data for charting.
 */
export function buildIncomeVsExpense(
  transactions: Transaction[],
  monthKeys: string[]
): IncomeVsExpenseData {
  const trend = buildMonthlyTrend(transactions, monthKeys);
  return {
    months: trend.map((t) => t.monthLabel),
    income: trend.map((t) => t.income),
    expenses: trend.map((t) => t.expenses),
  };
}
