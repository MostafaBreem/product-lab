// App store: debug settings (mock clock, net, latency, one-shot errors), language, reminder once-flags, cached bookings, event log.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, useColorScheme } from 'react-native';
import { ev, onEvent, setClock, setCommon, type Logged } from './domain/analytics';
import { crossed, visits } from './domain/derive';
import { PRESETS } from './domain/fixtures';
import { fireDue, type Reminder } from './domain/reminders';
import { allBookings, api, clinicEvent as serverClinicEvent, clinicEvents, configure, defaultSettings, now as serverNow, onServerChange, reset, restore, type ServerSnapshot, type Settings } from './domain/server';
import { addMinutes } from './domain/time';
import type { Booking, ClockPreset, Lang, Local } from './domain/types';

/** passedEmitted: booking ids that already sent visit_passed (once per booking across preset reloads / reseeds; reset store clears). */
export type Flags = { firedReminders: string[]; firstBookingDone: boolean; offersOptIn: boolean; passedEmitted: string[] };
const defaultFlags: Flags = { firedReminders: [], firstBookingDone: false, offersOptIn: false, passedEmitted: [] };
type Cache = { bookings: Booking[]; at: Local };

type Store = {
  lang: Lang; setLang: (l: Lang) => void; scheme: 'light' | 'dark'; setSchemePref: (p: 'system' | 'light' | 'dark') => void;
  settings: Settings; setSettings: (p: Partial<Settings>) => void; setPreset: (p: ClockPreset) => void; advanceDay: () => void;
  flags: Flags; setFlags: (p: Partial<Flags>) => void;
  bookings?: Booking[]; cachedAt?: Local; loadError?: string; loading: boolean; refresh: () => Promise<void>;
  events: Logged[]; resetStore: () => void; version: number;
  /** Debug clinic event on a chosen booking: updates the card + fires the status push. */
  clinicEvent: (bookingId: string, type: 'confirmed' | 'moved' | 'cancelled') => void;
};
const Ctx = createContext<Store | null>(null);
const K = { flags: 'vz.flags', cache: 'vz.cache', events: 'vz.events', settings: 'vz.settings', prefs: 'vz.prefs', server: 'vz.server' };
export const PREFS_KEY = K.prefs;
/** Debug settings persisted across reloads (one-shot errors are not). */
const persisted = (x: Settings) => ({ preset: x.preset, now: x.now, net: x.net, latency: x.latency });
/** Fired reminders -> NotifyHost (inside the theme + toast tree). */
const reminderSinks = new Set<(r: Reminder) => void>();
export const onReminder = (f: (r: Reminder) => void) => { reminderSinks.add(f); return () => { reminderSinks.delete(f); }; };
const emitReminder = (r: Reminder) => reminderSinks.forEach((f) => f(r));
/** Debug: deliver a push now without the once flags (web banner / iOS local push). */
export const firePush = emitReminder;
const save = (k: string, v: unknown) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const [lang, setLangState] = useState<Lang>('en');
  const [schemePref, setSchemePref] = useState<'system' | 'light' | 'dark'>('light');
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [flags, setFlagsState] = useState<Flags>(defaultFlags);
  const [bookings, setBookings] = useState<Booking[]>();
  const [cachedAt, setCachedAt] = useState<Local>();
  const [loadError, setLoadError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Logged[]>([]);
  const [version, setVersion] = useState(0);
  const flagsRef = useRef(flags); flagsRef.current = flags;
  setClock(serverNow);

  const setFlags = useCallback((p: Partial<Flags>) => setFlagsState((f) => { const n = { ...f, ...p }; save(K.flags, n); return n; }), []);
  /** visit_passed once per booking id (persisted in flags). */
  const emitPassed = useCallback((bs: Booking[]) => {
    const seen = new Set(flagsRef.current.passedEmitted);
    const fresh = bs.filter((b) => !seen.has(b.id));
    if (!fresh.length) return;
    fresh.forEach((b) => { seen.add(b.id); ev.visitPassed({ bookingId: b.id, doctorId: b.doctorId }); });
    flagsRef.current = { ...flagsRef.current, passedEmitted: [...seen] };
    setFlags({ passedEmitted: [...seen] });
  }, [setFlags]);

  /** Mock server data (bookings, clinic events, keeps, cancels, prefs) survives reload; saved after every change. */
  const hydrated = useRef(false);
  useEffect(() => onServerChange((x) => { if (hydrated.current) save(K.server, x); }), []);
  useEffect(() => onEvent((e) => setEvents((xs) => { const n = [e, ...xs].slice(0, 500); save(K.events, n); return n; })), []);

  const refresh = useCallback(async () => {
    try {
      const bs = await api.appointments();
      setBookings(bs); setCachedAt(undefined); setLoadError(undefined);
      save(K.cache, { bookings: bs, at: serverNow() } satisfies Cache);
    } catch (e) {
      setLoadError((e as { code?: string }).code ?? 'server');
      const c = await AsyncStorage.getItem(K.cache).catch(() => null);
      if (c) { const o = JSON.parse(c) as Cache; setBookings((cur) => cur ?? o.bookings); setCachedAt(o.at); }
    } finally { setLoading(false); setVersion((v) => v + 1); }
  }, []);

  /** Fire due reminders (once flags, persisted; newest per type on a clock jump). Delivery = NotifyHost (iOS local push / web banner). */
  const runReminders = useCallback(async () => {
    const prefs = await api.prefs().catch(() => ({ followUp: true, nextVisit: true, statusChanges: true as const }));
    const r = fireDue(allBookings(), clinicEvents(), prefs, serverNow(), flagsRef.current.firedReminders);
    if (r.fired.length === flagsRef.current.firedReminders.length) return;
    flagsRef.current = { ...flagsRef.current, firedReminders: r.fired }; // sync: a second run in flight sees these keys
    setFlags({ firedReminders: r.fired });
    r.fire.forEach((x) => { ev.reminderSent({ type: x.type }); emitReminder(x); });
  }, [setFlags]);

  const moveClock = useCallback((to: Local, preset?: ClockPreset) => {
    const prev = serverNow();
    const before = allBookings();
    configure(preset ? { preset, now: to } : { now: to });
    const after = allBookings();
    // visit_passed: one per crossed booking; preset jump reseeds, so seeded past visits emit (as at reset).
    const passed = preset ? visits(after, to) : crossed(before, prev, to);
    emitPassed(passed);
    setSettingsState((s) => ({ ...s, ...(preset ? { preset } : {}), now: to }));
    save(K.settings, persisted({ ...settings, ...(preset ? { preset } : {}), now: to }));
    setTimeout(() => { refresh(); runReminders(); }, 0);
  }, [refresh, runReminders, settings, emitPassed]);

  const setPreset = useCallback((p: ClockPreset) => moveClock(PRESETS[p], p), [moveClock]);
  const advanceDay = useCallback(() => moveClock(addMinutes(serverNow(), 24 * 60)), [moveClock]);
  const setSettings = useCallback((p: Partial<Settings>) => { configure(p); setSettingsState((s) => { const n = { ...s, ...p }; save(K.settings, persisted(n)); return n; }); }, []);

  const resetStore = useCallback(() => {
    reset();
    flagsRef.current = defaultFlags;
    setSettingsState(defaultSettings); setFlagsState(defaultFlags); setEvents([]); setBookings(undefined); setLoading(true);
    Promise.all(Object.values(K).map((k) => AsyncStorage.removeItem(k))).catch(() => {});
    emitPassed(visits(allBookings(), serverNow()));
    setTimeout(() => { refresh(); runReminders(); }, 0);
  }, [refresh, runReminders, emitPassed]);

  useEffect(() => {
    (async () => {
      const [f, e, s, sv] = await Promise.all([K.flags, K.events, K.settings, K.server].map((k) => AsyncStorage.getItem(k).catch(() => null)));
      if (f) { const o = { ...defaultFlags, ...JSON.parse(f) }; flagsRef.current = o; setFlagsState(o); }
      if (e) setEvents(JSON.parse(e));
      if (s) { const o = { ...defaultSettings, ...JSON.parse(s) } as Settings; configure({ preset: o.preset }); configure({ now: o.now, net: o.net, latency: o.latency }); setSettingsState(o); }
      else emitPassed(visits(allBookings(), serverNow())); // first launch = store reset
      // Stored server data under the same preset = reload: keep it (no reseed).
      if (sv) restore(JSON.parse(sv) as ServerSnapshot);
      hydrated.current = true;
      // Web screenshots: ?preset=mon9&lang=ar (AGENTS.md > Screenshot URLs). Wins over stored settings.
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const q = new URLSearchParams(window.location.search);
        const p = q.get('preset') as ClockPreset | null;
        // Same preset as the stored settings = a reload: keep the stored clock (cache Notice time, offline reload).
        if (p && p in PRESETS && !(s && (JSON.parse(s) as Settings).preset === p)) {
          configure({ preset: p, now: PRESETS[p] }); setSettingsState((x) => ({ ...x, preset: p, now: PRESETS[p] }));
          save(K.settings, persisted({ ...defaultSettings, ...(s ? (JSON.parse(s) as Settings) : {}), preset: p, now: PRESETS[p] }));
          emitPassed(visits(allBookings(), PRESETS[p])); // preset jump reseeds (deduped per booking)
        }
        const l = q.get('lang');
        if (l === 'ar' || l === 'en') { setLangState(l); setCommon({ locale: l }); }
      }
      await refresh(); runReminders();
    })();
  }, []);

  // App back to foreground = app open for the scheduler.
  useEffect(() => { const sub = AppState.addEventListener('change', (a) => { if (a === 'active') runReminders(); }); return () => sub.remove(); }, [runReminders]);

  const clinicEvent = useCallback((bookingId: string, type: 'confirmed' | 'moved' | 'cancelled') => {
    const b = allBookings().find((x) => x.id === bookingId);
    if (!b) return;
    // Move target not in spec (guess): next day, 30 min earlier (sample Wed 7:00 PM -> Thu 6:30 PM).
    serverClinicEvent(bookingId, type, type === 'moved' ? addMinutes(b.start, 24 * 60 - 30) : undefined);
    ev.clinicEventReceived({ bookingId, type });
    refresh(); runReminders(); // status_* push fires now (clinic event time = mock now)
  }, [refresh, runReminders]);

  const setLang = useCallback((l: Lang) => { setLangState(l); setCommon({ locale: l }); }, []);
  useEffect(() => { setCommon({ locale: lang }); }, []);
  const scheme = schemePref === 'system' ? (sys === 'dark' ? 'dark' : 'light') : schemePref;
  const value = useMemo<Store>(() => ({ lang, setLang, scheme, setSchemePref, settings, setSettings, setPreset, advanceDay, flags, setFlags, bookings, cachedAt, loadError, loading, refresh, events, resetStore, version, clinicEvent }),
    [lang, scheme, settings, flags, bookings, cachedAt, loadError, loading, events, version, setPreset, advanceDay, clinicEvent]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() { const v = useContext(Ctx); if (!v) throw new Error('no store'); return v; }
export const useNow = () => useStore().settings.now;
