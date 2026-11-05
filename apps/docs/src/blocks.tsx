// Doc blocks used by the generated MDX pages (plain React DOM, follows the Light/Dark toggle via CSS vars).
import React from 'react';
import { addons } from 'storybook/preview-api';
import { NAVIGATE_URL } from 'storybook/internal/core-events';
import { TileCtx } from './ui/tile';

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

/** Site link: `/docs/...` paths open inside the Storybook shell (sidebar stays); https links open as usual. */
export function SiteLink({ to, style, className, children }: { to: string; style?: React.CSSProperties; className?: string; children: React.ReactNode }) {
  const ext = /^https?:/.test(to);
  const onClick = (e: React.MouseEvent) => {
    if (ext || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    addons.getChannel().emit(NAVIGATE_URL, `?path=${to}`);
  };
  // Fallback href resolves against the site root (not iframe.html), so even a plain open keeps the shell.
  return <a href={ext ? to : `./?path=${to}`} target={ext ? '_blank' : '_top'} rel={ext ? 'noreferrer' : undefined} onClick={onClick} className={className} style={{ textDecoration: 'none', color: 'inherit', ...style }}>{children}</a>;
}

export function Cards({ items }: { items: { title: string; text: string; href: string; icon?: IconName }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, margin: '16px 0 32px' }}>
      {items.map((c) => (
        <SiteLink key={c.title} to={c.href} className="lab-hover" style={{ ...card, display: 'block' }}>
          {c.icon ? <IconBadge name={c.icon} /> : null}
          <div style={{ fontWeight: 700, fontSize: 16, margin: '10px 0 6px' }}>{c.title} {/^https?:/.test(c.href) ? '↗' : '→'}</div>
          <div style={{ fontSize: 13, lineHeight: '19px', color: 'var(--lab-text2)' }}>{c.text}</div>
        </SiteLink>
      ))}
    </div>
  );
}

