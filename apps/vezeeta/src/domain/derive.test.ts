import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBookings, buildSlots, doctor, PRESETS } from './fixtures';
import { allBookings, api, configure, reset } from './server';
import { followUpSlots, nextSlot, isNorthStar, isPromptAttributed, northStar, past, prompts, upcoming, upcomingRows, visits, withinFollowUp } from './derive';
import { due, plan } from './reminders';
import { dayTime, egp, plural, rating } from './format';
import { normalisePhone, validateForm, validName } from './validate';
import { copy, fmtStrings } from './strings';
import type { ClinicEvent } from './reminders';
import type { Booking } from './types';

const prefs = { followUp: true, nextVisit: true, statusChanges: true as const };
const EV: ClinicEvent[] = [{ bookingId: 'b-hana', type: 'confirmed', at: PRESETS.mon9 }, { bookingId: 'b-karim', type: 'moved', at: PRESETS.mon9 }, { bookingId: 'b-sherif', type: 'cancelled', at: PRESETS.mon9 }];

test('Mon 9 Nov: row 1 Nour follow-up until Mon 30 Nov, row 2 Laila next visit, then action needed, then by start', () => {
  const bs = buildBookings('mon9');
  const rows = upcomingRows(bs, PRESETS.mon9);
  assert.deepEqual(rows[0], { kind: 'prompt', prompt: { type: 'followUp', doctorId: 'nour', visitId: 'b-nour-oct', until: '2026-11-30' } });
  assert.deepEqual(rows[1], { kind: 'prompt', prompt: { type: 'nextVisit', doctorId: 'laila', visitId: 'b-laila-oct', lastVisit: '2026-10-12' } });
  assert.deepEqual(upcoming(bs, PRESETS.mon9).map((b) => b.id), ['b-karim', 'b-sherif', 'b-hana']);
  assert.equal(dayTime('2026-11-30T10:00', 'en').startsWith('Mon 30 Nov'), true);
});

test('Sun 8 Nov 6 PM: follow-up row only (Laila day 27), bookings by start', () => {
  const bs = buildBookings('sun8');
  assert.deepEqual(prompts(bs, PRESETS.sun8).map((p) => `${p.type}:${p.doctorId}`), ['followUp:nour']);
  assert.deepEqual(upcoming(bs, PRESETS.sun8).map((b) => b.id), ['b-hana', 'b-karim', 'b-sherif']);
});

test('Fri 27 Nov: moved unresolved = visit at new time, cancelled dropped, follow-up still open', () => {
  const bs = buildBookings('fri27');
  const v = visits(bs, PRESETS.fri27).map((b) => b.id);
  assert.ok(v.includes('b-karim') && v.includes('b-hana') && !v.includes('b-sherif'));
  assert.deepEqual(upcoming(bs, PRESETS.fri27), []);
  assert.deepEqual(prompts(bs, PRESETS.fri27).map((p) => `${p.type}:${p.doctorId}`), ['followUp:nour', 'nextVisit:laila']);
  const p = past(bs, PRESETS.fri27);
  assert.deepEqual(p.top.map((b) => b.id), ['b-karim', 'b-hana']);
  assert.deepEqual(p.months.map((m) => m.month), ['2026-10', '2026-09']);
});

test('later booking with the doctor removes the prompt', () => {
  const bs: Booking[] = [...buildBookings('mon9'), { ...buildBookings('mon9')[3], id: 'new', start: '2026-11-20T18:00', kind: 'followUp', fee: 0 }];
  assert.ok(!prompts(bs, PRESETS.mon9).some((p) => p.doctorId === 'nour'));
});

test('follow-up expiry: window ends Mon 30 Nov; Dec 1 out; closes after until', () => {
  assert.ok(withinFollowUp('2026-11-30T21:30', '2026-11-30'));
  assert.ok(!withinFollowUp('2026-12-01T18:00', '2026-11-30'));
  const slots = buildSlots('nour', '2026-11-29T10:00', [], '2026-11-29');
  assert.deepEqual([...new Set(followUpSlots(slots, '2026-11-30').map((s) => s.start.slice(0, 10)))], ['2026-11-29', '2026-11-30']);
  const after = prompts(buildBookings('mon9'), '2026-12-01T10:00');
  assert.deepEqual(after.find((p) => p.doctorId === 'nour')?.type, 'nextVisit'); // ends -> next-visit row (day 31)
  assert.equal(fmtStrings.fuExpired('Mon 30 Nov', 'en'), 'Your free follow-up ended on Mon 30 Nov. Book a regular visit?');
});

test('slots: 6:00-9:30 PM every 30 min, 9:00 PM tomorrow taken', () => {
  const s = buildSlots('nour', PRESETS.sun8, []);
  assert.equal(s.filter((x) => x.start.startsWith('2026-11-08')).length, 8);
  assert.ok(s.find((x) => x.start === '2026-11-09T21:00')!.taken);
});

