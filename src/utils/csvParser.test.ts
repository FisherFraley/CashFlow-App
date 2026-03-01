import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  detectColumnMapping,
  parseAmount,
  parseCsvDate,
  mapRowsToTransactions,
  detectDuplicates,
} from './csvParser';
import type { Transaction } from '../types';

describe('parseCSV', () => {
  it('parses simple CSV', () => {
    const csv = 'Date,Description,Amount\n01/15/2025,Coffee,5.50\n01/16/2025,Lunch,12.00';
    const { headers, rows } = parseCSV(csv);
    expect(headers).toEqual(['Date', 'Description', 'Amount']);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(['01/15/2025', 'Coffee', '5.50']);
  });

  it('handles quoted fields', () => {
    const csv = 'Date,Description,Amount\n01/15/2025,"Coffee, hot",5.50';
    const { rows } = parseCSV(csv);
    expect(rows[0][1]).toBe('Coffee, hot');
  });

  it('handles empty lines', () => {
    const csv = 'Date,Description,Amount\n01/15/2025,Coffee,5.50\n\n01/16/2025,Lunch,12.00';
    const { rows } = parseCSV(csv);
    expect(rows).toHaveLength(2);
  });

  it('returns empty for empty input', () => {
    const { headers, rows } = parseCSV('');
    expect(headers).toEqual(['']);
    expect(rows).toHaveLength(0);
  });
});

describe('detectColumnMapping', () => {
  it('detects standard column names', () => {
    const headers = ['Date', 'Description', 'Amount'];
    const rows = [['01/15/2025', 'Coffee', '5.50']];
    const mapping = detectColumnMapping(headers, rows);
    expect(mapping.date).toBe(0);
    expect(mapping.description).toBe(1);
    expect(mapping.amount).toBe(2);
  });

  it('detects alternate column names', () => {
    const headers = ['Transaction Date', 'Memo', 'Total'];
    const rows = [['01/15/2025', 'Starbucks purchase', '$12.50']];
    const mapping = detectColumnMapping(headers, rows);
    expect(mapping.date).toBe(0);
    expect(mapping.description).toBe(1);
    expect(mapping.amount).toBe(2);
  });

  it('detects category column', () => {
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = [['01/15/2025', 'Coffee', 'Dining', '5.50']];
    const mapping = detectColumnMapping(headers, rows);
    expect(mapping.category).toBe(2);
  });
});

describe('parseAmount', () => {
  it('parses simple number', () => {
    expect(parseAmount('500')).toBe(500);
  });

  it('parses with dollar sign', () => {
    expect(parseAmount('$1,234.56')).toBe(1234.56);
  });

  it('parses negative', () => {
    expect(parseAmount('-500.00')).toBe(-500);
  });

  it('parses parenthetical negative', () => {
    expect(parseAmount('(500.00)')).toBe(-500);
  });

  it('returns 0 for invalid', () => {
    expect(parseAmount('abc')).toBe(0);
  });
});

describe('parseCsvDate', () => {
  it('parses ISO date', () => {
    expect(parseCsvDate('2025-01-15')).toBe('2025-01-15');
  });

  it('parses MM/DD/YYYY', () => {
    expect(parseCsvDate('01/15/2025')).toBe('2025-01-15');
  });

  it('parses MM-DD-YYYY', () => {
    expect(parseCsvDate('01-15-2025')).toBe('2025-01-15');
  });

  it('parses MM/DD/YY', () => {
    expect(parseCsvDate('1/5/25')).toBe('2025-01-05');
  });

  it('handles single-digit month/day', () => {
    expect(parseCsvDate('1/5/2025')).toBe('2025-01-05');
  });
});

describe('mapRowsToTransactions', () => {
  it('maps rows to transactions', () => {
    const rows = [
      ['01/15/2025', 'Coffee at Starbucks', '-5.50'],
      ['01/16/2025', 'Paycheck', '3000.00'],
    ];
    const mapping = { date: 0, description: 1, amount: 2 };
    const result = mapRowsToTransactions(rows, mapping);
    expect(result).toHaveLength(2);
    expect(result[0].description).toBe('Coffee at Starbucks');
    expect(result[0].amount).toBe(5.50);
    expect(result[0].type).toBe('expense');
    expect(result[1].type).toBe('income');
    expect(result[1].amount).toBe(3000);
  });

  it('auto-categorizes based on description', () => {
    const rows = [['01/15/2025', 'Uber ride to airport', '-25.00']];
    const mapping = { date: 0, description: 1, amount: 2 };
    const result = mapRowsToTransactions(rows, mapping);
    expect(result[0].category).toBe('Transportation');
  });

  it('uses provided category column', () => {
    const rows = [['01/15/2025', 'Random purchase', 'Shopping', '-50.00']];
    const mapping = { date: 0, description: 1, amount: 3, category: 2 };
    const result = mapRowsToTransactions(rows, mapping);
    expect(result[0].category).toBe('Shopping');
  });

  it('skips rows with zero amount', () => {
    const rows = [
      ['01/15/2025', 'Void', '0.00'],
      ['01/16/2025', 'Lunch', '-12.00'],
    ];
    const mapping = { date: 0, description: 1, amount: 2 };
    const result = mapRowsToTransactions(rows, mapping);
    expect(result).toHaveLength(1);
  });
});

describe('detectDuplicates', () => {
  it('detects exact duplicates', () => {
    const newTxs = [
      { description: 'Coffee', amount: 5.5, type: 'expense' as const, category: 'Dining', transactionDate: '2025-01-15', source: 'csv' as const },
    ];
    const existing: Transaction[] = [{
      id: '1', description: 'Coffee', amount: 5.5, type: 'expense', category: 'Dining',
      transactionDate: '2025-01-15', source: 'manual',
      createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
    }];
    const dupes = detectDuplicates(newTxs, existing);
    expect(dupes.has(0)).toBe(true);
  });

  it('does not flag non-duplicates', () => {
    const newTxs = [
      { description: 'Coffee', amount: 5.5, type: 'expense' as const, category: 'Dining', transactionDate: '2025-01-15', source: 'csv' as const },
    ];
    const existing: Transaction[] = [{
      id: '1', description: 'Lunch', amount: 12, type: 'expense', category: 'Dining',
      transactionDate: '2025-01-15', source: 'manual',
      createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
    }];
    const dupes = detectDuplicates(newTxs, existing);
    expect(dupes.size).toBe(0);
  });
});
