// Lab tools (debug, web only, user 2026-11-05): scenario, network, pay result, Comment mode, Reset flow, Copy screen link.
// Wide browser (frame page): a side panel beside the phone talks to the app in the iframe (app-kit useFrameBridge).
// Phone browser: scenario picker on every fresh open (skipped when the link names a scenario: boards, review links),
// then a long press anywhere opens the tools sheet. Native iOS keeps the Debug screen (long-press the Money title).
import * as Clipboard from 'expo-clipboard';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, inFrame, LabGroup as Group, LabPanel, ListGroup, ListRow, SegmentedControl, Txt, useFrameBridge, useTheme, useToast, type FramePanel } from '@lab/app-kit';
import type { PayResult, Settings } from '../domain/server';
import type { Scenario } from '../domain/types';
import { useStore } from '../state';
import { useFlows } from './flows';
import { useScreenLink } from './Inspector';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
/** Phone browser (not inside the frame page): long press opens the tools sheet. */
export const phoneWeb = isWeb && !inFrame;
// raw-ok: long-press timing and finger slop (interaction values, not design tokens).
const HOLD_MS = 600;
const SLOP = 10;
// raw-ok: stacking order above the app and the Comment overlay; not a design value.
const Z = 10001;
const toolTag = { dataSet: { labInspector: '1' } } as object;

type Tools = { scenario: Scenario; net: Settings['net']; payResult: PayResult; comment: boolean; link: string };
type Cmd = { set?: Partial<Pick<Settings, 'scenario' | 'net' | 'payResult'>>; comment?: boolean; reset?: true };

const SCENARIOS: { value: Scenario; label: string; hint: string }[] = [
  { value: 'due', label: 'Due', hint: 'Payments due soon, nothing late' },
  { value: 'overdue', label: 'Overdue', hint: 'Two payments late' },
  { value: 'one-overdue', label: '1 late', hint: 'One payment late' },
  { value: 'caught-up', label: 'Caught up', hint: 'Nothing due' },
];

/** The controls, shared by the side panel (frame page) and the sheet (phone browser). Debug tool: English only. */
function ToolsBody({ v, on, onCopy, copied }: { v: Tools; on: (c: Cmd) => void; onCopy: () => void; copied?: boolean }) {
  const th = useTheme();
  return (
    <View style={{ gap: th.t('space/gap-y/md') }}>
      <ListGroup>
        <ListRow title="Comment" subtitle="Tap a part to copy its name" selection={{ kind: 'switch', value: v.comment, onChange: (x) => on({ comment: x }) }} onPress={() => on({ comment: !v.comment })} />
      </ListGroup>
      <Group title="Scenario"><SegmentedControl<Scenario> value={v.scenario} onChange={(x) => on({ set: { scenario: x } })} options={SCENARIOS.map(({ value, label }) => ({ value, label }))} /></Group>
      <Group title="Network"><SegmentedControl value={v.net} onChange={(x) => on({ set: { net: x } })} options={[{ value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }]} /></Group>
      <Group title="Pay result"><SegmentedControl<PayResult> value={v.payResult} onChange={(x) => on({ set: { payResult: x } })} options={[{ value: 'success', label: 'Success' }, { value: 'declined', label: 'Declined' }, { value: 'unknown', label: 'Unknown' }]} /></Group>
      <ListGroup>
        <ListRow title="Reset flow" subtitle="Same scenario, fresh data" leading={{ kind: 'icon', icon: 'arrows-clockwise' }} onPress={() => on({ reset: true })} />
        <ListRow title={copied ? 'Copied' : 'Copy screen link'} subtitle="Screen, scenario, language" leading={{ kind: 'icon', icon: 'copy' }} onPress={onCopy} />
      </ListGroup>
    </View>
  );
}

/** App side: run a tools command (both surfaces). Reset flow = close sheets, fresh data, first screen of the current tab. */
function useRunCmd() {
  const st = useStore();
  const flows = useFlows();
  const path = usePathname();
  return (c: Cmd) => {
    if (c.set) st.setSettings(c.set);
    if (c.comment !== undefined) st.setInspect(c.comment);
    if (c.reset) {
      flows.closeAll();
      st.resetData();
      const root = '/' + (path.split('/').filter(Boolean)[0] ?? 'money');
      if (router.canDismiss()) router.dismissAll();
      router.replace((root === '/debug' ? '/money' : root) as never);
    }
  };
}

function useTools(): Tools {
  const st = useStore();
  const link = useScreenLink();
  return { scenario: st.settings.scenario, net: st.settings.net, payResult: st.settings.payResult, comment: st.inspect, link: isWeb ? link(window.location.href) : '' };
}

