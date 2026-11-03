import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Txt } from './Txt';

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const th = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', height: th.t('segmented-control/container/height'), padding: th.t('segmented-control/track/padding'), borderRadius: th.t('segmented-control/track/radius'), backgroundColor: th.t('segmented-control/track/fill/default') as string }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: sel }} onPress={() => onChange(o.value)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: th.t('segmented-control/segment/radius'), backgroundColor: sel ? (th.t('segmented-control/segment/fill/selected') as string) : 'transparent' }}>
            <Txt role="label/md" color={sel ? 'segmented-control/segment/text/selected' : 'segmented-control/segment/text/default'}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
