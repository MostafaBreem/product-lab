import React from 'react';
import { View } from 'react-native';
import { useTheme, type TypeRole } from '../theme';
import { lab } from '../inspect';
import type { TokenKey } from '../tokens';
import { Txt } from './Txt';

type Size = 40 | 56 | 72;
// 72 has no size token: size/height/xl (64) until one is added (Spec gaps, 2026-11-08).
const BOX: Record<Size, TokenKey> = { 40: 'size/height/sm', 56: 'size/height/lg', 72: 'size/height/xl' };
const ROLE: Record<Size, TypeRole> = { 40: 'label/sm', 56: 'label/md', 72: 'label/lg' };

/** Avatar: initials in a circle, fill default, secondary text. Decorative next to a name: hidden from screen readers. */
export function Avatar({ initials, size = 40 }: { initials: string; size?: Size }) {
  const th = useTheme();
  const d = th.t(BOX[size]) as number;
  return (
    <View {...lab('Avatar', initials, String(size))} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width: d, height: d, borderRadius: th.t('radius/full'), backgroundColor: th.t('color/fill/default') as string, alignItems: 'center', justifyContent: 'center' }}>
      <Txt role={ROLE[size]} align="center" color="color/text/content/secondary/default" numberOfLines={1}>{initials}</Txt>
    </View>
  );
}
