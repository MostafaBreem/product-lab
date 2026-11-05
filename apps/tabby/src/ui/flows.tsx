// Sheets (Pay, Change method, processing, failed, unknown, Extend, Reminder ask, Salary picker) and their outcomes.
// build-spec-pay.md > States + behaviour; build-spec-reminders.md.
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { analytics, BottomSheet, Button, ListGroup, ListRow, MockError, Notice, SectionHeader, Txt, useTheme, useToast, fmt } from '@lab/app-kit';
import { api } from '../domain/server';
import type { Item, PaymentMethod } from '../domain/types';
import { useStore } from '../state';
import { dd, m, methodLabel, newKey, who } from './helpers';

export type PayKind = 'onTime' | 'overdue' | 'one' | 'pick';
export type PayReq = { kind: PayKind; items: Item[]; source: string };
export type PayOutcome = { kind: PayKind; items: Item[]; amount: number; next?: { amount: number; dueDate: string; items: Item[] }; stillOverdue: Item[]; methodLabel?: string; reference?: string };
export type ExtendOutcome = { extended: { instalmentId: string; until: string; fee: number; item: Item }[]; totalFee: number; stillOverdue: Item[] };

type Ctx = { openPay: (r: PayReq) => void; openExtend: (items: Item[], source: string) => void; lastPaid?: PayOutcome; lastExtended?: ExtendOutcome; offline: () => boolean; closeAll: () => void };
const FlowCtx = createContext<Ctx | null>(null);
export const useFlows = () => { const v = useContext(FlowCtx); if (!v) throw new Error('no flows'); return v; };

type PayState = 'sheet' | 'methods' | 'processing' | 'failed' | 'unknown';

