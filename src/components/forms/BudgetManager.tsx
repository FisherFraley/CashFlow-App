import { BudgetSection } from './BudgetSection';
import styles from './BudgetManager.module.css';

export function BudgetManager() {
  return (
    <div className={styles.manager}>
      <BudgetSection type="income" colorVar="--color-income" />
      <BudgetSection type="expense" colorVar="--color-expense" />
      <BudgetSection type="savings" colorVar="--color-savings" />
      <BudgetSection type="oneTime" colorVar="--color-onetime" />
    </div>
  );
}
