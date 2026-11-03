# Navigation bar — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Bar on pushed screens and sheets: back or close icon, centred title, optional trailing link. 44 tall.
- Use when: any screen pushed from a tab (overdue, purchase details, make payment, history) · sheets and modals with Leading icon = x.
- Don't use: tab screens (Header) · section titles (Section header).
- Content rules: Title one line, truncates; short noun phrase. Trailing link 1 word ("Help", "Edit"); edit its label on the exposed Button in the row you see.
- Behaviour: back / close taps (44 box); trailing link taps. Pressed look = platform default in code. Scroll-edge divider = code.
- A11y: 44 tap boxes; title 16.26:1 on bg/default; icon icon/content/default.
- RTL: Typography ar flips the row; caret mirrors by itself (Vector RTL); x does not mirror.
- Known limit: trailing link wider than 44 shifts the title a few px off centre.
- Related: Header, Button (Link), Tab bar
