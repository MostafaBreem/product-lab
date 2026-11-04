// Inspect mode (web only, debug tool, user 2026-11-04): tap any part of the app to name it, Copy puts
// "<screen> › <section> › <component> \"<label>\" (<state>)" + the screen link on the clipboard. Kit components tag
// themselves with data-lab (app-kit lab()). While on, taps never reach the app.
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Icon, Txt, useTheme, useToast } from '@lab/app-kit';
import { useStore } from '../state';

const NAMES: Record<string, string> = { ListRow: 'List row', ListGroup: 'List group', SectionHeader: 'Section header', SegmentedControl: 'Segmented control', NavigationBar: 'Navigation bar', PaymentCard: 'Payment card', KeyValue: 'Key-value pair', TabBar: 'Tab bar' };
// raw-ok: stacking order above every app layer (sheets, toasts); not a design value.
const Z = 10000;
type Pick = { x: number; y: number; w: number; h: number; name: string; label: string; state: string; path: string };

const visible = (e: Element) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
/** Screen title: first visible Navigation bar or Header label. Section: last visible Section header above the element. */
function describe(el: HTMLElement): Pick | null {
  const c = el.closest('[data-lab]') as HTMLElement | null;
  if (!c) return null;
  const r = c.getBoundingClientRect();
  const all = Array.from(document.querySelectorAll('[data-lab]')).filter(visible) as HTMLElement[];
  const screen = all.find((e) => (e.dataset.lab === 'NavigationBar' || e.dataset.lab === 'Header') && e.dataset.labLabel)?.dataset.labLabel ?? '';
  const sec = all.filter((e) => e.dataset.lab === 'SectionHeader' && e !== c && e.getBoundingClientRect().bottom <= r.top + 1 && (e.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING)).pop()?.dataset.labLabel ?? '';
  const name = NAMES[c.dataset.lab!] ?? c.dataset.lab!;
  return { x: r.left, y: r.top, w: r.width, h: r.height, name, label: c.dataset.labLabel ?? '', state: c.dataset.labState ?? '', path: [screen, sec].filter(Boolean).join(' › ') };
}

/** Screen link with the state that shapes it: scenario, language, theme (+ network, pay result when not default). */
export function useScreenLink() {
  const { settings, lang, scheme } = useStore();
  return (href = Platform.OS === 'web' ? window.location.href : '') => {
    const u = new URL(href);
    const q = new URLSearchParams({ scenario: settings.scenario, lang, scheme });
    if (settings.net !== 'online') q.set('net', settings.net);
    if (settings.payResult !== 'success') q.set('pay', settings.payResult);
    return `${u.origin}${u.pathname}?${q}`;
  };
}

export function Inspector() {
  const th = useTheme();
  const st = useStore();
  const toast = useToast();
  const link = useScreenLink();
  const [pick, setPick] = useState<Pick | null>(null);
  const [cardH, setCardH] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'web' || !st.inspect) { setPick(null); return; }
    const own = (e: Event) => !!(e.target as HTMLElement).closest?.('[data-lab-inspector]');
    const block = (e: Event) => { if (own(e)) return; e.stopPropagation(); e.preventDefault(); };
    const down = (e: Event) => { if (own(e)) return; block(e); setPick(describe(e.target as HTMLElement)); };
    const types = ['pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click'];
    document.addEventListener('pointerdown', down, true);
    types.forEach((t) => document.addEventListener(t, block, true));
    return () => { document.removeEventListener('pointerdown', down, true); types.forEach((t) => document.removeEventListener(t, block, true)); };
  }, [st.inspect]);
  if (Platform.OS !== 'web' || !st.inspect) return null;
  const line = pick ? `${[pick.path, `${pick.name}${pick.label ? ` "${pick.label}"` : ''}`].filter(Boolean).join(' › ')}${pick.state ? ` (${pick.state})` : ''}` : '';
  const copy = async () => { await Clipboard.setStringAsync(`${line}\n${link()}`); toast({ tone: 'neutral', text: 'Copied' }); };
  const inspectorTag = { dataSet: { labInspector: '1' } } as object;
  // Overlay is fixed to the browser window; rect values come from the tapped element, not design values.
  const fixed = { position: 'fixed' } as object;
  // Label under the component; flips above it when it would leave the window.
  const gap = th.t('space/gap-y/xs');
  const below = pick ? (pick.y + pick.h + gap + cardH > window.innerHeight ? Math.max(gap, pick.y - gap - cardH) : pick.y + pick.h + gap) : 0;
  return (
    <View pointerEvents="box-none" style={[fixed, { top: 0, left: 0, right: 0, bottom: 0, zIndex: Z }]}>
      {pick ? (
        <View pointerEvents="none" style={[fixed, { left: pick.x, top: pick.y, width: pick.w, height: pick.h, borderWidth: th.t('border-width/md'), borderColor: th.t('color/border/info/default') as string }]}>
          <View style={{ flex: 1, backgroundColor: th.t('color/surface/info/default') as string, opacity: th.t('opacity/subtle') as number }} />
        </View>
      ) : null}
      {pick ? (
        <View {...inspectorTag} onLayout={(e) => setCardH(e.nativeEvent.layout.height)} style={[fixed, { left: th.t('space/margin/md'), right: th.t('space/margin/md'), top: below, flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm'), padding: th.t('space/padding/sm'), borderRadius: th.t('radius/md'), backgroundColor: th.t('color/surface/inverse/default') as string }]}>
          <Icon name="crosshair" size={th.t('size/icon/sm')} color="color/icon/content/inverse/default" />
          <View style={{ flex: 1 }}>
            <Txt role="label/md" color="color/text/content/inverse/default" numberOfLines={1}>{`${pick.name}${pick.label ? ` · "${pick.label}"` : ''}`}</Txt>
            <Txt role="caption" color="color/text/content/inverse/default" numberOfLines={2}>{[pick.path, pick.state].filter(Boolean).join(' · ')}</Txt>
          </View>
          <Pressable onPress={copy} style={{ paddingHorizontal: th.t('space/padding-x/sm'), paddingVertical: th.t('space/padding-y/2xs'), borderRadius: th.t('radius/sm'), backgroundColor: th.t('color/fill/info/default') as string }}>
            <Txt role="label/md" color="color/text/on-fill/info/default">Copy</Txt>
          </Pressable>
        </View>
      ) : null}
      <Pressable {...inspectorTag} onPress={() => st.setInspect(false)} style={[fixed, { top: th.t('space/padding-top/xs'), alignSelf: 'center', left: 0, right: 0, alignItems: 'center' }]}>
        <View style={{ paddingHorizontal: th.t('space/padding-x/sm'), paddingVertical: th.t('space/padding-y/2xs'), borderRadius: th.t('radius/full'), backgroundColor: th.t('color/surface/inverse/default') as string }}>
          <Txt role="caption" color="color/text/content/inverse/default">Inspect on · tap anything · tap here to stop</Txt>
        </View>
      </Pressable>
    </View>
  );
}
