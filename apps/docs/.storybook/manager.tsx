// Toolbar toggles: one click each (no dropdown). Language EN ⇄ العربية (also flips RTL), Theme Light ⇄ Dark (canvas, docs pages AND the Storybook shell: sidebar, toolbar, panels).
import React, { useState } from 'react';
import { addons, types } from 'storybook/manager-api';
import { PREFS_EVENT, readPrefs, writePrefs, type Prefs } from '../src/ui/prefs';
import { create } from 'storybook/theming/create';
import { tokenSets } from '../../../packages/app-kit/src/tokens/generated';
import { Separator, ToggleButton } from 'storybook/internal/components';

const brand = { brandTitle: 'app-kit · Mobbin lab', brandUrl: 'https://mostafabreem.github.io/product-lab/', brandTarget: '_self', appBorderRadius: 12, inputBorderRadius: 8, fontBase: '"Nunito Sans", -apple-system, system-ui, sans-serif' };
// Shell colours come from the same tokens as the components (plain data file, no React Native in the manager bundle).
const shell = (m: 'light' | 'dark') => {
  const t = (tokenSets as unknown as Record<string, Record<string, string>>)[`${m}_en`];
  return create({ base: m, ...brand, colorPrimary: t['color/fill/brand/default'], colorSecondary: t['color/fill/brand/default'],
    appBg: t['color/bg/default'], appContentBg: t['color/bg/default'], appPreviewBg: t['color/bg/default'], barBg: t['color/surface/default'],
    appBorderColor: t['color/border/default'], textColor: t['color/text/content/default'], textMutedColor: t['color/text/content/secondary/default'], barTextColor: t['color/text/content/secondary/default'] });
};
const SHELL = { light: shell('light'), dark: shell('dark') };

addons.setConfig({ theme: readPrefs().scheme === 'dark' ? SHELL.dark : SHELL.light, sidebar: { showRoots: true } });

addons.register('lab-toggles', (api) => {
  // Start the shell in the saved theme.
  api.setOptions({ theme: readPrefs().scheme === 'dark' ? SHELL.dark : SHELL.light });
  addons.add('lab-toggles/tools', {
    type: types.TOOL,
    title: 'Language and theme',
    match: () => true,
    render: () => {
      const [p, setP] = useState<Prefs>(readPrefs);
      const set = (n: Prefs) => {
        setP(n); writePrefs(n);
        addons.getChannel().emit(PREFS_EVENT, n); // preview re-renders in place, no reload
        if (n.scheme !== p.scheme) api.setOptions({ theme: n.scheme === 'dark' ? SHELL.dark : SHELL.light });
      };
      const ar = p.lang === 'ar';
      const dark = p.scheme === 'dark';
      return (
        <>
          <Separator />
          <ToggleButton pressed={ar} ariaLabel={false} tooltip={ar ? 'Switch to English' : 'Switch to Arabic (right to left)'} onClick={() => set({ ...p, lang: ar ? 'en' : 'ar' })}>
            {ar ? 'ع  العربية' : 'EN  English'}
          </ToggleButton>
          <ToggleButton pressed={dark} ariaLabel={false} tooltip={dark ? 'Switch to light' : 'Switch to dark'} onClick={() => set({ ...p, scheme: dark ? 'light' : 'dark' })}>
            {dark ? '☾  Dark' : '☀  Light'}
          </ToggleButton>
        </>
      );
    },
  });
});
