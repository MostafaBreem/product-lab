import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Chip } from '@lab/app-kit';
import { NOCTRL, pg, useL, useT } from '../ui/lang';

const meta: Meta<typeof Chip> = { title: 'Components/Chip/Examples', component: Chip, parameters: NOCTRL };
export default meta;
type S = StoryObj<typeof Chip>;
export const Playground: S = { ...pg({ label: 'Earn cashback', icon: 'coins' }), argTypes: { icon: { control: 'select', options: ['coins', 'credit-card', 'wallet', 'bell', 'bell-slash', 'calendar', 'info', 'question', 'warning-circle', 'wifi-slash', 'check-circle'] } },
  render: (a) => { const T = useT(); return <View style={{ flexDirection: 'row' }}><Chip {...a} label={T(a.label, 'Earn cashback', 'اكسب كاش باك')} onPress={() => {}} /></View>; } };
export const Default: S = { render: () => { const L = useL(); return <View style={{ flexDirection: 'row' }}><Chip icon="coins" label={L('Earn cashback', 'اكسب كاش باك')} onPress={() => {}} /></View>; } };
