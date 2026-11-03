# Foundation roles — which value for which job

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: drawing or checking any mock (plugin mock-review), choosing a gap, text style, emphasis, radius, shadow, size or duration

Approved by Mostafa 2026-10-31. Values only from these roles; a value no role names = pick a role or propose a new one. Not the token tiers (primitive → brand → semantic → component): these say which token a job uses. Token names in brackets.

## Spacing roles (gaps)
| Role | Gap | Use | Example |
|---|---|---|---|
| S1 Pair | 2–4 (gap-y/4xs, 3xs) | lines of one piece of info | row title↔subtitle 2 · key↔value 2 · label↔amount↔due 4 |
| S2 Label → content | 8 (xs) | a label and a separate thing it names | field label→field · helper text→field |
| S3 Items in a group | 12 (sm) | siblings inside one block | logo↔text↔value · summary columns |
| S4 Blocks in a card | 16 (md) | groups inside one surface | Payment card header · actions · summary |
| S5 Sections | 24 (xl) | sections on a screen | card → "Upcoming" |
| S6 Screen blocks | 32 (2xl) | major screen zones | header area → content |
| Touching | 0 | only when the lower / next tap is a Link button (48 tap height, no fill) — ux-laws bend 2026-10-31 | Pay → links |
Rules: a label sits nearer its content than the block above; no gap larger than the next role up; one separator at a time (divider or gap).

## Inset roles (padding inside a surface)
Rows 12 / 16 · cards 20 · insets 12 / 16 · screen margin 16 · controls: button 0 / 24, chip 0 / 12, tag 0 / 8, segment track 2.
Icon ↔ label inside a control: 8 when the control is 40+ tall (Button), 4 when 32 or less (Chip, Tag).

## Type roles
| Level | Role | Style |
|---|---|---|
| L1 | key number | display/lg 40 |
| L2 | screen title | display/md 32 |
| L3 | modal title (no Nav bar) | heading/lg 24 — sheet title in a Nav bar = heading/sm 18 like every bar title [reconsidered 2026-11-01] |
| L4 | card title | heading/md 20 |
| L5 | section heading | heading/sm 18 |
| L6 | item title / value | label/lg 16 medium |
| L7 | body | body/md 16 |
| L8 | supporting | body/sm 14 |
| L9 | micro | label/sm · caption 12 |
Rules: one L1 per view; ≤ 3 levels per block; neighbours differ in size or weight, never colour alone. Line heights identical in EN + AR (same component heights). Text that wraps into a paragraph uses `body/* wrap` (taller AR lines).

## Emphasis levels (colour)
Text: primary (titles, values) · secondary (supporting) · tertiary (placeholders, timestamps) · disabled. Link / brand colour = tappable text only; status colours = status only. Icon next to text = the ICON level matching that text (text default → icon default, secondary → icon secondary, critical → icon critical …): icons need 3:1, text 4.5:1, so icon colours sit one step lighter. Standalone icon = icon levels (chevron = tertiary). Exceptions (logged): Tab bar idle icon = label grey; Chip (promo) icon = brand; selected radio in a choice row (List row) = icon brand, unselected = icon tertiary (user 2026-11-01, Tabby Extend sheet).

## Shape scale (radius)
Sheet 20 (top corners) · card 20 · inset / tile / button / control 12 · segment inside its track 8 (concentric: 12 − 2 padding, snapped) · tag 4 · chip full. A filled child touching a rounded edge follows the curve or the parent clips.

## Elevation levels
Layers: bg → surface (cards) → inset (surface/secondary). Shadow: card = shadow/sm (every card, incl. List group) · floating (FAB, toast) = md · sheet / modal = lg · bars (tab bar) = top line, no shadow.

## Sizing scale
Heights: tag 24 · chip 32 · segmented 36 · button 48 · tab area 48 · row 56+. Icons: 16 inline (tag, chip) · 20 trailing / chevron · 24 nav, tile, standalone · 40 leading tile. Hero (outcome screens only: Paid, Extended, success states): circle 64, glyph 32, centred top block (user 2026-11-01). Hit area ≥ 44.

## Motion tokens (none built yet)
Micro 100 ms (press) · small 200 ms (toggle, expand) · screen 300 ms (push, sheet), ease-out; sheets iOS spring.
