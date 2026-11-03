import { test } from 'node:test';
import assert from 'node:assert/strict';
import { money, dayDate, days, dueLine, addMonths, diffDays, weekday, ordinalDay, overdueTag, lastUpdate, LRI, PDI } from '../src/format.ts';

test('money', () => {
  assert.equal(money(31250, 'en'), '⃁ 312.50');
  assert.equal(money(135000, 'en'), '⃁ 1,350.00');
  assert.equal(money(31250, 'ar'), `${LRI}⃁ 312.50${PDI}`);
});
test('dates match the 2026 calendar', () => {
  assert.equal(dayDate('2026-10-31', 'en'), 'Sat 31 Oct');
  assert.equal(dayDate('2026-11-05', 'en'), 'Thu 5 Nov');
  assert.equal(dayDate('2026-10-28', 'en'), 'Wed 28 Oct');
  assert.equal(dayDate('2026-12-05', 'en'), 'Sat 5 Dec');
  assert.equal(weekday('2027-01-01'), 5);
  assert.equal(dayDate('2026-11-05', 'ar'), `الخميس ${LRI}5${PDI} نوفمبر`);
});
test('day counts', () => {
  assert.equal(days(1, 'en'), '1 day');
  assert.equal(days(1, 'ar'), 'يوم واحد');
  assert.equal(days(2, 'ar'), 'يومين');
  assert.equal(days(3, 'ar'), `${LRI}3${PDI} أيام`);
  assert.equal(days(28, 'ar'), `${LRI}28${PDI} يوم`);
  assert.equal(dueLine('2026-11-05', '2026-10-31', 'en'), 'Due in 5 days · Thu 5 Nov');
  assert.equal(dueLine('2026-11-01', '2026-10-31', 'en'), 'Due tomorrow · Sun 1 Nov');
  assert.equal(overdueTag(3, 'en'), 'Overdue · 3 days');
  assert.equal(diffDays('2026-12-05', '2026-10-31'), 35);
});
test('months and ordinals', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2026-10-28', 1), '2026-11-28');
  assert.equal(ordinalDay(27, 'en'), '27th');
  assert.equal(ordinalDay(1, 'en'), '1st');
  assert.equal(ordinalDay(12, 'en'), '12th');
  assert.equal(ordinalDay(22, 'en'), '22nd');
});
test('last update', () => {
  assert.equal(lastUpdate('2026-10-31', '08:15', '2026-10-31', 'en'), 'today 8:15 AM');
  assert.equal(lastUpdate('2026-10-30', '08:15', '2026-10-31', 'en'), 'yesterday 8:15 AM');
  assert.equal(lastUpdate('2026-10-29', '08:15', '2026-10-31', 'en'), 'Thu 29 Oct, 8:15 AM');
});
