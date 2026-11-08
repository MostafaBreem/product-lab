// B1 Upcoming / B3 Past (one screen, SegmentedControl) + B6 empty + B2 moved sheet (param moved) / B2b kept + B2c cancel confirm sheet.
// Mock appointments-en-v3 B1 / B2c / B3 / B6; build-spec-screens.md > Flow B; build-spec-rules.md > Patient cancel, Round 2 fixes.
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { BottomSheet, Button, Card, Header, KeyValue, ListGroup, Notice, Screen, SectionHeader, SegmentedControl, Tag, Txt, useTheme, useToast } from '@lab/app-kit';
import { ev, promptShownOnce, setCommon } from '../../../domain/analytics';
import { past, prompts, upcoming } from '../../../domain/derive';
import { doctor } from '../../../domain/fixtures';
import { dayTime, monthName } from '../../../domain/format';
import { api } from '../../../domain/server';
import { fmtStrings, split, t } from '../../../domain/strings';
import type { Booking, Prompt, Source } from '../../../domain/types';
import { underThreeHours } from '../../../domain/derive';
import { haptic } from '../../../ui/feedback';
import { DoctorLine, EmptyBlock, FadeCollapse, FadeSwap, CardLine, MovedTimes, PastRow, PromptRow, SkeletonCard, SkeletonRow } from '../../../ui/patterns';
import { bookAgain, cacheAge, keptToast, placeLine, cancelledBody, cancelMovedBody, drName, feeLine, fuRow, initials, nextRow, pastFee, pastFuBody, pastFuTitle, pastRowSub, streetArea, visitOn, wasLine } from '../../../ui/text';
import { useStore } from '../../../state';

type Seg = 'upcoming' | 'past';
const CANCELLABLE = new Set<Booking['status']>(['booked', 'confirmedForTomorrow', 'movedByClinic']);
const pkey = (p: Prompt) => `${p.type}:${p.doctorId}`;

/** A2 for a doctor (Home stack). */
function toDoctor(id: string, source: Source, mode: 'normal' | 'followUp' | 'reschedule', extra: Record<string, string> = {}) {
  router.navigate({ pathname: '/home/doctor/[id]', params: { id, source, mode, ...extra } });
}

