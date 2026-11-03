import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button, fmt } from '@lab/app-kit';
import { useL, useLang } from '../ui/lang';

const meta: Meta<typeof Button> = { title: 'Components/Button/Examples', component: Button, args: { label: 'Pay ⃁ 312.50', variant: 'primary', tone: 'default', loading: false },
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'link'] }, tone: { control: 'inline-radio', options: ['default', 'critical'] } } };
export default meta;
type S = StoryObj<typeof Button>;
export const Playground: S = {};
export const Primary: S = { render: () => { const L = useL(); const lang = useLang(); return <Button label={L(`Pay ${fmt.money(31250, 'en')}`, `ادفع ${fmt.money(31250, lang)}`)} />; } };
export const PrimaryCritical: S = { render: () => { const L = useL(); const lang = useLang(); return <Button tone="critical" label={L(`Pay ${fmt.money(31250, 'en')} now`, `ادفع ${fmt.money(31250, lang)} الحين`)} />; } };
export const Loading: S = { render: () => { const L = useL(); const [b, setB] = useState(true); return <Button loading={b} label={L('Paying…', 'جاري الدفع…')} onPress={() => setB(true)} />; } };
export const Links: S = { render: () => { const L = useL(); return (<><Button variant="link" label={L('Pay a different amount', 'ادفع مبلغ ثاني')} /><Button variant="link" tone="critical" label={L('What happens next', 'وش يصير بعدين')} /></>); } };
