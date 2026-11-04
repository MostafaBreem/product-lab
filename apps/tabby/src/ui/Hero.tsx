import React from 'react';
import { View } from 'react-native';
import { Icon, Txt, useTheme, type IconName } from '@lab/app-kit';

/** Hero tint pairs, bound 1:1 to Figma (Paid on time / Extended both, v5). Brand icon uses a text token in Figma too (logged for token-health). */
export const HERO = {
  success: { fill: 'color/fill/success/secondary/default', icon: 'color/icon/on-fill/success/secondary/default' },
  brand: { fill: 'color/surface/brand/default', icon: 'color/text/content/link/active' },
} as const;

/** Win-first hero: 64 circle + 32 glyph (roles.md), display/md title, body. */
export function Hero({ icon, tone, title, body }: { icon: IconName; tone: 'success' | 'brand'; title: string; body: string }) {
  const th = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: th.t('space/gap-y/sm'), paddingTop: th.t('space/padding-top/xl') }}>
      <View style={{ width: th.t('size/height/xl'), height: th.t('size/height/xl'), borderRadius: th.t('radius/full'), alignItems: 'center', justifyContent: 'center', backgroundColor: th.t(HERO[tone].fill) as string }}>
        <Icon name={icon} size={th.t('size/icon/lg')} weight="bold" color={HERO[tone].icon} />
      </View>
      <Txt role="display/md" align="center">{title}</Txt>
      <Txt role="body/md" color="color/text/content/secondary/default" align="center" wrap>{body}</Txt>
    </View>
  );
}
