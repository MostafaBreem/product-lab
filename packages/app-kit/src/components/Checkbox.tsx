import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { lab } from '../inspect';
import { Icon } from './Icon';
import { Txt } from './Txt';

/** Checkbox row: 24 box + label, 44 min row height (whole row taps), gap 12. Checked = brand fill + check. */
export function Checkbox({ checked, onChange, label, testID }: { checked: boolean; onChange: (v: boolean) => void; label: string; testID?: string }) {
  const th = useTheme();
  return (
    <Pressable {...lab('Checkbox', label, checked ? 'checked' : 'unchecked')} testID={testID} role="checkbox" accessibilityRole="checkbox" accessibilityState={{ checked }} aria-checked={checked}
      accessibilityLabel={label} onPress={() => onChange(!checked)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: th.t('space/gap-x/sm'), minHeight: th.t('size/touch/min') }}>
      <View style={{ width: th.t('size/height/3xs'), height: th.t('size/height/3xs'), borderRadius: th.t('radius/xs'), alignItems: 'center', justifyContent: 'center',
        borderWidth: th.t('border-width/md'), borderColor: th.t(checked ? 'color/fill/brand/default' : 'color/border/strong/default') as string,
        backgroundColor: checked ? (th.t('color/fill/brand/default') as string) : 'transparent' }}>
        {checked ? <Icon name="check" size={th.t('size/icon/xs')} color="color/icon/on-fill/brand/default" weight="bold" /> : null}
      </View>
      <View style={{ flex: 1 }}><Txt role="body/md" wrap>{label}</Txt></View>
    </Pressable>
  );
}
