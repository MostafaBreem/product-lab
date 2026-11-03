import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Preview } from '@storybook/react-native-web-vite';
import { ThemeProvider, ToastHost, makeTheme } from '@lab/app-kit';

const preview: Preview = {
  globalTypes: {
    lang: { description: 'Language', toolbar: { title: 'Language', icon: 'globe', items: [{ value: 'en', title: 'English' }, { value: 'ar', title: 'العربية (RTL)' }], dynamicTitle: true } },
    scheme: { description: 'Theme', toolbar: { title: 'Theme', icon: 'mirror', items: [{ value: 'light', title: 'Light' }, { value: 'dark', title: 'Dark' }], dynamicTitle: true } },
  },
  initialGlobals: { lang: 'en', scheme: 'light' },
  parameters: { layout: 'padded', options: { storySort: { order: ['Start here', 'Foundations', 'Components', 'Rules', 'For AI agents'] } } },
  decorators: [
    (Story, ctx) => {
      const lang = ctx.globals.lang ?? 'en';
      const scheme = ctx.globals.scheme ?? 'light';
      const th = makeTheme(scheme, lang);
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
