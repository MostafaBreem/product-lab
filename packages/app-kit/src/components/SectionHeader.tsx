import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Txt } from './Txt';

// raw-ok: touch-area slop (10) has no space token; keeps the action at 44 hit height.
const HIT_SLOP = 10;

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const th = useTheme();
  return (
    <View {...lab('SectionHeader', title, action ? `action: ${action}` : undefined)} accessibilityRole="header" style={{ minHeight: th.t('section-header/container/height'), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: th.t('section-header/container/gap') }}>
      <Txt role="heading/sm" color="section-header/title/text/default">{title}</Txt>
      {action ? (
        <Pressable onPress={onAction} hitSlop={HIT_SLOP} accessibilityRole="button">
          {({ pressed }) => <Txt role="label/lg" color={pressed ? 'button/link/text/active' : 'button/link/text/default'}>{action}</Txt>}
        </Pressable>
      ) : null}
    </View>
  );
}
