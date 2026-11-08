// Push content + tap routing (build-spec.md > Navigation: push taps, deep link; build-spec-rules.md > Edge states). Pure.
// Text = copy rows b5.* / b5b.1 (title / body split on " / "); sample values swapped for data (same approach as ui/text.ts; gap logged).
import { isCancelled, openFollowUp } from './derive';
import { doctor } from './fixtures';
import * as f from './format';
import { split, type CopyId } from './strings';
import { dayOf } from './time';
import type { ReminderType } from './reminders';
import type { Booking, Lang, Local, Source } from './types';

export type PushData = { type: ReminderType; bookingId?: string; doctorId?: string };
export type PushTarget =
  | { to: 'b1'; bookingId: string }
  | { to: 'b2'; bookingId: string }
  | { to: 'a2'; doctorId: string; mode: 'followUp' | 'normal'; source: Source }
  | { to: 'stale' };

const ROW: Record<ReminderType, CopyId> = {
  status_confirmed: 'b5.1', status_moved: 'b5.2', status_cancelled: 'b5.3',
  followup_open: 'b5.4', followup_ending: 'b5b.1', next_visit_4w: 'b5.5', next_visit_10w: 'b5.5',
};
const SAMPLE_DR: Partial<Record<CopyId, { en: string; ar: string }>> = {
  'b5.1': { en: 'Dr Hana Youssef', ar: 'د. هنا يوسف' }, 'b5.3': { en: 'Dr Sherif Fathy', ar: 'د. شريف فتحي' },
  'b5.4': { en: 'Dr Nour Hassan', ar: 'د. نور حسن' }, 'b5b.1': { en: 'Dr Nour Hassan', ar: 'د. نور حسن' }, 'b5.5': { en: 'Dr Laila Samir', ar: 'د. ليلى سمير' },
};
// Sample day / time per row (mock B5 / B5b).
const SAMPLE_AT: Partial<Record<CopyId, Local>> = { 'b5.1': '2026-11-10T19:00', 'b5.2': '2026-11-12T18:30', 'b5.3': '2026-11-13T00:00', 'b5.4': '2026-11-30T00:00', 'b5b.1': '2026-11-30T00:00' };
const drName = (id: string, lang: Lang) => { const d = doctor(id); return d ? (lang === 'en' ? `Dr ${d.name.en}` : `د. ${d.name.ar}`) : ''; };

/** Push title + body for a reminder. `until` = follow-up end day (followup_*), else the booking start is used. */
export function pushText(r: PushData, bs: Booking[], lang: Lang, until?: string): { title: string; body: string } {
  const id = ROW[r.type];
  let s = split(id, lang, ' / ').join('\u0000');
  const b = bs.find((x) => x.id === r.bookingId);
  const docId = r.doctorId ?? b?.doctorId;
  const sd = SAMPLE_DR[id];
  if (sd && docId) s = f.swap(s, sd[lang], drName(docId, lang));
  const sample = SAMPLE_AT[id];
  const when = r.type.startsWith('followup_') ? (until ? `${until}T00:00` : undefined) : b?.start;
  if (sample && when) {
    if (r.type === 'status_moved' && lang === 'en') s = f.swap(s, f.dayTime(sample, lang), f.dayTime(when, lang));
    else {
      s = f.swap(s, f.day(dayOf(sample), lang), f.day(dayOf(when), lang));
      if (r.type === 'status_confirmed' || r.type === 'status_moved') s = f.swap(s, f.time(sample, lang), f.time(when, lang));
    }
  }
  // next_visit_10w has no copy row: b5.5 with "4 weeks" swapped for 10 (gap logged).
  if (r.type === 'next_visit_10w') s = f.swap(s, f.plural(4, 'weeks', lang), f.plural(10, 'weeks', lang));
  const [title, body] = s.split('\u0000');
  return { title, body };
}

/** Where a push tap goes. Unknown, resolved or past booking = stale (B1 + Toast link.changed). */
export function pushTarget(r: PushData, bs: Booking[], now: Local): PushTarget {
  if (r.type.startsWith('status_')) {
    const b = bs.find((x) => x.id === r.bookingId);
    if (!b || b.start < now) return { to: 'stale' };
    if (r.type === 'status_moved') return b.status === 'movedByClinic' ? { to: 'b2', bookingId: b.id } : { to: 'stale' };
    if (r.type === 'status_cancelled') return b.status === 'cancelledByClinic' ? { to: 'b1', bookingId: b.id } : { to: 'stale' };
    return isCancelled(b) ? { to: 'stale' } : { to: 'b1', bookingId: b.id };
  }
  const doctorId = r.doctorId ?? bs.find((x) => x.id === r.bookingId)?.doctorId;
  if (!doctorId) return { to: 'stale' };
  if (r.type.startsWith('followup_')) return { to: 'a2', doctorId, mode: openFollowUp(bs, doctorId, now) ? 'followUp' : 'normal', source: 'push_followup' };
  return { to: 'a2', doctorId, mode: 'normal', source: 'push_next_visit' };
}

/** Deep link vezeeta://appointments/<id>[?type=<ReminderType>]: type from the link, else from the booking status. */
export function linkData(id: string, type: string | undefined, bs: Booking[]): PushData | undefined {
  const known: ReminderType[] = ['status_confirmed', 'status_moved', 'status_cancelled', 'followup_open', 'followup_ending', 'next_visit_4w', 'next_visit_10w'];
  if (type && (known as string[]).includes(type)) return { type: type as ReminderType, bookingId: id };
  const b = bs.find((x) => x.id === id);
  if (!b) return undefined;
  const t: ReminderType = b.status === 'movedByClinic' ? 'status_moved' : b.status === 'cancelledByClinic' ? 'status_cancelled' : 'status_confirmed';
  return { type: t, bookingId: id };
}
/** Deep link target: moved unresolved -> B2; card still on Upcoming -> B1; unknown / past -> stale. */
export function linkTarget(id: string, bs: Booking[], now: Local): PushTarget {
  const b = bs.find((x) => x.id === id);
  if (!b || b.start < now) return { to: 'stale' };
  return b.status === 'movedByClinic' ? { to: 'b2', bookingId: id } : { to: 'b1', bookingId: id };
}
