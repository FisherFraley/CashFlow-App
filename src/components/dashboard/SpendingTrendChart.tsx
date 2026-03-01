import Plot from 'react-plotly.js';
import { useTheme } from '../../context/ThemeContext';
import type { MonthlyTrendPoint } from '../../utils/analyticsTransform';
import styles from './AnalyticsView.module.css';

interface SpendingTrendChartProps {
  data: MonthlyTrendPoint[];
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#FAFAF9' : '#292524';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(120,90,60,0.08)';
  const incomeColor = theme === 'dark' ? '#34D399' : '#059669';
  const expenseColor = theme === 'dark' ? '#F87171' : '#DC2626';

  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartTitle}>Income vs Expenses</h4>
      <Plot
        data={[
          {
            type: 'bar',
            name: 'Income',
            x: data.map((d) => d.monthLabel),
            y: data.map((d) => d.income),
            marker: { color: incomeColor, opacity: 0.85 },
            hovertemplate: '<b>%{x}</b><br>Income: $%{y:,.2f}<extra></extra>',
          },
          {
            type: 'bar',
            name: 'Expenses',
            x: data.map((d) => d.monthLabel),
            y: data.map((d) => d.expenses),
            marker: { color: expenseColor, opacity: 0.85 },
            hovertemplate: '<b>%{x}</b><br>Expenses: $%{y:,.2f}<extra></extra>',
          },
        ]}
        layout={{
          barmode: 'group',
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 11,
            color: textColor,
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          margin: { l: 50, r: 16, t: 8, b: 40 },
          autosize: true,
          height: 280,
          xaxis: { gridcolor: gridColor, tickfont: { size: 10 } },
          yaxis: {
            gridcolor: gridColor,
            tickprefix: '$',
            tickfont: { size: 10 },
          },
          legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: 1.02,
            xanchor: 'right',
            x: 1,
            font: { size: 11 },
          },
          bargap: 0.25,
          bargroupgap: 0.1,
        }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%' }}
      />
    </div>
  );
}
