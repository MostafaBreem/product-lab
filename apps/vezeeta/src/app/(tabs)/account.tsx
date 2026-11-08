// Account tab: one live row "Reminders" -> R1 (build-spec.md > Navigation). Other account rows out of scope.
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Header, ListGroup, ListRow, Screen } from '@lab/app-kit';
import { setCommon } from '../../domain/analytics';
import { split, t } from '../../domain/strings';
import { useStore } from '../../state';

export default function Account() {
  const { lang } = useStore();
  useFocusEffect(useCallback(() => { setCommon({ screen: 'Account' }); }, []));
  return (
    <Screen top={null}>
      {/* Title = tab label (no account title row in copy) */}
      <Header title={split('tab', lang)[3]} />
      <ListGroup>
        <ListRow title={t('acc.reminders', lang)} chevron onPress={() => router.push('/reminders')} testID="acc-reminders" />
      </ListGroup>
    </Screen>
  );
}
