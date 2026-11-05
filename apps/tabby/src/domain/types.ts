import type * as fmt from '@lab/app-kit/format';
type Day = string;
export type Lang = 'en' | 'ar';
export type Scenario = 'due' | 'overdue' | 'one-overdue' | 'caught-up';
export type Range = '7d' | '30d' | 'all';
export type InstalmentStatus = 'upcoming' | 'due' | 'overdue' | 'paid';

export type Merchant = { id: string; name: { en: string; ar: string }; logoText: string; logoColor: string };
export type Instalment = {
  id: string; purchaseId: string; number: number; of: number; amount: number; dueDate: Day;
  extendedUntil?: Day; extendedAt?: Day; extensionFee?: number; paidAt?: Day; extendable: boolean;
};
export type Purchase = { id: string; merchant: Merchant; boughtAt: Day; total: number; orderNumber: string; instalments: Instalment[]; extendFee: number };
export type PaymentMethod = { id: string; type: 'applePay' | 'card'; brand?: 'Visa' | 'Mastercard'; last4?: string; kind: 'debit' | 'credit'; isDefault: boolean; lastFailureAt?: Day; walletCard?: { brand: 'Visa' | 'Mastercard'; last4: string } };
export type Item = { instalmentId: string; purchaseId: string; merchant: Merchant; number: number; of: number; amount: number; dueDate: Day };
export type PaymentStatus = 'succeeded' | 'declined' | 'unknown';
export type Payment = { id: string; items: Item[]; amount: number; methodId: string; status: PaymentStatus; createdAt: Day };
export type CardState = 'due' | 'overdue' | 'caughtUp';
export type Summary = {
  card: { state: CardState; amount: number; dueDate: Day; daysLate?: number; items: Item[]; failedMethod?: { brand: string; last4: string; at: Day }; extendable: boolean };
  rows: Item[]; due30: number; totalToPay: number; openPlans: number; methods: PaymentMethod[]; asOf: { day: Day; time: string };
};
export type NotificationPrefs = { deals: { push: boolean; sms: boolean; whatsapp: boolean; email: boolean }; salaryDay: { on: boolean; day: number | 'last' | null } };
export type _Fmt = typeof fmt;
