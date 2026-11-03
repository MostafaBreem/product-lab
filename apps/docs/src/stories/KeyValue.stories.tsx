import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { fmt, KeyValue, useTheme } from '@lab/app-kit';
import { useL, useLang } from '../ui/lang';

const meta: Meta<typeof KeyValue> = { title: 'Components/KeyValue/Examples', component: KeyValue, args: { k: 'Total to pay', v: '⃁ 1,350.00', layout: 'stacked', strong: false },
  argTypes: { layout: { control: 'inline-radio', options: ['stacked', 'row'] } } };
export default meta;
type S = StoryObj<typeof KeyValue>;
export const Playground: S = {};
export const SummaryInset: S = { render: () => { const th = useTheme(); const L = useL(); const lang = useLang(); return (
  <View style={{ flexDirection: 'row', gap: 12, backgroundColor: th.t('payment-card/summary/fill/default') as string, borderRadius: 12, padding: 12 }}>
    <KeyValue k={L('Due in 30 days', 'موعدها بعد 30 يوم')} v={fmt.money(31250, lang)} /><KeyValue k={L('Total to pay', 'الإجمالي المستحق')} v={fmt.money(135000, lang)} />
  </View>); } };
export const DetailsRows: S = { render: () => { const th = useTheme(); const L = useL(); const lang = useLang(); return (
  <View style={{ gap: 12, backgroundColor: th.t('color/surface/default') as string, borderRadius: 20, padding: 16 }}>
    <KeyValue layout="row" k={L('Order total', 'إجمالي الطلب')} v={fmt.money(50000, lang)} />
    <KeyValue layout="row" k={L('Paid so far', 'المدفوع لين الحين')} v={fmt.money(12500, lang)} />
    <KeyValue layout="row" strong k={L('Left to pay', 'المتبقي')} v={fmt.money(37500, lang)} />
  </View>); } };