export function FlowsProvider({ children }: { children: React.ReactNode }) {
  const th = useTheme();
  const st = useStore();
  const { s, lang, settings } = st;
  const toast = useToast();
  const [pay, setPay] = useState<PayReq | null>(null);
  const [payState, setPayState] = useState<PayState>('sheet');
  const [methodId, setMethodId] = useState<string>('applepay');
  const [lastPaid, setLastPaid] = useState<PayOutcome>();
  const [lastExtended, setLastExtended] = useState<ExtendOutcome>();
  const [ext, setExt] = useState<{ items: Item[]; source: string } | null>(null);
  const [ask, setAsk] = useState(false);
  const key = useRef(newKey());
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const methods: PaymentMethod[] = st.summary?.methods ?? [];
  const method = methods.find((x) => x.id === methodId) ?? methods[0];
  const offline = () => settings.net === 'offline';

  const openPay = (r: PayReq) => {
    if (offline()) { toast({ tone: 'neutral', text: s.common.offlineToast }); return; }
    key.current = newKey(); setMethodId(methods.find((x) => x.isDefault)?.id ?? 'applepay'); setPayState('sheet'); setPay(r);
    analytics.track('pay_sheet_opened', { source: r.source, kind: r.kind, amount: r.items.reduce((a, x) => a + x.amount, 0) });
  };
  const openExtend = (items: Item[], source: string) => {
    if (offline()) { toast({ tone: 'neutral', text: s.common.offlineToast }); return; }
    setExt({ items, source });
    analytics.track('extend_sheet_opened', { source, kind: items.length > 1 ? 'all' : 'one', count: items.length });
  };

  const stopPoll = () => { if (pollTimer.current) clearInterval(pollTimer.current); pollTimer.current = null; };
  useEffect(() => stopPoll, []);

  const finishPaid = (r: { payment: { id: string; items: Item[]; amount: number }; next?: PayOutcome['next']; stillOverdue: Item[] }, req: PayReq) => {
    stopPoll();
    const onTime = r.payment.items.every((x) => fmt.diffDays(x.dueDate, settings.today) >= 0);
    const daysLate = Math.max(0, ...r.payment.items.map((x) => fmt.diffDays(settings.today, x.dueDate)));
    analytics.track('payment_result', { paymentId: r.payment.id, final: true, status: 'succeeded', onTime, daysLate, items: r.payment.items.map((x) => x.instalmentId) });
    setLastPaid({ kind: req.kind, items: r.payment.items, amount: r.payment.amount, next: r.next, stillOverdue: r.stillOverdue, methodLabel: methodLabel(method, s), reference: `TB-${r.payment.id.replace(/\D/g, '').padStart(4, '0')}` });
    const first = !st.flags.firstPaymentDone;
    st.setFlags({ firstPaymentDone: true });
    router.push('/money/paid');
    // Sheet ("Paying…") stays up until the Paid screen has drawn, then fades: no blank frame between (tester run 2026-11-05 F1, pending #3).
    setTimeout(() => setPay(null), 450);
    st.refresh();
    if (first && st.flags.osPermission === 'notDetermined' && !st.flags.reminderAskShown) setTimeout(() => { setAsk(true); st.setFlags({ reminderAskShown: true }); analytics.track('reminder_ask_shown', { paidKind: onTime ? 'onTime' : 'late' }); }, 600);
  };

  const submit = async () => {
    if (!pay || !method) return;
    if (offline()) { toast({ tone: 'neutral', text: s.common.offlineToast }); return; } // sendFailed: nothing sent, same key kept
    const req = pay;
    analytics.track('payment_submitted', { methodType: method.type, amount: req.items.reduce((a, x) => a + x.amount, 0), retry: payState === 'failed' });
    setPayState('processing');
    try {
      const r = await api.pay(req.items.map((x) => x.instalmentId), method.id, key.current);
      if (r.payment.status === 'succeeded') return finishPaid(r, req);
      if (r.payment.status === 'declined') {
        analytics.track('payment_result', { paymentId: r.payment.id, final: true, status: 'declined' });
        analytics.track('pay_failed_shown', { methodType: method.type, amount: r.payment.amount });
        key.current = newKey(); setPayState('failed'); st.refresh(); return;
      }
      toUnknown(r.payment.id, req);
    } catch (e) {
      const err = e as MockError;
      if (err.code === 'network' && !err.sent) { setPayState('sheet'); toast({ tone: 'neutral', text: s.common.offlineToast }); return; }
      toUnknown(undefined, req);
    }
  };
  const toUnknown = (paymentId: string | undefined, req: PayReq) => {
    analytics.track('payment_result', { paymentId, final: false, status: 'unknown' });
    analytics.track('pay_unknown_shown', { amount: req.items.reduce((a, x) => a + x.amount, 0) });
    setPayState('unknown');
    let n = 0;
    const k = key.current;
    stopPoll();
    pollTimer.current = setInterval(async () => {
      n++;
      try {
        const r = await api.paymentStatus(k);
        if (r.payment.status === 'succeeded') return finishPaid(r, req);
        if (r.payment.status === 'declined') { stopPoll(); key.current = newKey(); setPayState('failed'); }
      } catch { /* keep polling */ }
      if (n >= 6) stopPoll();
    }, 5000);
  };

  const total = pay ? pay.items.reduce((a, x) => a + x.amount, 0) : 0;
  const late = pay ? pay.items.some((x) => fmt.diffDays(x.dueDate, settings.today) < 0) : false;
  const oldestDue = pay?.items.reduce((acc, x) => (x.dueDate < acc ? x.dueDate : acc), pay.items[0].dueDate) ?? '';
  const purchases = pay ? [...new Set(pay.items.map((x) => x.purchaseId))] : [];
  const title = payState === 'methods' ? s.pay.payWith : pay?.kind === 'pick' ? s.pay.titlePick(purchases.length, pay.items[0].merchant.name[lang]) : late ? s.pay.titleOverdue : s.pay.titleNext;
  const sub = !pay ? '' : pay.kind === 'pick' ? s.pay.subPick(who(pay.items, lang, s), pay.items.length) : pay.kind === 'one'
    ? s.pay.subOne(who(pay.items, lang, s), pay.items[0].number, pay.items[0].of, dd(oldestDue, lang), late)
    : late ? s.pay.subLate(who(pay.items, lang, s), dd(oldestDue, lang)) : s.pay.sub(who(pay.items, lang, s), dd(oldestDue, lang));
  const methodTitle = (x: PaymentMethod) => (x.type === 'applePay' ? s.pay.applePay : s.pay.card(x.brand!, x.last4!));
  const methodSub = (x: PaymentMethod) => (x.type === 'applePay' ? s.pay.applePaySub : x.lastFailureAt ? s.pay.failedOn(dd(x.lastFailureAt, lang)) : x.kind === 'credit' ? s.pay.credit : s.pay.debit) || undefined;

  return (
    <FlowCtx.Provider value={{ openPay, openExtend, lastPaid, lastExtended, offline, closeAll: () => { stopPoll(); setPay(null); setExt(null); setAsk(false); } }}>
      {children}
      <BottomSheet closeLabel={s.common.close} backLabel={s.common.back} visible={!!pay} title={title} dismissable={payState !== 'processing'}
        leading={payState === 'methods' ? 'back' : 'close'}
        onLeading={payState === 'methods' ? () => setPayState('sheet') : () => { stopPoll(); setPay(null); }}
        onClose={() => { stopPoll(); setPay(null); }}>
        {payState === 'methods' ? (
          <>
            <ListGroup plain>
              {methods.map((x) => (
                <ListRow key={x.id} plainPadding title={methodTitle(x)} subtitle={methodSub(x)} subtitleColor={x.lastFailureAt ? 'color/text/content/critical/default' : undefined}
                  leading={{ kind: 'icon', icon: x.type === 'applePay' ? 'wallet' : 'credit-card' }}
                  selection={{ kind: 'radio', selected: x.id === method?.id }}
                  onPress={() => { analytics.track('method_changed', { from: method?.id, to: x.id }); setMethodId(x.id); setPayState('sheet'); }} />
              ))}
              <ListRow plainPadding title={s.pay.addCard} leading={{ kind: 'icon', icon: 'plus' }} chevron onPress={() => { setPay(null); router.push({ pathname: '/money/stub', params: { from: 'add_card' } }); }} />
            </ListGroup>
            <Txt role="body/sm" color="color/text/content/secondary/default" wrap>{s.pay.pickHelp}</Txt>
          </>
        ) : pay ? (
          <>
            <View style={{ gap: th.t('space/gap-y/3xs') }}>
              <Txt role="body/sm" color="color/text/content/secondary/default">{s.pay.amount}</Txt>
              <Txt role="display/lg" tabular>{m(total, lang)}</Txt>
              <Txt role="body/md" color="color/text/content/secondary/default" wrap>{sub}</Txt>
            </View>
            {payState === 'failed' ? <Notice tone="critical" title={s.pay.failedTitle} body={s.pay.failedBody} /> : null}
            {payState === 'unknown' ? <Notice tone="neutral" icon="help-circle" title={s.pay.unknownTitle} body={s.pay.unknownBody} /> : null}
            {payState !== 'unknown' ? (
              <View>
                <SectionHeader title={s.pay.payWith} action={payState === 'sheet' || payState === 'failed' ? s.common.change : undefined} actionLabel={s.pay.changeMethodA11y} onAction={() => { if (payState === 'failed') analytics.track('pay_retry', { action: 'other_method' }); setPayState('methods'); }} />
                {method ? <ListRow plainPadding title={methodTitle(method)} subtitle={payState === 'processing' ? (method.kind === 'credit' ? s.pay.credit : undefined) : methodSub(method)} leading={{ kind: 'icon', icon: method.type === 'applePay' ? 'wallet' : 'credit-card' }} /> : null}
              </View>
            ) : null}
            {payState === 'unknown' ? <Button label={s.common.close} onPress={() => { setPay(null); st.refresh(); }} />
              : payState === 'failed' ? (
                <View>
                  <Button label={s.pay.tryAgainAmt(m(total, lang))} onPress={() => { analytics.track('pay_retry', { action: 'try_again' }); submit(); }} />
                  {late && st.summary?.card.state === 'overdue' && st.summary.card.extendable ? (
                    // Way out after a decline (pending #4, user pick A); shown only when the payment can be extended.
                    <Button variant="link" full align="center" label={s.pay.extendInstead} onPress={() => { const items = pay.items; analytics.track('pay_retry', { action: 'extend' }); stopPoll(); setPay(null); openExtend(items, 'pay_failed'); }} />
                  ) : null}
                </View>
              ) : method?.type === 'applePay' && payState === 'sheet' ? (
                <ApplePayButton label={s.pay.payApple} onPress={submit} />
              ) : (
                <Button label={payState === 'processing' ? s.pay.paying : s.money.pay(m(total, lang))} loading={payState === 'processing'} onPress={submit} />
              )}
          </>
        ) : null}
      </BottomSheet>
      <ExtendSheet req={ext} onClose={() => setExt(null)} onDone={(o) => { setLastExtended(o); setExt(null); router.push('/money/extended'); st.refresh(); }} />
      <ReminderAsk visible={ask} onClose={() => setAsk(false)} />
    </FlowCtx.Provider>
  );
}

