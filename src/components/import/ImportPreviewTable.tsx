import { formatCurrency } from '../../utils/formatCurrency';
import type { Transaction } from '../../types';
import styles from './CsvImportModal.module.css';

interface ImportPreviewTableProps {
  transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[];
  duplicates: Set<number>;
  selected: Set<number>;
  onToggle: (index: number) => void;
  onToggleAll: () => void;
}

export function ImportPreviewTable({
  transactions,
  duplicates,
  selected,
  onToggle,
  onToggleAll,
}: ImportPreviewTableProps) {
  const allSelected = transactions.length > 0 && selected.size === transactions.length;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkCol}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
              />
            </th>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th className={styles.amountCol}>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => {
            const isDuplicate = duplicates.has(i);
            return (
              <tr
                key={i}
                className={`${isDuplicate ? styles.duplicateRow : ''} ${!selected.has(i) ? styles.unselectedRow : ''}`}
              >
                <td className={styles.checkCol}>
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => onToggle(i)}
                  />
                </td>
                <td className={styles.dateCol}>{tx.transactionDate}</td>
                <td className={styles.descCol}>{tx.description}</td>
                <td className={styles.catCol}>{tx.category}</td>
                <td
                  className={styles.amountCol}
                  style={{ color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}
                >
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td>
                  {isDuplicate && (
                    <span className={styles.dupeBadge}>Duplicate</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
