// Contrast check for the token pairs listed in tokens.json ($extensions.design-flow.pairs), all 4 modes.
// text >= 4.5, large-text >= 3, ui >= 3 (WCAG 2.1 AA). Exit 1 on any failure. Run in CI.
import { readFileSync } from 'node:fs';
const gen = readFileSync(new URL('../src/tokens/generated.ts', import.meta.url), 'utf8');
const sets = JSON.parse(gen.slice(gen.indexOf('{'), gen.lastIndexOf(' as const')));
const src = JSON.parse(readFileSync(new URL('../../../design/tokens/tokens.json', import.meta.url), 'utf8'));
const pairs = src.$extensions['design-flow'].pairs;
const lum = (hex) => {
  const h = hex.replace('#', '').slice(0, 6);
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// See-through colours (#rrggbbaa) are composited over the surfaces they sit on; the worst result counts (2026-11-05, red/50-a24).
const BASES = ['color/surface/default', 'color/bg/default', 'bottom-sheet/container/fill'];
const over = (fg, bg) => {
  const h = fg.replace('#', ''); if (h.length !== 8) return fg;
  const al = parseInt(h.slice(6, 8), 16) / 255; const f = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); const g = [0, 2, 4].map((i) => parseInt(bg.replace('#', '').slice(i, i + 2), 16));
  return '#' + f.map((v, i) => Math.round(v * al + g[i] * (1 - al)).toString(16).padStart(2, '0')).join('');
};
const worst = (a, b, set) => {
  const bases = BASES.map((k) => set[k]).filter((x) => typeof x === 'string');
  const bs = b.replace('#', '').length === 8 ? bases.map((s) => over(b, s)) : [b];
  return Math.min(...bs.map((bb) => ratio(over(a, bb), bb)));
};
const min = { text: 4.5, 'large-text': 3, ui: 3 };
let fail = 0, n = 0;
for (const mode of ['light_en', 'dark_en', 'light_ar', 'dark_ar']) {
  for (const [fg, bg, kind] of pairs) {
    const k1 = fg.split('/').slice(0).join('/'), k2 = bg;
    const a = sets[mode][k1], b = sets[mode][k2];
    if (typeof a !== 'string' || typeof b !== 'string') continue;
    n++;
    const r = worst(a, b, sets[mode]);
    if (r < (min[kind] ?? 4.5)) { fail++; console.log(`FAIL ${mode} ${fg} on ${bg} (${kind}) ${r.toFixed(2)}`); }
  }
}
console.log(`contrast: ${n} pair checks, ${fail} below AA`);
process.exit(fail ? 1 : 0);
