// Make payment — pay a different amount (lab: cases/tabby/flows/make-payment.md, mock make-payment-en-v2.html, route code-first).
// Opens on 30 days, every upcoming purchase ticked. Overdue part: own group, no tick, always paid. Pay disabled when nothing to pay, loading, offline.
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { analytics, Button, fmt, ListGroup, ListRow, NavigationBar, Notice, Screen, SectionHeader, SegmentedControl, Txt, useTheme } from '@lab/app-kit';
import { useStore } from '../../../state';
import { useFlows } from '../../../ui/flows';
import { dd, m } from '../../../ui/helpers';
import { api } from '../../../domain/server';
import { pickItems, pickList, type PickRow } from '../../../domain/derive';
import type { Item, Range } from '../../../domain/types';

// Last good rows per window: offline shows them under the offline Notice (same rule as the Money tab cache).
const cache = new Map<Range, Item[]>();

export default function MakePayment() {
  const st = useStore();
  const { s, lang, settings } = st;
  const th = useTheme();
  const flows = useFlows();
  const today = settings.today;
  const offline = settings.net === 'offline';
  const [range, setRange] = useState<Range>('30d');
  const [rows, setRows] = useState<Item[]>();
  const [error, setError] = useState(false);
  const [ticked, setTicked] = useState<string[]>([]);

  const load = async (r: Range) => {
    const show = (xs: Item[]) => { setRows(xs); setTicked([...new Set(xs.map((x) => x.purchaseId))]); };
    setRows(undefined); setError(false);
    try { const xs = await api.rows(r); cache.set(r, xs); show(xs); }
    catch { const c = cache.get(r); if (c) show(c); else setError(true); }
  };
  useEffect(() => { load(range); analytics.track('make_payment_viewed', { range }); }, [st.version]);

  const list = useMemo(() => (rows ? pickList(rows, today) : { overdue: [], upcoming: [] }), [rows, today]);
  const items = pickItems(list, ticked);
  const total = items.reduce((a, x) => a + x.amount, 0);
  const canPay = !!rows && !offline && total > 0;

  const switchRange = (r: Range) => { setRange(r); analytics.track('make_payment_range_changed', { range: r }); load(r); };
  const toggle = (id: string) => setTicked((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const pay = () => {
    analytics.track('pay_tapped', { source: 'make_payment', range, amount: total, purchases: new Set(items.map((x) => x.purchaseId)).size, overdue: list.overdue.length > 0 });
    flows.openPay({ kind: 'pick', items, source: 'make_payment' });
  };

  const sub = (r: PickRow, late: boolean) => {
    const first = r.items[0];
    if (late) return r.items.length === 1 ? s.money.mpLateRow(dd(first.dueDate, lang), first.number, first.of) : s.money.mpOverdueMany(r.items.length, dd(first.dueDate, lang));
    if (range === 'all') return s.money.mpLeft(r.items.length);
    return r.items.length === 1 ? s.money.rowSub(dd(first.dueDate, lang), first.number, first.of) : s.money.mpMany(r.items.length, dd(first.dueDate, lang));
  };
  const logo = (r: PickRow) => ({ kind: 'logo' as const, text: r.merchant.logoText, color: r.merchant.logoColor });
  const emptyLine = range === '7d' ? s.money.mpEmpty7 : range === '30d' ? s.money.mpEmpty30 : s.money.mpEmptyAll;
  const upcomingRows = list.upcoming.map((r, i) => (
    <ListRow key={r.purchaseId} title={r.merchant.name[lang]} subtitle={sub(r, false)} value={m(r.amount, lang)} leading={logo(r)} divider={i < list.upcoming.length - 1}
      selection={{ kind: 'check', selected: ticked.includes(r.purchaseId) }} onPress={() => toggle(r.purchaseId)} testID={`mp-row-${r.purchaseId}`} />
  ));

  return (
    <Screen top={<NavigationBar title={s.money.mpTitle} leading="back" onLeading={() => router.back()} />}
      footer={<Button label={total > 0 ? s.money.pay(m(total, lang)) : s.money.mpPay} disabled={!canPay} onPress={pay} testID="mp-pay" />}>
      {offline && st.summary && rows ? <Notice icon="wifi-slash" title={s.common.offlineTitle} body={s.common.offlineBodyPay(fmt.lastUpdate(st.summary.asOf.day, st.summary.asOf.time, today, lang))} /> : null}
      <SegmentedControl<Range> value={range} onChange={switchRange} options={[{ value: '7d', label: s.money.r7 }, { value: '30d', label: s.money.r30 }, { value: 'all', label: s.money.rAll }]} />
      {!rows && !error ? (
        <ListGroup>{[0, 1].map((i) => <ListRow key={i} title=" " leading={{ kind: 'skeleton' }} divider={i === 0} />)}</ListGroup>
      ) : error && offline ? (
        <Notice icon="wifi-slash" title={s.common.offlineTitle} />
      ) : error ? (
        <Notice title={s.money.listError}><Button variant="link" label={s.common.tryAgain} onPress={() => load(range)} /></Notice>
      ) : list.overdue.length === 0 && list.upcoming.length === 0 ? (
        <ListGroup>
          <View style={{ paddingVertical: th.t('space/padding-y/lg'), paddingHorizontal: th.t('space/padding-x/md') }}>
            <Txt role="body/sm" color="color/text/content/secondary/default" align="center">{emptyLine}</Txt>
          </View>
        </ListGroup>
      ) : list.overdue.length ? (
        <>
          <View>
            <SectionHeader title={s.money.mpOverdue} />
            <ListGroup>
              {list.overdue.map((r, i) => (
                <View key={r.purchaseId} accessible accessibilityLabel={`${s.money.mpOverdueA11y(r.merchant.name[lang])} ${m(r.amount, lang)}`}>
                  <ListRow title={r.merchant.name[lang]} subtitle={sub(r, true)} subtitleColor="color/text/content/critical/default" value={m(r.amount, lang)} leading={logo(r)} divider={i < list.overdue.length - 1} />
                </View>
              ))}
            </ListGroup>
            <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: th.t('space/gap-y/xs') }}>{s.money.mpOverdueHelp}</Txt>
          </View>
          {list.upcoming.length ? (
            <View>
              <SectionHeader title={s.money.upcoming} />
              <ListGroup>{upcomingRows}</ListGroup>
            </View>
          ) : null}
        </>
      ) : (
        <ListGroup>{upcomingRows}</ListGroup>
      )}
    </Screen>
  );
}
