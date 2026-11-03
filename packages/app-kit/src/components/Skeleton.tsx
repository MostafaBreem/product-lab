import React from 'react';
import { View, type DimensionValue } from 'react-native';
import { useTheme } from '../theme';

/** Skeleton bar (screen pattern, works-well T01-13). */
export function Bar({ w, h = 12, r = 4 }: { w: DimensionValue; h?: number; r?: number }) {
  const th = useTheme();
  return <View style={{ width: w, height: h, borderRadius: r, backgroundColor: th.t('color/fill/default') as string }} />;
}
