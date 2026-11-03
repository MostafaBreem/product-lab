import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontAssets, ThemeProvider, ToastHost } from '@lab/app-kit';
import { StoreProvider, useStore } from '../state';
import { FlowsProvider } from '../ui/flows';
import { listenForReminderTaps, scheduleReminders } from '../ui/reminders';

export default function Root() {
  const [loaded] = useFonts(fontAssets);
  if (!loaded) return <View style={{ flex: 1 }} />;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Themed />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Themed() {
  const st = useStore();
  const { scheme, lang } = st;
  useEffect(() => listenForReminderTaps(st.refresh), []);
  // Reschedule after payment, extension, prefs, permission or clock changes (build-spec-reminders.md).
  useEffect(() => { scheduleReminders(st).catch(() => {}); }, [st.flags.osPermission, st.version, lang]);
  return (
    <ThemeProvider scheme={scheme} lang={lang}>
      <ToastHost>
        <FlowsProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="debug" options={{ presentation: 'modal' }} />
            <Stack.Screen name="gallery" />
          </Stack>
        </FlowsProvider>
      </ToastHost>
    </ThemeProvider>
  );
}
