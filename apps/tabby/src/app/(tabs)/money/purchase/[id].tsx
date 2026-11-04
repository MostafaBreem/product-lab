// Purchase detail (pay-flow-rest-map-v5 view 1; PD edge 1c offline, 1d loading; load error / notFound = copy g17, g17b).
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { analytics, Bar, Button, fmt, KeyValue, ListGroup, ListRow, MockError, NavigationBar, Notice, PaymentCard, Screen, SectionHeader, useTheme, useToast } from '@lab/app-kit';
import { api } from '../../../../domain/server';
import { effectiveDue, toItem } from '../../../../domain/derive';
import type { Purchase } from '../../../../domain/types';
import { useStore } from '../../../../state';
import { useFlows } from '../../../../ui/flows';
import { dd, m } from '../../../../ui/helpers';

export default function PurchaseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const st = useStore();
  const { s, lang, settings } = st;
  const th = useTheme();
  const toast = useToast();
  const flows = useFlows();
  const [p, setP] = useState<Purchase>();
  const [err, setErr] = useState<string>();
  const load = useCallback(async () => {
    setErr(undefined);
    try { const r = await api.purchase(id); setP(r); analytics.track('purchase_detail_viewed', { purchaseId: id }); }
    catch (e) { setErr((e as MockError).code); }
  }, [id]);
  useEffect(() => { load(); }, [load, st.version]);
  const today = settings.today;
  const nav = <NavigationBar title={p?.merchant.name[lang] ?? ''} leading="back" onLeading={() => router.back()} />;
  const card = { backgroundColor: th.t('color/surface/default') as string, borderRadius: th.t('radius/xl'), padding: th.t('space/padding/md'), gap: th.t('space/gap-y/sm') };

  if (err && !p) {
    return (
      <Screen top={nav}>
        {err === 'notFound' ? <Notice title={s.pd.notFound} body={s.pd.notFoundBody} />
          : err === 'network' ? <Notice icon="wifi-slash" title={s.common.offlineTitle} body={s.common.offlineToast}><Button variant="link" label={s.common.tryAgain} onPress={load} /></Notice>
          : <Notice title={s.pd.loadError} body={s.common.somethingWrong}><Button variant="link" label={s.common.tryAgain} onPress={load} /></Notice>}
      </Screen>
    );
  }
  if (!p) {
    return (
      <Screen top={nav}>
        <View style={[card, { padding: th.t('space/padding/lg') }]}><Bar w="30%" /><Bar w="55%" h={th.t('size/height/xs')} r={th.t('radius/sm')} /><Bar w="45%" /><Bar w="100%" h={th.t('size/height/md')} r={th.t('radius/md')} /></View>
        <View><SectionHeader title={s.pd.payments} /><ListGroup>{[0, 1, 2, 3].map((i) => <ListRow key={i} title=" " leading={{ kind: 'skeleton' }} />)}</ListGroup></View>
        <View><SectionHeader title={s.pd.details} /><View style={card}>{['45%', '72%', '72%', '88%', '96%'].map((w, i) => <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Bar w="30%" /><Bar w={w === '45%' ? '45%' : 72} /></View>)}</View></View>
        <ListGroup><ListRow title={s.pd.talk} leading={{ kind: 'icon', icon: 'chat' }} chevron /></ListGroup>
      </Screen>
    );
  }
  const unpaidI = p.instalments.filter((i) => !i.paidAt);
  const lateI = unpaidI.filter((i) => fmt.diffDays(effectiveDue(i), today) < 0);
  const next = lateI[0] ?? unpaidI[0];
  const paidSoFar = p.instalments.filter((i) => i.paidAt).reduce((a, i) => a + i.amount, 0);
  const late = !!lateI.length;
  return (
    <Screen top={nav}>
      {settings.net === 'offline' && st.summary ? <Notice icon="wifi-slash" title={s.common.offlineTitle} body={s.common.offlineBody(fmt.lastUpdate(st.summary.asOf.day, st.summary.asOf.time, today, lang))} /> : null}
      {next ? (
        <PaymentCard state={late ? 'overdue' : 'due'} tag={late ? fmt.overdueTag(fmt.diffDays(today, effectiveDue(next)), lang) : undefined} label={s.overdue.payment(next.number, next.of)} amount={m(next.amount, lang)}
          dueLine={late ? s.money.wasDue(dd(effectiveDue(next), lang)) : fmt.dueLine(effectiveDue(next), today, lang)} dueCritical={late}
          pay={{ label: late ? s.money.payNow(m(next.amount, lang)) : s.money.pay(m(next.amount, lang)), onPress: () => flows.openPay({ kind: 'one', items: [toItem(p, next)], source: 'purchase_detail' }) }}
          links={next.extendable && !next.extendedAt ? [{ label: s.overdue.extendDue, helper: s.overdue.extendHelperOne, onPress: () => flows.openExtend([toItem(p, next)], 'purchase_detail') }] : []} />
      ) : null}
      <View>
        <SectionHeader title={s.pd.payments} />
        <ListGroup>
          {p.instalments.map((i) => {
            const d = effectiveDue(i);
            const isLate = !i.paidAt && fmt.diffDays(d, today) < 0;
            return (
              <ListRow key={i.id} title={s.pd.paymentN(i.number)} value={m(i.amount, lang)}
                leading={i.paidAt ? { kind: 'icon', icon: 'check', tile: 'color/surface/success/default', color: 'color/icon/content/success/default' } : isLate ? { kind: 'icon', icon: 'alert', tile: 'color/surface/critical/default', color: 'color/icon/content/critical/default' } : { kind: 'icon', icon: 'calendar' }}
                subtitle={i.paidAt ? s.pd.paidOn(dd(i.paidAt, lang)) : isLate ? s.money.wasDue(dd(d, lang)) : i.extendedAt ? s.pd.extendedDue(dd(d, lang)) : s.pd.dueOn(dd(d, lang))}
                subtitleColor={isLate ? 'color/text/content/critical/default' : undefined} />
            );
          })}
        </ListGroup>
      </View>
      <View>
        <SectionHeader title={s.pd.details} />
        <View style={card}>
          <KeyValue layout="row" k={s.pd.bought} v={s.pd.boughtVal(dd(p.boughtAt, lang), p.instalments.length)} />
          <KeyValue layout="row" k={s.pd.orderTotal} v={m(p.total, lang)} />
          <KeyValue layout="row" k={s.pd.paidSoFar} v={m(paidSoFar, lang)} />
          <KeyValue layout="row" strong k={s.pd.leftToPay} v={m(p.total - paidSoFar, lang)} />
          <Pressable accessibilityRole="button" onPress={async () => { await Clipboard.setStringAsync(p.orderNumber).catch(() => {}); toast({ tone: 'success', text: s.common.copied }); }}>
            <KeyValue layout="row" k={s.pd.orderNumber} v={fmt.ltr(p.orderNumber, lang)} />
          </Pressable>
        </View>
      </View>
      <ListGroup>
        <ListRow title={s.pd.talk} leading={{ kind: 'icon', icon: 'chat' }} chevron onPress={() => router.push({ pathname: '/money/stub', params: { from: 'help_purchase' } })} />
      </ListGroup>
    </Screen>
  );
}
