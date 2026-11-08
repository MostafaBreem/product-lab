import { Tabs, useSegments } from 'expo-router';
import React from 'react';
import { TabBar, type IconName } from '@lab/app-kit';
import { split } from '../../domain/strings';
import { useStore } from '../../state';

// Kit has no house / tag icon yet (Icon set is tabby's): placeholders until kit adds them.
const ICONS: Record<string, IconName> = { home: 'compass', appointments: 'calendar', offers: 'storefront', account: 'user' };
const ORDER = ['home', 'appointments', 'offers', 'account'];
export const unstable_settings = { anchor: 'home' };

// A3 confirm / A4 booked: no tab bar (mock: action bar at the bottom). Hidden by route, stack + back / replace unchanged.
const NO_TAB_BAR = ['confirm', 'booked'];
function VzTabBar(props: React.ComponentProps<typeof TabBar>) {
  const segments = useSegments() as string[];
  if (segments.some((s) => NO_TAB_BAR.includes(s))) return null;
  return <TabBar {...props} />;
}

export default function TabsLayout() {
  const { lang } = useStore();
  const labels = split('tab', lang); // Home · Appointments · Offers · Account
  return (
    <Tabs backBehavior="initialRoute" screenOptions={{ headerShown: false }}
      tabBar={({ state, navigateToTab }) => (
        <VzTabBar items={state.routes.map((r) => ({ key: r.key, label: labels[ORDER.indexOf(r.name)], icon: ICONS[r.name] }))} selected={state.routes[state.index].key} onSelect={navigateToTab} />
      )}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="offers" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
