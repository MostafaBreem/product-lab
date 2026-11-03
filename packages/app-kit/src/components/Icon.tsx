import React from 'react';
import * as P from 'phosphor-react-native';
import { useTheme } from '../theme';
import type { TokenKey } from '../tokens';

/** Phosphor icons (decisions/system.md). Directional glyphs mirror in Arabic. */
export const icons = {
  'caret-right': P.CaretRightIcon, 'caret-left': P.CaretLeftIcon, x: P.X, plus: P.PlusIcon, coins: P.CoinsIcon, 'credit-card': P.CreditCardIcon,
  question: P.QuestionIcon, chat: P.ChatCircleIcon, 'warning-circle': P.WarningCircleIcon, info: P.InfoIcon, 'wifi-slash': P.WifiSlashIcon,
  'bell-slash': P.BellSlashIcon, 'check-circle': P.CheckCircleIcon, check: P.CheckIcon, circle: P.CircleIcon, 'radio-button': P.RadioButtonIcon,
  square: P.SquareIcon, 'check-square': P.CheckSquareIcon, 'receipt-x': P.ReceiptXIcon, pause: P.PauseCircleIcon, bank: P.BankIcon, calendar: P.CalendarIcon,
  'calendar-check': P.CalendarCheckIcon, 'help-circle': P.QuestionIcon, copy: P.CopyIcon, compass: P.CompassIcon, storefront: P.StorefrontIcon,
  wallet: P.WalletIcon, user: P.UserIcon, alert: P.WarningCircleIcon, bell: P.BellIcon, 'arrows-clockwise': P.ArrowsClockwiseIcon,
} as const;
export type IconName = keyof typeof icons;
const DIRECTIONAL: IconName[] = ['caret-right', 'caret-left'];

export function Icon({ name, size = 24, color = 'color/icon/content/default', weight = 'regular' }: { name: IconName; size?: number; color?: TokenKey; weight?: 'regular' | 'fill' | 'bold' }) {
  const th = useTheme();
  const C = icons[name];
  return <C size={size} color={th.t(color) as string} weight={weight} mirrored={th.isRTL && DIRECTIONAL.includes(name)} />;
}
