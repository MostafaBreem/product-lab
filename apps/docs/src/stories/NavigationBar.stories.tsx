import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { NavigationBar } from '@lab/app-kit';
import { useL } from '../ui/lang';

export default { title: 'Components/NavigationBar/Examples' } satisfies Meta;
export const Back: StoryObj = { render: () => { const L = useL(); return <NavigationBar title={L('Overdue payment', 'دفعة متأخرة')} leading="back" onLeading={() => {}} />; } };
export const Close: StoryObj = { render: () => { const L = useL(); return <NavigationBar title={L('Pay with', 'الدفع بـ')} leading="close" onLeading={() => {}} />; } };
