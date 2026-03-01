import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Transaction, TransactionState } from '../types';

const STORAGE_KEY = 'cashflow-transactions-v1';

const defaultState: TransactionState = {
  version: 1,
  transactions: [],
};

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByMonth: (yearMonth: string) => Transaction[];
  getTransactionsByCategory: (category: string) => Transaction[];
  getTransactionsByDateRange: (start: string, end: string) => Transaction[];
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<TransactionState>(STORAGE_KEY, defaultState);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...tx,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, transactions: [...prev.transactions, newTx] }));
  }, [setState]);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx
      ),
    }));
  }, [setState]);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  }, [setState]);

  const getTransactionsByMonth = useCallback((yearMonth: string) => {
    return state.transactions.filter((tx) => tx.transactionDate.startsWith(yearMonth));
  }, [state.transactions]);

  const getTransactionsByCategory = useCallback((category: string) => {
    return state.transactions.filter((tx) => tx.category === category);
  }, [state.transactions]);

  const getTransactionsByDateRange = useCallback((start: string, end: string) => {
    return state.transactions.filter((tx) => tx.transactionDate >= start && tx.transactionDate <= end);
  }, [state.transactions]);

  return (
    <TransactionContext.Provider value={{
      transactions: state.transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransactionsByMonth,
      getTransactionsByCategory,
      getTransactionsByDateRange,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within a TransactionProvider');
  return ctx;
}
