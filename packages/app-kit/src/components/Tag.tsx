import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Txt } from './Txt';

type Tone = 'critical' | 'default' | 'success' | 'warning' | 'info';
export function Tag({ label, tone = 'default' }: { label: string; tone?: Tone }) {
  const th = useTheme();
  return (
    <View {...lab('Tag', label, tone)} style={{ alignSelf: 'flex-start', height: th.t('tag/container/height'), borderRadius: th.t('tag/container/radius'), paddingHorizontal: th.t('tag/container/padding-x'), justifyContent: 'center', backgroundColor: th.t(`tag/${tone}/fill/default` as 'tag/default/fill/default') as string }}>
      <Txt role="label/sm" color={`tag/${tone}/text/default` as 'tag/default/text/default'}>{label}</Txt>
    </View>
  );
}
