// Task 3a: B1 Upcoming order + prompt rows at preset Mon 9 Nov (Acceptance card 2); flow B text templates; A4 follow-up line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prompts, upcoming, upcomingRows } from './derive';
import { buildBookings, doctor, PRESETS } from './fixtures';
import { cancelledBody, bookedLine, fuRow, nextRow, pastFuBody, visitOn, wasLine } from '../ui/text';

test('B1 at Mon 9 Nov: row 1 Nour follow-up, row 2 Laila next visit, then action needed (moved, cancelled), then others by start', () => {
  const rows = upcomingRows(buildBookings('mon9'), PRESETS.mon9);
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map((r) => (r.kind === 'prompt' ? `${r.prompt.type}:${r.prompt.doctorId}` : r.booking.id)),
    ['followUp:nour', 'nextVisit:laila', 'b-karim', 'b-sherif', 'b-hana']);
});

test('B1 prompt row strings at Mon 9 Nov match the mock', () => {
  const [fu, nv] = prompts(buildBookings('mon9'), PRESETS.mon9);
  assert.equal(fu.type, 'followUp'); assert.equal(nv.type, 'nextVisit');
  if (fu.type !== 'followUp' || nv.type !== 'nextVisit') return;
  assert.deepEqual(fuRow(doctor('nour')!, fu.until, 'en'), { title: 'Free follow-up with Dr Nour Hassan', sub: 'Book by Mon 30 Nov', cta: 'Book' });
  assert.deepEqual(nextRow(doctor('laila')!, nv.lastVisit, 'en'), { title: 'Next visit with Dr Laila Samir?', sub: 'Last visit Mon 12 Oct', cta: 'Book' });
  assert.equal(fuRow(doctor('nour')!, fu.until, 'ar').sub, 'احجزها لحد الإثنين ٣٠ نوفمبر');
});

test('cancelled by patient stays in Upcoming until its date, then drops', () => {
  const bs = buildBookings('mon9').map((b) => (b.id === 'b-hana' ? { ...b, status: 'cancelledByPatient' as const } : b));
  assert.ok(upcoming(bs, PRESETS.mon9).some((b) => b.id === 'b-hana'));
  assert.ok(!upcoming(bs, '2026-11-10T08:00').some((b) => b.id === 'b-hana'));
});

test('flow B templates: moved Was line, cancelled body, B3 follow-up body, visit on', () => {
  assert.equal(wasLine('2026-11-11T19:00', 'en'), 'Was Wed 11 Nov, 7:00 PM');
  assert.equal(cancelledBody(doctor('sherif')!, '2026-11-13T19:00', 'en'), "Dr Sherif Fathy can't see patients on Fri 13 Nov. Sorry about this. You pay at the clinic, so nothing was charged.");
  assert.equal(pastFuBody('2026-11-30', PRESETS.mon9, 'en'), 'Book by Mon 30 Nov. 21 days left.');
  assert.equal(visitOn('2026-10-12T19:00', 'en'), 'Visit on Mon 12 Oct');
});

test('A4 follow-up (fee 0): first sentence of a4.b only', () => {
  assert.equal(bookedLine(doctor('nour')!, '2026-11-11T18:00', 0, 'en'), 'Dr Nour Hassan, Wed 11 Nov at 6:00 PM.');
  assert.equal(bookedLine(doctor('nour')!, '2026-11-11T18:00', 0, 'ar'), 'د. نور حسن، الأربعاء ١١ نوفمبر الساعة ⁦٦:٠٠⁩ م.');
  assert.match(bookedLine(doctor('nour')!, '2026-11-11T18:00', 250, 'en'), /Pay 250.EGP at the clinic\.$/);
});
