import { useState } from 'react';
import { SummaryCards } from './SummaryCards';
import { SankeyChart } from './SankeyChart';
import { MonthlyBreakdown } from './MonthlyBreakdown';
import { ViewNav, type ViewMode } from './ViewNav';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [view, setView] = useState<ViewMode>('cashflow');

  return (
    <div className={styles.dashboard}>
      <SummaryCards />
      <ViewNav active={view} onChange={setView} />
      {view === 'cashflow' ? <SankeyChart /> : <MonthlyBreakdown />}
    </div>
  );
}
