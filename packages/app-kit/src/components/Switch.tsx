import React from 'react';
import { Pressable, Switch as RNSwitch, View } from 'react-native';
import { useTheme } from '../theme';

/**
 * Switch: on/off for a setting that applies at once. Knob = switch/knob/fill in both states (web needs activeThumbColor).
 * RTL: the native / web switch lays out LTR inside (web thumb mixes start + inset-inline-start, so an inherited rtl direction detaches it):
 * render it in an LTR box and mirror with scaleX -1, so On = knob at the reading end (left in AR). EN untouched.
 * Hit box: a size/touch/min square Pressable centred over the switch (absolute, no layout change; react-native-web ignores hitSlop) toggles it.
 * Disabled (on or off): not pressable, state kept, dimmed with opacity/muted (no switch disabled tokens yet).
 */
export function Switch({ value, onValueChange, accessibilityLabel, disabled, testID }: { value: boolean; onValueChange: (v: boolean) => void; accessibilityLabel?: string; disabled?: boolean; testID?: string }) {
  const th = useTheme();
  const knob = th.t('switch/knob/fill') as string;
  const touch = th.t('size/touch/min');
  return (
    <View style={{ opacity: disabled ? (th.t('opacity/muted') as number) : 1, direction: 'ltr', transform: th.isRTL ? [{ scaleX: -1 }] : undefined }} pointerEvents={disabled ? 'none' : 'auto'}>
      <RNSwitch value={value} onValueChange={onValueChange} accessibilityLabel={accessibilityLabel} disabled={disabled} accessibilityState={{ checked: value, disabled: !!disabled }} testID={testID}
        trackColor={{ true: th.t('switch/track/fill/on') as string, false: th.t('switch/track/fill/off') as string }}
        thumbColor={knob} {...({ activeThumbColor: knob } as object)} ios_backgroundColor={th.t('switch/track/fill/off') as string} />
      {disabled ? null : (
        <Pressable onPress={() => onValueChange(!value)} accessible={false} focusable={false} importantForAccessibility="no-hide-descendants" testID={testID ? `${testID}-hit` : undefined}
          style={{ position: 'absolute', top: '50%', left: '50%', width: touch, height: touch, marginTop: -touch / 2, marginLeft: -touch / 2 }} />
      )}
    </View>
  );
}
