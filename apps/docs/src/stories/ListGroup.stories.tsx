import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ListGroup, ListRow } from '@lab/app-kit';
import { NOCTRL, pg, useL } from '../ui/lang';

export default { title: 'Components/ListGroup/Examples', component: ListGroup, parameters: NOCTRL } satisfies Meta<typeof ListGroup>;
const ROWS: [string, string, 'credit-card' | 'coins' | 'question' | 'bell'][] = [['In-store Card', 'بطاقة المتجر', 'credit-card'], ['Pay later purchases', 'مشترياتك بالدفع لاحقًا', 'coins'], ['Help with payments', 'مساعدة في الدفع', 'question'], ['Notifications', 'الإشعارات', 'bell']];
export const Playground: StoryObj<{ plain: boolean; rows: number }> = { ...pg({ plain: false, rows: 3 }), argTypes: { rows: { control: { type: 'range', min: 1, max: 4, step: 1 } } },
  render: (a) => { const L = useL(); return <ListGroup plain={a.plain}>{ROWS.slice(0, a.rows).map(([en, ar, icon]) => <ListRow key={en} title={L(en, ar)} leading={{ kind: 'icon', icon }} chevron onPress={() => {}} />)}</ListGroup>; } };
export const Card: StoryObj = { render: () => { const L = useL(); return (
  <ListGroup>
    <ListRow title={L('In-store Card', 'بطاقة المتجر')} leading={{ kind: 'icon', icon: 'credit-card' }} chevron onPress={() => {}} />
    <ListRow title={L('Pay later purchases', 'مشترياتك بالدفع لاحقًا')} subtitle={L('3 open plans', '3 خطط دفع مفتوحة')} leading={{ kind: 'icon', icon: 'coins' }} chevron onPress={() => {}} />
    <ListRow title={L('Help with payments', 'مساعدة في الدفع')} leading={{ kind: 'icon', icon: 'question' }} chevron onPress={() => {}} />
  </ListGroup>); } };
