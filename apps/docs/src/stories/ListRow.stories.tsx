import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fmt, ListGroup, ListRow } from '@lab/app-kit';
import { useL, useLang } from '../ui/lang';

export default { title: 'Components/ListRow/Examples', component: ListRow } satisfies Meta<typeof ListRow>;
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
