// Appointments stack (build-spec.md > Navigation map): B1 Upcoming / B3 Past (one screen) · B2 moved sheet over B1.
import { Stack } from 'expo-router';
import React from 'react';
export default function AppointmentsStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="moved/[id]" options={{ presentation: 'formSheet' }} />
    </Stack>
  );
}
