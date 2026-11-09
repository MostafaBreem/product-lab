import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Txt } from './Txt';
import { useInActions, useInSheet } from './sheetContext';

type Props = { label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'link'; align?: 'start' | 'center'; tone?: 'default' | 'critical'; loading?: boolean; disabled?: boolean; full?: boolean; testID?: string };

/** Button: Primary (filled, one per view), Secondary (grey filled, no outline: color/fill default / active / disabled + content text, same fill as slot cells; no component tokens yet, semantic tokens) or Link. Loading = Primary only (Default and Critical tone), spinner + label, no press. Disabled = Primary only, grey fill, no press (both tones look the same). 48 tall. */
export function Button({ label, onPress, variant = 'primary', align, tone = 'default', loading, disabled, full: fullProp, testID }: Props) {
  const th = useTheme();
  const crit = tone === 'critical';
  // Full-width link in an action area (bottom sheet, Screen footer) = secondary action under the main one: centred unless align is given (user 2026-11-05).
  // Any link in an action area (BottomSheet footer, Screen footer) = secondary action under the main one: centred by default,
  // full width unless full or align is given (decisions/system.md 2026-11-05). Links in content stay start-aligned.
  const inSheet = useInSheet();
  const inActions = useInActions();
  const full = fullProp ?? (variant !== 'link' || (inActions && align === undefined));
  const textAlign = align ?? ((inActions || (inSheet && full)) ? 'center' : 'start');
  if (variant === 'link') {
    return (
      <Pressable {...lab('Button', label, crit ? 'link · critical' : 'link')} testID={testID} accessibilityRole="button" onPress={onPress} hitSlop={{ top: 0, bottom: 0, left: th.t('space/padding-x/xs'), right: th.t('space/padding-x/xs') }}
        style={{ minHeight: th.t('size/touch/min'), justifyContent: 'center', alignSelf: full ? 'stretch' : 'flex-start' }}>
        {({ pressed }) => (
          <Txt role="label/lg" align={textAlign} color={crit ? (pressed ? 'button/link/critical/text/active' : 'button/link/critical/text/default') : pressed ? 'button/link/text/active' : 'button/link/text/default'}>{label}</Txt>
        )}
      </Pressable>
    );
  }
  if (variant === 'secondary') {
    const off = disabled || loading;
    return (
      <Pressable {...lab('Button', label, ['secondary', disabled && 'disabled', loading && 'loading'].filter(Boolean).join(' · '))} testID={testID} accessibilityRole="button" accessibilityState={{ busy: !!loading, disabled: !!disabled }} disabled={off} onPress={onPress}
        style={({ pressed }) => ({
          height: th.t('button/container/height'), borderRadius: th.t('button/container/radius'), paddingHorizontal: th.t('button/primary/padding-x'),
          alignSelf: full ? 'stretch' : 'flex-start', alignItems: 'center', justifyContent: 'center',
          backgroundColor: th.t(disabled ? 'color/fill/disabled' : pressed ? 'color/fill/active' : 'color/fill/default') as string,
        })}>
        {({ pressed }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('button/container/gap') }}>
            {loading ? <ActivityIndicator color={th.t(disabled ? 'color/icon/content/disabled' : 'color/icon/content/default') as string} /> : null}
            <Txt role="label/lg" color={disabled ? 'color/text/content/disabled' : 'color/text/content/default'} numberOfLines={1}>{label}</Txt>
          </View>
        )}
      </Pressable>
    );
  }
  return (
    <Pressable {...lab('Button', label, ['primary', crit && 'critical', disabled && 'disabled', loading && 'loading'].filter(Boolean).join(' · '))} testID={testID} accessibilityRole="button" accessibilityState={{ busy: !!loading, disabled: !!disabled }} disabled={loading || disabled} onPress={onPress}
      style={({ pressed }) => ({
        height: th.t('button/container/height'), borderRadius: th.t('button/container/radius'), paddingHorizontal: th.t('button/primary/padding-x'),
        alignSelf: full ? 'stretch' : 'flex-start', alignItems: 'center', justifyContent: 'center',
        backgroundColor: th.t(disabled ? 'button/primary/fill/disabled' : crit ? (pressed ? 'button/primary/critical/fill/active' : 'button/primary/critical/fill/default') : pressed ? 'button/primary/fill/active' : 'button/primary/fill/default') as string,
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('button/container/gap') }}>
        {loading ? <ActivityIndicator color={th.t(disabled ? 'button/primary/icon/disabled' : crit ? 'button/primary/critical/icon/default' : 'button/primary/icon/default') as string} /> : null}
        <Txt role="label/lg" color={disabled ? 'button/primary/text/disabled' : crit ? 'button/primary/critical/text/default' : 'button/primary/text/default'} numberOfLines={1}>{label}</Txt>
      </View>
    </Pressable>
  );
}
