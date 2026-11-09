// Task 3b: push routing (build-spec.md > push taps, deep link), B2 keep flow, reminder due firing once, B2c late rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBookings, PRESETS } from './fixtures';
import { linkData, linkTarget, pushTarget, pushText } from './push';
import { fireDue } from './reminders';
import { allBookings, api, clinicEvent, clinicEvents, configure, reset } from './server';
import { underThreeHours } from './derive';
import { keptToast } from '../ui/text';

const mon9 = PRESETS.mon9;
const bs = buildBookings('mon9');
const prefs = { followUp: true, nextVisit: true, statusChanges: true as const };

test('push tap routing at Mon 9 Nov: confirmed -> B1 card, moved -> B2, cancelled -> B7 sheet over B1 (task 11), follow-up / next visit -> A2 matching mode', () => {
  assert.deepEqual(pushTarget({ type: 'status_confirmed', bookingId: 'b-hana' }, bs, mon9), { to: 'b1', bookingId: 'b-hana' });
  assert.deepEqual(pushTarget({ type: 'status_moved', bookingId: 'b-karim' }, bs, mon9), { to: 'b2', bookingId: 'b-karim' });
  assert.deepEqual(pushTarget({ type: 'status_cancelled', bookingId: 'b-sherif' }, bs, mon9), { to: 'b7', bookingId: 'b-sherif' });
  assert.deepEqual(pushTarget({ type: 'followup_open', bookingId: 'b-nour-oct', doctorId: 'nour' }, bs, mon9), { to: 'a2', doctorId: 'nour', mode: 'followUp', source: 'push_followup' });
  assert.deepEqual(pushTarget({ type: 'next_visit_4w', bookingId: 'b-laila-oct', doctorId: 'laila' }, bs, mon9), { to: 'a2', doctorId: 'laila', mode: 'normal', source: 'push_next_visit' });
});

test('push / deep link to unknown, resolved or past booking -> stale (B1 + Toast)', () => {
  assert.deepEqual(pushTarget({ type: 'status_moved', bookingId: 'nope' }, bs, mon9), { to: 'stale' });
  const kept = bs.map((b) => (b.id === 'b-karim' ? { ...b, status: 'kept' as const } : b));
  assert.deepEqual(pushTarget({ type: 'status_moved', bookingId: 'b-karim' }, kept, mon9), { to: 'stale' });
  assert.deepEqual(pushTarget({ type: 'status_confirmed', bookingId: 'b-hana' }, bs, PRESETS.fri27), { to: 'stale' });
  assert.deepEqual(linkTarget('b-karim', bs, mon9), { to: 'b2', bookingId: 'b-karim' });
  assert.deepEqual(linkTarget('b-hana', bs, mon9), { to: 'b1', bookingId: 'b-hana' });
  assert.deepEqual(linkTarget('nope', bs, mon9), { to: 'stale' });
  assert.deepEqual(linkData('b-karim', undefined, bs), { type: 'status_moved', bookingId: 'b-karim' });
  assert.deepEqual(linkData('nope', 'status_cancelled', bs), { type: 'status_cancelled', bookingId: 'nope' });
});

