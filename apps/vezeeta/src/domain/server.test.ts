// QA r2 7b: mock server data survives reload (build-spec-rules > Analytics + data); changed preset / reset reseeds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allBookings, api, clinicEvent, clinicEvents, configure, onServerChange, reset, restore, snapshot, type ServerSnapshot } from './server';

const reload = (stored: ServerSnapshot) => { reset(); configure({ preset: stored.preset }); return restore(JSON.parse(JSON.stringify(stored))); };

test('server state round-trips through storage: clinic move, keep, prefs, idempotency', async () => {
  reset(); configure({ preset: 'mon9', net: 'online', latency: 'fast' });
  let saved: ServerSnapshot | undefined;
  const off = onServerChange((s) => { saved = s; });
  clinicEvent('b-hana', 'moved', '2026-11-11T18:30');
  await api.savePrefs({ followUp: false, nextVisit: true, statusChanges: true });
  off();
  assert.ok(saved);
  const stored = JSON.parse(JSON.stringify(saved)) as ServerSnapshot; // localStorage = JSON
  assert.equal(reload(stored), true);
  const hana = allBookings().find((b) => b.id === 'b-hana')!;
  assert.equal(hana.status, 'movedByClinic'); assert.equal(hana.start, '2026-11-11T18:30'); assert.equal(hana.previousStart, '2026-11-10T19:00');
  assert.equal(clinicEvents().filter((e) => e.bookingId === 'b-hana' && e.type === 'moved').length, 1);
  assert.equal((await api.prefs()).followUp, false);
  assert.deepEqual(snapshot(), stored);
});

test('preset unchanged keeps a clinic move; changed preset reseeds', () => {
  reset(); configure({ preset: 'mon9' });
  clinicEvent('b-hana', 'moved', '2026-11-11T18:30');
  const stored = snapshot();
  reset(); configure({ preset: 'mon9' });
  assert.equal(restore(stored), true); // same preset (?preset=mon9 reload)
  assert.equal(allBookings().find((b) => b.id === 'b-hana')!.status, 'movedByClinic');
  configure({ preset: 'fri27' }); // changed preset = reseed
  assert.notEqual(allBookings().find((b) => b.id === 'b-hana')?.status, 'movedByClinic');
  reset(); configure({ preset: 'sun8' });
  assert.equal(restore(stored), false); // stored under another preset: ignored
});
