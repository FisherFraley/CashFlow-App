import Plot from 'react-plotly.js';
import { useTheme } from '../../context/ThemeContext';
import type { CategoryDistribution } from '../../utils/analyticsTransform';
import styles from './AnalyticsView.module.css';

interface CategoryPieChartProps {
  data: CategoryDistribution[];
  title?: string;
}

const CHART_COLORS = [
  '#D97706', '#059669', '#DC2626', '#2563EB', '#7C3AED',
  '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6',
  '#8B5CF6', '#F472B6', '#FBBF24', '#34D399', '#FCA5A5',
];

export function CategoryPieChart({ data, title = 'Spending by Category' }: CategoryPieChartProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#FAFAF9' : '#292524';

  if (data.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h4 className={styles.chartTitle}>{title}</h4>
        <p className={styles.noData}>No expense data to display.</p>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartTitle}>{title}</h4>
      <Plot
        data={[
          {
            type: 'pie',
            labels: data.map((d) => d.category),
            values: data.map((d) => d.amount),
            hole: 0.45,
            marker: {
              colors: CHART_COLORS.slice(0, data.length),
            },
            textinfo: 'label+percent',
            textposition: 'outside',
            textfont: { size: 10.5, color: textColor },
            hovertemplate: '<b>%{label}</b><br>$%{value:,.2f} (%{percent})<extra></extra>',
            pull: data.map((_, i) => (i === 0 ? 0.03 : 0)),
          } as Plotly.Data,
        ]}
        layout={{
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 11,
            color: textColor,
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          margin: { l: 20, r: 20, t: 8, b: 20 },
          autosize: true,
          height: 280,
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%' }}
      />
    </div>
  );
}
