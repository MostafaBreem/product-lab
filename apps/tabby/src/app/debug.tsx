// Debug menu (build-spec.md > Debug menu). Long-press the Money title to open.
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { analytics, Button, fmt, ListGroup, ListRow, NavigationBar, Screen, SectionHeader, SegmentedControl, Txt, useTheme } from '@lab/app-kit';
import { TODAY } from '../domain/fixtures';
import type { PayResult } from '../domain/server';
import type { Scenario } from '../domain/types';
import { useStore } from '../state';
import { scheduleReminders } from '../ui/reminders';
import { useScreenLink } from '../ui/Inspector';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { useToast } from '@lab/app-kit';

export default function Debug() {
  const th = useTheme();
  const st = useStore();
  const { settings: x, setSettings, lang, setLang, scheme, setSchemePref } = st;
  const [, tick] = useState(0);
  const link = useScreenLink();
  const inspectTo = (v: boolean) => { st.setInspect(v); if (v) router.back(); };
  const toast = useToast();
  useEffect(() => analytics.subscribe(() => tick((n) => n + 1)), []);
  return (
    <Screen top={<NavigationBar title="Debug" leading="close" onLeading={() => router.back()} />} safeTop={false}>
      {Platform.OS === 'web' ? (
        <View>
          <SectionHeader title="Point at something" />
          <ListGroup>
            <ListRow title="Inspect" subtitle="Tap a part of the app to copy its name" selection={{ kind: 'switch', value: st.inspect, onChange: inspectTo }} onPress={() => inspectTo(!st.inspect)} />
            <ListRow title="Copy screen link" subtitle="Screen + scenario, language, theme" leading={{ kind: 'icon', icon: 'copy' }} onPress={async () => { await Clipboard.setStringAsync(link(st.lastHref ?? window.location.href)); toast({ tone: 'neutral', text: 'Copied' }); }} />
          </ListGroup>
        </View>
      ) : null}
      <Group title="Scenario"><SegmentedControl<Scenario> value={x.scenario} onChange={(v) => setSettings({ scenario: v })} options={[{ value: 'due', label: 'Due' }, { value: 'overdue', label: 'Overdue' }, { value: 'one-overdue', label: '1 late' }, { value: 'caught-up', label: 'Caught up' }]} /></Group>
      <Group title="Network"><SegmentedControl value={x.net} onChange={(v) => setSettings({ net: v })} options={[{ value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }]} /></Group>
      <Group title="Pay result"><SegmentedControl<PayResult> value={x.payResult} onChange={(v) => setSettings({ payResult: v })} options={[{ value: 'success', label: 'Success' }, { value: 'declined', label: 'Declined' }, { value: 'unknown', label: 'Unknown' }, { value: 'unknown-resolves', label: '→ 10 s' }]} /></Group>
      <Group title="Latency"><SegmentedControl value={x.latency} onChange={(v) => setSettings({ latency: v })} options={[{ value: 'fast', label: 'Fast' }, { value: 'normal', label: 'Normal' }, { value: 'slow', label: 'Slow 3 s' }]} /></Group>
      <Group title="Language · theme">
        <SegmentedControl value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
        <SegmentedControl value={scheme} onChange={(v) => setSchemePref(v)} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </Group>
      <Group title={`Mock clock · ${fmt.dayDate(x.today, 'en')}`}>
        <View style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm') }}>
          <Button full={false} label="+1 day" onPress={() => setSettings({ today: fmt.addDays(x.today, 1) })} />
          <Button full={false} variant="link" label="Reset" onPress={() => setSettings({ today: TODAY })} />
        </View>
      </Group>
      <Group title="Reminders">
        <Button variant="link" label="Fire due reminder in 5 s" onPress={() => fire('due')} />
        <Button variant="link" label="Fire salary reminder in 5 s" onPress={() => fire('salary')} />
        <Button variant="link" label="Reschedule all" onPress={() => scheduleReminders(st)} />
        <Button variant="link" label="Reset flags" onPress={() => st.setFlags({ firstPaymentDone: false, reminderAskShown: false, osPermission: 'notDetermined', dueReachedLogged: [] })} />
      </Group>
      <View>
        <SectionHeader title="Event log" />
        <ListGroup>{analytics.list().slice(0, 30).map((e, i) => <ListRow key={e.at + ':' + i} title={e.name} subtitle={JSON.stringify(e.props).slice(0, 80)} />)}</ListGroup>
      </View>
    </Screen>
  );
  async function fire(kind: 'due' | 'salary') {
    const s = st.s; const c = st.summary?.card;
    const amount = fmt.money(c?.amount ?? 31250, lang);
    await Notifications.scheduleNotificationAsync({
      content: kind === 'due' ? { title: s.rem.nDueTomorrow, body: s.rem.nBody(amount, (c?.items ?? []).map((i) => i.merchant.name[lang]).join(lang === 'ar' ? ' و' : ' and ')), data: { url: '/money', kind } }
        : { title: s.rem.nDueIn(fmt.days(8, lang)), body: s.rem.nSalaryBody(amount, fmt.dayDate(c?.dueDate ?? x.today, lang)), data: { url: '/money', kind } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
    }).catch((e) => console.warn(e));
  }
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const th = useTheme();
  return <View style={{ gap: th.t('space/gap-y/xs') }}><Txt role="label/md" color="color/text/content/secondary/default">{title}</Txt>{children}</View>;
}
