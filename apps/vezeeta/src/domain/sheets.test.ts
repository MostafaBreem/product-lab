// Task 11: live clinic-change sheets: which event -> which sheet, once, order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBookings, PRESETS } from './fixtures';
import { nextLive, seenKeys, sheetKey, sheetQueue } from './sheets';
import type { ClinicEvent } from './reminders';

const mon9 = PRESETS.mon9;
const bs = buildBookings('mon9');
const ev = (bookingId: string, type: ClinicEvent['type']): ClinicEvent => ({ bookingId, type, at: mon9 });

test('moved -> B2, cancelled -> B7, confirmed -> no sheet; moved first', () => {
  const q = sheetQueue([ev('b-hana', 'confirmed'), ev('b-sherif', 'cancelled'), ev('b-karim', 'moved')], bs, [], mon9);
  assert.deepEqual(q.map((x) => [x.type, x.bookingId]), [['moved', 'b-karim'], ['cancelled', 'b-sherif']]);
});

test('each event once: seen keys drop out; same event twice = one sheet', () => {
  const m = ev('b-karim', 'moved');
  assert.equal(sheetQueue([m, m], bs, [], mon9).length, 1);
  assert.deepEqual(sheetQueue([m, ev('b-sherif', 'cancelled')], bs, [sheetKey(m)], mon9).map((x) => x.type), ['cancelled']);
});

test('no sheet when the booking left that state (kept, rebooked) or is past', () => {
  const kept = bs.map((b) => (b.id === 'b-karim' ? { ...b, status: 'kept' as const } : b));
  assert.equal(sheetQueue([ev('b-karim', 'moved')], kept, [], mon9).length, 0);
  assert.equal(sheetQueue([ev('b-sherif', 'cancelled')], bs, [], PRESETS.fri27).length, 0);
  assert.equal(sheetQueue([ev('nope', 'cancelled')], bs, [], mon9).length, 0);
});

test('screenshot URL baseline: seeded events count as seen', () => {
  const es = [ev('b-hana', 'confirmed'), ev('b-karim', 'moved'), ev('b-sherif', 'cancelled')];
  assert.equal(sheetQueue(es, bs, seenKeys(es), mon9).length, 0);
  assert.equal(sheetKey(es[1]), `status_moved:b-karim:${mon9}`); // = reminder key (banner match)
});

test('queue hold (11b): held keys wait, a later event still opens', () => {
  const q = sheetQueue([ev('b-karim', 'moved'), ev('b-sherif', 'cancelled')], bs, [], mon9);
  assert.equal(nextLive(q, [])?.type, 'moved');
  assert.equal(nextLive(q.slice(1), [q[1].key]), undefined); // B2 acted on, B7 held until back on B1
  assert.equal(nextLive(q, [q[0].key])?.type, 'cancelled'); // not held = opens
  assert.equal(nextLive(q.slice(1), [])?.type, 'cancelled'); // hold released
});
