// A1 Dentist results (+ A1b general filter). Mock book-dentist-en-v2 A1 / A1b; states build-spec-screens.md > Flow A.
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Avatar, Button, Card, Chip, NavigationBar, Notice, Screen, Tag, Txt, useTheme, useToast } from '@lab/app-kit';
import { ev, setCommon } from '../../../domain/analytics';
import { nextSlot } from '../../../domain/derive';
import { plural, egp } from '../../../domain/format';
import { api, now as serverNow } from '../../../domain/server';
import { split, t } from '../../../domain/strings';
import { dayOf } from '../../../domain/time';
import type { Doctor, Local, Source } from '../../../domain/types';
import { KV, SkeletonCard } from '../../../ui/patterns';
import { cacheAge, drName, initials, nextLine, placeLine, ratingLine, waitValue } from '../../../ui/text';
import { useStore } from '../../../state';

type Filter = 'general' | 'none';
type Row = { doctor: Doctor; next?: Local };
type Data = { rows: Row[]; count: number; at: Local };
// Last good list per filter (offline shows it under the cache Notice).
const cache = new Map<Filter, Data>();

async function fetchRows(filter: Filter): Promise<Data> {
  const r = await api.doctors('toothache', filter === 'general' ? 'general' : undefined);
  const from = dayOf(serverNow());
  const rows = await Promise.all(r.doctors.map(async (d) => {
    // nextSlot over 7 days (guess: spec gives no window for "Next").
    const slots = await api.slots(d.id, from, 7);
    return { doctor: d, next: nextSlot(slots, serverNow())?.start };
  }));
  return { rows, count: r.count, at: serverNow() };
}

export default function Results() {
  const st = useStore();
  const { lang, settings } = st;
  const th = useTheme();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('none');
  const [data, setData] = useState<Data>();
  const [error, setError] = useState<string>();
  const [stale, setStale] = useState(false);
  const shownFor = useRef<string>('');

  const load = useCallback(async (f: Filter) => {
    setError(undefined); setStale(false);
    const c = cache.get(f);
    setData(c);
    try { const d = await fetchRows(f); cache.set(f, d); setData(d); }
    catch (e) { const code = (e as { code?: string }).code ?? 'server'; if (c) setStale(true); else { setData(undefined); setError(code); } }
  }, []);
  useEffect(() => { load(filter); }, [filter, st.version, settings.net]);
  useFocusEffect(useCallback(() => { setCommon({ screen: 'A1' }); }, []));

  const loaded = !!data && !error;
  const notsureVisible = loaded && filter === 'none';
  useEffect(() => {
    // notsure_row_shown once per time the row appears (per load of the unfiltered list).
    if (notsureVisible && shownFor.current !== data!.at) { shownFor.current = data!.at; ev.notsureRowShown(); }
  }, [notsureVisible, data]);

  const stub = () => toast({ tone: 'neutral', text: t('stub', lang) });
  const tapNotSure = () => { ev.notsureTapped(); setFilter('general'); };
  const open = (d: Doctor, source: Source) => router.push({ pathname: '/home/doctor/[id]', params: { id: d.id, source, filter, mode: 'normal' } });

  const [ctxQ, ...ctxRest] = split('a.ctx', lang);
  const [sortL, filterL] = split('a.sort / filter', lang);
  const [feeK, waitK] = split('a2.facts', lang);
  const [emptyT, emptyL] = split('a1.empty', lang);
  const [errT, errB] = split('err.load.t / b', lang);

  return (
    <Screen top={<NavigationBar title={t('a.nav', lang)} />} gap={th.t('space/gap-y/md')}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm') }}>
        <View style={{ flex: 1 }}>
          <Txt role="label/lg">{ctxQ}</Txt>
          <Txt role="body/sm" color="color/text/content/secondary/default">{ctxRest.join(' · ')}</Txt>
        </View>
        <Button variant="link" label={t('a.change', lang)} onPress={stub} full={false} />
      </Card>

      {stale && data ? <Notice icon="wifi-slash" title={t('off.cache', lang).replace('{time}', cacheAge(data.at, serverNow(), lang))} /> : null}

      {notsureVisible ? (
        <Notice tone="brand" title={t('a.notsure.t', lang)} body={t('a.notsure.b', lang)}>
          <Button variant="link" label={t('a.notsure.l', lang)} onPress={tapNotSure} testID="notsure-show" />
        </Notice>
      ) : null}
      {filter === 'general' ? (
        <View style={{ flexDirection: 'row' }}>
          <Chip label={t('a.chip.gen', lang)} icon="x" onPress={() => setFilter('none')} />
        </View>
      ) : null}

      {loaded ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/xs') }}>
          <Txt role="body/sm" color="color/text/content/secondary/default" numberOfLines={1} style={{ flex: 1 }}>
            {filter === 'general' ? t('a.count.gen', lang) : plural(data!.count, 'dentists', lang)}
          </Txt>
          <Chip label={sortL} onPress={stub} />
          <Chip label={filterL} onPress={stub} />
        </View>
      ) : null}

      {!data && !error ? (
        <><SkeletonCard /><SkeletonCard /></>
      ) : error ? (
        <Notice tone="critical" title={errT} body={errB}>
          <Button variant="link" label={t('err.retry', lang)} onPress={() => load(filter)} testID="a1-retry" />
        </Notice>
      ) : data!.rows.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Txt role="body/sm" color="color/text/content/secondary/default" align="center">{emptyT}</Txt>
          {filter === 'general' ? <Button variant="link" label={emptyL} onPress={() => setFilter('none')} full={false} /> : null}
        </Card>
      ) : (
        data!.rows.map(({ doctor: d, next }) => (
          <Card key={d.id} style={{ gap: th.t('space/gap-y/md') }}>
            <Pressable onPress={() => open(d, 'results_card')} accessibilityRole="button" testID={`card-${d.id}`} style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm') }}>
              {/* raw-ok: Avatar size is the kit enum 40 | 56 | 72, not a value */}
              <Avatar initials={initials(d, lang)} size={56} />
              <View style={{ flex: 1 }}>
                <Txt role="label/lg">{drName(d, lang)}</Txt>
                <Txt role="body/sm" color="color/text/content/secondary/default">{d.title[lang]}</Txt>
                {ratingLine(d, lang) ? <Txt role="body/sm">{ratingLine(d, lang)}</Txt> : null}
              </View>
            </Pressable>
            {d.badges.includes('goodListener') ? <Tag label={t('a.badge', lang)} /> : null}
            {d.freeFollowUpDays ? <Tag tone="success" label={t('a.fu.tag', lang)} /> : null}
            <View style={{ gap: th.t('space/gap-y/xs') }}>
              {/* No leading icons (mock A1): rows align with the tag and the Next line. */}
              <KV k={feeK} v={egp(d.fee, lang)} />
              {d.waitMin ? <KV k={waitK} v={waitValue(d.waitMin, lang)} /> : null}
              {placeLine(d, lang) ? <KV v={placeLine(d, lang)!} /> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: th.t('space/gap-x/sm') }}>
              <Txt role="body/sm" color="color/text/content/secondary/default" style={{ flex: 1 }}>{next ? nextLine(next, serverNow(), lang) : ''}</Txt>
              <View><Button label={t('a.book', lang)} onPress={() => open(d, 'results_book')} full={false} testID={`book-${d.id}`} /></View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
