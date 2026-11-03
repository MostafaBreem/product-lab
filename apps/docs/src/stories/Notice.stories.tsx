import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button, Notice } from '@lab/app-kit';
import { useL } from '../ui/lang';

export default { title: 'Components/Notice/Examples', component: Notice } satisfies Meta<typeof Notice>;
export const Critical: StoryObj = { render: () => { const L = useL(); return <Notice tone="critical" title={L("Payment didn't go through", 'ما تمّ الدفع')} body={L('Your bank declined it. No money was taken.', 'بنكك رفضها، وما انخصم منك شي.')} />; } };
export const NeutralOffline: StoryObj = { render: () => { const L = useL(); return <Notice icon="wifi-slash" title={L("You're offline", 'ما فيه إنترنت')} body={L('Showing your last update, today 8:15 AM. Connect to pay or extend.', 'هذا آخر تحديث، اليوم 8:15 ص. اتصل بالإنترنت عشان تدفع أو تأجّل.')} />; } };
export const WithLink: StoryObj = { render: () => { const L = useL(); return <Notice icon="bell-slash" title={L('Notifications are off for Tabby', 'الإشعارات مقفلة لتابي')} body={L('Turn them on in iPhone Settings to get payment reminders.', 'شغّلها من إعدادات الآيفون عشان توصلك تذكيرات الدفع.')}><Button variant="link" label={L('Open iPhone Settings', 'افتح إعدادات الآيفون')} /></Notice>; } };
