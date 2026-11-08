// R1 Reminders (Account > Reminders). build-spec-screens.md > R1; build-spec-rules.md > Round 2 (permission Notice, Switch Disabled).
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { Bar, Button, ListGroup, ListRow, NavigationBar, Notice, Screen, useTheme, useToast } from '@lab/app-kit';
import { ev, setCommon } from '../domain/analytics';
import type { ReminderType } from '../domain/reminders';
import { api } from '../domain/server';
import { split, t } from '../domain/strings';
import type { ReminderPrefs } from '../domain/types';
import { notificationStatus } from '../ui/feedback';
import { useStore } from '../state';

// One switch = a reminder category; events fire per type in it (spec has no category type: gap).
const TYPES: Record<'followUp' | 'nextVisit', ReminderType[]> = { followUp: ['followup_open', 'followup_ending'], nextVisit: ['next_visit_4w', 'next_visit_10w'] };

export default function Reminders() {
  const th = useTheme();
  const toast = useToast();
  const { lang, settings } = useStore();
  const offline = settings.net === 'offline';
  const [prefs, setPrefs] = useState<ReminderPrefs>();
  const [failed, setFailed] = useState(false);
  const [denied, setDenied] = useState(false);
  const load = useCallback(() => { setFailed(false); api.prefs().then(setPrefs).catch(() => setFailed(true)); }, []);
  useEffect(load, []);
  useFocusEffect(useCallback(() => { setCommon({ screen: 'R1' }); notificationStatus().then((s) => setDenied(s === 'denied')); }, []));

  const toggle = async (k: 'followUp' | 'nextVisit', v: boolean) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, [k]: v });
    try {
      const saved = await api.savePrefs({ ...prefs, [k]: v });
      setPrefs(saved);
      TYPES[k].forEach((type) => (v ? ev.reminderOptIn({ type }) : ev.reminderOptOut({ type })));
    } catch {
      setPrefs(prev); // PUT fail: switch reverts
      toast({ tone: 'neutral', text: t('r1.err', lang) });
    }
  };

  const [fu, nv, changes] = split('r1.rows', lang);
  const [offT, offLink] = split('r1.off', lang);
  const [errT, errB] = split('err.load.t / b', lang);
  return (
    <Screen top={<NavigationBar title={t('r1.nav', lang)} leading="back" onLeading={() => router.back()} />} safeTop={false}>
      {denied ? (
        <Notice icon="bell-slash" title={offT}>
          <Button variant="link" label={offLink} onPress={() => Linking.openSettings().catch(() => {})} testID="r1-settings" />
        </Notice>
      ) : null}
      {/* Offline Notice text: no R1 row; off.action (nearest, gap) */}
      {offline ? <Notice title={t('off.action', lang)} /> : null}
      {prefs ? (
        <ListGroup>
          <ListRow title={fu} divider selection={{ kind: 'switch', value: prefs.followUp, disabled: offline, onChange: (v) => toggle('followUp', v) }} testID="r1-followup" />
          <ListRow title={nv} divider selection={{ kind: 'switch', value: prefs.nextVisit, disabled: offline, onChange: (v) => toggle('nextVisit', v) }} testID="r1-next" />
          <ListRow title={changes} subtitle={t('r1.locked', lang)} selection={{ kind: 'switch', value: true, disabled: true, onChange: () => {} }} testID="r1-changes" />
        </ListGroup>
      ) : failed ? (
        <Notice tone="critical" title={errT} body={errB}>
          <Button variant="link" label={t('err.retry', lang)} onPress={load} testID="r1-retry" />
        </Notice>
      ) : (
        <ListGroup>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ paddingHorizontal: th.t('list-row/container/padding-x'), minHeight: th.t('list-row/container/min-height'), justifyContent: 'center' }}><Bar w="60%" /></View>
          ))}
        </ListGroup>
      )}
    </Screen>
  );
}
