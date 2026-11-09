// Screen patterns (components/screen-patterns.md; build-spec.md > Kit work "pattern, not kit"). Tokens only.
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, View } from 'react-native';
import { Avatar, Bar, Button, Card, Icon, KeyValue, Txt, useTheme, type IconName } from '@lab/app-kit';
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

/** Key-value on one line, no icon (mock A1 card .kv: key secondary + value, gap 8). */
export function KV({ k, v }: { k?: string; v: string }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/xs') }}>
      {k ? <Txt role="body/sm" color="color/text/content/secondary/default">{k}</Txt> : null}
      <Txt role="body/sm" style={{ flexShrink: 1 }}>{v}</Txt>
    </View>
  );
}

/** Card info line (mock B1 / B2b confirmed card): icon 20 + gap 12 + body, starts at the card content edge. */
export function CardLine({ icon, text }: { icon: IconName; text: string }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: th.t('space/gap-x/sm') }}>
      <Icon name={icon} size={th.t('size/icon/sm')} color="color/icon/content/default" />
      <Txt role="body/sm" wrap style={{ flex: 1 }}>{text}</Txt>
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

/** A3 summary row: icon 24 + stacked key-value. struck = taken time (A3e): critical icon + struck critical value.
 * was = reschedule: old time struck (secondary) above the new time. */
export function SummaryRow({ icon, k, v, struck, was }: { icon: IconName; k: string; v: string; struck?: boolean; was?: string }) {
  const th = useTheme();
  if (was && !struck) return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: th.t('space/gap-x/sm') }}>
      <Icon name={icon} size={th.t('size/icon/md')} color="color/icon/content/secondary/default" />
      <View style={{ flex: 1, gap: th.t('key-value/container/gap') }}>
        <Txt role="body/sm" color="key-value/key/text/default">{k}</Txt>
        <Txt role="body/sm" color="color/text/content/secondary/default" style={{ textDecorationLine: 'line-through' }}>{was}</Txt>
        <Txt role="label/lg">{v}</Txt>
      </View>
    </View>
  );
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

/** Icon tile 40 (prompt rows, B6 empty). */
export function Tile({ icon }: { icon: IconName }) {
  const th = useTheme();
  return (
    <View style={{ width: th.t('size/height/lg'), height: th.t('size/height/lg'), borderRadius: th.t('radius/md'), alignItems: 'center', justifyContent: 'center', backgroundColor: th.t('color/fill/default') as string }}>
      <Icon name={icon} size={th.t('size/icon/md')} color="color/icon/content/secondary/default" />
    </View>
  );
}

/** B1 prompt row (mock "Card · Follow-up row" / "Next visit row"): tile + title + subtitle + small trailing Book.
 * Trailing Book = Button Secondary small (mock "Button · Secondary small"). */
export function PromptRow({ icon, title, sub, cta, onPress, testID }: { icon: IconName; title: string; sub: string; cta: string; onPress: () => void; testID?: string }) {
  const th = useTheme();
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm') }}>
      <Tile icon={icon} />
      <View style={{ flex: 1, gap: th.t('space/gap-y/2xs') }}>
        <Txt role="label/lg" wrap>{title}</Txt>
        <Txt role="body/sm" wrap color="color/text/content/secondary/default">{sub}</Txt>
      </View>
      <Button variant="secondary" full={false} label={cta} onPress={onPress} testID={testID} />
    </Card>
  );
}

/** Prompt row removal: fade + collapse 200 (motion role small, ease-out); Reduce Motion = remove. */
export function FadeCollapse({ leaving, onGone, children }: { leaving: boolean; onGone: () => void; children: React.ReactNode }) {
  const rm = useReduceMotion();
  const v = useRef(new Animated.Value(1)).current;
  const [h, setH] = useState<number>();
  useEffect(() => {
    if (!leaving) return;
    if (rm) { onGone(); return; }
    Animated.timing(v, { toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: false }).start(() => onGone());
  }, [leaving, rm]);
  const style = leaving && h !== undefined ? { opacity: v, height: v.interpolate({ inputRange: [0, 1], outputRange: [0, h] }), overflow: 'hidden' as const } : undefined;
  return <Animated.View style={style} onLayout={(e) => { if (!leaving) setH(e.nativeEvent.layout.height); }}>{children}</Animated.View>;
}

/** Avatar + name + subtitle (booking cards, B3 cards). */
export function DoctorLine({ initials, name, sub }: { initials: string; name: string; sub?: string }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm') }}>
      {/* raw-ok: Avatar size is the kit enum 40 | 56 | 72, not a value */}
      <Avatar initials={initials} size={40} />
      <View style={{ flex: 1 }}>
        <Txt role="label/lg">{name}</Txt>
        {sub ? <Txt role="body/sm" wrap color="color/text/content/secondary/default">{sub}</Txt> : null}
      </View>
    </View>
  );
}

