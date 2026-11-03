import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Txt } from './Txt';

/** Key-value pair. stacked = key over value (summary inset); row = key start, value end (details card). */
export function KeyValue({ k, v, layout = 'stacked', strong }: { k: string; v: string; layout?: 'stacked' | 'row'; strong?: boolean }) {
  const th = useTheme();
  if (layout === 'row') {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: th.t('key-value/container/gap-x') }}>
        <Txt role="body/sm" color="key-value/key/text/default" style={{ flexShrink: 1 }}>{k}</Txt>
        <Txt role={strong ? 'label/lg' : 'body/sm'} color="key-value/value/text/default" tabular>{v}</Txt>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, gap: th.t('key-value/container/gap') }}>
      <Txt role="body/sm" color="key-value/key/text/default">{k}</Txt>
      <Txt role="label/lg" color="key-value/value/text/default" tabular>{v}</Txt>
    </View>
  );
}
