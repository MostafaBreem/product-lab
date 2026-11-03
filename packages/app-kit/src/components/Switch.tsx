import React from 'react';
import { Switch as RNSwitch } from 'react-native';
import { useTheme } from '../theme';

/** Switch: on/off for a setting that applies at once. Knob = switch/knob/fill in both states (web needs activeThumbColor). */
export function Switch({ value, onValueChange, accessibilityLabel }: { value: boolean; onValueChange: (v: boolean) => void; accessibilityLabel?: string }) {
  const th = useTheme();
  const knob = th.t('switch/knob/fill') as string;
  return (
    <RNSwitch value={value} onValueChange={onValueChange} accessibilityLabel={accessibilityLabel}
      trackColor={{ true: th.t('switch/track/fill/on') as string, false: th.t('switch/track/fill/off') as string }}
      thumbColor={knob} {...({ activeThumbColor: knob } as object)} ios_backgroundColor={th.t('switch/track/fill/off') as string} />
  );
}