/** B3 month list row: Avatar + title + subtitle + trailing Link (kit ListRow has no trailing action: pattern). */
export function PastRow({ initials, title, sub, action, onAction, divider, testID }: { initials: string; title: string; sub: string; action: string; onAction: () => void; divider?: boolean; testID?: string }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm'), paddingHorizontal: th.t('space/padding-x/md'), minHeight: th.t('size/height/xl'),
      borderBottomWidth: divider ? th.t('border-width/sm') : 0, borderBottomColor: th.t('color/border/default') as string }}>
      {/* raw-ok: Avatar size is the kit enum 40 | 56 | 72, not a value */}
      <Avatar initials={initials} size={40} />
      <View style={{ flex: 1 }}>
        <Txt role="label/lg">{title}</Txt>
        <Txt role="body/sm" color="color/text/content/secondary/default">{sub}</Txt>
      </View>
      <Button variant="link" full={false} label={action} onPress={onAction} testID={testID} />
    </View>
  );
}

/** B6 empty: tile 40 + title + body + Button. */
export function EmptyBlock({ icon, title, body, cta, onPress }: { icon: IconName; title: string; body: string; cta: string; onPress: () => void }) {
  const th = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: th.t('space/gap-y/md'), paddingTop: th.t('space/padding-top/xl') }}>
      <Tile icon={icon} />
      <View style={{ gap: th.t('space/gap-y/xs') }}>
        <Txt role="heading/sm" align="center">{title}</Txt>
        <Txt role="body/md" wrap align="center" color="color/text/content/secondary/default">{body}</Txt>
      </View>
      <Button label={cta} onPress={onPress} testID="b6-cta" />
    </View>
  );
}

/** B1 skeleton: prompt row + 2 cards (static blocks). */
export function SkeletonRow() {
  const th = useTheme();
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm') }}>
      <Bar w={th.t('size/height/lg')} h={th.t('size/height/lg')} r={th.t('radius/md')} />
      <View style={{ flex: 1, gap: th.t('space/gap-y/2xs') }}><Bar w="70%" /><Bar w="40%" /></View>
    </Card>
  );
}

/** Tag change: new tag fades in 200 (motion role small, ease-out; B2b "cross-fade 200 tag"). First mount = no motion; Reduce Motion = swap. */
export function FadeSwap({ k, children }: { k: string; children: React.ReactNode }) {
  const rm = useReduceMotion();
  const v = useRef(new Animated.Value(1)).current;
  const prev = useRef(k);
  useEffect(() => {
    if (prev.current === k) return;
    prev.current = k;
    if (rm) { v.setValue(1); return; }
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [k, rm]);
  return <Animated.View style={{ opacity: v, alignSelf: 'flex-start' }}>{children}</Animated.View>;
}

/** B2 inset times: "New time" value + "Was" struck old value (KeyValue has no struck value: pattern). */
export function MovedTimes({ newK, newV, wasK, wasV }: { newK: string; newV: string; wasK: string; wasV: string }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: th.t('space/gap-x/md'), paddingHorizontal: th.t('space/padding-x/md'), paddingVertical: th.t('space/padding-y/sm'), borderRadius: th.t('radius/md'), backgroundColor: th.t('color/surface/secondary/default') as string }}>
      <View style={{ flex: 1 }}><KeyValue k={newK} v={newV} /></View>
      <View style={{ flex: 1, gap: th.t('key-value/container/gap') }}>
        <Txt role="body/sm" color="key-value/key/text/default">{wasK}</Txt>
        <Txt role="label/lg" color="color/text/content/secondary/default" style={{ textDecorationLine: 'line-through' }}>{wasV}</Txt>
      </View>
    </View>
  );
}

/** B7 cancelled sheet (task 11b): inset like MovedTimes, DoctorLine (Avatar + name + area, as B2) + struck cancelled date/time below (no label; struck in AR too). */
export function CancelledTimes({ initials, name, sub, when }: { initials: string; name: string; sub?: string; when: string }) {
  const th = useTheme();
  return (
    <View style={{ gap: th.t('space/gap-y/xs'), paddingHorizontal: th.t('space/padding-x/md'), paddingVertical: th.t('space/padding-y/sm'), borderRadius: th.t('radius/md'), backgroundColor: th.t('color/surface/secondary/default') as string }}>
      <DoctorLine initials={initials} name={name} sub={sub} />
      <Txt role="body/sm" color="color/text/content/secondary/default" style={{ textDecorationLine: 'line-through' }}>{when}</Txt>
    </View>
  );
}
