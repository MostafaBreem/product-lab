import React from 'react';
import { Switch as RNSwitch, View } from 'react-native';
import { useTheme } from '../theme';

/**
 * Switch: on/off for a setting that applies at once. Knob = switch/knob/fill in both states (web needs activeThumbColor).
 * Disabled (on or off): not pressable, state kept, dimmed with opacity/muted (no switch disabled tokens yet).
 */
export function Switch({ value, onValueChange, accessibilityLabel, disabled, testID }: { value: boolean; onValueChange: (v: boolean) => void; accessibilityLabel?: string; disabled?: boolean; testID?: string }) {
  const th = useTheme();
  const knob = th.t('switch/knob/fill') as string;
  return (
    <View style={{ opacity: disabled ? (th.t('opacity/muted') as number) : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
      <RNSwitch value={value} onValueChange={onValueChange} accessibilityLabel={accessibilityLabel} disabled={disabled} accessibilityState={{ checked: value, disabled: !!disabled }} testID={testID}
        trackColor={{ true: th.t('switch/track/fill/on') as string, false: th.t('switch/track/fill/off') as string }}
        thumbColor={knob} {...({ activeThumbColor: knob } as object)} ios_backgroundColor={th.t('switch/track/fill/off') as string} />
    </View>
  );
}
