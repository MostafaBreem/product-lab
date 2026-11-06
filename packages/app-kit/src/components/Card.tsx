import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { shadow } from './ListGroup';

/** Plain card surface (spec components/card.md): fill, radius 20, inset 20, shadow sm. Card sets no gap: the content lays itself out (style = content layout only). Not tappable. */
export function Card({ children, style }: { children: React.ReactNode; style?: Pick<ViewStyle, 'gap' | 'flexDirection' | 'alignItems' | 'justifyContent'> }) {
  const th = useTheme();
  return (
    <View {...lab('Card')} style={[style, { backgroundColor: th.t('card/fill/default') as string, borderRadius: th.t('card/container/radius'), padding: th.t('card/container/padding'), boxShadow: shadow(th.t('shadow/sm')) }]}>
      {children}
    </View>
  );
}
