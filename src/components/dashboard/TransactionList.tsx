import { useState, useMemo } from 'react';
import { Plus, Receipt, Search } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getRelativeDateLabel, formatDateShort, getCurrentMonthKey, getLastNMonths, formatMonthLabel } from '../../utils/dateUtils';
import { getMonthTotal, getMonthIncome, getMonthNet } from '../../utils/transactionCalculations';
import { TransactionForm } from '../forms/TransactionForm';
import { Modal } from '../shared/Modal';
import { EmptyState } from '../shared/EmptyState';
import { Button } from '../shared/Button';
import type { Transaction } from '../../types';
import styles from './TransactionList.module.css';

interface GroupedTransactions {
  label: string;
  transactions: Transaction[];
}

function groupTransactionsByDate(transactions: Transaction[]): GroupedTransactions[] {
  const sorted = [...transactions].sort(
    (a, b) => b.transactionDate.localeCompare(a.transactionDate) || b.createdAt.localeCompare(a.createdAt)
  );

  const groups = new Map<string, Transaction[]>();
  for (const tx of sorted) {
    const label = getRelativeDateLabel(tx.transactionDate);
    const list = groups.get(label) ?? [];
    list.push(tx);
    groups.set(label, list);
  }

  return Array.from(groups.entries()).map(([label, transactions]) => ({
    label,
    transactions,
  }));
}

export function TransactionList() {
  const { transactions, deleteTransaction, addTransaction } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [searchQuery, setSearchQuery] = useState('');

  const months = useMemo(() => getLastNMonths(12), []);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((tx) =>
      tx.transactionDate.startsWith(selectedMonth)
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [transactions, selectedMonth, searchQuery]);

  const grouped = useMemo(() => groupTransactionsByDate(filteredTransactions), [filteredTransactions]);

  const monthExpenses = getMonthTotal(transactions, selectedMonth);
  const monthIncome = getMonthIncome(transactions, selectedMonth);
  const monthNet = getMonthNet(transactions, selectedMonth);

  const handleAdd = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTransaction(data);
    setShowForm(false);
  };

  if (transactions.length === 0 && !showForm) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          icon={<Receipt size={48} />}
          message="No transactions yet. Add your first transaction to start tracking your spending."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Transaction
            </Button>
          }
        />
        <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Transaction">
          <TransactionForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </Modal>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Month selector and controls */}
      <div className={styles.toolbar}>
        <select
          className={styles.monthSelect}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
        </select>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Monthly summary strip */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Income</span>
          <span className={styles.summaryValue} style={{ color: 'var(--color-income)' }}>
            {formatCurrency(monthIncome)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Spent</span>
          <span className={styles.summaryValue} style={{ color: 'var(--color-expense)' }}>
            {formatCurrency(monthExpenses)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Net</span>
          <span
            className={styles.summaryValue}
            style={{ color: monthNet >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}
          >
            {monthNet >= 0 ? '+' : ''}{formatCurrency(monthNet)}
          </span>
        </div>
      </div>

      {/* Grouped transaction list */}
      {filteredTransactions.length === 0 ? (
        <div className={styles.noResults}>
          <p>No transactions found for this period.</p>
        </div>
      ) : (
        <div className={styles.groups}>
          {grouped.map(({ label, transactions: txs }) => (
            <div key={label} className={styles.group}>
              <h4 className={styles.groupLabel}>{label}</h4>
              <div className={styles.txList}>
                {txs.map((tx) => (
                  <div key={tx.id} className={styles.txRow}>
                    <div className={styles.txLeft}>
                      <span className={styles.txDesc}>{tx.description}</span>
                      <span className={styles.txCategory}>{tx.category}</span>
                    </div>
                    <div className={styles.txRight}>
                      <span
                        className={styles.txAmount}
                        style={{ color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <span className={styles.txDate}>{formatDateShort(tx.transactionDate)}</span>
                    </div>
                    <button
                      className={styles.txDelete}
                      onClick={() => deleteTransaction(tx.id)}
                      aria-label="Delete transaction"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingTx(null); }} title={editingTx ? 'Edit Transaction' : 'Add Transaction'}>
        <TransactionForm
          existingTransaction={editingTx ?? undefined}
          onSubmit={handleAdd}
          onCancel={() => { setShowForm(false); setEditingTx(null); }}
        />
      </Modal>
    </div>
  );
}