// raw-ok: Apple HIG fixes the Apple Pay button to black; not a design token. Placeholder until PKPaymentButton (S21).
const APPLE_PAY_BLACK = { rest: '#000', pressed: '#333' };

/** Placeholder for Apple's PKPaymentButton (black, system text; real button out of scope, S21). */
function ApplePayButton({ label, onPress }: { label: string; onPress: () => void }) {
  const th = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ height: th.t('size/height/md'), borderRadius: th.t('radius/md'), backgroundColor: pressed ? APPLE_PAY_BLACK.pressed : APPLE_PAY_BLACK.rest, alignItems: 'center', justifyContent: 'center' })}>
      <Txt role="label/lg" color="color/text/on-fill/brand/default" align="center">{label}</Txt>
    </Pressable>
  );
}

function ExtendSheet({ req, onClose, onDone }: { req: { items: Item[]; source: string } | null; onClose: () => void; onDone: (o: ExtendOutcome) => void }) {
  const { s, lang } = useStore();
  const th = useTheme();
  const [opts, setOpts] = useState<{ until: string; fees: { purchaseId: string; instalmentId: string; fee: number }[] }[] | null>(null);
  const [optsErr, setOptsErr] = useState(false);
  const [ticked, setTicked] = useState<string[]>([]);
  const [pick, setPick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<'fail' | 'unknown' | null>(null);
  const [dropped, setDropped] = useState<string | null>(null);
  const items = req?.items ?? [];
  const load = async (ids: string[]) => {
    setOpts(null); setOptsErr(false);
    try { setOpts(await api.extendOptions(ids)); } catch { setOptsErr(true); }
  };
  useEffect(() => { if (req) { const ids = req.items.map((x) => x.instalmentId); setTicked(ids); setPick(0); setErr(null); setDropped(null); load(ids); } }, [req]);
  const one = items.length === 1;
  // Fee depends on the length picked (pending #7): item rows + button show the picked date's fee, each date row its own total.
  const feeOf = (id: string, o = pick) => opts?.[o]?.fees.find((f) => f.instalmentId === id)?.fee ?? 0;
  const totalOf = (o: number) => ticked.reduce((a, id) => a + feeOf(id, o), 0);
  const totalFee = totalOf(pick);
  const until = opts?.[pick]?.until;
  const confirm = async () => {
    if (!until) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.extend(ticked, until);
      analytics.track('extend_confirmed', { count: ticked.length, until, totalFee: r.totalFee });
      onDone(r);
    } catch (e) {
      const code = (e as MockError).code;
      analytics.track('extend_failed', { reason: code });
      if (code === 'notEligible') { const gone = items.find((x) => ticked.includes(x.instalmentId)); setDropped(gone ? gone.merchant.name[lang] : null); setTicked((t) => t.slice(1)); }
      else setErr(code === 'timeout' || (code === 'network' && (e as MockError).sent) ? 'unknown' : 'fail');
    } finally { setBusy(false); }
  };
  return (
    <BottomSheet closeLabel={s.common.close} backLabel={s.common.back} visible={!!req} title={s.overdue.extendDue} onClose={onClose} dismissable={!busy}>
      {dropped ? <Notice title={s.extend.notEligible(dropped)} /> : null}
      <View>
        <SectionHeader title={s.extend.which} />
        <ListGroup plain>
          {items.map((x) => (
            <ListRow key={x.instalmentId} plainPadding title={x.merchant.name[lang]} subtitle={opts ? s.extend.fee(m(feeOf(x.instalmentId), lang)) : undefined} value={m(x.amount, lang)}
              leading={{ kind: 'logo', text: x.merchant.logoText, color: x.merchant.logoColor }}
              selection={one ? undefined : { kind: 'check', selected: ticked.includes(x.instalmentId) }}
              onPress={one ? undefined : () => setTicked((t) => (t.includes(x.instalmentId) ? t.filter((y) => y !== x.instalmentId) : [...t, x.instalmentId]))} />
          ))}
        </ListGroup>
      </View>
      <View>
        <SectionHeader title={s.extend.newDate} />
        {optsErr ? (
          <Notice title={s.extend.loadErr}><Button variant="link" label={s.common.tryAgain} onPress={() => load(items.map((x) => x.instalmentId))} /></Notice>
        ) : !opts ? (
          <View style={{ gap: th.t('space/gap-y/sm') }}>{[0, 1, 2].map((i) => <View key={i} style={{ height: th.t('size/touch/min'), borderRadius: th.t('radius/sm'), backgroundColor: th.t('color/fill/default') as string }} />)}</View>
        ) : (
          <ListGroup plain>
            {opts.map((o, i) => (
              <ListRow key={o.until} plainPadding title={s.extend.until(dd(o.until, lang))} quietValue={ticked.length > 1 ? s.extend.totalFee(m(totalOf(i), lang)) : s.extend.fee(m(totalOf(i), lang))}
                selection={{ kind: 'radio', selected: i === pick }} onPress={() => setPick(i)} />
            ))}
          </ListGroup>
        )}
      </View>
      {err === 'fail' ? <Notice tone="critical" title={s.extend.failTitle} body={s.extend.failBody} /> : null}
      {err === 'unknown' ? <Notice title={s.extend.unknownTitle} body={s.extend.unknownBody} /> : null}
      <Txt role="body/sm" color="color/text/content/secondary/default" wrap>{s.extend.once}</Txt>
      {ticked.length && opts && err !== 'unknown' ? (
        <Button loading={busy} onPress={confirm}
          label={busy ? s.extend.extending : ticked.length > 1 ? s.extend.ctaMany(ticked.length, m(totalFee, lang)) : s.extend.ctaOne(dd(until!, lang), m(totalFee, lang))} />
      ) : null}
    </BottomSheet>
  );
}

