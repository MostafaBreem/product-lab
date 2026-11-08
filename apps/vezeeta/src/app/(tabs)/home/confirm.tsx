// A3 Confirm booking: placeholder route (task 2b builds it). Params: doctorId, start, mode, source, filter, bookingId.
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { NavigationBar, Screen, Txt } from '@lab/app-kit';
import { doctor } from '../../../domain/fixtures';
import { dayTime } from '../../../domain/format';
import { fmtStrings, t } from '../../../domain/strings';
import { useStore } from '../../../state';
import { drName } from '../../../ui/text';

export default function Confirm() {
  const p = useLocalSearchParams<{ doctorId: string; start: string; mode?: 'normal' | 'followUp' | 'reschedule'; source?: string; filter?: string; bookingId?: string }>();
  const { lang } = useStore();
  const d = doctor(p.doctorId);
  const title = p.mode === 'reschedule' ? fmtStrings.reschedTitle(lang) : t('a3.nav', lang);
  return (
    <Screen top={<NavigationBar title={title} leading="back" onLeading={() => router.back()} />}>
      {d ? <Txt role="label/lg">{drName(d, lang)}</Txt> : null}
      {p.start ? <Txt role="body/sm">{dayTime(p.start, lang)}</Txt> : null}
      <Txt role="caption" color="color/text/content/secondary/default">{t('stub', lang)}</Txt>
    </Screen>
  );
}
