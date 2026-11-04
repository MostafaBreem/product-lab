import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Icon } from './Icon';
import { Txt } from './Txt';

/** Navigation bar 44: leading back (caret-left, mirrors in AR) or close (x, never mirrors), centred title. */
export function NavigationBar({ title, leading, onLeading, transparent, label }: { title?: string; leading?: 'back' | 'close'; onLeading?: () => void; transparent?: boolean; label?: string }) {
  const th = useTheme();
  const side = th.t('navigation-bar/side/size');
  return (
    <View {...lab('NavigationBar', title)} style={{ height: th.t('navigation-bar/container/height'), flexDirection: 'row', alignItems: 'center', paddingHorizontal: th.t('navigation-bar/container/padding-x') - (th.t('size/touch/min') - th.t('size/icon/md')) / 2, backgroundColor: transparent ? 'transparent' : (th.t('navigation-bar/container/fill') as string) }}>
      <View style={{ width: side, height: side, justifyContent: 'center', alignItems: 'center' }}>
        {leading ? (
          <Pressable onPress={onLeading} accessibilityRole="button" accessibilityLabel={label ?? (leading === 'back' ? 'Back' : 'Close')} hitSlop={th.t('space/padding/3xs')} style={{ width: side, height: side, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name={leading === 'back' ? 'caret-left' : 'x'} color="navigation-bar/leading/icon/default" />
          </Pressable>
        ) : null}
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {title ? <Txt role="heading/sm" color="navigation-bar/title/text/default" numberOfLines={1} align="center">{title}</Txt> : null}
      </View>
      <View style={{ width: side }} />
    </View>
  );
}