test('Laila (Round 2 fix): General dentist, Dokki · Mossadak St, 400 EGP, 15 min, has slots, not in A1 / A1b results', async () => {
  const l = doctor('laila')!;
  assert.deepEqual([l.kind, l.area?.en, l.street?.en, l.fee, l.waitMin], ['general', 'Dokki', 'Mossadak St', 400, 15]);
  const s = buildSlots('laila', PRESETS.sun8, []);
  assert.equal(s.length, buildSlots('nour', PRESETS.sun8, []).length);
  assert.ok(s.some((x) => !x.taken));
  configure({ latency: 'fast' });
  const [all, gen] = [await api.doctors('Toothache'), await api.doctors('Toothache', 'general')];
  assert.ok(!all.doctors.some((d) => d.id === 'laila') && !gen.doctors.some((d) => d.id === 'laila'));
  reset();
});

test('slotTaken: no booking made, slot stays struck in GET slots', async () => {
  reset(); configure({ latency: 'fast', nextBookingSlotTaken: true });
  const before = allBookings().length;
  const req = { doctorId: 'nour', start: '2026-11-09T19:00', patientName: 'Mona Saeed', phone: '+201012345678', kind: 'normal' as const, offersOptIn: false, consentVersion: 'a3.consent', idempotencyKey: 'k1', source: 'results_book' as const };
  await assert.rejects(api.createBooking(req), (e: { code: string }) => e.code === 'slotTaken');
  assert.equal(allBookings().length, before);
  assert.ok((await api.slots('nour', '2026-11-09', 1)).find((x) => x.start === '2026-11-09T19:00')!.taken);
  const ok = await api.createBooking({ ...req, start: '2026-11-09T18:00', idempotencyKey: 'k2' });
  assert.equal((await api.createBooking({ ...req, start: '2026-11-09T18:00', idempotencyKey: 'k2' })).id, ok.id);
  assert.equal(allBookings().length, before + 1);
  reset();
});

test('scheduler: Mon 9 Nov 10 AM due = followup_open, next_visit_4w (Laila), status_* per event', () => {
  const bs = buildBookings('mon9');
  const r = due(bs, EV, prefs, PRESETS.mon9, []);
  const types = r.due.map((x) => x.type).sort();
  assert.deepEqual(types, ['followup_open', 'next_visit_4w', 'status_cancelled', 'status_confirmed', 'status_moved']);
  assert.equal(r.due.find((x) => x.type === 'next_visit_4w')!.doctorId, 'laila');
});

test('scheduler: Fri 27 Nov 10 AM followup_ending due; once flags; opt-out cancels', () => {
  const bs = buildBookings('fri27');
  const fired = due(bs, EV, prefs, PRESETS.mon9, []).due.map((x) => x.key);
  const r = due(bs, EV, prefs, PRESETS.fri27, fired);
  assert.deepEqual(r.due.map((x) => `${x.type}:${x.doctorId}:${x.fireAt}`), ['followup_ending:nour:2026-11-27T10:00']);
  assert.deepEqual(due(bs, EV, { ...prefs, followUp: false }, PRESETS.fri27, fired).due, []);
  // Nour next_visit_4w waits until follow-up ends (Tue 1 Dec), not 28 Nov.
  assert.equal(plan(bs, EV, prefs, PRESETS.fri27).find((x) => x.type === 'next_visit_4w' && x.doctorId === 'nour')!.fireAt, '2026-12-01T10:00');
});

test('scheduler: clock jump fires newest per type only', () => {
  const bs = buildBookings('mon9');
  const r = due(bs, [], prefs, '2027-01-15T10:00', []);
  const w4 = r.due.filter((x) => x.type === 'next_visit_4w');
  assert.equal(w4.length, 1);
  assert.ok(r.skipped.some((x) => x.type === 'next_visit_4w'));
});

test('phone validation: Arabic digits, 0 / +20 / 0020, spaces; prefixes 10/11/12/15', () => {
  assert.equal(normalisePhone('010 1234 5678'), '+201012345678');
  assert.equal(normalisePhone('+20 10 1234 5678'), '+201012345678');
  assert.equal(normalisePhone('00201112345678'), '+201112345678');
  assert.equal(normalisePhone('٠١٢٣٤٥٦٧٨٩٠'), '+201234567890');
  assert.equal(normalisePhone('1512345678'), '+201512345678');
  assert.equal(normalisePhone('01312345678'), null);
  assert.equal(normalisePhone('010123'), null);
  assert.ok(validName('Mona Saeed') && validName('منى سعيد') && !validName('M') && !validName('Mona1'));
  assert.equal(validateForm({ name: '', phone: 'x', email: 'a@b' }).first, 'name');
});

test('plurals AR (zero/one/two/few/many/other) + EN', () => {
  assert.equal(plural(30, 'days', 'ar'), '٣٠ يوم');
  assert.equal(plural(3, 'days', 'ar'), '٣ أيام');
  assert.equal(plural(2, 'days', 'ar'), 'يومين');
  assert.equal(plural(1, 'days', 'ar'), 'يوم واحد');
  assert.equal(plural(0, 'days', 'ar'), '٠ يوم');
  assert.equal(plural(126, 'reviews', 'ar'), '١٢٦ تقييم');
  assert.equal(plural(250, 'points', 'ar'), '٢٥٠ نقطة');
  assert.equal(plural(4, 'weeks', 'ar'), '٤ أسابيع');
  assert.equal(plural(1, 'days', 'en'), '1 day');
  assert.equal(plural(142, 'dentists', 'en'), '142 dentists');
  assert.equal(plural(3, 'hours', 'en'), '3 hours');
});

