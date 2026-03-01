import type { BudgetItem, BudgetItemType, Frequency, ParsedBudgetItem } from '../types';

export interface ParseResult {
  item: ParsedBudgetItem | null;
  feedback: string;
}

// ─── Amount Extraction ───────────────────────────────────────

function extractAmount(input: string): { amount: number; cleaned: string } | null {
  // Match $1,500.00 or $400 style
  const dollarMatch = input.match(/\$\s?([\d,]+(?:\.\d{1,2})?)/);
  if (dollarMatch) {
    const amount = parseFloat(dollarMatch[1].replace(/,/g, ''));
    if (amount > 0) {
      return { amount, cleaned: input.replace(dollarMatch[0], '').trim() };
    }
  }

  // Match "400 dollars" or "1500 bucks"
  const wordMatch = input.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)/i);
  if (wordMatch) {
    const amount = parseFloat(wordMatch[1].replace(/,/g, ''));
    if (amount > 0) {
      return { amount, cleaned: input.replace(wordMatch[0], '').trim() };
    }
  }

  // Match standalone numbers with context like "worth 400" or "for 500"
  const contextMatch = input.match(/(?:worth|for|of|costs?|costing|is)\s+([\d,]+(?:\.\d{1,2})?)/i);
  if (contextMatch) {
    const amount = parseFloat(contextMatch[1].replace(/,/g, ''));
    if (amount > 0) {
      return { amount, cleaned: input.replace(contextMatch[1], '').trim() };
    }
  }

  // Fallback: match any standalone number (e.g., "rent 1500 monthly")
  const standaloneMatch = input.match(/\b(\d[\d,]*(?:\.\d{1,2})?)\b/);
  if (standaloneMatch) {
    const amount = parseFloat(standaloneMatch[1].replace(/,/g, ''));
    if (amount > 0) {
      return { amount, cleaned: input.replace(standaloneMatch[0], '').trim() };
    }
  }

  return null;
}

// ─── Frequency Extraction ────────────────────────────────────

const FREQUENCY_PATTERNS: [RegExp, Frequency][] = [
  [/\b(?:per\s+month|monthly|\/mo|a\s+month|each\s+month)\b/i, 'monthly'],
  [/\b(?:per\s+week|weekly|a\s+week|each\s+week)\b/i, 'weekly'],
  [/\b(?:bi-?weekly|every\s+two\s+weeks|every\s+other\s+week)\b/i, 'biweekly'],
  [/\b(?:per\s+year|yearly|annual(?:ly)?|a\s+year|each\s+year)\b/i, 'yearly'],
  [/\b(?:one-?\s?time|once)\b/i, 'once'],
];

const ONCE_SIGNALS = /\b(?:today|just|bought|spent|purchased|got)\b/i;

function extractFrequency(input: string): Frequency | null {
  for (const [pattern, freq] of FREQUENCY_PATTERNS) {
    if (pattern.test(input)) return freq;
  }
  if (ONCE_SIGNALS.test(input)) return 'once';
  return null;
}

// ─── Type & Category Inference ───────────────────────────────

interface CategoryMatch {
  type: BudgetItemType;
  category: string;
  keyword: string;
}

