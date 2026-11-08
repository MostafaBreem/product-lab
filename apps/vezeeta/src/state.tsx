// App store: debug settings (mock clock, net, latency, one-shot errors), language, reminder once-flags, cached bookings, event log.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ev, onEvent, setClock, setCommon, type Logged } from './domain/analytics';
import { crossed, visits } from './domain/derive';
import { PRESETS } from './domain/fixtures';
import { due } from './domain/reminders';
import { allBookings, api, clinicEvents, configure, defaultSettings, now as serverNow, reset, type Settings } from './domain/server';
import { addMinutes } from './domain/time';
import type { Booking, ClockPreset, Lang, Local } from './domain/types';

export type Flags = { firedReminders: string[]; firstBookingDone: boolean; offersOptIn: boolean };
const defaultFlags: Flags = { firedReminders: [], firstBookingDone: false, offersOptIn: false };
type Cache = { bookings: Booking[]; at: Local };

type Store = {
  lang: Lang; setLang: (l: Lang) => void; scheme: 'light' | 'dark'; setSchemePref: (p: 'system' | 'light' | 'dark') => void;
  settings: Settings; setSettings: (p: Partial<Settings>) => void; setPreset: (p: ClockPreset) => void; advanceDay: () => void;
  flags: Flags; setFlags: (p: Partial<Flags>) => void;
  bookings?: Booking[]; cachedAt?: Local; loadError?: string; loading: boolean; refresh: () => Promise<void>;
  events: Logged[]; resetStore: () => void; version: number;
};
const Ctx = createContext<Store | null>(null);
const K = { flags: 'vz.flags', cache: 'vz.cache', events: 'vz.events', settings: 'vz.settings' };
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

  /** Fire due reminders (once flags; newest per type on a clock jump). Real notifications come later. */
  const runReminders = useCallback(async () => {
    const prefs = await api.prefs().catch(() => ({ followUp: true, nextVisit: true, statusChanges: true as const }));
    const r = due(allBookings(), clinicEvents(), prefs, serverNow(), flagsRef.current.firedReminders);
    r.due.forEach((x) => ev.reminderSent({ type: x.type }));
    if (r.due.length || r.skipped.length) setFlags({ firedReminders: [...flagsRef.current.firedReminders, ...r.due.map((x) => x.key), ...r.skipped.map((x) => x.key)] });
  }, [setFlags]);

  const moveClock = useCallback((to: Local, preset?: ClockPreset) => {
    const prev = serverNow();
    const before = allBookings();
    configure(preset ? { preset, now: to } : { now: to });
    const after = allBookings();
    // visit_passed: one per crossed booking; preset jump reseeds, so seeded past visits emit (as at reset).
    const passed = preset ? visits(after, to) : crossed(before, prev, to);
    passed.forEach((b) => ev.visitPassed({ bookingId: b.id, doctorId: b.doctorId }));
    setSettingsState((s) => ({ ...s, ...(preset ? { preset } : {}), now: to }));
    save(K.settings, { ...settings, ...(preset ? { preset } : {}), now: to });
    setTimeout(() => { refresh(); runReminders(); }, 0);
  }, [refresh, runReminders, settings]);

  const setPreset = useCallback((p: ClockPreset) => moveClock(PRESETS[p], p), [moveClock]);
  const advanceDay = useCallback(() => moveClock(addMinutes(serverNow(), 24 * 60)), [moveClock]);
  const setSettings = useCallback((p: Partial<Settings>) => { configure(p); setSettingsState((s) => ({ ...s, ...p })); }, []);

  const resetStore = useCallback(() => {
    reset();
    setSettingsState(defaultSettings); setFlagsState(defaultFlags); setEvents([]); setBookings(undefined); setLoading(true);
    Promise.all(Object.values(K).map((k) => AsyncStorage.removeItem(k))).catch(() => {});
    visits(allBookings(), serverNow()).forEach((b) => ev.visitPassed({ bookingId: b.id, doctorId: b.doctorId }));
    setTimeout(() => { refresh(); runReminders(); }, 0);
  }, [refresh, runReminders]);

  useEffect(() => {
    (async () => {
      const [f, e, s] = await Promise.all([K.flags, K.events, K.settings].map((k) => AsyncStorage.getItem(k).catch(() => null)));
      if (f) setFlagsState({ ...defaultFlags, ...JSON.parse(f) });
      if (e) setEvents(JSON.parse(e));
      if (s) { const o = { ...defaultSettings, ...JSON.parse(s) } as Settings; configure({ preset: o.preset }); configure({ now: o.now, net: o.net, latency: o.latency }); setSettingsState(o); }
      else visits(allBookings(), serverNow()).forEach((b) => ev.visitPassed({ bookingId: b.id, doctorId: b.doctorId })); // first launch = store reset
      await refresh(); runReminders();
    })();
  }, []);

  const setLang = useCallback((l: Lang) => { setLangState(l); setCommon({ locale: l }); }, []);
  useEffect(() => { setCommon({ locale: lang }); }, []);
  const scheme = schemePref === 'system' ? (sys === 'dark' ? 'dark' : 'light') : schemePref;
  const value = useMemo<Store>(() => ({ lang, setLang, scheme, setSchemePref, settings, setSettings, setPreset, advanceDay, flags, setFlags, bookings, cachedAt, loadError, loading, refresh, events, resetStore, version }),
    [lang, scheme, settings, flags, bookings, cachedAt, loadError, loading, events, version, setPreset, advanceDay]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() { const v = useContext(Ctx); if (!v) throw new Error('no store'); return v; }
export const useNow = () => useStore().settings.now;
