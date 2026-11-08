// Fixtures (build-spec-data.md > Fixtures; values = approved mocks, sample data).
import { addDays, addMinutes, at, dayOf } from './time';
import type { Booking, ClockPreset, Doctor, Local, Slot } from './types';

export const PRESETS: Record<ClockPreset, Local> = { sun8: '2026-11-08T18:00', mon9: '2026-11-09T10:00', fri27: '2026-11-27T10:00' };
export const DEFAULT_PRESET: ClockPreset = 'sun8';
export const PATIENT = { name: 'Mona Saeed', phone: '+201012345678' };
export const RESULTS_COUNT = { all: 142, general: 38 };
export const CONSENT_VERSION = 'a3.consent';

const L = (en: string, ar: string) => ({ en, ar });
export const DOCTORS: Doctor[] = [
  { id: 'karim', name: L('Karim Adel', 'كريم عادل'), title: L('Consultant, root canal treatment', 'استشاري علاج جذور'), kind: 'specialist',
    area: L('El-Maadi', 'المعادي'), street: L('Zahraa El Maadi St', 'شارع زهراء المعادي'), fee: 500, waitMin: 16, rating: 4.9, reviews: 126, badges: ['goodListener'] },
  { id: 'nour', name: L('Nour Hassan', 'نور حسن'), title: L('General dentist', 'دكتور أسنان عام'), kind: 'general',
    area: L('Heliopolis', 'مصر الجديدة'), street: L('Al Merghany St', 'شارع الميرغني'), fullAddress: L('14 Al Merghany St, 2nd floor, Heliopolis', '١٤ شارع الميرغني، الدور التاني، مصر الجديدة'),
    fee: 250, waitMin: 10, freeFollowUpDays: 30, rating: 4.8, reviews: 412, badges: [] },
  { id: 'sherif', name: L('Sherif Fathy', 'شريف فتحي'), title: L('General dentist', 'دكتور أسنان عام'), kind: 'general',
    area: L('Nasr City', 'مدينة نصر'), street: L('Abbas El Akkad St', 'شارع عباس العقاد'), fee: 200, waitMin: 12, freeFollowUpDays: 30, rating: 4.7, reviews: 88, badges: [] },
  { id: 'hana', name: L('Hana Youssef', 'هنا يوسف'), title: L('Orthodontist', 'أخصائي تقويم'), kind: 'specialist',
    area: L('Heliopolis', 'مصر الجديدة'), street: L('14 Al Thawra St', '١٤ شارع الثورة'), fee: 300, badges: [] },
  { id: 'laila', name: L('Laila Samir', 'ليلى سمير'), title: L('General dentist', 'دكتور أسنان عام'), kind: 'general',
    area: L('Dokki', 'الدقي'), street: L('Mossadak St', 'شارع مصدق'), fee: 400, waitMin: 15, badges: [] }, // Round 2 fix (build-spec-rules.md); AR names = sample transliteration
];
/** A1 order ("Recommended") and A1b (general filter). Laila: slots like the others, listed in A2 only (Round 2 fix). */
export const RESULTS_ORDER = { none: ['karim', 'nour', 'sherif'], general: ['nour', 'sherif'] };
export const NO_SLOTS: string[] = [];
export const doctor = (id: string) => DOCTORS.find((d) => d.id === id);

const seed = (id: string, doctorId: string, start: Local, status: Booking['status'], extra: Partial<Booking> = {}): Booking => ({
  id, doctorId, patientName: PATIENT.name, phone: PATIENT.phone, start, fee: doctor(doctorId)!.fee, kind: 'normal', status,
  createdAt: addMinutes(start, -7 * 24 * 60), source: 'seed', ...extra,
});

/**
 * Seeded bookings. mon9 / fri27 = "clinic events already applied" (build-spec-data.md).
 * sun8 = same bookings before the clinic events (guess: spec gives only the Mon 9 Nov list).
 */
export function buildBookings(preset: ClockPreset): Booking[] {
  const events = preset !== 'sun8';
  return [
    seed('b-karim', 'karim', events ? '2026-11-12T18:30' : '2026-11-11T19:00', events ? 'movedByClinic' : 'booked', events ? { previousStart: '2026-11-11T19:00' } : {}),
    seed('b-sherif', 'sherif', '2026-11-13T19:00', events ? 'cancelledByClinic' : 'booked'), // time of day not in spec (guess 7:00 PM)
    seed('b-hana', 'hana', '2026-11-10T19:00', events ? 'confirmedForTomorrow' : 'booked'),
    seed('b-nour-oct', 'nour', '2026-10-31T19:00', 'booked'), // time of day guess
    seed('b-laila-oct', 'laila', '2026-10-12T19:00', 'booked'),
    seed('b-nour-sep', 'nour', '2026-09-17T19:00', 'booked', { reason: { en: 'Check-up', ar: 'كشف دوري' } }),
  ];
}

const SLOT_TIMES = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
/** Karim, Sun 8 Nov 6:00-9:00 PM taken, so nextSlot at the default clock = "Today 9:30 PM" (mock A1). */
const FIXED_TAKEN: Record<string, string[]> = { karim: ['2026-11-08T18:00', '2026-11-08T18:30', '2026-11-08T19:00', '2026-11-08T19:30', '2026-11-08T20:00', '2026-11-08T20:30', '2026-11-08T21:00'] };
/** Every 30 min 6:00-9:30 PM, `days` days from `from`; 9:00 PM tomorrow taken (A2); fixed taken slots (A1); slots held by live bookings taken. */
export function buildSlots(doctorId: string, now: Local, bookings: Booking[], from: string = dayOf(now), days = 3): Slot[] {
  if (NO_SLOTS.includes(doctorId)) return [];
  const tomorrow = addDays(dayOf(now), 1);
  const held = new Set(bookings.filter((b) => b.doctorId === doctorId && b.status !== 'cancelledByClinic' && b.status !== 'cancelledByPatient').map((b) => b.start));
  const fixed = new Set(FIXED_TAKEN[doctorId] ?? []);
  const out: Slot[] = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i);
    for (const t of SLOT_TIMES) {
      const start = at(d, t);
      if (start < now) continue;
      out.push({ doctorId, start, taken: (d === tomorrow && t === '21:00') || held.has(start) || fixed.has(start) });
    }
  }
  return out;
}
