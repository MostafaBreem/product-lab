import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Button, useToast } from '@lab/app-kit';
import { useL } from '../ui/lang';

const meta: Meta = { title: 'Components/Toast/Examples' };
export default meta;
export const Tones: StoryObj = { render: () => { const toast = useToast(); const L = useL(); return (
  <View style={{ minHeight: 220, gap: 4 }}>
    <Button variant="link" label="Show Success" onPress={() => toast({ tone: 'success', text: L('Reminders on', 'التذكيرات شغّالة') })} />
    <Button variant="link" label="Show Neutral (2 lines)" onPress={() => toast({ tone: 'neutral', text: L('Reminders are off. You can change this in Profile › Notifications.', 'التذكيرات مقفلة. تقدر تغيّر هذا من حسابك › الإشعارات.') })} />
  </View>); } };
