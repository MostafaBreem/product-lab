import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

export type TabItem = { key: string; label: string; icon: IconName };

/** Tab bar: equal items; selected = Fill icon + brand colours. Order mirrors in AR. */
export function TabBar({ items, selected, onSelect }: { items: TabItem[]; selected: string; onSelect: (key: string) => void }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View {...lab('TabBar')} accessibilityRole="tablist" style={{ flexDirection: 'row', direction: th.isRTL ? 'rtl' : 'ltr', backgroundColor: th.t('tab-bar/fill/default') as string, borderTopWidth: th.t('tab-bar/container/border-width'), borderTopColor: th.t('tab-bar/border/default') as string, paddingBottom: insets.bottom }}>
      {items.map((it) => {
        const sel = it.key === selected;
        return (
          <Pressable key={it.key} accessibilityRole="tab" accessibilityState={{ selected: sel }} onPress={() => onSelect(it.key)}
            style={{ flex: 1, alignItems: 'center', minHeight: th.t('tab-bar/item/min-height'), paddingTop: th.t('tab-bar/item/padding-top'), gap: th.t('tab-bar/item/gap') }}>
            <Icon name={it.icon} weight={sel ? 'fill' : 'regular'} size={th.t('tab-bar/icon/size')} color={sel ? 'tab-bar/icon/selected' : 'tab-bar/icon/default'} />
            <Txt role={sel ? 'label/sm' : 'caption'} color={sel ? 'tab-bar/label/text/selected' : 'tab-bar/label/text/default'} align="center">{it.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
