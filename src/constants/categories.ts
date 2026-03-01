export const INCOME_CATEGORIES = [
  'Employment',
  'Side Income',
  'Freelance',
  'Gifts',
  'Other',
];

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Utilities',
  'Groceries',
  'Transportation',
  'Insurance',
  'Subscriptions',
  'Student Loans',
  'Dining',
  'Entertainment',
  'Personal Care',
  'Other',
];

export const SAVINGS_CATEGORIES = [
  'Emergency Fund',
  'Travel',
  'Investments',
  'Retirement (401k/IRA)',
  'Big Purchase',
  'Other',
];

export const ONETIME_CATEGORIES = [
  'Furniture',
  'Car',
  'Moving Costs',
  'Electronics',
  'Work Wardrobe',
  'Security Deposit',
  'Other',
];

export const CATEGORY_MAP: Record<string, string[]> = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
  savings: SAVINGS_CATEGORIES,
  oneTime: ONETIME_CATEGORIES,
};

export const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  once: 'One-time',
};

export const TYPE_LABELS: Record<string, string> = {
  income: 'Income',
  expense: 'Expenses',
  savings: 'Savings',
  oneTime: 'One-Time Purchases',
};
