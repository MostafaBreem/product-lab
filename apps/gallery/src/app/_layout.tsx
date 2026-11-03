import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontAssets } from '@lab/app-kit';

export default function Root() {
  const [loaded] = useFonts(fontAssets);
  if (!loaded) return <View style={{ flex: 1 }} />;
  return <SafeAreaProvider><Stack screenOptions={{ headerShown: false, title: 'app-kit gallery' }} /></SafeAreaProvider>;
}
