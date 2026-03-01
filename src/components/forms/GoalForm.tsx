import { useState } from 'react';
import { Button } from '../shared/Button';
import { SAVINGS_CATEGORIES } from '../../constants/categories';
import type { Goal } from '../../types';
import styles from './TransactionForm.module.css'; // reuse same form styles

interface GoalFormProps {
  existingGoal?: Goal;
  onSubmit: (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

const GOAL_COLORS = [
  { label: 'Amber', value: '#D97706' },
  { label: 'Green', value: '#059669' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Red', value: '#DC2626' },
];

export function GoalForm({ existingGoal, onSubmit, onCancel }: GoalFormProps) {
  const [name, setName] = useState(existingGoal?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(existingGoal?.targetAmount?.toString() ?? '');
  const [currentAmount, setCurrentAmount] = useState(existingGoal?.currentAmount?.toString() ?? '0');
  const [targetDate, setTargetDate] = useState(existingGoal?.targetDate ?? '');
  const [category, setCategory] = useState(existingGoal?.category ?? SAVINGS_CATEGORIES[0]);
  const [color, setColor] = useState(existingGoal?.color ?? GOAL_COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name.trim() || isNaN(target) || target <= 0) return;
    onSubmit({
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate: targetDate || undefined,
      category,
      color,
    });
    if (!existingGoal) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>Goal Name</label>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Emergency Fund, Vacation"
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Target Amount ($)</label>
          <input
            className={styles.input}
            type="number"
            min="1"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="10000"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Already Saved ($)</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Target Date (optional)</label>
          <input
            className={styles.input}
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {SAVINGS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {GOAL_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c.value,
                border: color === c.value ? '3px solid var(--color-text)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              aria-label={c.label}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit">{existingGoal ? 'Update Goal' : 'Create Goal'}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
