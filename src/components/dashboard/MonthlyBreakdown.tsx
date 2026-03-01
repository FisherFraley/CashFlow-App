import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateSummary } from '../../utils/calculations';
import { EmptyState } from '../shared/EmptyState';
import { PieChart } from 'lucide-react';
import type { BudgetItem, BudgetItemType } from '../../types';
import styles from './MonthlyBreakdown.module.css';

interface CategoryGroup {
  category: string;
  items: BudgetItem[];
  total: number;
}

const TYPE_CONFIG: { type: BudgetItemType; label: string; colorVar: string }[] = [
  { type: 'income', label: 'Income', colorVar: '--color-income' },
  { type: 'expense', label: 'Expenses', colorVar: '--color-expense' },
  { type: 'savings', label: 'Savings', colorVar: '--color-savings' },
  { type: 'oneTime', label: 'One-Time', colorVar: '--color-onetime' },
];

function groupByCategory(items: BudgetItem[]): CategoryGroup[] {
  const map = new Map<string, BudgetItem[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return Array.from(map.entries())
    .map(([category, items]) => ({
      category,
      items,
      total: items.reduce((sum, i) => sum + i.amount, 0),
    }))
    .sort((a, b) => b.total - a.total);
}

export function MonthlyBreakdown() {
  const { items } = useBudget();
  const summary = calculateSummary(items);

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          icon={<PieChart size={48} />}
          message="Add budget items to see your monthly spending breakdown by category."
        />
      </div>
    );
  }

  return (
    <div className={styles.breakdown}>
      {TYPE_CONFIG.map(({ type, label, colorVar }) => {
        const typeItems = items.filter((i) => i.type === type);
        if (typeItems.length === 0) return null;

        const groups = groupByCategory(typeItems);
        const typeTotal = typeItems.reduce((s, i) => s + i.amount, 0);
        const maxAmount = type === 'income'
          ? summary.totalGrossIncome
          : summary.totalNetIncome || summary.totalGrossIncome;

        return (
          <section key={type} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle} style={{ color: `var(${colorVar})` }}>
                {label}
              </h3>
              <span className={styles.sectionTotal} style={{ color: `var(${colorVar})` }}>
                {formatCurrency(typeTotal)}/mo
              </span>
            </div>

            <div className={styles.categoryList}>
              {groups.map(({ category, items: catItems, total }) => {
                const pct = maxAmount > 0 ? (total / maxAmount) * 100 : 0;
                return (
                  <div key={category} className={styles.categoryRow}>
                    <div className={styles.categoryInfo}>
                      <span className={styles.categoryName}>{category}</span>
                      <span className={styles.categoryAmount}>{formatCurrency(total)}/mo</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: `var(${colorVar})`,
                        }}
                      />
                    </div>
                    <div className={styles.itemList}>
                      {catItems.map((item) => (
                        <div key={item.id} className={styles.item}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemAmount}>
                            {formatCurrency(item.amount)}/mo
                            {item.frequency !== 'monthly' && (
                              <span className={styles.itemFreq}>
                                ({formatCurrency(item.rawAmount)} {item.frequency})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
