// Client-side derive (build-spec-data.md > Data model; build-spec-rules.md > Booking states, Follow-up rule, Reminder scheduler).
// GET /appointments returns bookings only; visits, prompts and lists come from here with the mock clock.
import { doctor as findDoctor } from './fixtures';
import { addDays, dayOf, diffDays } from './time';
import type { Booking, Day, Doctor, Local, Prompt, Slot, Source } from './types';

const CANCELLED = new Set<Booking['status']>(['cancelledByClinic', 'cancelledByPatient']);
export const isCancelled = (b: Booking) => CANCELLED.has(b.status);
/** movedByClinic unresolved -> treated as kept at its new time. */
export const effectiveStatus = (b: Booking, now: Local): Booking['status'] => (b.status === 'movedByClinic' && b.start < now ? 'kept' : b.status);
/** Visit = start < now and status in booked | confirmedForTomorrow | kept (moved unresolved counts as kept). Cancelled never. */
export const isVisit = (b: Booking, now: Local) => b.start < now && !isCancelled(b);
export const visits = (bs: Booking[], now: Local) => bs.filter((b) => isVisit(b, now)).sort((a, b) => b.start.localeCompare(a.start));
export const isActionNeeded = (b: Booking) => b.status === 'movedByClinic' || b.status === 'cancelledByClinic';

/** Free follow-up window: until = visit day + freeFollowUpDays. "Book by <until>" = visit date <= until. */
export function followUpUntil(visit: Booking, doc: Doctor | undefined = findDoctor(visit.doctorId)): Day | undefined {
  return doc?.freeFollowUpDays ? addDays(dayOf(visit.start), doc.freeFollowUpDays) : undefined;
}
export const withinFollowUp = (start: Local, until: Day) => dayOf(start) <= until;
export const followUpSlots = (slots: Slot[], until: Day) => slots.filter((s) => withinFollowUp(s.start, until));
export const nextSlot = (slots: Slot[], now: Local) => slots.filter((s) => !s.taken && s.start >= now).sort((a, b) => a.start.localeCompare(b.start))[0];

export const lastVisitWith = (bs: Booking[], doctorId: string, now: Local) => visits(bs, now).find((b) => b.doctorId === doctorId);
const laterBookingWith = (bs: Booking[], doctorId: string, after: Local) => bs.some((b) => b.doctorId === doctorId && !isCancelled(b) && b.start > after);

/** Free follow-up open on `today` for this doctor (used by prompts + scheduler). */
export function openFollowUp(bs: Booking[], doctorId: string, now: Local): { visit: Booking; until: Day } | undefined {
  const v = lastVisitWith(bs, doctorId, now);
  if (!v || laterBookingWith(bs, doctorId, v.start)) return undefined;
  const until = followUpUntil(v);
  return until && dayOf(now) <= until ? { visit: v, until } : undefined;
}

/**
 * Prompts: followUp when the doctor offers it, window open and no later booking with that doctor;
 * nextVisit when >= 28 days since the last visit, <= 90, no free follow-up open, no later booking.
 * Order: followUp rows first, then nextVisit (guess: spec gives row order only by sample), each by visit date.
 */
export function prompts(bs: Booking[], now: Local): Prompt[] {
  const out: Prompt[] = [];
  const today = dayOf(now);
  const ids = [...new Set(visits(bs, now).map((v) => v.doctorId))];
  for (const id of ids) {
    const v = lastVisitWith(bs, id, now)!;
    if (laterBookingWith(bs, id, v.start)) continue;
    const fu = openFollowUp(bs, id, now);
    if (fu) { out.push({ type: 'followUp', doctorId: id, visitId: v.id, until: fu.until }); continue; }
    const since = diffDays(today, dayOf(v.start));
    if (since >= 28 && since <= 90) out.push({ type: 'nextVisit', doctorId: id, visitId: v.id, lastVisit: dayOf(v.start) });
  }
  const rank = (p: Prompt) => (p.type === 'followUp' ? 0 : 1);
  const key = (p: Prompt) => (p.type === 'followUp' ? p.until : p.lastVisit);
  return out.sort((a, b) => rank(a) - rank(b) || key(a).localeCompare(key(b)));
}

/** Upcoming bookings: not visits; cancelled cards drop at their date. Order: action needed, then others, each by start. */
export function upcoming(bs: Booking[], now: Local): Booking[] {
  const today = dayOf(now);
  const xs = bs.filter((b) => (isCancelled(b) ? dayOf(b.start) > today : b.start >= now));
  const grp = (b: Booking) => (isActionNeeded(b) ? 0 : 1);
  return xs.sort((a, b) => grp(a) - grp(b) || a.start.localeCompare(b.start));
}
export type UpcomingRow = { kind: 'prompt'; prompt: Prompt } | { kind: 'booking'; booking: Booking };
/** B1 list: prompts above booking cards. */
export const upcomingRows = (bs: Booking[], now: Local): UpcomingRow[] => [
  ...prompts(bs, now).map((p) => ({ kind: 'prompt' as const, prompt: p })),
  ...upcoming(bs, now).map((b) => ({ kind: 'booking' as const, booking: b })),
];

/** B3 Past: newest first; first 2 ungrouped, the rest grouped by month ("YYYY-MM"). */
export function past(bs: Booking[], now: Local): { top: Booking[]; months: { month: string; items: Booking[] }[] } {
  const vs = visits(bs, now);
  const months: { month: string; items: Booking[] }[] = [];
  for (const v of vs.slice(2)) {
    const m = v.start.slice(0, 7);
    const g = months.find((x) => x.month === m);
    if (g) g.items.push(v); else months.push({ month: m, items: [v] });
  }
  return { top: vs.slice(0, 2), months };
}

/** Bookings whose start the clock crossed (prev <= start < now): one visit_passed each. */
export const crossed = (bs: Booking[], prev: Local, now: Local) => bs.filter((b) => !isCancelled(b) && b.start >= prev && b.start < now);

/** daysSincePrevVisitSameDoctor for booking_created (undefined when no previous visit). */
export function daysSincePrevVisit(bs: Booking[], doctorId: string, now: Local): number | undefined {
  const v = lastVisitWith(bs, doctorId, now);
  return v ? diffDays(dayOf(now), dayOf(v.start)) : undefined;
}

// North star (build-spec-rules.md > Analytics definitions).
const NS_EXCLUDED: Source[] = ['cancelled_card', 'moved_pick'];
export const PROMPT_SOURCES: Source[] = ['followup_row', 'next_visit_row', 'past_followup', 'past_next_visit', 'push_followup', 'push_next_visit'];
export type BookingCreated = { source: Source; daysSincePrevVisitSameDoctor?: number };
export const isNorthStar = (e: BookingCreated) => e.daysSincePrevVisitSameDoctor !== undefined && e.daysSincePrevVisitSameDoctor <= 90 && !NS_EXCLUDED.includes(e.source);
export const isPromptAttributed = (e: BookingCreated) => isNorthStar(e) && PROMPT_SOURCES.includes(e.source);
export function northStar(created: BookingCreated[], visitPassedCount: number) {
  const num = created.filter(isNorthStar);
  return { numerator: num.length, denominator: visitPassedCount, promptAttributed: num.filter(isPromptAttributed).length };
}
/** B2c late rule (guess, Round 2): visit starts in under 3 hours. */
export const underThreeHours = (start: Local, now: Local) => start >= now && Date.parse(`${start}:00Z`) - Date.parse(`${now}:00Z`) < 3 * 60 * 60000;
