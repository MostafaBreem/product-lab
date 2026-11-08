// Debug menu (build-spec-data.md > Debug menu). Long-press the Appointments title to open. Dev tool: labels are not product copy.
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, ListGroup, ListRow, NavigationBar, Screen, SectionHeader, SegmentedControl, Txt, useTheme, useToast } from '@lab/app-kit';
import { ev } from '../domain/analytics';
import { followUpUntil, isCancelled, prompts } from '../domain/derive';
import { pushText } from '../domain/push';
import { allBookings } from '../domain/server';
import { doctor } from '../domain/fixtures';
import { dayTime } from '../domain/format';
import type { ClockPreset } from '../domain/types';
import { drName } from '../ui/text';
import { firePush, useStore } from '../state';

type EventType = 'confirmed' | 'moved' | 'cancelled';

export default function Debug() {
  const th = useTheme();
  const st = useStore();
  const toast = useToast();
  const { settings: x, setSettings, lang, setLang } = st;
  const [evType, setEvType] = useState<EventType>('confirmed');
  const targets = (st.bookings ?? []).filter((b) => !isCancelled(b) && b.start >= x.now).sort((a, b) => a.start.localeCompare(b.start));

  /** Reminder in 5 s: iOS local notification (TIME_INTERVAL); web = in-app banner (NotifyHost). Copy b5.4 / b5.5 with the current prompt's doctor. */
  const fire = (kind: 'followUp' | 'nextVisit') => {
    const p = prompts(st.bookings ?? [], x.now).find((q) => q.type === kind);
    if (!p) { toast({ tone: 'neutral', text: `No ${kind} prompt at this clock` }); return; }
    const type = kind === 'followUp' ? 'followup_open' : 'next_visit_4w';
    const r = { type, key: `debug:${type}`, fireAt: x.now, doctorId: p.doctorId, bookingId: p.visitId } as const;
    if (Platform.OS !== 'web') {
      const bs = allBookings();
      const visit = bs.find((b) => b.id === p.visitId);
      const text = pushText(r, bs, lang, kind === 'followUp' && visit ? followUpUntil(visit) : undefined);
      Notifications.scheduleNotificationAsync({ content: { title: text.title, body: text.body, data: { type, bookingId: p.visitId, doctorId: p.doctorId } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 } }).catch((e) => console.warn(e));
      setTimeout(() => ev.reminderSent({ type }), 5000);
    } else setTimeout(() => { ev.reminderSent({ type }); firePush(r); }, 5000);
  };

  return (
    <Screen top={<NavigationBar title="Debug" leading="close" onLeading={() => router.back()} />} safeTop={false}>
      <Group title={`Mock clock · ${dayTime(x.now, 'en')}`}>
        <SegmentedControl<ClockPreset> value={x.preset} onChange={st.setPreset} options={[{ value: 'sun8', label: 'Sun 8 · 6 PM' }, { value: 'mon9', label: 'Mon 9 · 10 AM' }, { value: 'fri27', label: 'Fri 27 · 10 AM' }]} />
        <Button full={false} variant="link" align="start" label="Advance 1 day" onPress={st.advanceDay} testID="dbg-advance" />
      </Group>
      <View>
        <SectionHeader title="Clinic event on a booking" />
        <View style={{ gap: th.t('space/gap-y/xs') }}>
          <SegmentedControl<EventType> value={evType} onChange={setEvType} options={[{ value: 'confirmed', label: 'Confirm tomorrow' }, { value: 'moved', label: 'Move' }, { value: 'cancelled', label: 'Cancel' }]} />
          <ListGroup>
            {targets.map((b) => {
              const d = doctor(b.doctorId);
              return <ListRow key={b.id} title={d ? drName(d, 'en') : b.doctorId} subtitle={`${dayTime(b.start, 'en')} · ${b.status}`} chevron onPress={() => { st.clinicEvent(b.id, evType); toast({ tone: 'neutral', text: `${evType}: ${b.id}` }); }} testID={`dbg-ev-${b.id}`} />;
            })}
          </ListGroup>
        </View>
      </View>
      <ListGroup>
        <ListRow title="Next POST /bookings = slotTaken" selection={{ kind: 'switch', value: x.nextBookingSlotTaken, onChange: (v) => setSettings({ nextBookingSlotTaken: v }) }} onPress={() => setSettings({ nextBookingSlotTaken: !x.nextBookingSlotTaken })} />
      </ListGroup>
      <Group title="Network"><SegmentedControl value={x.net} onChange={(v) => setSettings({ net: v })} options={[{ value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }]} /></Group>
      <Group title="Latency"><SegmentedControl value={x.latency} onChange={(v) => setSettings({ latency: v })} options={[{ value: 'fast', label: 'Fast' }, { value: 'normal', label: 'Normal' }, { value: 'slow', label: 'Slow 3 s' }]} /></Group>
      <Group title="Fire reminder in 5 s">
        <Button variant="link" align="start" label="Follow-up" onPress={() => fire('followUp')} testID="dbg-rem-fu" />
        <Button variant="link" align="start" label="Next visit" onPress={() => fire('nextVisit')} testID="dbg-rem-next" />
      </Group>
      <Group title="Language"><SegmentedControl value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} /></Group>
      <Button variant="link" tone="critical" label="Reset store" onPress={() => { st.resetStore(); toast({ tone: 'neutral', text: 'Store reset' }); }} testID="dbg-reset" />
      <View>
        <SectionHeader title={`Event log (${st.events.length})`} />
        <ListGroup>{st.events.slice(0, 50).map((e, i) => <ListRow key={i} title={e.name} subtitle={JSON.stringify(e.props).slice(0, 120)} />)}</ListGroup>
      </View>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const th = useTheme();
  return <View style={{ gap: th.t('space/gap-y/xs') }}><Txt role="label/md" color="color/text/content/secondary/default">{title}</Txt>{children}</View>;
}
