import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

/**
 * Inline status: icon, title, optional body, optional link under the text (children = one Button variant="link").
 * Mirrors Figma "Notice" (spec components/notice.md §9 Code map).
 * Screen readers: Critical = alert (interrupts), Neutral = status (waits its turn).
 */
export function Notice({ tone = 'neutral', icon, showIcon = true, title, body, children }: {
  tone?: 'critical' | 'neutral'; icon?: IconName; showIcon?: boolean; title: string; body?: string; children?: React.ReactNode;
}) {
  const th = useTheme();
  const crit = tone === 'critical';
  const iconSize = th.t('notice/icon/size') as number;
  return (
    <View role={crit ? 'alert' : 'status'} accessibilityLiveRegion={crit ? 'assertive' : 'polite'}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: th.t('notice/container/gap'), paddingHorizontal: th.t('notice/container/padding-x'), paddingVertical: th.t('notice/container/padding-y'), borderRadius: th.t('notice/container/radius'), backgroundColor: th.t(crit ? 'notice/critical/fill' : 'notice/default/fill') as string }}>
      {showIcon ? (
        /* Icon box = icon size wide, title first-line tall (label/lg), so the icon sits on line 1 when the title wraps. */
        <View style={{ width: iconSize, height: th.type('label/lg').lineHeight, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon ?? (crit ? 'warning-circle' : 'info')} size={iconSize} color={crit ? 'notice/critical/icon' : 'notice/default/icon'} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: th.t('notice/text/gap') }}>
        <Txt role="label/lg" color="notice/title/text">{title}</Txt>
        {body ? <Txt role="body/sm" color="notice/body/text" wrap>{body}</Txt> : null}
        {children}
      </View>
    </View>
  );
}