test('formats: EGP no-break space, AR digits, rating', () => {
  assert.equal(egp(250, 'en'), '250 EGP');
  assert.equal(egp(250, 'ar'), '٢٥٠ جنيه');
  assert.equal(rating(4.9, 'ar'), '٤٫٩');
  assert.equal(dayTime('2026-11-09T19:00', 'en'), 'Mon 9 Nov, 7:00 PM');
  assert.equal(copy['a3.when.v'].en, 'Mon 9 Nov, 7:00 PM');
});

test('north star numerator: <= 90 days, any source except cancelled_card + moved_pick', () => {
  assert.ok(isNorthStar({ source: 'results_book', daysSincePrevVisitSameDoctor: 90 }));
  assert.ok(!isNorthStar({ source: 'results_book', daysSincePrevVisitSameDoctor: 91 }));
  assert.ok(!isNorthStar({ source: 'results_book' }));
  assert.ok(!isNorthStar({ source: 'cancelled_card', daysSincePrevVisitSameDoctor: 10 }));
  assert.ok(!isNorthStar({ source: 'moved_pick', daysSincePrevVisitSameDoctor: 10 }));
  assert.ok(isPromptAttributed({ source: 'push_followup', daysSincePrevVisitSameDoctor: 10 }));
  assert.ok(!isPromptAttributed({ source: 'past_book_again', daysSincePrevVisitSameDoctor: 10 }));
  assert.deepEqual(northStar([{ source: 'followup_row', daysSincePrevVisitSameDoctor: 9 }, { source: 'moved_pick', daysSincePrevVisitSameDoctor: 3 }, { source: 'results_card', daysSincePrevVisitSameDoctor: 40 }], 3),
    { numerator: 2, denominator: 3, promptAttributed: 1 });
});

test('Karim next slot at Sun 8 Nov 6 PM = Today 9:30 PM (6:00-9:00 PM taken); other days untouched', () => {
  const s = buildSlots('karim', PRESETS.sun8, buildBookings('sun8'));
  assert.equal(nextSlot(s, PRESETS.sun8)!.start, '2026-11-08T21:30');
  assert.equal(s.find((x) => x.start === '2026-11-10T18:00')!.taken, false);
  assert.equal(nextSlot(buildSlots('nour', PRESETS.sun8, []), PRESETS.sun8)!.start, '2026-11-08T18:00');
});

test('followup_open fires at the later of visit end and 10:00 AM that day', () => {
  const b = (start: string): Booking => ({ ...buildBookings('sun8').find((x) => x.id === 'b-nour-oct')!, start });
  const fire = (start: string) => plan([b(start)], [], prefs, '2026-11-08T18:00').find((x) => x.type === 'followup_open')!.fireAt;
  assert.equal(fire('2026-10-31T19:00'), '2026-10-31T19:00');
  assert.equal(fire('2026-10-31T08:30'), '2026-10-31T10:00');
});

test('status_* fire per clinic event, not newest-only; clock jump still collapses other types', () => {
  const bs = buildBookings('mon9');
  const ev: ClinicEvent[] = [
    { bookingId: 'b-karim', type: 'moved', at: '2026-11-09T09:00' },
    { bookingId: 'b-karim', type: 'moved', at: '2026-11-09T09:30' },
    { bookingId: 'b-hana', type: 'moved', at: '2026-11-09T09:45' },
  ];
  const r = due(bs, ev, prefs, '2027-01-15T10:00', []);
  assert.equal(r.due.filter((x) => x.type === 'status_moved').length, 3);
  assert.ok(!r.skipped.some((x) => x.type.startsWith('status_')));
  assert.equal(r.due.filter((x) => x.type === 'next_visit_4w').length, 1);
});

test('Q3: A1 Next = A2 first free slot (nextSlot) at sun8 for Nour + Sherif; Q9 AR initials', async () => {
  const { configure, api } = await import('./server');
  const { PRESETS, doctor } = await import('./fixtures');
  const { nextSlot } = await import('./derive');
  const { nextLine, initials } = await import('../ui/text');
  configure({ preset: 'sun8', now: PRESETS.sun8, latency: 'fast' });
  for (const id of ['nour', 'sherif']) {
    const a1 = nextSlot(await api.slots(id, '2026-11-08', 7), PRESETS.sun8)!;
    const a2 = (await api.slots(id, '2026-11-08', 3)).find((s) => !s.taken)!;
    assert.equal(a1.start, a2.start);
    assert.equal(nextLine(a1.start, PRESETS.sun8, 'en').replace(/ /g, ' '), 'Next: Today 6:00 PM');
  }
  configure({ preset: 'mon9', now: PRESETS.mon9 });
  assert.equal(initials(doctor('karim')!, 'ar'), 'ك ع');
  assert.equal(initials(doctor('karim')!, 'en'), 'KA');
});
