import { fmt } from '@lab/app-kit';
import type { Item, Lang } from '../domain/types';
import type { Strings } from '../domain/strings';

export const m = (h: number, lang: Lang) => fmt.money(h, lang);
export const dd = (d: string, lang: Lang) => fmt.dayDate(d, lang);
export const merchantName = (x: Item, lang: Lang) => x.merchant.name[lang];
/** "Noon and Namshi" — unique merchants in item order. */
export function who(items: Item[], lang: Lang, s: Strings) {
  const names = [...new Set(items.map((x) => x.merchant.name[lang]))];
  if (names.length <= 1) return names[0] ?? '';
  return s.common.and(names.slice(0, -1).join(lang === 'ar' ? '، ' : ', '), names[names.length - 1]);
}
export const newKey = () => `k-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
