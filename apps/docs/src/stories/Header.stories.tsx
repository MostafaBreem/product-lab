import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Chip, Header, NavigationBar, SectionHeader } from '@lab/app-kit';
import { NOCTRL, pg, useL, useT } from '../ui/lang';

export default { title: 'Components/Header/Examples', component: Header, parameters: NOCTRL } satisfies Meta<typeof Header>;
export const Playground: StoryObj<{ title: string; chip: boolean }> = { ...pg({ title: 'Money', chip: true }),
  render: (a) => { const T = useT(); const L = useL(); return <Header title={T(a.title, 'Money', 'أموالك')} trailing={a.chip ? <Chip icon="coins" label={L('Earn cashback', 'اكسب كاش باك')} /> : undefined} />; } };
export const WithChip: StoryObj = { render: () => { const L = useL(); return <Header title={L('Money', 'أموالك')} trailing={<Chip icon="coins" label={L('Earn cashback', 'اكسب كاش باك')} />} />; } };
export const TitleOnly: StoryObj = { render: () => { const L = useL(); return <Header title={L('Profile', 'حسابك')} />; } };
