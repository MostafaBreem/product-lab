# List row — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Tappable row: leading logo / icon, title, subtitle, value, chevron.
- Use when: Due payments, products, settings lists; inside List group.
- Content rules: Title max 2 lines, subtitle 1 line, value never truncates. Logo = drop the merchant image fill on the Logo frame.
- Behaviour: whole row taps; Pressed = surface/active (base 96).
- A11y: min 56 tall; chevron 4.49:1 (pressed 3.97 light, 3.65 dark).
- RTL: Typography ar: RTL row, logo right, chevron flips by itself.
- Related: Key-value pair, List group (G3)
- Selection (2026-11-01): Radio off/on = pick one (one On per group), Check off/on = pick many; control replaces chevron, grey off, brand on. Fee beside a choice = Quiet value (Show value off, Show quiet value on). Choice rows plain on white, never on an inset. AR: control on the left.
