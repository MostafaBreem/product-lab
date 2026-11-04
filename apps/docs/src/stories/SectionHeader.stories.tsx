import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SectionHeader } from '@lab/app-kit';
import { NOCTRL, pg, useL, useT } from '../ui/lang';

export default { title: 'Components/SectionHeader/Examples', component: SectionHeader, parameters: NOCTRL } satisfies Meta<typeof SectionHeader>;
export const Playground: StoryObj<typeof SectionHeader> = { ...pg({ title: 'Upcoming', action: 'History' }),
  render: (a) => { const T = useT(); return <SectionHeader title={T(a.title, 'Upcoming', 'الدفعات الجاية')} action={T(a.action, 'History', 'سجل الدفعات') || undefined} onAction={() => {}} />; } };
export const WithAction: StoryObj = { render: () => { const L = useL(); return <SectionHeader title={L('Upcoming', 'الدفعات الجاية')} action={L('History', 'سجل الدفعات')} onAction={() => {}} />; } };
export const TitleOnly: StoryObj = { render: () => { const L = useL(); return <SectionHeader title={L('Your products', 'منتجاتك')} />; } };
