import { useState } from 'react';
import { SummaryCards } from './SummaryCards';
import { SankeyChart } from './SankeyChart';
import { MonthlyBreakdown } from './MonthlyBreakdown';
import { TransactionList } from './TransactionList';
import { BudgetVsActual } from './BudgetVsActual';
import { AnalyticsView } from './AnalyticsView';
import { GoalsView } from './GoalsView';
import { AlertBanner } from './AlertBanner';
import { ViewNav, type ViewMode } from './ViewNav';
import styles from './Dashboard.module.css';

function renderView(view: ViewMode) {
  switch (view) {
    case 'cashflow':
      return <SankeyChart />;
    case 'breakdown':
      return <MonthlyBreakdown />;
    case 'transactions':
      return <TransactionList />;
    case 'budgetVsActual':
      return <BudgetVsActual />;
    case 'analytics':
      return <AnalyticsView />;
    case 'goals':
      return <GoalsView />;
    default:
      return <SankeyChart />;
  }
}

export function Dashboard() {
  const [view, setView] = useState<ViewMode>('cashflow');

  return (
    <div className={styles.dashboard}>
      <AlertBanner />
      <SummaryCards />
      <ViewNav active={view} onChange={setView} />
      {renderView(view)}
    </div>
  );
}
