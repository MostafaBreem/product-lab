import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SegmentedControl } from '@lab/app-kit';
import { useL } from '../ui/lang';

const meta: Meta = { title: 'Components/SegmentedControl/Examples' };
export default meta;
export const ThreeOptions: StoryObj = { render: () => { const L = useL(); const [v, setV] = useState('7d'); return (
  <SegmentedControl value={v} onChange={setV} options={[{ value: '7d', label: L('7 days', '7 أيام') }, { value: '30d', label: L('30 days', '30 يوم') }, { value: 'all', label: L('All', 'الكل') }]} />); } };
