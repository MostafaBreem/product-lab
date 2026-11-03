import React from 'react';
import { View } from 'react-native';
import { Icon, Txt, useTheme, type IconName } from '@lab/app-kit';

/** Win-first hero: 64 circle + 32 glyph (roles.md), display/md title, body. */
export function Hero({ icon, tone, title, body }: { icon: IconName; tone: 'success' | 'brand'; title: string; body: string }) {
  const th = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingTop: 24 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: th.t(tone === 'success' ? 'color/fill/success/default' : 'color/fill/brand/default') as string }}>
        <Icon name={icon} size={32} weight="bold" color="color/icon/on-fill/brand/default" />
      </View>
      <Txt role="display/md" align="center">{title}</Txt>
      <Txt role="body/md" color="color/text/content/secondary/default" align="center" wrap>{body}</Txt>
    </View>
  );
}
