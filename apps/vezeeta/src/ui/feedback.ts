// Haptics + notification permission (build-spec-screens.md > Motion; build-spec-rules.md > Round 2 fixes). No-op on web.
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const native = Platform.OS !== 'web';
export const haptic = {
  /** A3 opens (selection; no haptic per slot tap). */
  selection: () => { if (native) Haptics.selectionAsync().catch(() => {}); },
  /** Booking success. */
  success: () => { if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); },
  /** slotTaken notice. */
  /** B2b keep (Motion: Toast in, light on keep). */
  light: () => { if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); },
  warning: () => { if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); },
};

/** iOS permission prompt; web skips the OS prompt and reports 'web'. */
export async function askNotifications(): Promise<'granted' | 'denied' | 'web'> {
  if (!native) return 'web';
  try {
    const r = await Notifications.requestPermissionsAsync();
    return r.granted ? 'granted' : 'denied';
  } catch { return 'denied'; }
}

/** Current OS permission without asking (R1 Notice, push delivery). Web = 'web' (banners only). */
export async function notificationStatus(): Promise<'granted' | 'denied' | 'undetermined' | 'web'> {
  if (!native) return 'web';
  try {
    const r = await Notifications.getPermissionsAsync();
    return r.granted ? 'granted' : r.canAskAgain ? 'undetermined' : 'denied';
  } catch { return 'denied'; }
}