// ---------- icons (24 grid, 1.75 stroke; drawn for this site) ----------
const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  cross: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  tap: 'M9 11V5.5a1.5 1.5 0 013 0V11m0-1.5a1.5 1.5 0 013 0V12m0-1a1.5 1.5 0 013 0v4a6 6 0 01-6 6h-1a6 6 0 01-4.6-2.2L4.5 15a1.5 1.5 0 012.2-2L9 15',
  text: 'M5 6.5h14M12 6.5V19M8.5 19h7',
  globe: 'M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM3.5 12h17M12 3.5c2.4 2.3 3.5 5.2 3.5 8.5s-1.1 6.2-3.5 8.5c-2.4-2.3-3.5-5.2-3.5-8.5s1.1-6.2 3.5-8.5z',
  contrast: 'M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM12 3.5v17',
  layers: 'M12 4l8.5 4.5L12 13 3.5 8.5 12 4zM3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5',
  pick: 'M4.5 6.5h9M4.5 12h9M4.5 17.5h5M16.5 14.5l2 2 3.5-4',
  ruler: 'M3.5 15.5l12-12 5 5-12 12-5-5zM7.5 11.5l2 2M10.5 8.5l2 2M13.5 5.5l2 2',
  spacing: 'M4 4v16M20 4v16M8 12h8M8 12l2.5-2.5M8 12l2.5 2.5M16 12l-2.5-2.5M16 12l-2.5 2.5',
  radius: 'M4.5 19.5V12a7.5 7.5 0 017.5-7.5h7.5',
  shadow: 'M4.5 4.5h11v11h-11zM8.5 19.5h11v-11',
  size: 'M4.5 9.5v-5h5M19.5 14.5v5h-5M4.5 4.5l6 6M19.5 19.5l-6-6',
  palette: 'M12 3.5a8.5 8.5 0 000 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1-1.6-1-2.7 0-.9.7-1.6 1.7-1.6H17a3.5 3.5 0 003.5-3.5c0-4.2-3.8-7.5-8.5-7.5zM7.5 12h.01M9.5 8h.01M14.5 8h.01',
  grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
  book: 'M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5v13c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5v-13zM12 6v13',
  robot: 'M6.5 8.5h11a2 2 0 012 2v6a2 2 0 01-2 2h-11a2 2 0 01-2-2v-6a2 2 0 012-2zM12 8.5V5M9.5 13h.01M14.5 13h.01',
  phone: 'M7.5 3.5h9a1.5 1.5 0 011.5 1.5v14a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19V5a1.5 1.5 0 011.5-1.5zM10.5 17.5h3',
  plus: 'M12 5v14M5 12h14',
};
export type IconName = keyof typeof PATHS;
export function Icon({ name, size = 20, color = 'currentColor' }: { name: IconName; size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={PATHS[name]} /></svg>;
}
export function IconBadge({ name, tone = 'brand' }: { name: IconName; tone?: 'brand' | 'critical' | 'success' | 'warning' }) {
  const fg = tone === 'brand' ? 'var(--lab-link)' : `var(--lab-${tone})`;
  return <span style={{ display: 'inline-flex', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', background: `var(--lab-${tone}-soft)`, color: fg, flex: 'none' }}><Icon name={name} /></span>;
}

// ---------- rule blocks (easy-read rules: icon, title, bullets) ----------
/** One rule section on a component page: icon + title + one point per line. */
export function RuleGrid({ items }: { items: { title: string; icon: IconName; points: string[] }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, margin: '8px 0 32px' }}>
      {items.map((it) => (
        <div key={it.title} style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <IconBadge name={it.icon} />
            <div style={{ fontWeight: 700, fontSize: 16 }}>{it.title}</div>
          </div>
          <Points points={it.points} />
        </div>
      ))}
    </div>
  );
}
function Points({ points }: { points: string[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
      {points.map((p, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: '21px' }}>
          <span style={{ flex: 'none', width: 6, height: 6, borderRadius: 3, background: 'var(--lab-link)', marginTop: 8 }} />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

/** "How to use" box at the top of a foundation page. */
export function Callout({ title = 'How to use', points, more }: { title?: string; points: string[]; more?: { label: string; to: string } }) {
  return (
    <div style={{ ...card, borderLeft: '4px solid var(--lab-link)', padding: 20, margin: '8px 0 28px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, fontWeight: 700, fontSize: 16 }}><Icon name="book" color="var(--lab-link)" />{title}</div>
      <Points points={points} />
      {more ? <div style={{ marginTop: 14, fontSize: 13 }}><SiteLink to={more.to} style={{ color: 'var(--lab-link)', fontWeight: 600 }}>{more.label} →</SiteLink></div> : null}
    </div>
  );
}

/** One numbered rule on a Rules page: title, why, example, an optional picture. */
export function Rule({ n, title, why, example, icon, children }: { n: number; title: string; why?: string; example?: string; icon?: IconName; children?: React.ReactNode }) {
  return (
    <div style={{ ...card, padding: 20, display: 'grid', gap: 12, margin: '0 0 16px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {icon ? <IconBadge name={icon} /> : <span style={{ flex: 'none', width: 36, height: 36, borderRadius: 18, background: 'var(--lab-brand-soft)', color: 'var(--lab-link)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{n}</span>}
        <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lab-link)', lineHeight: '16px' }}>Rule {n}</div><div style={{ fontWeight: 700, fontSize: 17, lineHeight: '24px' }}>{title}</div></div>
      </div>
      {why ? <div style={{ fontSize: 14, lineHeight: '21px', color: 'var(--lab-text2)' }}><b style={{ color: 'var(--lab-text)' }}>Why: </b>{why}</div> : null}
      {children}
      {example ? <div style={{ fontSize: 13, lineHeight: '20px', background: 'var(--lab-inset)', borderRadius: 8, padding: '10px 12px' }}><b>Example: </b>{example}</div> : null}
    </div>
  );
}

/** Chips that jump to the h2 sections of a long page. */
export function JumpLinks({ items }: { items: string[] }) {
  const jump = (e: React.MouseEvent, t: string) => { e.preventDefault(); document.getElementById(t.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '4px 0 24px' }}>
      {items.map((t) => <a key={t} href={`#${t.toLowerCase()}`} onClick={(e) => jump(e, t)} className="lab-hover" style={{ ...card, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--lab-link)' }}>{t}</a>)}
    </div>
  );
}

// ---------- galleries ----------
const tileBox: React.CSSProperties = { ...card, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' };
/** Gallery tile: a picture (live component or foundation sample) on top, name + one line under it. */
export function Tile({ to, title, text, badge, children }: { to: string; title: string; text: string; badge?: string; children: React.ReactNode }) {
  return (
    <SiteLink to={to} style={tileBox} className="lab-hover">
      <div style={{ height: 168, background: 'var(--lab-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', pointerEvents: 'none', position: 'relative' }}>{children}<div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 24, background: 'linear-gradient(transparent, var(--lab-inset))' }} /></div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700, fontSize: 15 }}>{title}{badge ? <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '1px 8px', background: 'var(--lab-success-soft)', color: 'var(--lab-success)' }}>{badge}</span> : null}</div>
        <div style={{ fontSize: 13, lineHeight: '19px', color: 'var(--lab-text2)', marginTop: 4 }}>{text}</div>
      </div>
    </SiteLink>
  );
}
export function Gallery({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, margin: '16px 0 32px' }}>{children}</div>;
}
/** Live component inside a tile: one copy in the toolbar theme, scaled to fit. */
export function LivePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="lab-tile" style={{ width: 400, transform: 'scale(0.7)', transformOrigin: 'center', flex: 'none' }}>
      <TileCtx.Provider value={true}>{children}</TileCtx.Provider>
    </div>
  );
}
type FoundationKind = 'colour' | 'type' | 'space' | 'radius' | 'size' | 'shadow';
/** Small picture of one foundation for its tile. */
export function FoundationSample({ kind }: { kind: FoundationKind }) {
  if (kind === 'colour') return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 36px)', gap: 8 }}>{['brand', 'link', 'critical', 'success', 'warning', 'text', 'text2', 'border'].map((c) => <div key={c} style={{ width: 36, height: 36, borderRadius: 10, background: `var(--lab-${c})` }} />)}</div>;
  if (kind === 'type') return <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, color: 'var(--lab-text)' }}><span style={{ fontFamily: 'BawazekSans-700', fontSize: 56 }}>Aa</span><span dir="rtl" style={{ fontFamily: 'BawazekSansArabic-700', fontSize: 48 }}>أب</span></div>;
  if (kind === 'space') return <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>{[4, 8, 12, 16, 24, 32].map((v) => <div key={v} style={{ width: v * 1.6, height: v * 1.6, background: 'var(--lab-brand)', opacity: 0.25 + v / 48, borderRadius: 3 }} />)}</div>;
  if (kind === 'radius') return <div style={{ display: 'flex', gap: 10 }}>{[4, 12, 20, 999].map((r) => <div key={r} style={{ width: 44, height: 44, border: '2px solid var(--lab-link)', background: 'var(--lab-brand-soft)', borderRadius: Math.min(r, 22) }} />)}</div>;
  if (kind === 'size') return <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>{[24, 32, 36, 48, 56].map((h) => <div key={h} style={{ width: 28, height: h, borderRadius: 6, background: 'var(--lab-brand)', opacity: 0.35 + h / 112 }} />)}</div>;
  return <div style={{ width: 120, height: 72, borderRadius: 16, background: 'var(--lab-surface)', boxShadow: 'var(--lab-shadow-lg)' }} />;
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
