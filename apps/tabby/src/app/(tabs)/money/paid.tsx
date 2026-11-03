// Paid outcomes: on time (rest view 8), back on track (core view 5), one of two (rest view 1b). Next block hidden when no next.
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, fmt, ListGroup, ListRow, Screen, SectionHeader, Txt } from '@lab/app-kit';
import { useStore } from '../../../state';
import { useFlows } from '../../../ui/flows';
import { Hero } from '../../../ui/Hero';
import { dd, m } from '../../../ui/helpers';

export default function Paid() {
  const { s, lang, settings } = useStore();
  const { lastPaid: r, openPay } = useFlows();
  if (!r) return null;
  const done = () => router.dismissTo('/money');
  const wasLate = r.items.some((x) => fmt.diffDays(x.dueDate, settings.today) < 0);
  const oneOfTwo = r.kind === 'one' && r.stillOverdue.length > 0;
  const first = r.items[0];
  const hero = oneOfTwo
    ? <Hero icon="check" tone="success" title={s.paid.merchantPaid(first.merchant.name[lang])} body={s.paid.paidFor(m(r.amount, lang), first.number, first.of)} />
    : wasLate ? <Hero icon="check" tone="success" title={s.paid.backOnTrack} body={s.paid.paidShop(m(r.amount, lang))} />
    : <Hero icon="check" tone="success" title={s.paid.done} body={s.paid.paidOnTime(m(r.amount, lang))} />;
  const still = r.stillOverdue;
  const stillTotal = still.reduce((a, x) => a + x.amount, 0);
  return (
    <Screen safeTop footer={oneOfTwo ? (
      <View><Button label={s.money.payNow(m(stillTotal, lang))} onPress={() => openPay({ kind: still.length > 1 ? 'overdue' : 'one', items: still, source: 'paid_one_of_two' })} /><Button variant="link" full label={s.common.done} onPress={done} /></View>
    ) : <Button label={s.common.done} onPress={done} />}>
      {hero}
      {oneOfTwo ? (
        <View>
          <SectionHeader title={s.paid.stillOverdue} />
          <ListGroup>{still.map((x) => <ListRow key={x.instalmentId} title={x.merchant.name[lang]} subtitle={s.money.wasDue(dd(x.dueDate, lang))} subtitleColor="color/text/content/critical/default" value={m(x.amount, lang)} leading={{ kind: 'logo', text: x.merchant.logoText, color: x.merchant.logoColor }} />)}</ListGroup>
          <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: 8 }}>{s.paid.stillPaused}</Txt>
        </View>
      ) : (
        <>
          <View>
            <SectionHeader title={s.paid.paidToday} />
            <ListGroup>{r.items.map((x) => <ListRow key={x.instalmentId} title={x.merchant.name[lang]} subtitle={s.overdue.payment(x.number, x.of)} value={m(x.amount, lang)} chevron leading={{ kind: 'logo', text: x.merchant.logoText, color: x.merchant.logoColor }} onPress={() => router.push(`/money/purchase/${x.purchaseId}`)} />)}</ListGroup>
            {wasLate ? <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: 8 }}>{s.paid.simah}</Txt> : null}
          </View>
          {r.next ? (
            <View>
              <SectionHeader title={s.paid.nextPayment} />
              <ListGroup><ListRow title={dd(r.next.dueDate, lang)} subtitle={fmt.dueIn(r.next.dueDate, settings.today, lang)} value={m(r.next.amount, lang)} leading={{ kind: 'icon', icon: 'calendar' }} /></ListGroup>
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}
