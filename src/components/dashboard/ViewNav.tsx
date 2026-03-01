import { BarChart3, PieChart } from 'lucide-react';
import styles from './ViewNav.module.css';

export type ViewMode = 'cashflow' | 'breakdown';

interface ViewNavProps {
  active: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewNav({ active, onChange }: ViewNavProps) {
  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.tab} ${active === 'cashflow' ? styles.active : ''}`}
        onClick={() => onChange('cashflow')}
      >
        <BarChart3 size={16} />
        Cash Flow
      </button>
      <button
        className={`${styles.tab} ${active === 'breakdown' ? styles.active : ''}`}
        onClick={() => onChange('breakdown')}
      >
        <PieChart size={16} />
        Monthly Breakdown
      </button>
    </nav>
  );
}
