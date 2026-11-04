import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button, Notice } from '@lab/app-kit';
import { NOCTRL, pg, useL, useT } from '../ui/lang';

export default { title: 'Components/Notice/Examples', component: Notice, parameters: NOCTRL } satisfies Meta<typeof Notice>;
const NT = "Payment didn't go through"; const NB = 'Your bank declined it. No money was taken.';
export const Playground: StoryObj<{ tone: 'critical' | 'neutral'; showIcon: boolean; icon: string; title: string; showBody: boolean; body: string; link: boolean }> = { ...pg({ tone: 'critical', showIcon: true, icon: 'default', title: NT, showBody: true, body: NB, link: false }),
  argTypes: { tone: { control: 'inline-radio', options: ['critical', 'neutral'] }, icon: { control: 'select', options: ['default', ...['coins', 'credit-card', 'wallet', 'bell', 'bell-slash', 'calendar', 'info', 'question', 'warning-circle', 'wifi-slash', 'check-circle']] } },
  render: (a) => { const T = useT(); const L = useL(); return (<Notice tone={a.tone} showIcon={a.showIcon} icon={a.icon === 'default' ? undefined : (a.icon as never)} title={T(a.title, NT, 'ما تمّ الدفع')} body={a.showBody ? T(a.body, NB, 'بنكك رفضها، وما انخصم منك شي.') || undefined : undefined}>
    {a.link ? <Button variant="link" tone={a.tone === 'critical' ? 'critical' : 'default'} label={L('Try another card', 'جرّب بطاقة ثانية')} /> : null}</Notice>); } };
export const Critical: StoryObj = { render: () => { const L = useL(); return <Notice tone="critical" title={L("Payment didn't go through", 'ما تمّ الدفع')} body={L('Your bank declined it. No money was taken.', 'بنكك رفضها، وما انخصم منك شي.')} />; } };
export const NeutralOffline: StoryObj = { render: () => { const L = useL(); return <Notice icon="wifi-slash" title={L("You're offline", 'ما فيه إنترنت')} body={L('Showing your last update, today 8:15 AM. Connect to pay or extend.', 'هذا آخر تحديث، اليوم 8:15 ص. اتصل بالإنترنت عشان تدفع أو تأجّل.')} />; } };
export const WithLink: StoryObj = { render: () => { const L = useL(); return <Notice icon="bell-slash" title={L('Notifications are off for Tabby', 'الإشعارات مقفلة لتابي')} body={L('Turn them on in iPhone Settings to get payment reminders.', 'شغّلها من إعدادات الآيفون عشان توصلك تذكيرات الدفع.')}><Button variant="link" label={L('Open iPhone Settings', 'افتح إعدادات الآيفون')} /></Notice>; } };
