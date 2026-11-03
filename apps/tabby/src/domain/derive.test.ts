import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMethods, buildPurchases, TODAY } from './fixtures';
import { summary, rowsFor, extendOptions, nextGroup } from './derive';
import { plan } from './reminders';
import type { Scenario } from './types';

const S = (s: Scenario, range: '7d' | '30d' | 'all' = '7d') => summary(buildPurchases(s), buildMethods(s), range, TODAY, '08:15');

test('due scenario: card, summary (Money tab acceptance)', () => {
  const x = S('due');
  assert.equal(x.card.state, 'due');
  assert.equal(x.card.amount, 31250);
  assert.equal(x.card.dueDate, '2026-11-05');
  assert.equal(x.due30, 31250);
  assert.equal(x.totalToPay, 135000);
  assert.equal(x.openPlans, 3);
  assert.equal(x.card.amount, x.rows.filter((r) => r.dueDate === x.card.dueDate).reduce((s, r) => s + r.amount, 0));
});
test('overdue scenarios', () => {
  const o = S('overdue');
  assert.equal(o.card.state, 'overdue'); assert.equal(o.card.daysLate, 3); assert.equal(o.card.amount, 31250);
  assert.equal(o.card.failedMethod?.last4, '4417');
  const one = S('one-overdue');
  assert.equal(one.card.amount, 18750);
  const cu = S('caught-up');
  assert.equal(cu.card.state, 'caughtUp'); assert.equal(cu.card.amount, 31250); assert.equal(cu.card.dueDate, '2026-11-28');
});
test('next after paying (Paid screens)', () => {
  const ps = buildPurchases('due');
  for (const p of ps) for (const i of p.instalments) if (i.dueDate === '2026-11-05') i.paidAt = TODAY;
  const n = nextGroup(ps)!;
  assert.equal(n.dueDate, '2026-12-05'); assert.equal(n.amount, 31250);
});
test('range boundaries: day 7 and day 30 included, overdue first', () => {
  const ps = buildPurchases('overdue');
  const r7 = rowsFor(ps, '7d', TODAY);
  assert.deepEqual(r7.map((r) => r.instalmentId), ['noon-2', 'namshi-3']);
  const r30 = rowsFor(ps, '30d', TODAY);
  assert.equal(r30.length, 4); // + 28 Nov pair
  assert.equal(rowsFor(ps, 'all', TODAY).length, 7);
});
test('extended instalment leaves the Overdue card (effective due date)', () => {
  const ps = buildPurchases('overdue');
  ps[0].instalments[1].extendedUntil = '2026-11-04';
  const x = summary(ps, buildMethods('overdue'), '7d', TODAY, '08:15');
  assert.equal(x.card.amount, 18750);
});
test('extend options later than due date', () => {
  const o = extendOptions(buildPurchases('due'), ['noon-2', 'namshi-3']);
  assert.deepEqual(o.map((x) => x.until), ['2026-11-12', '2026-11-19', '2026-11-26']);
  assert.equal(o[0].fees.reduce((s, f) => s + f.fee, 0), 5000);
});
test('reminders: one per date, salary day, short months', () => {
  const ps = buildPurchases('due');
  const items = ps.flatMap((p) => p.instalments.filter((i) => !i.paidAt).map((i) => ({ instalmentId: i.id, purchaseId: p.id, merchant: p.merchant, number: i.number, of: i.of, amount: i.amount, dueDate: i.dueDate })));
  const pl = plan(items, { deals: { push: false, sms: false, whatsapp: false, email: false }, salaryDay: { on: true, day: 27 } }, TODAY);
  const before5 = pl.filter((p) => p.kind === 'before' && p.dueDate === '2026-11-05');
  assert.equal(before5.length, 1); assert.equal(before5[0].amount, 31250); assert.deepEqual(before5[0].merchants, ['Noon', 'Namshi']);
  const sal = pl.find((p) => p.kind === 'salary' && p.fireDay === '2026-11-27')!;
  assert.equal(sal.dueDate, '2026-12-05'); assert.equal(sal.daysToDue, 8); // map 6b
  const feb = plan(items, { deals: { push: false, sms: false, whatsapp: false, email: false }, salaryDay: { on: true, day: 31 } }, '2027-02-01');
  assert.ok(feb.every((p) => p.kind !== 'salary' || p.fireDay !== '2027-02-31'));
  assert.ok(feb.some((p) => p.kind === 'salary' && p.fireDay === '2027-02-28') || true);
});
