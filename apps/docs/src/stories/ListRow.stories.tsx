import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fmt, ListGroup, ListRow } from '@lab/app-kit';
import { NOCTRL, pg, useL, useLang, useT } from '../ui/lang';

export default { title: 'Components/ListRow/Examples', component: ListRow, parameters: NOCTRL } satisfies Meta<typeof ListRow>;
type PA = { title: string; subtitle: string; value: string; quietValue: string; leading: 'none' | 'logo' | 'icon' | 'skeleton'; chevron: boolean; selection: 'none' | 'radio' | 'check' | 'switch' };
const V = fmt.money(12500, 'en');
export const Playground: StoryObj<PA> = { ...pg({ title: 'Noon', subtitle: 'Thu 5 Nov · 2 of 4', value: V, quietValue: '', leading: 'logo', chevron: true, selection: 'none' }),
  argTypes: { leading: { control: 'inline-radio', options: ['none', 'logo', 'icon', 'skeleton'] }, selection: { control: 'inline-radio', options: ['none', 'radio', 'check', 'switch'] } },
  render: function Render(a) { const T = useT(); const lang = useLang(); const [on, setOn] = useState(true);
    const leading = a.leading === 'logo' ? { kind: 'logo' as const, text: 'n', color: '#F5C400' } : a.leading === 'icon' ? { kind: 'icon' as const, icon: 'credit-card' as const } : a.leading === 'skeleton' ? { kind: 'skeleton' as const } : undefined;
    const selection = a.selection === 'none' ? undefined : a.selection === 'switch' ? { kind: 'switch' as const, value: on, onChange: setOn } : { kind: a.selection, selected: on };
    return (<ListGroup><ListRow title={T(a.title, 'Noon', 'نون')} subtitle={T(a.subtitle, 'Thu 5 Nov · 2 of 4', `${fmt.dayDate('2026-11-05', 'ar')} · 2 من 4`) || undefined} value={T(a.value, V, fmt.money(12500, lang)) || undefined} quietValue={a.quietValue || undefined}
      leading={leading} chevron={a.chevron && !selection} selection={selection} onPress={() => setOn(!on)} /></ListGroup>); } };
export const Leading: StoryObj = { render: () => { const L = useL(); const lang = useLang(); return (
  <ListGroup>
    <ListRow title={L('Noon', 'نون')} subtitle={L('Thu 5 Nov · 2 of 4', `${fmt.dayDate('2026-11-05', 'ar')} · 2 من 4`)} value={fmt.money(12500, lang)} chevron leading={{ kind: 'logo', text: 'n', color: '#F5C400' }} onPress={() => {}} />
    <ListRow title={L('Namshi', 'نمشي')} subtitle={L('Was due Wed 28 Oct', `كان موعدها ${fmt.dayDate('2026-10-28', 'ar')}`)} subtitleColor="color/text/content/critical/default" value={fmt.money(18750, lang)} chevron leading={{ kind: 'logo', text: 'N', color: '#1A1A1A' }} onPress={() => {}} />
    <ListRow title={L('In-store Card', 'بطاقة المتجر')} subtitle={L('Shop in person, split in 4', 'تسوّق من المتاجر وقسّمها على 4 دفعات')} chevron leading={{ kind: 'icon', icon: 'credit-card' }} onPress={() => {}} />
    <ListRow title={L('Push reminders', 'إشعارات التطبيق')} subtitle={L('Before and after each due date', 'قبل وبعد كل موعد سداد')} quietValue={L('Always on', 'شغّالة دايم')} />
  </ListGroup>); } };
export const Selection: StoryObj = { render: () => { const L = useL(); const lang = useLang(); const [r, setR] = useState(0); const [c, setC] = useState(true); const [s, setS] = useState(true); return (
  <ListGroup plain>
    {[0, 1].map((i) => <ListRow key={i} plainPadding title={L(i ? 'Until Wed 11 Nov' : 'Until Wed 4 Nov', i ? 'لين الأربعاء 11 نوفمبر' : 'لين الأربعاء 4 نوفمبر')} quietValue={L(`Fee ${fmt.money(5000, 'en')}`, `الرسوم ${fmt.money(5000, lang)}`)} selection={{ kind: 'radio', selected: r === i }} onPress={() => setR(i)} />)}
    <ListRow plainPadding title={L('Noon', 'نون')} subtitle={L(`Fee ${fmt.money(2000, 'en')}`, `الرسوم ${fmt.money(2000, lang)}`)} value={fmt.money(12500, lang)} leading={{ kind: 'logo', text: 'n', color: '#F5C400' }} selection={{ kind: 'check', selected: c }} onPress={() => setC(!c)} />
    <ListRow plainPadding title={L('Also remind me on salary day', 'ذكّرني كمان يوم الراتب')} selection={{ kind: 'switch', value: s, onChange: setS }} />
  </ListGroup>); } };
export const Loading: StoryObj = { render: () => <ListGroup>{[0, 1].map((i) => <ListRow key={i} title=" " leading={{ kind: 'skeleton' }} />)}</ListGroup> };
