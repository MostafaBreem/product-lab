import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';
import { InActions } from './sheetContext';
import type { TokenKey } from '../tokens';

type Tone = 'critical' | 'neutral' | 'brand' | 'success';
// Brand + Success have no notice/* component tokens yet: semantic tokens (Spec gaps, Vezeeta kit work 2026-11-08).
const TONES: Record<Tone, { fill: TokenKey; icon: TokenKey; title: TokenKey; body: TokenKey; glyph: IconName }> = {
  neutral: { fill: 'notice/default/fill', icon: 'notice/default/icon', title: 'notice/title/text', body: 'notice/body/text', glyph: 'info' },
  critical: { fill: 'notice/critical/fill', icon: 'notice/critical/icon', title: 'notice/title/text', body: 'notice/body/text', glyph: 'warning-circle' },
  brand: { fill: 'color/surface/brand/default', icon: 'color/icon/content/brand/default', title: 'notice/title/text', body: 'notice/body/text', glyph: 'info' },
  success: { fill: 'color/surface/success/default', icon: 'color/icon/on-fill/success/secondary/default', title: 'color/text/on-fill/success/secondary/default', body: 'color/text/on-fill/success/secondary/default', glyph: 'check-circle' },
};

/**
 * Inline status: icon, title, optional body, optional link under the text (children = one Button variant="link").
 * Mirrors Figma "Notice" (spec components/notice.md §9 Code map).
 * Tones: Neutral · Critical · Brand · Success. Screen readers: Critical = alert (interrupts), others = status (waits its turn).
 */
export function Notice({ tone = 'neutral', icon, showIcon = true, title, body, children }: {
  tone?: Tone; icon?: IconName; showIcon?: boolean; title: string; body?: string; children?: React.ReactNode;
}) {
  const th = useTheme();
  const crit = tone === 'critical';
  const c = TONES[tone];
  const iconSize = th.t('notice/icon/size') as number;
  return (
    <View {...lab('Notice', title, tone)} role={crit ? 'alert' : 'status'} accessibilityLiveRegion={crit ? 'assertive' : 'polite'}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: th.t('notice/container/gap'), paddingHorizontal: th.t('notice/container/padding-x'), paddingVertical: th.t('notice/container/padding-y'), borderRadius: th.t('notice/container/radius'), backgroundColor: th.t(c.fill) as string }}>
      {showIcon ? (
        /* Icon box = icon size wide, title first-line tall (label/lg), so the icon sits on line 1 when the title wraps. */
        <View style={{ width: iconSize, height: th.type('label/lg').lineHeight, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon ?? c.glyph} size={iconSize} color={c.icon} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: th.t('notice/text/gap') }}>
        <Txt role="label/lg" color={c.title}>{title}</Txt>
        {body ? <Txt role="body/sm" color={c.body} wrap>{body}</Txt> : null}
        {/* A Notice is content even inside an action bar: its link stays start-aligned. */}
        <InActions.Provider value={false}>{children}</InActions.Provider>
      </View>
    </View>
  );
}
