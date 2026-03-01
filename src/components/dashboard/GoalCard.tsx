import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateGoalProgress } from '../../utils/goalCalculations';
import type { Goal } from '../../types';
import styles from './GoalsView.module.css';

interface GoalCardProps {
  goal: Goal;
  onContribute: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onContribute, onDelete }: GoalCardProps) {
  const progress = calculateGoalProgress(goal);
  const color = goal.color ?? 'var(--color-accent)';

  const handleQuickContribute = () => {
    const amountStr = prompt(`Add contribution to "${goal.name}":`, '100');
    if (amountStr) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        onContribute(goal.id, amount);
      }
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleGroup}>
          <div className={styles.colorDot} style={{ background: color }} />
          <h4 className={styles.cardTitle}>{goal.name}</h4>
        </div>
        <button className={styles.deleteBtn} onClick={() => onDelete(goal.id)} aria-label="Delete goal">
          <Trash2 size={14} />
        </button>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress.percentComplete}%`,
              background: color,
            }}
          />
        </div>
        <div className={styles.progressStats}>
          <span className={styles.progressAmount}>
            {formatCurrency(goal.currentAmount)} <span className={styles.progressOf}>of</span> {formatCurrency(goal.targetAmount)}
          </span>
          <span className={styles.progressPercent} style={{ color }}>
            {Math.round(progress.percentComplete)}%
          </span>
        </div>
      </div>

      <div className={styles.cardDetails}>
        {progress.daysRemaining !== null && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Days left</span>
            <span className={styles.detailValue}>{progress.daysRemaining}</span>
          </div>
        )}
        {progress.amountRemaining > 0 && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Remaining</span>
            <span className={styles.detailValue}>{formatCurrency(progress.amountRemaining)}</span>
          </div>
        )}
        {progress.monthlyNeeded > 0 && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Monthly needed</span>
            <span className={styles.detailValue}>{formatCurrency(progress.monthlyNeeded)}</span>
          </div>
        )}
        {goal.targetDate && !progress.onTrack && progress.amountRemaining > 0 && (
          <div className={styles.offTrack}>Behind schedule</div>
        )}
        {progress.percentComplete >= 100 && (
          <div className={styles.completed}>Goal reached!</div>
        )}
      </div>

      {progress.percentComplete < 100 && (
        <button className={styles.contributeBtn} onClick={handleQuickContribute}>
          <Plus size={14} /> Contribute
        </button>
      )}
    </div>
  );
}
