// Screen strings built from data. Copy has sample rows only for these (no {x} template): the sample is
// turned into a template by swapping its sample values (gap logged in the 2a report).
import { dayOf } from '../domain/time';
import { addDays } from '../domain/time';
import * as f from '../domain/format';
import { split, t } from '../domain/strings';
import type { Doctor, Lang, Local } from '../domain/types';

/** "★ 4.9 · 126 reviews". */
export const ratingLine = (d: Doctor, lang: Lang) => (d.rating ? `★ ${f.rating(d.rating, lang)} · ${f.plural(d.reviews ?? 0, 'reviews', lang)}` : undefined);
/** "about 16 min": the word before the number in a.wait after its key. */
export function waitValue(min: number, lang: Lang) {
  const key = split('a2.facts', lang)[1];
  const about = t('a.wait', lang).slice(key.length).trim().split(' ')[0];
  return `${about} ${f.plural(min, 'minutes', lang)}`;
}
/** Today · Tomorrow · "Tue 10 Nov" (a2.days). */
export function dayWord(d: string, now: Local, lang: Lang) {
  const [today, tomorrow] = split('a2.days', lang);
  if (d === dayOf(now)) return today;
  if (d === addDays(dayOf(now), 1)) return tomorrow;
  return f.day(d, lang);
}
/** "Next: Today 9:30 PM" from sample a.next (sample day = Today, sample time = 9:30 PM). */
export function nextLine(start: Local, now: Local, lang: Lang) {
  const sample = t('a.next', lang);
  const sampleDay = split('a2.days', lang)[0];
  const sampleTime = f.time('2026-11-08T21:30', lang);
  return sample.replace(sampleDay, dayWord(dayOf(start), now, lang)).replace(sampleTime, f.time(start, lang));
}
/** a2.addr: sample "Heliopolis, Al Merghany St" swapped for the doctor's area + street. */
export function addrLine(d: Doctor, lang: Lang) {
  if (!d.area || !d.street) return undefined;
  const sep = lang === 'en' ? ', ' : '، ';
  const sample = lang === 'en' ? `Heliopolis${sep}Al Merghany St` : `مصر الجديدة${sep}شارع الميرغني`;
  return t('a2.addr', lang).replace(sample, `${d.area[lang]}${sep}${d.street[lang]}`);
}
export const placeLine = (d: Doctor, lang: Lang) => (d.area && d.street ? `${d.area[lang]}${lang === 'en' ? ', ' : '، '}${d.street[lang]}` : undefined);
export const initials = (d: Doctor) => d.name.en.split(' ').map((w) => w[0]).join('').slice(0, 2);
export const drName = (d: Doctor, lang: Lang) => (lang === 'en' ? `Dr ${d.name.en}` : `د. ${d.name.ar}`);
/** off.cache age: time today, else day + time. */
export const cacheAge = (at: Local, now: Local, lang: Lang) => (dayOf(at) === dayOf(now) ? f.time(at, lang) : f.dayTime(at, lang));

// A3 / A4 sample rows turned into templates (same swap approach as above; gap logged).
const SAMPLE_FEE = /(250|٢٥٠)[\s ](EGP|جنيه)/;
/** a3.fee.v: "250 EGP, pay at the clinic" with the doctor's fee. */
export const feeLine = (fee: number, lang: Lang) => t('a3.fee.v', lang).replace(SAMPLE_FEE, f.egp(fee, lang));
/** a3.cta: "Book for Mon 9 Nov, 7:00 PM" (sample = a3.when.v). */
export const bookCta = (start: Local, lang: Lang) => t('a3.cta', lang).replace(t('a3.when.v', lang), f.dayTime(start, lang));
/** a3.points: 1 point per EGP (copy note: inferred). */
export const pointsLine = (fee: number, lang: Lang) => t('a3.points', lang).replace(f.plural(250, 'points', lang), f.plural(fee, 'points', lang));
/** a4.b: "Dr Nour Hassan, Mon 9 Nov at 7:00 PM. Pay 250 EGP at the clinic." */
export function bookedLine(d: Doctor, start: Local, fee: number, lang: Lang) {
  const sampleDr = lang === 'en' ? 'Dr Nour Hassan' : 'د. نور حسن';
  const sampleDay = lang === 'en' ? 'Mon 9 Nov' : 'الإثنين ٩ نوفمبر';
  const sampleTime = lang === 'en' ? '7:00 PM' : '٧:٠٠ م';
  const line = t('a4.b', lang).replace(sampleDr, drName(d, lang)).replace(sampleDay, f.day(dayOf(start), lang)).replace(sampleTime, f.time(start, lang)).replace(SAMPLE_FEE, f.egp(fee, lang));
  // Follow-up (fee 0): first sentence only (doctor, date, time); nothing to pay at the clinic.
  // lastIndexOf: AR "د. " holds a dot too.
  return fee === 0 ? line.slice(0, line.lastIndexOf('. ') + 1) : line;
}
/** a3.consent: text + trailing link label (last sentence). */
export function consentParts(lang: Lang) {
  const s = t('a3.consent', lang);
  const i = s.lastIndexOf('. ');
  return { text: s.slice(0, i + 1), link: s.slice(i + 2) };
}
/** Stored "+201012345678" -> field text "10 1234 5678" (prefix "+20" is the field's). */
export const phoneField = (stored: string) => f.phone(stored, 'en').replace(/^\+20 /, '');

