import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SectionHeader } from '@lab/app-kit';
import { useL } from '../ui/lang';

export default { title: 'Components/SectionHeader/Examples' } satisfies Meta;
export const WithAction: StoryObj = { render: () => { const L = useL(); return <SectionHeader title={L('Upcoming', 'الدفعات الجاية')} action={L('History', 'سجل الدفعات')} onAction={() => {}} />; } };
export const TitleOnly: StoryObj = { render: () => { const L = useL(); return <SectionHeader title={L('Your products', 'منتجاتك')} />; } };
