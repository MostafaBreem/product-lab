import React, { useContext, useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';
import { TileCtx } from '../src/ui/tile';
import { addons } from 'storybook/preview-api';
import { PREFS_EVENT, PREFS_KEY, readPrefs, type Prefs } from '../src/ui/prefs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Preview } from '@storybook/react-native-web-vite';
import { ThemeProvider, ToastHost, makeTheme } from '@lab/app-kit';

const BG = { light: makeTheme('light', 'en').t('color/bg/default') as string, dark: makeTheme('dark', 'en').t('color/bg/default') as string };

/** Docs pages follow the theme toggle too, also pages with no story on them (galleries, rules): set on load and on every toggle. */
function applyDocsTheme(dark: boolean) {
  {
    const id = 'lab-docs-theme';
    document.getElementById(id)?.remove();
    // Page colours for the doc blocks (blocks.tsx), from the same tokens as the components.
    const pt = makeTheme(dark ? 'dark' : 'light', 'en');
    const c = (k: string) => pt.t(k) as string;
    type Sh = { offsetX: number; offsetY: number; blur: number; spread?: number; color: string };
    const shadow = (k: string) => { const v = pt.t(k) as unknown as Sh; return v && typeof v === 'object' ? `${v.offsetX}px ${v.offsetY}px ${v.blur}px ${v.spread ?? 0}px ${v.color}` : 'none'; };
    const vars: Record<string, string> = {
      surface: c('color/surface/default'), border: c('color/border/default'), bg: c('color/bg/default'), inset: c('color/surface/secondary/default'),
      text: c('color/text/content/default'), text2: c('color/text/content/secondary/default'), text3: c('color/text/content/tertiary/default'), disabled: c('color/text/content/disabled'),
      link: c('color/text/content/link/default'), brand: c('color/fill/brand/default'), 'brand-soft': c('color/surface/brand/default'),
      critical: c('color/text/content/critical/default'), 'critical-soft': c('color/surface/critical/default'),
      success: c('color/text/content/success/default'), 'success-soft': c('color/fill/success/secondary/default'),
      warning: c('color/text/content/warning/default'), 'warning-soft': c('color/fill/warning/secondary/default'),
      'shadow-sm': shadow('shadow/sm'), 'shadow-lg': shadow('shadow/lg'),
    };
    for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(`--lab-${k}`, v);
    // Gallery tiles show only the copy that matches the page theme (blocks.tsx LivePreview).
    document.documentElement.dataset.labScheme = dark ? 'dark' : 'light';
    // Canvas + docs page background follow the toggle in both themes (Backgrounds addon is off, main.ts).
    const st = document.createElement('style');
    st.id = id;
    st.textContent = `body, .sb-show-main, .docs-story { background: ${dark ? BG.dark : BG.light} !important; }`;
    document.head.appendChild(st);
    if (dark) {
    const t = makeTheme('dark', 'en');
    st.textContent += `
      .sbdocs-wrapper { background: ${BG.dark} !important; }
      .sbdocs, .sbdocs p, .sbdocs li, .sbdocs h1, .sbdocs h2, .sbdocs h3, .sbdocs h4, .sbdocs td, .sbdocs th, .sbdocs a { color: ${t.t('color/text/content/default')} !important; }
      .sbdocs table tr, .sbdocs table td, .sbdocs table th { background: ${t.t('color/surface/default')} !important; border-color: ${t.t('color/border/default')} !important; }
      .sbdocs code { background: ${t.t('color/surface/secondary/default')} !important; color: ${t.t('color/text/content/default')} !important; border-color: ${t.t('color/border/default')} !important; }
      .sbdocs .docblock-source, .sbdocs-preview { background: ${t.t('color/surface/default')} !important; border-color: ${t.t('color/border/default')} !important; }
      .docblock-argstable td span, .docblock-argstable td code, .docblock-argstable td div { color: ${t.t('color/text/content/default')} !important; }
      .docblock-argstable td code { background: ${t.t('color/surface/secondary/default')} !important; }
      .docblock-argstable input, .docblock-argstable textarea, .docblock-argstable select { background: ${t.t('color/surface/secondary/default')} !important; color: ${t.t('color/text/content/default')} !important; border-color: ${t.t('color/border/default')} !important; }
      .docblock-code-toggle, .sbdocs-preview button { color: ${t.t('color/text/content/secondary/default')} !important; }
      .docblock-argstable label:has(> input[role=switch]) { background: ${t.t('color/surface/secondary/default')} !important; box-shadow: inset 0 0 0 1px ${t.t('color/border/default')} !important; }
      .docblock-argstable label:has(> input[role=switch]) span { color: ${t.t('color/text/content/secondary/default')} !important; background: transparent !important; box-shadow: none !important; }
      .docblock-argstable label:has(> input[role=switch]) input:not(:checked) ~ span:first-of-type,
      .docblock-argstable label:has(> input[role=switch]) input:checked ~ span:last-of-type { background: ${t.t('color/fill/brand/default')} !important; color: ${t.t('color/text/on-fill/brand/default')} !important; }`;
    }
  }
}

// Language + theme live in a small store, not in Storybook globals (a global change reloads the whole frame).
let prefs: Prefs = readPrefs();
const subs = new Set<() => void>();
const setPrefs = (p: Prefs) => { if (p.lang === prefs.lang && p.scheme === prefs.scheme) return; prefs = p; applyDocsTheme(p.scheme === 'dark'); subs.forEach((f) => f()); };
const usePrefs = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => prefs);
applyDocsTheme(prefs.scheme === 'dark');
addons.getChannel().on(PREFS_EVENT, (p: Prefs) => setPrefs(p));
// Another tab changed it: follow.
window.addEventListener('storage', (e) => { if (e.key === PREFS_KEY) setPrefs(readPrefs()); });