// Flow B sample rows turned into templates (same swap approach; gap logged).
const SAMPLE = {
  nour: { en: 'Dr Nour Hassan', ar: 'د. نور حسن' }, laila: { en: 'Dr Laila Samir', ar: 'د. ليلى سمير' },
  karim: { en: 'Dr Karim Adel', ar: 'د. كريم عادل' }, sherif: { en: 'Dr Sherif Fathy', ar: 'د. شريف فتحي' },
  mon30: { en: 'Mon 30 Nov', ar: 'الإثنين ٣٠ نوفمبر' }, mon12oct: { en: 'Mon 12 Oct', ar: 'الإثنين ١٢ أكتوبر' },
  sat31oct: { en: 'Sat 31 Oct', ar: 'السبت ٣١ أكتوبر' }, fri13: { en: 'Fri 13 Nov', ar: 'الجمعة ١٣ نوفمبر' },
};
const sw = (s: string, pairs: [string, string][]) => pairs.reduce((acc, [a, b]) => acc.replace(a, b), s);
/** b.fu.row: [title, "Book by <until>", Book]. */
export function fuRow(d: Doctor, until: string, lang: Lang) {
  const [title, by, book] = split('b.fu.row', lang);
  return { title: sw(title, [[SAMPLE.nour[lang], drName(d, lang)]]), sub: sw(by, [[SAMPLE.mon30[lang], f.day(until, lang)]]), cta: book };
}
/** b1.next.row: [title, "Last visit <day>", Book]. */
export function nextRow(d: Doctor, lastVisit: string, lang: Lang) {
  const [title, last, book] = split('b1.next.row', lang);
  return { title: sw(title, [[SAMPLE.laila[lang], drName(d, lang)]]), sub: sw(last, [[SAMPLE.mon12oct[lang], f.day(lastVisit, lang)]]), cta: book };
}
/** b.canc.b with doctor + day. */
export const cancelledBody = (d: Doctor, start: Local, lang: Lang) => sw(t('b.canc.b', lang), [[SAMPLE.sherif[lang], drName(d, lang)], [SAMPLE.fri13[lang], f.day(dayOf(start), lang)]]);
/** b.moved.keys "New time · Was": "Was <old>" line. */
export const wasLine = (prev: Local, lang: Lang) => `${split('b.moved.keys', lang)[1]} ${f.dayTime(prev, lang)}`;
/** "14 Al Thawra St, Heliopolis" (street, area: mock B1 Hana card). */
export const streetArea = (d: Doctor, lang: Lang) => (d.area && d.street ? `${d.street[lang]}${lang === 'en' ? ', ' : '، '}${d.area[lang]}` : undefined);
/** b2c.b (after clinic move): "Dr Karim Adel, Thu 12 Nov, 6:30 PM. You pay nothing…". AR sample uses "الساعة" before the time. */
export function cancelMovedBody(d: Doctor, start: Local, lang: Lang) {
  const sampleDT = lang === 'en' ? 'Thu 12 Nov, 6:30 PM' : 'الخميس ١٢ نوفمبر الساعة ٦:٣٠ م';
  const dt = lang === 'en' ? f.dayTime(start, lang) : `${f.day(dayOf(start), lang)} الساعة ${f.time(start, lang)}`;
  return sw(t('b2c.b', lang), [[SAMPLE.karim[lang], drName(d, lang)], [sampleDT, dt]]);
}
/** b3.visit part 1: "Visit on <day>". */
export const visitOn = (start: Local, lang: Lang) => sw(split('b3.visit', lang)[0], [[SAMPLE.sat31oct[lang], f.day(dayOf(start), lang)]]);
/** b3.fu.t / b3.fu.b. */
export const pastFuTitle = (d: Doctor, lang: Lang) => sw(t('b3.fu.t', lang), [[SAMPLE.nour[lang], drName(d, lang)]]);
export function pastFuBody(until: string, now: Local, lang: Lang) {
  const left = Math.max(0, Math.round((Date.parse(until) - Date.parse(dayOf(now))) / 86400000));
  return sw(t('b3.fu.b', lang), [[SAMPLE.mon30[lang], f.day(until, lang)], [f.plural(21, 'days', lang), f.plural(left, 'days', lang)]]);
}
/** b3.fee: "Fee at the clinic: 400 EGP". */
export const pastFee = (fee: number, lang: Lang) => t('b3.fee', lang).replace(/(400|٤٠٠)[\s ](EGP|جنيه)/, f.egp(fee, lang));
/** b3.sep parts: [month sample, reason sample, day sample, "Book again"]. Row subtitle = "<reason> · <day>". */
export function pastRowSub(reason: string | undefined, start: Local, lang: Lang) {
  const d = f.day(dayOf(start), lang);
  return reason ? `${reason} · ${d}` : d;
}
export const bookAgain = (lang: Lang) => split('b3.sep', lang)[3];
