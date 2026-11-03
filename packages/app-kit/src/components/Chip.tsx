import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

export function Chip({ label, icon, onPress }: { label: string; icon?: IconName; onPress?: () => void }) {
  const th = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6}
      style={({ pressed }) => ({ height: th.t('chip/container/height'), borderRadius: th.t('chip/container/radius'), paddingHorizontal: th.t('chip/container/padding-x'), backgroundColor: th.t(pressed ? 'chip/fill/active' : 'chip/fill/default') as string, justifyContent: 'center' })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('chip/container/gap') }}>
        {icon ? <Icon name={icon} size={th.t('chip/icon/size')} color="chip/icon/default" /> : null}
        <Txt role="label/md" color="chip/text/default">{label}</Txt>
      </View>
    </Pressable>
  );
}
