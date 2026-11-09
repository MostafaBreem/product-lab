// Analytics (build-spec-rules.md > Analytics definitions). Every event: ts (mock clock ISO) + common {locale, screen}.
// Sink = kit analytics (console + in-memory log); the store persists the log (survives reload, cleared by reset).
import { analytics } from '@lab/app-kit';
import { toIso } from './time';
import type { Local, Source } from './types';
import type { ReminderType } from './reminders';

export type Common = { locale: 'en' | 'ar'; screen?: string };
let clock: () => Local = () => '1970-01-01T00:00';
export function setClock(f: () => Local) { clock = f; }
export const setCommon = (c: Partial<Common>) => analytics.setCommon(c);
export type Logged = { name: string; props: Record<string, unknown> };
const sinks = new Set<(e: Logged) => void>();
/** Store subscribes to persist the event log. */
export const onEvent = (f: (e: Logged) => void) => { sinks.add(f); return () => { sinks.delete(f); }; };
export function track(name: string, props: Record<string, unknown> = {}) {
  const p = { ts: toIso(clock()), ...props };
  analytics.track(name, p);
  sinks.forEach((f) => f({ name, props: p }));
}
type PromptType = 'followUp' | 'nextVisit';
export const ev = {
  bookingCreated: (p: { bookingId: string; doctorId: string; source: Source; isFollowUp: boolean; isFirstBooking: boolean; filter: 'general' | 'none'; daysSincePrevVisitSameDoctor?: number }) => track('booking_created', p),
  bookingRescheduled: (p: { bookingId: string; fromStart: Local; toStart: Local }) => track('booking_rescheduled', p),
  visitPassed: (p: { bookingId: string; doctorId: string }) => track('visit_passed', p),
  visitNoShow: (p: { bookingId: string }) => track('visit_no_show', p), // debug demo only
  clinicEventReceived: (p: { bookingId: string; type: 'confirmed' | 'moved' | 'cancelled' }) => track('clinic_event_received', p),
  movedResolved: (p: { bookingId: string; resolution: 'keep' | 'pick' | 'cancel' }) => track('moved_resolved', p),
  cancelledRebooked: (p: { bookingId: string; newBookingId: string }) => track('cancelled_rebooked', p),
  patientCancelled: (p: { bookingId: string; afterClinicMove: boolean }) => track('patient_cancelled', p),
  confirmViewed: (p: { doctorId: string; start: Local }) => track('confirm_viewed', p),
  bookingSubmitted: (p: { doctorId: string; formMs: number }) => track('booking_submitted', p),
  bookingResult: (p: { result: 'ok' | 'slot_taken' | 'error'; bookingId?: string }) => track('booking_result', p),
  notsureRowShown: () => track('notsure_row_shown'),
  notsureTapped: () => track('notsure_tapped'),
  offersOptIn: (p: { on: boolean }) => track('offers_opt_in', p),
  notifAskShown: () => track('notif_ask_shown'),
  osPermissionResult: (p: { result: 'granted' | 'denied' | 'web' }) => track('os_permission_result', p),
  promptShown: (p: { type: PromptType; doctorId: string; place: 'upcoming' | 'past' }) => track('prompt_shown', p),
  promptTapped: (p: { type: PromptType; place: 'upcoming' | 'past' }) => track('prompt_tapped', p),
  /** Live clinic-change sheet (task 11): opened by an event (live, push tap, link), not by the card button. */
  sheetShown: (p: { bookingId: string; type: 'moved' | 'cancelled' }) => track('sheet_shown', p),
  sheetAction: (p: { bookingId: string; action: 'keep' | 'pick' | 'cancel' | 'book_again' | 'find_other' | 'close' }) => track('sheet_action', p),
  reminderSent: (p: { type: ReminderType }) => track('reminder_sent', p),
  reminderOpened: (p: { type: ReminderType }) => track('reminder_opened', p),
  reminderOptOut: (p: { type: ReminderType }) => track('reminder_opt_out', p),
  reminderOptIn: (p: { type: ReminderType }) => track('reminder_opt_in', p),
};
/** prompt_shown once per app session per prompt. */
const shown = new Set<string>();
export function promptShownOnce(p: { type: PromptType; doctorId: string; place: 'upcoming' | 'past' }) {
  const k = `${p.type}:${p.doctorId}:${p.place}`;
  if (shown.has(k)) return; shown.add(k); ev.promptShown(p);
}
/** Guardrail form time: confirm_viewed -> booking_submitted ms. */
export const formMs = (viewedAt: number, submittedAt: number) => submittedAt - viewedAt;
/** VISIT-FAILED share = (clinic moved + cancelled) / booking_created. */
export const visitFailedShare = (events: Logged[]) => {
  const bad = events.filter((e) => e.name === 'clinic_event_received' && (e.props.type === 'moved' || e.props.type === 'cancelled')).length;
  const made = events.filter((e) => e.name === 'booking_created').length;
  return made ? bad / made : 0;
};
