import { useState } from 'react';
import { Button } from '../shared/Button';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import type { Transaction, TransactionType } from '../../types';
import styles from './TransactionForm.module.css';

interface TransactionFormProps {
  existingTransaction?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export function TransactionForm({ existingTransaction, onSubmit, onCancel }: TransactionFormProps) {
  const [description, setDescription] = useState(existingTransaction?.description ?? '');
  const [amount, setAmount] = useState(existingTransaction?.amount?.toString() ?? '');
  const [type, setType] = useState<TransactionType>(existingTransaction?.type ?? 'expense');
  const [category, setCategory] = useState(existingTransaction?.category ?? 'Other');
  const [transactionDate, setTransactionDate] = useState(
    existingTransaction?.transactionDate ?? new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(existingTransaction?.notes ?? '');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    onSubmit({
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      transactionDate,
      notes: notes.trim() || undefined,
      source: existingTransaction?.source ?? 'manual',
    });
    if (!existingTransaction) {
      setDescription('');
      setAmount('');
      setCategory('Other');
      setNotes('');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Type toggle */}
      <div className={styles.typeToggle}>
        <button
          type="button"
          className={`${styles.typeBtn} ${type === 'expense' ? styles.typeBtnActive : ''}`}
          style={type === 'expense' ? { background: 'var(--color-expense-bg)', color: 'var(--color-expense)' } : undefined}
          onClick={() => { setType('expense'); setCategory('Other'); }}
        >
          Expense
        </button>
        <button
          type="button"
          className={`${styles.typeBtn} ${type === 'income' ? styles.typeBtnActive : ''}`}
          style={type === 'income' ? { background: 'var(--color-income-bg)', color: 'var(--color-income)' } : undefined}
          onClick={() => { setType('income'); setCategory('Other'); }}
        >
          Income
        </button>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <input
            className={styles.input}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Lunch at Chipotle"
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <input
            className={styles.input}
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
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
        <Button type="submit">{existingTransaction ? 'Update' : 'Add Transaction'}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
