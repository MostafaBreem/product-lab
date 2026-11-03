import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TabBar } from '@lab/app-kit';
import { useL } from '../ui/lang';

export default { title: 'Components/TabBar/Examples' } satisfies Meta;
export const FourTabs: StoryObj = { render: () => { const L = useL(); const [s, setS] = useState('money'); return (
  <TabBar selected={s} onSelect={setS} items={[{ key: 'discover', label: L('Discover', 'اكتشف'), icon: 'compass' }, { key: 'shop', label: L('Shop', 'تسوّق'), icon: 'storefront' }, { key: 'money', label: L('Money', 'أموالك'), icon: 'wallet' }, { key: 'profile', label: L('Profile', 'حسابك'), icon: 'user' }]} />); } };
