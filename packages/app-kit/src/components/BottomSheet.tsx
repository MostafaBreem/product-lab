import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { NavigationBar } from './NavigationBar';

type Props = {
  visible: boolean; onClose: () => void; title?: string; leading?: 'back' | 'close' | 'none'; onLeading?: () => void;
  /** false while a payment runs (Card processing): no x, no scrim tap, no swipe. */
  dismissable?: boolean; children: React.ReactNode; footer?: React.ReactNode;
  /** Screen-reader labels in the app's language (scrim + x share closeLabel). Defaults are English. */
  closeLabel?: string; backLabel?: string;
};

/** Bottom sheet: scrim + sheet pinned bottom, Navigation bar, content slot (padding 16, gap 24). Height hugs content. */
export function BottomSheet({ visible, onClose, title, leading = 'close', onLeading, dismissable = true, children, footer, closeLabel = 'Close', backLabel = 'Back' }: Props) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const y = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.timing(y, { toValue: visible ? 0 : height, duration: 300, useNativeDriver: true }).start();
  }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (dismissable) onClose(); }}>
      <View style={{ flex: 1, justifyContent: 'flex-end', direction: th.isRTL ? 'rtl' : 'ltr' }}>
        <Pressable accessibilityLabel={closeLabel} onPress={() => { if (dismissable) onClose(); }} style={{ position: 'absolute', inset: 0, backgroundColor: th.t('bottom-sheet/scrim/fill') as string, opacity: th.t('bottom-sheet/scrim/opacity') }} />
        <Animated.View style={{ transform: [{ translateY: y }], maxHeight: height - insets.top - th.t('space/padding-top/xl'), backgroundColor: th.t('bottom-sheet/container/fill') as string, borderTopLeftRadius: th.t('bottom-sheet/container/radius'), borderTopRightRadius: th.t('bottom-sheet/container/radius'), paddingTop: th.t('space/padding-top/xs'), paddingBottom: insets.bottom + th.t('bottom-sheet/content/padding') }}>
          <NavigationBar title={title} transparent leading={!dismissable || leading === 'none' ? undefined : leading} label={leading === 'back' ? backLabel : closeLabel} onLeading={onLeading ?? onClose} />
          <ScrollView bounces={false} contentContainerStyle={{ padding: th.t('bottom-sheet/content/padding'), gap: th.t('bottom-sheet/content/gap') }}>
            {children}
          </ScrollView>
          {footer ? <View style={{ paddingHorizontal: th.t('bottom-sheet/content/padding') }}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
