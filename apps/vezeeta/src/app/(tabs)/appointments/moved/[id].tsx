// B2 Moved visit sheet: placeholder route (task 3b builds B2 / B2b keep, pick, cancel).
import { router } from 'expo-router';
import React from 'react';
import { NavigationBar, Screen, Txt } from '@lab/app-kit';
import { t } from '../../../../domain/strings';
import { useStore } from '../../../../state';

export default function Moved() {
  const { lang } = useStore();
  return (
    <Screen top={<NavigationBar title={t('b2.t', lang)} leading="close" onLeading={() => router.back()} />} safeTop={false}>
      <Txt role="caption">{t('stub', lang)}</Txt>
    </Screen>
  );
}
