# Bottom sheet — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Modal panel from the bottom: scrim, Navigation bar (x) and a Content slot. Fits one viewport, no scroll.
- Use when: Pay sheet, Extend due date sheet, Pay failed, any short task over the current screen.
- Don't use: full pushed screens (screen + Navigation bar); one-line alerts.
- Content rules: Title on the exposed Navigation bar, short noun phrase or verb phrase ("Pay overdue payment"). Content slot: blocks at gap 24, one Primary button last. Hide the Placeholder.
- Behaviour: x closes; scrim tap closes (code); swipe down closes (code, plus the visible x). Sheet height hugs content.
- A11y: x tap box 44; sheet on scrim, title 16.26:1.
- RTL: Typography ar flips the Navigation bar (x to the right) and slot content; nothing else to mirror.
- Place on a screen: one instance, 393 x 852, constraints stretch; Show scrim off only if the screen draws its own.
- Related: Navigation bar, Button, List group, Segmented control
