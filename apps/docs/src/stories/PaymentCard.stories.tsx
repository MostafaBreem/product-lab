import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fmt, PaymentCard } from '@lab/app-kit';
import { useL, useLang } from '../ui/lang';

export default { title: 'Components/PaymentCard/Examples', component: PaymentCard } satisfies Meta<typeof PaymentCard>;
export const Due: StoryObj = { render: () => { const L = useL(); const lang = useLang(); const m = (h: number) => fmt.money(h, lang); return (
  <PaymentCard state="due" label={L('Next payment', 'الدفعة الجاية')} amount={m(31250)} dueLine={fmt.dueLine('2026-11-05', '2026-10-31', lang)} pay={{ label: L(`Pay ${m(31250)}`, `ادفع ${m(31250)}`), onPress: () => {} }} linksRow
    links={[{ label: L('Pay a different amount', 'ادفع مبلغ ثاني'), onPress: () => {} }, { label: L('Extend a payment', 'أجّل دفعة'), onPress: () => {} }]}
    summary={[{ k: L('Due in 30 days', 'موعدها بعد 30 يوم'), v: m(31250) }, { k: L('Total to pay', 'الإجمالي المستحق'), v: m(135000) }]} />); } };
export const Overdue: StoryObj = { render: () => { const L = useL(); const lang = useLang(); const m = (h: number) => fmt.money(h, lang); return (
  <PaymentCard state="overdue" criticalFill tag={fmt.overdueTag(3, lang)} label={L('Amount overdue', 'المبلغ المتأخر')} amount={m(31250)} dueLine={L('Was due Wed 28 Oct', `كان موعدها ${fmt.dayDate('2026-10-28', 'ar')}`)} dueCritical
    pay={{ label: L(`Pay ${m(31250)} now`, `ادفع ${m(31250)} الحين`), critical: true, onPress: () => {} }} links={[{ label: L('What happens next', 'وش يصير بعدين'), critical: true, onPress: () => {} }]} />); } };
export const CaughtUp: StoryObj = { render: () => { const L = useL(); const lang = useLang(); const m = (h: number) => fmt.money(h, lang); return (
  <PaymentCard state="caughtUp" label={L('Next payment', 'الدفعة الجاية')} title={L("You're all caught up", 'ما عليك دفعات مستحقة')} dueLine={L(`${m(31250)} on Sat 28 Nov`, `${m(31250)} يوم ${fmt.dayDate('2026-11-28', 'ar')}`)} links={[{ label: L('Pay early', 'ادفع بدري'), onPress: () => {} }]} />); } };
