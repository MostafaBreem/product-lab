import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Txt } from './Txt';

/** Large title header. trailing slot (Chip). onLongPressTitle = hidden debug entry in the demo app. */
export function Header({ title, trailing, onLongPressTitle }: { title: string; trailing?: React.ReactNode; onLongPressTitle?: () => void }) {
  const th = useTheme();
  return (
    <View {...lab('Header', title)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: th.t('header/container/padding-y'), gap: th.t('header/container/gap') }}>
      {onLongPressTitle ? (
        // Pressable, not Text onLongPress: phone browsers treat a long press on text as text selection.
        <Pressable onLongPress={onLongPressTitle} delayLongPress={500} accessibilityRole="header"
          style={Platform.OS === 'web' ? ({ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' } as object) : undefined}>
          <Txt role="display/md" color="header/title/text/default" selectable={false}>{title}</Txt>
        </Pressable>
      ) : <Txt role="display/md" color="header/title/text/default">{title}</Txt>}
      {trailing}
    </View>
  );
}
