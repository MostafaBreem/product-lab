// Generates the docs pages (MDX) and the agent files from design/ (lab copy) + app-kit.
// Run: npm run gen (part of build). Never edit src/generated or public/*.json by hand.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { components } from '../../../packages/app-kit/src/meta';
import { tokenSets } from '../../../packages/app-kit/src/tokens/generated';

const ROOT = join(__dirname, '..', '..', '..');
const DESIGN = join(ROOT, 'design');
const GEN = join(__dirname, '..', 'src', 'generated');
const PUB = join(__dirname, '..', 'public');
const SITE = 'https://mostafabreem.github.io/product-lab';
rmSync(GEN, { recursive: true, force: true });
mkdirSync(join(GEN, 'components'), { recursive: true });
mkdirSync(join(GEN, 'foundations'), { recursive: true });
mkdirSync(PUB, { recursive: true });

// ---------- tokens: raw (descriptions, refs) + resolved values ----------
type Raw = { path: string; value: unknown; type?: string; description?: string; modes: Record<string, unknown> };
const raw: Raw[] = [];
const src = JSON.parse(readFileSync(join(DESIGN, 'tokens', 'tokens.json'), 'utf8'));
(function walk(n: any, p: string[], type?: string) {
  if (!n || typeof n !== 'object' || Array.isArray(n)) return;
  const t = n.$type ?? type;
  if ('$value' in n) { raw.push({ path: p.join('/'), value: n.$value, type: t, description: n.$description, modes: n.$extensions?.['design-flow']?.modes ?? {} }); return; }
  for (const [k, v] of Object.entries(n)) if (!k.startsWith('$')) walk(v, [...p, k], t);
})({ semantic: src.semantic, component: src.component }, [], undefined);
const R = tokenSets as unknown as Record<string, Record<string, unknown>>;
const key = (p: string) => p.split('/').slice(1).join('/'); // drop tier
const refOf = (v: unknown) => (typeof v === 'string' && /^\{(.+)\}$/.test(v) ? v.slice(1, -1).replace(/\./g, '/') : null);
// used-by: semantic token <- component tokens that reference it (any mode)
const usedBy = new Map<string, Set<string>>();
const compName = (segment: string) => components.find((c) => c.tokens === segment)?.name ?? segment;
for (const t of raw.filter((x) => x.path.startsWith('component/'))) {
  for (const v of [t.value, ...Object.values(t.modes)]) {
    const r = refOf(v);
    if (r?.startsWith('semantic/')) { const k = key(r); if (!usedBy.has(k)) usedBy.set(k, new Set()); usedBy.get(k)!.add(compName(t.path.split('/')[1])); }
  }
}
// used-by, part 2: semantic tokens a component reads directly in code (th.t('shadow/sm')), not through a component token.
const CODE = join(ROOT, 'packages', 'app-kit', 'src', 'components');
const semKeys = new Set(raw.filter((t) => t.path.startsWith('semantic/')).map((t) => key(t.path)));
for (const f of readdirSync(CODE).filter((f) => f.endsWith('.tsx'))) {
  const name = f.replace('.tsx', '');
  if (!components.some((c) => c.name === name)) continue;
  for (const m of readFileSync(join(CODE, f), 'utf8').matchAll(/th\.t\('([^']+)'\)/g)) {
    if (!semKeys.has(m[1])) continue;
    if (!usedBy.has(m[1])) usedBy.set(m[1], new Set());
    usedBy.get(m[1])!.add(name);
  }
}
const css = (v: any) => (v && typeof v === 'object' ? `${v.offsetX}px ${v.offsetY}px ${v.blur}px ${v.spread ?? 0}px ${v.color}` : String(v));
const fmtVal = (v: unknown): string => {
  if (v && typeof v === 'object') { const s = v as any; return `${s.offsetX} ${s.offsetY} blur ${s.blur} ${s.color}`; }
  return String(v);
};
const sw = (v: unknown) => (typeof v === 'string' && /^#[0-9a-f]{6,8}$/i.test(v) ? `<span className="swatch" style={{background:'${v}'}}></span>` : '');
const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/[{}<>]/g, (c) => ({ '{': '&#123;', '}': '&#125;', '<': '&lt;', '>': '&gt;' }[c]!));

