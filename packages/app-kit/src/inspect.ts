import { Platform } from 'react-native';
/** Web only: tags a kit component root (data-lab, data-lab-label, data-lab-state) so the demo app's inspect mode can name what was tapped. No effect on native. */
export function lab(name: string, label?: string, state?: string): object {
  return Platform.OS === 'web' ? { dataSet: { lab: name, labLabel: label ?? '', labState: state ?? '' } } : {};
}
