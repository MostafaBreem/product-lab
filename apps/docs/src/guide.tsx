// Easy-read rules for people using the kit. Public version of the lab docs:
// component rules = lab components/rules + usage cards + decisions/components.md; foundation roles = lab system/roles.md.
// Lab-process notes (Figma build steps, publishing, batch mode) stay in the lab, not here. Change both together.
import React from 'react';
import type { IconName } from './blocks';

const box: React.CSSProperties = { border: '1px solid var(--lab-border)', borderRadius: 12, background: 'var(--lab-surface)' };

// ---------- component rules ----------
export const componentRules: { title: string; icon: IconName; why: string; example: string }[] = [
  { title: 'Build from kit components', icon: 'grid', why: 'One component, one behaviour everywhere: a fix lands on every screen.', example: 'A missing piece: compose existing components first, then propose a new one.' },
  { title: 'Every value comes from a token', icon: 'palette', why: 'Figma, this site and the app read one tokens file, so a test catches drift, not the eye.', example: "useTheme().t('color/text/content/default'), never #181c21. Exceptions: platform-fixed parts, like the black Apple Pay button, and content data, like merchant logo colours." },
  { title: 'One main action per view', icon: 'tap', why: 'People find the next step at once when only one button is filled.', example: 'Payment card: one Pay button, the other actions are Links.' },
  { title: 'A label says what the tap does', icon: 'text', why: 'People know the result before they tap.', example: '"Pay ⃁ 312.50", with the amount when it pays. One line, never wraps.' },
  { title: 'Secondary actions under the main one are centred', icon: 'pick', why: 'They read as part of the main action, not as a separate row.', example: '"Later" under the main button in a Screen footer; links in bottom sheets. A link with no main button above it, or inside content ("Try again" in a Notice), stays start-aligned.' },
  { title: 'An icon beside wrapping text sits on the first line', icon: 'layers', why: 'A centred icon drifts down as the text wraps and looks unaligned.', example: 'Toast and Notice: the icon box is as tall as the first text line (20 × 24).' },
  { title: 'Works in English and Arabic', icon: 'globe', why: 'Every screen ships in both languages.', example: 'In Arabic rows mirror and arrows flip; amounts stay left to right. Line heights are the same in both.' },
  { title: 'Readable in light and dark', icon: 'contrast', why: 'Text and icons stay readable for everyone in both themes.', example: 'Listed text pairs pass 4.5 : 1 and icon pairs 3 : 1 (WCAG AA); a check runs on every push to the main and case branches.' },
  { title: 'Easy to tap', icon: 'phone', why: 'Small targets cause missed taps.', example: 'Tap areas are at least 44, even when the control looks smaller: Chip is 32 tall and gets its 44 from the row around it.' },
  { title: 'Add a state only when a screen needs it', icon: 'plus', why: 'The kit stays small; a state is added when a screen draws one.', example: 'Button had Default and Pressed first; Loading and Disabled came later, when asked for.' },
];

