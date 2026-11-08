// Reminder scheduler (build-spec-rules.md > Reminder scheduler). Pure: (bookings, clinic events, prefs, now, fired) -> reminders.
// Timings = guess (map v3). Real device notifications are scheduled from plan() later; due() serves clock jumps + app open.
import { followUpUntil, isCancelled, lastVisitWith, visits } from './derive';
import { addDays, at, dayOf } from './time';
import type { Booking, Local, ReminderPrefs } from './types';

export type ReminderType = 'followup_open' | 'followup_ending' | 'next_visit_4w' | 'next_visit_10w' | 'status_confirmed' | 'status_moved' | 'status_cancelled';
export type ClinicEvent = { bookingId: string; type: 'confirmed' | 'moved' | 'cancelled'; at: Local };
export type Reminder = { type: ReminderType; key: string; fireAt: Local; doctorId: string; bookingId: string };
const max = (a: Local, b: Local) => (a > b ? a : b);
const isStatus = (t: ReminderType) => t.startsWith('status_');
/** Visit end = the moment the visit passes. Spec has no visit length; visit_passed fires when the clock crosses the booking start. */
const visitEnd = (v: Booking): Local => v.start;
const laterBooking = (bs: Booking[], doctorId: string, after: Local) => bs.some((b) => b.doctorId === doctorId && !isCancelled(b) && b.start > after);

/** Every reminder the rules produce for the current data (past and future fire times), cancel rules applied. */
export function plan(bs: Booking[], events: ClinicEvent[], prefs: ReminderPrefs, now: Local): Reminder[] {
  const out: Reminder[] = [];
  const doctorIds = [...new Set(visits(bs, now).map((v) => v.doctorId))];
  for (const id of doctorIds) {
    const v = lastVisitWith(bs, id, now)!;
    if (laterBooking(bs, id, v.start)) continue; // cancelled by a booking with that doctor
    const day = dayOf(v.start);
    const until = followUpUntil(v);
    if (until && prefs.followUp) {
      // followup_open: later of visit end and 10:00 AM that day (first app open after it shows it).
      out.push({ type: 'followup_open', key: `followup_open:${v.id}`, fireAt: max(visitEnd(v), at(day, '10:00')), doctorId: id, bookingId: v.id });
      out.push({ type: 'followup_ending', key: `followup_ending:${v.id}`, fireAt: at(addDays(until, -3), '10:00'), doctorId: id, bookingId: v.id });
    }
    if (prefs.nextVisit) {
      // follow-up still open: 4w waits until it ends (first day after until).
      const after = until ? at(addDays(until, 1), '10:00') : '';
      out.push({ type: 'next_visit_4w', key: `next_visit_4w:${v.id}`, fireAt: max(at(addDays(day, 28), '10:00'), after), doctorId: id, bookingId: v.id });
      const w10 = at(addDays(day, 70), '10:00');
      if (!until || w10 > after) out.push({ type: 'next_visit_10w', key: `next_visit_10w:${v.id}`, fireAt: w10, doctorId: id, bookingId: v.id });
    }
  }
  // status_*: clinic event time, per event, cannot opt out.
  for (const e of events) {
    const b = bs.find((x) => x.id === e.bookingId);
    if (b) out.push({ type: `status_${e.type}` as ReminderType, key: `status_${e.type}:${e.bookingId}:${e.at}`, fireAt: e.at, doctorId: b.doctorId, bookingId: b.id });
  }
  return out.sort((a, b) => a.fireAt.localeCompare(b.fireAt));
}

/**
 * Reminders due at `now` not fired yet (once flags = keys in `fired`).
 * status_* fire per clinic event (never collapsed). Clock jump: other types fire once, newest per type only;
 * the older ones come back as `skipped` (mark them fired too).
 */
export function due(bs: Booking[], events: ClinicEvent[], prefs: ReminderPrefs, now: Local, fired: string[]): { due: Reminder[]; skipped: Reminder[] } {
  const ready = plan(bs, events, prefs, now).filter((r) => r.fireAt <= now && !fired.includes(r.key));
  const newest = new Map<ReminderType, Reminder>();
  for (const r of ready) { if (isStatus(r.type)) continue; const cur = newest.get(r.type); if (!cur || r.fireAt >= cur.fireAt) newest.set(r.type, r); }
  const keep = new Set([...newest.values()].map((r) => r.key).concat(ready.filter((r) => isStatus(r.type)).map((r) => r.key)));
  return { due: ready.filter((r) => keep.has(r.key)), skipped: ready.filter((r) => !keep.has(r.key)) };
}
/** Future reminders to hand to the device scheduler. */
export const upcomingReminders = (bs: Booking[], events: ClinicEvent[], prefs: ReminderPrefs, now: Local) => plan(bs, events, prefs, now).filter((r) => r.fireAt > now);
