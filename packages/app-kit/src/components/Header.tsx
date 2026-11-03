import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Txt } from './Txt';

/** Large title header. trailing slot (Chip). onLongPressTitle = hidden debug entry in the demo app. */
export function Header({ title, trailing, onLongPressTitle }: { title: string; trailing?: React.ReactNode; onLongPressTitle?: () => void }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: th.t('header/container/padding-y'), gap: th.t('header/container/gap') }}>
      <Txt role="display/md" color="header/title/text/default" onLongPress={onLongPressTitle} suppressHighlighting>{title}</Txt>
      {trailing}
    </View>
  );
}
