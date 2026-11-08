#!/usr/bin/env node
// Copy doc -> src/domain/strings.ts sync.
// Usage: node scripts/sync-strings.mjs <copy-flows-ab.md> [--write]
// Parses every "| id | screen | EN | AR | status |" table row in the copy doc, compares with strings.ts,
// reports ids where EN or AR differs or is missing. --write sets EN + AR verbatim for every id in both.
// App-only ids (in strings.ts, not in the doc) are kept and listed. OVERRIDES = Designer calls that win
// over the doc until the doc is updated (remove an entry once the doc holds the same text).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OVERRIDES = {
  // Designer 2026-11-09: gender-neutral AR (C9); doc update pending.
  'b5.1': { ar: 'ميعادك مع د. هنا يوسف اتأكّد / بكرة الثلاثاء ١٠ نوفمبر الساعة ٧:٠٠ م. دوس وشوف الطريق.' },
  'b5.3': { ar: 'ميعادك مع د. شريف فتحي يوم الجمعة ١٣ نوفمبر اتلغى / آسفين على كده. دوس واحجز ميعاد تاني.' },
};

const [docPath, ...flags] = process.argv.slice(2);
if (!docPath) { console.error('usage: node scripts/sync-strings.mjs <copy-doc.md> [--write]'); process.exit(2); }
const write = flags.includes('--write');
const here = path.dirname(fileURLToPath(import.meta.url));
const tsPath = path.join(here, '..', 'src', 'domain', 'strings.ts');

// Doc rows: 5 cells, skip header + divider.
const doc = new Map();
for (const line of fs.readFileSync(docPath, 'utf8').split('\n')) {
  if (!line.startsWith('| ')) continue;
  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  if (cells.length !== 5 || cells[0] === 'id' || /^-+$/.test(cells[0])) continue;
  const [id, , en, ar] = cells;
  doc.set(id, { en, ar, ...OVERRIDES[id] });
}

// strings.ts rows: one per line, `"id": { en: "...", ar: "..." },` (JSON string literals).
const ROW = /^(\s*)("(?:[^"\\]|\\.)*"): \{ en: ("(?:[^"\\]|\\.)*"), ar: ("(?:[^"\\]|\\.)*") \},$/;
const lines = fs.readFileSync(tsPath, 'utf8').split('\n');
const app = new Set();
const diffs = [];
let en = 0, ar = 0;
const out = lines.map((line) => {
  const m = line.match(ROW);
  if (!m) return line;
  const id = JSON.parse(m[2]);
  app.add(id);
  const cur = { en: JSON.parse(m[3]), ar: JSON.parse(m[4]) };
  const want = doc.get(id);
  if (!want) return line;
  const dEn = cur.en !== want.en, dAr = cur.ar !== want.ar;
  if (!dEn && !dAr) return line;
  if (dEn) { en++; diffs.push([id, 'EN', cur.en, want.en]); }
  if (dAr) { ar++; diffs.push([id, 'AR', cur.ar, want.ar]); }
  return `${m[1]}${m[2]}: { en: ${JSON.stringify(want.en)}, ar: ${JSON.stringify(want.ar)} },`;
});

for (const [id, lang, a, b] of diffs) console.log(`DIFF ${id} ${lang}\n  app: ${a}\n  doc: ${b}`);
const missing = [...doc.keys()].filter((id) => !app.has(id));
const appOnly = [...app].filter((id) => !doc.has(id));
console.log(`\nchanged: EN ${en} / AR ${ar}`);
console.log(`doc ids missing in strings.ts (${missing.length}): ${missing.join(', ') || '-'}`);
console.log(`app-only ids kept (${appOnly.length}): ${appOnly.join(', ') || '-'}`);
if (write && diffs.length) { fs.writeFileSync(tsPath, out.join('\n')); console.log(`wrote ${tsPath}`); }
else if (!write && diffs.length) process.exitCode = 1;
