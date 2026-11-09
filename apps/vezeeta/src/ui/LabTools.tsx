// Lab tools (debug, web only; same as Tabby's panel, user 2026-11-09 "same previewed as tabby to judge"). Debug tool: English only.
// Wide browser (frame page): a side panel beside the phone talks to the app in the iframe (app-kit useFrameBridge).
// Under 500 px there is no panel (no frame page); the long-press Appointments title still opens the Debug screen.
import * as Clipboard from 'expo-clipboard';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useReducer, useState } from 'react';
import { Platform, View } from 'react-native';
import { CommentMode, LabGroup as Group, LabPanel, ListGroup, ListRow, SegmentedControl, useFrameBridge, useTheme, type FramePanel } from '@lab/app-kit';
import { isCancelled } from '../domain/derive';
import { getSettings, onServerChange, type Settings } from '../domain/server';
import type { ClockPreset } from '../domain/types';
import { useStore } from '../state';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
type BookResult = 'success' | 'slotTaken' | 'error';
type ClinicType = 'confirmed' | 'moved' | 'cancelled';
type Tools = { preset: ClockPreset; net: Settings['net']; book: BookResult; comment: boolean; link: string; hasNext: boolean };
type Cmd = { preset?: ClockPreset; net?: Settings['net']; book?: BookResult; clinic?: ClinicType; comment?: boolean; reset?: true };

const PRESETS: { value: ClockPreset; label: string }[] = [
  { value: 'sun8', label: 'Sun 8 Nov · book' },
  { value: 'mon9', label: 'Mon 9 Nov · appointments' },
  { value: 'fri27', label: 'Fri 27 Nov · empty' },
];
/** Scenario jumps to its tab: sun8 = booking (Home), mon9 / fri27 = Appointments. */
const TAB: Record<ClockPreset, string> = { sun8: '/home', mon9: '/appointments', fri27: '/appointments' };

function ToolsBody({ v, on, onCopy, copied }: { v: Tools; on: (c: Cmd) => void; onCopy: () => void; copied?: boolean }) {
  const th = useTheme();
  return (
    <View style={{ gap: th.t('space/gap-y/md') }}>
      <ListGroup>
        <ListRow title="Comment" subtitle="Tap a part to copy its name" selection={{ kind: 'switch', value: v.comment, onChange: (x) => on({ comment: x }) }} onPress={() => on({ comment: !v.comment })} />
      </ListGroup>
      <Group title="Scenario">
        <ListGroup>
          {PRESETS.map((x) => <ListRow key={x.value} title={x.label} selection={{ kind: 'radio', selected: v.preset === x.value }} onPress={() => on({ preset: x.value })} />)}
        </ListGroup>
      </Group>
      <Group title={v.hasNext ? 'Clinic update · next booking' : 'Clinic update · no upcoming booking'}>
        <SegmentedControl<ClinicType | ''> value="" onChange={(x) => { if (x) on({ clinic: x }); }} options={[{ value: 'confirmed', label: 'Confirm' }, { value: 'moved', label: 'Move' }, { value: 'cancelled', label: 'Cancel' }]} />
      </Group>
      <Group title="Network"><SegmentedControl value={v.net} onChange={(x) => on({ net: x })} options={[{ value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }]} /></Group>
      <Group title="Booking result · next Book"><SegmentedControl<BookResult> value={v.book} onChange={(x) => on({ book: x })} options={[{ value: 'success', label: 'Success' }, { value: 'slotTaken', label: 'Slot taken' }, { value: 'error', label: 'Error' }]} /></Group>
      <ListGroup>
        <ListRow title="Reset flow" subtitle="Same scenario, fresh data" leading={{ kind: 'icon', icon: 'arrows-clockwise' }} onPress={() => on({ reset: true })} />
        <ListRow title={copied ? 'Copied' : 'Copy screen link'} subtitle="Screen, scenario, language" leading={{ kind: 'icon', icon: 'copy' }} onPress={onCopy} />
      </ListGroup>
    </View>
  );
}

/** Screen link: current route under the Pages base + preset, language, theme. */
function useScreenLink() {
  const { settings, lang, scheme } = useStore();
  return (href = isWeb ? window.location.href : '') => {
    const u = new URL(href);
    return `${u.origin}${u.pathname}?${new URLSearchParams({ preset: settings.preset, lang, scheme })}`;
  };
}

const nextBooking = (st: ReturnType<typeof useStore>) =>
  (st.bookings ?? []).filter((b) => !isCancelled(b) && b.start >= st.settings.now).sort((a, b) => a.start.localeCompare(b.start))[0];

/** Mock server one-shots live in the server module (cleared on use): re-read them on every server change. */
function useBookResult(): BookResult {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => onServerChange(() => bump()), []);
  const s = getSettings();
  return s.nextBookingSlotTaken ? 'slotTaken' : s.nextBookingError ? 'error' : 'success';
}

function useRunCmd() {
  const st = useStore();
  const path = usePathname();
  const tabRoot = () => { const r = '/' + (path.split('/').filter(Boolean)[0] ?? 'home'); return r === '/debug' || r === '/reminders' ? '/home' : r; };
  const go = (to: string) => { if (router.canDismiss()) router.dismissAll(); router.replace(to as never); };
  return (c: Cmd) => {
    if (c.comment !== undefined) st.setInspect(c.comment);
    if (c.net) st.setSettings({ net: c.net });
    if (c.book) st.setSettings({ nextBookingSlotTaken: c.book === 'slotTaken', nextBookingError: c.book === 'error' });
    if (c.preset) { if (c.preset !== st.settings.preset) st.setPreset(c.preset); go(TAB[c.preset]); }
    if (c.clinic) { const b = nextBooking(st); if (b) st.clinicEvent(b.id, c.clinic); }
    if (c.reset) {
      const p = st.settings.preset; const root = tabRoot();
      st.setInspect(false);
      st.resetStore();
      st.setPreset(p);
      go(root);
    }
  };
}

function useTools(): Tools {
  const st = useStore();
  const link = useScreenLink();
  const book = useBookResult();
  usePathname(); // re-render on route change so the link follows the screen
  return { preset: st.settings.preset, net: st.settings.net, book, comment: st.inspect, link: isWeb ? link() : '', hasNext: !!nextBooking(st) };
}

/** Inside the iframe: report tool state to the frame page, run its commands; Comment mode overlay. */
export function LabBridge() {
  const st = useStore();
  const link = useScreenLink();
  useFrameBridge<Tools, Cmd>(useTools(), useRunCmd());
  return <CommentMode on={st.inspect} onStop={() => st.setInspect(false)} link={() => link()} copy={Clipboard.setStringAsync} />;
}

/** Frame page side panel (parent window, no store): shows the app's last state, sends commands into the iframe. */
export const LabFramePanel: FramePanel = ({ data, send }) => <FramePanelView v={data as Tools | undefined} send={send} />;

function FramePanelView({ v, send }: { v?: Tools; send: (c: unknown) => void }) {
  const [copied, setCopied] = useState(false);
  if (!v) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(v.link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard refused: nothing to show */ }
  };
  return (
    <LabPanel>
      <ToolsBody v={v} on={send} onCopy={copy} copied={copied} />
    </LabPanel>
  );
}
