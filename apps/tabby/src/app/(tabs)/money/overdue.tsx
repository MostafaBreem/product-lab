// Overdue payment (overdue-map-v5 view 1; offline / loading = pay-flow-rest-map-v5 views 5, 6).
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { analytics, Bar, fmt, Icon, ListGroup, ListRow, NavigationBar, Notice, PaymentCard, Screen, SectionHeader, Txt, useTheme, type IconName } from '@lab/app-kit';
import { useStore } from '../../../state';
import { useFlows } from '../../../ui/flows';
import { dd, m } from '../../../ui/helpers';

export default function Overdue() {
  const st = useStore();
  const { s, lang, summary: x, settings } = st;
  const th = useTheme();
  const flows = useFlows();
  const nav = <NavigationBar title={s.overdue.title} leading="back" onLeading={() => router.back()} />;
  useEffect(() => { if (x?.card.state === 'overdue') analytics.track('overdue_viewed', { daysLate: x.card.daysLate, amount: x.card.amount, count: x.card.items.length }); }, []);
  if (!x) return <Screen top={nav}><View style={{ backgroundColor: th.t('payment-card/fill/default') as string, borderRadius: 20, padding: 20, gap: 12 }}><Bar w={90} h={24} /><Bar w="30%" /><Bar w="55%" h={36} r={8} /><Bar w="45%" /><Bar w="80%" /><Bar w="100%" h={48} r={12} /><Bar w="50%" /></View></Screen>;
  const c = x.card;
  if (c.state !== 'overdue') return <Gone />;
  return (
    <Screen top={nav}>
      {settings.net === 'offline' ? <Notice icon="wifi-slash" title={s.common.offlineTitle} body={s.common.offlineBody(fmt.lastUpdate(x.asOf.day, x.asOf.time, settings.today, lang))} /> : null}
      <PaymentCard state="overdue" tag={fmt.overdueTag(c.daysLate!, lang)} label={s.overdue.amountOverdue} amount={m(c.amount, lang)} dueLine={s.money.wasDue(dd(c.dueDate, lang))} dueCritical
        body={c.failedMethod ? s.overdue.failedCard(fmt.ltr(c.failedMethod.last4, lang)) : undefined}
        pay={{ label: s.money.payNow(m(c.amount, lang)), onPress: () => flows.openPay({ kind: 'overdue', items: c.items, source: 'overdue' }) }}
        links={c.extendable ? [{ label: s.overdue.extendDue, helper: c.items.length > 1 ? s.overdue.extendHelper : s.overdue.extendHelperOne, onPress: () => flows.openExtend(c.items, 'overdue') }] : []} />
      <View>
        <SectionHeader title={s.overdue.inThisPayment} />
        <ListGroup>
          {c.items.map((r) => (
            <ListRow key={r.instalmentId} title={r.merchant.name[lang]} subtitle={s.overdue.payment(r.number, r.of)} value={m(r.amount, lang)} chevron
              leading={{ kind: 'logo', text: r.merchant.logoText, color: r.merchant.logoColor }} onPress={() => router.push(`/money/purchase/${r.purchaseId}`)} />
          ))}
        </ListGroup>
      </View>
      <View>
        <SectionHeader title={s.money.whatNext} />
        <View style={{ backgroundColor: th.t('color/surface/default') as string, borderRadius: 20, padding: 16, gap: 16 }}>
          {s.overdue.steps.map((step) => (
            <View key={step.title} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: th.t('color/surface/secondary/default') as string, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={step.icon as IconName} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt role="label/lg">{step.title}</Txt>
                <Txt role="body/sm" color="color/text/content/secondary/default" wrap>{step.body}</Txt>
              </View>
            </View>
          ))}
        </View>
      </View>
      <ListGroup>
        <ListRow title={s.overdue.talkPayment} leading={{ kind: 'icon', icon: 'chat' }} chevron onPress={() => router.push({ pathname: '/money/stub', params: { from: 'help_overdue' } })} />
      </ListGroup>
    </Screen>
  );
}

/** Overdue cleared (paid or extended) while this screen was open: go back to Money. */
function Gone() {
  useEffect(() => { router.back(); }, []);
  return null;
}
