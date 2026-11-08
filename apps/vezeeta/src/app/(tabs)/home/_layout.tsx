// Home stack (build-spec.md > Navigation map): A1 results -> A2 profile -> A3 confirm -> A4 booked (replaces A3, no back).
import { Stack } from 'expo-router';
import React from 'react';
import { useReduceMotion } from '../../../ui/patterns';
export default function HomeStack() {
  const rm = useReduceMotion(); // Reduce Motion: A3 -> A4 = instant replace
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="booked" options={{ gestureEnabled: false, animation: rm ? 'none' : 'default' }} />
    </Stack>
  );
}