function ReminderAsk({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const st = useStore();
  const { s, lang } = st;
  const th = useTheme();
  const toast = useToast();
  const [salaryOn, setSalaryOn] = useState(false);
  const [day, setDay] = useState<number | 'last' | null>(null);
  const [picker, setPicker] = useState(false);
  const turnOn = async () => {
    if (salaryOn && day === null) { setPicker(true); return; }
    analytics.track('reminder_ask_result', { action: 'turn_on', salaryOn });
    const prefs = await api.prefs().catch(() => null);
    if (prefs) await api.savePrefs({ ...prefs, salaryDay: { on: salaryOn, day } }).catch(() => {});
    const res = await Notifications.requestPermissionsAsync().catch(() => ({ granted: false }));
    const status = res.granted ? 'granted' : 'denied';
    st.setFlags({ osPermission: status });
    analytics.track('os_permission_result', { status, source: 'ask' });
    onClose();
    setTimeout(() => toast(res.granted ? { tone: 'success', text: s.rem.on } : { tone: 'neutral', text: s.rem.off }), 350);
  };
  const noThanks = () => { analytics.track('reminder_ask_result', { action: 'no_thanks', salaryOn }); onClose(); };
  const sample = st.summary?.card;
  return (
    <BottomSheet closeLabel={s.common.close} backLabel={s.common.back} visible={visible} title={picker ? s.rem.salaryDay : s.rem.sheetTitle} leading={picker ? 'back' : 'close'} onLeading={picker ? () => setPicker(false) : noThanks} onClose={noThanks}>
      {picker ? (
        <SalaryPicker value={day} onSave={(d) => { setDay(d); setPicker(false); }} />
      ) : (
        <>
          <View style={{ backgroundColor: th.t('color/surface/secondary/default') as string, borderRadius: th.t('radius/md'), padding: th.t('space/padding/sm'), flexDirection: 'row', gap: th.t('space/gap-x/sm') }}>
            <View style={{ width: th.t('size/height/2xs'), height: th.t('size/height/2xs'), borderRadius: th.t('radius/sm'), backgroundColor: th.t('color/fill/brand/default') as string, alignItems: 'center', justifyContent: 'center' }}>
              <Txt role="label/lg" color="color/text/on-fill/brand/default" align="center">t</Txt>
            </View>
            <View style={{ flex: 1, gap: th.t('space/gap-y/4xs') }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt role="label/md">{s.rem.sampleTitle}</Txt>
                <Txt role="caption" color="color/text/content/secondary/default">{s.rem.now}</Txt>
              </View>
              <Txt role="body/sm" color="color/text/content/secondary/default" wrap>{s.rem.sampleBody(m(sample?.amount ?? 31250, lang), who(sample?.items ?? [], lang, s))}</Txt>
            </View>
          </View>
          <View style={{ gap: th.t('space/gap-y/xs') }}>
            <Txt role="heading/md">{s.rem.why}</Txt>
            <Txt role="body/md" color="color/text/content/secondary/default" wrap>{s.rem.whyBody}</Txt>
          </View>
          <View>
            <ListRow plainPadding title={s.rem.salaryToggle} divider={salaryOn} selection={{ kind: 'switch', value: salaryOn, onChange: setSalaryOn }} />
            {salaryOn ? (
              <>
                <ListRow plainPadding title={s.rem.salaryDay} value={day === null ? undefined : day === 'last' ? s.rem.lastDay : fmt.ordinalDay(day, lang)} chevron onPress={() => setPicker(true)} />
                <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: th.t('space/gap-y/xs') }}>{s.rem.salaryNote}</Txt>
              </>
            ) : null}
          </View>
          <View>
            <Button label={s.rem.turnOn} onPress={turnOn} />
            <Button variant="link" full label={s.rem.noThanks} onPress={noThanks} />
          </View>
        </>
      )}
    </BottomSheet>
  );
}

