# 🧭 Psyche Atlas

**An intelligent platform for taking authoritative personality assessments and receiving a uniquely tailored, growth-oriented report.**

Psyche Atlas is not just a test app — it's a self-understanding *and* self-improvement engine. You take a scientifically-grounded assessment, receive a report composed from your **entire response pattern** (so no two reports are ever identical), and then turn that same data toward growth with an **evidence-based development plan** from where you are to where you want to be.

> Status: **v0.2.** A working, tested core with **seven instruments**, a freemium store ($1.89 unlock), a designed PDF export, and one-click Vercel deploy. Built to extend toward "every personality test in the world" via a data-driven instrument model. See [Roadmap](#roadmap).

---

## Why it's different

| Principle | How Psyche Atlas delivers it |
|---|---|
| **Grounded in original science** | Big Five uses the verbatim **public-domain IPIP** Big-Five Factor Markers (Goldberg, 1992). Type instruments are original measures grounded in Jung (1921), Myers, and the Enneagram literature, with full citations surfaced in every report. |
| **No two reports are ever the same** | Reports are composed from your full continuous response vector (every item, every sub-score), then rendered through large phrasing-variant banks driven by a **seeded PRNG**. The seed folds in a cryptographic nonce + timestamp, so even identical answers produce different prose every time — *and* a saved seed reproduces a report exactly. (Verified by tests.) |
| **Intelligent or deterministic** | A strong deterministic composer is the always-on default (works offline, no API key). An optional, pluggable `LLMProvider` (Anthropic SDK) can elevate the prose when a key is available — without ever changing the underlying scores. |
| **A growth engine, not a verdict** | After scoring, set a target for each trait. The improvement engine produces a personalized plan grounded in the personality-change literature (implementation intentions, habit design, cognitive reappraisal, etc.). |
| **Private by default** | The whole experience runs client-side. Your answers never leave your device. |

---

## The instruments (7 and growing)

1. **Big Five (IPIP-50)** — the empirical gold standard. Five factors (O, C, E, A, N) scored against approximate population norms. *Public-domain items.*
2. **HEXACO (6 dimensions)** — the Big Five plus **Honesty-Humility** (Lee & Ashton). *Original facet-based items.*
3. **Jungian Type Profiler (16 Types)** — four dichotomies → one of sixteen types, with the Jungian cognitive-function stack. *Original items; not the MBTI® instrument.*
4. **Enneagram of Personality** — nine motivation-based types with wing, center of intelligence, and passion→virtue growth framing. *Original items grounded in the Enneagram literature.*
5. **DISC Behavioral Styles** — four styles (D·I·S·C) with primary/secondary blend, for communication and teamwork. *Original items.*
6. **Attachment Style** — attachment anxiety × avoidance → four relationship styles, with growth toward security. *Original items, ECR tradition.*
7. **Dark Triad** — Machiavellianism, Narcissism, Psychopathy (normal-range), for honest self-insight. *Original items, SD3-grounded.*

Each instrument is a single data file (`src/core/instruments/*.ts`) — adding more (VIA Strengths, values inventories, etc.) is a matter of describing items, scales, and (optionally) a type-resolution function.

---

## Architecture

```
src/
├── core/                      # framework-agnostic engine (no DOM/React) — unit-tested
│   ├── types.ts               # domain model: Instrument, Item, ScaleScore, AssessmentResult…
│   ├── prng.ts                # cyrb53 hash + mulberry32 seeded RNG + nonce  (uniqueness primitives)
│   ├── variation.ts           # pure text helpers
│   ├── scoring.ts             # keying, means, normal-CDF percentiles, levels, type resolution
│   ├── instruments/           # bigfive · hexaco · jung · enneagram · disc · attachment · darktriad
│   ├── commerce.ts             # product catalog (Full Report, All-Access, Poster)
│   ├── report/
│   │   ├── phrasebank.ts       # level-templated openers + trait color + dynamics rules
│   │   ├── composer.ts         # deterministic, uniqueness-guaranteed report composer
│   │   ├── llm.ts              # optional Anthropic-backed provider (server-side, opt-in)
│   │   └── index.ts            # generateReport() — deterministic, with optional LLM elevation
│   ├── improvement/plan.ts     # evidence-based growth-plan generator
│   ├── index.ts                # public core API
│   └── engine.test.ts          # scoring · typology · uniqueness · growth tests
└── ui/ + App.tsx + styles.css  # React (Vite) front end: Home · Quiz · Report · ImprovementPlanner · charts
```

The **core is intentionally portable** — it has no UI dependencies, so the same scoring and report engines can later run on a server, in a worker, or behind an API.

### How uniqueness is guaranteed

1. **Granularity** — the report is built from continuous facet/factor scores and *individual item responses*, not just the final label. Two "INTJs" almost never share a 32-dimensional answer vector.
2. **Seeded variation** — every narrative beat is selected from many interchangeable phrasings via a `mulberry32` PRNG seeded by `hash(responses) ⊕ timestamp ⊕ nonce`.
3. **Reproducibility** — pass a fixed `seed` to regenerate a saved report byte-for-byte; omit it for a fresh, never-identical one. The UI's **"Regenerate"** button demonstrates this live.

---

## Run it

```bash
npm install
npm run dev        # start the dev server (Vite)
npm run build      # type-check + production build
npm test           # run the engine test suite (Vitest)
```

Requires Node 18+.

### Optional: AI-elevated prose

The deterministic engine is the default and needs no API key. To enable optional LLM composition **server-side**, install the SDK and provide a key:

```bash
npm install @anthropic-ai/sdk
export ANTHROPIC_API_KEY=sk-ant-...
export ANTHROPIC_MODEL=...        # point at the latest Claude Opus for the richest prose
```

Then pass a provider to `generateReport(instrument, result, { llm: createClaudeProvider() })`. The model only rewrites prose — it never alters scores, levels, or type. (Calling Claude from the browser is intentionally **not** wired up, to avoid exposing keys.)

---

## Deploy to Vercel

This is a Vite SPA plus serverless functions in `/api`, so it deploys to Vercel with essentially zero config:

1. Push to GitHub (done).
2. In Vercel, **Import** the repo. The **Vite** preset is auto-detected (build `npm run build`, output `dist`); `vercel.json` is included.
3. *(Optional — to charge real money)* add Environment Variables under **Settings → Environment Variables**: `STRIPE_SECRET_KEY` (and optionally `PRICE_REPORT_CENTS`, etc.), then redeploy.
4. Open your URL — it's live.

Local dev with the serverless functions: `npm i -g vercel && vercel dev`. Plain `npm run dev` also works — checkout simply falls back to a demo unlock because `/api` isn't running.

## Selling results — freemium, no sign-in

- The end of every questionnaire shows a **free snapshot** (your headline/type, a radar chart, and a teaser).
- The **full report + personalized growth plan** unlocks for **$1.89** via **Stripe Checkout** — no account, no login; buyers just pay and it unlocks instantly. A **stunningly designed multi-page PDF**, plus Markdown, JSON, and print, are all included.
- **Demo mode:** with no `STRIPE_SECRET_KEY` set, the site is fully usable — "Unlock" grants access instantly (clearly a preview) so you can demo before wiring Stripe.
- **Extensible store:** products live in `src/core/commerce.ts` (server-authoritative prices in `api/_stripe.ts`). Ships with the **Full Report** ($1.89), an **All-Access Pass** ($5.90), and a print-ready **Personality Poster** PDF ($2.90). Add more digital merch by appending to the catalog.
- **Privacy & no database:** answers never leave the device; entitlements live in `localStorage`, the in-progress result in `sessionStorage` (so it survives the Stripe round-trip). Purchases are verified **server-side** (`/api/verify-session`) before unlocking.

> Production hardening worth adding later: a Stripe **webhook** for fulfillment robustness, and optional accounts for cross-device entitlements.

---

## Scientific basis & honest limitations

These assessments are tools for **self-understanding and growth, not clinical diagnosis**. Traits describe tendencies, not destiny; percentiles are estimates from community norms. Every report surfaces its own citations and caveats. Key sources include:

- Goldberg, L. R. (1992); Goldberg et al. (2006) — IPIP. Costa & McCrae (1992); John & Srivastava (1999) — Five-Factor Model.
- Jung, C. G. (1921/1971) *Psychological Types*; Myers & Myers (1980) *Gifts Differing*.
- Riso & Hudson (1999); Naranjo (1994); Palmer (1988) — Enneagram.
- Roberts et al. (2017); Hudson & Fraley (2015); Stieger et al. (2021) — personality change. Gollwitzer (1999) — implementation intentions.

Psyche Atlas is independent and not affiliated with or endorsed by the Myers-Briggs Company or any trademark holder.

---

## Roadmap

The "extensive updates" build on this foundation:

- **More instruments** — HEXACO, DISC, Dark Triad/Tetrad, VIA Character Strengths, attachment style, values inventories.
- **Verified item norms** — replace approximate norm parameters with published normative tables; add reliability/validity reporting and an attention/consistency check.
- **Richer typological growth** — inferior-function development (Jung) and full passion→virtue paths (Enneagram).
- **Persistence & longitudinal tracking** — save results, re-test over time, and visualize trait change against your plan.
- **Server API + first-class AI mode** — move the optional LLM layer behind a secure endpoint.
- **Commerce hardening** — Stripe webhooks for fulfillment, optional accounts for cross-device entitlements, gift codes, and more digital merch (compatibility add-ons, deep-dive bundles).
- **Accessibility & i18n** — full keyboard/screen-reader passes and translated instruments.

---

## License

MIT — see [LICENSE](./LICENSE).
