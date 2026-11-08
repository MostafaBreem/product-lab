import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Txt } from './Txt';

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const th = useTheme();
  // Real hit box >= size/touch/min (react-native-web ignores hitSlop): segment = container height - 2 x track padding;
  // the Pressable grows by the rest with vertical padding + equal negative margin, the visible segment (inner View) is unchanged.
  const ext = Math.max(0, (th.t('size/touch/min') - th.t('segmented-control/container/height')) / 2 + th.t('segmented-control/track/padding'));
  return (
    <View {...lab('SegmentedControl', options.map((o) => o.label).join(' · '), `selected: ${options.find((o) => o.value === value)?.label ?? ''}`)} accessibilityRole="tablist" style={{ flexDirection: 'row', height: th.t('segmented-control/container/height'), padding: th.t('segmented-control/track/padding'), borderRadius: th.t('segmented-control/track/radius'), backgroundColor: th.t('segmented-control/track/fill/default') as string }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: sel }} aria-selected={sel} onPress={() => onChange(o.value)}
            style={{ flex: 1, paddingVertical: ext, marginVertical: -ext }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: th.t('segmented-control/segment/radius'), backgroundColor: sel ? (th.t('segmented-control/segment/fill/selected') as string) : 'transparent' }}>
              <Txt role="label/md" color={sel ? 'segmented-control/segment/text/selected' : 'segmented-control/segment/text/default'}>{o.label}</Txt>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
