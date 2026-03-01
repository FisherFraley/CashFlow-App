import type { BudgetItem } from '../types';

export interface SankeyData {
  nodes: { label: string; color: string }[];
  links: { source: number; target: number; value: number; color: string }[];
}

const COLORS = {
  income: 'rgba(5, 150, 105, 0.45)',
  incomeNode: '#059669',
  tax: 'rgba(220, 38, 38, 0.4)',
  taxNode: '#DC2626',
  expense: 'rgba(220, 38, 38, 0.3)',
  expenseNode: '#DC2626',
  savings: 'rgba(217, 119, 6, 0.35)',
  savingsNode: '#D97706',
  oneTime: 'rgba(37, 99, 235, 0.35)',
  oneTimeNode: '#2563EB',
  hub: '#D97706',
  unallocated: 'rgba(168, 162, 158, 0.35)',
  unallocatedNode: '#A8A29E',
};

export function buildSankeyData(items: BudgetItem[]): SankeyData | null {
  const incomes = items.filter((i) => i.type === 'income');
  const expenses = items.filter((i) => i.type === 'expense');
  const savings = items.filter((i) => i.type === 'savings');
  const oneTime = items.filter((i) => i.type === 'oneTime');

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  if (totalIncome === 0) return null;

  const nodes: { label: string; color: string }[] = [];
  const links: { source: number; target: number; value: number; color: string }[] = [];

  const nodeIndex = (label: string, color: string): number => {
    const existing = nodes.findIndex((n) => n.label === label);
    if (existing !== -1) return existing;
    nodes.push({ label, color });
    return nodes.length - 1;
  };

  // Hub nodes
  const grossIdx = nodeIndex('Gross Income', COLORS.hub);
  const takeHomeIdx = nodeIndex('Take-Home Pay', COLORS.hub);

  // Income sources → Gross Income
  const incomeBySource = groupByCategory(incomes);
  for (const [source, amount] of incomeBySource) {
    const srcIdx = nodeIndex(source, COLORS.incomeNode);
    links.push({ source: srcIdx, target: grossIdx, value: amount, color: COLORS.income });
  }

  // Check if there are tax-related items (income items with "tax" in category)
  // For simplicity, we treat all income as flowing to take-home (user can add a "Taxes" expense)
  const taxExpenses = expenses.filter((i) => i.category.toLowerCase().includes('tax'));
  const nonTaxExpenses = expenses.filter((i) => !i.category.toLowerCase().includes('tax'));
  const totalTax = taxExpenses.reduce((s, i) => s + i.amount, 0);

  if (totalTax > 0) {
    const taxIdx = nodeIndex('Taxes', COLORS.taxNode);
    links.push({ source: grossIdx, target: taxIdx, value: Math.min(totalTax, totalIncome), color: COLORS.tax });
  }

  const takeHome = Math.max(totalIncome - totalTax, 0);
  if (takeHome > 0) {
    links.push({ source: grossIdx, target: takeHomeIdx, value: takeHome, color: COLORS.income });
  }

  // Take-Home → Expense categories
  const expenseByCategory = groupByCategory(nonTaxExpenses);
  for (const [cat, amount] of expenseByCategory) {
    const catIdx = nodeIndex(cat, COLORS.expenseNode);
    links.push({ source: takeHomeIdx, target: catIdx, value: amount, color: COLORS.expense });
  }

  // Take-Home → Savings categories
  const savingsByCategory = groupByCategory(savings);
  for (const [cat, amount] of savingsByCategory) {
    const catIdx = nodeIndex(cat, COLORS.savingsNode);
    links.push({ source: takeHomeIdx, target: catIdx, value: amount, color: COLORS.savings });
  }

  // Take-Home → One-time categories
  const oneTimeByCategory = groupByCategory(oneTime);
  for (const [cat, amount] of oneTimeByCategory) {
    const catIdx = nodeIndex(cat + ' (one-time)', COLORS.oneTimeNode);
    links.push({ source: takeHomeIdx, target: catIdx, value: amount, color: COLORS.oneTime });
  }

  // Unallocated remainder
  const totalAllocated =
    nonTaxExpenses.reduce((s, i) => s + i.amount, 0) +
    savings.reduce((s, i) => s + i.amount, 0) +
    oneTime.reduce((s, i) => s + i.amount, 0);

  const unallocated = takeHome - totalAllocated;
  if (unallocated > 0.01) {
    const unIdx = nodeIndex('Unallocated', COLORS.unallocatedNode);
    links.push({ source: takeHomeIdx, target: unIdx, value: unallocated, color: COLORS.unallocated });
  }

  // Handle deficit: if allocated > take-home, add a deficit node
  if (unallocated < -0.01) {
    const defIdx = nodeIndex('Over Budget', COLORS.taxNode);
    links.push({ source: defIdx, target: takeHomeIdx, value: Math.abs(unallocated), color: COLORS.tax });
  }

  return { nodes, links };
}

function groupByCategory(items: BudgetItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.category, (map.get(item.category) ?? 0) + item.amount);
  }
  return map;
}
