import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

/** Inline status: icon, title, optional body, optional link below (children). Announced as status. */
export function Notice({ tone = 'neutral', icon, title, body, children }: { tone?: 'critical' | 'neutral'; icon?: IconName; title: string; body?: string; children?: React.ReactNode }) {
  const th = useTheme();
  const crit = tone === 'critical';
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', gap: th.t('notice/container/gap'), paddingHorizontal: th.t('notice/container/padding-x'), paddingVertical: th.t('notice/container/padding-y'), borderRadius: th.t('notice/container/radius'), backgroundColor: th.t(crit ? 'notice/critical/fill' : 'notice/default/fill') as string }}>
      <View style={{ height: 24, justifyContent: 'center' }}>
        <Icon name={icon ?? (crit ? 'warning-circle' : 'info')} size={th.t('notice/icon/size')} color={crit ? 'notice/critical/icon' : 'notice/default/icon'} />
      </View>
      <View style={{ flex: 1, gap: th.t('notice/text/gap') }}>
        <Txt role="label/lg" color="notice/title/text">{title}</Txt>
        {body ? <Txt role="body/sm" color="notice/body/text" wrap>{body}</Txt> : null}
        {children}
      </View>
    </View>
  );
}