const preview: Preview = {
  // Language + theme: toolbar buttons in manager.tsx through the prefs store (src/ui/prefs.ts), not globals.
  initialGlobals: { viewport: { value: 'iphone16promax', isRotated: false } },
  parameters: { viewport: { options: { iphone16: { name: 'iPhone 16 (393 × 852)', styles: { width: '393px', height: '852px' }, type: 'mobile' }, iphone16promax: { name: 'iPhone 16 Pro Max (440 × 956)', styles: { width: '440px', height: '956px' }, type: 'mobile' } } }, a11y: { test: 'todo' }, controls: { exclude: /^on[A-Z]/, expanded: true }, layout: 'padded', options: { storySort: { order: ['Start here', 'Foundations', ['Overview', '*'], 'Components', ['Overview', '*'], 'Rules', ['Overview', '*'], 'For AI agents'] } } },
  decorators: [
    (Story) => {
      const { lang, scheme: page } = usePrefs();
      const tile = useContext(TileCtx);
      // One phone-wide frame per theme: 440 = iPhone 16 Pro Max, 16 screen margin inside.
      const frame = (scheme: 'light' | 'dark') => {
        const th = makeTheme(scheme, lang);
        return (
          <ThemeProvider scheme={scheme} lang={lang}>
            <ToastHost bottomOffset={0}>
              <View testID="lab-frame" style={{ padding: 16, width: tile ? '100%' : 440, maxWidth: '100%', backgroundColor: th.t('color/bg/default') as string, direction: lang === 'ar' ? 'rtl' : 'ltr', gap: 12, borderRadius: 12 }}>
                <Story />
              </View>
            </ToastHost>
          </ThemeProvider>
        );
      };
      if (tile) return <SafeAreaProvider>{frame(page)}</SafeAreaProvider>;
      const label = makeTheme(page, 'en').t('color/text/content/secondary/default') as string;
      return (
        <SafeAreaProvider>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
            {(['light', 'dark'] as const).map((s) => (
              <View key={s} testID={`lab-copy-${s}`} style={{ gap: 6, maxWidth: '100%' }}>
                <Text testID="lab-copy-label" style={{ fontSize: 12, fontWeight: '600', color: label, fontFamily: 'system-ui, sans-serif' }}>{s === 'light' ? 'Light' : 'Dark'}</Text>
                {frame(s)}
              </View>
            ))}
          </View>
        </SafeAreaProvider>
      );
    },
  ],
};
export default preview;
