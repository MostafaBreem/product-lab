// A3 Confirm booking (+ A3e time taken). Modes normal · followUp · reschedule (build-spec-screens.md > Modes).
// Mock book-dentist-en-v2 A3 / A3e; validation + booking errors build-spec-rules.md; mock API build-spec-data.md.
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Card, Checkbox, NavigationBar, Notice, Screen, TextField, Txt, useTheme, useToast } from '@lab/app-kit';
import { ev, setCommon } from '../../../domain/analytics';
import { daysSincePrevVisit, followUpUntil, lastVisitWith } from '../../../domain/derive';
import { CONSENT_VERSION, doctor, PATIENT } from '../../../domain/fixtures';
import { day, dayTime, digits } from '../../../domain/format';
import { allBookings, api } from '../../../domain/server';
import { fmtStrings, split, t } from '../../../domain/strings';
import type { BookingKind, Source } from '../../../domain/types';
import { validateForm, type FormErrors } from '../../../domain/validate';
import { haptic } from '../../../ui/feedback';
import { Caption, IconLine, SummaryRow } from '../../../ui/patterns';
import { bookCta, consentParts, drName, feeLine, initials, phoneField, placeLine, pointsLine } from '../../../ui/text';
import { useStore } from '../../../state';

type Mode = 'normal' | 'followUp' | 'reschedule';
type Params = { doctorId: string; start: string; mode?: Mode; source?: string; filter?: string; bookingId?: string; rebookOf?: string };
type Fail = 'slotTaken' | 'followUpExpired' | 'error' | undefined;
const newKey = () => `idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function Confirm() {
  const p = useLocalSearchParams<Params>();
  const st = useStore();
  const { lang, settings, flags } = st;
  const th = useTheme();
  const toast = useToast();
  const d = doctor(p.doctorId);
  const [mode, setMode] = useState<Mode>(p.mode || 'normal');
  const source = (p.source || (mode === 'reschedule' ? 'moved_pick' : 'results_book')) as Source;
  const isFirst = !flags.firstBookingDone;

  // Prefill name + phone from the last booking (returning patient, Mona).
  const last = useMemo(() => [...(st.bookings ?? allBookings())].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0], []);
  const [name, setName] = useState(last?.patientName ?? PATIENT.name);
  const [phone, setPhone] = useState(phoneField(last?.phone ?? PATIENT.phone));
  const [email, setEmail] = useState('');
  const [offers, setOffers] = useState(false); // unticked, separate (S7)
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState<Fail>();
  const key = useRef(newKey()); // same key on Try again (never doubles)
  const openedAt = useRef(Date.now());

  useEffect(() => {
    haptic.selection();
    if (d) ev.confirmViewed({ doctorId: d.id, start: p.start });
  }, []);
  useFocusEffect(useCallback(() => { setCommon({ screen: 'A3' }); }, []));

  if (!d || !p.start) return <Screen top={<NavigationBar leading="back" onLeading={() => router.back()} />}><Txt role="body/sm">{t('stub', lang)}</Txt></Screen>;

  const resched = mode === 'reschedule';
  const fu = mode === 'followUp';
  const oldStart = resched ? st.bookings?.find((b) => b.id === p.bookingId)?.start : undefined;
  const fee = resched ? (st.bookings?.find((b) => b.id === p.bookingId)?.fee ?? d.fee) : fu ? 0 : d.fee;
  const [whenK, feeK, whereK, cancelK] = split('a3.keys', lang);
  const [errT, errB] = split('a3.err.book.t / b', lang);
  const consent = consentParts(lang);
  const title = resched ? fmtStrings.reschedTitle(lang) : t('a3.nav', lang);
  const cta = resched ? fmtStrings.reschedCta(dayTime(p.start, lang), lang) : fu ? t('b4.cta', lang) : bookCta(p.start, lang);
  const prevVisit = lastVisitWith(st.bookings ?? allBookings(), d.id, settings.now);
  const fuEnded = prevVisit ? followUpUntil(prevVisit, d) : undefined;
  const stub = () => toast({ tone: 'neutral', text: t('stub', lang) });

  async function submit(kind: BookingKind = fu ? 'followUp' : 'normal') {
    const v = resched ? { errors: {}, first: undefined, phone: undefined } : validateForm({ name, phone, email }); // reschedule: PATCH {start} only, no form
    setErrors(v.errors);
    if (v.first) return; // errors on Book tap; kit TextField has no focus ref (gap): error text is announced (role alert)
    if (settings.net === 'offline') { toast({ tone: 'neutral', text: t('off.book', lang) }); return; }
    ev.bookingSubmitted({ doctorId: d!.id, formMs: Date.now() - openedAt.current });
    setBusy(true); setFail(undefined);
    try {
      if (resched) {
        const r = await api.reschedule(p.bookingId!, p.start);
        ev.bookingResult({ result: 'ok', bookingId: r.booking.id });
        ev.bookingRescheduled({ bookingId: r.booking.id, fromStart: r.fromStart, toStart: r.booking.start });
        haptic.success();
        await st.refresh();
        router.dismissAll();
        router.navigate('/appointments');
        toast({ tone: 'success', text: fmtStrings.reschedToast(dayTime(r.booking.start, lang), lang) });
        return;
      }
      const days = daysSincePrevVisit(st.bookings ?? allBookings(), d!.id, settings.now);
      const b = await api.createBooking({ doctorId: d!.id, start: p.start, patientName: name.trim(), phone: v.phone!, email: email.trim() || undefined, kind,
        offersOptIn: isFirst && !fu && offers, consentVersion: CONSENT_VERSION, idempotencyKey: key.current, source });
      ev.bookingResult({ result: 'ok', bookingId: b.id });
      ev.bookingCreated({ bookingId: b.id, doctorId: b.doctorId, source, isFollowUp: b.kind === 'followUp', isFirstBooking: isFirst, filter: p.filter === 'general' ? 'general' : 'none',
        ...(days !== undefined ? { daysSincePrevVisitSameDoctor: days } : {}) });
      if (p.rebookOf) ev.cancelledRebooked({ bookingId: p.rebookOf, newBookingId: b.id });
      if (isFirst && !fu && offers) { ev.offersOptIn({ on: true }); st.setFlags({ offersOptIn: true }); }
      st.setFlags({ firstBookingDone: true });
      haptic.success();
      st.refresh();
      router.replace({ pathname: '/home/booked', params: { doctorId: b.doctorId, start: b.start, fee: String(b.fee), patient: b.patientName, first: isFirst ? '1' : '0' } });
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'slotTaken') { ev.bookingResult({ result: 'slot_taken' }); haptic.warning(); setFail('slotTaken'); }
      else if (code === 'followUpExpired') { ev.bookingResult({ result: 'error' }); setFail('followUpExpired'); }
      else if (code === 'network' && (e as { sent?: boolean }).sent === false) { toast({ tone: 'neutral', text: t('off.book', lang) }); }
      else { ev.bookingResult({ result: 'error' }); haptic.warning(); setFail('error'); }
    } finally { setBusy(false); }
  }

  const taken = fail === 'slotTaken';
  const bookRegular = () => { setMode('normal'); key.current = newKey(); submit('normal'); };
  const backToTimes = () => { st.refresh(); router.back(); }; // A2 reloads: taken slot comes back struck

  // Errors sit in the action bar directly above the main button (Designer call 2026-11-09, user: "Above the Book button"),
  // not at the top of the scroll: the user tapped Book at the bottom of the form, so the answer appears where they look.
  // Critical Notice = role alert + assertive live region (kit), so screen readers announce it.
  const footer = taken ? (
    <View style={{ gap: th.t('space/gap-y/sm') }}>
      <Notice tone="critical" title={t('a3e.t', lang)} body={t('a3e.b', lang)} />
      <Button label={t('a3e.cta', lang)} onPress={backToTimes} testID="a3e-choose" />
    </View>
  ) : (
    <View style={{ gap: th.t('space/gap-y/xs') }}>
      <Caption text={consent.text} link={consent.link} onLink={stub} />
      {fail === 'error' ? <View style={{ paddingTop: th.t('space/gap-y/xs') }}><Notice tone="critical" title={errT} body={errB} /></View> : null}
      {fail === 'followUpExpired' && fuEnded ? <View style={{ paddingTop: th.t('space/gap-y/xs') }}><Notice title={fmtStrings.fuExpired(day(fuEnded, lang), lang)} /></View> : null}
      {fail === 'followUpExpired'
        ? <Button label={fmtStrings.fuExpiredCta(digits(d.fee, lang), lang)} onPress={bookRegular} loading={busy} testID="a3-book-regular" />
        : fail === 'error'
          // Try again keeps the same idempotencyKey (key.current), so a retry never books twice.
          ? <Button label={busy ? t('btn.booking', lang) : t('err.retry', lang)} onPress={() => submit()} loading={busy} testID="a3-retry" />
          : <Button label={busy ? t('btn.booking', lang) : cta} onPress={() => submit()} loading={busy} testID="a3-book" />}
    </View>
  );

  return (
    <Screen top={<NavigationBar title={title} leading="back" onLeading={() => router.back()} />} footer={footer}>
      <Card style={{ gap: th.t('space/gap-y/md') }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm') }}>
          {/* raw-ok: Avatar size is the kit enum 40 | 56 | 72, not a value */}
          <Avatar initials={initials(d, lang)} size={40} />
          <View style={{ flex: 1 }}>
            <Txt role="label/lg">{drName(d, lang)}</Txt>
            <Txt role="body/sm" color="color/text/content/secondary/default">{d.title[lang]}</Txt>
          </View>
        </View>
        <View style={{ gap: th.t('space/gap-y/sm') }}>
          <SummaryRow icon="calendar" k={whenK} v={dayTime(p.start, lang)} struck={taken} was={resched && oldStart ? dayTime(oldStart, lang) : undefined} />
          <SummaryRow icon="coins" k={feeK} v={fu ? t('b4.fee.v', lang) : feeLine(fee, lang)} />
          {placeLine(d, lang) ? <SummaryRow icon="compass" k={whereK} v={placeLine(d, lang)!} /> : null}
          <SummaryRow icon="calendar-check" k={cancelK} v={t('a3.cancel.v', lang)} />
        </View>
      </Card>

      {resched ? null : <View style={{ gap: th.t('space/gap-y/md') }}>
        <TextField label={t('a3.name', lang)} value={name} onChangeText={setName} error={errors.name ? t('a3.err.name', lang) : undefined} testID="a3-name" />
        <TextField label={t('a3.phone', lang)} prefix="+20" value={phone} onChangeText={(v) => setPhone(v.replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660)))} keyboardType="phone-pad" inputMode="tel" error={errors.phone ? t('a3.err.phone', lang) : undefined} testID="a3-phone" />
        <TextField label={t('a3.email', lang)} value={email} onChangeText={setEmail} keyboardType="email-address" inputMode="email" error={errors.email ? t('a3.err.email', lang) : undefined} testID="a3-email" />
      </View>}

      {mode === 'normal' ? <IconLine icon="coins" text={pointsLine(fee, lang)} /> : null}
      {isFirst && !fu && !resched ? <Checkbox checked={offers} onChange={setOffers} label={t('a3.offers', lang)} testID="a3-offers" /> : null}
    </Screen>
  );
}
