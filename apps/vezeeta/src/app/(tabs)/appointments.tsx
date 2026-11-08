import React from 'react';
import { View } from 'react-native';
import { Txt } from '@lab/app-kit';
import { t } from '../../domain/strings';
import { useStore } from '../../state';

/** Placeholder until the screen is built (stage 10). */
export default function Screen() {
  const { lang } = useStore();
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Txt role="caption">{t('stub', lang)}</Txt></View>;
}
