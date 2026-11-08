// A4 Booked (replaces A3, no back). Mock book-dentist-en-v2 A4; motion build-spec-screens.md > Motion; notification ask build-spec-rules.md > Round 2 fixes.
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { BottomSheet, Button, Card, KeyValue, Screen, Tag, Txt, useTheme, useToast } from '@lab/app-kit';
import { ev, setCommon } from '../../../domain/analytics';
import { doctor } from '../../../domain/fixtures';
import { split, t } from '../../../domain/strings';
import { askNotifications } from '../../../ui/feedback';
import { HeroCheck } from '../../../ui/patterns';
import { bookedLine, placeLine } from '../../../ui/text';
import { useStore } from '../../../state';

type Params = { doctorId: string; start: string; fee: string; patient: string; first?: string };

export default function Booked() {
  const p = useLocalSearchParams<Params>();
  const { lang } = useStore();
  const th = useTheme();
  const toast = useToast();
  const d = doctor(p.doctorId);
  const [ask, setAsk] = useState(false);
  useFocusEffect(useCallback(() => { setCommon({ screen: 'A4' }); }, []));

  // First booking: after the hero, "Get updates about this visit?" sheet -> OS prompt (web: no OS prompt, result 'web').
  const onHero = () => { if (p.first === '1') { setAsk(true); ev.notifAskShown(); } };
  const turnOn = async () => { setAsk(false); ev.osPermissionResult({ result: await askNotifications() }); };

  if (!d) return <Screen><Txt role="body/sm">{t('stub', lang)}</Txt></Screen>;
  const [addrK, patientK] = split('a4.keys', lang);
  const [seeL, calL] = split('a4.cta', lang);
  const [askT, askB, askCta, askNo] = split('notif.ask.t / b / cta', lang);
  const address = d.fullAddress?.[lang] ?? placeLine(d, lang);
  const directions = () => {
    if (!address) return;
    const q = encodeURIComponent(d.fullAddress?.en ?? placeLine(d, 'en') ?? '');
    Linking.openURL(Platform.OS === 'ios' ? `maps:?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
  };
  const toAppointments = () => { router.dismissAll(); router.navigate('/appointments'); };

  return (
    <Screen footer={
      <View>
        <Button label={seeL} onPress={toAppointments} testID="a4-appointments" />
        {/* expo-calendar not installed: stub until added (gap) */}
        <Button variant="link" label={calL} onPress={() => toast({ tone: 'neutral', text: t('stub', lang) })} testID="a4-calendar" />
      </View>
    }>
      <View style={{ gap: th.t('space/gap-y/md'), paddingTop: th.t('space/padding-top/xl') }}>
        <HeroCheck onShown={onHero} />
        <View style={{ gap: th.t('space/gap-y/xs') }}>
          <Txt role="display/md" align="center" accessibilityRole="header">{t('a4.t', lang)}</Txt>
          <Txt role="body/md" wrap align="center" color="color/text/content/secondary/default">{bookedLine(d, p.start, Number(p.fee), lang)}</Txt>
        </View>
      </View>
      <Card style={{ gap: th.t('space/gap-y/sm') }}>
        <Tag tone="success" label={t('a4.conf', lang)} />
        {address ? <KeyValue k={addrK} v={address} /> : null}
        {address ? <Button variant="link" label={t('a4.dir', lang)} onPress={directions} full={false} testID="a4-directions" /> : null}
        <KeyValue k={patientK} v={p.patient} />
      </Card>
      <Txt role="body/sm" wrap color="color/text/content/secondary/default">{t('a4.next', lang)}</Txt>

      <BottomSheet visible={ask} onClose={() => setAsk(false)} title={askT} footer={
        <View>
          <Button label={askCta} onPress={turnOn} testID="notif-on" />
          <Button variant="link" label={askNo} onPress={() => setAsk(false)} testID="notif-later" />
        </View>
      }>
        <Txt role="body/md" wrap color="color/text/content/secondary/default">{askB}</Txt>
      </BottomSheet>
    </Screen>
  );
}
