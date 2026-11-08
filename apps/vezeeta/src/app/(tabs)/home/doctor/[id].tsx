// A2 Doctor profile + times. Modes normal · followUp · reschedule (build-spec-screens.md > Modes). Mock book-dentist-en-v2 A2.
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, NavigationBar, Notice, Screen, SegmentedControl, Tag, Txt, KeyValue, useTheme } from '@lab/app-kit';
import { setCommon } from '../../../../domain/analytics';
import { followUpSlots, openFollowUp } from '../../../../domain/derive';
import { doctor } from '../../../../domain/fixtures';
import { egp, time } from '../../../../domain/format';
import { api } from '../../../../domain/server';
import { split, t } from '../../../../domain/strings';
import { addDays, dayOf } from '../../../../domain/time';
import type { Slot } from '../../../../domain/types';
import { IconLine, SkeletonGrid, SlotGrid } from '../../../../ui/patterns';
import { addrLine, dayWord, drName, initials, ratingLine, waitValue } from '../../../../ui/text';
import { useStore } from '../../../../state';

export type Mode = 'normal' | 'followUp' | 'reschedule';
type Params = { id: string; source?: string; filter?: string; mode?: Mode; bookingId?: string };

export default function Profile() {
  const p = useLocalSearchParams<Params>();
  const mode: Mode = p.mode ?? 'normal';
  const st = useStore();
  const { lang, settings } = st;
  const th = useTheme();
  const d = doctor(p.id); // header from the list cache (fixtures = cached list in the mock)
  const now = settings.now;
  const offline = settings.net === 'offline';
  const until = useMemo(() => (mode === 'followUp' && st.bookings ? openFollowUp(st.bookings, p.id, now)?.until : undefined), [mode, st.bookings, p.id, now]);

  const [from, setFrom] = useState(dayOf(now));
  const [slots, setSlots] = useState<Slot[]>();
  const [error, setError] = useState<string>();
  const [day, setDay] = useState<string>();

  const load = useCallback(async (f: string) => {
    setSlots(undefined); setError(undefined);
    try {
      const xs = await api.slots(p.id, f, 3);
      setSlots(until ? followUpSlots(xs, until) : xs);
    } catch (e) { setError((e as { code?: string }).code ?? 'server'); }
  }, [p.id, until]);
  useEffect(() => { load(from); }, [from, st.version, settings.net, load]);
  useFocusEffect(useCallback(() => { setCommon({ screen: 'A2' }); }, []));

  // Days shown: 3 from `from`; follow-up mode caps at until (build-spec-rules.md > Follow-up rule).
  const days = [0, 1, 2].map((i) => addDays(from, i)).filter((x) => !until || x <= until);
  const free = (x: string) => (slots ?? []).some((s) => dayOf(s.start) === x && !s.taken);
  useEffect(() => { if (slots) setDay(days.find(free) ?? days[0]); }, [slots]);
  const daySlots = (slots ?? []).filter((s) => dayOf(s.start) === day);
  const none = !!slots && !days.some(free);

  if (!d) return <Screen top={<NavigationBar leading="back" onLeading={() => router.back()} />}><Txt role="body/sm">{t('stub', lang)}</Txt></Screen>;

  const [feeK, waitK, areaK] = split('a2.facts', lang);
  const [noneT, noneL] = split('a2.nofree', lang);
  const [errT, errB] = split('err.load.t / b', lang);
  const pick = (start: string) => router.push({ pathname: '/home/confirm', params: { doctorId: d.id, start, mode, source: p.source ?? '', filter: p.filter ?? 'none', bookingId: p.bookingId ?? '' } });
  const facts: [string, string][] = [
    [feeK, mode === 'followUp' ? t('b4.fee.v', lang) : egp(d.fee, lang)],
    ...(d.waitMin ? [[waitK, waitValue(d.waitMin, lang)] as [string, string]] : []),
    ...(d.area ? [[areaK, d.area[lang]] as [string, string]] : []),
  ];

  return (
    <Screen top={<NavigationBar title={drName(d, lang)} leading="back" onLeading={() => router.back()} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/md') }}>
        {/* raw-ok: Avatar size is the kit enum 40 | 56 | 72, not a value */}
        <Avatar initials={initials(d)} size={72} />
        <View style={{ flex: 1 }}>
          <Txt role="heading/md" accessibilityRole="header">{drName(d, lang)}</Txt>
          <Txt role="body/sm" color="color/text/content/secondary/default">{d.title[lang]}</Txt>
          {ratingLine(d, lang) ? <Txt role="body/sm">{ratingLine(d, lang)}</Txt> : null}
          {mode === 'followUp' ? <Tag tone="success" label={t('a.fu.tag', lang)} /> : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm'), backgroundColor: th.t('color/surface/secondary/default') as string, borderRadius: th.t('radius/md'), paddingVertical: th.t('space/padding-y/sm'), paddingHorizontal: th.t('space/padding-x/md') }}>
        {facts.map(([k, v]) => <KeyValue key={k} k={k} v={v} />)}
      </View>

      <View style={{ gap: th.t('space/gap-y/xs') }}>
        <Txt role="heading/sm" accessibilityRole="header">{t('a2.time', lang)}</Txt>
        {offline && !slots ? (
          <Notice icon="wifi-slash" title={t('a2.offline', lang)} />
        ) : error ? (
          <Notice tone="critical" title={errT} body={errB}>
            <Button variant="link" label={t('err.retry', lang)} onPress={() => load(from)} testID="a2-retry" />
          </Notice>
        ) : !slots ? (
          <SkeletonGrid />
        ) : none ? (
          <View>
            <Txt role="body/sm" color="color/text/content/secondary/default" wrap>{noneT}</Txt>
            {!until || addDays(from, 3) <= until ? <Button variant="link" label={noneL} onPress={() => setFrom(addDays(from, 3))} full={false} testID="a2-next-days" /> : null}
          </View>
        ) : (
          <>
            {days.length > 1 ? (
              <SegmentedControl<string> value={day ?? days[0]} onChange={setDay} options={days.map((x) => ({ value: x, label: dayWord(x, now, lang) }))} />
            ) : null}
            <Txt role="caption" color="color/text/content/tertiary/default">{t('a2.hint', lang)}</Txt>
            <SlotGrid slots={daySlots.map((s) => ({ key: s.start, label: time(s.start, lang), taken: s.taken }))} onPick={pick} />
          </>
        )}
      </View>

      {mode === 'normal' && d.freeFollowUpDays ? <IconLine icon="calendar-check" color="color/icon/content/success/default" textColor="color/text/content/default" text={t('a2.fu', lang)} /> : null}
      {addrLine(d, lang) ? <IconLine icon="compass" text={addrLine(d, lang)!} /> : null}
    </Screen>
  );
}
