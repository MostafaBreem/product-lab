// Number, money and date formats (build-spec-data.md > Formats). Pure functions, unit tested.
export type Lang = 'en' | 'ar';
export const LRI = '⁦';
export const PDI = '⁩';
export const RIYAL = '⃁';

/** Wrap a run of numbers / Latin in an LTR isolate inside Arabic text. */
export const ltr = (s: string, lang: Lang) => (lang === 'ar' ? `${LRI}${s}${PDI}` : s);

/** Halalas (integer, 100 = ⃁ 1) to "⃁ 1,350.00". Western digits in both languages. */
export function money(halalas: number, lang: Lang): string {
  const neg = halalas < 0;
  const abs = Math.abs(Math.round(halalas));
  const whole = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const s = `${neg ? '-' : ''}${RIYAL} ${whole}.${String(abs % 100).padStart(2, '0')}`;
  return ltr(s, lang);
}

// Dates are calendar days as "YYYY-MM-DD" (no time zone drift).
export type Day = string;
const toUTC = (d: Day) => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd); };
export const addDays = (d: Day, n: number): Day => new Date(toUTC(d) + n * 86400000).toISOString().slice(0, 10);
export const diffDays = (a: Day, b: Day) => Math.round((toUTC(a) - toUTC(b)) / 86400000); // a - b
export function addMonths(d: Day, n: number): Day {
  const [y, m, dd] = d.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(dd, last))).toISOString().slice(0, 10);
}
export const weekday = (d: Day) => new Date(toUTC(d)).getUTCDay();

const EN_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AR_WD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const AR_MO = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/** "Thu 5 Nov" · "الخميس 5 نوفمبر" (copy-key-strings.md). */
export function dayDate(d: Day, lang: Lang): string {
  const [, m, dd] = d.split('-').map(Number);
  const wd = weekday(d);
  return lang === 'ar' ? `${AR_WD[wd]} ${ltr(String(dd), lang)} ${AR_MO[m - 1]}` : `${EN_WD[wd]} ${dd} ${EN_MO[m - 1]}`;
}

/** EN plural: 1 day / N days. AR (Saudi colloquial, copy-build-gaps.md): 1 يوم واحد, 2 يومين, 3–10 أيام, 11+ يوم. */
export function days(n: number, lang: Lang): string {
  if (lang === 'en') return n === 1 ? '1 day' : `${n} days`;
  if (n === 1) return 'يوم واحد';
  if (n === 2) return 'يومين';
  return `${ltr(String(n), lang)} ${n >= 3 && n <= 10 ? 'أيام' : 'يوم'}`;
}

/** Due line on the Payment card (g1–g5): "Due today · Thu 5 Nov", "Due in 5 days · Thu 5 Nov". */
export function dueLine(due: Day, today: Day, lang: Lang): string {
  const n = diffDays(due, today);
  const date = dayDate(due, lang);
  if (lang === 'en') {
    if (n === 0) return `Due today · ${date}`;
    if (n === 1) return `Due tomorrow · ${date}`;
    return `Due in ${days(n, lang)} · ${date}`;
  }
  if (n === 0) return `موعدها اليوم · ${date}`;
  if (n === 1) return `موعدها بكرة · ${date}`;
  return `موعدها بعد ${days(n, lang)} · ${date}`;
}

/** "Due in 28 days" without the date (Paid next payment subtitle). */
export function dueIn(due: Day, today: Day, lang: Lang): string {
  const n = diffDays(due, today);
  if (lang === 'en') return n === 0 ? 'Due today' : n === 1 ? 'Due tomorrow' : `Due in ${days(n, lang)}`;
  return n === 0 ? 'موعدها اليوم' : n === 1 ? 'موعدها بكرة' : `موعدها بعد ${days(n, lang)}`;
}

/** Tag: "Overdue · 3 days" · "متأخرة · 3 أيام". */
export const overdueTag = (n: number, lang: Lang) => (lang === 'en' ? `Overdue · ${days(n, lang)}` : `متأخرة · ${days(n, lang)}`);

/** Day of month: EN "27th", AR "يوم 27" (copy-ar-reminders r8). "last" handled by caller copy. */
export function ordinalDay(n: number, lang: Lang): string {
  if (lang === 'ar') return `يوم ${ltr(String(n), lang)}`;
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${s}`;
}

/** "8:15 AM" · "8:15 ص". */
export function clock(hhmm: string, lang: Lang): string {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  return lang === 'en' ? `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}` : `${ltr(`${h12}:${mm}`, lang)} ${h < 12 ? 'ص' : 'م'}`;
}

/** Last update stamp (g14, g15): today / yesterday / day date. */
export function lastUpdate(asOfDay: Day, asOfTime: string, today: Day, lang: Lang): string {
  const n = diffDays(today, asOfDay);
  const time = clock(asOfTime, lang);
  if (lang === 'en') return n === 0 ? `today ${time}` : n === 1 ? `yesterday ${time}` : `${dayDate(asOfDay, lang)}, ${time}`;
  return n === 0 ? `اليوم ${time}` : n === 1 ? `أمس ${time}` : `${dayDate(asOfDay, lang)}، ${time}`;
}
