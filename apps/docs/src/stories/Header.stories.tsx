import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Chip, Header, NavigationBar, SectionHeader } from '@lab/app-kit';
import { useL } from '../ui/lang';

export default { title: 'Components/Header/Examples' } satisfies Meta;
export const WithChip: StoryObj = { render: () => { const L = useL(); return <Header title={L('Money', 'أموالك')} trailing={<Chip icon="coins" label={L('Earn cashback', 'اكسب كاش باك')} />} />; } };
export const TitleOnly: StoryObj = { render: () => { const L = useL(); return <Header title={L('Profile', 'حسابك')} />; } };
