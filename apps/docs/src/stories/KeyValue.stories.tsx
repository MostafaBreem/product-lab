import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { fmt, KeyValue, useTheme } from '@lab/app-kit';
import { NOCTRL, pg, useL, useLang, useT } from '../ui/lang';

const meta: Meta<typeof KeyValue> = { title: 'Components/KeyValue/Examples', component: KeyValue, parameters: NOCTRL };
export default meta;
type S = StoryObj<typeof KeyValue>;
const TOTAL = fmt.money(135000, 'en');
export const Playground: S = { ...pg({ k: 'Total to pay', v: TOTAL, layout: 'stacked', strong: false }), argTypes: { layout: { control: 'inline-radio', options: ['stacked', 'row'] } },
  render: (a) => { const T = useT(); const lang = useLang(); return <KeyValue {...a} k={T(a.k, 'Total to pay', 'الإجمالي المستحق')} v={T(a.v, TOTAL, fmt.money(135000, lang))} />; } };
export const SummaryInset: S = { render: () => { const th = useTheme(); const L = useL(); const lang = useLang(); return (
  <View style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm'), backgroundColor: th.t('payment-card/summary/fill/default') as string, borderRadius: th.t('radius/md'), padding: th.t('space/padding/sm') }}>
    <KeyValue k={L('Due in 30 days', 'موعدها بعد 30 يوم')} v={fmt.money(31250, lang)} /><KeyValue k={L('Total to pay', 'الإجمالي المستحق')} v={fmt.money(135000, lang)} />
  </View>); } };
export const DetailsRows: S = { render: () => { const th = useTheme(); const L = useL(); const lang = useLang(); return (
  <View style={{ gap: th.t('space/gap-y/sm'), backgroundColor: th.t('color/surface/default') as string, borderRadius: th.t('radius/xl'), padding: th.t('space/padding/md') }}>
    <KeyValue layout="row" k={L('Order total', 'إجمالي الطلب')} v={fmt.money(50000, lang)} />
    <KeyValue layout="row" k={L('Paid so far', 'المدفوع لين الحين')} v={fmt.money(12500, lang)} />
    <KeyValue layout="row" strong k={L('Left to pay', 'المتبقي')} v={fmt.money(37500, lang)} />
  </View>); } };
