// Toolbar toggles: one click each (no dropdown). Language EN ⇄ العربية (also flips RTL), Theme Light ⇄ Dark (canvas, docs pages AND the Storybook shell: sidebar, toolbar, panels).
import React, { useEffect } from 'react';
import { addons, types, useGlobals, useStorybookApi } from 'storybook/manager-api';
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

addons.setConfig({ theme: SHELL.light, sidebar: { showRoots: true } });

addons.register('lab-toggles', () => {
  addons.add('lab-toggles/tools', {
    type: types.TOOL,
    title: 'Language and theme',
    match: () => true,
    render: () => {
      const [g, update] = useGlobals();
      const api = useStorybookApi();
      const ar = g.lang === 'ar';
      const dark = g.scheme === 'dark';
      useEffect(() => { api.setOptions({ theme: dark ? SHELL.dark : SHELL.light }); }, [dark, api]);
      return (
        <>
          <Separator />
          <ToggleButton pressed={ar} ariaLabel={false} tooltip={ar ? 'Switch to English' : 'Switch to Arabic (right to left)'} onClick={() => update({ lang: ar ? 'en' : 'ar' })}>
            {ar ? 'ع  العربية' : 'EN  English'}
          </ToggleButton>
          <ToggleButton pressed={dark} ariaLabel={false} tooltip={dark ? 'Switch to light' : 'Switch to dark'} onClick={() => update({ scheme: dark ? 'light' : 'dark' })}>
            {dark ? '☾  Dark' : '☀  Light'}
          </ToggleButton>
        </>
      );
    },
  });
});
