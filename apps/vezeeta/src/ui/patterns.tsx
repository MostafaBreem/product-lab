// Screen patterns (components/screen-patterns.md; build-spec.md > Kit work "pattern, not kit"). Tokens only.
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, View } from 'react-native';
import { Bar, Card, Icon, KeyValue, Txt, useTheme, type IconName } from '@lab/app-kit';
import type { TokenKey } from '@lab/app-kit';

/** Key-value with leading icon (icon 20 + key + value on one line, mock A1 card). */
export function IconKV({ icon, k, v }: { icon: IconName; k?: string; v: string }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/xs') }}>
      <Icon name={icon} size={th.t('size/icon/xs')} color="color/icon/content/tertiary/default" />
      {k ? <Txt role="body/sm" color="color/text/content/secondary/default">{k}</Txt> : null}
      <Txt role="body/sm" style={{ flexShrink: 1 }}>{v}</Txt>
    </View>
  );
}

/** Icon + wrapping line (A2 follow-up row, address row). */
export function IconLine({ icon, text, color = 'color/icon/content/tertiary/default', textColor = 'color/text/content/secondary/default' }: { icon: IconName; text: string; color?: TokenKey; textColor?: TokenKey }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: th.t('space/gap-x/xs') }}>
      <Icon name={icon} size={th.t('size/icon/sm')} color={color} />
      <Txt role="body/sm" wrap color={textColor} style={{ flex: 1 }}>{text}</Txt>
    </View>
  );
}

/** Skeleton doctor card: same blocks and gaps as the loaded card (static, no shimmer). */
export function SkeletonCard() {
  const th = useTheme();
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm') }}>
        <Bar w={th.t('size/height/lg')} h={th.t('size/height/lg')} r={th.t('radius/full')} />
        <View style={{ flex: 1, gap: th.t('space/gap-y/2xs') }}><Bar w="60%" /><Bar w="80%" /><Bar w="40%" /></View>
      </View>
      <View style={{ gap: th.t('space/gap-y/xs') }}><Bar w="50%" /><Bar w="50%" /><Bar w="70%" /></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Bar w="40%" /><Bar w={th.t('size/height/xl')} h={th.t('size/height/md')} r={th.t('radius/md')} /></View>
    </Card>
  );
}

const rows = <T,>(xs: T[], n: number) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

/** Slot grid: 3 columns, 48 cells, taken = disabled + struck label. Fills in reading order (right to left in AR). */
export function SlotGrid({ slots, onPick }: { slots: { key: string; label: string; taken: boolean }[]; onPick: (key: string) => void }) {
  const th = useTheme();
  return (
    <View style={{ gap: th.t('space/gap-y/xs') }}>
      {rows(slots, 3).map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: th.t('space/gap-x/xs') }}>
          {[0, 1, 2].map((j) => {
            const s = r[j];
            if (!s) return <View key={j} style={{ flex: 1 }} />;
            return (
              <Pressable key={s.key} disabled={s.taken} onPress={() => onPick(s.key)} accessibilityRole="button" accessibilityState={{ disabled: s.taken }} testID={`slot-${s.key}`}
                style={({ pressed }) => ({ flex: 1, height: th.t('size/height/md'), borderRadius: th.t('radius/md'), alignItems: 'center', justifyContent: 'center',
                  backgroundColor: th.t(s.taken ? 'color/fill/disabled' : pressed ? 'color/fill/active' : 'color/fill/default') as string })}>
                <Txt role="label/lg" color={s.taken ? 'color/text/content/disabled' : 'color/text/content/default'} style={s.taken ? { textDecorationLine: 'line-through' } : undefined}>{s.label}</Txt>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Skeleton slot grid (2 rows). */
export function SkeletonGrid() {
  const th = useTheme();
  return (
    <View style={{ gap: th.t('space/gap-y/xs') }}>
      {[0, 1].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: th.t('space/gap-x/xs') }}>
          {[0, 1, 2].map((j) => <View key={j} style={{ flex: 1 }}><Bar w="100%" h={th.t('size/height/md')} r={th.t('radius/md')} /></View>)}
        </View>
      ))}
    </View>
  );
}

/** A3 summary row: icon 24 + stacked key-value. struck = taken time (A3e): critical icon + struck critical value. */
export function SummaryRow({ icon, k, v, struck }: { icon: IconName; k: string; v: string; struck?: boolean }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: th.t('space/gap-x/sm') }}>
      <Icon name={icon} size={th.t('size/icon/md')} color={struck ? 'color/icon/content/critical/default' : 'color/icon/content/secondary/default'} />
      {struck ? (
        <View style={{ flex: 1, gap: th.t('key-value/container/gap') }}>
          <Txt role="body/sm" color="key-value/key/text/default">{k}</Txt>
          <Txt role="label/lg" color="color/text/content/critical/default" style={{ textDecorationLine: 'line-through' }}>{v}</Txt>
        </View>
      ) : <KeyValue k={k} v={v} />}
    </View>
  );
}

/** Consent caption with a trailing inline link (a3.consent: last sentence = link label). */
export function Caption({ text, link, onLink }: { text: string; link?: string; onLink?: () => void }) {
  return (
    <Txt role="caption" color="color/text/content/secondary/default" wrap>
      {text}
      {link ? <>{' '}<Txt role="caption" color="color/text/content/link/default" onPress={onLink} accessibilityRole="link">{link}</Txt></> : null}
    </Txt>
  );
}

export function useReduceMotion() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setOn).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOn);
    return () => sub.remove();
  }, []);
  return on;
}

/** A4 hero: 64 success circle + check. Scale 0.8 -> 1, small 200 ease-out (motion role; tokens not built); Reduce Motion = static. */
export function HeroCheck({ onShown }: { onShown?: () => void }) {
  const th = useTheme();
  const rm = useReduceMotion();
  const scale = useRef(new Animated.Value(0.8)).current;
  const shown = useRef(false);
  const done = () => { if (!shown.current) { shown.current = true; onShown?.(); } };
  useEffect(() => {
    if (rm) { scale.setValue(1); done(); return; }
    Animated.timing(scale, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: false }).start(done);
  }, [rm]);
  return (
    <Animated.View accessibilityElementsHidden importantForAccessibility="no" style={{ alignSelf: 'center', width: th.t('size/height/xl'), height: th.t('size/height/xl'), borderRadius: th.t('radius/full'), alignItems: 'center', justifyContent: 'center', backgroundColor: th.t('color/surface/success/default') as string, transform: [{ scale }] }}>
      <Icon name="check" size={th.t('size/icon/lg')} color="color/icon/on-fill/success/secondary/default" />
    </Animated.View>
  );
}
