import { describe, it, expect } from 'vitest';
import { buildSankeyData } from './sankeyTransform';
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

describe('buildSankeyData', () => {
  it('returns null when no income items exist', () => {
    const items = [makeItem({ type: 'expense', amount: 500 })];
    expect(buildSankeyData(items)).toBeNull();
  });

  it('returns null for empty items', () => {
    expect(buildSankeyData([])).toBeNull();
  });

  it('creates nodes for income sources and hub', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
    ];
    const data = buildSankeyData(items)!;
    expect(data.nodes.some(n => n.label === 'Employment')).toBe(true);
    expect(data.nodes.some(n => n.label === 'Gross Income')).toBe(true);
    expect(data.nodes.some(n => n.label === 'Take-Home Pay')).toBe(true);
  });

  it('creates income → Gross Income links', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
    ];
    const data = buildSankeyData(items)!;
    const grossIdx = data.nodes.findIndex(n => n.label === 'Gross Income');
    const empIdx = data.nodes.findIndex(n => n.label === 'Employment');
    const link = data.links.find(l => l.source === empIdx && l.target === grossIdx);
    expect(link).toBeDefined();
    expect(link!.value).toBe(5000);
  });

  it('creates expense category nodes from Take-Home', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
      makeItem({ type: 'expense', amount: 1500, category: 'Housing' }),
      makeItem({ type: 'expense', amount: 400, category: 'Groceries' }),
    ];
    const data = buildSankeyData(items)!;
    expect(data.nodes.some(n => n.label === 'Housing')).toBe(true);
    expect(data.nodes.some(n => n.label === 'Groceries')).toBe(true);
  });

  it('creates savings category nodes', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
      makeItem({ type: 'savings', amount: 500, category: 'Emergency Fund' }),
    ];
    const data = buildSankeyData(items)!;
    expect(data.nodes.some(n => n.label === 'Emergency Fund')).toBe(true);
  });

  it('creates one-time category nodes with suffix', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
      makeItem({ type: 'oneTime', amount: 200, category: 'Furniture' }),
    ];
    const data = buildSankeyData(items)!;
    expect(data.nodes.some(n => n.label === 'Furniture (one-time)')).toBe(true);
  });

  it('creates Unallocated node when income exceeds allocations', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
      makeItem({ type: 'expense', amount: 1000, category: 'Housing' }),
    ];
    const data = buildSankeyData(items)!;
    expect(data.nodes.some(n => n.label === 'Unallocated')).toBe(true);
    const unIdx = data.nodes.findIndex(n => n.label === 'Unallocated');
    const unLink = data.links.find(l => l.target === unIdx);
    expect(unLink!.value).toBe(4000);
  });

  it('creates Over Budget node when expenses exceed income', () => {
    const items = [
      makeItem({ type: 'income', amount: 1000, category: 'Employment' }),
      makeItem({ type: 'expense', amount: 2000, category: 'Housing' }),
    ];
    const data = buildSankeyData(items)!;
    expect(data.nodes.some(n => n.label === 'Over Budget')).toBe(true);
  });

  it('separates tax expenses from regular expenses', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
      makeItem({ type: 'expense', amount: 1000, category: 'Federal Tax' }),
      makeItem({ type: 'expense', amount: 500, category: 'Housing' }),
    ];
    const data = buildSankeyData(items)!;
    expect(data.nodes.some(n => n.label === 'Taxes')).toBe(true);
    const taxIdx = data.nodes.findIndex(n => n.label === 'Taxes');
    const taxLink = data.links.find(l => l.target === taxIdx);
    expect(taxLink!.value).toBe(1000);
  });

  it('groups multiple items in same category', () => {
    const items = [
      makeItem({ type: 'income', amount: 5000, category: 'Employment' }),
      makeItem({ type: 'expense', amount: 120, category: 'Utilities', name: 'Electric' }),
      makeItem({ type: 'expense', amount: 60, category: 'Utilities', name: 'Phone' }),
    ];
    const data = buildSankeyData(items)!;
    const utilIdx = data.nodes.findIndex(n => n.label === 'Utilities');
    const takeHomeIdx = data.nodes.findIndex(n => n.label === 'Take-Home Pay');
    const link = data.links.find(l => l.source === takeHomeIdx && l.target === utilIdx);
    expect(link!.value).toBe(180);
  });
});
