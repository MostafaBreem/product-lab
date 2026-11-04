import { useTheme } from '@lab/app-kit';
/** Pick EN or AR sample copy by the toolbar language. */
export const useL = () => { const { lang } = useTheme(); return (en: string, ar: string) => (lang === 'ar' ? ar : en); };
export const useLang = () => useTheme().lang;
/** Fixed examples hide the Controls panel (their props are set in code); only Playground stories are live. */
export const NOCTRL = { controls: { disable: true } };
/** Playground: these args are live, and only these (hides props the code sets, e.g. ListRow subtitleColor). */
export const pg = <A extends Record<string, unknown>>(args: A) => ({ args, parameters: { controls: { disable: false, include: Object.keys(args) } } });
/** Text control that follows the language toggle: an unedited EN default shows its AR twin. */
export const useT = () => { const lang = useLang(); return (v: string | undefined, en: string, ar: string) => (lang === 'ar' && (v ?? '') === en ? ar : v ?? ''); };
