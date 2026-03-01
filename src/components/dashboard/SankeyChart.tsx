import Plot from 'react-plotly.js';
import { useBudget } from '../../context/BudgetContext';
import { useTheme } from '../../context/ThemeContext';
import { buildSankeyData } from '../../utils/sankeyTransform';
import { EmptyState } from '../shared/EmptyState';
import { BarChart3 } from 'lucide-react';
import styles from './SankeyChart.module.css';

export function SankeyChart() {
  const { items } = useBudget();
  const { theme } = useTheme();
  const sankeyData = buildSankeyData(items);

  if (!sankeyData) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          icon={<BarChart3 size={48} />}
          message="Add your income and expenses in the sidebar or chat to see your cash flow diagram."
        />
      </div>
    );
  }

  const textColor = theme === 'dark' ? '#FAFAF9' : '#292524';
  const bgColor = 'rgba(0,0,0,0)';

  return (
    <div className={styles.chartContainer}>
      <Plot
        data={[
          {
            type: 'sankey',
            orientation: 'h',
            node: {
              pad: 24,
              thickness: 28,
              label: sankeyData.nodes.map((n) => n.label),
              color: sankeyData.nodes.map((n) => n.color),
              hovertemplate: '<b>%{label}</b><br>$%{value:,.2f}<extra></extra>',
              line: { color: 'rgba(0,0,0,0)', width: 0 },
            },
            link: {
              source: sankeyData.links.map((l) => l.source),
              target: sankeyData.links.map((l) => l.target),
              value: sankeyData.links.map((l) => l.value),
              color: sankeyData.links.map((l) => l.color),
              hovertemplate: '<b>%{source.label} → %{target.label}</b><br>$%{value:,.2f}<extra></extra>',
            },
          } as Plotly.Data,
        ]}
        layout={{
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 12.5,
            color: textColor,
          },
          paper_bgcolor: bgColor,
          plot_bgcolor: bgColor,
          margin: { l: 16, r: 16, t: 16, b: 16 },
          autosize: true,
          height: 460,
        }}
        config={{
          responsive: true,
          displayModeBar: false,
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
