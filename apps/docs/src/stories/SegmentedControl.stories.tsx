import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SegmentedControl } from '@lab/app-kit';
import { useArgs } from 'storybook/preview-api';
import { NOCTRL, pg, useL } from '../ui/lang';

const meta: Meta<typeof SegmentedControl> = { title: 'Components/SegmentedControl/Examples', component: SegmentedControl, parameters: NOCTRL };
export default meta;
const OPTS: [string, string, string][] = [['7d', '7 days', '7 أيام'], ['30d', '30 days', '30 يوم'], ['90d', '90 days', '90 يوم'], ['all', 'All', 'الكل']];
export const Playground: StoryObj<{ options: number; value: string }> = { ...pg({ options: 3, value: '7d' }),
  argTypes: { options: { control: { type: 'range', min: 2, max: 4, step: 1 } }, value: { control: 'inline-radio', options: OPTS.map((o) => o[0]) } },
  render: function Render(a) { const L = useL(); const [, update] = useArgs(); const opts = OPTS.slice(0, a.options); const val = opts.some((o) => o[0] === a.value) ? a.value : opts[0][0];
    return <SegmentedControl value={val} onChange={(v) => update({ value: v })} options={opts.map(([value, en, ar]) => ({ value, label: L(en, ar) }))} />; } };
export const ThreeOptions: StoryObj = { render: () => { const L = useL(); const [v, setV] = useState('7d'); return (
  <SegmentedControl value={v} onChange={setV} options={[{ value: '7d', label: L('7 days', '7 أيام') }, { value: '30d', label: L('30 days', '30 يوم') }, { value: 'all', label: L('All', 'الكل') }]} />); } };