test('push text matches mock B5 / B5b (EN)', () => {
  assert.deepEqual(pushText({ type: 'status_confirmed', bookingId: 'b-hana' }, bs, 'en'), { title: 'Dr Hana Youssef confirmed your visit', body: 'Tomorrow, Tue 10 Nov at 7:00\u00a0PM. Tap for directions.' });
  assert.deepEqual(pushText({ type: 'status_moved', bookingId: 'b-karim' }, bs, 'en'), { title: 'Your visit was moved', body: 'Now Thu 12 Nov, 6:30\u00a0PM. Tap to keep it or pick another time.' });
  assert.deepEqual(pushText({ type: 'status_cancelled', bookingId: 'b-sherif' }, bs, 'en'), { title: 'Dr Sherif Fathy cancelled Fri 13 Nov', body: 'Sorry about this. Tap to book another time.' });
  assert.deepEqual(pushText({ type: 'followup_ending', doctorId: 'nour' }, bs, 'en', '2026-11-30'), { title: 'Free follow-up ends in 3 days', body: 'Book it with Dr Nour Hassan by Mon 30 Nov.' });
  assert.equal(pushText({ type: 'status_moved', bookingId: 'b-karim' }, bs, 'ar').body.replace(/[\u2066\u2069]/g, ''), 'بقى الخميس ١٢ نوفمبر الساعة ٦:٣٠\u00a0م. دوس وخلّيه أو اختار ميعاد تاني.');
  // Designer AR fix 2026-11-09 (gender-neutral b5.1 / b5.3): sample values still swap.
  const bidi = (x: { title: string; body: string }) => ({ title: x.title.replace(/[\u2066\u2069]/g, ''), body: x.body.replace(/[\u2066\u2069]/g, '') });
  assert.deepEqual(bidi(pushText({ type: 'status_confirmed', bookingId: 'b-hana' }, bs, 'ar')), { title: 'ميعادك مع د. هنا يوسف اتأكّد', body: 'بكرة الثلاثاء ١٠ نوفمبر الساعة ٧:٠٠\u00a0م. دوس وشوف الطريق.' });
  assert.deepEqual(bidi(pushText({ type: 'status_cancelled', bookingId: 'b-sherif' }, bs, 'ar')), { title: 'ميعادك مع د. شريف فتحي يوم الجمعة ١٣ نوفمبر اتلغى', body: 'آسفين على كده. دوس واحجز ميعاد تاني.' });
  // Swap: Sherif's cancel text on Karim's booking (Thu 12 Nov) -> Karim + Thu 12 Nov.
  const swapped = bs.map((b) => (b.id === 'b-sherif' ? { ...b, doctorId: 'karim', start: '2026-11-12T18:30' } : b));
  assert.equal(bidi(pushText({ type: 'status_cancelled', bookingId: 'b-sherif' }, swapped, 'ar')).title, 'ميعادك مع د. كريم عادل يوم الخميس ١٢ نوفمبر اتلغى');
  assert.equal(pushText({ type: 'next_visit_10w', doctorId: 'laila' }, bs, 'en').body, "It's been 10 weeks since your last visit. Tap to pick a time.");
});

test('B2 keep: POST keep -> status kept, moved push goes stale, B2b toast text = mock', async () => {
  reset(); configure({ preset: 'mon9', now: mon9 }); configure({ latency: 'fast' });
  const b = await api.keep('b-karim');
  assert.equal(b.status, 'kept');
  assert.equal(b.start, '2026-11-12T18:30');
  assert.deepEqual(pushTarget({ type: 'status_moved', bookingId: 'b-karim' }, allBookings(), mon9), { to: 'stale' });
  assert.equal(keptToast(b.start, 'en'), 'Visit kept: Thu 12 Nov, 6:30 PM');
  assert.equal(keptToast(b.start, 'ar').replace(/[\u2066\u2069]/g, ''), 'تمام، ميعادك الخميس ١٢ نوفمبر الساعة ٦:٣٠ م');
});

test('reminders: due items fire once (once flags); a new clinic event fires its status push once', () => {
  reset(); configure({ preset: 'mon9', now: mon9 });
  const a = fireDue(allBookings(), clinicEvents(), prefs, mon9, []);
  assert.ok(a.fire.some((r) => r.type === 'status_moved' && r.bookingId === 'b-karim'));
  assert.equal(a.fire.filter((r) => r.type.startsWith('status_')).length, 3);
  const b = fireDue(allBookings(), clinicEvents(), prefs, mon9, a.fired);
  assert.deepEqual(b.fire, []);
  clinicEvent('b-hana', 'moved', '2026-11-11T18:30');
  const c = fireDue(allBookings(), clinicEvents(), prefs, mon9, b.fired);
  assert.deepEqual(c.fire.map((r) => `${r.type}:${r.bookingId}`), ['status_moved:b-hana']);
  assert.deepEqual(fireDue(allBookings(), clinicEvents(), prefs, mon9, c.fired).fire, []);
});

