// build-spec-data.md > Derive rules. Pure; unit tested.
import * as fmt from '@lab/app-kit/format';
import type { Instalment, Item, Purchase, Range, Summary, PaymentMethod } from './types';

export const effectiveDue = (i: Instalment) => i.extendedUntil ?? i.dueDate;
export const isOverdue = (i: Instalment, today: string) => !i.paidAt && fmt.diffDays(effectiveDue(i), today) < 0;

export function toItem(p: Purchase, i: Instalment): Item {
  return { instalmentId: i.id, purchaseId: p.id, merchant: p.merchant, number: i.number, of: i.of, amount: i.amount, dueDate: effectiveDue(i) };
}
export function unpaid(ps: Purchase[]): Item[] {
  return ps.flatMap((p) => p.instalments.filter((i) => !i.paidAt).map((i) => toItem(p, i))).sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // stable: purchase order (Noon, Namshi, Jarir) as in the mocks
}
const sum = (xs: Item[]) => xs.reduce((s, x) => s + x.amount, 0);

export function rowsFor(ps: Purchase[], range: Range, today: string): Item[] {
  const all = unpaid(ps);
  if (range === 'all') return all;
  const lim = range === '7d' ? 7 : 30;
  return all.filter((x) => fmt.diffDays(x.dueDate, today) <= lim); // overdue (negative) first by sort
}

export function summary(ps: Purchase[], methods: PaymentMethod[], range: Range, today: string, asOfTime: string): Summary {
  const all = unpaid(ps);
  const overdue = all.filter((x) => fmt.diffDays(x.dueDate, today) < 0);
  const instById = new Map(ps.flatMap((p) => p.instalments.map((i) => [i.id, i] as const)));
  const extendable = (xs: Item[]) => xs.some((x) => instById.get(x.instalmentId)?.extendable && !instById.get(x.instalmentId)?.extendedAt);
  let card: Summary['card'];
  if (overdue.length) {
    const oldest = overdue[0].dueDate;
    const failed = methods.find((m) => m.lastFailureAt);
    card = { state: 'overdue', amount: sum(overdue), dueDate: oldest, daysLate: fmt.diffDays(today, oldest), items: overdue, extendable: extendable(overdue),
      failedMethod: failed ? { brand: failed.brand!, last4: failed.last4!, at: failed.lastFailureAt! } : undefined };
  } else {
    const next = all[0];
    const items = next ? all.filter((x) => x.dueDate === next.dueDate) : [];
    const state = next && fmt.diffDays(next.dueDate, today) <= 7 ? 'due' : 'caughtUp';
    card = { state, amount: sum(items), dueDate: next?.dueDate ?? today, items, extendable: extendable(items) };
  }
  return {
    card,
    rows: rowsFor(ps, range, today),
    due30: sum(all.filter((x) => fmt.diffDays(x.dueDate, today) <= 30)),
    totalToPay: sum(all),
    openPlans: ps.filter((p) => p.instalments.some((i) => !i.paidAt)).length,
    methods,
    asOf: { day: today, time: asOfTime },
  };
}

/** Next payment after paying: earliest unpaid group. */
export function nextGroup(ps: Purchase[]): { amount: number; dueDate: string; items: Item[] } | undefined {
  const all = unpaid(ps);
  if (!all.length) return undefined;
  const items = all.filter((x) => x.dueDate === all[0].dueDate);
  return { amount: sum(items), dueDate: all[0].dueDate, items };
}

/** Extend options: until = due + 7 / 14 / 21 days (guess, S17). */
export function extendOptions(ps: Purchase[], instalmentIds: string[]) {
  const items = unpaid(ps).filter((x) => instalmentIds.includes(x.instalmentId));
  const base = items.reduce((m, x) => (x.dueDate < m ? x.dueDate : m), items[0]?.dueDate ?? '');
  return [7, 14, 21].map((n) => ({ until: fmt.addDays(base, n), fees: items.map((x) => ({ purchaseId: x.purchaseId, instalmentId: x.instalmentId, fee: ps.find((p) => p.id === x.purchaseId)!.extendFee })) }));
}
