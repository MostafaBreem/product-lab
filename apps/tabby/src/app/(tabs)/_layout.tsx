import { Tabs } from 'expo-router';
import React from 'react';
import { TabBar, type IconName } from '@lab/app-kit';
import { useStore } from '../../state';

const ICONS: Record<string, IconName> = { discover: 'compass', shop: 'storefront', money: 'wallet', profile: 'user' };
export const unstable_settings = { anchor: 'money' };

export default function TabsLayout() {
  const { s } = useStore();
  const labels = s.tabs as Record<string, string>;
  return (
    <Tabs backBehavior="initialRoute" screenOptions={{ headerShown: false }}
      tabBar={({ state, navigateToTab }) => (
        <TabBar items={state.routes.map((r) => ({ key: r.key, label: labels[r.name], icon: ICONS[r.name] }))} selected={state.routes[state.index].key} onSelect={navigateToTab} />
      )}>
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="money" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
