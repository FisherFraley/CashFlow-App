import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Goal, GoalsState } from '../types';

const STORAGE_KEY = 'cashflow-goals-v1';

const defaultState: GoalsState = {
  version: 1,
  goals: [],
};

interface GoalsContextValue {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<GoalsState>(STORAGE_KEY, defaultState);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...goal,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
  }, [setState]);

  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
      ),
    }));
  }, [setState]);

  const deleteGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  }, [setState]);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id
          ? { ...g, currentAmount: g.currentAmount + amount, updatedAt: new Date().toISOString() }
          : g
      ),
    }));
  }, [setState]);

  return (
    <GoalsContext.Provider value={{ goals: state.goals, addGoal, updateGoal, deleteGoal, contributeToGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals(): GoalsContextValue {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used within a GoalsProvider');
  return ctx;
}
