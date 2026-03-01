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
