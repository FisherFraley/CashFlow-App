import { describe, it, expect } from 'vitest';
import { calculateGoalProgress } from './goalCalculations';
import type { Goal } from '../types';

function makeGoal(overrides: Partial<Goal>): Goal {
  return {
    id: '1',
    name: 'Test Goal',
    targetAmount: 10000,
    currentAmount: 0,
    category: 'Savings',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateGoalProgress', () => {
  it('returns 0% for a new goal', () => {
    const result = calculateGoalProgress(makeGoal({}));
    expect(result.percentComplete).toBe(0);
    expect(result.amountRemaining).toBe(10000);
  });

  it('calculates correct percentage', () => {
    const result = calculateGoalProgress(makeGoal({ currentAmount: 5000 }));
    expect(result.percentComplete).toBe(50);
    expect(result.amountRemaining).toBe(5000);
  });

  it('caps at 100%', () => {
    const result = calculateGoalProgress(makeGoal({ currentAmount: 15000 }));
    expect(result.percentComplete).toBe(100);
    expect(result.amountRemaining).toBe(0);
  });

  it('calculates days remaining when target date exists', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const targetDate = futureDate.toISOString().slice(0, 10);

    const result = calculateGoalProgress(makeGoal({ targetDate }));
    expect(result.daysRemaining).toBeGreaterThanOrEqual(29);
    expect(result.daysRemaining).toBeLessThanOrEqual(31);
  });

  it('returns null days remaining when no target date', () => {
    const result = calculateGoalProgress(makeGoal({}));
    expect(result.daysRemaining).toBeNull();
  });

  it('calculates monthly needed', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60); // ~2 months
    const targetDate = futureDate.toISOString().slice(0, 10);

    const result = calculateGoalProgress(makeGoal({ targetDate, currentAmount: 0 }));
    expect(result.monthlyNeeded).toBeGreaterThan(0);
    // Roughly 10000 / 2 = 5000 per month
    expect(result.monthlyNeeded).toBeGreaterThan(4000);
    expect(result.monthlyNeeded).toBeLessThan(6000);
  });

  it('handles completed goals', () => {
    const result = calculateGoalProgress(makeGoal({ currentAmount: 10000 }));
    expect(result.percentComplete).toBe(100);
    expect(result.amountRemaining).toBe(0);
    expect(result.monthlyNeeded).toBe(0);
  });

  it('handles zero target amount', () => {
    const result = calculateGoalProgress(makeGoal({ targetAmount: 0 }));
    expect(result.percentComplete).toBe(0);
  });
});
