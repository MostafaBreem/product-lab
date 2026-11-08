// Mock API (build-spec-data.md > Mock API). In-memory "server"; latency + results from debug settings.
import { MockError, mockCall, sleep, type Latency, type Net } from '@lab/app-kit/mock';
import { buildBookings, buildSlots, DEFAULT_PRESET, doctor, DOCTORS, PRESETS, RESULTS_COUNT, RESULTS_ORDER } from './fixtures';
import { followUpUntil, lastVisitWith, withinFollowUp } from './derive';
import type { ClinicEvent } from './reminders';
import type { Booking, BookingKind, ClockPreset, Doctor, Local, ReminderPrefs, Slot, Source } from './types';

export type Settings = {
  preset: ClockPreset; now: Local; net: Net; latency: Latency;
  /** Debug "next POST /bookings = slotTaken" (one shot). */
  nextBookingSlotTaken: boolean;
  /** Not in the debug list: lets the server error state be demoed (one shot). */
  nextServerError: boolean;
};
export const defaultSettings: Settings = { preset: DEFAULT_PRESET, now: PRESETS[DEFAULT_PRESET], net: 'online', latency: 'normal', nextBookingSlotTaken: false, nextServerError: false };

type State = { bookings: Booking[]; events: ClinicEvent[]; prefs: ReminderPrefs; byKey: Map<string, Booking>; seq: number; takenByOthers: Set<string> };
let settings: Settings = { ...defaultSettings };
let state: State = fresh(settings.preset);

function fresh(p: ClockPreset): State {
  // Clinic events at mon9 / fri27 are "already applied"; event time = Mon 9 Nov 10:00 AM (guess, B5 lock "now").
  const events: ClinicEvent[] = p === 'sun8' ? [] : [
    { bookingId: 'b-hana', type: 'confirmed', at: PRESETS.mon9 }, { bookingId: 'b-karim', type: 'moved', at: PRESETS.mon9 }, { bookingId: 'b-sherif', type: 'cancelled', at: PRESETS.mon9 },
  ];
  return { bookings: buildBookings(p), events, prefs: { followUp: true, nextVisit: true, statusChanges: true }, byKey: new Map(), seq: 0, takenByOthers: new Set() };
}
export const getSettings = () => settings;
export const now = () => settings.now;
/** Preset change reseeds; other settings keep data. */
export function configure(next: Partial<Settings>) {
  const prev = settings;
  settings = { ...settings, ...next };
  if (next.preset && next.preset !== prev.preset) { settings.now = next.now ?? PRESETS[next.preset]; const prefs = state.prefs; state = fresh(next.preset); state.prefs = prefs; }
}
export function reset() { settings = { ...defaultSettings }; state = fresh(settings.preset); }
/** Debug clinic event on a chosen booking (fires push in the app layer). */
export function clinicEvent(bookingId: string, type: ClinicEvent['type'], newStart?: Local): Booking {
  const b = state.bookings.find((x) => x.id === bookingId);
  if (!b) throw new MockError('notFound', true);
  if (type === 'confirmed') b.status = 'confirmedForTomorrow';
  if (type === 'cancelled') b.status = 'cancelledByClinic';
  if (type === 'moved') { b.previousStart = b.start; b.start = newStart ?? b.start; b.status = 'movedByClinic'; }
  state.events.push({ bookingId, type, at: settings.now });
  return clone(b);
}
export const clinicEvents = () => clone(state.events);
export const allBookings = () => clone(state.bookings);

