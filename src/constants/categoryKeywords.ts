/**
 * Shared category keyword mappings used by both the budget chat parser
 * and the CSV auto-categorizer. Each entry maps a keyword to a category
 * and a transaction type.
 */

export interface CategoryKeyword {
  keyword: string;
  category: string;
  type: 'income' | 'expense' | 'savings' | 'oneTime';
}

export const CATEGORY_KEYWORDS: CategoryKeyword[] = [
  // Expense — Housing
  { type: 'expense', category: 'Housing', keyword: 'rent' },
  { type: 'expense', category: 'Housing', keyword: 'mortgage' },
  // Expense — Utilities
  { type: 'expense', category: 'Utilities', keyword: 'electric' },
  { type: 'expense', category: 'Utilities', keyword: 'water bill' },
  { type: 'expense', category: 'Utilities', keyword: 'internet' },
  { type: 'expense', category: 'Utilities', keyword: 'wifi' },
  { type: 'expense', category: 'Utilities', keyword: 'phone bill' },
  // Expense — Groceries
  { type: 'expense', category: 'Groceries', keyword: 'groceries' },
  { type: 'expense', category: 'Groceries', keyword: 'grocery' },
  { type: 'expense', category: 'Groceries', keyword: 'walmart' },
  { type: 'expense', category: 'Groceries', keyword: 'costco' },
  { type: 'expense', category: 'Groceries', keyword: 'kroger' },
  { type: 'expense', category: 'Groceries', keyword: 'trader joe' },
  { type: 'expense', category: 'Groceries', keyword: 'whole foods' },
  // Expense — Transportation
  { type: 'expense', category: 'Transportation', keyword: 'gas' },
  { type: 'expense', category: 'Transportation', keyword: 'uber' },
  { type: 'expense', category: 'Transportation', keyword: 'lyft' },
  { type: 'expense', category: 'Transportation', keyword: 'parking' },
  { type: 'expense', category: 'Transportation', keyword: 'car payment' },
  { type: 'expense', category: 'Transportation', keyword: 'fuel' },
  // Expense — Insurance
  { type: 'expense', category: 'Insurance', keyword: 'insurance' },
  // Expense — Subscriptions
  { type: 'expense', category: 'Subscriptions', keyword: 'netflix' },
  { type: 'expense', category: 'Subscriptions', keyword: 'spotify' },
  { type: 'expense', category: 'Subscriptions', keyword: 'hulu' },
  { type: 'expense', category: 'Subscriptions', keyword: 'subscription' },
  { type: 'expense', category: 'Subscriptions', keyword: 'youtube premium' },
  { type: 'expense', category: 'Subscriptions', keyword: 'gym' },
  { type: 'expense', category: 'Subscriptions', keyword: 'apple music' },
  { type: 'expense', category: 'Subscriptions', keyword: 'disney+' },
  { type: 'expense', category: 'Subscriptions', keyword: 'hbo' },
  // Expense — Student Loans
  { type: 'expense', category: 'Student Loans', keyword: 'student loan' },
  { type: 'expense', category: 'Student Loans', keyword: 'loan payment' },
  // Expense — Dining
  { type: 'expense', category: 'Dining', keyword: 'restaurant' },
  { type: 'expense', category: 'Dining', keyword: 'dinner' },
  { type: 'expense', category: 'Dining', keyword: 'lunch' },
  { type: 'expense', category: 'Dining', keyword: 'coffee' },
  { type: 'expense', category: 'Dining', keyword: 'food' },
  { type: 'expense', category: 'Dining', keyword: 'eating out' },
  { type: 'expense', category: 'Dining', keyword: 'takeout' },
  { type: 'expense', category: 'Dining', keyword: 'starbucks' },
  { type: 'expense', category: 'Dining', keyword: 'chipotle' },
  { type: 'expense', category: 'Dining', keyword: 'doordash' },
  { type: 'expense', category: 'Dining', keyword: 'ubereats' },
  { type: 'expense', category: 'Dining', keyword: 'grubhub' },
  // Expense — Entertainment
  { type: 'expense', category: 'Entertainment', keyword: 'movie' },
  { type: 'expense', category: 'Entertainment', keyword: 'concert' },
  { type: 'expense', category: 'Entertainment', keyword: 'game' },
  { type: 'expense', category: 'Entertainment', keyword: 'tickets' },
  // Expense — Personal Care
  { type: 'expense', category: 'Personal Care', keyword: 'haircut' },
  { type: 'expense', category: 'Personal Care', keyword: 'salon' },
  // Expense — Health
  { type: 'expense', category: 'Health', keyword: 'doctor' },
  { type: 'expense', category: 'Health', keyword: 'pharmacy' },
  { type: 'expense', category: 'Health', keyword: 'medical' },
  { type: 'expense', category: 'Health', keyword: 'prescription' },
  // One-Time
  { type: 'oneTime', category: 'Work Wardrobe', keyword: 'suit' },
  { type: 'oneTime', category: 'Work Wardrobe', keyword: 'wardrobe' },
  { type: 'oneTime', category: 'Work Wardrobe', keyword: 'clothes' },
  { type: 'oneTime', category: 'Electronics', keyword: 'laptop' },
  { type: 'oneTime', category: 'Electronics', keyword: 'phone' },
  { type: 'oneTime', category: 'Electronics', keyword: 'computer' },
  { type: 'oneTime', category: 'Electronics', keyword: 'monitor' },
  { type: 'oneTime', category: 'Electronics', keyword: 'tablet' },
  { type: 'oneTime', category: 'Furniture', keyword: 'couch' },
  { type: 'oneTime', category: 'Furniture', keyword: 'sofa' },
  { type: 'oneTime', category: 'Furniture', keyword: 'desk' },
  { type: 'oneTime', category: 'Furniture', keyword: 'chair' },
  { type: 'oneTime', category: 'Furniture', keyword: 'bed' },
  { type: 'oneTime', category: 'Furniture', keyword: 'mattress' },
  { type: 'oneTime', category: 'Furniture', keyword: 'table' },
  { type: 'oneTime', category: 'Car', keyword: 'car' },
  { type: 'oneTime', category: 'Moving Costs', keyword: 'moving' },
  { type: 'oneTime', category: 'Security Deposit', keyword: 'security deposit' },
  { type: 'oneTime', category: 'Security Deposit', keyword: 'deposit' },
  // Income
  { type: 'income', category: 'Employment', keyword: 'salary' },
  { type: 'income', category: 'Employment', keyword: 'paycheck' },
  { type: 'income', category: 'Employment', keyword: 'wage' },
  { type: 'income', category: 'Freelance', keyword: 'freelance' },
  { type: 'income', category: 'Side Income', keyword: 'side hustle' },
  { type: 'income', category: 'Side Income', keyword: 'side gig' },
  { type: 'income', category: 'Gifts', keyword: 'gift' },
  // Savings
  { type: 'savings', category: 'Emergency Fund', keyword: 'emergency' },
  { type: 'savings', category: 'Retirement (401k/IRA)', keyword: '401k' },
  { type: 'savings', category: 'Retirement (401k/IRA)', keyword: 'ira' },
  { type: 'savings', category: 'Retirement (401k/IRA)', keyword: 'retirement' },
  { type: 'savings', category: 'Travel', keyword: 'vacation' },
  { type: 'savings', category: 'Travel', keyword: 'travel fund' },
  { type: 'savings', category: 'Investments', keyword: 'invest' },
];

/**
 * Look up a category by matching a text string against keywords.
 * Returns the first matching category and type, or null if no match.
 */
export function matchCategory(text: string): { category: string; type: CategoryKeyword['type'] } | null {
  const lower = text.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    if (lower.includes(entry.keyword)) {
      return { category: entry.category, type: entry.type };
    }
  }
  return null;
}
