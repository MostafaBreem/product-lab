# Notice — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Inline status message: icon, title, optional body. Tone Critical for errors, Neutral for plain status.
- Use when: pay failed (in the sheet, above the method), offline (top of the screen), info lines that are not tappable.
- Don't use: toasts, field errors under inputs, anything tappable (put a Button below).
- Content rules: Title says what happened, one short sentence. Body says what it means and what to do next; no blame. Swap Icon for Neutral (info, wifi-slash); Critical keeps warning-circle.
- Behaviour: display only; no dismiss yet. Screen removes it when the state clears (retry, reconnect).
- A11y: text 5.7:1 or higher; icons 3.9:1 (critical light) and up. Announce as status in code (accessibilityLiveRegion / UIAccessibility announcement).
- RTL: Typography ar shows the RTL row: icon right, text right-aligned.
- Related: Button, Bottom sheet, Tag
