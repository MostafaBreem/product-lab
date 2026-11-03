import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Txt, useTheme, type IconName } from '@lab/app-kit';
import { useStore } from '../../state';

const ICONS: Record<string, IconName> = { discover: 'compass', shop: 'storefront', money: 'wallet', profile: 'user' };

export const unstable_settings = { anchor: 'money' };

export default function TabsLayout() {
  const { s } = useStore();
  return (
    <Tabs backBehavior="initialRoute" screenOptions={{ headerShown: false }} tabBar={(p) => <TabBar {...p} labels={s.tabs as Record<string, string>} />}>
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="money" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

/** Tab bar (4): selected = Fill icon + brand colours. Order mirrors in AR via direction. */
function TabBar({ state, navigateToTab, labels }: { state: { index: number; routes: { key: string; name: string }[] }; navigateToTab: (key: string) => void; labels: Record<string, string> }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', direction: th.isRTL ? 'rtl' : 'ltr', backgroundColor: th.t('tab-bar/fill/default') as string, borderTopWidth: th.t('tab-bar/container/border-width'), borderTopColor: th.t('tab-bar/border/default') as string, paddingBottom: insets.bottom }}>
      {state.routes.map((r, i) => {
        const sel = state.index === i;
        return (
          <Pressable key={r.key} accessibilityRole="tab" accessibilityState={{ selected: sel }} onPress={() => navigateToTab(r.key)}
            style={{ flex: 1, alignItems: 'center', minHeight: th.t('tab-bar/item/min-height'), paddingTop: th.t('tab-bar/item/padding-top'), gap: th.t('tab-bar/item/gap') }}>
            <Icon name={ICONS[r.name]} weight={sel ? 'fill' : 'regular'} size={th.t('tab-bar/icon/size')} color={sel ? 'tab-bar/icon/selected' : 'tab-bar/icon/default'} />
            <Txt role={sel ? 'label/sm' : 'caption'} color={sel ? 'tab-bar/label/text/selected' : 'tab-bar/label/text/default'} align="center">{labels[r.name]}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
