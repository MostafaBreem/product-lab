// Overdue payment (overdue-map-v5 view 1; offline / loading = pay-flow-rest-map-v5 views 5, 6).
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { analytics, Bar, fmt, Icon, ListGroup, ListRow, NavigationBar, Notice, PaymentCard, Screen, SectionHeader, Txt, useTheme, type IconName } from '@lab/app-kit';
import { useStore } from '../../../state';
import { useFlows } from '../../../ui/flows';
import { dd, m } from '../../../ui/helpers';

// raw-ok: skeleton width of the overdue tag (90); widths have no token.
const TAG_W = 90;

export default function Overdue() {
  const st = useStore();
  const { s, lang, summary: x, settings } = st;
  const th = useTheme();
  const flows = useFlows();
  const nav = <NavigationBar title={s.overdue.title} leading="back" onLeading={() => router.back()} />;
  useEffect(() => { if (x?.card.state === 'overdue') analytics.track('overdue_viewed', { daysLate: x.card.daysLate, amount: x.card.amount, count: x.card.items.length }); }, []);
  if (!x) return <Screen top={nav}><View style={{ backgroundColor: th.t('payment-card/fill/default') as string, borderRadius: th.t('radius/xl'), padding: th.t('space/padding/lg'), gap: th.t('space/gap-y/sm') }}><Bar w={TAG_W} h={th.t('size/height/3xs')} /><Bar w="30%" /><Bar w="55%" h={th.t('size/height/xs')} r={th.t('radius/sm')} /><Bar w="45%" /><Bar w="80%" /><Bar w="100%" h={th.t('size/height/md')} r={th.t('radius/md')} /><Bar w="50%" /></View></Screen>;
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
        <View style={{ backgroundColor: th.t('color/surface/default') as string, borderRadius: th.t('radius/xl'), padding: th.t('space/padding/md'), gap: th.t('space/gap-y/md') }}>
          {s.overdue.steps.map((step) => (
            <View key={step.title} style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm') }}>
              <View style={{ width: th.t('size/height/sm'), height: th.t('size/height/sm'), borderRadius: th.t('radius/md'), backgroundColor: th.t('color/surface/secondary/default') as string, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={step.icon as IconName} />
              </View>
              <View style={{ flex: 1, gap: th.t('space/gap-y/4xs') }}>
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
