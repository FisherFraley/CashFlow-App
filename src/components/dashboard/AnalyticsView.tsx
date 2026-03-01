import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { buildMonthlyTrend, buildCategoryDistribution } from '../../utils/analyticsTransform';
import { getLastNMonths, getCurrentMonthKey, formatMonthLabel } from '../../utils/dateUtils';
import { SpendingTrendChart } from './SpendingTrendChart';
import { CategoryPieChart } from './CategoryPieChart';
import { IncomeExpenseTrendChart } from './IncomeExpenseTrendChart';
import { EmptyState } from '../shared/EmptyState';
import styles from './AnalyticsView.module.css';

export function AnalyticsView() {
  const { transactions } = useTransactions();
  const [pieMonth, setPieMonth] = useState(getCurrentMonthKey());

  const monthKeys6 = useMemo(() => getLastNMonths(6), []);
  const monthKeys12 = useMemo(() => getLastNMonths(12), []);

  const trendData = useMemo(() => buildMonthlyTrend(transactions, monthKeys6), [transactions, monthKeys6]);
  const categoryData = useMemo(() => buildCategoryDistribution(transactions, pieMonth), [transactions, pieMonth]);
  const netTrendData = useMemo(() => buildMonthlyTrend(transactions, monthKeys6), [transactions, monthKeys6]);

  if (transactions.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          icon={<TrendingUp size={48} />}
          message="Add transactions to see your spending analytics and trends over time."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.chartGrid}>
        <SpendingTrendChart data={trendData} />
        <div className={styles.pieSection}>
          <div className={styles.pieHeader}>
            <select
              className={styles.monthSelect}
              value={pieMonth}
              onChange={(e) => setPieMonth(e.target.value)}
            >
              {monthKeys12.map((m) => (
                <option key={m} value={m}>{formatMonthLabel(m)}</option>
              ))}
            </select>
          </div>
          <CategoryPieChart data={categoryData} />
        </div>
      </div>
      <IncomeExpenseTrendChart data={netTrendData} />
    </div>
  );
}
