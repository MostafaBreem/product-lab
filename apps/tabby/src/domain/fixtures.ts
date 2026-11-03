// build-spec-data.md > Fixtures. Amounts in halalas. Mock clock today = Sat 31 Oct 2026, 8:15 AM.
import * as fmt from '@lab/app-kit/format';
import type { Merchant, PaymentMethod, Purchase, Scenario } from './types';

export const TODAY = '2026-10-31';
export const NOW_TIME = '08:15';

export const merchants: Record<string, Merchant> = {
  noon: { id: 'noon', name: { en: 'Noon', ar: 'نون' }, logoText: 'n', logoColor: '#F5C400' },
  namshi: { id: 'namshi', name: { en: 'Namshi', ar: 'نمشي' }, logoText: 'N', logoColor: '#1A1A1A' },
  jarir: { id: 'jarir', name: { en: 'Jarir', ar: 'جرير' }, logoText: 'J', logoColor: '#D7262F' },
};

const D: Record<Scenario, string> = { due: '2026-11-05', overdue: '2026-10-28', 'one-overdue': '2026-10-28', 'caught-up': '2026-10-28' };

export function buildPurchases(s: Scenario): Purchase[] {
  const d = D[s];
  const m1 = fmt.addMonths(d, 1);
  const m2 = fmt.addMonths(d, 2);
  const noonP2Paid = s === 'one-overdue' || s === 'caught-up' ? '2026-10-30' : undefined;
  const namshiP3Paid = s === 'caught-up' ? '2026-10-30' : undefined;
  return [
    {
      id: 'noon-48213', merchant: merchants.noon, boughtAt: '2026-09-30', total: 50000, orderNumber: 'NOON-48213', extendFee: 2000,
      instalments: [
        { id: 'noon-1', purchaseId: 'noon-48213', number: 1, of: 4, amount: 12500, dueDate: '2026-09-30', paidAt: '2026-09-30', extendable: false },
        { id: 'noon-2', purchaseId: 'noon-48213', number: 2, of: 4, amount: 12500, dueDate: d, paidAt: noonP2Paid, extendable: true },
        { id: 'noon-3', purchaseId: 'noon-48213', number: 3, of: 4, amount: 12500, dueDate: m1, extendable: true },
        { id: 'noon-4', purchaseId: 'noon-48213', number: 4, of: 4, amount: 12500, dueDate: m2, extendable: true },
      ],
    },
    {
      id: 'namshi-30577', merchant: merchants.namshi, boughtAt: '2026-09-02', total: 75000, orderNumber: 'NAMSHI-30577', extendFee: 3000,
      instalments: [
        { id: 'namshi-1', purchaseId: 'namshi-30577', number: 1, of: 4, amount: 18750, dueDate: '2026-09-02', paidAt: '2026-09-02', extendable: false },
        { id: 'namshi-2', purchaseId: 'namshi-30577', number: 2, of: 4, amount: 18750, dueDate: '2026-10-02', paidAt: '2026-10-02', extendable: false },
        { id: 'namshi-3', purchaseId: 'namshi-30577', number: 3, of: 4, amount: 18750, dueDate: d, paidAt: namshiP3Paid, extendable: true },
        { id: 'namshi-4', purchaseId: 'namshi-30577', number: 4, of: 4, amount: 18750, dueDate: m1, extendable: true },
      ],
    },
    {
      id: 'jarir-11902', merchant: merchants.jarir, boughtAt: '2026-09-15', total: 120000, orderNumber: 'JARIR-11902', extendFee: 4000,
      instalments: [
        { id: 'jarir-1', purchaseId: 'jarir-11902', number: 1, of: 4, amount: 30000, dueDate: '2026-09-15', paidAt: '2026-09-15', extendable: false },
        { id: 'jarir-2', purchaseId: 'jarir-11902', number: 2, of: 4, amount: 30000, dueDate: '2026-10-15', paidAt: '2026-10-15', extendable: false },
        { id: 'jarir-3', purchaseId: 'jarir-11902', number: 3, of: 4, amount: 30000, dueDate: '2026-12-15', extendable: true },
        { id: 'jarir-4', purchaseId: 'jarir-11902', number: 4, of: 4, amount: 30000, dueDate: '2027-01-15', extendable: true },
      ],
    },
  ];
}

export function buildMethods(s: Scenario): PaymentMethod[] {
  const failed = s === 'overdue' || s === 'one-overdue';
  return [
    { id: 'applepay', type: 'applePay', kind: 'debit', isDefault: true },
    { id: 'visa-4417', type: 'card', brand: 'Visa', last4: '4417', kind: 'debit', isDefault: false, lastFailureAt: failed ? '2026-10-28' : undefined },
    { id: 'mc-5520', type: 'card', brand: 'Mastercard', last4: '5520', kind: 'credit', isDefault: false },
  ];
}
