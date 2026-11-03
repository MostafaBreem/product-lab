import React from 'react';
import { ScrollView, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

/** Screen: bg/default, content column with 16 margins, sections 24 apart (S5). top = Navigation bar or nothing. footer = fixed action bar. */
export function Screen({ top, children, footer, refreshControl, bottomInset = 0, gap = 24, safeTop = true }: { top?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; refreshControl?: React.ReactElement<RefreshControlProps>; bottomInset?: number; gap?: number; safeTop?: boolean }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: th.t('color/bg/default') as string, paddingTop: safeTop ? insets.top : 0, direction: th.isRTL ? 'rtl' : 'ltr' }}>
      {top}
      <ScrollView refreshControl={refreshControl} contentContainerStyle={{ paddingHorizontal: th.t('space/margin/md' as never) ?? 16, paddingTop: 8, paddingBottom: bottomInset + 24, gap }}>
        {children}
      </ScrollView>
      {footer ? <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, backgroundColor: th.t('color/bg/default') as string }}>{footer}</View> : null}
    </View>
  );
}
