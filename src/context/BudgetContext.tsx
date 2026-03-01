import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { toMonthly } from '../utils/formatCurrency';
import type { BudgetItem, BudgetItemType, BudgetLimit, BudgetState, Frequency } from '../types';

const STORAGE_KEY = 'cashflow-budget-v1';

const defaultState: BudgetState = {
  version: 2,
  items: [],
  settings: { theme: 'dark', monthlyView: true, budgetLimits: [] },
};

function migrateState(state: BudgetState): BudgetState {
  if (state.version < 2) {
    const existingLimits = 'budgetLimits' in state.settings
      ? (state.settings.budgetLimits as BudgetLimit[])
      : [];
    return {
      ...state,
      version: 2,
      settings: {
        ...state.settings,
        budgetLimits: existingLimits ?? [],
      },
    };
  }
  return state;
}

interface BudgetContextValue {
  items: BudgetItem[];
  settings: BudgetState['settings'];
  budgetLimits: BudgetLimit[];
  addItem: (item: Omit<BudgetItem, 'id' | 'amount' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<Omit<BudgetItem, 'id' | 'amount' | 'createdAt'>>) => void;
  deleteItem: (id: string) => void;
  getItemsByType: (type: BudgetItemType) => BudgetItem[];
  setBudgetLimits: (limits: BudgetLimit[]) => void;
  loadItems: (items: BudgetItem[]) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  clearAll: () => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [rawState, setRawState] = useLocalStorage<BudgetState>(STORAGE_KEY, defaultState);
  const state = migrateState(rawState);
  const setState = setRawState;

  const addItem = useCallback((item: Omit<BudgetItem, 'id' | 'amount' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: BudgetItem = {
      ...item,
      id: uuidv4(),
      amount: toMonthly(item.rawAmount, item.frequency),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  }, [setState]);

  const updateItem = useCallback((id: string, updates: Partial<Omit<BudgetItem, 'id' | 'amount' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates, updatedAt: new Date().toISOString() };
        const rawAmount = updates.rawAmount ?? item.rawAmount;
        const frequency = updates.frequency ?? item.frequency;
        merged.amount = toMonthly(rawAmount, frequency as Frequency);
        return merged;
      }),
    }));
  }, [setState]);

  const deleteItem = useCallback((id: string) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  }, [setState]);

  const getItemsByType = useCallback((type: BudgetItemType) => {
    return state.items.filter((item) => item.type === type);
  }, [state.items]);

  const loadItems = useCallback((items: BudgetItem[]) => {
    setState((prev) => ({ ...prev, items }));
  }, [setState]);

  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as BudgetState;
      if (!parsed.version || !Array.isArray(parsed.items)) return false;
      setState(parsed);
      return true;
    } catch {
      return false;
    }
  }, [setState]);

  const setBudgetLimits = useCallback((limits: BudgetLimit[]) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, budgetLimits: limits } }));
  }, [setState]);

  const clearAll = useCallback(() => {
    setState(defaultState);
  }, [setState]);

  return (
    <BudgetContext.Provider value={{ items: state.items, settings: state.settings, budgetLimits: state.settings.budgetLimits, addItem, updateItem, deleteItem, getItemsByType, setBudgetLimits, loadItems, exportData, importData, clearAll }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within a BudgetProvider');
  return ctx;
}