const call = <T,>(normalMs: number, run: () => T) => mockCall({ net: settings.net, latency: settings.latency, normalMs }, () => {
  if (settings.nextServerError) { settings.nextServerError = false; throw new MockError('server', true); }
  return run();
});
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const find = (id: string) => { const b = state.bookings.find((x) => x.id === id); if (!b) throw new MockError('notFound', true); return b; };
/** Slots another patient took (slotTaken result): stay taken so A2 shows them struck (A3e). */
const othersKey = (doctorId: string, start: Local) => `${doctorId}|${start}`;
const markOthers = (xs: Slot[]) => xs.map((s) => (state.takenByOthers.has(othersKey(s.doctorId, s.start)) ? { ...s, taken: true } : s));
const slotFree = (doctorId: string, start: Local) => markOthers(buildSlots(doctorId, settings.now, state.bookings, start.slice(0, 10), 1)).some((s) => s.start === start && !s.taken);
const taken = (doctorId: string, start: Local) => { state.takenByOthers.add(othersKey(doctorId, start)); return new MockError('slotTaken', true); };

export type BookingRequest = { doctorId: string; start: Local; patientName: string; phone: string; email?: string; kind: BookingKind; offersOptIn: boolean; consentVersion: string; idempotencyKey: string; source: Source };

export const api = {
  doctors: (q: string, filter?: 'general') => call(600, () => {
    const ids = filter === 'general' ? RESULTS_ORDER.general : RESULTS_ORDER.none;
    return clone({ q, doctors: ids.map((id) => doctor(id)!) as Doctor[], count: filter === 'general' ? RESULTS_COUNT.general : RESULTS_COUNT.all });
  }),
  slots: (doctorId: string, from: string, days = 3) => call(400, (): Slot[] => clone(markOthers(buildSlots(doctorId, settings.now, state.bookings, from, days)))),
  /** POST /bookings: status booked ("confirmed instantly"). Same idempotencyKey never doubles. */
  createBooking: (r: BookingRequest) => call(1200, () => {
    const prior = state.byKey.get(r.idempotencyKey);
    if (prior) return clone(prior);
    if (settings.nextBookingSlotTaken) { settings.nextBookingSlotTaken = false; throw taken(r.doctorId, r.start); }
    if (!slotFree(r.doctorId, r.start)) throw taken(r.doctorId, r.start);
    const doc = doctor(r.doctorId)!;
    let fee = doc.fee;
    if (r.kind === 'followUp') {
      const v = lastVisitWith(state.bookings, r.doctorId, settings.now);
      const until = v && followUpUntil(v, doc);
      if (!until || !withinFollowUp(r.start, until)) throw new MockError('followUpExpired', true);
      fee = 0;
    }
    const b: Booking = { id: `bk-${++state.seq}`, doctorId: r.doctorId, patientName: r.patientName, phone: r.phone, email: r.email, start: r.start, fee, kind: r.kind,
      status: 'booked', createdAt: settings.now, source: r.source, bookingConsentAt: settings.now, consentVersion: r.consentVersion };
    state.bookings.push(b); state.byKey.set(r.idempotencyKey, b);
    return clone(b);
  }),
  appointments: () => call(500, () => clone(state.bookings)),
  keep: (id: string) => call(600, () => { const b = find(id); b.status = 'kept'; return clone(b); }),
  /** Fee 0 after a clinic move (guess). */
  cancel: (id: string) => call(800, () => { const b = find(id); const afterClinicMove = b.status === 'movedByClinic'; b.status = 'cancelledByPatient'; if (afterClinicMove) b.fee = 0; return clone({ booking: b, afterClinicMove }); }),
  /** PATCH /bookings/:id {start}: reschedule. */
  reschedule: (id: string, start: Local) => call(1000, () => {
    const b = find(id);
    if (!slotFree(b.doctorId, start)) throw taken(b.doctorId, start);
    const fromStart = b.start; b.start = start; b.status = 'booked'; b.previousStart = undefined;
    return clone({ booking: b, fromStart });
  }),
  prefs: () => call(300, () => clone(state.prefs)),
  savePrefs: (p: ReminderPrefs) => call(300, () => { state.prefs = { ...clone(p), statusChanges: true }; return clone(state.prefs); }),
};
export { DOCTORS, sleep };
