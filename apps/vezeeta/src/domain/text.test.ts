// Task 10: sample-swap templates in ui/text.ts (copy has sample rows, no {x}): for a non-sample doctor / booking,
// no copy-doc sample value may remain in EN or AR (same idea as push.test leak check).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Doctor } from './types';
import { addrLine, bookCta, bookedLine, cancelledBody, cancelMovedBody, countGen, feeLine, fuRow, keptToast, nextLine, nextRow, pastFee, pastFuBody, pastFuTitle, pointsLine, visitOn, waitValue } from '../ui/text';

const L = (en: string, ar: string) => ({ en, ar });
// Not a copy sample: name, area, street, fee, wait, dates and times all differ from the copy doc.
const zeina: Doctor = { id: 'zeina', name: L('Zeina Mostafa', 'زينة مصطفى'), title: L('Orthodontist', 'أخصائي تقويم'), kind: 'specialist',
  area: L('Zamalek', 'الزمالك'), street: L('Brazil St', 'شارع البرازيل'), fee: 333, waitMin: 23, badges: [] } as Doctor;
const now = '2026-11-15T08:00';
const start = '2026-11-17T10:15'; // Tue 17 Nov, 10:15 AM (not today / tomorrow)
const prev = '2026-11-18T11:45';
const plain = (x: string) => x.replace(/[⁦⁩‏‎]/g, '').replace(/ /g, ' ');

const SAMPLES = {
  en: ['Nour Hassan', 'Laila Samir', 'Karim Adel', 'Sherif Fathy', 'Heliopolis', 'Merghany', 'Today', 'Mon 9 Nov', 'Mon 30 Nov', 'Mon 12 Oct', 'Sat 31 Oct', 'Fri 13 Nov', 'Thu 12 Nov',
    '9:30 PM', '7:00 PM', '6:30 PM', '250', '400', '38', '16', '21 days'],
  ar: ['نور حسن', 'ليلى سمير', 'كريم عادل', 'شريف فتحي', 'مصر الجديدة', 'الميرغني', 'النهارده', '٩ نوفمبر', '٣٠ نوفمبر', '١٢ أكتوبر', '٣١ أكتوبر', '١٣ نوفمبر', '١٢ نوفمبر',
    '٩:٣٠', '٧:٠٠', '٦:٣٠', '٢٥٠', '٤٠٠', '٣٨', '١٦', '٢١ يوم'],
};

test('text.ts templates: no copy sample value leaks for a non-sample doctor / booking (EN + AR)', () => {
  for (const lang of ['en', 'ar'] as const) {
    const fr = fuRow(zeina, '2026-12-04', lang); const nr = nextRow(zeina, '2026-10-20', lang);
    const out: Record<string, string> = {
      'a.next': nextLine(start, now, lang), 'a.wait': waitValue(zeina.waitMin!, lang), 'a2.addr': addrLine(zeina, lang)!, 'a.count.gen': countGen(7, lang),
      'a3.cta': bookCta(start, lang), 'a3.fee.v': feeLine(zeina.fee, lang), 'a3.points': pointsLine(zeina.fee, lang), 'a4.b': bookedLine(zeina, start, zeina.fee, lang),
      'b.fu.row': `${fr.title} ${fr.sub}`, 'b1.next.row': `${nr.title} ${nr.sub}`, 'b.canc.b': cancelledBody(zeina, start, lang), 'b2c.b': cancelMovedBody(zeina, start, lang),
      'b3.visit': visitOn(start, lang), 'b3.fu.t': pastFuTitle(zeina, lang), 'b3.fu.b': pastFuBody('2026-12-04', now, lang), 'b3.fee': pastFee(zeina.fee, lang), 'b2b.toast': keptToast(prev, lang),
    };
    for (const [id, s] of Object.entries(out)) {
      assert.ok(s, `${id} ${lang}: empty`);
      for (const leak of SAMPLES[lang]) assert.ok(!plain(s).includes(leak), `${id} ${lang}: sample "${leak}" left in "${s}"`);
    }
  }
});

test('text.ts templates: the real values are in (EN spot checks)', () => {
  assert.match(plain(bookCta(start, 'en')), /Tue 17 Nov, 10:15 AM/);
  assert.match(plain(feeLine(333, 'en')), /333 EGP/);
  assert.match(plain(bookedLine(zeina, start, 333, 'en')), /Dr Zeina Mostafa, Tue 17 Nov at 10:15 AM\. Pay 333 EGP/);
  assert.match(plain(addrLine(zeina, 'en')!), /^Zamalek, Brazil St\./);
  assert.equal(countGen(7, 'en'), '7 general dentists');
});
