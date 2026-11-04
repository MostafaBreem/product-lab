import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { NavigationBar } from '@lab/app-kit';
import { NOCTRL, pg, useL, useT } from '../ui/lang';

export default { title: 'Components/NavigationBar/Examples', component: NavigationBar, parameters: NOCTRL } satisfies Meta<typeof NavigationBar>;
export const Playground: StoryObj<typeof NavigationBar> = { ...pg({ title: 'Overdue payment', leading: 'back', transparent: false }), argTypes: { leading: { control: 'inline-radio', options: ['back', 'close'] } },
  render: (a) => { const T = useT(); return <NavigationBar {...a} title={T(a.title, 'Overdue payment', 'دفعة متأخرة')} onLeading={() => {}} />; } };
export const Back: StoryObj = { render: () => { const L = useL(); return <NavigationBar title={L('Overdue payment', 'دفعة متأخرة')} leading="back" onLeading={() => {}} />; } };
export const Close: StoryObj = { render: () => { const L = useL(); return <NavigationBar title={L('Pay with', 'الدفع بـ')} leading="close" onLeading={() => {}} />; } };
