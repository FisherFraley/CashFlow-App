import { describe, it, expect } from 'vitest';
import { parseMessage } from './chatParser';
import type { BudgetItem } from '../types';

const EMPTY_ITEMS: BudgetItem[] = [];

const makeBudgetItem = (overrides: Partial<BudgetItem> = {}): BudgetItem => ({
  id: '1',
  type: 'expense',
  name: 'Rent',
  amount: 1500,
  rawAmount: 1500,
  category: 'Housing',
  frequency: 'monthly',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('chatParser - parseMessage', () => {
  describe('amount extraction', () => {
    it('parses dollar sign amounts like $1500', () => {
      const result = parseMessage('rent $1500 monthly', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(1500);
    });

    it('parses dollar sign with comma like $1,500', () => {
      const result = parseMessage('salary $5,000 per month', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(5000);
    });

    it('parses dollar sign with cents like $15.50', () => {
      const result = parseMessage('coffee $15.50 today', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(15.50);
    });

    it('parses "dollars" word like 400 dollars', () => {
      const result = parseMessage('groceries 400 dollars', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(400);
    });

    it('parses "bucks" word like 20 bucks', () => {
      const result = parseMessage('lunch 20 bucks', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(20);
    });

    it('parses context amounts like "costs 500"', () => {
      const result = parseMessage('insurance costs 500', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(500);
    });

    it('parses standalone numbers without $ sign like "rent 1500 monthly"', () => {
      const result = parseMessage('rent 1500 monthly', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(1500);
    });

    it('parses standalone numbers like "groceries 400"', () => {
      const result = parseMessage('groceries 400', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(400);
    });

    it('parses standalone decimal amounts like "coffee 4.50"', () => {
      const result = parseMessage('coffee 4.50 today', EMPTY_ITEMS);
      expect(result.item).not.toBeNull();
      expect(result.item!.rawAmount).toBe(4.50);
    });

    it('returns null item and feedback when no amount found', () => {
      const result = parseMessage('hello there', EMPTY_ITEMS);
      expect(result.item).toBeNull();
      expect(result.feedback).toContain("couldn't find an amount");
    });
  });

  describe('frequency extraction', () => {
    it('detects monthly frequency', () => {
      const result = parseMessage('rent 1500 monthly', EMPTY_ITEMS);
      expect(result.item!.frequency).toBe('monthly');
    });

    it('detects weekly frequency', () => {
      const result = parseMessage('groceries $100 per week', EMPTY_ITEMS);
      expect(result.item!.frequency).toBe('weekly');
    });

    it('detects biweekly frequency', () => {
      const result = parseMessage('paycheck $2000 biweekly', EMPTY_ITEMS);
      expect(result.item!.frequency).toBe('biweekly');
    });

    it('detects yearly frequency', () => {
      const result = parseMessage('insurance $6000 yearly', EMPTY_ITEMS);
      expect(result.item!.frequency).toBe('yearly');
    });

    it('detects one-time with "once"', () => {
      const result = parseMessage('laptop $1200 one-time', EMPTY_ITEMS);
      expect(result.item!.frequency).toBe('once');
    });

    it('detects one-time with "today"', () => {
      const result = parseMessage('bought coffee $5 today', EMPTY_ITEMS);
      expect(result.item!.frequency).toBe('once');
    });

    it('defaults to monthly when no frequency specified', () => {
      const result = parseMessage('rent $1500', EMPTY_ITEMS);
      expect(result.item!.frequency).toBe('monthly');
    });
  });

  describe('type and category inference', () => {
    it('recognizes rent as expense/Housing', () => {
      const result = parseMessage('rent 1500', EMPTY_ITEMS);
      expect(result.item!.type).toBe('expense');
      expect(result.item!.category).toBe('Housing');
    });

    it('recognizes salary as income/Employment', () => {
      const result = parseMessage('salary 5000', EMPTY_ITEMS);
      expect(result.item!.type).toBe('income');
      expect(result.item!.category).toBe('Employment');
    });

    it('recognizes grocery as expense/Groceries', () => {
      const result = parseMessage('groceries 400', EMPTY_ITEMS);
      expect(result.item!.type).toBe('expense');
      expect(result.item!.category).toBe('Groceries');
    });

    it('recognizes netflix as expense/Subscriptions', () => {
      const result = parseMessage('netflix $15 monthly', EMPTY_ITEMS);
      expect(result.item!.type).toBe('expense');
      expect(result.item!.category).toBe('Subscriptions');
    });

    it('recognizes 401k as savings/Retirement', () => {
      const result = parseMessage('401k $500 monthly', EMPTY_ITEMS);
      expect(result.item!.type).toBe('savings');
      expect(result.item!.category).toBe('Retirement (401k/IRA)');
    });

    it('recognizes laptop as oneTime/Electronics', () => {
      const result = parseMessage('laptop $1200', EMPTY_ITEMS);
      expect(result.item!.type).toBe('oneTime');
      expect(result.item!.category).toBe('Electronics');
    });

    it('defaults to expense/Other for unrecognized items', () => {
      const result = parseMessage('random thing $50', EMPTY_ITEMS);
      expect(result.item!.type).toBe('expense');
      expect(result.item!.category).toBe('Other');
    });

    it('infers expense type from verb "paid"', () => {
      const result = parseMessage('paid $200', EMPTY_ITEMS);
      expect(result.item!.type).toBe('expense');
    });

    it('infers income type from verb "earned"', () => {
      const result = parseMessage('earned $100', EMPTY_ITEMS);
      expect(result.item!.type).toBe('income');
    });
  });

  describe('update detection', () => {
    it('detects update intent for existing items', () => {
      const existing = [makeBudgetItem({ name: 'Rent' })];
      const result = parseMessage('update rent to $1600', existing);
      expect(result.item!.action).toBe('update');
      expect(result.item!.matchedExistingId).toBe('1');
    });

    it('does not detect update when no update keyword present', () => {
      const existing = [makeBudgetItem({ name: 'Rent' })];
      const result = parseMessage('rent $1600', existing);
      expect(result.item!.action).toBe('add');
    });
  });

  describe('feedback messages', () => {
    it('provides confirmation feedback for new items', () => {
      const result = parseMessage('rent 1500 monthly', EMPTY_ITEMS);
      expect(result.feedback).toContain('add');
      expect(result.feedback).toContain('1,500');
    });

    it('provides update feedback when updating', () => {
      const existing = [makeBudgetItem({ name: 'Rent' })];
      const result = parseMessage('update rent to $1600', existing);
      expect(result.feedback).toContain('update');
      expect(result.feedback).toContain('1,600');
    });
  });
});