test('B2c late rule: under 3 hours before the visit', () => {
  assert.ok(underThreeHours('2026-11-09T12:59', '2026-11-09T10:00'));
  assert.ok(!underThreeHours('2026-11-09T13:00', '2026-11-09T10:00'));
  assert.ok(!underThreeHours('2026-11-09T09:00', '2026-11-09T10:00'));
});

test('Q2: clinic-event push text uses THAT booking (not the copy sample), every template, EN + AR', () => {
  const plain = (x: string) => x.replace(/[⁦⁩]/g, '').replace(/ /g, ' ');
  // Hana moved by the clinic to Wed 11 Nov 6:30 PM (debug move = next day, 30 min earlier).
  const moved = bs.map((b) => (b.id === 'b-hana' ? { ...b, previousStart: b.start, start: '2026-11-11T18:30', status: 'movedByClinic' as const } : b));
  const m = pushText({ type: 'status_moved', bookingId: 'b-hana' }, moved, 'en');
  assert.equal(plain(m.body), 'Now Wed 11 Nov, 6:30 PM. Tap to keep it or pick another time.');
  assert.equal(plain(pushText({ type: 'status_moved', bookingId: 'b-hana' }, moved, 'ar').body), 'بقى الأربعاء ١١ نوفمبر الساعة ٦:٣٠ م. دوس وخلّيه أو اختار ميعاد تاني.');
  // Confirmed on Karim (Thu 12 Nov 6:30 PM): his name, day and time.
  const c = pushText({ type: 'status_confirmed', bookingId: 'b-karim' }, bs, 'en');
  assert.equal(c.title, 'Dr Karim Adel confirmed your visit');
  assert.equal(plain(c.body), 'Tomorrow, Thu 12 Nov at 6:30 PM. Tap for directions.');
  assert.equal(plain(pushText({ type: 'status_confirmed', bookingId: 'b-karim' }, bs, 'ar').body), 'بكرة الخميس ١٢ نوفمبر الساعة ٦:٣٠ م. دوس وشوف الطريق.');
  // Cancelled on Hana: her name + day.
  assert.equal(pushText({ type: 'status_cancelled', bookingId: 'b-hana' }, bs, 'en').title, 'Dr Hana Youssef cancelled Tue 10 Nov');
  assert.equal(pushText({ type: 'status_cancelled', bookingId: 'b-hana' }, bs, 'ar').title, 'ميعادك مع د. هنا يوسف يوم الثلاثاء ١٠ نوفمبر اتلغى');
  // Follow-up open / ending on Hana until Fri 20 Nov; next visit 4w / 10w on Karim.
  for (const type of ['followup_open', 'followup_ending'] as const) {
    assert.equal(pushText({ type, doctorId: 'hana' }, bs, 'en', '2026-11-20').body, 'Book it with Dr Hana Youssef by Fri 20 Nov.');
    assert.equal(pushText({ type, doctorId: 'hana' }, bs, 'ar', '2026-11-20').body, 'احجزها مع د. هنا يوسف لحد الجمعة ٢٠ نوفمبر.');
  }
  assert.equal(pushText({ type: 'next_visit_4w', doctorId: 'karim' }, bs, 'en').title, 'Next visit with Dr Karim Adel?');
  assert.equal(pushText({ type: 'next_visit_10w', doctorId: 'karim' }, bs, 'en').body, "It's been 10 weeks since your last visit. Tap to pick a time.");
  assert.equal(pushText({ type: 'next_visit_10w', doctorId: 'karim' }, bs, 'ar').body, 'عدّى ١٠ أسابيع على آخر زيارة. دوس واختار ميعاد.');
  // No sample value leaks into any template for a non-sample booking.
  for (const lang of ['en', 'ar'] as const) for (const type of ['status_confirmed', 'status_moved', 'status_cancelled'] as const) {
    const x = pushText({ type, bookingId: 'b-hana' }, moved, lang); const all = plain(`${x.title} ${x.body}`);
    for (const leak of ['Thu 12 Nov', 'Fri 13 Nov', 'Karim', 'Sherif']) assert.ok(!all.includes(leak), `${type} ${lang}: ${leak}`);
  }
});
