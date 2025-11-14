/**
 * Dashboard helper functions for filtering, aggregating, and computing metrics
 */

export type DateRange = {
  from: Date;
  to: Date;
};

export function getRange(days: 30 | 90): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

export function filterByRange<T extends { createdAt: string }>(
  rows: T[],
  range: DateRange
): T[] {
  return rows.filter((row) => {
    const date = new Date(row.createdAt);
    return date >= range.from && date <= range.to;
  });
}

export function sum<T>(items: T[], fn: (item: T) => number): number {
  return items.reduce((acc, item) => acc + fn(item), 0);
}

export function count<T>(items: T[], fn?: (item: T) => boolean): number {
  if (fn) {
    return items.filter(fn).length;
  }
  return items.length;
}

export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }
  return groups;
}

export function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

export function groupByDay<T extends { createdAt: string }>(
  items: T[],
  valueFn: (item: T) => number = () => 1
): Array<{ date: string; value: number }> {
  const grouped = groupBy(items, (item) => {
    const date = new Date(item.createdAt);
    return date.toISOString().split('T')[0];
  });

  return Object.entries(grouped)
    .map(([date, items]) => ({
      date,
      value: sum(items, valueFn),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}


