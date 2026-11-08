// Data model (build-spec-data.md > Data model). Money = whole EGP. Times = Africa/Cairo local "YYYY-MM-DDTHH:mm".
export type Lang = 'en' | 'ar';
export type Local = string; // "2026-11-09T19:00", Cairo local wall time
export type Day = string; // "2026-11-09"

export type DoctorKind = 'general' | 'specialist';
export type Doctor = {
  id: string; name: { en: string; ar: string }; title: { en: string; ar: string }; kind: DoctorKind;
  area?: { en: string; ar: string }; street?: { en: string; ar: string }; fullAddress?: { en: string; ar: string };
  fee: number; waitMin?: number; freeFollowUpDays?: number; rating?: number; reviews?: number; badges: string[];
};
export type Slot = { doctorId: string; start: Local; taken: boolean };
export type BookingKind = 'normal' | 'followUp';
export type BookingStatus = 'booked' | 'confirmedForTomorrow' | 'movedByClinic' | 'cancelledByClinic' | 'cancelledByPatient' | 'kept';
export type Source =
  | 'results_book' | 'results_card' | 'followup_row' | 'next_visit_row' | 'past_followup' | 'past_next_visit'
  | 'past_book_again' | 'push_followup' | 'push_next_visit' | 'cancelled_card' | 'moved_pick' | 'seed';
export type Booking = {
  id: string; doctorId: string; patientName: string; phone: string; email?: string; start: Local; fee: number;
  kind: BookingKind; status: BookingStatus; previousStart?: Local; createdAt: Local; source: Source;
  reason?: { en: string; ar: string }; bookingConsentAt?: Local; consentVersion?: string;
};
export type Visit = Booking; // derived: start < now and status in booked | confirmedForTomorrow | kept (build-spec-rules.md)
export type Prompt =
  | { type: 'followUp'; doctorId: string; visitId: string; until: Day }
  | { type: 'nextVisit'; doctorId: string; visitId: string; lastVisit: Day };
export type ReminderPrefs = { followUp: boolean; nextVisit: boolean; statusChanges: true };
export type ClockPreset = 'sun8' | 'mon9' | 'fri27';
