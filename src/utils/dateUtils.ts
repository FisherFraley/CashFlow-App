const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_ABBR = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Parse relative or informal date strings into ISO date (YYYY-MM-DD).
 * Supports: "today", "yesterday", "last monday", "jan 5", "1/5", "2025-01-05"
 */
export function parseRelativeDate(input: string, referenceDate?: Date): string {
  const ref = referenceDate ?? new Date();
  const lower = input.toLowerCase().trim();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) return lower;

  // "today"
  if (lower === 'today') return toISODate(ref);

  // "yesterday"
  if (lower === 'yesterday') {
    const d = new Date(ref);
    d.setDate(d.getDate() - 1);
    return toISODate(d);
  }

  // "last <day>" e.g., "last monday"
  const lastDayMatch = lower.match(/^last\s+(\w+)$/);
  if (lastDayMatch) {
    const dayIdx = DAY_NAMES.indexOf(lastDayMatch[1]);
    if (dayIdx !== -1) {
      const d = new Date(ref);
      const diff = (d.getDay() - dayIdx + 7) % 7 || 7;
      d.setDate(d.getDate() - diff);
      return toISODate(d);
    }
  }

  // "on <day>" e.g., "on monday" (most recent past occurrence)
  const onDayMatch = lower.match(/^(?:on\s+)?(\w+)$/);
  if (onDayMatch) {
    const dayIdx = DAY_NAMES.indexOf(onDayMatch[1]);
    if (dayIdx !== -1) {
      const d = new Date(ref);
      const diff = (d.getDay() - dayIdx + 7) % 7 || 7;
      d.setDate(d.getDate() - diff);
      return toISODate(d);
    }
  }

  // "jan 5" or "january 5" or "jan 5 2025"
  const monthDayMatch = lower.match(/^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:\s+(\d{4}))?$/);
  if (monthDayMatch) {
    const monthStr = monthDayMatch[1].slice(0, 3);
    const monthIdx = MONTH_ABBR.indexOf(monthStr);
    const day = parseInt(monthDayMatch[2], 10);
    const year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : ref.getFullYear();
    if (monthIdx !== -1) {
      const d = new Date(year, monthIdx, day);
      return toISODate(d);
    }
  }

  // "1/5" or "1/5/2025" (MM/DD or MM/DD/YYYY)
  const slashMatch = lower.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1], 10) - 1;
    const day = parseInt(slashMatch[2], 10);
    let year = slashMatch[3] ? parseInt(slashMatch[3], 10) : ref.getFullYear();
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    return toISODate(d);
  }

  // "N days ago"
  const daysAgoMatch = lower.match(/^(\d+)\s+days?\s+ago$/);
  if (daysAgoMatch) {
    const d = new Date(ref);
    d.setDate(d.getDate() - parseInt(daysAgoMatch[1], 10));
    return toISODate(d);
  }

  // Fallback: today
  return toISODate(ref);
}

/**
 * Format an ISO date string for display.
 */
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format an ISO date string as a short label (e.g., "Jan 5")
 */
export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Extract YYYY-MM from an ISO date string.
 */
export function getMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/**
 * Format a YYYY-MM key as a readable month label.
 */
export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get a relative date label (Today, Yesterday, This Week, etc.)
 */
export function getRelativeDateLabel(isoDate: string): string {
  const today = new Date();
  const date = new Date(isoDate + 'T00:00:00');
  const todayStr = toISODate(today);
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toISODate(yesterdayDate);

  if (isoDate === todayStr) return 'Today';
  if (isoDate === yesterdayStr) return 'Yesterday';

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 'This Week';
  if (diffDays < 30) return 'This Month';
  return formatDate(isoDate);
}

/**
 * Group items by a date key extracted from each item.
 */
export function groupByDate<T>(items: T[], getDate: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = getDate(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

/**
 * Get the current month key (YYYY-MM).
 */
export function getCurrentMonthKey(): string {
  return toISODate(new Date()).slice(0, 7);
}

/**
 * Get an array of the last N month keys (YYYY-MM), most recent first.
 */
export function getLastNMonths(n: number, referenceDate?: Date): string[] {
  const ref = referenceDate ?? new Date();
  const months: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}
