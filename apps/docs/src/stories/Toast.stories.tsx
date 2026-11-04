import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Button, useToast } from '@lab/app-kit';
import { NOCTRL, pg, useL, useT } from '../ui/lang';

const meta: Meta = { title: 'Components/Toast/Examples', parameters: NOCTRL };
export default meta;
const TT = 'Reminders on';
export const Playground: StoryObj<{ tone: 'success' | 'neutral'; text: string }> = { ...pg({ tone: 'success', text: TT }), argTypes: { tone: { control: 'inline-radio', options: ['success', 'neutral'] } },
  render: (a) => { const toast = useToast(); const T = useT(); const L = useL(); return (
  <View style={{ minHeight: 160 }}><Button variant="link" label={L('Show toast', 'اعرض التنبيه')} onPress={() => toast({ tone: a.tone, text: T(a.text, TT, 'التذكيرات شغّالة') })} /></View>); } };
export const Tones: StoryObj = { render: () => { const toast = useToast(); const L = useL(); return (
  <View style={{ minHeight: 220, gap: 4 }}>
    <Button variant="link" label="Show Success" onPress={() => toast({ tone: 'success', text: L('Reminders on', 'التذكيرات شغّالة') })} />
    <Button variant="link" label="Show Neutral (2 lines)" onPress={() => toast({ tone: 'neutral', text: L('Reminders are off. You can change this in Profile › Notifications.', 'التذكيرات مقفلة. تقدر تغيّر هذا من حسابك › الإشعارات.') })} />
  </View>); } };
