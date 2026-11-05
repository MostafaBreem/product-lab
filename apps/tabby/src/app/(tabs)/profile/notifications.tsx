// Notifications settings (reminders.md view 5 v2 locked, 5b iPhone off). build-spec-reminders.md.
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AppState, Linking, View } from 'react-native';
import { analytics, BottomSheet, Button, fmt, ListGroup, ListRow, NavigationBar, Notice, Screen, SectionHeader, Txt, useTheme, useToast } from '@lab/app-kit';
import { api } from '../../../domain/server';
import type { NotificationPrefs } from '../../../domain/types';
import { useStore } from '../../../state';
import { SalaryPicker } from '../../../ui/flows';

export default function NotificationsScreen() {
  const th = useTheme();
  const st = useStore();
  const { s, lang, flags } = st;
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>();
  const [picker, setPicker] = useState(false);
  useEffect(() => { api.prefs().then(setPrefs).catch(() => {}); }, []);
  // Re-read iPhone permission when the app comes back (user may change it in iPhone Settings).
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (a) => {
      if (a !== 'active') return;
      const p = await Notifications.getPermissionsAsync().catch(() => null);
      if (p) st.setFlags({ osPermission: p.granted ? 'granted' : p.canAskAgain ? 'notDetermined' : 'denied' });
    });
    return () => sub.remove();
  }, []);
  const off = flags.osPermission !== 'granted';
  const denied = flags.osPermission === 'denied';
  const openSettings = async (source: string) => {
    analytics.track('open_settings_tapped', { source });
    if (flags.osPermission === 'notDetermined') {
      const r = await Notifications.requestPermissionsAsync().catch(() => ({ granted: false }));
      st.setFlags({ osPermission: r.granted ? 'granted' : 'denied' });
      analytics.track('os_permission_result', { status: r.granted ? 'granted' : 'denied', source: 'settings' });
    } else Linking.openSettings();
  };
  const save = async (next: NotificationPrefs, field: string, value: unknown) => {
    const prev = prefs;
    setPrefs(next); // change at once, revert on error (build-spec.md > Decided)
    analytics.track('notification_pref_changed', { field, value });
    try { await api.savePrefs(next); } catch { setPrefs(prev); toast({ tone: 'neutral', text: s.common.somethingWrong }); }
  };
  const nav = <NavigationBar title={s.rem.settingsTitle} leading="back" onLeading={() => router.back()} />;
  if (!prefs) return <Screen top={nav}><View /></Screen>;
  const deals = ['push', 'sms', 'whatsapp', 'email'] as const;
  const dayLabel = prefs.salaryDay.day === null ? undefined : prefs.salaryDay.day === 'last' ? s.rem.lastDay : fmt.ordinalDay(prefs.salaryDay.day, lang);
  return (
    <Screen top={nav}>
      {denied ? <Notice icon="bell-slash" title={s.rem.iphoneOffTitle} body={s.rem.iphoneOffBody}><Button variant="link" label={s.rem.openSettings} onPress={() => openSettings('notice')} /></Notice> : null}
      <View>
        <SectionHeader title={s.rem.sheetTitle} />
        <ListGroup>
          <ListRow title={s.rem.pushRem} subtitle={s.rem.pushRemSub} quietValue={off ? s.rem.offVal : s.rem.alwaysOn} chevron={off} onPress={off ? () => openSettings('row') : undefined} />
          <ListRow title={s.rem.salaryRem} subtitle={s.rem.salaryRemSub} selection={{ kind: 'switch', value: !off && prefs.salaryDay.on, onChange: (v) => (off ? openSettings('salary') : save({ ...prefs, salaryDay: { ...prefs.salaryDay, on: v } }, 'salaryDay.on', v)) }} />
          {!off && prefs.salaryDay.on ? <ListRow title={s.rem.salaryDay} value={dayLabel} chevron onPress={() => setPicker(true)} /> : null}
        </ListGroup>
        <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: th.t('space/gap-y/xs') }}>{s.rem.lockedNote}</Txt>
      </View>
      <View>
        <SectionHeader title={s.rem.deals} />
        <ListGroup>
          {deals.map((k) => (
            <ListRow key={k} title={s.rem[k]} selection={{ kind: 'switch', value: k === 'push' ? !off && prefs.deals.push : prefs.deals[k], onChange: (v) => (k === 'push' && off ? openSettings('deals_push') : save({ ...prefs, deals: { ...prefs.deals, [k]: v } }, `deals.${k}`, v)) }} />
          ))}
        </ListGroup>
        <Txt role="body/sm" color="color/text/content/secondary/default" wrap style={{ marginTop: th.t('space/gap-y/xs') }}>{s.rem.dealsNote}</Txt>
      </View>
      <BottomSheet closeLabel={s.common.close} backLabel={s.common.back} visible={picker} title={s.rem.salaryDay} onClose={() => setPicker(false)}>
        <SalaryPicker value={prefs.salaryDay.day} onSave={(d) => { setPicker(false); save({ ...prefs, salaryDay: { on: true, day: d } }, 'salaryDay.day', d); }} />
      </BottomSheet>
    </Screen>
  );
}
