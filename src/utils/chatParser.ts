import type { BudgetItem, BudgetItemType, Frequency, ParsedBudgetItem, ParsedTransaction, TransactionType } from '../types';
import { parseRelativeDate } from './dateUtils';

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

// ─── Transaction Parsing ──────────────────────────────────────

const TRANSACTION_SIGNALS = /\b(?:spent|paid|bought|received|earned|got paid|deposited|withdrew|charged|tipped)\b/i;

const DATE_SIGNALS = /\b(?:today|yesterday|last\s+\w+|on\s+\w+|\d{1,2}\/\d{1,2}|\w+\s+\d{1,2}|\d+\s+days?\s+ago)\b/i;

/**
 * Determine if the user input looks like a transaction entry
 * rather than a budget item. Transactions use past-tense verbs
 * and date references.
 */
export function isTransactionInput(input: string): boolean {
  // Must have a transaction signal verb
  if (TRANSACTION_SIGNALS.test(input)) return true;

  // If it has a date signal AND no recurring frequency, it's likely a transaction
  if (DATE_SIGNALS.test(input)) {
    // Only count it as transaction if there's no recurring frequency
    const hasRecurring = /\b(?:monthly|weekly|biweekly|yearly|per\s+month|per\s+week|per\s+year|annual)/i.test(input);
    return !hasRecurring;
  }

  return false;
}

export interface TransactionParseResult {
  transaction: ParsedTransaction | null;
  feedback: string;
}

/**
 * Extract date from user input. Looks for date-like patterns and
 * passes them through the relative date parser.
 */
function extractDate(input: string): string {
  const lower = input.toLowerCase();

  // "today" / "yesterday"
  if (/\btoday\b/.test(lower)) return parseRelativeDate('today');
  if (/\byesterday\b/.test(lower)) return parseRelativeDate('yesterday');

  // "N days ago"
  const daysAgoMatch = lower.match(/(\d+)\s+days?\s+ago/);
  if (daysAgoMatch) return parseRelativeDate(daysAgoMatch[0]);

  // "last monday" etc.
  const lastDayMatch = lower.match(/last\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (lastDayMatch) return parseRelativeDate(lastDayMatch[0]);

  // "on monday" etc.
  const onDayMatch = lower.match(/on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (onDayMatch) return parseRelativeDate(onDayMatch[1]);

  // "jan 5" or "january 5" style
  const monthDayMatch = lower.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:\s+(\d{4}))?/);
  if (monthDayMatch) return parseRelativeDate(monthDayMatch[0]);

  // "1/5" or "1/5/2025"
  const slashMatch = lower.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashMatch) return parseRelativeDate(slashMatch[0]);

  // Default to today
  return parseRelativeDate('today');
}

/**
 * Extract a transaction description from cleaned text.
 */
function extractDescription(cleaned: string, matchedKeyword: string | null, category: string): string {
  let desc = cleaned
    .replace(/\b(?:spent|paid|bought|received|earned|got|deposited|withdrew|charged|tipped)\b/gi, '')
    .replace(/\b(?:on|at|for|from|to|in)\b/gi, '')
    .replace(/\b(?:today|yesterday|last\s+\w+|\d+\s+days?\s+ago)\b/gi, '')
    .replace(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:\s+\d{4})?\b/gi, '')
    .replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g, '')
    .replace(/\b(?:dollars?|bucks?)\b/gi, '')
    .replace(/[,$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!desc || desc.length < 2) {
    desc = matchedKeyword
      ? matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1)
      : category;
  } else {
    desc = desc.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return desc;
}

/**
 * Parse a chat message as a transaction (dated, one-time event).
 * Returns null if it can't extract an amount.
 */
export function parseTransactionMessage(input: string): TransactionParseResult {
  const amountResult = extractAmount(input);
  if (!amountResult) {
    return {
      transaction: null,
      feedback: "I couldn't find an amount. Try something like \"spent 30 on lunch yesterday\" or \"paid $50 for groceries\".",
    };
  }

  const { amount, cleaned } = amountResult;
  const transactionDate = extractDate(input);

  // Determine type: income or expense
  const incomeSignals = /\b(?:received|earned|got paid|deposited)\b/i;
  const txType: TransactionType = incomeSignals.test(input) ? 'income' : 'expense';

  // Infer category from keywords
  const lower = input.toLowerCase();
  let category = 'Other';
  let matchedKeyword: string | null = null;

  for (const entry of CATEGORY_KEYWORDS) {
    if (lower.includes(entry.keyword)) {
      category = entry.category;
      matchedKeyword = entry.keyword;
      break;
    }
  }

  const description = extractDescription(cleaned, matchedKeyword, category);
  const confidence = matchedKeyword ? 0.9 : 0.7;

  // Format date for display
  const dateObj = new Date(transactionDate + 'T00:00:00');
  const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const transaction: ParsedTransaction = {
    description,
    amount,
    type: txType,
    category,
    transactionDate,
    confidence,
  };

  const typeLabel = txType === 'income' ? 'income' : 'expense';
  const feedback = `I'll log "${description}" as a ${typeLabel} \u2014 $${amount.toLocaleString()} on ${dateLabel} under ${category}. Look right?`;

  return { transaction, feedback };
}
