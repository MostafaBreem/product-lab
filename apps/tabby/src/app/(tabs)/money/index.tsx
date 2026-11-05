// Money tab (build-spec-money.md): Due · Overdue · Caught up; loading skeleton, offline notice, load error, range switch.
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { analytics, Bar, BottomSheet, Button, Chip, fmt, Header, ListGroup, ListRow, Notice, PaymentCard, Screen, SectionHeader, SegmentedControl, Txt, useTheme } from '@lab/app-kit';
import { OverdueSteps } from '../../../ui/OverdueSteps';
import { useStore } from '../../../state';
import { useFlows } from '../../../ui/flows';
import { dd, m, who } from '../../../ui/helpers';
import type { Range } from '../../../domain/types';

export default function MoneyTab() {
  const st = useStore();
  const { s, lang, summary: x, settings } = st;
  const th = useTheme();
  const flows = useFlows();
  const today = settings.today;
  const stub = (from: string) => router.push({ pathname: '/money/stub', params: { from } });
  const [stepsOpen, setStepsOpen] = useState(false);

  useEffect(() => { if (x) analytics.track('money_tab_viewed', { cardState: x.card.state, range: st.range, fromCache: settings.net === 'offline' }); }, [x?.card.state, st.version]);

  const header = <Header title={s.money.title} onLongPressTitle={() => router.push('/debug')} trailing={<Chip label={s.money.earnCashback} icon="coins" onPress={() => stub('earn_cashback')} />} />;

  if (st.loading && !x) return <Screen bottomInset={0}>{header}<Skeleton /></Screen>;
  if (!x) {
    return (
      <Screen>
        {header}
        <Notice icon={st.summaryError === 'network' ? 'wifi-slash' : undefined} title={st.summaryError === 'network' ? s.common.offlineTitle : s.money.loadError} body={st.summaryError === 'network' ? s.common.offlineToast : s.common.somethingWrong}>
          <Button variant="link" label={s.common.tryAgain} onPress={() => st.refresh()} />
        </Notice>
      </Screen>
    );
  }
  const c = x.card;
  const offline = settings.net === 'offline';
  const card = c.state === 'overdue' ? (
    // Overdue = the approved Overdue-screen card on the tab (critic C1: red only on tag + due line; one place to pay).
    <PaymentCard state="overdue" tag={fmt.overdueTag(c.daysLate!, lang)} label={s.overdue.amountOverdue} amount={m(c.amount, lang)} dueLine={s.money.wasDue(dd(c.dueDate, lang))} dueCritical
      body={c.failedMethod ? s.overdue.failedCard(fmt.ltr(c.failedMethod.last4, lang)) : undefined}
      pay={{ label: s.money.payNow(m(c.amount, lang)), onPress: () => { analytics.track('pay_tapped', { source: 'money_card', cardState: 'overdue', amount: c.amount }); flows.openPay({ kind: 'overdue', items: c.items, source: 'money_card' }); } }}
      links={c.extendable ? [{ label: s.overdue.extendDue, helper: c.items.length > 1 ? s.overdue.extendHelper : s.overdue.extendHelperOne, onPress: () => flows.openExtend(c.items, 'money_card') }] : []} />
  ) : c.state === 'due' ? (
    <PaymentCard state="due" label={s.money.nextPayment} amount={m(c.amount, lang)} dueLine={fmt.dueLine(c.dueDate, today, lang)}
      pay={{ label: s.money.pay(m(c.amount, lang)), onPress: () => { analytics.track('pay_tapped', { source: 'money_card', cardState: 'due', amount: c.amount }); flows.openPay({ kind: 'onTime', items: c.items, source: 'money_card' }); } }}
      linksRow links={[{ label: s.money.payDifferent, onPress: () => { analytics.track('pay_different_amount_tapped', { cardState: c.state }); router.push('/money/make-payment'); } }, ...(c.extendable ? [{ label: s.money.extendPayment, onPress: () => flows.openExtend(c.items, 'money_card') }] : [])]}
      summary={[{ k: s.money.leftOnPlans, v: m(x.totalToPay, lang) }]} />
  ) : (
    <PaymentCard state="caughtUp" label={s.money.nextPayment} title={s.money.caughtUp} dueLine={s.money.onDate(m(c.amount, lang), dd(c.dueDate, lang))}
      links={[{ label: s.money.payEarly, onPress: () => stub('pay_early') }]} />
  );
  const empty = st.range === '7d' ? s.money.empty7 : st.range === '30d' ? s.money.empty30 : s.money.emptyAll;
  // Overdue: late items live in "In this payment"; Upcoming lists only what is not late yet.
  const rows = x.rows.filter((r) => fmt.diffDays(r.dueDate, today) >= 0);
  return (
    <Screen refreshControl={<RefreshControl refreshing={false} onRefresh={() => st.refresh()} />}>
      {header}
      {offline ? <Notice icon="wifi-slash" title={s.common.offlineTitle} body={s.common.offlineBody(fmt.lastUpdate(x.asOf.day, x.asOf.time, today, lang))} /> : null}
      {card}
      {c.state === 'overdue' ? (
        <>
          <ListGroup>
            <ListRow title={s.money.whatNext} subtitle={s.money.whatNextSub} leading={{ kind: 'icon', icon: 'info' }} chevron onPress={() => { analytics.track('what_happens_next_tapped', { daysLate: c.daysLate }); setStepsOpen(true); }} />
            <ListRow title={s.overdue.talkPayment} leading={{ kind: 'icon', icon: 'chat' }} chevron onPress={() => stub('help_overdue')} />
          </ListGroup>
          <View>
            <SectionHeader title={s.overdue.inThisPayment} />
            <ListGroup>
              {c.items.map((r) => (
                <ListRow key={r.instalmentId} title={r.merchant.name[lang]} subtitle={s.overdue.payment(r.number, r.of)} value={m(r.amount, lang)} chevron
                  leading={{ kind: 'logo', text: r.merchant.logoText, color: r.merchant.logoColor }} onPress={() => router.push(`/money/purchase/${r.purchaseId}`)} />
              ))}
            </ListGroup>
          </View>
          <BottomSheet closeLabel={s.common.close} backLabel={s.common.back} visible={stepsOpen} title={s.money.whatNext} onClose={() => setStepsOpen(false)}>
            <OverdueSteps s={s} card={false} />
          </BottomSheet>
        </>
      ) : null}
      <View>
        <SectionHeader title={s.money.upcoming} action={s.money.history} onAction={() => stub('history')} />
        <View style={{ gap: th.t('space/gap-y/sm') }}>
          <SegmentedControl<Range> value={st.range} onChange={(r) => st.setRange(r)} options={[{ value: '7d', label: s.money.r7 }, { value: '30d', label: s.money.r30 }, { value: 'all', label: s.money.rAll }]} />
          <ListGroup>
            {st.rowsLoading ? [0, 1].map((i) => <ListRow key={i} title=" " leading={{ kind: 'skeleton' }} />)
              : st.rowsError ? [<View key="e" style={{ padding: th.t('space/padding/md') }}><Txt role="body/md" color="color/text/content/secondary/default">{s.money.listError}</Txt><Button variant="link" label={s.common.tryAgain} onPress={() => st.setRange(st.range)} /></View>]
              : rows.length === 0 ? [<View key="e" style={{ padding: th.t('space/padding/md') }}><Txt role="body/md" color="color/text/content/secondary/default">{empty}</Txt></View>]
              : rows.map((r) => {
                const late = fmt.diffDays(r.dueDate, today) < 0;
                return (
                  <ListRow key={r.instalmentId} title={r.merchant.name[lang]} leading={{ kind: 'logo', text: r.merchant.logoText, color: r.merchant.logoColor }}
                    subtitle={late ? s.money.rowSubLate(dd(r.dueDate, lang)) : s.money.rowSub(dd(r.dueDate, lang), r.number, r.of)} subtitleColor={late ? 'color/text/content/critical/default' : undefined}
                    value={m(r.amount, lang)} chevron onPress={() => { analytics.track('due_row_tapped', { purchaseId: r.purchaseId }); router.push(`/money/purchase/${r.purchaseId}`); }} />
                );
              })}
          </ListGroup>
        </View>
      </View>
      <View>
        <SectionHeader title={s.money.yourProducts} />
        <ListGroup>
          <ListRow title={s.money.inStore} subtitle={s.money.inStoreSub} leading={{ kind: 'icon', icon: 'credit-card' }} chevron onPress={() => stub('in_store_card')} />
          <ListRow title={s.money.payLater} subtitle={s.money.openPlans(x.openPlans)} leading={{ kind: 'icon', icon: 'coins' }} chevron onPress={() => stub('pay_later_purchases')} />
          {c.state === 'overdue' ? null : <ListRow title={s.money.help} leading={{ kind: 'icon', icon: 'question' }} chevron onPress={() => stub('help')} />}
        </ListGroup>
      </View>
    </Screen>
  );
}

function Skeleton() {
  const th = useTheme();
  return (
    <>
      <View style={{ backgroundColor: th.t('payment-card/fill/default') as string, borderRadius: th.t('radius/xl'), padding: th.t('space/padding/lg'), gap: th.t('space/gap-y/sm') }}>
        <Bar w="30%" /><Bar w="55%" h={th.t('size/height/xs')} r={th.t('radius/sm')} /><Bar w="45%" /><Bar w="100%" h={th.t('size/height/md')} r={th.t('radius/md')} /><Bar w="40%" />
      </View>
      <ListGroup>{[0, 1].map((i) => <ListRow key={i} title=" " leading={{ kind: 'skeleton' }} />)}</ListGroup>
    </>
  );
}
