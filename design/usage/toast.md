# Toast — usage card

Status: standing · 2026-11-03
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Short floating confirmation after an action: icon + one message, hides by itself.
- Use when: an action finished and the screen stays (Reminders on, Copied).
- Don't use: errors the user must act on (Notice), long text (2 lines max), anything with a button.
- Content rules: past or state words ("Reminders on", "Copied"); no "successfully", no "!".
- Behaviour: code places it 16 above the lowest bar (tab bar, or bottom inset on screens with none: `bottomOffset: 0` per toast) at margins 16; hides after 4 s; one at a time.
- A11y: text 11.6:1 light, 13.2:1 dark; announce as status in code.
- RTL: Typography ar shows the RTL row: icon right, text right-aligned.
- Related: Notice, Switch
