import Plot from 'react-plotly.js';
import { useTheme } from '../../context/ThemeContext';
import type { MonthlyTrendPoint } from '../../utils/analyticsTransform';
import styles from './AnalyticsView.module.css';

interface IncomeExpenseTrendChartProps {
  data: MonthlyTrendPoint[];
}

export function IncomeExpenseTrendChart({ data }: IncomeExpenseTrendChartProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#FAFAF9' : '#292524';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(120,90,60,0.08)';
  const netPositiveColor = theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(5, 150, 105, 0.15)';
  const netLineColor = theme === 'dark' ? '#34D399' : '#059669';

  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartTitle}>Net Cash Flow Trend</h4>
      <Plot
        data={[
          {
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Net Cash Flow',
            x: data.map((d) => d.monthLabel),
            y: data.map((d) => d.net),
            line: { color: netLineColor, width: 2.5, shape: 'spline' },
            marker: { size: 7, color: netLineColor },
            fill: 'tozeroy',
            fillcolor: netPositiveColor,
            hovertemplate: '<b>%{x}</b><br>Net: $%{y:,.2f}<extra></extra>',
          },
        ]}
        layout={{
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
            zeroline: true,
            zerolinecolor: gridColor,
            zerolinewidth: 1,
          },
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%' }}
      />
    </div>
  );
}