// ---------- foundation roles ----------
export const roles = {
  spacing: [
    { role: 'Pair', gap: 4, label: '2–4', use: 'Lines of one piece of information', ex: 'Row title and subtitle (2), key and value' },
    { role: 'Label to content', gap: 8, use: 'A label and the thing it names', ex: 'Field label and field' },
    { role: 'Items in a group', gap: 12, use: 'Siblings inside one block', ex: 'Logo, text and value in a row' },
    { role: 'Blocks in a card', gap: 16, use: 'Groups inside one surface', ex: 'Payment card header, actions, summary' },
    { role: 'Sections', gap: 24, use: 'Sections on a screen', ex: 'Card, then the "Upcoming" section' },
    { role: 'Screen blocks', gap: 32, use: 'Major screen zones', ex: 'Header area, then content' },
  ],
  type: [
    { level: 'Key number', role: 'display/lg', size: 40, w: 700, note: 'One per view' },
    { level: 'Screen title', role: 'display/md', size: 32, w: 700 },
    { level: 'Modal title', role: 'heading/lg', size: 24, w: 600, note: 'No Nav bar; a sheet title in a Nav bar is 18' },
    { level: 'Card title', role: 'heading/md', size: 20, w: 600 },
    { level: 'Section heading', role: 'heading/sm', size: 18, w: 600 },
    { level: 'Item title, value', role: 'label/lg', size: 16, w: 500 },
    { level: 'Body', role: 'body/md', size: 16, w: 400 },
    { level: 'Supporting', role: 'body/sm', size: 14, w: 400 },
    { level: 'Micro label', role: 'label/sm', size: 12, w: 500 },
    { level: 'Caption', role: 'caption', size: 12, w: 400 },
  ],
  shape: [
    { name: 'Tag', r: 4 }, { name: 'Segment', r: 8 }, { name: 'Button, control, inset', r: 12 }, { name: 'Card, sheet top', r: 20 }, { name: 'Chip', r: 999 },
  ],
  heights: [
    { name: 'Tag', h: 24 }, { name: 'Chip', h: 32 }, { name: 'Segmented', h: 36 }, { name: 'Button', h: 48 }, { name: 'Tab area', h: 48 }, { name: 'Row', h: 56 },
  ],
};

/** Short "How to use" points, one set per foundation page. */
export const foundationPoints: Record<string, string[]> = {
  Colour: [
    'Text has four levels: primary for titles and values, secondary for supporting text, tertiary for placeholders and times, disabled.',
    'Link (brand) colour only on things you can tap. Status colours (critical, success, warning) only for status.',
    'An icon next to text uses the icon colour of the same level; icons sit one step lighter because they need 3 : 1, text 4.5 : 1. A few logged exceptions: idle tab icon, promo chip icon, selected radio.',
  ],
  Type: [
    'One key number per view. At most three text levels in one block.',
    'Neighbouring text differs in size or weight, never in colour alone.',
    'English and Arabic share line heights; text that wraps into a paragraph uses the taller "wrap" style in Arabic.',
  ],
  Spacing: [
    'Pick the gap by its job: pair 4, label to content 8, items 12, blocks in a card 16, sections 24, screen zones 32.',
    'A label sits nearer its content than the block above it.',
    'One separator at a time: a divider or a gap, not both. Screen margin is 16.',
  ],
  Radius: [
    'Cards and sheet tops 20, buttons and controls 12, segments 8, tags 4, chips fully round.',
    'A filled part touching a rounded edge follows the curve, or the parent clips it.',
  ],
  Size: [
    'Heights: tag 24, chip 32, segmented control 36, button 48, row 56 or more.',
    'Icons: 16 inline (tag, chip), 20 trailing and chevrons, 24 navigation, tile and standalone, 40 leading tiles.',
    'Every tap area is at least 44.',
  ],
  Elevation: [
    'Three layers: page background, surface (cards), inset (grey areas inside a card).',
    'Cards use the small shadow, floating parts (toast) medium, sheets and modals large.',
    'Bars, like the tab bar, use a top line, no shadow.',
  ],
};

// ---------- pictures for the foundation roles page ----------
export function SpacingRoles() {
  return (
    <div style={{ ...box, padding: 20, display: 'grid', gap: 14 }}>
      {roles.spacing.map((r) => (
        <div key={r.role} style={{ display: 'grid', gridTemplateColumns: '150px 70px 1fr', gap: 16, alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.role}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: r.gap, height: 24, background: 'var(--lab-brand)', opacity: 0.8, borderRadius: 2 }} />
            <span style={{ fontSize: 13, color: 'var(--lab-text2)' }}>{'label' in r ? (r as { label: string }).label : r.gap}</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: '19px' }}>{r.use}<span style={{ color: 'var(--lab-text2)' }}> · {r.ex}</span></div>
        </div>
      ))}
    </div>
  );
}

