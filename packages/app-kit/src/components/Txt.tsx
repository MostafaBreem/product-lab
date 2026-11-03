import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme, type TypeRole } from '../theme';
import type { TokenKey } from '../tokens';

type Props = Omit<TextProps, 'role' | 'style'> & { role: TypeRole; color?: TokenKey; wrap?: boolean; tabular?: boolean; align?: 'start' | 'center' | 'end'; style?: TextStyle | TextStyle[] };

/** Every text in the kit goes through Txt: type role + colour token, writing direction from the language. */
export function Txt({ role, color = 'color/text/content/default', wrap, tabular, align = 'start', style, ...rest }: Props) {
  const th = useTheme();
  const textAlign = align === 'center' ? 'center' : (align === 'start') !== th.isRTL ? 'left' : 'right';
  return (
    <Text
      {...rest}
      style={[th.type(role, { wrap, tabular }), { color: th.t(color) as string, textAlign, writingDirection: th.isRTL ? 'rtl' : 'ltr' }, style as TextStyle]}
    />
  );
}
