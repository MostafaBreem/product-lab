import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { BottomSheet, Button, fmt, Txt } from '@lab/app-kit';
import { useL, useLang } from '../ui/lang';

export default { title: 'Components/BottomSheet/Examples' } satisfies Meta;
export const PaySheet: StoryObj = { render: () => { const L = useL(); const lang = useLang(); const [o, setO] = useState(false); return (
  <View style={{ minHeight: 80 }}>
    <Button variant="link" label={L('Open the sheet', 'افتح الورقة')} onPress={() => setO(true)} />
    <BottomSheet visible={o} title={L('Pay next payment', 'ادفع الدفعة الجاية')} onClose={() => setO(false)}>
      <View style={{ gap: 4 }}><Txt role="body/sm" color="color/text/content/secondary/default">{L('Amount', 'المبلغ')}</Txt><Txt role="display/lg" tabular>{fmt.money(31250, lang)}</Txt></View>
      <Button label={L(`Pay ${fmt.money(31250, 'en')}`, `ادفع ${fmt.money(31250, lang)}`)} onPress={() => setO(false)} />
    </BottomSheet>
  </View>); } };
