import type { Goal, GoalProgress } from '../types';

/**
 * Calculate progress metrics for a savings goal.
 */
export function calculateGoalProgress(goal: Goal): GoalProgress {
  const percentComplete = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  const amountRemaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  // Days remaining until target date
  let daysRemaining: number | null = null;
  if (goal.targetDate) {
    const now = new Date();
    const target = new Date(goal.targetDate + 'T00:00:00');
    const diff = target.getTime() - now.getTime();
    daysRemaining = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }

  // Monthly needed to reach goal by target date
  let monthlyNeeded = 0;
  if (daysRemaining !== null && daysRemaining > 0 && amountRemaining > 0) {
    const monthsRemaining = daysRemaining / 30.44; // avg days per month
    monthlyNeeded = amountRemaining / monthsRemaining;
  }

  // On track: can reach goal by target date if saving at current rate
  // Simple heuristic: if more than 50% of time has passed but less than 50% saved, off track
  let onTrack = true;
  if (goal.targetDate && daysRemaining !== null) {
    const created = new Date(goal.createdAt);
    const target = new Date(goal.targetDate + 'T00:00:00');
    const totalDuration = target.getTime() - created.getTime();
    const elapsed = Date.now() - created.getTime();
    if (totalDuration > 0) {
      const timeProgress = elapsed / totalDuration;
      if (timeProgress > 0 && percentComplete < timeProgress * 100 * 0.8) {
        onTrack = false;
      }
    }
  }

  return {
    goal,
    percentComplete,
    amountRemaining,
    daysRemaining,
    onTrack,
    monthlyNeeded,
  };
}
