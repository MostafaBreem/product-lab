// Doc blocks used by the generated MDX pages (plain React DOM, follows the Light/Dark toggle via CSS vars).
import React from 'react';

const card: React.CSSProperties = { border: '1px solid var(--lab-border, #e0e2e9)', borderRadius: 12, padding: 16, background: 'var(--lab-surface, #fff)' };

export function Status({ status, figma, code }: { status: 'Stable' | 'Beta'; figma?: string; code: string }) {
  const c = status === 'Stable' ? ['#c3ffce', '#006d37'] : ['#ffdea9', '#835400'];
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', margin: '4px 0 16px' }}>
      <span style={{ background: c[0], color: c[1], borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{status}</span>
      <span style={{ fontSize: 12, opacity: 0.75 }}>EN + AR (RTL) · Light + Dark · iOS</span>
      <a href={code} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Source on GitHub ↗</a>
      {figma ? <a href={figma} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Figma ↗</a> : null}
    </div>
  );
}

export function DoDont({ doText, dontText }: { doText?: string; dontText?: string }) {
  const box = (ok: boolean, text?: string) => text ? (
    <div style={{ ...card, flex: 1, minWidth: 260, borderTop: `4px solid ${ok ? '#008946' : '#e0353d'}` }}>
      <div style={{ fontWeight: 700, color: ok ? '#008946' : '#e0353d', marginBottom: 6 }}>{ok ? '✓ Do — use when' : '✕ Don’t'}</div>
      <div style={{ fontSize: 14, lineHeight: '22px' }}>{text}</div>
    </div>
  ) : null;
  return <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '8px 0 24px' }}>{box(true, doText)}{box(false, dontText)}</div>;
}

type Tok = { k: string; light: string; dark: string; desc?: string; usedBy: string[] };
export function Swatches({ tokens }: { tokens: Tok[] }) {
  const groups = new Map<string, Tok[]>();
  for (const t of tokens) { const g = t.k.split('/').slice(1, 3).join(' / '); groups.set(g, [...(groups.get(g) ?? []), t]); }
  return (
    <>
      {[...groups.entries()].map(([g, ts]) => (
        <div key={g} style={{ marginBottom: 28 }}>
          <h3 style={{ textTransform: 'capitalize' }}>{g}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {ts.map((t) => (
              <div key={t.k} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', height: 56 }}>
                  <div title="Light" style={{ flex: 1, background: t.light }} />
                  <div title="Dark" style={{ flex: 1, background: t.dark }} />
                </div>
                <div style={{ padding: 12 }}>
                  <code style={{ fontSize: 11, wordBreak: 'break-all' }}>{t.k}</code>
                  <div style={{ fontSize: 11, opacity: 0.7, margin: '4px 0' }}>{t.light} · {t.dark}</div>
                  {t.desc ? <div style={{ fontSize: 12, lineHeight: '17px' }}>{t.desc}</div> : null}
                  {t.usedBy.length ? <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Used by {t.usedBy.join(', ')}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function TypeSpecimen({ roles }: { roles: { role: string; size: number; lh: number; weight: number; lhWrapAr?: number }[] }) {
  const fam = (w: number, ar: boolean) => `${ar ? 'BawazekSansArabic' : 'BawazekSans'}-${w >= 700 ? 700 : w >= 600 ? 600 : w >= 500 ? 500 : 400}`;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {roles.map((r) => (
        <div key={r.role} style={{ ...card, display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: 16, alignItems: 'center' }}>
          <div><code>{r.role}</code><div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{r.size} / {r.lh} · {r.weight}</div></div>
          <div style={{ fontFamily: fam(r.weight, false), fontSize: r.size, lineHeight: `${r.lh}px` }}>Pay ⃁ 312.50</div>
          <div dir="rtl" style={{ fontFamily: fam(r.weight, true), fontSize: r.size, lineHeight: `${r.lh}px` }}>ادفع ⁦⃁ 312.50⁩</div>
        </div>
      ))}
    </div>
  );
}

export function Scale({ items, kind }: { items: { k: string; v: number }[]; kind: 'space' | 'radius' | 'size' }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map((it) => (
        <div key={it.k} style={{ display: 'grid', gridTemplateColumns: '220px 60px 1fr', gap: 12, alignItems: 'center' }}>
          <code style={{ fontSize: 12 }}>{it.k}</code>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{it.v}</span>
          {kind === 'radius'
            ? <div style={{ width: 64, height: 40, background: '#e9ddff', border: '2px solid #8553ff', borderRadius: Math.min(it.v, 20) }} />
            : <div style={{ width: Math.min(it.v, 400), height: kind === 'size' ? Math.min(it.v, 64) : 12, background: '#8553ff', borderRadius: 3, opacity: 0.8 }} />}
        </div>
      ))}
    </div>
  );
}

export function Cards({ items }: { items: { title: string; text: string; href: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, margin: '16px 0 32px' }}>
      {items.map((c) => (
        <a key={c.title} href={c.href} target="_top" style={{ ...card, textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{c.title} →</div>
          <div style={{ fontSize: 13, lineHeight: '19px', opacity: 0.8 }}>{c.text}</div>
        </a>
      ))}
    </div>
  );
}

type ShadowData = { light: { bg: string; surface: string }; dark: { bg: string; surface: string }; items: { k: string; light: string; dark: string; desc?: string; usedBy: string[] }[] };
/** Elevation: one card per shadow token, on the light and the dark page background (values from tokens). */
export function Shadows({ data }: { data: ShadowData }) {
  const panel = (mode: 'light' | 'dark') => (
    <div style={{ flex: 1, minWidth: 300, background: data[mode].bg, borderRadius: 12, padding: 24, display: 'grid', gap: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: mode === 'dark' ? '#e0e2e9' : '#43474c' }}>{mode === 'light' ? 'Light' : 'Dark'}</div>
      {data.items.map((s) => (
        <div key={s.k} style={{ background: data[mode].surface, borderRadius: 20, padding: 16, boxShadow: s[mode], color: mode === 'dark' ? '#e0e2e9' : '#181c21' }}>
          <code style={{ fontSize: 12, background: 'none', border: 0, color: 'inherit' }}>{s.k}</code>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{s[mode]}</div>
          {s.desc ? <div style={{ fontSize: 12, marginTop: 6 }}>{s.desc}{s.usedBy.length ? ` Used by ${s.usedBy.join(', ')}.` : ''}</div> : null}
        </div>
      ))}
    </div>
  );
  return <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '8px 0 24px' }}>{panel('light')}{panel('dark')}</div>;
}
