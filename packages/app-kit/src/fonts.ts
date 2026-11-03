// Bawazek Sans = IBM Plex Sans + Saudi riyal sign U+20C1 (OFL; see assets/fonts/*.txt).
// One registered family per weight, because iOS picks custom fonts by PostScript family, not by fontWeight.
/** Called by the app at start (Metro bundles the files). Kept in a function so web tools without require() can import the kit. */
export const fontAssets = () => ({
  'BawazekSans-400': require('../assets/fonts/BawazekSans.ttf'),
  'BawazekSans-500': require('../assets/fonts/BawazekSans-Medm.ttf'),
  'BawazekSans-600': require('../assets/fonts/BawazekSans-SmBld.ttf'),
  'BawazekSans-700': require('../assets/fonts/BawazekSans-Bold.ttf'),
  'BawazekSansArabic-400': require('../assets/fonts/BawazekSansArabic.ttf'),
  'BawazekSansArabic-500': require('../assets/fonts/BawazekSansArabic-Medm.ttf'),
  'BawazekSansArabic-600': require('../assets/fonts/BawazekSansArabic-SmBld.ttf'),
  'BawazekSansArabic-700': require('../assets/fonts/BawazekSansArabic-Bold.ttf'),
});

export function fontFamily(lang: 'en' | 'ar', weight: number): string {
  const w = weight >= 700 ? 700 : weight >= 600 ? 600 : weight >= 500 ? 500 : 400;
  return `${lang === 'ar' ? 'BawazekSansArabic' : 'BawazekSans'}-${w}`;
}
