// Mock API (build-spec-data.md > Mock API). In-memory "server" state per scenario; debug settings drive results.
import { MockError, mockCall, sleep, type Latency, type Net } from '@lab/app-kit/mock';
import * as fmt from '@lab/app-kit/format';
import { buildMethods, buildPurchases, NOW_TIME, TODAY } from './fixtures';
import { extendOptions, nextGroup, summary, toItem, unpaid } from './derive';
import type { Item, NotificationPrefs, Payment, PaymentMethod, Purchase, Range, Scenario } from './types';

export type PayResult = 'success' | 'declined' | 'unknown' | 'unknown-resolves';
export type Settings = { scenario: Scenario; net: Net; latency: Latency; payResult: PayResult; today: string };
export const defaultSettings: Settings = { scenario: 'due', net: 'online', latency: 'normal', payResult: 'success', today: TODAY };

type State = { purchases: Purchase[]; methods: PaymentMethod[]; payments: Map<string, Payment & { resolveTo?: 'succeeded' | 'declined'; resolveAt?: number }>; prefs: NotificationPrefs; seq: number };
let settings: Settings = { ...defaultSettings };
let state: State = fresh(settings.scenario);

function fresh(s: Scenario): State {
  return { purchases: buildPurchases(s), methods: buildMethods(s), payments: new Map(), prefs: { deals: { push: false, sms: false, whatsapp: false, email: false }, salaryDay: { on: false, day: null } }, seq: 0 };
}
export function configure(next: Partial<Settings>) {
  const prev = settings;
  settings = { ...settings, ...next };
  if (next.scenario && next.scenario !== prev.scenario) { const prefs = state.prefs; state = fresh(settings.scenario); state.prefs = prefs; }
}
export const getSettings = () => settings;
const call = <T,>(normalMs: number, run: () => T, timeoutMs = 30000) => mockCall({ net: settings.net, latency: settings.latency, normalMs, timeoutMs }, run);
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const itemsOf = (ids: string[]): Item[] => state.purchases.flatMap((p) => p.instalments.filter((i) => ids.includes(i.id)).map((i) => toItem(p, i)));

/** Settle any "unknown" payments whose poll window ended (mock server truth: paid). */
function settle(now = Date.now()) {
  for (const p of state.payments.values()) {
    if (p.status === 'unknown' && p.resolveAt && now >= p.resolveAt) applyResult(p, p.resolveTo ?? 'succeeded');
  }
}
function applyResult(p: Payment & { resolveTo?: string; resolveAt?: number }, status: 'succeeded' | 'declined') {
  p.status = status;
  p.resolveAt = undefined;
  if (status === 'succeeded') {
    for (const pur of state.purchases) for (const i of pur.instalments) if (p.items.some((x) => x.instalmentId === i.id)) i.paidAt = settings.today;
    for (const m of state.methods) if (m.id === p.methodId) m.lastFailureAt = undefined;
  } else {
    for (const m of state.methods) if (m.id === p.methodId && m.type === 'card') m.lastFailureAt = settings.today;
  }
}

export const api = {
  summary: (range: Range) => call(600, () => { settle(); return clone(summary(state.purchases, state.methods, range, settings.today, NOW_TIME)); }),
  rows: (range: Range) => call(400, () => { settle(); return clone(summary(state.purchases, state.methods, range, settings.today, NOW_TIME).rows); }),
  purchase: (id: string) => call(500, () => {
    const p = state.purchases.find((x) => x.id === id);
    if (!p) throw new MockError('notFound', true);
    return clone(p);
  }),
  async pay(instalmentIds: string[], methodId: string, idempotencyKey: string) {
    const existing = state.payments.get(idempotencyKey);
    return call(1500, () => {
      if (existing) return clone({ payment: existing, next: nextGroup(state.purchases), stillOverdue: overdueItems() });
      const items = itemsOf(instalmentIds);
      const p: Payment & { resolveTo?: 'succeeded' | 'declined'; resolveAt?: number } = { id: `pay-${++state.seq}`, items, amount: items.reduce((s, x) => s + x.amount, 0), methodId, status: 'unknown', createdAt: settings.today };
      state.payments.set(idempotencyKey, p);
      const r = settings.payResult;
      if (r === 'success') applyResult(p, 'succeeded');
      else if (r === 'declined') applyResult(p, 'declined');
      else { p.resolveTo = 'succeeded'; p.resolveAt = Date.now() + (r === 'unknown-resolves' ? 10000 : 31000); }
      return clone({ payment: p, next: nextGroup(state.purchases), stillOverdue: overdueItems() });
    });
  },
  paymentStatus: (key: string) => call(300, () => { settle(); const p = state.payments.get(key); if (!p) throw new MockError('notFound', true); return clone({ payment: p, next: nextGroup(state.purchases), stillOverdue: overdueItems() }); }),
  extendOptions: (ids: string[]) => call(400, () => clone(extendOptions(state.purchases, ids))),
  extend: (ids: string[], until: string) => call(1200, () => {
    const out: { instalmentId: string; until: string; fee: number; item: Item }[] = [];
    for (const pur of state.purchases) for (const i of pur.instalments) if (ids.includes(i.id)) {
      if (!i.extendable || i.extendedAt) throw new MockError('notEligible', true);
      i.extendedUntil = until; i.extendedAt = settings.today; i.extensionFee = pur.extendFee; i.extendable = false;
      out.push({ instalmentId: i.id, until, fee: pur.extendFee, item: toItem(pur, i) });
    }
    return clone({ extended: out, totalFee: out.reduce((s, x) => s + x.fee, 0), stillOverdue: overdueItems() });
  }),
  prefs: () => call(300, () => clone(state.prefs)),
  savePrefs: (p: NotificationPrefs) => call(300, () => { state.prefs = clone(p); return clone(p); }),
  /** Scheduler input: every unpaid instalment (range=all), no latency gate in the demo. */
  allUnpaid: () => clone(unpaid(state.purchases)),
};
function overdueItems(): Item[] { return unpaid(state.purchases).filter((x) => fmt.diffDays(x.dueDate, settings.today) < 0); }
export { sleep };
