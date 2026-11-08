// Formats (build-spec-data.md > Formats; build-spec-rules.md > Formats add). Pure, unit tested.
import { dayOf, timeOf, weekday } from './time';
import type { Day, Lang, Local } from './types';

export const LRI = '⁦', PDI = '⁩', NBSP = ' ';
export const ltr = (s: string, lang: Lang) => (lang === 'ar' ? `${LRI}${s}${PDI}` : s);
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const digits = (s: string | number, lang: Lang) => (lang === 'ar' ? String(s).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]).replace(/\./g, '٫') : String(s));
/** Arabic-Indic / Persian digits -> Western (input normalisation). */
export const westernDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

const EN_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AR_WD = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const AR_MO = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const EN_MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "Mon 9 Nov" · "الإثنين ٩ نوفمبر" (day first, F5). */
export function day(d: Day, lang: Lang) {
  const [, m, dd] = d.split('-').map(Number);
  return lang === 'en' ? `${EN_WD[weekday(d)]} ${dd} ${EN_MO[m - 1]}` : `${AR_WD[weekday(d)]} ${digits(dd, lang)} ${AR_MO[m - 1]}`;
}
/** "7:00 PM" · "٧:٠٠ م" (LTR-isolated in AR). No-break space before the AM/PM marker: never a lone "م" / "PM" on the next line. */
export function time(t: Local, lang: Lang) {
  const [h, mi] = timeOf(t).split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const s = `${h12}:${String(mi).padStart(2, '0')}`;
  return lang === 'en' ? `${s}${NBSP}${h < 12 ? 'AM' : 'PM'}` : `${ltr(digits(s, lang), lang)}${NBSP}${h < 12 ? 'ص' : 'م'}`;
}
/** "Mon 9 Nov, 7:00 PM" · "الإثنين ٩ نوفمبر، ٧:٠٠ م". */
export const dayTime = (t: Local, lang: Lang) => `${day(dayOf(t), lang)}${lang === 'en' ? ', ' : '، '}${time(t, lang)}`;
export const monthName = (ym: string, lang: Lang) => (lang === 'en' ? EN_MONTH_FULL : AR_MO)[Number(ym.slice(5, 7)) - 1];
/** "250 EGP" / "٢٥٠ جنيه", no-break space. Whole EGP. */
export const egp = (n: number, lang: Lang) => (lang === 'en' ? `${n.toLocaleString('en-US')}${NBSP}EGP` : `${digits(n, lang)}${NBSP}جنيه`);
/** "4.9" · "٤٫٩". */
export const rating = (r: number, lang: Lang) => digits(r.toFixed(1), lang);
/** "+20 10 1234 5678", LTR-isolated in AR. */
export function phone(stored: string, lang: Lang) {
  const n = stored.replace(/^\+20/, '');
  return ltr(`+20 ${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}`, lang);
}

// ICU plurals (EN one / other; AR zero / one / two / few / many / other).
export type Unit = 'days' | 'dentists' | 'reviews' | 'points' | 'hours' | 'minutes' | 'weeks';
type Forms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
const EN: Record<Unit, Forms> = {
  days: { one: '# day', other: '# days' }, dentists: { one: '# dentist', other: '# dentists' }, reviews: { one: '# review', other: '# reviews' },
  points: { one: '# point', other: '# points' }, hours: { one: '# hour', other: '# hours' }, minutes: { one: '# min', other: '# min' }, weeks: { one: '# week', other: '# weeks' },
};
// AR forms (Egyptian colloquial, copy-flows-ab.md uses "٣٠ يوم", "٣ أيام", "١٢٦ تقييم", "٢٥٠ نقطة", "٤ أسابيع"). zero/one/two forms = derived.
const AR: Record<Unit, Forms> = {
  days: { zero: '# يوم', one: 'يوم واحد', two: 'يومين', few: '# أيام', many: '# يوم', other: '# يوم' },
  dentists: { zero: '# دكتور أسنان', one: 'دكتور أسنان واحد', two: '٢ دكتور أسنان', few: '# دكاترة أسنان', many: '# دكتور أسنان', other: '# دكتور أسنان' },
  reviews: { zero: '# تقييم', one: 'تقييم واحد', two: 'تقييمين', few: '# تقييمات', many: '# تقييم', other: '# تقييم' },
  points: { zero: '# نقطة', one: 'نقطة واحدة', two: 'نقطتين', few: '# نقاط', many: '# نقطة', other: '# نقطة' },
  hours: { zero: '# ساعة', one: 'ساعة واحدة', two: 'ساعتين', few: '# ساعات', many: '# ساعة', other: '# ساعة' },
  minutes: { zero: '# دقيقة', one: 'دقيقة واحدة', two: 'دقيقتين', few: '# دقايق', many: '# دقيقة', other: '# دقيقة' },
  weeks: { zero: '# أسبوع', one: 'أسبوع واحد', two: 'أسبوعين', few: '# أسابيع', many: '# أسبوع', other: '# أسبوع' },
};
const rules = { en: new Intl.PluralRules('en'), ar: new Intl.PluralRules('ar') };
export function plural(n: number, unit: Unit, lang: Lang) {
  const cat = rules[lang].select(n);
  const forms = (lang === 'en' ? EN : AR)[unit];
  return (forms[cat] ?? forms.other).replace('#', lang === 'en' ? n.toLocaleString('en-US') : digits(n, lang));
}

/** Swap a copy-doc sample value for real data. The copy doc writes plain spaces and no bidi isolates; the formatters add NBSP / LRI-PDI: match both forms. */
export function swap(s: string, sample: string, real: string): string {
  const plain = sample.split(NBSP).join(' ').split(LRI).join('').split(PDI).join('');
  if (s.includes(sample)) return s.replace(sample, real);
  if (s.includes(plain)) return s.replace(plain, real);
  return s;
}
