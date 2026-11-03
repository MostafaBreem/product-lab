import { router } from 'expo-router';
import React from 'react';
import { Header, ListGroup, ListRow, Screen } from '@lab/app-kit';
import { useStore } from '../../../state';

/** Profile stub: one live row (Notifications) + language switch for the demo. */
export default function Profile() {
  const { s, lang, setLang } = useStore();
  return (
    <Screen>
      <Header title={s.profile.title} />
      <ListGroup>
        <ListRow title={s.profile.notifications} leading={{ kind: 'icon', icon: 'bell' }} chevron onPress={() => router.push('/profile/notifications')} />
        <ListRow title={s.profile.language} quietValue={s.profile.langValue} leading={{ kind: 'icon', icon: 'arrows-clockwise' }} chevron onPress={() => setLang(lang === 'en' ? 'ar' : 'en')} />
      </ListGroup>
    </Screen>
  );
}
