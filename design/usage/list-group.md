# List group — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: White card holding any number of List rows (Rows slot).
- Use when: due list, products + help, settings lists.
- Don't use: mixed content (cards, buttons, text) — instead Section header + separate List group and Button blocks (Section header Inset On inside a card is fine); choice rows on a Bottom sheet inside a card — instead List group plain (no card). (added 2026-11-04, design-critic round 1)
- Content rules: drop or duplicate List rows in Rows; Show divider off on the last row. No other content types.
- Behaviour: none of its own; rows tap.
- A11y: card on bg/default is low contrast by design (surface 100 on 98); rows carry the structure.
- RTL: rows flip themselves.
- Related: List row, Section header (Inset On inside cards)
