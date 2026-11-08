// Push delivery + tap routing (build-spec.md > Navigation; build-spec-screens.md > B5/B5b; build-spec-rules.md > Round 2 permission).
// iOS: expo-notifications local push (now). Web, or iOS with permission off: in-app banner at the top (stand-in); tap = push tap.
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt, useTheme, useToast } from '@lab/app-kit';
import { ev } from '../domain/analytics';
import { followUpUntil } from '../domain/derive';
import { pushTarget, pushText, type PushData, type PushTarget } from '../domain/push';
import { allBookings, now as serverNow } from '../domain/server';
import { t } from '../domain/strings';
import type { Lang } from '../domain/types';
import { onReminder, useStore } from '../state';
import { notificationStatus } from './feedback';

const native = Platform.OS !== 'web';
if (native) {
  // Show pushes while the app is open too (status pushes "within 1 s").
  Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
}

/** Navigate to a push / deep-link target. Stale = B1 + Toast link.changed. */
export function goTarget(target: PushTarget, toast: ReturnType<typeof useToast>, lang: Lang) {
  if (target.to === 'b2') router.navigate({ pathname: '/appointments', params: { moved: target.bookingId } });
  else if (target.to === 'b1') router.navigate({ pathname: '/appointments', params: { focus: target.bookingId } });
  else if (target.to === 'a2') router.navigate({ pathname: '/home/doctor/[id]', params: { id: target.doctorId, source: target.source, mode: target.mode } });
  else { router.navigate('/appointments'); toast({ tone: 'neutral', text: t('link.changed', lang) }); }
}

/** Push tap: reminder_opened always, then route by current data. */
export function useOpenPush() {
  const toast = useToast();
  const { lang } = useStore();
  return useCallback((d: PushData) => {
    ev.reminderOpened({ type: d.type });
    goTarget(pushTarget(d, allBookings(), serverNow()), toast, lang);
  }, [toast, lang]);
}

type Banner = PushData & { title: string; body: string; n: number };

export function NotifyHost() {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const { lang } = useStore();
  const open = useOpenPush();
  const [banner, setBanner] = useState<Banner>();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);
  const langRef = useRef(lang); langRef.current = lang;
  const openRef = useRef(open); openRef.current = open;

  const show = useCallback((b: Omit<Banner, 'n'>) => {
    if (timer.current) clearTimeout(timer.current);
    setBanner({ ...b, n: ++seq.current });
    timer.current = setTimeout(() => setBanner(undefined), 5000);
  }, []);

  useEffect(() => onReminder(async (r) => {
    const bs = allBookings();
    const visit = bs.find((x) => x.id === r.bookingId);
    const until = r.type.startsWith('followup_') && visit ? followUpUntil(visit) : undefined;
    const data: PushData = { type: r.type, bookingId: r.bookingId, doctorId: r.doctorId };
    const text = pushText(data, bs, langRef.current, until);
    if ((await notificationStatus()) === 'granted') {
      Notifications.scheduleNotificationAsync({ content: { title: text.title, body: text.body, data }, trigger: null }).catch(() => show({ ...data, ...text }));
    } else show({ ...data, ...text });
  }), [show]);

  useEffect(() => {
    if (!native) return;
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const d = resp.notification.request.content.data as Partial<PushData> | undefined;
      if (d?.type) openRef.current(d as PushData);
    });
    return () => sub.remove();
  }, []);

  if (!banner) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + th.t('space/margin/md'), left: th.t('space/margin/md'), right: th.t('space/margin/md') }}>
      <Pressable testID="push-banner" accessibilityRole="button" accessibilityLiveRegion="polite"
        onPress={() => { setBanner(undefined); open(banner); }}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: th.t('space/gap-x/sm'), paddingHorizontal: th.t('space/padding-x/md'), paddingVertical: th.t('space/padding-y/sm'),
          borderRadius: th.t('radius/lg'), borderWidth: th.t('border-width/sm'), borderColor: th.t('color/border/default') as string,
          backgroundColor: th.t(pressed ? 'color/surface/active' : 'color/surface/raised/default') as string, direction: th.isRTL ? 'rtl' : 'ltr' })}>
        <View style={{ flex: 1, gap: th.t('space/gap-y/2xs') }}>
          <Txt role="label/lg" wrap>{banner.title}</Txt>
          <Txt role="body/sm" wrap color="color/text/content/secondary/default">{banner.body}</Txt>
        </View>
      </Pressable>
    </View>
  );
}
