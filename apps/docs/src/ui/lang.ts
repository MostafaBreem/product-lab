import { useTheme } from '@lab/app-kit';
/** Pick EN or AR sample copy by the toolbar language. */
export const useL = () => { const { lang } = useTheme(); return (en: string, ar: string) => (lang === 'ar' ? ar : en); };
export const useLang = () => useTheme().lang;
