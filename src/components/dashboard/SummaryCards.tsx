import { DollarSign, TrendingDown, PiggyBank, ArrowRightLeft } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { calculateSummary } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './SummaryCards.module.css';

export function SummaryCards() {
  const { items } = useBudget();
  const summary = calculateSummary(items);

  const cards = [
    {
      label: 'Monthly Income',
      value: summary.totalGrossIncome,
      color: 'var(--color-income)',
      bg: 'var(--color-income-bg)',
      icon: <DollarSign size={20} />,
    },
    {
      label: 'Monthly Expenses',
      value: summary.totalExpenses,
      color: 'var(--color-expense)',
      bg: 'var(--color-expense-bg)',
      icon: <TrendingDown size={20} />,
    },
    {
      label: 'Monthly Savings',
      value: summary.totalSavings,
      color: 'var(--color-savings)',
      bg: 'var(--color-savings-bg)',
      icon: <PiggyBank size={20} />,
      subtitle: summary.savingsRate > 0 ? `${summary.savingsRate.toFixed(1)}% savings rate` : undefined,
    },
    {
      label: 'Net Cash Flow',
      value: summary.netCashFlow,
      color: summary.netCashFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
      bg: summary.netCashFlow >= 0 ? 'var(--color-income-bg)' : 'var(--color-expense-bg)',
      icon: <ArrowRightLeft size={20} />,
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <div className={styles.iconWrap} style={{ background: card.bg, color: card.color }}>
            {card.icon}
          </div>
          <div className={styles.content}>
            <span className={styles.label}>{card.label}</span>
            <span className={styles.value} style={{ color: card.color }}>
              {formatCurrency(card.value)}
            </span>
            {card.subtitle && <span className={styles.subtitle}>{card.subtitle}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
