import { useMemo, useState } from 'react';
import { Scale } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { useTransactions } from '../../context/TransactionContext';
import { getBudgetComparison } from '../../utils/transactionCalculations';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCurrentMonthKey, getLastNMonths, formatMonthLabel } from '../../utils/dateUtils';
import { EmptyState } from '../shared/EmptyState';
import type { BudgetComparison } from '../../types';
import styles from './BudgetVsActual.module.css';

function getStatusColor(percentUsed: number): string {
  if (percentUsed === Infinity) return 'var(--color-text-secondary)';
  if (percentUsed > 100) return 'var(--color-expense)';
  if (percentUsed >= 80) return 'var(--color-warning)';
  return 'var(--color-income)';
}

function getStatusLabel(comparison: BudgetComparison): string {
  if (comparison.budgeted === 0 && comparison.actual > 0) return 'Unbudgeted';
  if (comparison.percentUsed > 100) return 'Over Budget';
  if (comparison.percentUsed >= 80) return 'Near Limit';
  return 'On Track';
}

export function BudgetVsActual() {
  const { items } = useBudget();
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const months = useMemo(() => getLastNMonths(12), []);

  const comparisons = useMemo(
    () => getBudgetComparison(items, transactions, selectedMonth),
    [items, transactions, selectedMonth]
  );

  const expenseItems = items.filter((i) => i.type === 'expense');
  const hasData = expenseItems.length > 0 || transactions.length > 0;

  if (!hasData) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          icon={<Scale size={48} />}
          message="Add budget items and transactions to compare your planned vs. actual spending."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Budget vs. Actual</h3>
        <select
          className={styles.monthSelect}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
        </select>
      </div>

      {comparisons.length === 0 ? (
        <p className={styles.noData}>No expense data for this month.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colCategory}>Category</span>
            <span className={styles.colAmount}>Budgeted</span>
            <span className={styles.colAmount}>Actual</span>
            <span className={styles.colStatus}>Status</span>
          </div>
          {comparisons.map((c) => {
            const color = getStatusColor(c.percentUsed);
            const barPct = c.budgeted > 0 ? Math.min(c.percentUsed, 120) : 0;
            return (
              <div key={c.category} className={styles.tableRow}>
                <div className={styles.rowMain}>
                  <span className={styles.colCategory}>{c.category}</span>
                  <span className={styles.colAmount}>
                    {c.budgeted > 0 ? formatCurrency(c.budgeted) : '\u2014'}
                  </span>
                  <span className={styles.colAmount} style={{ color }}>
                    {formatCurrency(c.actual)}
                  </span>
                  <span className={styles.colStatus} style={{ color }}>
                    {getStatusLabel(c)}
                  </span>
                </div>
                {c.budgeted > 0 && (
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${Math.min(barPct, 100)}%`,
                        background: color,
                      }}
                    />
                    {c.percentUsed > 100 && (
                      <div
                        className={styles.barOverflow}
                        style={{
                          width: `${Math.min(barPct - 100, 20)}%`,
                          left: '100%',
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
