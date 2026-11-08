import React, { createContext, useContext, useMemo } from 'react';
import type { TextStyle } from 'react-native';
import { fontFamily } from './fonts';
import { tokensFor, type Brand, type Lang, type Scheme, type TokenKey, type TokenMap } from './tokens';

export type TypeRole =
  | 'display/lg' | 'display/md'
  | 'heading/lg' | 'heading/md' | 'heading/sm'
  | 'body/lg' | 'body/md' | 'body/sm'
  | 'label/lg' | 'label/md' | 'label/sm'
  | 'caption';

export type Theme = {
  scheme: Scheme;
  lang: Lang;
  brand: Brand;
  isRTL: boolean;
  tokens: TokenMap;
  /** Token value by Figma path, e.g. t('color/text/content/default'). */
  t: <K extends TokenKey>(key: K) => TokenMap[K];
  /** Text style for a type role. wrap = paragraph line height (taller in Arabic). */
  type: (role: TypeRole, opts?: { wrap?: boolean; tabular?: boolean }) => TextStyle;
};

const Ctx = createContext<Theme | null>(null);

export function makeTheme(scheme: Scheme, lang: Lang, brand: Brand = 'tabby'): Theme {
  const tokens = tokensFor(scheme, lang, brand);
  const any = tokens as unknown as Record<string, unknown>;
  const t = ((k: string) => {
    if (!(k in any)) throw new Error(`Unknown token ${k}`);
    return any[k];
  }) as Theme['t'];
  const type: Theme['type'] = (role, opts) => {
    const weight = any[`type/${role}/weight`] as number;
    const lh = (opts?.wrap ? any[`type/${role}/line-height-wrap`] : undefined) ?? any[`type/${role}/line-height`];
    return {
      fontFamily: fontFamily(lang, weight),
      fontSize: any[`font-size/${role}`] as number,
      lineHeight: lh as number,
      fontVariant: opts?.tabular ? ['tabular-nums'] : undefined,
    };
  };
  return { scheme, lang, brand, isRTL: lang === 'ar', tokens, t, type };
}

export function ThemeProvider({ scheme, lang, brand = 'tabby', children }: { scheme: Scheme; lang: Lang; brand?: Brand; children: React.ReactNode }) {
  const theme = useMemo(() => makeTheme(scheme, lang, brand), [scheme, lang, brand]);
  return <Ctx.Provider value={theme}>{children}</Ctx.Provider>;
}

export function useTheme(): Theme {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme outside ThemeProvider');
  return v;
}
