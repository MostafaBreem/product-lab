import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { fmt, Tag } from '@lab/app-kit';
import { useLang } from '../ui/lang';

const meta: Meta<typeof Tag> = { title: 'Components/Tag/Examples', component: Tag, args: { label: 'Overdue · 3 days', tone: 'critical' },
  argTypes: { tone: { control: 'inline-radio', options: ['default', 'critical', 'success', 'warning', 'info'] } } };
export default meta;
type S = StoryObj<typeof Tag>;
export const Playground: S = {};
export const AllTones: S = { render: () => { const lang = useLang(); return (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    <Tag tone="critical" label={fmt.overdueTag(3, lang)} /><Tag label="Default" /><Tag tone="success" label="Success" /><Tag tone="warning" label="Warning" /><Tag tone="info" label="Info" />
  </View>); } };
