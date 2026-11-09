import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontAssets, FrameInsets, FramePage, inFrame, ThemeProvider, ToastHost, Txt, useFramePage, useTheme } from '@lab/app-kit';
import { StoreProvider, useStore } from '../state';
import { NotifyHost } from '../ui/notify';

const FONTS = fontAssets();
// Public case study web build (templates/case-study-page.md). Hosted as a static site at an origin root.
const CASE_STUDY = process.env.EXPO_PUBLIC_CASE_STUDY === '1';
// Iframe path on the frame page; static host without SPA fallback = the real file (index.html).
const FRAME_SRC = process.env.EXPO_PUBLIC_FRAME_SRC || '/index.html';

export default function Root() {
  const [loaded] = useFonts(FONTS);
  const framePage = useFramePage(CASE_STUDY);
  if (!loaded) return <View style={{ flex: 1 }} />;
  // Wide browser, public case study: phone frame page; the app runs in its iframe (app-kit web/phone-frame).
  if (framePage) return <FramePage notice={(lang) => <CaseStudyNotice lang={lang} />} path={FRAME_SRC} />;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Themed />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Themed() {
  const { scheme, lang, setSchemePref, setLang } = useStore();
  return (
    <ThemeProvider scheme={scheme} lang={lang} brand="vezeeta">
      <FrameInsets scheme={scheme} lang={lang} onScheme={setSchemePref} onLang={setLang}>
      <ToastHost>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {CASE_STUDY && !inFrame ? <CaseStudyBanner /> : null}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reminders" />
          <Stack.Screen name="debug" options={{ presentation: 'modal' }} />
        </Stack>
        <NotifyHost />
      </ToastHost>
      </FrameInsets>
    </ThemeProvider>
  );
}

// Designer copy; AR line pending copy critic (build-log).
const NOTICE = { en: 'Unofficial case study · not affiliated with Vezeeta · sample data', ar: 'دراسة حالة غير رسمية · مش تابعة لـ Vezeeta · بيانات تجريبية' };

/** Framed page: the same notice as a pill above the phone. */
function CaseStudyNotice({ lang }: { lang: 'en' | 'ar' }) {
  const th = useTheme();
  return (
    <View accessibilityRole="banner" style={{ paddingVertical: th.t('space/padding-y/2xs'), paddingHorizontal: th.t('space/margin/md'), borderRadius: th.t('radius/full'), backgroundColor: th.t('color/surface/inverse/default') as string }}>
      <Txt role="caption" color="color/text/content/inverse/default" align="center">{NOTICE[lang]}</Txt>
    </View>
  );
}

/** Public web build only (decisions/project.md 2026-11-04): fixed notice on every screen. */
function CaseStudyBanner() {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="banner" style={{ paddingTop: insets.top + th.t('space/padding-y/2xs'), paddingBottom: th.t('space/padding-y/2xs'), paddingHorizontal: th.t('space/margin/md'), backgroundColor: th.t('color/surface/inverse/default') as string }}>
      <Txt role="caption" color="color/text/content/inverse/default" align="center">
        {NOTICE[th.isRTL ? 'ar' : 'en']}
      </Txt>
    </View>
  );
}
