// Cairo-local wall-clock helpers. Strings compare lexicographically; arithmetic in UTC to avoid drift.
import type { Day, Local } from './types';
const toUTC = (d: Day) => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd); };
export const dayOf = (t: Local): Day => t.slice(0, 10);
export const timeOf = (t: Local) => t.slice(11, 16);
export const addDays = (d: Day, n: number): Day => new Date(toUTC(d) + n * 86400000).toISOString().slice(0, 10);
export const diffDays = (a: Day, b: Day) => Math.round((toUTC(a) - toUTC(b)) / 86400000); // a - b
export const at = (d: Day, hhmm: string): Local => `${d}T${hhmm}`;
export const addMinutes = (t: Local, n: number): Local => {
  const ms = toUTC(dayOf(t)) + (Number(t.slice(11, 13)) * 60 + Number(t.slice(14, 16)) + n) * 60000;
  return new Date(ms).toISOString().slice(0, 16);
};
export const weekday = (d: Day) => new Date(toUTC(d)).getUTCDay();
/** Africa/Cairo is UTC+2 in Nov (no DST in winter). Used for event ts (mock clock ISO). */
export const toIso = (t: Local) => `${t}:00+02:00`;
