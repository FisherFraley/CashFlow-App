import { useMemo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { useTransactions } from '../../context/TransactionContext';
import { checkBudgetAlerts } from '../../utils/alertEngine';
import { getCurrentMonthKey } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './AlertBanner.module.css';

export function AlertBanner() {
  const { settings } = useBudget();
  const { transactions } = useTransactions();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const currentMonth = getCurrentMonthKey();
  const alerts = useMemo(
    () => checkBudgetAlerts(settings.budgetLimits, transactions, currentMonth),
    [settings.budgetLimits, transactions, currentMonth]
  );

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.category + a.type));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className={styles.container}>
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`${styles.banner} ${alert.type === 'exceeded' ? styles.exceeded : styles.warning}`}
        >
          <AlertTriangle size={16} />
          <span className={styles.text}>
            <strong>{alert.category}</strong>:{' '}
            {alert.type === 'exceeded'
              ? `Over budget! ${formatCurrency(alert.currentSpend)} spent of ${formatCurrency(alert.budgetLimit)} limit.`
              : `Approaching limit \u2014 ${formatCurrency(alert.currentSpend)} of ${formatCurrency(alert.budgetLimit)} used.`}
          </span>
          <button
            className={styles.dismiss}
            onClick={() => setDismissed((prev) => new Set(prev).add(alert.category + alert.type))}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
