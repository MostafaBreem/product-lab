import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Card, fmt, Icon, KeyValue, Txt, useTheme } from '@lab/app-kit';
import { NOCTRL, pg, useL, useLang } from '../ui/lang';

const meta: Meta<typeof Card> = { title: 'Components/Card/Examples', component: Card, parameters: NOCTRL };
export default meta;
const ROWS: [string, string, number][] = [['Order total', 'إجمالي الطلب', 125000], ['Paid so far', 'المدفوع لين الحين', 31250], ['Left to pay', 'المتبقي', 93750]];

export const Playground: StoryObj<{ rows: number }> = { ...pg({ rows: 3 }), argTypes: { rows: { control: { type: 'range', min: 1, max: 3, step: 1 } } },
  render: (a) => { const th = useTheme(); const L = useL(); const lang = useLang(); return (
    <Card style={{ gap: th.t('space/gap-y/sm') }}>{ROWS.slice(0, a.rows).map(([en, ar, v], i) => <KeyValue key={en} layout="row" strong={i === a.rows - 1} k={L(en, ar)} v={fmt.money(v, lang)} />)}</Card>); } };

/** Usage 1 · Details: key-value rows, gap 12 set by the content. */
export const Details: StoryObj = { render: () => { const th = useTheme(); const L = useL(); const lang = useLang(); return (
  <Card style={{ gap: th.t('space/gap-y/sm') }}>{ROWS.map(([en, ar, v], i) => <KeyValue key={en} layout="row" strong={i === 2} k={L(en, ar)} v={fmt.money(v, lang)} />)}</Card>); } };

/** Usage 2 · One child: Extended total. */
export const OneTotal: StoryObj = { render: () => { const L = useL(); const lang = useLang(); return (
  <Card><KeyValue layout="row" strong k={L('Total extension fee', 'إجمالي رسوم التأجيل')} v={fmt.money(1200, lang)} /></Card>); } };

/** Usage 3 · Steps: icon + text rows, gap 16. */
export const Steps: StoryObj = { render: () => { const th = useTheme(); const L = useL(); const STEPS: [string, string, string, string][] = [['Pay when you can', 'ادفع وقت ما تقدر', 'Paying clears the overdue tag.', 'الدفع يشيل علامة التأخير.'], ['New purchases are paused', 'المشتريات الجديدة موقوفة', 'They open again once you pay.', 'ترجع تشتغل أول ما تدفع.']]; return (
  <Card style={{ gap: th.t('space/gap-y/md') }}>{STEPS.map(([t, ta, b, ba]) => (
    <View key={t} style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm') }}>
      <Icon name="info" />
      <View style={{ flex: 1, gap: th.t('space/gap-y/4xs') }}><Txt role="label/lg">{L(t, ta)}</Txt><Txt role="body/sm" color="color/text/content/secondary/default" wrap>{L(b, ba)}</Txt></View>
    </View>))}
  </Card>); } };
