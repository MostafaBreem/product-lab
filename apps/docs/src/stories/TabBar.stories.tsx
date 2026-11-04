import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TabBar } from '@lab/app-kit';
import { useArgs } from 'storybook/preview-api';
import { NOCTRL, pg, useL } from '../ui/lang';

export default { title: 'Components/TabBar/Examples', component: TabBar, parameters: NOCTRL } satisfies Meta<typeof TabBar>;
export const Playground: StoryObj<{ selected: string }> = { ...pg({ selected: 'money' }), argTypes: { selected: { control: 'inline-radio', options: ['discover', 'shop', 'money', 'profile'] } },
  render: function Render(a) { const L = useL(); const [, update] = useArgs(); return (
  <TabBar selected={a.selected} onSelect={(k) => update({ selected: k })} items={[{ key: 'discover', label: L('Discover', 'اكتشف'), icon: 'compass' }, { key: 'shop', label: L('Shop', 'تسوّق'), icon: 'storefront' }, { key: 'money', label: L('Money', 'أموالك'), icon: 'wallet' }, { key: 'profile', label: L('Profile', 'حسابك'), icon: 'user' }]} />); } };
export const FourTabs: StoryObj = { render: () => { const L = useL(); const [s, setS] = useState('money'); return (
  <TabBar selected={s} onSelect={setS} items={[{ key: 'discover', label: L('Discover', 'اكتشف'), icon: 'compass' }, { key: 'shop', label: L('Shop', 'تسوّق'), icon: 'storefront' }, { key: 'money', label: L('Money', 'أموالك'), icon: 'wallet' }, { key: 'profile', label: L('Profile', 'حسابك'), icon: 'user' }]} />); } };
