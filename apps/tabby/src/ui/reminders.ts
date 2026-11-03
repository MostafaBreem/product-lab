// Schedules local reminders from the pure plan (domain/reminders.ts). Real fire time = plan day 9:00 device time.
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { analytics, fmt } from '@lab/app-kit';
import { api } from '../domain/server';
import { plan } from '../domain/reminders';
import type { Strings } from '../domain/strings';
import type { Lang } from '../domain/types';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });

export async function scheduleReminders(st: { s: Strings; lang: Lang; settings: { today: string }; flags: { osPermission: string } }) {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  if (st.flags.osPermission !== 'granted') return 0;
  const prefs = await api.prefs().catch(() => null);
  if (!prefs) return 0;
  const { s, lang } = st;
  const items = plan(api.allUnpaid(), prefs, st.settings.today);
  let n = 0;
  for (const p of items) {
    const amount = fmt.money(p.amount, lang);
    const names = p.merchants.join(lang === 'ar' ? ' و' : ' and ');
    const content = p.kind === 'before' ? { title: s.rem.nDueTomorrow, body: s.rem.nBody(amount, names) }
      : p.kind === 'after' ? { title: s.rem.nWasDue, body: s.rem.nBody(amount, names) }
      : { title: p.daysToDue === 0 ? s.rem.nDueToday : p.daysToDue === 1 ? s.rem.nDueTomorrow : s.rem.nDueIn(fmt.days(p.daysToDue, lang)), body: s.rem.nSalaryBody(amount, fmt.dayDate(p.dueDate, lang)) };
    const [y, mo, d] = p.fireDay.split('-').map(Number);
    const date = new Date(y, mo - 1, d, 9, 0);
    if (date.getTime() <= Date.now()) continue; // mock clock is in the past vs device time; demo uses "fire in 5 s"
    await Notifications.scheduleNotificationAsync({ content: { ...content, data: { url: '/money', kind: p.kind } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date } }).catch(() => {});
    n++;
  }
  return n;
}

/** Notification tap → Money tab (deep link), event reminder_opened. */
export function listenForReminderTaps(refresh: () => void) {
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const data = r.notification.request.content.data as { url?: string; kind?: string };
    analytics.track('reminder_opened', { kind: data.kind });
    refresh();
    router.navigate((data.url ?? '/money') as '/money');
  });
  return () => sub.remove();
}
