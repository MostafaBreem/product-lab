# product-lab

Mobbin product lab apps: one shared `app-kit` + one thin Expo app per case. Mock data, iOS only, EN + AR.

- `packages/app-kit` — design tokens (generated from the lab's `tokens.json`), Bawazek Sans fonts, DS components (Button, Tag, Chip, Key-value pair, Segmented control, Header, Section header, List row, List group, Payment card, Navigation bar, Bottom sheet, Notice, Toast), formats (riyal, dates, Arabic day counts), mock transport, analytics logger.
- `apps/tabby` — Tabby case (Money tab, pay flow v5, reminders). Spec: lab docs `cases/tabby/build-spec.md`.

## Preview online

- App: https://mostafabreem.github.io/product-lab/money
- Component gallery (EN / AR, light / dark): https://mostafabreem.github.io/product-lab/gallery

Built and published by `.github/workflows/pages.yml` on every push to `main` or `case/tabby`.

## Run

```bash
npm install
npm run tabby          # then press i for the iPhone Simulator (needs Xcode), or w for web
npm test               # format + derive + reminder schedule unit tests
npm run tokens         # regenerate tokens after copying a new tokens.json into packages/app-kit/tokens/
```

Debug menu: long-press the **Money** title (scenario, offline, pay result, latency, mock clock, language, theme, reminders, event log).
Web preview shortcuts: `/money?scenario=overdue&lang=ar&net=offline&pay=declined&scheme=dark`.

Fonts: Bawazek Sans / Bawazek Sans Arabic = IBM Plex Sans (OFL) + Saudi riyal sign (OFL); licences in `packages/app-kit/assets/fonts/`.
