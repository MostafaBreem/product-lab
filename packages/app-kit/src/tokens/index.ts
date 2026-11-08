import { tokenSets } from './generated';

export type Scheme = 'light' | 'dark';
export type Lang = 'en' | 'ar';
export type TokenMap = (typeof tokenSets)['light_en'];
export type TokenKey = keyof TokenMap;

export type Brand = 'tabby' | 'vezeeta';

export function tokensFor(scheme: Scheme, lang: Lang, brand: Brand = 'tabby'): TokenMap {
  const key = brand === 'tabby' ? `${scheme}_${lang}` : `${brand}_${scheme}_${lang}`;
  return (tokenSets as unknown as Record<string, TokenMap>)[key];
}
export { tokenSets };