export default function Appointments() {
  const st = useStore();
  const { lang, settings, bookings, loading, loadError, cachedAt } = st;
  const now = settings.now;
  const th = useTheme();
  const toast = useToast();
  const [seg, setSeg] = useState<Seg>('upcoming');
  const [cancelId, setCancelId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [cancelErr, setCancelErr] = useState(false);
  // B2 moved sheet: opened from the card, a push tap or a deep link (param moved).
  const params = useLocalSearchParams<{ moved?: string; focus?: string }>();
  const [movedId, setMovedId] = useState<string>();
  const [keepBusy, setKeepBusy] = useState(false);
  const [keepErr, setKeepErr] = useState(false);
  useEffect(() => {
    if (params.moved) { setSeg('upcoming'); setKeepErr(false); setMovedId(params.moved); router.setParams({ moved: undefined }); }
    else if (params.focus) { setSeg('upcoming'); router.setParams({ focus: undefined }); }
  }, [params.moved, params.focus]);
  useFocusEffect(useCallback(() => { setCommon({ screen: seg === 'upcoming' ? 'B1' : 'B3' }); if (!loading) st.refresh(); }, [seg]));

  const ps = useMemo(() => (bookings ? prompts(bookings, now) : []), [bookings, now]);
  const ups = useMemo(() => (bookings ? upcoming(bookings, now) : []), [bookings, now]);
  const pastList = useMemo(() => (bookings ? past(bookings, now) : { top: [], months: [] }), [bookings, now]);

  // Prompt rows that just left (booked): kept on screen for the fade + collapse.
  const prev = useRef<Prompt[]>([]);
  const [leaving, setLeaving] = useState<Prompt[]>([]);
  useEffect(() => {
    const gone = prev.current.filter((p) => !ps.some((q) => pkey(q) === pkey(p)));
    if (gone.length) setLeaving((xs) => [...xs, ...gone.filter((g) => !xs.some((x) => pkey(x) === pkey(g)))]);
    prev.current = ps;
  }, [ps]);

  // prompt_shown once per app session per prompt (place = tab shown).
  useEffect(() => {
    if (seg !== 'upcoming') return;
    ps.forEach((p) => promptShownOnce({ type: p.type, doctorId: p.doctorId, place: 'upcoming' }));
  }, [ps, seg]);
  useEffect(() => {
    if (seg !== 'past') return;
    ps.filter((p) => pastList.top.some((v) => v.id === p.visitId)).forEach((p) => promptShownOnce({ type: p.type, doctorId: p.doctorId, place: 'past' }));
  }, [ps, seg, pastList]);

  const offline = settings.net === 'offline';
  const offToast = () => toast({ tone: 'neutral', text: t('off.action', lang) });
  const tapPrompt = (p: Prompt, place: 'upcoming' | 'past') => {
    ev.promptTapped({ type: p.type, place });
    const source: Source = place === 'upcoming' ? (p.type === 'followUp' ? 'followup_row' : 'next_visit_row') : (p.type === 'followUp' ? 'past_followup' : 'past_next_visit');
    toDoctor(p.doctorId, source, p.type === 'followUp' ? 'followUp' : 'normal');
  };

  const moved = bookings?.find((b) => b.id === movedId && b.status === 'movedByClinic');
  const movedDoc = moved ? doctor(moved.doctorId) : undefined;
  async function keep() {
    if (!moved) return;
    if (offline) { offToast(); return; }
    setKeepBusy(true); setKeepErr(false);
    try {
      const b = await api.keep(moved.id);
      ev.movedResolved({ bookingId: b.id, resolution: 'keep' });
      setMovedId(undefined);
      await st.refresh();
      haptic.light();
      toast({ tone: 'success', text: keptToast(b.start, lang) });
    } catch (e) {
      if ((e as { code?: string }).code === 'network') offToast(); else setKeepErr(true);
    } finally { setKeepBusy(false); }
  }
  const pickAnother = () => {
    if (!moved) return;
    ev.movedResolved({ bookingId: moved.id, resolution: 'pick' });
    setMovedId(undefined);
    toDoctor(moved.doctorId, 'moved_pick', 'reschedule', { bookingId: moved.id });
  };
  const cancelFromMoved = () => { if (!moved) return; const id = moved.id; setMovedId(undefined); setCancelErr(false); setCancelId(id); };

  const target = bookings?.find((b) => b.id === cancelId);
  async function confirmCancel() {
    if (!target) return;
    if (offline) { offToast(); return; }
    setBusy(true); setCancelErr(false);
    try {
      const r = await api.cancel(target.id);
      ev.patientCancelled({ bookingId: target.id, afterClinicMove: r.afterClinicMove });
      if (r.afterClinicMove) ev.movedResolved({ bookingId: target.id, resolution: 'cancel' });
      setCancelId(undefined);
      await st.refresh();
    } catch (e) {
      if ((e as { code?: string }).code === 'network') offToast(); else setCancelErr(true);
    } finally { setBusy(false); }
  }

  const [errT, errB] = split('err.load.t / b', lang);
  const [segUp, segPast] = split('b.seg', lang);
  const firstLoad = loading && !bookings;
  const noData = !bookings && !!loadError;

  return (
    <Screen top={null}>
      <Header title={t('b.title', lang)} onLongPressTitle={() => router.push('/debug')} />
      <SegmentedControl<Seg> value={seg} onChange={setSeg} options={[{ value: 'upcoming', label: segUp }, { value: 'past', label: segPast }]} />
      {cachedAt ? <Notice title={fmtStrings.offCache(cacheAge(cachedAt, now, lang), lang)} /> : null}

      {firstLoad ? (
        <View style={{ gap: th.t('space/gap-y/md') }}>{seg === 'upcoming' ? <SkeletonRow /> : null}<SkeletonCard /><SkeletonCard /></View>
      ) : noData ? (
        <Notice tone="critical" title={errT} body={errB}>
          <Button variant="link" label={t('err.retry', lang)} onPress={() => st.refresh()} testID="b-retry" />
        </Notice>
      ) : seg === 'upcoming' ? (
        <View style={{ gap: th.t('space/gap-y/md') }}>
          {[...ps.map((p) => ({ p, gone: false })), ...leaving.map((p) => ({ p, gone: true }))].map(({ p, gone }) => {
            const d = doctor(p.doctorId);
            if (!d) return null;
            const r = p.type === 'followUp' ? fuRow(d, p.until, lang) : nextRow(d, p.lastVisit, lang);
            return (
              <FadeCollapse key={pkey(p)} leaving={gone} onGone={() => setLeaving((xs) => xs.filter((x) => pkey(x) !== pkey(p)))}>
                <PromptRow icon={p.type === 'followUp' ? 'calendar-check' : 'calendar'} title={r.title} sub={r.sub} cta={r.cta} onPress={() => tapPrompt(p, 'upcoming')} testID={`prompt-${pkey(p)}`} />
              </FadeCollapse>
            );
          })}
          {ups.map((b) => <BookingCard key={b.id} b={b} onCancel={() => { setCancelErr(false); setCancelId(b.id); }} onReview={() => { setKeepErr(false); setMovedId(b.id); }} />)}
          {ups.length === 0 ? <EmptyBlock icon="calendar" title={t('b6.t', lang)} body={t('b6.b', lang)} cta={t('b6.cta', lang)} onPress={() => router.navigate('/home')} /> : null}
        </View>
      ) : (
        <PastView top={pastList.top} months={pastList.months} ps={ps} onPrompt={(p) => tapPrompt(p, 'past')} />
      )}

      <BottomSheet visible={!!moved && !!movedDoc} onClose={() => setMovedId(undefined)} title={t('b2.t', lang)} dismissable={!keepBusy} footer={
        <View style={{ gap: th.t('space/gap-y/xs') }}>
          <Button label={split('b2.acts', lang)[0]} loading={keepBusy} onPress={keep} testID="b2-keep" />
          <Button variant="secondary" label={split('b2.acts', lang)[1]} disabled={keepBusy} onPress={pickAnother} testID="b2-pick" />
          <Button variant="link" label={split('b2.acts', lang)[2]} onPress={cancelFromMoved} testID="b2-cancel" />
        </View>
      }>
        {keepErr ? (
          <Notice tone="critical" title={errT} body={errB}>
            <Button variant="link" label={t('err.retry', lang)} onPress={keep} testID="b2-retry" />
          </Notice>
        ) : null}
        {moved && movedDoc ? (
          <>
            <MovedTimes newK={split('b.moved.keys', lang)[0]} newV={dayTime(moved.start, lang)} wasK={split('b.moved.keys', lang)[1]} wasV={moved.previousStart ? dayTime(moved.previousStart, lang) : ''} />
            {/* Kit ListRow has no Avatar leading: DoctorLine pattern (gap) */}
            <DoctorLine initials={initials(movedDoc)} name={drName(movedDoc, lang)} sub={placeLine(movedDoc, lang)} />
            <Txt role="body/md" wrap color="color/text/content/secondary/default">{t('b2.note', lang)}</Txt>
          </>
        ) : null}
      </BottomSheet>

      <BottomSheet visible={!!target} onClose={() => setCancelId(undefined)} title={t('b2c.t', lang)} footer={
        <View style={{ gap: th.t('space/gap-y/xs') }}>
          <Button tone="critical" label={busy ? t('btn.cancelling', lang) : split('b2c.acts', lang)[0]} loading={busy} onPress={confirmCancel} testID="b2c-cancel" />
          <Button variant="secondary" label={split('b2c.acts', lang)[1]} disabled={busy} onPress={() => setCancelId(undefined)} testID="b2c-keep" />
        </View>
      }>
        {cancelErr ? <Notice tone="critical" title={errT} body={errB} /> : null}
        {target ? <Txt role="body/md" wrap color="color/text/content/secondary/default">{cancelBody(target, now, lang)}</Txt> : null}
      </BottomSheet>
    </Screen>
  );
}

/** B2c body: after a clinic move = free (b2c.b); under 3 hours before = b2c.b.late (Round 2; cancel still allowed); else b2c.b.normal. */
function cancelBody(b: Booking, now: string, lang: 'en' | 'ar') {
  const d = doctor(b.doctorId)!;
  if (b.status === 'movedByClinic') return cancelMovedBody(d, b.start, lang);
  if (underThreeHours(b.start, now)) return t('b2c.b.late', lang);
  return fmtStrings.cancelNormal(drName(d, lang), dayTime(b.start, lang), lang);
}

function BookingCard({ b, onCancel, onReview }: { b: Booking; onCancel: () => void; onReview: () => void }) {
  const { lang } = useStore();
  const th = useTheme();
  const d = doctor(b.doctorId);
  if (!d) return null;
  const cancelLink = CANCELLABLE.has(b.status) ? <Button variant="link" full={false} label={t('b.cancel.link', lang)} onPress={onCancel} testID={`cancel-${b.id}`} /> : null;
  const who = <DoctorLine initials={initials(d)} name={drName(d, lang)} sub={d.title[lang]} />;
  const addr = d.fullAddress?.en ?? streetArea(d, 'en');
  const directions = () => {
    if (!addr) return;
    const q = encodeURIComponent(addr);
    Linking.openURL(Platform.OS === 'ios' ? `maps:?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
  };

  if (b.status === 'movedByClinic') {
    const [newK] = split('b.moved.keys', lang);
    return (
      <Card style={{ gap: th.t('space/gap-y/md') }}>
        <FadeSwap k={b.status}><Tag tone="warning" label={t('b.moved.tag', lang)} /></FadeSwap>
        {who}
        <View style={{ gap: th.t('space/gap-y/2xs') }}>
          <KeyValue k={newK} v={dayTime(b.start, lang)} />
          {/* Struck old time keeps line-through in AR too (spec) */}
          {b.previousStart ? <Txt role="body/sm" color="color/text/content/secondary/default" style={{ textDecorationLine: 'line-through' }}>{wasLine(b.previousStart, lang)}</Txt> : null}
        </View>
        <Txt role="body/sm" wrap color="color/text/content/secondary/default">{t('b.moved.b', lang)}</Txt>
        <Button label={t('b.moved.cta', lang)} onPress={onReview} testID={`moved-${b.id}`} />
        {cancelLink}
      </Card>
    );
  }
  if (b.status === 'cancelledByClinic') {
    const [again, other] = split('b.canc.cta', lang);
    return (
      <Card style={{ gap: th.t('space/gap-y/md') }}>
        <FadeSwap k={b.status}><Tag tone="critical" label={t('b.canc.tag', lang)} /></FadeSwap>
        <DoctorLine initials={initials(d)} name={drName(d, lang)} />
        <Txt role="body/sm" wrap>{cancelledBody(d, b.start, lang)}</Txt>
        <View>
          <Button label={again} onPress={() => toDoctor(d.id, 'cancelled_card', 'normal', { rebookOf: b.id })} testID={`rebook-${b.id}`} />
          <Button variant="link" label={other} onPress={() => router.navigate('/home')} testID={`other-${b.id}`} />
        </View>
      </Card>
    );
  }
  const tag = b.status === 'confirmedForTomorrow' ? <Tag tone="success" label={t('b.conf.tag', lang)} />
    : b.status === 'cancelledByPatient' ? <Tag tone="default" label={t('b.canc.you', lang)} />
    : <Tag tone="success" label={t('a4.conf', lang)} />; // booked / kept: "Confirmed" (B2b mock)
  const place = streetArea(d, lang);
  const full = b.status === 'confirmedForTomorrow';
  return (
    <Card style={{ gap: th.t('space/gap-y/md') }}>
      <FadeSwap k={b.status}>{tag}</FadeSwap>
      {who}
      <View style={{ gap: th.t('space/gap-y/sm') }}>
        <CardLine icon="calendar" text={dayTime(b.start, lang)} />
        {full && place ? <CardLine icon="compass" text={place} /> : null}
        {/* "300 EGP at the clinic" has no copy row (gap): a3.fee.v (nearest) */}
        {full ? <CardLine icon="coins" text={feeLine(b.fee, lang)} /> : null}
      </View>
      {full && addr ? <Button variant="link" full={false} label={t('b.dir', lang)} onPress={directions} testID={`dir-${b.id}`} /> : null}
      {cancelLink}
    </Card>
  );
}

function PastView({ top, months, ps, onPrompt }: { top: Booking[]; months: { month: string; items: Booking[] }[]; ps: Prompt[]; onPrompt: (p: Prompt) => void }) {
  const { lang, settings } = useStore();
  const th = useTheme();
  if (!top.length) return <Txt role="body/md" wrap align="center" color="color/text/content/secondary/default">{t('b3.empty', lang)}</Txt>;
  const again = (v: Booking) => toDoctor(v.doctorId, 'past_book_again', 'normal');
  return (
    <View style={{ gap: th.t('space/gap-y/md') }}>
      {top.map((v) => {
        const d = doctor(v.doctorId);
        if (!d) return null;
        const p = ps.find((x) => x.visitId === v.id);
        const who = <DoctorLine initials={initials(d)} name={drName(d, lang)} sub={visitOn(v.start, lang)} />;
        if (p?.type === 'followUp') return (
          <Card key={v.id} style={{ gap: th.t('space/gap-y/md') }}>
            {who}
            <Notice tone="success" title={pastFuTitle(d, lang)} body={pastFuBody(p.until, settings.now, lang)} />
            <Button label={t('b3.fu.cta', lang)} onPress={() => onPrompt(p)} testID={`past-fu-${v.id}`} />
          </Card>
        );
        if (p?.type === 'nextVisit') return (
          <Card key={v.id} style={{ gap: th.t('space/gap-y/md') }}>
            {who}
            <Txt role="body/sm" color="color/text/content/secondary/default">{pastFee(d.fee, lang)}</Txt>
            <Button variant="secondary" label={t('b3.next', lang)} onPress={() => onPrompt(p)} testID={`past-next-${v.id}`} />
          </Card>
        );
        return (
          <Card key={v.id} style={{ gap: th.t('space/gap-y/md') }}>
            {who}
            <Button variant="link" full={false} label={bookAgain(lang)} onPress={() => again(v)} testID={`past-again-${v.id}`} />
          </Card>
        );
      })}
      {months.map((m) => (
        <View key={m.month}>
          <SectionHeader title={monthName(m.month, lang)} />
          <ListGroup>
            {m.items.map((v, i) => {
              const d = doctor(v.doctorId);
              if (!d) return null;
              return <PastRow key={v.id} initials={initials(d)} title={drName(d, lang)} sub={pastRowSub(v.reason?.[lang], v.start, lang)} action={bookAgain(lang)} onAction={() => again(v)} divider={i < m.items.length - 1} testID={`past-row-${v.id}`} />;
            })}
          </ListGroup>
        </View>
      ))}
    </View>
  );
}
