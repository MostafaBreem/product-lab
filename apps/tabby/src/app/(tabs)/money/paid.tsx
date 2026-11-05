// Paid outcomes: on time (rest view 8), back on track (core view 5), one of two (rest view 1b). Next block hidden when no next.
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, fmt, ListGroup, ListRow, Screen, SectionHeader, Txt, useTheme } from '@lab/app-kit';
import { useStore } from '../../../state';
import { useFlows } from '../../../ui/flows';
import { Hero } from '../../../ui/Hero';
import { dd, m, who } from '../../../ui/helpers';
import { paidOff, pickList } from '../../../domain/derive';

export default function Paid() {
  const th = useTheme();
  const { s, lang, settings } = useStore();
  const { lastPaid: r, openPay } = useFlows();
  if (!r) return null;
  const done = () => router.dismissTo('/money');
  const wasLate = r.items.some((x) => fmt.diffDays(x.dueDate, settings.today) < 0);
  const oneOfTwo = r.kind === 'one' && r.stillOverdue.length > 0;
  const first = r.items[0];
  function offBody() {
    const off = paidOff(r!.items);
    const offItems = r!.items.filter((x) => off.includes(x.purchaseId));
    return off.length ? s.paid.paidOff(m(r!.amount, lang), who(offItems, lang, s), off.length > 1) : s.paid.paidAmount(m(r!.amount, lang));
  }
  // Make payment pays several payments per purchase: one Paid today row per purchase.
  const groups = r.kind === 'pick' ? pickList(r.items, '0000-00-00').upcoming : null;
  const hero = oneOfTwo
    ? <Hero icon="check" tone="success" title={s.paid.merchantPaid(first.merchant.name[lang])} body={s.paid.paidFor(m(r.amount, lang), first.number, first.of)} />
    : wasLate ? <Hero icon="check" tone="success" title={s.paid.backOnTrack} body={s.paid.paidShop(m(r.amount, lang))} />
    : r.kind === 'pick' ? <Hero icon="check" tone="success" title={s.paid.done} body={offBody()} />
    : <Hero icon="check" tone="success" title={s.paid.done} body={s.paid.paidOnTime(m(r.amount, lang))} />;
  const still = r.stillOverdue;
  const stillTotal = still.reduce((a, x) => a + x.amount, 0);
  return (
    <Screen safeTop footer={oneOfTwo ? (
      <View><Button label={s.money.payNow(m(stillTotal, lang))} onPress={() => openPay({ kind: still.length > 1 ? 'overdue' : 'one', items: still, source: 'paid_one_of_two' })} /><Button variant="link" full label={s.common.done} onPress={done} /></View>
    ) : <Button label={s.common.done} onPress={done} />}>
      {hero}
      {r.methodLabel ? (
        // Card + reference after paying (pending #6): Apple Pay reports the card after payment (S28).
        <View style={{ gap: th.t('space/gap-y/3xs') }}>
          <Txt role="body/sm" color="color/text/content/secondary/default" align="center">{s.paid.paidWith(r.methodLabel)}</Txt>
          {r.reference ? <Txt role="body/sm" color="color/text/content/secondary/default" align="center">{s.paid.reference(r.reference)}</Txt> : null}
        </View>
      ) : null}
      {oneOfTwo ? (
        <View>
          <SectionHeader title={s.paid.stillOverdue} />
          <ListGroup>{still.map((x) => <ListRow key={x.instalmentId} title={x.merchant.name[lang]} subtitle={s.money.wasDue(dd(x.dueDate, lang))} subtitleColor="color/text/content/critical/default" value={m(x.amount, lang)} leading={{ kind: 'logo', text: x.merchant.logoText, color: x.merchant.logoColor }} />)}</ListGroup>
          <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: th.t('space/gap-y/xs') }}>{s.paid.stillPaused}</Txt>
        </View>
      ) : (
        <>
          <View>
            <SectionHeader title={s.paid.paidToday} />
            <ListGroup>{groups ? groups.map((g, i) => {
              const a = g.items[0].number; const b = g.items[g.items.length - 1].number;
              return <ListRow key={g.purchaseId} title={g.merchant.name[lang]} subtitle={g.items.length === 1 ? s.overdue.payment(a, g.items[0].of) : s.paid.payments(a, b)} value={m(g.amount, lang)} chevron divider={i < groups.length - 1} leading={{ kind: 'logo', text: g.merchant.logoText, color: g.merchant.logoColor }} onPress={() => router.push(`/money/purchase/${g.purchaseId}`)} />;
            }) : r.items.map((x) => <ListRow key={x.instalmentId} title={x.merchant.name[lang]} subtitle={s.overdue.payment(x.number, x.of)} value={m(x.amount, lang)} chevron leading={{ kind: 'logo', text: x.merchant.logoText, color: x.merchant.logoColor }} onPress={() => router.push(`/money/purchase/${x.purchaseId}`)} />)}</ListGroup>
            {wasLate ? <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: th.t('space/gap-y/xs') }}>{s.paid.simah}</Txt> : null}
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
