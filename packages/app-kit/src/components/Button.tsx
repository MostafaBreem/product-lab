import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Txt } from './Txt';

type Props = { label: string; onPress?: () => void; variant?: 'primary' | 'link'; tone?: 'default' | 'critical'; loading?: boolean; disabled?: boolean; full?: boolean; testID?: string };

/** Button: Primary (filled, one per view) or Link. Loading = Primary only, spinner + label, no press. Disabled = Primary only, grey fill, no press (both tones look the same). 48 tall. */
export function Button({ label, onPress, variant = 'primary', tone = 'default', loading, disabled, full = variant === 'primary', testID }: Props) {
  const th = useTheme();
  const crit = tone === 'critical';
  if (variant === 'link') {
    return (
      <Pressable testID={testID} accessibilityRole="button" onPress={onPress} hitSlop={{ top: 0, bottom: 0, left: th.t('space/padding-x/xs'), right: th.t('space/padding-x/xs') }}
        style={{ minHeight: th.t('size/touch/min'), justifyContent: 'center', alignSelf: full ? 'stretch' : 'flex-start' }}>
        {({ pressed }) => (
          <Txt role="label/lg" color={crit ? (pressed ? 'button/link/critical/text/active' : 'button/link/critical/text/default') : pressed ? 'button/link/text/active' : 'button/link/text/default'}>{label}</Txt>
        )}
      </Pressable>
    );
  }
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ busy: !!loading, disabled: !!disabled }} disabled={loading || disabled} onPress={onPress}
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
