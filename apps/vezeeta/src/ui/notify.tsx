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
import { allBookings, clinicEvents, now as serverNow } from '../domain/server';
import { nextLive, sheetQueue } from '../domain/sheets';
import { t } from '../domain/strings';
import type { Lang } from '../domain/types';
import { liveKeys, onReminder, useStore } from '../state';
import { notificationStatus } from './feedback';

const native = Platform.OS !== 'web';
if (native) {
  // Show pushes while the app is open too (status pushes "within 1 s").
  Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
}

/** Navigate to a push / deep-link target. Stale = B1 + Toast link.changed. */
export function goTarget(target: PushTarget, toast: ReturnType<typeof useToast>, lang: Lang) {
  if (target.to === 'b2') router.navigate({ pathname: '/appointments', params: { moved: target.bookingId } });
  else if (target.to === 'b7') router.navigate({ pathname: '/appointments', params: { cancelled: target.bookingId } });
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
  const { lang, flags } = useStore();
  const open = useOpenPush();
  const seenRef = useRef(flags.seenSheets); seenRef.current = flags.seenSheets;
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
    // Task 11: a move / cancel with a live sheet (open or queued) gets no banner or foreground push (no double feedback).
    if ((r.type === 'status_moved' || r.type === 'status_cancelled')
      && (liveKeys.has(r.key) || sheetQueue(clinicEvents(), bs, seenRef.current, serverNow()).some((x) => x.key === r.key))) return;
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

/**
 * Live clinic-change sheets (task 11, CEO 2026-11-09): an unseen MOVE / CANCEL (Lab tools / debug Clinic update, or found on app open /
 * clock change) switches to Appointments and opens B2 (moved) or B7 (cancelled) there, one after the other (moved first), once per event.
 */
export function LiveSheetHost() {
  const { bookings, flags, setFlags, settings, live, setLive, liveHold } = useStore();
  useEffect(() => {
    if (!bookings || live) return;
    const e = nextLive(sheetQueue(clinicEvents(), bookings, flags.seenSheets, settings.now), liveHold);
    if (!e) return;
    liveKeys.add(e.key);
    setFlags({ seenSheets: [...flags.seenSheets, e.key] });
    setLive(e);
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/appointments');
  }, [bookings, live, flags.seenSheets, settings.now, liveHold]);
  return null;
}