/** Inside the iframe: report tool state to the frame page, run its commands. Renders nothing. */
export function LabBridge() {
  const tools = useTools();
  const run = useRunCmd();
  useFrameBridge<Tools, Cmd>(tools, run);
  return null;
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

/** Phone browser: scenario picker on open, long press anywhere opens the tools sheet. */
export function MobileTools() {
  const st = useStore();
  const toast = useToast();
  const tools = useTools();
  const run = useRunCmd();
  const named = isWeb && new URLSearchParams(window.location.search).has('scenario');
  const [pick, setPick] = useState(phoneWeb && !named);
  const [sheet, setSheet] = useState(false);
  const eat = useRef(0);
  useEffect(() => {
    if (!phoneWeb) return;
    // No text selection or iOS callout on a long press (it would cover the sheet).
    const b = document.body.style as CSSStyleDeclaration & { webkitTouchCallout?: string };
    b.userSelect = 'none'; b.webkitUserSelect = 'none'; b.webkitTouchCallout = 'none';
    let timer: ReturnType<typeof setTimeout> | null = null; let x0 = 0; let y0 = 0;
    const own = (e: Event) => !!(e.target as HTMLElement).closest?.('[data-lab-inspector]');
    const stop = () => { if (timer) clearTimeout(timer); timer = null; };
    const down = (e: PointerEvent) => {
      if (own(e)) return;
      x0 = e.clientX; y0 = e.clientY; stop();
      timer = setTimeout(() => { timer = null; eat.current = Date.now(); setSheet(true); }, HOLD_MS);
    };
    const move = (e: PointerEvent) => { if (timer && Math.hypot(e.clientX - x0, e.clientY - y0) > SLOP) stop(); };
    // The release after a long press must not also tap the part under the finger.
    const click = (e: Event) => { if (Date.now() - eat.current < 1000 && !own(e)) { e.stopPropagation(); e.preventDefault(); eat.current = 0; } };
    const menu = (e: Event) => e.preventDefault();
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointermove', move, true);
    ['pointerup', 'pointercancel'].forEach((t) => document.addEventListener(t, stop, true));
    document.addEventListener('click', click, true);
    document.addEventListener('contextmenu', menu, true);
    return () => {
      stop();
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('pointermove', move, true);
      ['pointerup', 'pointercancel'].forEach((t) => document.removeEventListener(t, stop, true));
      document.removeEventListener('click', click, true);
      document.removeEventListener('contextmenu', menu, true);
    };
  }, []);
  if (!phoneWeb) return null;
  const copy = async () => { await Clipboard.setStringAsync(tools.link); toast({ tone: 'neutral', text: 'Copied' }); };
  return (
    <>
      {pick ? <ScenarioPicker value={st.settings.scenario} onStart={(s) => { if (s !== st.settings.scenario) st.setSettings({ scenario: s }); setPick(false); }} /> : null}
      {/* Mounted on open so its layer is added last, above any app sheet already open. */}
      {sheet ? <BottomSheet visible onClose={() => setSheet(false)} title="Lab tools">
        <View {...toolTag}>
          <ToolsBody v={tools} on={(c) => { run(c); if (c.comment !== undefined || c.reset) setSheet(false); }} onCopy={copy} />
        </View>
      </BottomSheet> : null}
    </>
  );
}

/** Before the app: pick a scenario. Full screen, above the app. */
function ScenarioPicker({ value, onStart }: { value: Scenario; onStart: (s: Scenario) => void }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const [s, setS] = useState(value);
  const fixed = { position: 'fixed' } as object;
  return (
    <View {...toolTag} style={[fixed, { top: 0, left: 0, right: 0, bottom: 0, zIndex: Z, backgroundColor: th.t('color/bg/default') as string, paddingTop: insets.top + th.t('space/padding-top/xl'), paddingBottom: insets.bottom + th.t('space/padding-y/md'), paddingHorizontal: th.t('space/margin/md'), gap: th.t('space/gap-y/lg') }]}>
      <View style={{ gap: th.t('space/gap-y/xs') }}>
        <Txt role="heading/lg">Pick a scenario</Txt>
        <Txt role="body/md" color="color/text/content/secondary/default">Sample data for this visit. Long-press anywhere later to change it or turn on Comment.</Txt>
      </View>
      <ListGroup>
        {SCENARIOS.map((x) => <ListRow key={x.value} title={x.label} subtitle={x.hint} selection={{ kind: 'radio', selected: s === x.value }} onPress={() => setS(x.value)} />)}
      </ListGroup>
      <View style={{ flex: 1 }} />
      <Button label="Start" onPress={() => onStart(s)} />
    </View>
  );
}
