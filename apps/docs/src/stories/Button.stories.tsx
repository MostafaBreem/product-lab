import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button, fmt } from '@lab/app-kit';
import { NOCTRL, pg, useL, useLang, useT } from '../ui/lang';

const meta: Meta<typeof Button> = { title: 'Components/Button/Examples', component: Button, parameters: NOCTRL };
export default meta;
type S = StoryObj<typeof Button>;
const PAY = `Pay ${fmt.money(31250, 'en')}`;
export const Playground: S = { ...pg({ label: PAY, variant: 'primary', tone: 'default', loading: false, disabled: false, full: true }),
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'link'] }, tone: { control: 'inline-radio', options: ['default', 'critical'] } },
  render: (a) => { const T = useT(); const lang = useLang(); return <Button {...a} label={T(a.label, PAY, `ادفع ${fmt.money(31250, lang)}`)} />; } };
export const Primary: S = { render: () => { const L = useL(); const lang = useLang(); return <Button label={L(`Pay ${fmt.money(31250, 'en')}`, `ادفع ${fmt.money(31250, lang)}`)} />; } };
export const PrimaryCritical: S = { render: () => { const L = useL(); const lang = useLang(); return <Button tone="critical" label={L(`Pay ${fmt.money(31250, 'en')} now`, `ادفع ${fmt.money(31250, lang)} الحين`)} />; } };
export const Loading: S = { render: () => { const L = useL(); const [b, setB] = useState(true); return <Button loading={b} label={L('Paying…', 'جاري الدفع…')} onPress={() => setB(true)} />; } };
export const Disabled: S = { render: () => { const L = useL(); return <Button disabled label={L('Pay', 'ادفع')} />; } };
export const Links: S = { render: () => { const L = useL(); return (<><Button variant="link" label={L('Choose what to pay', 'اختر دفعاتك')} /><Button variant="link" tone="critical" label={L('What happens next', 'وش يصير بعدين')} /></>); } };
