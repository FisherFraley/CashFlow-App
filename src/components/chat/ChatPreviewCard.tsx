import { Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { FREQUENCY_LABELS, TYPE_LABELS } from '../../constants/categories';
import type { ParsedBudgetItem } from '../../types';
import styles from './ChatPreviewCard.module.css';

interface ChatPreviewCardProps {
  item: ParsedBudgetItem;
  status?: 'pending' | 'confirmed' | 'rejected';
  onConfirm: () => void;
  onReject: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  income: 'var(--color-income)',
  expense: 'var(--color-expense)',
  savings: 'var(--color-savings)',
  oneTime: 'var(--color-onetime)',
};

export function ChatPreviewCard({ item, status, onConfirm, onReject }: ChatPreviewCardProps) {
  const isResolved = status === 'confirmed' || status === 'rejected';

  return (
    <div className={`${styles.card} ${isResolved ? styles.resolved : ''}`}>
      <div className={styles.header}>
        <span className={styles.badge} style={{ color: TYPE_COLORS[item.type] }}>
          {TYPE_LABELS[item.type] ?? item.type}
        </span>
        {status === 'confirmed' && <span className={styles.statusBadge} style={{ color: 'var(--color-income)' }}>Added</span>}
        {status === 'rejected' && <span className={styles.statusBadge} style={{ color: 'var(--color-text-secondary)' }}>Cancelled</span>}
      </div>
      <div className={styles.details}>
        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{item.name}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Amount</span>
          <span className={styles.value}>{formatCurrency(item.rawAmount)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Category</span>
          <span className={styles.value}>{item.category}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Frequency</span>
          <span className={styles.value}>{FREQUENCY_LABELS[item.frequency]}</span>
        </div>
      </div>
      {!isResolved && (
        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            <Check size={14} /> Confirm
          </button>
          <button className={styles.rejectBtn} onClick={onReject}>
            <X size={14} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}
