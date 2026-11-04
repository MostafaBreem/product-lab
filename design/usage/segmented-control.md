# Segmented control — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Pick one of 2 to 4 equal options.
- Use when: Range or view switches on one screen (7 days · 30 days · All).
- Don't use: moving between app sections — instead Tab bar; more than 4 options or long labels — instead List row Selection Radio in a plain List group (for example in a Bottom sheet); actions — instead Button. (added 2026-11-04, design-critic round 1)
- Content rules: Labels 1-2 words, same length if possible. Count 2, 3 or 4.
- Behaviour: tap selects; set each nested Segment Selected + Label in the panel.
- A11y: 36 tall; labels 5.54:1 unselected, 17.12:1 selected.
- RTL: segment order reverses in AR (start = right); Figma mock reversed by hand.
- Related: Tab bar
