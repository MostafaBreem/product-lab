// Toolbar toggles: one click each (no dropdown). Language EN ⇄ العربية (also flips RTL), Theme Light ⇄ Dark (also sets the canvas background).
import React from 'react';
import { addons, types, useGlobals } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';
import { Separator, ToggleButton } from 'storybook/internal/components';

addons.setConfig({
  theme: create({
    base: 'light', brandTitle: 'app-kit · Mobbin lab', brandUrl: 'https://mostafabreem.github.io/product-lab/', brandTarget: '_self',
    colorPrimary: '#5b0dd9', colorSecondary: '#6c30ea', appBorderRadius: 12, inputBorderRadius: 8,
    fontBase: '"Nunito Sans", -apple-system, system-ui, sans-serif',
  }),
  sidebar: { showRoots: true },
});

addons.register('lab-toggles', () => {
  addons.add('lab-toggles/tools', {
    type: types.TOOL,
    title: 'Language and theme',
    match: () => true,
    render: () => {
      const [g, update] = useGlobals();
      const ar = g.lang === 'ar';
      const dark = g.scheme === 'dark';
      return (
        <>
          <Separator />
          <ToggleButton pressed={ar} ariaLabel={false} tooltip={ar ? 'Switch to English' : 'Switch to Arabic (right to left)'} onClick={() => update({ lang: ar ? 'en' : 'ar' })}>
            {ar ? 'ع  العربية' : 'EN  English'}
          </ToggleButton>
          <ToggleButton pressed={dark} ariaLabel={false} tooltip={dark ? 'Switch to light' : 'Switch to dark'} onClick={() => update({ scheme: dark ? 'light' : 'dark', backgrounds: { value: dark ? 'light' : 'dark' } })}>
            {dark ? '☾  Dark' : '☀  Light'}
          </ToggleButton>
        </>
      );
    },
  });
});
