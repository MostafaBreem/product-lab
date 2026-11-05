// Extended (core views 7, 8): both / one of two with still overdue + Pay.
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, KeyValue, ListGroup, ListRow, Screen, SectionHeader, Txt, useTheme } from '@lab/app-kit';
import { useStore } from '../../../state';
import { useFlows } from '../../../ui/flows';
import { Hero } from '../../../ui/Hero';
import { dd, m, methodLabel } from '../../../ui/helpers';

export default function Extended() {
  const st = useStore();
  const { s, lang } = st;
  const th = useTheme();
  const { lastExtended: r, openPay } = useFlows();
  if (!r || !r.extended.length) return null;
  const done = () => router.dismissTo('/money');
  const until = r.extended[0].until;
  const one = r.extended.length === 1 && r.stillOverdue.length > 0;
  const x0 = r.extended[0].item;
  const stillTotal = r.stillOverdue.reduce((a, x) => a + x.amount, 0);
  const movedTotal = r.extended.reduce((a, e) => a + e.item.amount, 0);
  const card = methodLabel(st.summary?.methods.find((x) => x.isDefault), s); // named, not "default payment method" (pending #6)
  return (
    <Screen footer={one ? <View><Button label={s.money.payNow(m(stillTotal, lang))} onPress={() => openPay({ kind: r.stillOverdue.length > 1 ? 'overdue' : 'one', items: r.stillOverdue, source: 'extended_one' })} /><Button variant="link" full align="center" label={s.common.done} onPress={done} /></View> : <Button label={s.common.done} onPress={done} />}>
      <Hero icon="calendar-check" tone="brand" title={s.extend.movedTo(dd(until, lang))} body={r.extended.length === 1 ? s.extend.movedBodyOne(x0.merchant.name[lang], x0.number, x0.of, m(x0.amount, lang), card, dd(until, lang)) : s.extend.movedBody(m(movedTotal, lang), card, dd(until, lang))} />
      {one ? (
        <>
          <Txt role="label/lg" align="center">{s.extend.extFee(m(r.totalFee, lang))}</Txt>
          <View>
            <SectionHeader title={s.paid.stillOverdue} />
            <ListGroup>{r.stillOverdue.map((x) => <ListRow key={x.instalmentId} title={x.merchant.name[lang]} subtitle={s.money.wasDue(dd(x.dueDate, lang))} subtitleColor="color/text/content/critical/default" value={m(x.amount, lang)} leading={{ kind: 'logo', text: x.merchant.logoText, color: x.merchant.logoColor }} />)}</ListGroup>
            <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: th.t('space/gap-y/xs') }}>{s.paid.stillPaused}</Txt>
          </View>
        </>
      ) : (
        <View>
          <SectionHeader title={s.extend.extended} />
          <ListGroup>{r.extended.map((e) => <ListRow key={e.instalmentId} title={e.item.merchant.name[lang]} subtitle={s.extend.fee(m(e.fee, lang))} value={m(e.item.amount, lang)} leading={{ kind: 'logo', text: e.item.merchant.logoText, color: e.item.merchant.logoColor }} />)}</ListGroup>
          <View style={{ marginTop: th.t('space/gap-y/sm'), backgroundColor: th.t('color/surface/default') as string, borderRadius: th.t('radius/xl'), padding: th.t('space/padding/md') }}>
            <KeyValue layout="row" strong k={s.extend.totalExtFee} v={m(r.totalFee, lang)} />
          </View>
        </View>
      )}
    </Screen>
  );
}
