// Language + theme for the docs site, outside Storybook globals: a global change reloads the whole
// preview frame (blank flash, scroll to top). The toolbar (manager.tsx) writes localStorage and sends
// PREFS_EVENT; the preview re-renders in place. Manager and preview share one origin, so one store.
export type Prefs = { lang: 'en' | 'ar'; scheme: 'light' | 'dark' };
export const PREFS_KEY = 'lab-docs-prefs';
export const PREFS_EVENT = 'lab/prefs';
const DEFAULT: Prefs = { lang: 'en', scheme: 'light' };

export function readPrefs(): Prefs {
  try {
    const v = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? 'null');
    if (v && (v.lang === 'en' || v.lang === 'ar') && (v.scheme === 'light' || v.scheme === 'dark')) return v;
  } catch { /* storage blocked or empty: defaults */ }
  return DEFAULT;
}
export function writePrefs(p: Prefs) {
  try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* storage blocked: this visit only */ }
}
