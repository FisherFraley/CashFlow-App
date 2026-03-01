import type { BudgetItem, Summary } from '../types';

export function calculateSummary(items: BudgetItem[]): Summary {
  const totalGrossIncome = items
    .filter((i) => i.type === 'income')
    .reduce((s, i) => s + i.amount, 0);

  const totalExpenses = items
    .filter((i) => i.type === 'expense')
    .reduce((s, i) => s + i.amount, 0);

  const taxExpenses = items
    .filter((i) => i.type === 'expense' && i.category.toLowerCase().includes('tax'))
    .reduce((s, i) => s + i.amount, 0);

  const totalTaxes = taxExpenses;
  const totalNetIncome = totalGrossIncome - totalTaxes;

  const totalSavings = items
    .filter((i) => i.type === 'savings')
    .reduce((s, i) => s + i.amount, 0);

  const totalOneTime = items
    .filter((i) => i.type === 'oneTime')
    .reduce((s, i) => s + i.amount, 0);

  const totalAllocated = totalExpenses + totalSavings + totalOneTime;
  const netCashFlow = totalGrossIncome - totalAllocated;
  const savingsRate = totalNetIncome > 0 ? (totalSavings / totalNetIncome) * 100 : 0;

  return {
    totalGrossIncome,
    totalTaxes,
    totalNetIncome,
    totalExpenses,
    totalSavings,
    totalOneTime,
    totalAllocated,
    netCashFlow,
    savingsRate,
  };
}
