import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Preview } from '@storybook/react-native-web-vite';
import { ThemeProvider, ToastHost, makeTheme } from '@lab/app-kit';

const BG = { light: makeTheme('light', 'en').t('color/bg/default') as string, dark: makeTheme('dark', 'en').t('color/bg/default') as string };

/** Docs pages follow the theme toggle too (canvas background comes from the backgrounds global). */
function useDocsTheme(dark: boolean) {
  useEffect(() => {
    const id = 'lab-docs-theme';
    document.getElementById(id)?.remove();
    document.documentElement.style.setProperty('--lab-surface', dark ? '#1c2024' : '#ffffff');
    document.documentElement.style.setProperty('--lab-border', dark ? '#43474c' : '#e0e2e9');
    if (!dark) return;
    const t = makeTheme('dark', 'en');
    const st = document.createElement('style');
    st.id = id;
    st.textContent = `
      body, .sb-show-main, .sbdocs-wrapper, .docs-story { background: ${BG.dark} !important; }
      .sbdocs, .sbdocs p, .sbdocs li, .sbdocs h1, .sbdocs h2, .sbdocs h3, .sbdocs h4, .sbdocs td, .sbdocs th, .sbdocs a { color: ${t.t('color/text/content/default')} !important; }
      .sbdocs table tr, .sbdocs table td, .sbdocs table th { background: ${t.t('color/surface/default')} !important; border-color: ${t.t('color/border/default')} !important; }
      .sbdocs code { background: ${t.t('color/surface/secondary/default')} !important; color: ${t.t('color/text/content/default')} !important; border-color: ${t.t('color/border/default')} !important; }
      .sbdocs .docblock-source, .sbdocs-preview { background: ${t.t('color/surface/default')} !important; border-color: ${t.t('color/border/default')} !important; }`;
    document.head.appendChild(st);
  }, [dark]);
}

const preview: Preview = {
  // Toggled by the toolbar buttons in manager.tsx (no dropdowns).
  globalTypes: { lang: { description: 'Language' }, scheme: { description: 'Theme' } },
  initialGlobals: { lang: 'en', scheme: 'light', backgrounds: { value: 'light' } },
  parameters: { viewport: { options: { iphone16: { name: 'iPhone 16 (393 × 852)', styles: { width: '393px', height: '852px' }, type: 'mobile' }, iphone16promax: { name: 'iPhone 16 Pro Max (440 × 956)', styles: { width: '440px', height: '956px' }, type: 'mobile' } } }, a11y: { test: 'todo' }, backgrounds: { options: { light: { name: 'Light', value: BG.light }, dark: { name: 'Dark', value: BG.dark } } }, layout: 'padded', options: { storySort: { order: ['Start here', 'Foundations', 'Components', 'Rules', 'For AI agents'] } } },
  decorators: [
    (Story, ctx) => {
      const lang = ctx.globals.lang ?? 'en';
      const scheme = ctx.globals.scheme ?? 'light';
      const th = makeTheme(scheme, lang);
      useDocsTheme(scheme === 'dark');
      return (
        <SafeAreaProvider>
          <ThemeProvider scheme={scheme} lang={lang}>
            <ToastHost bottomOffset={0}>
              <View style={{ padding: 16, maxWidth: 393, width: '100%', backgroundColor: th.t('color/bg/default') as string, direction: lang === 'ar' ? 'rtl' : 'ltr', gap: 12, borderRadius: 12 }}>
                <Story />
              </View>
            </ToastHost>
          </ThemeProvider>
        </SafeAreaProvider>
      );
    },
  ],
};
export default preview;
