// App store: debug settings, language, flags (persisted), cached summary. Mock clock lives in settings.today.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { analytics, fmt } from '@lab/app-kit';
import { api, configure, defaultSettings, type Settings } from './domain/server';
import { strings, type Strings } from './domain/strings';
import type { Lang, Range, Summary } from './domain/types';

export type OsPermission = 'notDetermined' | 'granted' | 'denied';
export type Flags = { firstPaymentDone: boolean; reminderAskShown: boolean; osPermission: OsPermission; dueReachedLogged: string[] };
const defaultFlags: Flags = { firstPaymentDone: false, reminderAskShown: false, osPermission: 'notDetermined', dueReachedLogged: [] };

type Store = {
  lang: Lang; setLang: (l: Lang) => void; s: Strings; scheme: 'light' | 'dark'; setSchemePref: (p: 'system' | 'light' | 'dark') => void;
  settings: Settings; setSettings: (p: Partial<Settings>) => void;
  flags: Flags; setFlags: (p: Partial<Flags>) => void;
  summary?: Summary; summaryError?: string; loading: boolean; range: Range; setRange: (r: Range) => void; rowsLoading: boolean; rowsError?: boolean;
  refresh: () => Promise<void>; version: number;
};
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const [lang, setLangState] = useState<Lang>('en');
  const [schemePref, setSchemePref] = useState<'system' | 'light' | 'dark'>('light');
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [flags, setFlagsState] = useState<Flags>(defaultFlags);
  const [summary, setSummary] = useState<Summary>();
  const [summaryError, setSummaryError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [range, setRangeState] = useState<Range>('7d');
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowsError, setRowsError] = useState(false);
  const [version, setVersion] = useState(0);
  const rangeRef = useRef(range);

  useEffect(() => { AsyncStorage.getItem('flags').then((v) => v && setFlagsState({ ...defaultFlags, ...JSON.parse(v) })).catch(() => {}); }, []);
  const setFlags = useCallback((p: Partial<Flags>) => setFlagsState((f) => { const n = { ...f, ...p }; AsyncStorage.setItem('flags', JSON.stringify(n)).catch(() => {}); return n; }), []);

  const refresh = useCallback(async () => {
    try {
      const x = await api.summary(rangeRef.current);
      setSummary(x); setSummaryError(undefined);
    } catch (e) {
      setSummaryError((e as { code?: string }).code ?? 'server');
    } finally { setLoading(false); setVersion((v) => v + 1); }
  }, []);

  const setSettings = useCallback((p: Partial<Settings>) => {
    configure(p);
    setSettingsState((s) => ({ ...s, ...p }));
    if (p.scenario) { setSummary(undefined); setLoading(true); }
    setTimeout(() => refresh(), 0);
  }, [refresh]);

  const setRange = useCallback(async (r: Range) => {
    rangeRef.current = r; setRangeState(r); setRowsLoading(true); setRowsError(false);
    analytics.track('range_changed', { range: r });
    try { const rows = await api.rows(r); setSummary((s) => (s ? { ...s, rows } : s)); }
    catch { setRowsError(true); }
    finally { setRowsLoading(false); }
  }, []);

  useEffect(() => {
    // Web preview only: ?lang=ar&scenario=overdue&net=offline&pay=declined&scheme=dark (screenshots + review links).
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      if (q.get('lang') === 'ar') setLangState('ar');
      if (q.get('scheme') === 'dark') setSchemePref('dark');
      const p: Partial<Settings> = {};
      if (q.get('scenario')) p.scenario = q.get('scenario') as Settings['scenario'];
      if (q.get('net')) p.net = q.get('net') as Settings['net'];
      if (q.get('pay')) p.payResult = q.get('pay') as Settings['payResult'];
      if (Object.keys(p).length) { configure(p); setSettingsState((x) => ({ ...x, ...p })); }
    }
    refresh();
  }, [refresh]);

  // instalment_due_reached: once per instalment when its effective due date arrives on the mock clock (denominator, on-time rate).
  useEffect(() => {
    if (!summary) return;
    const reached = api.allUnpaid().filter((x) => fmt.diffDays(settings.today, x.dueDate) >= 0 && !flags.dueReachedLogged.includes(x.instalmentId));
    if (reached.length) {
      reached.forEach((x) => analytics.track('instalment_due_reached', { instalmentId: x.instalmentId, amount: x.amount }));
      setFlags({ dueReachedLogged: [...flags.dueReachedLogged, ...reached.map((x) => x.instalmentId)] });
    }
  }, [summary, settings.today]);

  const setLang = useCallback((l: Lang) => { setLangState(l); analytics.setCommon({ locale: l }); }, []);
  useEffect(() => { analytics.setCommon({ scenario: settings.scenario, locale: lang }); }, [settings.scenario]);

  const scheme = schemePref === 'system' ? (sys === 'dark' ? 'dark' : 'light') : schemePref;
  const value = useMemo<Store>(() => ({ lang, setLang, s: strings[lang] as Strings, scheme, setSchemePref, settings, setSettings, flags, setFlags, summary, summaryError, loading, range, setRange, rowsLoading, rowsError, refresh, version }),
    [lang, scheme, settings, flags, summary, summaryError, loading, range, rowsLoading, rowsError, version]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() { const v = useContext(Ctx); if (!v) throw new Error('no store'); return v; }
export const useToday = () => useStore().settings.today;
