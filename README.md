# product-lab

Mobbin product lab apps: one shared `app-kit` + one thin Expo app per case. Mock data, iOS only, EN + AR.

- `packages/app-kit` — design tokens (generated from the lab's `tokens.json`), Bawazek Sans fonts, DS components (Button, Tag, Chip, Key-value pair, Segmented control, Header, Section header, List row, List group, Payment card, Navigation bar, Bottom sheet, Notice, Toast), formats (riyal, dates, Arabic day counts), mock transport, analytics logger.
- `apps/docs` — Storybook docs site, generated from `design/` + app-kit (`npm run build -w apps/docs`).
- `design/` — generated copy of the lab's design source (tokens, usage cards, rules). Do not edit.
- `apps/tabby` — Tabby case (Money tab, pay flow v5, reminders). Spec: lab docs `cases/tabby/build-spec.md`.

## Online

- **Docs site**: https://mostafabreem.github.io/product-lab/ — foundations (every token, its values, what it is for, which components use it), components (live examples EN / AR, light / dark, usage rules, props, code, tokens), rules.
- **For AI agents**: [llms.txt](https://mostafabreem.github.io/product-lab/llms.txt) · [components.json](https://mostafabreem.github.io/product-lab/components.json) · [tokens.json](https://mostafabreem.github.io/product-lab/tokens.json)
- **Tabby case study** (unofficial, sample data): https://mostafabreem.github.io/product-lab/app/

Built by `.github/workflows/pages.yml` on every push to `main` and `case/tabby`: generated tokens match `design/tokens/tokens.json`, contrast check (AA) on the token pairs listed in tokens.json in all 4 modes, unit tests, docs, case app. Published from `main` only. The case-study banner shows on the published build only.

## Run

```bash
npm install
npm run tabby          # then press i for the iPhone Simulator (needs Xcode), or w for web
npm test               # format + derive + reminder schedule unit tests
npm run tokens         # regenerate tokens from design/tokens/tokens.json
npm run storybook -w apps/docs   # docs site locally
```

Debug menu: long-press the **Money** title (scenario, offline, pay result, latency, mock clock, language, theme, reminders, event log).
Web preview shortcuts (local `w`, or online at https://mostafabreem.github.io/product-lab/app/money?…): `/money?scenario=overdue&lang=ar&net=offline&pay=declined&scheme=dark`.

Fonts: Bawazek Sans / Bawazek Sans Arabic = IBM Plex Sans (OFL) + Saudi riyal sign (OFL); licences in `packages/app-kit/assets/fonts/`.
