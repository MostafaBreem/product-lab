import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Txt } from './Txt';

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const th = useTheme();
  return (
    <View accessibilityRole="header" style={{ minHeight: th.t('section-header/container/height'), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: th.t('section-header/container/gap') }}>
      <Txt role="heading/sm" color="section-header/title/text/default">{title}</Txt>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          {({ pressed }) => <Txt role="label/lg" color={pressed ? 'button/link/text/active' : 'button/link/text/default'}>{action}</Txt>}
        </Pressable>
      ) : null}
    </View>
  );
}