export function TypeLevels() {
  return (
    <div style={{ ...box, padding: '8px 20px' }}>
      {roles.type.map((t, i) => (
        <div key={t.role} style={{ display: 'grid', gridTemplateColumns: '1fr 170px', gap: 16, alignItems: 'baseline', padding: '12px 0', borderTop: i ? '1px solid var(--lab-border)' : 'none' }}>
          <div style={{ fontFamily: `BawazekSans-${t.w}`, fontSize: t.size, lineHeight: 1.25, color: 'var(--lab-text)' }}>{t.level}</div>
          <div style={{ fontSize: 12, color: 'var(--lab-text2)', lineHeight: '17px' }}><code>{t.role}</code> · {t.size}{t.note ? <><br />{t.note}</> : null}</div>
        </div>
      ))}
    </div>
  );
}

export function EmphasisLevels() {
  const rows: [string, string, string][] = [
    ['Primary', 'var(--lab-text)', 'Titles and values'], ['Secondary', 'var(--lab-text2)', 'Supporting text'], ['Tertiary', 'var(--lab-text3)', 'Placeholders, times'],
    ['Disabled', 'var(--lab-disabled)', 'Cannot be used now'], ['Link', 'var(--lab-link)', 'Only things you can tap'], ['Critical', 'var(--lab-critical)', 'Only status: overdue, errors'],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
      {rows.map(([n, c, use]) => (
        <div key={n} style={{ ...box, padding: 16 }}>
          <div style={{ fontFamily: 'BawazekSans-600', fontSize: 18, color: c }}>{n}</div>
          <div style={{ fontSize: 12, color: 'var(--lab-text2)', marginTop: 4 }}>{use}</div>
        </div>
      ))}
    </div>
  );
}

export function ShapeScale() {
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {roles.shape.map((s) => (
        <div key={s.name} style={{ display: 'grid', gap: 8, justifyItems: 'center', width: 110 }}>
          <div style={{ width: 72, height: 72, background: 'var(--lab-brand-soft)', border: '2px solid var(--lab-link)', borderRadius: Math.min(s.r, 36) }} />
          <div style={{ fontSize: 12, textAlign: 'center', lineHeight: '16px' }}><b>{s.r === 999 ? 'Full' : s.r}</b><br /><span style={{ color: 'var(--lab-text2)' }}>{s.name}</span></div>
        </div>
      ))}
    </div>
  );
}

export function LayerStack() {
  return (
    <div style={{ ...box, background: 'var(--lab-bg)', padding: 24 }}>
      <div style={{ fontSize: 12, color: 'var(--lab-text2)', marginBottom: 10 }}>Page background</div>
      <div style={{ background: 'var(--lab-surface)', borderRadius: 20, padding: 20, boxShadow: 'var(--lab-shadow-sm)', maxWidth: 420 }}>
        <div style={{ fontSize: 12, color: 'var(--lab-text2)', marginBottom: 10 }}>Surface (card) · small shadow</div>
        <div style={{ background: 'var(--lab-inset)', borderRadius: 12, padding: 16, fontSize: 12, color: 'var(--lab-text2)' }}>Inset (grey area inside the card)</div>
      </div>
    </div>
  );
}

export function HeightScale() {
  return (
    <div style={{ ...box, padding: 20, display: 'flex', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {roles.heights.map((h) => (
        <div key={h.name} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
          <div style={{ width: 64, height: h.h, borderRadius: 8, background: 'var(--lab-brand-soft)', border: '1.5px solid var(--lab-link)' }} />
          <div style={{ fontSize: 12, textAlign: 'center', lineHeight: '16px' }}><b>{h.h}</b><br /><span style={{ color: 'var(--lab-text2)' }}>{h.name}</span></div>
        </div>
      ))}
      <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, border: '1.5px dashed var(--lab-critical)' }} />
        <div style={{ fontSize: 12, textAlign: 'center', lineHeight: '16px' }}><b>44</b><br /><span style={{ color: 'var(--lab-text2)' }}>Min tap area</span></div>
      </div>
    </div>
  );
}
