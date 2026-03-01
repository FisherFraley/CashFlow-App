import { useState } from 'react';
import { Button } from '../shared/Button';
import { CATEGORY_MAP, FREQUENCY_LABELS } from '../../constants/categories';
import type { BudgetItem, BudgetItemType, Frequency } from '../../types';
import styles from './BudgetItemForm.module.css';

interface BudgetItemFormProps {
  type: BudgetItemType;
  existingItem?: BudgetItem;
  onSubmit: (data: { name: string; rawAmount: number; category: string; frequency: Frequency; notes?: string }) => void;
  onCancel?: () => void;
}

export function BudgetItemForm({ type, existingItem, onSubmit, onCancel }: BudgetItemFormProps) {
  const categories = CATEGORY_MAP[type] ?? [];
  const [name, setName] = useState(existingItem?.name ?? '');
  const [rawAmount, setRawAmount] = useState(existingItem?.rawAmount?.toString() ?? '');
  const [category, setCategory] = useState(existingItem?.category ?? categories[0] ?? '');
  const [customCategory, setCustomCategory] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(existingItem?.frequency ?? (type === 'oneTime' ? 'once' : 'monthly'));
  const [notes, setNotes] = useState(existingItem?.notes ?? '');

  const isCustomCategory = category === 'Other';
  const resolvedCategory = isCustomCategory ? customCategory : category;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rawAmount);
    if (!name.trim() || isNaN(amount) || amount <= 0 || !resolvedCategory.trim()) return;
    onSubmit({
      name: name.trim(),
      rawAmount: amount,
      category: resolvedCategory.trim(),
      frequency,
      notes: notes.trim() || undefined,
    });
    if (!existingItem) {
      setName('');
      setRawAmount('');
      setCategory(categories[0] ?? '');
      setCustomCategory('');
      setNotes('');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rent, Salary"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Amount ($)</label>
          <input
            className={styles.input}
            type="number"
            min="0.01"
            step="0.01"
            value={rawAmount}
            onChange={(e) => setRawAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {isCustomCategory && (
            <input
              className={styles.input}
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Custom category name"
              style={{ marginTop: 8 }}
              required
            />
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Frequency</label>
          <select
            className={styles.select}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Notes (optional)</label>
        <input
          className={styles.input}
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any extra details"
        />
      </div>
      <div className={styles.actions}>
        <Button type="submit">{existingItem ? 'Update' : 'Add'}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
