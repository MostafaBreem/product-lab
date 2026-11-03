# Switch — usage card

Status: standing · 2026-11-03
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: On/off control for a setting that applies at once.
- Use when: settings rows (via List row Selection Switch off / on), opt-ins in a sheet (salary-day reminder).
- Don't use: pick one (List row Radio), pick many (List row Check), actions needing confirm (Button).
- Content rules: the row title says what turns on ("Push reminders"), not "Enable …".
- Behaviour: applies at once; no Save button. Only the switch toggles, not the whole row.
- A11y: tap area 44 in code; role switch with on/off state.
- RTL: Figma shows the knob as EN; code mirrors (knob on the left when On).
- Related: List row, Toast
