import { Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateShort } from '../../utils/dateUtils';
import type { ParsedTransaction } from '../../types';
import styles from './ChatTransactionPreview.module.css';

interface ChatTransactionPreviewProps {
  transaction: ParsedTransaction;
  status?: 'pending' | 'confirmed' | 'rejected';
  onConfirm: () => void;
  onReject: () => void;
}

export function ChatTransactionPreview({ transaction, status, onConfirm, onReject }: ChatTransactionPreviewProps) {
  const isResolved = status === 'confirmed' || status === 'rejected';

  return (
    <div className={`${styles.card} ${isResolved ? styles.resolved : ''}`}>
      <div className={styles.header}>
        <span
          className={styles.badge}
          style={{ color: transaction.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}
        >
          {transaction.type === 'income' ? 'Income' : 'Expense'}
        </span>
        <span className={styles.dateBadge}>{formatDateShort(transaction.transactionDate)}</span>
        {status === 'confirmed' && (
          <span className={styles.statusBadge} style={{ color: 'var(--color-income)' }}>Logged</span>
        )}
        {status === 'rejected' && (
          <span className={styles.statusBadge} style={{ color: 'var(--color-text-secondary)' }}>Cancelled</span>
        )}
      </div>
      <div className={styles.details}>
        <div className={styles.row}>
          <span className={styles.label}>Description</span>
          <span className={styles.value}>{transaction.description}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Amount</span>
          <span className={styles.value}>{formatCurrency(transaction.amount)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Category</span>
          <span className={styles.value}>{transaction.category}</span>
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
