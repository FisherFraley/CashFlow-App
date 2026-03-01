import { v4 as uuidv4 } from 'uuid';
import type { BudgetItem } from '../types';

const now = new Date().toISOString();

function item(overrides: Partial<BudgetItem> & Pick<BudgetItem, 'type' | 'name' | 'amount' | 'category' | 'frequency' | 'rawAmount'>): BudgetItem {
  return {
    id: uuidv4(),
    notes: undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const SAMPLE_ITEMS: BudgetItem[] = [
  // Income
  item({ type: 'income', name: 'Salary (Post-Tax)', rawAmount: 5000, amount: 5000, category: 'Employment', frequency: 'monthly' }),
  item({ type: 'income', name: 'Freelance Side Gig', rawAmount: 500, amount: 500, category: 'Freelance', frequency: 'monthly' }),

  // Expenses
  item({ type: 'expense', name: 'Rent', rawAmount: 1500, amount: 1500, category: 'Housing', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Utilities', rawAmount: 120, amount: 120, category: 'Utilities', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Groceries', rawAmount: 400, amount: 400, category: 'Groceries', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Car Insurance', rawAmount: 150, amount: 150, category: 'Insurance', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Gas', rawAmount: 120, amount: 120, category: 'Transportation', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Spotify + Netflix', rawAmount: 30, amount: 30, category: 'Subscriptions', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Student Loan Payment', rawAmount: 350, amount: 350, category: 'Student Loans', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Dining Out', rawAmount: 200, amount: 200, category: 'Dining', frequency: 'monthly' }),
  item({ type: 'expense', name: 'Phone Bill', rawAmount: 60, amount: 60, category: 'Utilities', frequency: 'monthly' }),

  // Savings
  item({ type: 'savings', name: 'Emergency Fund', rawAmount: 400, amount: 400, category: 'Emergency Fund', frequency: 'monthly' }),
  item({ type: 'savings', name: '401k Contribution', rawAmount: 300, amount: 300, category: 'Retirement (401k/IRA)', frequency: 'monthly' }),
  item({ type: 'savings', name: 'Vacation Fund', rawAmount: 150, amount: 150, category: 'Travel', frequency: 'monthly' }),

  // One-time purchases (amortized)
  item({ type: 'oneTime', name: 'Couch', rawAmount: 1200, amount: 100, category: 'Furniture', frequency: 'once' }),
  item({ type: 'oneTime', name: 'Work Laptop Bag', rawAmount: 180, amount: 15, category: 'Work Wardrobe', frequency: 'once' }),
];
