export type BudgetItemType = 'income' | 'expense' | 'savings' | 'oneTime';

export type Frequency = 'monthly' | 'biweekly' | 'weekly' | 'yearly' | 'once';

export interface BudgetItem {
  id: string;
  type: BudgetItemType;
  name: string;
  amount: number;
  category: string;
  frequency: Frequency;
  rawAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetState {
  version: number;
  items: BudgetItem[];
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  monthlyView: boolean;
  budgetLimits: BudgetLimit[];
}

export interface Summary {
  totalGrossIncome: number;
  totalTaxes: number;
  totalNetIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalOneTime: number;
  totalAllocated: number;
  netCashFlow: number;
  savingsRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  text: string;
  timestamp: string;
  parsedItem?: ParsedBudgetItem;
  parsedTransaction?: ParsedTransaction;
  status?: 'pending' | 'confirmed' | 'rejected';
}

export interface ParsedBudgetItem {
  type: BudgetItemType;
  name: string;
  rawAmount: number;
  category: string;
  frequency: Frequency;
  confidence: number;
  action?: 'add' | 'update';
  matchedExistingId?: string;
}

// ─── Transactions ────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  transactionDate: string;
  notes?: string;
  source: 'manual' | 'chat' | 'csv';
  budgetItemId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionState {
  version: number;
  transactions: Transaction[];
}

export interface ParsedTransaction {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  transactionDate: string;
  confidence: number;
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  difference: number;
  percentUsed: number;
}

// ─── Savings Goals ───────────────────────────────────

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsState {
  version: number;
  goals: Goal[];
}

export interface GoalProgress {
  goal: Goal;
  percentComplete: number;
  amountRemaining: number;
  daysRemaining: number | null;
  onTrack: boolean;
  monthlyNeeded: number;
}

// ─── Budget Alerts ───────────────────────────────────

export interface BudgetLimit {
  category: string;
  monthlyLimit: number;
  warningThreshold: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'exceeded';
  category: string;
  budgetLimit: number;
  currentSpend: number;
  month: string;
  acknowledged: boolean;
}

// ─── CSV Import ──────────────────────────────────────

export interface CsvColumnMapping {
  date: number;
  description: number;
  amount: number;
  category?: number;
}
