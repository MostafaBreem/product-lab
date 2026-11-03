# Button — usage card

Status: standing · 2026-10-31
Parent: [INDEX.md](INDEX.md)
Read when: screen work draws this component. Build or change: spec leaf instead.

- Purpose: one tap action. Primary = filled main action; Link = text-only secondary action.
- Use when: the one main action on a screen (Primary, FILL width on phone); secondary actions in a row or under the main one (Link); overdue or destructive actions (Tone Critical).
- Don't use: navigation rows — instead List row; filters or toggles — instead Chip / Segmented control; tabs — instead Tab bar.
- Variant pick: Variant Primary or Link × Tone Default or Critical. State Pressed only to show the pressed look in specs; State Loading for in-progress screens (Primary only). One Primary per view.
- Content rules: label says exactly what the tap does, with the amount when it pays ("Pay ⃁ 312.50"). One line, never wraps. Max about 30 characters on a 361 Primary: 46 characters overflow by 32 (Usage 6).
- Behaviour: tap. Pressed = darker fill (Primary) or darker text (Link). State Loading (Primary only): spinner + label ("Paying…"), no press; set it while the action runs. No Disabled yet.
- A11y: 48 tall (above 44). Every text and icon pair passes AA in light and dark (lowest 4.99 on link pressed tint was option A; built option B 9.35+).
- RTL: set Typography mode ar on the screen or instance: RTL row shows (icons swap sides). Carets and arrows flip by themselves in ar. Amounts LTR-isolated in AR labels.
- Related: Chip, List row, Payment card (uses Primary + 2 Links).
