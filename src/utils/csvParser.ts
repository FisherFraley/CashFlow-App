import type { CsvColumnMapping, Transaction } from '../types';
import { matchCategory } from '../constants/categoryKeywords';

/**
 * Parse raw CSV text into headers and row arrays.
 */
export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine).filter((row) => row.some((cell) => cell.trim()));

  return { headers, rows };
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Auto-detect which columns map to date, description, and amount
 * based on header names and sample data.
 */
export function detectColumnMapping(
  headers: string[],
  sampleRows: string[][]
): CsvColumnMapping {
  const lower = headers.map((h) => h.toLowerCase().trim());

  // Find date column
  let dateCol = lower.findIndex((h) => h === 'date' || h === 'transaction date' || h === 'posting date');
  if (dateCol === -1) dateCol = lower.findIndex((h) => h.includes('date'));
  if (dateCol === -1) {
    // Try to find column with date-like data
    dateCol = findColumnByContent(sampleRows, isDateLike);
  }

  // Find description column
  let descCol = lower.findIndex((h) =>
    h === 'description' || h === 'memo' || h === 'name' || h === 'payee' || h === 'merchant'
  );
  if (descCol === -1) descCol = lower.findIndex((h) => h.includes('description') || h.includes('memo'));
  if (descCol === -1) {
    // Find the longest text column that isn't date or amount
    descCol = findLongestTextColumn(sampleRows, [dateCol]);
  }

  // Find amount column
  let amountCol = lower.findIndex((h) => h === 'amount' || h === 'total');
  if (amountCol === -1) amountCol = lower.findIndex((h) =>
    h.includes('amount') || h.includes('debit') || h.includes('credit')
  );
  if (amountCol === -1) {
    amountCol = findColumnByContent(sampleRows, isAmountLike);
  }

  // Find optional category column
  let catCol: number | undefined = lower.findIndex((h) =>
    h === 'category' || h === 'type' || h.includes('category')
  );
  if (catCol === -1) catCol = undefined;

  return {
    date: Math.max(dateCol, 0),
    description: Math.max(descCol, 0),
    amount: Math.max(amountCol, 0),
    category: catCol,
  };
}

function findColumnByContent(rows: string[][], test: (value: string) => boolean): number {
  if (rows.length === 0) return 0;
  const cols = rows[0].length;
  for (let c = 0; c < cols; c++) {
    const matches = rows.filter((row) => row[c] && test(row[c])).length;
    if (matches >= Math.min(rows.length * 0.6, 3)) return c;
  }
  return 0;
}

function findLongestTextColumn(rows: string[][], exclude: number[]): number {
  if (rows.length === 0) return 0;
  const cols = rows[0].length;
  let bestCol = 0;
  let bestLen = 0;
  for (let c = 0; c < cols; c++) {
    if (exclude.includes(c)) continue;
    const avgLen = rows.reduce((sum, row) => sum + (row[c]?.length ?? 0), 0) / rows.length;
    if (avgLen > bestLen) {
      bestLen = avgLen;
      bestCol = c;
    }
  }
  return bestCol;
}

function isDateLike(value: string): boolean {
  // MM/DD/YYYY, YYYY-MM-DD, DD/MM/YYYY, etc.
  return /^\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}$/.test(value.trim());
}

function isAmountLike(value: string): boolean {
  // $1,234.56 or -1234.56 or (1234.56)
  return /^[($-]?\$?\s?\d[\d,.]*\)?$/.test(value.trim());
}

/**
 * Parse a raw amount string from CSV into a number.
 * Handles: $1,234.56, -500, (500), "1234.56"
 */
export function parseAmount(raw: string): number {
  let cleaned = raw.trim().replace(/[$,\s]/g, '');
  // Handle parenthetical negatives: (500) -> -500
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }
  return parseFloat(cleaned) || 0;
}

/**
 * Parse a date string from CSV into ISO date format.
 */
export function parseCsvDate(raw: string): string {
  const trimmed = raw.trim();

  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // Try MM/DD/YYYY or MM-DD-YYYY
  const mdyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try MM/DD/YY
  const mdyShort = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
  if (mdyShort) {
    const [, m, d, y] = mdyShort;
    const fullYear = parseInt(y) > 50 ? `19${y}` : `20${y}`;
    return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Fallback: try native Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  // Absolute fallback: today
  return new Date().toISOString().slice(0, 10);
}

/**
 * Map CSV rows to partial transactions using the column mapping.
 * Auto-categorizes using shared category keywords.
 */
export function mapRowsToTransactions(
  rows: string[][],
  mapping: CsvColumnMapping
): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] {
  return rows
    .map((row) => {
      const rawDate = row[mapping.date] ?? '';
      const rawDesc = row[mapping.description] ?? '';
      const rawAmount = row[mapping.amount] ?? '';
      const rawCategory = mapping.category !== undefined ? row[mapping.category] : undefined;

      const amount = parseAmount(rawAmount);
      if (amount === 0 || !rawDesc.trim()) return null;

      const transactionDate = parseCsvDate(rawDate);
      const description = rawDesc.trim();

      // Determine type based on amount sign
      const type = amount >= 0 ? 'income' : 'expense';
      const absAmount = Math.abs(amount);

      // Auto-categorize
      let category = rawCategory?.trim() || 'Other';
      if (category === 'Other' || !rawCategory) {
        const matched = matchCategory(description);
        if (matched) {
          category = matched.category;
        }
      }

      return {
        description,
        amount: absAmount,
        type: type as 'income' | 'expense',
        category,
        transactionDate,
        source: 'csv' as const,
      };
    })
    .filter((tx): tx is NonNullable<typeof tx> => tx !== null);
}

/**
 * Detect potential duplicate transactions by matching date, amount, and description.
 */
export function detectDuplicates(
  newTxs: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[],
  existingTxs: Transaction[]
): Set<number> {
  const duplicateIndices = new Set<number>();

  for (let i = 0; i < newTxs.length; i++) {
    const newTx = newTxs[i];
    const isDuplicate = existingTxs.some(
      (existing) =>
        existing.transactionDate === newTx.transactionDate &&
        Math.abs(existing.amount - newTx.amount) < 0.01 &&
        existing.description.toLowerCase() === newTx.description.toLowerCase()
    );
    if (isDuplicate) {
      duplicateIndices.add(i);
    }
  }

  return duplicateIndices;
}