const CATEGORY_KEYWORDS: CategoryMatch[] = [
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
  // Expense — Transportation
  { type: 'expense', category: 'Transportation', keyword: 'gas' },
  { type: 'expense', category: 'Transportation', keyword: 'uber' },
  { type: 'expense', category: 'Transportation', keyword: 'lyft' },
  { type: 'expense', category: 'Transportation', keyword: 'parking' },
  { type: 'expense', category: 'Transportation', keyword: 'car payment' },
  // Expense — Insurance
  { type: 'expense', category: 'Insurance', keyword: 'insurance' },
  // Expense — Subscriptions
  { type: 'expense', category: 'Subscriptions', keyword: 'netflix' },
  { type: 'expense', category: 'Subscriptions', keyword: 'spotify' },
  { type: 'expense', category: 'Subscriptions', keyword: 'hulu' },
  { type: 'expense', category: 'Subscriptions', keyword: 'subscription' },
  { type: 'expense', category: 'Subscriptions', keyword: 'youtube premium' },
  { type: 'expense', category: 'Subscriptions', keyword: 'gym' },
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
  // Expense — Entertainment
  { type: 'expense', category: 'Entertainment', keyword: 'movie' },
  { type: 'expense', category: 'Entertainment', keyword: 'concert' },
  { type: 'expense', category: 'Entertainment', keyword: 'game' },
  // Expense — Personal Care
  { type: 'expense', category: 'Personal Care', keyword: 'haircut' },
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

const TYPE_VERBS: [RegExp, BudgetItemType][] = [
  [/\b(?:bought|spent|paid|pay|costs?|bill|expense)\b/i, 'expense'],
  [/\b(?:earn(?:ed)?|income|raise|bonus)\b/i, 'income'],
  [/\b(?:sav(?:e|ing)|invest)\b/i, 'savings'],
];

function inferTypeAndCategory(input: string): { type: BudgetItemType; category: string; matchedKeyword: string | null } {
  const lower = input.toLowerCase();

  // Check specific category keywords first (most specific wins)
  for (const entry of CATEGORY_KEYWORDS) {
    if (lower.includes(entry.keyword)) {
      return { type: entry.type, category: entry.category, matchedKeyword: entry.keyword };
    }
  }

  // Fall back to verb-based type inference
  for (const [pattern, type] of TYPE_VERBS) {
    if (pattern.test(input)) {
      return { type, category: 'Other', matchedKeyword: null };
    }
  }

  return { type: 'expense', category: 'Other', matchedKeyword: null };
}

// ─── Name Extraction ─────────────────────────────────────────

const FILLER_WORDS = /\b(?:hey|hi|hello|i|my|me|a|an|the|for|to|on|is|was|and|but|or|just|also|please|can|you|update|add|budget|dashboard|account|that|this|it|its|from|with|about|worth|today|yesterday|new|got|have|had|been|get|make)\b/gi;

function extractName(cleaned: string, matchedKeyword: string | null, category: string): string {
  let name = cleaned
    .replace(FILLER_WORDS, '')
    .replace(/\b(?:bought|spent|paid|pay|costs?|earn(?:ed)?|save|saving|invest|monthly|weekly|yearly|biweekly|annual|per|month|week|year|one-?time|once|dollars?|bucks?)\b/gi, '')
    .replace(/[,$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (matchedKeyword && name.toLowerCase().includes(matchedKeyword)) {
    // Keep the keyword as name if that's all we have
  }

  // If nothing meaningful remains, use matched keyword or category
  if (!name || name.length < 2) {
    name = matchedKeyword
      ? matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1)
      : category;
  } else {
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return name;
}

// ─── Update Detection ────────────────────────────────────────

function detectUpdate(input: string, existingItems: BudgetItem[]): { isUpdate: boolean; matchedId?: string; matchedName?: string } {
  const updateKeywords = /\b(?:update|change|modify|edit|set|adjust|raise|new amount)\b/i;
  if (!updateKeywords.test(input)) return { isUpdate: false };

  const lower = input.toLowerCase();
  for (const item of existingItems) {
    if (lower.includes(item.name.toLowerCase())) {
      return { isUpdate: true, matchedId: item.id, matchedName: item.name };
    }
  }

  // Try partial matching on category keywords
  for (const item of existingItems) {
    const words = item.name.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && lower.includes(word)) {
        return { isUpdate: true, matchedId: item.id, matchedName: item.name };
      }
    }
  }

  return { isUpdate: false };
}

// ─── Main Parser ─────────────────────────────────────────────

export function parseMessage(input: string, existingItems: BudgetItem[]): ParseResult {
  const amountResult = extractAmount(input);
  if (!amountResult) {
    return {
      item: null,
      feedback: "I couldn't find an amount. Try something like \"rent 1500 monthly\" or \"groceries $400\".",
    };
  }

  const { amount, cleaned } = amountResult;
  const explicitFreq = extractFrequency(input);
  const { type: inferredType, category, matchedKeyword } = inferTypeAndCategory(input);

  // Determine final type: if frequency is 'once' and type is 'expense', upgrade to 'oneTime'
  let finalType = inferredType;
  if (explicitFreq === 'once' && inferredType === 'expense') {
    finalType = 'oneTime';
  }

  // Default frequency based on type
  const frequency: Frequency = explicitFreq ?? (finalType === 'oneTime' ? 'once' : 'monthly');

  const name = extractName(cleaned, matchedKeyword, category);

  // Check for update intent
  const updateCheck = detectUpdate(input, existingItems);

  const confidence = matchedKeyword ? 0.9 : 0.7;

  const item: ParsedBudgetItem = {
    type: finalType,
    name,
    rawAmount: amount,
    category,
    frequency,
    confidence,
    action: updateCheck.isUpdate ? 'update' : 'add',
    matchedExistingId: updateCheck.matchedId,
  };

  const typeLabel = { income: 'income', expense: 'expense', savings: 'savings', oneTime: 'one-time purchase' }[finalType];
  const freqLabel = frequency === 'once' ? '' : ` (${frequency})`;

  let feedback: string;
  if (updateCheck.isUpdate) {
    feedback = `I'll update "${updateCheck.matchedName}" to $${amount.toLocaleString()}${freqLabel}. Look right?`;
  } else {
    feedback = `I'll add "${name}" as a ${typeLabel} \u2014 $${amount.toLocaleString()}${freqLabel} under ${category}. Look right?`;
  }

  return { item, feedback };
}