export function SalaryPicker({ value, onSave }: { value: number | 'last' | null; onSave: (d: number | 'last') => void }) {
  const { s, lang } = useStore();
  const th = useTheme();
  const [v, setV] = useState<number | 'last' | null>(value);
  const opts: (number | 'last')[] = [...Array.from({ length: 31 }, (_, i) => i + 1), 'last'];
  return (
    <>
      <Txt role="body/md" color="color/text/content/secondary/default" wrap>{s.rem.pickerBody}</Txt>
      {/* Stand-in for the iOS wheel (system element in Figma): a scroll list of days. */}
      <ScrollView style={{ maxHeight: th.t('size/touch/min') * 5, borderRadius: th.t('radius/md'), backgroundColor: th.t('color/surface/secondary/default') as string }}>
        {opts.map((o) => (
          <Pressable key={String(o)} onPress={() => setV(o)} style={{ height: th.t('size/touch/min'), justifyContent: 'center', paddingHorizontal: th.t('space/padding-x/md'), backgroundColor: v === o ? (th.t('color/surface/brand/default') as string) : 'transparent' }}>
            <Txt role={v === o ? 'label/lg' : 'body/md'} align="center">{o === 'last' ? s.rem.lastDay : fmt.ordinalDay(o, lang)}</Txt>
          </Pressable>
        ))}
      </ScrollView>
      <Txt role="body/sm" color="color/text/content/secondary/default" wrap>{s.rem.pickerNote}</Txt>
      {v !== null ? <Button label={s.rem.save} onPress={() => onSave(v)} /> : null}
    </>
  );
}