// ---------- foundations ----------
const groups: { title: string; file: string; prefix: string[]; intro: string }[] = [
  { title: 'Colour', file: 'Colour', prefix: ['color/'], intro: 'Semantic colours. Components bind these (or their own component tokens), never raw primitives. Light and dark values; contrast pairs are checked in CI.' },
  { title: 'Type', file: 'Type', prefix: ['type/', 'font-size/'], intro: '12 type roles. Same line heights in EN and AR; wrapping paragraphs use the taller *wrap* line height in Arabic so marks never collide.' },
  { title: 'Spacing', file: 'Spacing', prefix: ['space/'], intro: 'Padding and gap scale shared by every component. Screen margin 16; sections 24 apart.' },
  { title: 'Radius', file: 'Radius', prefix: ['radius/'], intro: 'Shape scale. Cards 20, controls 12, tags 4, pills full.' },
  { title: 'Size', file: 'Size', prefix: ['size/'], intro: 'Control heights, icon sizes, minimum touch target 44.' },
  { title: 'Elevation', file: 'Elevation', prefix: ['shadow/'], intro: 'Shadows. Cards use sm.' },
];
const data: Record<string, unknown> = {};
for (const g of groups) {
  const rows = raw.filter((t) => t.path.startsWith('semantic/') && g.prefix.some((p) => key(t.path).startsWith(p)));
  const isColour = g.file === 'Colour';
  const lightDark = isColour || g.file === 'Elevation'; // values differ by theme, not by language
  let md = `import { Meta } from '@storybook/addon-docs/blocks';\nimport { Swatches, TypeSpecimen, Scale, Shadows } from '../../blocks';\nimport data from '../data.json';\n\n<Meta title="Foundations/${g.title}" />\n\n# ${g.title}\n\n${g.intro}\n\n`;
  if (isColour) {
    data.colour = rows.filter((t) => typeof R.light_en[key(t.path)] === 'string').map((t) => ({ k: key(t.path), light: R.light_en[key(t.path)], dark: R.dark_en[key(t.path)], desc: t.description, usedBy: [...(usedBy.get(key(t.path)) ?? [])].sort() }));
    md += `Each card: light on the left, dark on the right.\n\n<Swatches tokens={data.colour} />\n\n## Full table\n\n`;
  }
  if (g.file === 'Type') {
    const rolesList = ['display/lg', 'display/md', 'heading/lg', 'heading/md', 'heading/sm', 'body/lg', 'body/md', 'body/sm', 'label/lg', 'label/md', 'label/sm', 'caption'];
    data.type = rolesList.map((r) => ({ role: r, size: R.light_en[`font-size/${r}`], lh: R.light_en[`type/${r}/line-height`], weight: R.light_en[`type/${r}/weight`] }));
    md += `English on the left, Arabic on the right, real font (Bawazek Sans).\n\n<TypeSpecimen roles={data.type} />\n\n## Full table\n\n`;
  }
  if (['Spacing', 'Radius', 'Size'].includes(g.file)) {
    const kind = g.file === 'Spacing' ? 'space' : g.file === 'Radius' ? 'radius' : 'size';
    const items = rows.filter((t) => typeof R.light_en[key(t.path)] === 'number' && (kind !== 'space' || /^space\/(padding|gap-y)\//.test(key(t.path)))).map((t) => ({ k: key(t.path), v: R.light_en[key(t.path)] }));
    data[kind] = items;
    md += `<Scale kind="${kind}" items={data.${kind}} />\n\n## Full table\n\n`;
  }
  if (g.file === 'Elevation') {
    const sk = (m: string) => ({ bg: R[`${m}_en`]['color/bg/default'], surface: R[`${m}_en`]['color/surface/default'] });
    data.shadow = { light: sk('light'), dark: sk('dark'), items: rows.filter((t) => typeof R.light_en[key(t.path)] === 'object').map((t) => ({ k: key(t.path), light: css(R.light_en[key(t.path)]), dark: css(R.dark_en[key(t.path)]), desc: t.description, usedBy: [...(usedBy.get(key(t.path)) ?? [])].sort() })) };
    md += `Each token on a card, on the light and the dark page background.\n\n<Shadows data={data.shadow} />\n\n## Full table\n\n`;
  }
  md += lightDark ? '| Token | Light | Dark | Use | Used by |\n|---|---|---|---|---|\n' : '| Token | EN | AR | Use | Used by |\n|---|---|---|---|---|\n';
  for (const t of rows) {
    const k = key(t.path);
    const a = R.light_en[k];
    const b = lightDark ? R.dark_en[k] : R.light_ar[k];
    const ub = [...(usedBy.get(k) ?? [])].sort().join(', ') || '—';
    md += `| \`${k}\` | ${sw(a)}${esc(fmtVal(a))} | ${sw(b)}${esc(fmtVal(b))} | ${esc(t.description ?? '')} | ${ub} |\n`;
  }
  writeFileSync(join(GEN, 'foundations', `${g.file}.mdx`), md);
}
writeFileSync(join(GEN, 'data.json'), JSON.stringify(data));

// ---------- usage cards ----------
function usage(slug: string): Record<string, string> {
  const f = join(DESIGN, 'usage', `${slug}.md`);
  const out: Record<string, string> = {};
  if (!existsSync(f)) return out;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^- ([A-Za-z0-9 '’]+?)(?: \([^)]*\))?: (.+)$/);
    // Drop lab provenance notes like "(user 2026-11-04)" or "(added 2026-11-04, …)" from public text.
    if (m) out[m[1].trim()] = (out[m[1].trim()] ? out[m[1].trim()] + ' ' : '') + m[2].trim().replace(/\s*\((?:user|added|stated|reconsidered)[^)]*\)/g, '');
  }
  return out;
}
const SECTIONS: [string, string][] = [['Variant pick', 'Which variant'], ['Selection', 'Selection'], ['Content rules', 'Content'], ['Behaviour', 'Behaviour'], ['A11y', 'Accessibility'], ['RTL', 'Arabic and RTL']];
const storyFiles = readdirSync(join(__dirname, '..', 'src', 'stories')).map((f) => f.replace('.stories.tsx', ''));

const agentComponents: unknown[] = [];
for (const c of components) {
  const u = usage(c.slug);
  const ctoks = Object.keys(R.light_en).filter((k) => k.startsWith(`${c.tokens}/`));
  const story = storyFiles.includes(c.name) ? c.name : null;
  let md = `import { Meta, Canvas, Controls, Source } from '@storybook/addon-docs/blocks';\n`;
  if (story) md += `import * as S from '../../stories/${story}.stories';\n`;
  md += `import { Status, DoDont } from '../../blocks';\n`;
  md += `\n<Meta title="Components/${c.name}/Docs" />\n\n# ${c.name}\n\n<Status status="Stable" code="https://github.com/MostafaBreem/product-lab/blob/main/packages/app-kit/src/components/${c.name}.tsx" />\n\n${esc(u['Purpose'] ?? c.summary)}\n\n`;
  md += `<DoDont doText={${JSON.stringify(u['Use when'] ?? '')}} dontText={${JSON.stringify(u["Don't use"] ?? '')}} />\n\n`;
  if (story) {
    const names = [...readFileSync(join(__dirname, '..', 'src', 'stories', `${story}.stories.tsx`), 'utf8').matchAll(/export const (\w+)/g)].map((m) => m[1]);
    if (names.includes('Playground')) md += `## Playground\n\nChange the props in the table under the preview. The toolbar switches English / العربية and Light / Dark.\n\n<Canvas of={S.Playground} />\n\n<Controls of={S.Playground} />\n\n`;
    const ex = names.filter((n) => n !== 'Playground');
    if (ex.length) md += `## Examples\n\nReal screens' content, fixed in code.\n\n` + ex.map((n) => `### ${n.replace(/([a-z])([A-Z])/g, '$1 $2')}\n\n<Canvas of={S.${n}} />\n`).join('\n') + '\n';
  }
  for (const [k, title] of SECTIONS) if (u[k]) md += `## ${title}\n\n${esc(u[k])}\n\n`;
  if (c.variants?.length || c.states?.length) md += `## Variants and states\n\n${c.variants ? `- Variants: ${c.variants.join(' · ')}\n` : ''}${c.states ? `- States: ${c.states.join(' · ')}\n` : ''}\n`;
  md += `## Props\n\n| Prop | Type | Default | What it does |\n|---|---|---|---|\n${c.props.map((p) => `| \`${esc(p.name)}\` | \`${esc(p.type)}\` | ${p.default ? `\`${esc(p.default)}\`` : '—'} | ${esc(p.description)} |`).join('\n')}\n\n`;
  md += `## Code\n\n<Source language="tsx" code={${JSON.stringify(`import { ${c.name === 'Toast' ? 'useToast' : c.name} } from '@lab/app-kit';\n\n${c.example}`)}} />\n\n`;
  md += `## Tokens\n\nComponent tokens (light · dark). Change these, not the component code.\n\n| Token | Light | Dark | From |\n|---|---|---|---|\n`;
  for (const k of ctoks) {
    const rawTok = raw.find((t) => t.path === `component/${k}`);
    const from = rawTok ? (refOf(rawTok.value) ?? '') : '';
    md += `| \`${k}\` | ${sw(R.light_en[k])}${esc(fmtVal(R.light_en[k]))} | ${sw(R.dark_en[k])}${esc(fmtVal(R.dark_en[k]))} | ${from ? `\`${key(from)}\`` : '—'} |\n`;
  }
  md += `\n## Related\n\n${(u['Related'] ? esc(u['Related']) : c.related.join(', '))}\n`;
  writeFileSync(join(GEN, 'components', `${c.name}.mdx`), md);
  agentComponents.push({
    name: c.name, import: `import { ${c.name === 'Toast' ? 'ToastHost, useToast' : c.name} } from '@lab/app-kit'`, summary: c.summary, // code names (meta.ts); usage card wording stays on the docs page
    useWhen: u['Use when'], dontUse: u["Don't use"], content: u['Content rules'], behaviour: u['Behaviour'], a11y: u['A11y'], rtl: u['RTL'],
    variants: c.variants ?? [], states: c.states ?? [], props: c.props, example: c.example, tokens: ctoks, related: c.related,
    docs: `${SITE}/?path=/docs/components-${c.name.toLowerCase()}-docs--docs`,
  });
}

// ---------- rules pages ----------
const rulesMd = (title: string, file: string) => `import { Meta } from '@storybook/addon-docs/blocks';\n\n<Meta title="Rules/${title}" />\n\n` +
  esc(readFileSync(join(DESIGN, 'rules', file), 'utf8').replace(/^Status:.*$|^Parent:.*$|^Read when:.*$/gm, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'));
writeFileSync(join(GEN, 'rules-components.mdx'), rulesMd('Component rules', 'components.md'));
writeFileSync(join(GEN, 'rules-foundation-roles.mdx'), rulesMd('Foundation roles', 'foundation-roles.md'));

// ---------- agent files ----------
const tokenOut: Record<string, unknown> = {};
for (const t of raw) { const k = key(t.path); tokenOut[k] = { tier: t.path.split('/')[0], type: t.type, description: t.description, light_en: R.light_en[k], dark_en: R.dark_en[k], light_ar: R.light_ar[k], dark_ar: R.dark_ar[k], usedBy: [...(usedBy.get(k) ?? [])] }; }
writeFileSync(join(PUB, 'tokens.json'), JSON.stringify({ about: 'Resolved design tokens (semantic + component tiers), 4 modes. Bind these in code; never raw hex.', site: SITE, tokens: tokenOut }, null, 1));
writeFileSync(join(PUB, 'components.json'), JSON.stringify({ about: 'app-kit components: props, variants, states, usage rules, tokens. React Native + Expo, iOS, EN + AR (RTL).', package: '@lab/app-kit', components: agentComponents }, null, 1));
const manifest = JSON.parse(readFileSync(join(DESIGN, 'manifest.json'), 'utf8'));
writeFileSync(join(PUB, 'llms.txt'), [
  '# app-kit (Mobbin product lab)',
  '',
  '> React Native + Expo design system: tokens, 16 components, EN + AR (RTL), light + dark. Built for a Tabby (BNPL) case study.',
  '',
  'Rules for agents building with this library:',
  '- Use components from `@lab/app-kit`; never rebuild one. Missing piece: compose existing components, then propose a new one.',
  '- Colours, spacing, radius, type come from tokens via `useTheme().t(\'<token>\')` and `Txt role="<type role>"`. Never hard-code values.',
  '- Every string has EN + AR. Amounts: `fmt.money(halalas, lang)` (riyal sign left of the number, LTR-isolated in Arabic). Dates: `fmt.dayDate`, `fmt.dueLine`.',
  '- One Primary button per view; a Pay label repeats the amount. Icons beside text that wraps sit on the first line.',
  '',
  '## Files',
  `- [components.json](${SITE}/components.json): every component with props, variants, states, when / when not to use, content, behaviour, a11y, RTL, tokens, example.`,
  `- [tokens.json](${SITE}/tokens.json): every semantic and component token, values for light/dark × en/ar, description, which components use it.`,
  '',
  '## Components',
  ...agentComponents.map((c: any) => `- ${c.name}: ${c.summary}`),
  '',
  `Design source exported ${manifest.exported} from the lab docs.`,
].join('\n'));
console.log(`docs: ${components.length} components, ${groups.length} foundation pages, ${raw.length} tokens, agent files written`);
