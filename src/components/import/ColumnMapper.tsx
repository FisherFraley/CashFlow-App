import type { CsvColumnMapping } from '../../types';
import styles from './CsvImportModal.module.css';

interface ColumnMapperProps {
  headers: string[];
  mapping: CsvColumnMapping;
  onChange: (mapping: CsvColumnMapping) => void;
}

export function ColumnMapper({ headers, mapping, onChange }: ColumnMapperProps) {
  const options = headers.map((h, i) => (
    <option key={i} value={i}>{h} (col {i + 1})</option>
  ));

  return (
    <div className={styles.mapper}>
      <h4 className={styles.stepTitle}>Map your columns</h4>
      <p className={styles.stepDesc}>We auto-detected the columns below. Adjust if needed.</p>

      <div className={styles.mapperGrid}>
        <div className={styles.mapperField}>
          <label className={styles.mapperLabel}>Date</label>
          <select
            className={styles.mapperSelect}
            value={mapping.date}
            onChange={(e) => onChange({ ...mapping, date: parseInt(e.target.value) })}
          >
            {options}
          </select>
        </div>

        <div className={styles.mapperField}>
          <label className={styles.mapperLabel}>Description</label>
          <select
            className={styles.mapperSelect}
            value={mapping.description}
            onChange={(e) => onChange({ ...mapping, description: parseInt(e.target.value) })}
          >
            {options}
          </select>
        </div>

        <div className={styles.mapperField}>
          <label className={styles.mapperLabel}>Amount</label>
          <select
            className={styles.mapperSelect}
            value={mapping.amount}
            onChange={(e) => onChange({ ...mapping, amount: parseInt(e.target.value) })}
          >
            {options}
          </select>
        </div>

        <div className={styles.mapperField}>
          <label className={styles.mapperLabel}>Category (optional)</label>
          <select
            className={styles.mapperSelect}
            value={mapping.category ?? -1}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onChange({ ...mapping, category: val === -1 ? undefined : val });
            }}
          >
            <option value={-1}>Auto-detect</option>
            {options}
          </select>
        </div>
      </div>
    </div>
  );
}
