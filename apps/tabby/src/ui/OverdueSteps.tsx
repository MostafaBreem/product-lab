// "What happens next" steps (approved overdue v5 Steps card, screen pattern). Used in the Money tab sheet.
import React from 'react';
import { View } from 'react-native';
import { Card, Icon, Txt, useTheme, type IconName } from '@lab/app-kit';
import type { Strings } from '../domain/strings';

export function OverdueSteps({ s, card = true }: { s: Strings; card?: boolean }) {
  const th = useTheme();
  const gap = { gap: th.t('space/gap-y/md') };
  const steps = (
    <>
      {s.overdue.steps.map((step) => (
        <View key={step.title} style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm') }}>
          <View style={{ width: th.t('size/height/sm'), height: th.t('size/height/sm'), borderRadius: th.t('radius/md'), backgroundColor: th.t('color/surface/secondary/default') as string, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={step.icon as IconName} />
          </View>
          <View style={{ flex: 1, gap: th.t('space/gap-y/4xs') }}>
            <Txt role="label/lg">{step.title}</Txt>
            <Txt role="body/sm" color="color/text/content/secondary/default" wrap>{step.body}</Txt>
          </View>
        </View>
      ))}
    </>
  );
  return card ? <Card style={gap}>{steps}</Card> : <View style={gap}>{steps}</View>;
}
