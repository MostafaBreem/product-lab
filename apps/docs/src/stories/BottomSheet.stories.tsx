import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { BottomSheet, Button, fmt, Txt } from '@lab/app-kit';
import { NOCTRL, pg, useL, useLang, useT } from '../ui/lang';

export default { title: 'Components/BottomSheet/Examples', component: BottomSheet, parameters: NOCTRL } satisfies Meta<typeof BottomSheet>;
export const Playground: StoryObj<typeof BottomSheet> = { ...pg({ title: 'Pay next payment', leading: 'close', dismissable: true }),
  argTypes: { leading: { control: 'inline-radio', options: ['close', 'back', 'none'] }, visible: { control: false } },
  render: function Render(a) { const T = useT(); const L = useL(); const lang = useLang(); const [o, setO] = useState(false); return (
  <View style={{ minHeight: 80 }}>
    <Button variant="link" label={L('Open the sheet', 'افتح الورقة')} onPress={() => setO(true)} />
    <BottomSheet {...a} visible={o} title={T(a.title, 'Pay next payment', 'ادفع الدفعة الجاية')} onClose={() => setO(false)} onLeading={() => setO(false)}>
      <View style={{ gap: 4 }}><Txt role="body/sm" color="color/text/content/secondary/default">{L('Amount', 'المبلغ')}</Txt><Txt role="display/lg" tabular>{fmt.money(31250, lang)}</Txt></View>
      <Button label={L(`Pay ${fmt.money(31250, 'en')}`, `ادفع ${fmt.money(31250, lang)}`)} onPress={() => setO(false)} />
    </BottomSheet>
  </View>); } };
export const PaySheet: StoryObj = { render: () => { const L = useL(); const lang = useLang(); const [o, setO] = useState(false); return (
  <View style={{ minHeight: 80 }}>
    <Button variant="link" label={L('Open the sheet', 'افتح الورقة')} onPress={() => setO(true)} />
    <BottomSheet visible={o} title={L('Pay next payment', 'ادفع الدفعة الجاية')} onClose={() => setO(false)}>
      <View style={{ gap: 4 }}><Txt role="body/sm" color="color/text/content/secondary/default">{L('Amount', 'المبلغ')}</Txt><Txt role="display/lg" tabular>{fmt.money(31250, lang)}</Txt></View>
      <Button label={L(`Pay ${fmt.money(31250, 'en')}`, `ادفع ${fmt.money(31250, lang)}`)} onPress={() => setO(false)} />
    </BottomSheet>
  </View>); } };
