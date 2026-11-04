import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';

/** Card holding List rows. Rows get a divider except the last (Show divider off on last). plain = no card (choice rows on a sheet). */
export function ListGroup({ children, plain }: { children: React.ReactNode; plain?: boolean }) {
  const th = useTheme();
  const items = React.Children.toArray(children).filter(Boolean) as React.ReactElement<{ divider?: boolean }>[];
  return (
    <View {...lab('ListGroup', undefined, plain ? 'plain' : undefined)} style={plain ? undefined : { backgroundColor: th.t('list-group/fill/default') as string, borderRadius: th.t('list-group/container/radius'), overflow: 'hidden', boxShadow: shadow(th.t('shadow/sm')) }}>
      {items.map((c, i) => React.cloneElement(c, { divider: c.props.divider ?? i < items.length - 1, key: c.key ?? i }))}
    </View>
  );
}
export const shadow = (s: { color: string; offsetX: number; offsetY: number; blur: number; spread: number }) => `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`;
