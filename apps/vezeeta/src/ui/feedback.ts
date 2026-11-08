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
