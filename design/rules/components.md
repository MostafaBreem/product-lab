# Components — project rules

Status: standing · 2026-10-24
Parent: [../INDEX.md](../INDEX.md)
Read when: component or screen build — after plugin hard-rules; every component-build run

One line each: rule · why · one example. Generic one: propose to plugin instead.

Moved verbatim from working-rules.md > Approval gate 2026-11-03 (cap):
- **Trap intake gate**: plugin figma-traps only when generic + cost a failure + not in the Figma skills; else components/traps/INDEX.md, promote on 2nd hit. Plugin repackage once per session.
- **Build test before every component** (plugin design-rules > Components serve developers): passes repeats / code / behaviour / rules, or it becomes a screen pattern (components/screen-patterns.md), not a component. One line in every plan + spec.
- Default: one component per run, approval of one never approves next. **Batch mode overrides it, ON for this lab** (user 2026-10-31): dependency groups of 3-4, one plan page approved once for the group, tokens once, builds back to back, one report [reconsidered 2026-11-01] — plugin component-build references/batch.md.
- **Never ask the user to publish Bawazek-Components during component builds.** User publishes when screen design starts (user 2026-10-31). Built table keeps UNPUBLISHED meanwhile.
- **Icon beside text that can wrap sits on line 1** (soft, 2026-11-04, retro): icon in a box as wide as the icon and as tall as the first line of its text style; row top-aligned, never centred on the text block. Why: a centred icon drifts down as text wraps and reads unaligned (user caught it on Toast twice: Figma 2026-11-03, app code 2026-11-04). Example: Toast icon box 20 × 24 (body/md wrap), Notice 20 × 24 (label/lg title). Figma and app-kit code both. Extends decisions/components.md 2026-11-03 (Toast).
