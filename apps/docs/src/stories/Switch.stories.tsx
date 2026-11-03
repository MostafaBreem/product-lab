import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { ListGroup, ListRow, Switch } from '@lab/app-kit';
import { useL } from '../ui/lang';

const meta: Meta<typeof Switch> = { title: 'Components/Switch/Examples', component: Switch, args: { value: true } };
export default meta;
type S = StoryObj<typeof Switch>;
export const Playground: S = { render: (a) => { const [v, setV] = useState(a.value); return <View style={{ flexDirection: 'row' }}><Switch value={v} onValueChange={setV} /></View>; } };
export const InSettingsRows: S = { render: () => { const L = useL(); const [a, setA] = useState(true); const [b, setB] = useState(false); return (
  <ListGroup>
    <ListRow title={L('Salary day reminder', 'تذكير يوم الراتب')} subtitle={L('One extra reminder each month', 'تذكير إضافي واحد كل شهر')} selection={{ kind: 'switch', value: a, onChange: setA }} />
    <ListRow title={L('SMS', 'رسائل نصية')} selection={{ kind: 'switch', value: b, onChange: setB }} />
  </ListGroup>); } };
