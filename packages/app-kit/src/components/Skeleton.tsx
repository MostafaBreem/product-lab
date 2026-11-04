import React from 'react';
import { View, type DimensionValue } from 'react-native';
import { useTheme } from '../theme';

// raw-ok: no token for a skeleton text line yet (12); token gap logged in build-log.
const SKELETON_LINE = 12;

/** Skeleton bar (screen pattern, works-well T01-13). */
export function Bar({ w, h, r }: { w: DimensionValue; h?: number; r?: number }) {
  const th = useTheme();
  return <View style={{ width: w, height: h ?? SKELETON_LINE, borderRadius: r ?? th.t('radius/xs'), backgroundColor: th.t('color/fill/default') as string }} />;
}
