import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import type { TokenKey } from '../tokens';
import { Icon, type IconName } from './Icon';
import { Switch } from './Switch';
import { Txt } from './Txt';

export type Leading =
  | { kind: 'logo'; text: string; color?: string }
  | { kind: 'icon'; icon: IconName; tile?: TokenKey; color?: TokenKey }
  | { kind: 'skeleton' };

type Props = {
  title: string; subtitle?: string; subtitleColor?: TokenKey; value?: string; quietValue?: string;
  leading?: Leading; chevron?: boolean; onPress?: () => void; divider?: boolean; plainPadding?: boolean;
  selection?: { kind: 'radio' | 'check'; selected: boolean } | { kind: 'switch'; value: boolean; onChange: (v: boolean) => void };
  testID?: string;
};

/** List row: leading logo / icon, title, subtitle, value, chevron or selection control. Whole row taps. Min 56 tall. */
export function ListRow({ title, subtitle, subtitleColor = 'list-row/subtitle/text/default', value, quietValue, leading, chevron, onPress, divider, selection, plainPadding, testID }: Props) {
  const th = useTheme();
  const padX = plainPadding ? 0 : th.t('list-row/container/padding-x');
  const body = (pressed: boolean) => (
    <View style={{ backgroundColor: pressed ? (th.t('list-row/fill/active') as string) : 'transparent' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: th.t('list-row/container/min-height'), paddingHorizontal: padX, paddingVertical: th.t('list-row/container/padding-y'), gap: th.t('list-row/container/gap') }}>
        {leading ? <LeadingView leading={leading} /> : null}
        <View style={{ flex: 1, gap: th.t('list-row/text/gap') }}>
          <Txt role="label/lg" color="list-row/title/text/default" numberOfLines={2}>{title}</Txt>
          {subtitle ? <Txt role="body/sm" color={subtitleColor} numberOfLines={2}>{subtitle}</Txt> : null}
        </View>
        {value ? <Txt role="label/lg" color="list-row/value/text/default" tabular>{value}</Txt> : null}
        {quietValue ? <Txt role="body/sm" color="list-row/value/text/quiet" tabular>{quietValue}</Txt> : null}
        {selection?.kind === 'switch' ? (
          <Switch value={selection.value} onValueChange={selection.onChange} accessibilityLabel={title} />
        ) : selection ? (
          <Icon size={th.t('list-row/selection/size')} weight={selection.selected ? 'fill' : 'regular'}
            name={selection.kind === 'radio' ? (selection.selected ? 'radio-button' : 'circle') : selection.selected ? 'check-square' : 'square'}
            color={selection.selected ? 'list-row/selection/icon/selected' : 'list-row/selection/icon/default'} />
        ) : chevron ? (
          <Icon name="caret-right" size={th.t('list-row/chevron/size')} color="list-row/chevron/icon/default" />
        ) : null}
      </View>
      {divider ? <View style={{ height: th.t('list-row/divider/width'), backgroundColor: th.t('list-row/divider/border/default') as string, marginStart: padX }} /> : null}
    </View>
  );
  const labState = selection ? (selection.kind === 'switch' ? `switch ${selection.value ? 'on' : 'off'}` : `${selection.kind} ${selection.selected ? 'on' : 'off'}`) : chevron ? 'chevron' : onPress ? undefined : 'not tappable';
  const tag = lab('ListRow', title, labState);
  const accState = selection && selection.kind !== 'switch' ? { selected: selection.selected, checked: selection.selected } : undefined;
  if (!onPress) return <View {...tag} testID={testID}>{body(false)}</View>;
  return <Pressable {...tag} testID={testID} onPress={onPress} accessibilityRole={selection?.kind === 'radio' ? 'radio' : selection?.kind === 'check' ? 'checkbox' : 'button'} accessibilityState={accState}>{({ pressed }) => body(pressed)}</Pressable>;
}

function LeadingView({ leading }: { leading: Leading }) {
  const th = useTheme();
  const box = { width: th.t('list-row/leading/size'), height: th.t('list-row/leading/size'), borderRadius: th.t('list-row/leading/radius'), alignItems: 'center' as const, justifyContent: 'center' as const };
  if (leading.kind === 'skeleton') return <View style={[box, { backgroundColor: th.t('color/fill/default') as string }]} />;
  if (leading.kind === 'logo') {
    return (
      <View style={[box, { backgroundColor: leading.color ?? (th.t('list-row/logo/fill/default') as string) }]}>
        <Txt role="label/lg" color="color/text/on-fill/brand/default" align="center">{leading.text}</Txt>
      </View>
    );
  }
  return (
    <View style={[box, { backgroundColor: th.t(leading.tile ?? 'list-row/leading-icon/fill/default') as string }]}>
      <Icon name={leading.icon} size={th.t('list-row/leading-icon/size')} color={leading.color ?? 'list-row/leading-icon/icon/default'} />
    </View>
  );
}
