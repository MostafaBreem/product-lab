import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontAssets, ThemeProvider, ToastHost } from '@lab/app-kit';
import { StoreProvider, useStore } from '../state';

const FONTS = fontAssets();

export default function Root() {
  const [loaded] = useFonts(FONTS);
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
  const { scheme, lang } = useStore();
  return (
    <ThemeProvider scheme={scheme} lang={lang} brand="vezeeta">
      <ToastHost>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ToastHost>
    </ThemeProvider>
  );
}
