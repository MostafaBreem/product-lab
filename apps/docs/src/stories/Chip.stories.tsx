import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Chip } from '@lab/app-kit';
import { useL } from '../ui/lang';

const meta: Meta<typeof Chip> = { title: 'Components/Chip/Examples', component: Chip, args: { label: 'Earn cashback', icon: 'coins' } };
export default meta;
type S = StoryObj<typeof Chip>;
export const Playground: S = { render: (a) => <View style={{ flexDirection: 'row' }}><Chip {...a} /></View> };
export const Default: S = { render: () => { const L = useL(); return <View style={{ flexDirection: 'row' }}><Chip icon="coins" label={L('Earn cashback', 'اكسب كاش باك')} onPress={() => {}} /></View>; } };
