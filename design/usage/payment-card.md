# Payment card — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: Next payment at a glance + one Pay. States Due, Overdue, Caught up.
- Use when: top of Money tab; overdue screen (feature 3).
- Content rules: Amount = total due next (several items on one day = total). Due line: "Due in N days · <day date>" / "Was due <day date>" / "<amount> on <day date>". Pay label repeats the amount. Show extend off when nothing can be extended. Amounts: riyal sign ⃁ left of the number in EN and AR, Western digits, LTR-isolated in Arabic (decisions/project.md 2026-10-31).
- Behaviour: Pay opens payment sheet; links open Make payment, extend picker, overdue screen, pay early.
- A11y: all text pairs pass on white and on the critical tint (lowest 5.68:1).
- RTL: Typography ar: RTL content row; links + summary columns flip.
- Related: List group (due list below), Button, Tag, Key-value pair
