// Case study web build only: on a wide browser the app runs inside a drawn iPhone frame.
// Screen pattern (components/screen-patterns.md > PhoneFrame): one use, web only, fails the Build test.
// The app loads in an iframe at the phone screen size, so sheets (Modal), toasts and window size
// all act like on a real 393 x 852 iPhone. The parent page draws body, status bar, home bar and banner.
import React, { createElement, useEffect, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { BatteryFullIcon, CellSignalFullIcon, WifiHighIcon } from 'phosphor-react-native';
import { ThemeProvider, Txt, useTheme, type Lang, type Scheme } from '@lab/app-kit';

// raw-ok: device hardware (iPhone 16 screen, safe area, bezel, island), not design tokens.
const DEVICE = { w: 393, h: 852, top: 59, bottom: 34, bezel: 12, screenRadius: 55, islandW: 125, islandH: 37, islandTop: 11, homeW: 140, homeH: 5, homeGap: 8, statusH: 54, minWidth: 500 };
// raw-ok: phone body + island colours are hardware, the same in light and dark.
const HARDWARE = { body: '#1c1c1e', island: '#000000' };

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
const query = isWeb ? new URLSearchParams(window.location.search) : null;
/** True inside the iframe that the frame page loads. */
export const inFrame = !!query?.has('frame');
const caseStudy = process.env.EXPO_PUBLIC_CASE_STUDY === '1';

/** Wide browser on the public case study: show the frame page instead of the app. */
export function useFramePage(): boolean {
  const { width } = useWindowDimensions();
  return isWeb && caseStudy && !inFrame && width >= DEVICE.minWidth;
}

type FrameMsg = { type: 'lab-frame'; scheme: Scheme; lang: Lang };

/** Inside the iframe: iPhone safe area, and tell the parent page the current scheme + language. */
export function FrameInsets({ scheme, lang, children }: { scheme: Scheme; lang: Lang; children: React.ReactNode }) {
  useEffect(() => {
    if (inFrame) window.parent.postMessage({ type: 'lab-frame', scheme, lang } satisfies FrameMsg, window.location.origin);
  }, [scheme, lang]);
  if (!inFrame) return <>{children}</>;
  return (
    <SafeAreaInsetsContext.Provider value={{ top: DEVICE.top, bottom: DEVICE.bottom, left: 0, right: 0 }}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

/** Parent page: background, banner above the phone, phone body with the app iframe inside. */
export function FramePage({ banner }: { banner: (lang: Lang) => React.ReactNode }) {
  const [state, setState] = useState<{ scheme: Scheme; lang: Lang }>({
    scheme: query?.get('scheme') === 'dark' ? 'dark' : 'light',
    lang: query?.get('lang') === 'ar' ? 'ar' : 'en',
  });
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data as FrameMsg;
      if (m?.type === 'lab-frame') setState({ scheme: m.scheme, lang: m.lang });
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
  return (
    <ThemeProvider scheme={state.scheme} lang={state.lang}>
      <Page banner={banner(state.lang)} />
    </ThemeProvider>
  );
}

function Page({ banner }: { banner: React.ReactNode }) {
  const th = useTheme();
  const { height } = useWindowDimensions();
  const [bannerH, setBannerH] = useState(0);
  const pad = th.t('space/padding-y/xl');
  const gap = th.t('space/gap-y/md');
  const bodyW = DEVICE.w + DEVICE.bezel * 2;
  const bodyH = DEVICE.h + DEVICE.bezel * 2;
  const scale = Math.min(1, (height - pad * 2 - gap - bannerH) / bodyH);
  const src = frameSrc();
  return (
    <View style={{ flex: 1, minHeight: height, alignItems: 'center', justifyContent: 'center', paddingVertical: pad, gap, backgroundColor: th.t('color/surface/tertiary/default') as string }}>
      <View onLayout={(e) => setBannerH(e.nativeEvent.layout.height)}>{banner}</View>
      <View style={{ width: bodyW * scale, height: bodyH * scale }}>
        <View style={{ position: 'absolute', left: 0, top: 0, width: bodyW, height: bodyH, transform: [{ translateX: (bodyW * scale - bodyW) / 2 }, { translateY: (bodyH * scale - bodyH) / 2 }, { scale }], padding: DEVICE.bezel, borderRadius: DEVICE.screenRadius + DEVICE.bezel, backgroundColor: HARDWARE.body }}>
          <View style={{ width: DEVICE.w, height: DEVICE.h, borderRadius: DEVICE.screenRadius, overflow: 'hidden', backgroundColor: th.t('color/bg/default') as string }}>
            {createElement('iframe', { src, title: 'Case study app', style: { width: DEVICE.w, height: DEVICE.h, border: 0, display: 'block' } })}
            <StatusBar />
            <View pointerEvents="none" style={{ position: 'absolute', left: (DEVICE.w - DEVICE.homeW) / 2, bottom: DEVICE.homeGap, width: DEVICE.homeW, height: DEVICE.homeH, borderRadius: th.t('radius/full'), backgroundColor: th.t('color/text/content/default') as string }} />
          </View>
        </View>
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

/** Same path and query inside the iframe, plus frame=1. */
function frameSrc(): string {
  const q = new URLSearchParams(window.location.search);
  q.set('frame', '1');
  return `${window.location.pathname}?${q.toString()}${window.location.hash}`;
}
