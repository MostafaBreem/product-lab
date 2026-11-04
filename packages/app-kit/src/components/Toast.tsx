import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

type ToastMsg = { tone: 'success' | 'neutral'; text: string };
const Ctx = createContext<(m: ToastMsg) => void>(() => {});
export const useToast = () => useContext(Ctx);

/** One toast at a time, 16 above the bottom bar, auto-hides after 3 s. */
export function ToastHost({ children, bottomOffset = 83 }: { children: React.ReactNode; bottomOffset?: number }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: ToastMsg) => {
    if (timer.current) clearTimeout(timer.current);
    setMsg(m);
    timer.current = setTimeout(() => setMsg(null), 3000);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg ? (
        <View pointerEvents="none" accessibilityLiveRegion="polite" style={{ position: 'absolute', left: th.t('space/margin/md'), right: th.t('space/margin/md'), bottom: Math.max(insets.bottom, 0) + bottomOffset + th.t('space/margin/md'), flexDirection: 'row', alignItems: 'flex-start', gap: th.t('toast/container/gap'), paddingHorizontal: th.t('toast/container/padding-x'), paddingVertical: th.t('toast/container/padding-y'), borderRadius: th.t('toast/container/radius'), backgroundColor: th.t('toast/container/fill') as string, direction: th.isRTL ? 'rtl' : 'ltr' }}>
          {/* Icon box = first line height (body/md wrap), so the icon sits on line 1 when the text wraps. */}
          <View style={{ height: th.type('body/md', { wrap: true }).lineHeight, justifyContent: 'center' }}>
            <Icon name={msg.tone === 'success' ? 'check-circle' : 'bell-slash'} size={th.t('size/icon/sm')} color="toast/icon/default" />
          </View>
          <Txt role="body/md" color="toast/text/default" wrap style={{ flex: 1 }}>{msg.text}</Txt>
        </View>
      ) : null}
    </Ctx.Provider>
  );
}
