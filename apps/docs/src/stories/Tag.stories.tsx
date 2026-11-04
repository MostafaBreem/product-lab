import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { fmt, Tag, useTheme } from '@lab/app-kit';
import { NOCTRL, pg, useLang, useT } from '../ui/lang';

const meta: Meta<typeof Tag> = { title: 'Components/Tag/Examples', component: Tag, parameters: NOCTRL };
export default meta;
type S = StoryObj<typeof Tag>;
const OVERDUE = fmt.overdueTag(3, 'en');
export const Playground: S = { ...pg({ label: OVERDUE, tone: 'critical' }), argTypes: { tone: { control: 'inline-radio', options: ['default', 'critical', 'success', 'warning', 'info'] } },
  render: (a) => { const T = useT(); const lang = useLang(); return <View style={{ flexDirection: 'row' }}><Tag {...a} label={T(a.label, OVERDUE, fmt.overdueTag(3, lang))} /></View>; } };
export const AllTones: S = { render: () => { const th = useTheme(); const lang = useLang(); return (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: th.t('space/gap-x/xs') }}>
    <Tag tone="critical" label={fmt.overdueTag(3, lang)} /><Tag label="Default" /><Tag tone="success" label="Success" /><Tag tone="warning" label="Warning" /><Tag tone="info" label="Info" />
  </View>); } };
