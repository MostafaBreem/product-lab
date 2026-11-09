// Live clinic-change sheets (CEO 2026-11-09, task 11): a clinic MOVE or CANCEL seen while the app is open opens a modal sheet
// (moved -> B2, cancelled -> B7) over B1. Pure: which event -> which sheet, once (seen keys), order (moved first, then event time).
import type { ClinicEvent } from './reminders';
import type { Booking, Local } from './types';

export type LiveSheet = { key: string; bookingId: string; type: 'moved' | 'cancelled' };
/** Same key as the status_* reminder for that event (reminders.ts plan()), so the banner can be matched to its sheet. */
export const sheetKey = (e: ClinicEvent) => `status_${e.type}:${e.bookingId}:${e.at}`;
const STATUS = { moved: 'movedByClinic', cancelled: 'cancelledByClinic' } as const;

/** Events still waiting for their sheet: moved / cancelled, not seen, booking still in that state and not past. Moved first. */
export function sheetQueue(events: ClinicEvent[], bs: Booking[], seen: string[], now: Local): LiveSheet[] {
  const done = new Set(seen);
  const out: (LiveSheet & { at: Local })[] = [];
  for (const e of events) {
    if (e.type !== 'moved' && e.type !== 'cancelled') continue;
    const key = sheetKey(e);
    if (done.has(key) || out.some((x) => x.key === key)) continue;
    const b = bs.find((x) => x.id === e.bookingId);
    if (!b || b.status !== STATUS[e.type] || b.start < now) continue;
    out.push({ key, bookingId: b.id, type: e.type, at: e.at });
  }
  out.sort((a, b) => (a.type === b.type ? a.at.localeCompare(b.at) : a.type === 'moved' ? -1 : 1));
  return out.map(({ key, bookingId, type }) => ({ key, bookingId, type }));
}

/** Keys for events already in the data (screenshot URL with ?preset=): the seeded state counts as seen, no sheet. */
export const seenKeys = (events: ClinicEvent[]) => events.filter((e) => e.type !== 'confirmed').map(sheetKey);
