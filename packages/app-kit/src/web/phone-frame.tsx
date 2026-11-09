// Public case study web build: on a wide browser a case app runs inside a drawn iPhone frame.
// Shared by every case app (moved from apps/tabby 2026-11-04). Not a DS component: web page chrome.
// Use: case app root renders <FramePage notice={...}/> when useFramePage(caseStudy) is true,
// and wraps its themed tree in <FrameInsets>. Template: templates/case-study-page.md (project docs).
// The app loads in an iframe at the phone screen size, so sheets (Modal), toasts and window size
// all act like on a real 393 x 852 iPhone. The parent page draws body, status bar, home bar and banner.
import React, { createElement, useEffect, useRef, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { BatteryFullIcon, CellSignalFullIcon, WifiHighIcon } from 'phosphor-react-native';
import { SegmentedControl } from '../components/SegmentedControl';
import { Txt } from '../components/Txt';
import { ThemeProvider, useTheme } from '../theme';
import type { Lang, Scheme } from '../tokens';

// raw-ok: device hardware (iPhone 16 screen, safe area, bezel, island), not design tokens.
const DEVICE = { w: 393, h: 852, top: 59, bottom: 34, bezel: 12, screenRadius: 55, islandW: 125, islandH: 37, islandTop: 11, homeW: 140, homeH: 5, homeGap: 8, statusH: 54, minWidth: 500 };
// raw-ok: phone body + island colours are hardware, the same in light and dark.
const HARDWARE = { body: '#1c1c1e', island: '#000000' };
// raw-ok: width of each page toggle (two segments); widths have no token.
const TOGGLE_W = 150;
// raw-ok: side panel width on the frame page (web chrome, no token).
const PANEL_W = 320;
const TOGGLE_LABELS = { en: { light: 'Light', dark: 'Dark' }, ar: { light: 'فاتح', dark: 'داكن' } };

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
const query = isWeb ? new URLSearchParams(window.location.search) : null;
/** True inside the iframe that the frame page loads. */
export const inFrame = !!query?.has('frame');

/** Wide browser on the public case study (`caseStudy` = the app's public web build flag): show the frame page. */
export function useFramePage(caseStudy: boolean): boolean {
  const { width } = useWindowDimensions();
  return isWeb && caseStudy && !inFrame && width >= DEVICE.minWidth;
}

type FrameMsg = { type: 'lab-frame'; scheme: Scheme; lang: Lang };
type SetMsg = { type: 'lab-set'; scheme?: Scheme; lang?: Lang };
type AppMsg = { type: 'lab-app'; data: unknown };
type CmdMsg = { type: 'lab-cmd'; cmd: unknown };

/** Inside the iframe: send the app's tool state to the frame page; run the page's side-panel commands (user 2026-11-05). */
export function useFrameBridge<D, C>(data: D, onCmd: (cmd: C) => void) {
  const json = JSON.stringify(data);
  useEffect(() => {
    if (inFrame) window.parent.postMessage({ type: 'lab-app', data } satisfies AppMsg, window.location.origin);
  }, [json]);
  const ref = useRef(onCmd);
  ref.current = onCmd;
  useEffect(() => {
    if (!inFrame) return;
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data as CmdMsg;
      if (m?.type === 'lab-cmd') ref.current(m.cmd as C);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
}

/** Side panel beside the phone: gets the app's last tool state and sends commands into the iframe. */
export type FramePanel = (p: { data: unknown; send: (cmd: unknown) => void }) => React.ReactNode;

/** Inside the iframe: iPhone safe area; tell the parent page the scheme + language; take toggle changes from it. */
export function FrameInsets({ scheme, lang, onScheme, onLang, children }: { scheme: Scheme; lang: Lang; onScheme: (s: Scheme) => void; onLang: (l: Lang) => void; children: React.ReactNode }) {
  useEffect(() => {
    if (inFrame) window.parent.postMessage({ type: 'lab-frame', scheme, lang } satisfies FrameMsg, window.location.origin);
  }, [scheme, lang]);
  useEffect(() => {
    if (!inFrame) return;
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data as SetMsg;
      if (m?.type !== 'lab-set') return;
      if (m.scheme) onScheme(m.scheme);
      if (m.lang) onLang(m.lang);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [onScheme, onLang]);
  if (!inFrame) return <>{children}</>;
  return (
    <SafeAreaInsetsContext.Provider value={{ top: DEVICE.top, bottom: DEVICE.bottom, left: 0, right: 0 }}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

/** Parent page: background, banner above the phone, phone body with the app iframe inside. */
export function FramePage({ notice, panel, path }: { notice: (lang: Lang) => React.ReactNode; panel?: FramePanel; path?: string }) {
  const [state, setState] = useState<{ scheme: Scheme; lang: Lang }>({
    scheme: query?.get('scheme') === 'dark' ? 'dark' : 'light',
    lang: query?.get('lang') === 'ar' ? 'ar' : 'en',
  });
  const [app, setApp] = useState<unknown>();
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data as FrameMsg;
      if (m?.type === 'lab-frame') setState({ scheme: m.scheme, lang: m.lang });
      if ((e.data as AppMsg)?.type === 'lab-app') setApp((e.data as AppMsg).data);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
  return (
    <ThemeProvider scheme={state.scheme} lang={state.lang}>
      <Page banner={notice(state.lang)} lang={state.lang} scheme={state.scheme} panel={panel} app={app} path={path} />
    </ThemeProvider>
  );
}

function Page({ banner, lang, scheme, panel, app, path }: { banner: React.ReactNode; lang: Lang; scheme: Scheme; panel?: FramePanel; app: unknown; path?: string }) {
  const th = useTheme();
  const frame = useRef<HTMLIFrameElement | null>(null);
  const send = (m: Omit<SetMsg, 'type'>) => frame.current?.contentWindow?.postMessage({ type: 'lab-set', ...m } satisfies SetMsg, window.location.origin);
  const sendCmd = (cmd: unknown) => frame.current?.contentWindow?.postMessage({ type: 'lab-cmd', cmd } satisfies CmdMsg, window.location.origin);
  const t = TOGGLE_LABELS[lang];
  const { height } = useWindowDimensions();
  const [bannerH, setBannerH] = useState(0);
  const pad = th.t('space/padding-y/xl');
  const gap = th.t('space/gap-y/md');
  const bodyW = DEVICE.w + DEVICE.bezel * 2;
  const bodyH = DEVICE.h + DEVICE.bezel * 2;
  const scale = Math.min(1, (height - pad * 2 - gap - bannerH) / bodyH);
  const src = frameSrc(path);
  return (
    <View style={{ flex: 1, minHeight: height, alignItems: 'center', justifyContent: 'center', paddingVertical: pad, gap, backgroundColor: th.t('color/bg/secondary/default') as string }}>
      <View onLayout={(e) => setBannerH(e.nativeEvent.layout.height)} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: th.t('space/gap-x/sm'), direction: th.isRTL ? 'rtl' : 'ltr' }}>
        {banner}
        <View style={{ width: TOGGLE_W }}>
          <SegmentedControl value={scheme} onChange={(v) => send({ scheme: v })} options={[{ value: 'light', label: t.light }, { value: 'dark', label: t.dark }]} />
        </View>
        <View style={{ width: TOGGLE_W }}>
          <SegmentedControl value={lang} onChange={(v) => send({ lang: v })} options={[{ value: 'en', label: 'EN' }, { value: 'ar', label: 'عربي' }]} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', gap: th.t('space/gap-x/xl') }}>
      <View style={{ width: bodyW * scale, height: bodyH * scale }}>
        <View style={{ position: 'absolute', left: 0, top: 0, width: bodyW, height: bodyH, transform: [{ translateX: (bodyW * scale - bodyW) / 2 }, { translateY: (bodyH * scale - bodyH) / 2 }, { scale }], padding: DEVICE.bezel, borderRadius: DEVICE.screenRadius + DEVICE.bezel, backgroundColor: HARDWARE.body, borderWidth: th.t('border-width/sm'), borderColor: th.t('color/border/strong/default') as string }}>
          <View style={{ width: DEVICE.w, height: DEVICE.h, borderRadius: DEVICE.screenRadius, overflow: 'hidden', backgroundColor: th.t('color/bg/default') as string }}>
            {createElement('iframe', { ref: frame, src, title: 'App preview', style: { width: DEVICE.w, height: DEVICE.h, border: 0, display: 'block' } })}
            <StatusBar />
            <View pointerEvents="none" style={{ position: 'absolute', left: (DEVICE.w - DEVICE.homeW) / 2, bottom: DEVICE.homeGap, width: DEVICE.homeW, height: DEVICE.homeH, borderRadius: th.t('radius/full'), backgroundColor: th.t('color/text/content/default') as string }} />
          </View>
        </View>
      </View>
      {panel ? <View style={{ width: PANEL_W, maxHeight: bodyH * scale }}>{panel({ data: app, send: sendCmd })}</View> : null}
      </View>
    </View>
  );
}

/** Drawn iOS status bar: 9:41, Dynamic Island, signal, wifi, battery. Colours follow the app scheme. */
function StatusBar() {
  const th = useTheme();
  const c = th.t('color/text/content/default') as string;
  const icon = th.t('size/icon/xs');
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: DEVICE.statusH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: th.t('space/padding-x/2xl'), direction: 'ltr' }}>
      <View style={{ position: 'absolute', top: DEVICE.islandTop, left: (DEVICE.w - DEVICE.islandW) / 2, width: DEVICE.islandW, height: DEVICE.islandH, borderRadius: th.t('radius/full'), backgroundColor: HARDWARE.island }} />
      <Txt role="label/lg" tabular style={{ writingDirection: 'ltr' }}>9:41</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/3xs') }}>
        <CellSignalFullIcon size={icon} color={c} weight="fill" />
        <WifiHighIcon size={icon} color={c} weight="bold" />
        <BatteryFullIcon size={th.t('size/icon/sm')} color={c} weight="fill" />
      </View>
    </View>
  );
}

/** Same query inside the iframe, plus frame=1. Path = the page's own path, or `path` (static host without SPA fallback: '/index.html'). */
function frameSrc(path?: string): string {
  const q = new URLSearchParams(window.location.search);
  q.set('frame', '1');
  return `${path ?? window.location.pathname}?${q.toString()}${window.location.hash}`;
}
