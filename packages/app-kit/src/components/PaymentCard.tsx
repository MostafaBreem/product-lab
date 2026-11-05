import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Button } from './Button';
import { KeyValue } from './KeyValue';
import { shadow } from './ListGroup';
import { Tag } from './Tag';
import { Txt } from './Txt';

export type PaymentCardProps = {
  state: 'due' | 'overdue' | 'caughtUp';
  /** Overdue card keeps neutral fill (critic C1 on overdue-map-v5); true = critical tint (not used by the app since the overdue merge). */
  criticalFill?: boolean;
  tag?: string; label: string; amount?: string; title?: string; dueLine: string; dueCritical?: boolean; body?: string;
  pay?: { label: string; onPress: () => void; critical?: boolean };
  links?: { label: string; onPress: () => void; critical?: boolean; helper?: string }[];
  linksRow?: boolean;
  summary?: { k: string; v: string }[];
};

/** Payment card: next payment at a glance + one Pay. States Due, Overdue, Caught up. */
export function PaymentCard(p: PaymentCardProps) {
  const th = useTheme();
  const crit = p.criticalFill;
  return (
    <View {...lab('PaymentCard', p.label, p.state)} style={{ backgroundColor: th.t(crit ? 'payment-card/fill/critical' : 'payment-card/fill/default') as string, borderRadius: th.t('payment-card/container/radius'), padding: th.t('payment-card/container/padding'), gap: th.t('payment-card/container/gap'), boxShadow: shadow(th.t('shadow/sm')) }}>
      {p.tag ? <Tag tone="critical" label={p.tag} /> : null}
      <View style={{ gap: th.t('payment-card/header/gap') }}>
        <Txt role="body/sm" color="payment-card/label/text/default">{p.label}</Txt>
        {p.amount ? <Txt role="display/lg" color="payment-card/amount/text/default" tabular>{p.amount}</Txt> : null}
        {p.title ? <Txt role="heading/md" color="payment-card/amount/text/default">{p.title}</Txt> : null}
        <Txt role="body/md" color={p.dueCritical ? 'payment-card/due/text/critical' : 'payment-card/due/text/default'}>{p.dueLine}</Txt>
        {p.body ? <Txt role="body/sm" color="payment-card/note/text/default" wrap>{p.body}</Txt> : null}
      </View>
      {p.pay || p.links?.length ? (
        <View style={{ gap: th.t('payment-card/actions/gap') }}>
          {p.pay ? <Button label={p.pay.label} onPress={p.pay.onPress} tone={p.pay.critical ? 'critical' : 'default'} /> : null}
          <View style={p.linksRow ? { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: th.t('space/gap-x/xs') } : undefined}>
            {p.links?.map((l, _, all) => {
              // Under a Pay button, one link (and its helper) is centred; no Pay (Caught up) = start; two links = split with linksRow (user 2026-11-05).
              const mid = !!p.pay && all.length === 1;
              return (
              <View key={l.label}>
                <Button variant="link" label={l.label} onPress={l.onPress} tone={l.critical ? 'critical' : 'default'} full={mid} align={mid ? 'center' : 'start'} />
                {l.helper ? <Txt role="body/sm" color="payment-card/note/text/default" wrap align={mid ? 'center' : 'start'}>{l.helper}</Txt> : null}
              </View>
              );
            })}
          </View>
        </View>
      ) : null}
      {p.summary?.length ? (
        <View style={{ flexDirection: 'row', gap: th.t('payment-card/summary/gap'), backgroundColor: th.t(crit ? 'payment-card/summary/fill/critical' : 'payment-card/summary/fill/default') as string, borderRadius: th.t('payment-card/summary/radius'), paddingHorizontal: th.t('payment-card/summary/padding-x'), paddingVertical: th.t('payment-card/summary/padding-y') }}>
          {/* One summary pair = one line, key left, value right (user 2026-11-05); several = stacked columns. */}
          {p.summary.length === 1
            ? <View style={{ flex: 1 }}><KeyValue k={p.summary[0].k} v={p.summary[0].v} layout="row" strong /></View>
            : p.summary.map((s) => <KeyValue key={s.k} k={s.k} v={s.v} />)}
        </View>
      ) : null}
    </View>
  );
}
