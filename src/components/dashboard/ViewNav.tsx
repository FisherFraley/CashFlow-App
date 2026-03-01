import { BarChart3, PieChart, Receipt, Scale, TrendingUp, Target } from 'lucide-react';
import styles from './ViewNav.module.css';

export type ViewMode = 'cashflow' | 'breakdown' | 'transactions' | 'budgetVsActual' | 'analytics' | 'goals';

interface ViewNavProps {
  active: ViewMode;
  onChange: (view: ViewMode) => void;
}

const TABS: { mode: ViewMode; label: string; icon: typeof BarChart3 }[] = [
  { mode: 'cashflow', label: 'Cash Flow', icon: BarChart3 },
  { mode: 'breakdown', label: 'Breakdown', icon: PieChart },
  { mode: 'transactions', label: 'Transactions', icon: Receipt },
  { mode: 'budgetVsActual', label: 'Budget vs Actual', icon: Scale },
  { mode: 'analytics', label: 'Analytics', icon: TrendingUp },
  { mode: 'goals', label: 'Goals', icon: Target },
];

export function ViewNav({ active, onChange }: ViewNavProps) {
  return (
    <nav className={styles.nav}>
      {TABS.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          className={`${styles.tab} ${active === mode ? styles.active : ''}`}
          onClick={() => onChange(mode)}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </nav>
  );
}
