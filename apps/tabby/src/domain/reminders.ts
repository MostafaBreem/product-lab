// Local reminder schedule (build-spec-reminders.md). Pure: (unpaid, prefs, now) -> list. Mock clock passed in.
import * as fmt from '@lab/app-kit/format';
import type { Item, NotificationPrefs } from './types';

export type Planned = { kind: 'before' | 'after' | 'salary'; fireDay: string; time: '09:00'; dueDate: string; amount: number; merchants: string[]; daysToDue: number };

const groupByDue = (items: Item[]) => {
  const m = new Map<string, Item[]>();
  for (const x of items) m.set(x.dueDate, [...(m.get(x.dueDate) ?? []), x]);
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
};
const lastDayOfMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export function plan(unpaidItems: Item[], prefs: NotificationPrefs, today: string, horizonDays = 60): Planned[] {
  const out: Planned[] = [];
  const groups = groupByDue(unpaidItems);
  for (const [due, xs] of groups) {
    const amount = xs.reduce((s, x) => s + x.amount, 0);
    const merchants = [...new Set(xs.map((x) => x.merchant.name.en))];
    const before = fmt.addDays(due, -1);
    const after = fmt.addDays(due, 1);
    if (fmt.diffDays(before, today) >= 0 && fmt.diffDays(before, today) <= horizonDays) out.push({ kind: 'before', fireDay: before, time: '09:00', dueDate: due, amount, merchants, daysToDue: 1 });
    if (fmt.diffDays(after, today) >= 0 && fmt.diffDays(after, today) <= horizonDays) out.push({ kind: 'after', fireDay: after, time: '09:00', dueDate: due, amount, merchants, daysToDue: -1 });
  }
  if (prefs.salaryDay.on && prefs.salaryDay.day !== null) {
    const [y, m] = today.split('-').map(Number);
    let count = 0;
    for (let k = 0; k < 6 && count < 3; k++) {
      const yy = y + Math.floor((m - 1 + k) / 12), mm = ((m - 1 + k) % 12) + 1;
      const last = lastDayOfMonth(yy, mm);
      const d = prefs.salaryDay.day === 'last' ? last : Math.min(prefs.salaryDay.day, last);
      const day = `${yy}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (fmt.diffDays(day, today) < 0) continue;
      count++;
      const g = groups.find(([due]) => fmt.diffDays(due, day) >= 0 && fmt.diffDays(due, day) <= 31);
      if (!g) continue;
      const [due, xs] = g;
      out.push({ kind: 'salary', fireDay: day, time: '09:00', dueDate: due, amount: xs.reduce((s, x) => s + x.amount, 0), merchants: [...new Set(xs.map((x) => x.merchant.name.en))], daysToDue: fmt.diffDays(due, day) });
    }
  }
  return out.sort((a, b) => a.fireDay.localeCompare(b.fireDay));
}
