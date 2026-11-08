import React, { useState } from 'react';
import { TextInput, View, type KeyboardTypeOptions, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Txt } from './Txt';

type Props = {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string;
  /** Fixed lead text, e.g. "+20". Always LTR (isolated), also in Arabic. */
  prefix?: string;
  /** Caller's localized suffix, e.g. "(optional)" / "(اختياري)". Shown after the label. */
  optional?: string;
  /** Error message: critical border + message under the field, announced (role alert). */
  error?: string;
  keyboardType?: KeyboardTypeOptions; inputMode?: TextInputProps['inputMode']; testID?: string;
};

const LRI = '⁦', PDI = '⁩';

/** Text field: label over a 48 field (radius md 12), label gap 8. Border default → focus → critical on error. Text aligns to the reading direction. */
export function TextField({ label, value, onChangeText, placeholder, prefix, optional, error, keyboardType, inputMode, testID }: Props) {
  const th = useTheme();
  const [focus, setFocus] = useState(false);
  const border = error ? 'color/border/critical/default' : focus ? 'color/border/focus/default' : 'color/border/default';
  const text = th.type('body/md');
  return (
    <View {...lab('TextField', label, [error && 'error', focus && 'focus'].filter(Boolean).join(' · ') || 'default')} style={{ gap: th.t('space/gap-y/xs') }}>
      <View style={{ flexDirection: 'row', gap: th.t('space/gap-x/3xs') }}>
        <Txt role="label/md">{label}</Txt>
        {optional ? <Txt role="label/md" color="color/text/content/secondary/default">{optional}</Txt> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/xs'), height: th.t('size/height/md'), borderRadius: th.t('radius/md'), borderWidth: th.t(focus || error ? 'border-width/md' : 'border-width/sm'), borderColor: th.t(border) as string, backgroundColor: th.t('color/surface/default') as string, paddingHorizontal: th.t('space/padding-x/md') }}>
        {prefix ? <Txt role="body/md" color="color/text/content/secondary/default" style={{ writingDirection: 'ltr' }}>{`${LRI}${prefix}${PDI}`}</Txt> : null}
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={th.t('color/text/content/tertiary/default') as string}
          keyboardType={keyboardType} inputMode={inputMode} testID={testID} accessibilityLabel={optional ? `${label} ${optional}` : label}
          aria-invalid={!!error} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, alignSelf: 'stretch', ...text, color: th.t('color/text/content/default') as string, textAlign: th.isRTL ? 'right' : 'left', writingDirection: th.isRTL ? 'rtl' : 'ltr' }} />
      </View>
      {error ? <View role="alert" accessibilityLiveRegion="assertive"><Txt role="body/sm" color="color/text/content/critical/default" wrap>{error}</Txt></View> : null}
    </View>
  );
}
