# Chip — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Small pill action with optional brand icon.
- Use when: Light secondary action in a header or toolbar ("Earn cashback").
- Don't use: the main action on a screen — instead Button Primary; view switches — instead Segmented control; status that cannot be tapped — instead Tag. (added 2026-11-04, design-critic round 1)
- Content rules: Label 1-3 words.
- Behaviour: tap; Pressed = darker grey fill.
- A11y: 32 tall: keep 44 tap area via the row around it. Icon 3.86:1.
- RTL: icon leading; set Typography mode ar to flip (RTL row).
- Related: Tag, Button
