import { tokenSets } from './generated';

export type Scheme = 'light' | 'dark';
export type Lang = 'en' | 'ar';
export type TokenMap = (typeof tokenSets)['light_en'];
export type TokenKey = keyof TokenMap;

export function tokensFor(scheme: Scheme, lang: Lang): TokenMap {
  return tokenSets[`${scheme}_${lang}`] as TokenMap;
}
export { tokenSets };
