// B2 Moved visit sheet lives on B1 as a kit BottomSheet (appointments/index.tsx, param `moved`). This route forwards old links there.
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function Moved() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/appointments', params: { moved: id } }} />;
}
