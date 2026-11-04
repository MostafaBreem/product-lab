/**
 * Guard (workflow 10-app-build step 2, soft rule 2026-11-04): every colour, space,
 * size and radius in app-kit components, case apps and docs-site stories comes from a token.
 * Fails on:
 *  - a hex / rgb() / hsl() colour,
 *  - a style or size prop (gap, padding*, margin*, width, height, radius, inset, size, hitSlop, h, r)
 *    whose value holds a number other than 0 (also inside sums like `insets.top + 6`).
 * Multipliers and divisors (`* 5`, `/ 2`) are counts, not values.
 * Allowed: the generated token table; merchant logo colours (`logo` on the line);
 * a line marked `raw-ok: <reason>` or the line right after that marker.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(__dirname, '../../..');
const dirs = ['packages/app-kit/src/components', 'packages/app-kit/src/web', 'packages/app-kit/src/gallery.tsx', 'apps/tabby/src', 'apps/docs/src/stories'];
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/;
const PROPS = '(?:width|height|minHeight|maxHeight|minWidth|maxWidth|borderRadius|border[A-Za-z]*Radius|gap|rowGap|columnGap|padding[A-Za-z]*|margin[A-Za-z]*|top|left|right|bottom|inset|size|hitSlop|h|r)';
const STYLE = new RegExp(`\\b${PROPS}\\s*(?::|=\\{)\\s*([^,}\\]]+)`, 'g');
const NUM = /(?<![\w.'"/*])(?<![*/]\s)(\d+(?:\.\d+)?)(?![\w%'"])/g; // `* 5`, `/ 2` = counts / halves, not values

function files(p: string): string[] {
  if (!statSync(p).isDirectory()) return [p];
  return readdirSync(p).flatMap((n) => {
    if (n === 'node_modules' || n.startsWith('.')) return [];
    const q = join(p, n);
    if (statSync(q).isDirectory()) return files(q);
    return /\.(tsx?|jsx?)$/.test(n) && !/\.test\./.test(n) ? [q] : [];
  });
}

function rawNumber(line: string): boolean {
  for (const m of line.matchAll(STYLE)) {
    const v = m[1].replace(/th\.t\([^)]*\)|th\.type\([^)]*\)/g, '');
    for (const n of v.matchAll(NUM)) if (Number(n[1]) !== 0) return true;
  }
  return false;
}

test('no raw colour or size values outside tokens', () => {
  const hits: string[] = [];
  for (const d of dirs) for (const f of files(join(root, d))) {
    const rel = relative(root, f);
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      if (line.includes('raw-ok:') || (lines[i - 1] ?? '').includes('raw-ok:')) return;
      const colour = COLOUR.test(line) && !/logo/i.test(line);
      if (colour || rawNumber(line)) hits.push(`${rel}:${i + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
  assert.deepEqual(hits, [], `Raw values found, use a token:\n${hits.join('\n')}`);
});
