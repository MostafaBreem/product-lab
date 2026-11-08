// A3 validation (build-spec-rules.md > Validation).
import { westernDigits } from './format';

/** Name: 2-60 letters, Arabic or Latin, spaces. */
export function validName(s: string) {
  const t = s.trim();
  const letters = t.replace(/\s/g, '');
  return /^[A-Za-z؀-ۿ\s]+$/.test(t) && !/[٠-٩۰-۹]/.test(t) && letters.length >= 2 && letters.length <= 60;
}
/**
 * Phone: 10 digits after +20 starting 10 / 11 / 12 / 15; accepts leading 0, +20, 0020, Arabic-Indic digits, spaces.
 * Returns stored "+20XXXXXXXXXX" or null.
 */
export function normalisePhone(input: string): string | null {
  let s = westernDigits(input).replace(/[\s\-]/g, '');
  if (s.startsWith('+20')) s = s.slice(3);
  else if (s.startsWith('0020')) s = s.slice(4);
  else if (s.startsWith('0')) s = s.slice(1);
  return /^1[0125]\d{8}$/.test(s) ? `+20${s}` : null;
}
/** Email optional: simple @ + dot check. */
export const validEmail = (s: string) => s.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
export type FormErrors = { name?: true; phone?: true; email?: true };
/** Errors on Book tap; first error key = field to focus. */
export function validateForm(f: { name: string; phone: string; email?: string }): { errors: FormErrors; first?: keyof FormErrors; phone?: string } {
  const errors: FormErrors = {};
  if (!validName(f.name)) errors.name = true;
  const phone = normalisePhone(f.phone) ?? undefined;
  if (!phone) errors.phone = true;
  if (!validEmail(f.email ?? '')) errors.email = true;
  const first = (['name', 'phone', 'email'] as const).find((k) => errors[k]);
  return { errors, first, phone };
}
