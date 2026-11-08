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
  return t('a4.b', lang).replace(sampleDr, drName(d, lang)).replace(sampleDay, f.day(dayOf(start), lang)).replace(sampleTime, f.time(start, lang)).replace(SAMPLE_FEE, f.egp(fee, lang));
}
/** a3.consent: text + trailing link label (last sentence). */
export function consentParts(lang: Lang) {
  const s = t('a3.consent', lang);
  const i = s.lastIndexOf('. ');
  return { text: s.slice(0, i + 1), link: s.slice(i + 2) };
}
/** Stored "+201012345678" -> field text "10 1234 5678" (prefix "+20" is the field's). */
export const phoneField = (stored: string) => f.phone(stored, 'en').replace(/^\+20 /, '');
