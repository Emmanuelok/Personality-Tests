# 🧭 Psyche Atlas

**An intelligent platform for taking authoritative personality assessments and receiving a uniquely tailored, growth-oriented report.**

Psyche Atlas is not just a test app — it's a self-understanding *and* self-improvement engine. You take a scientifically-grounded assessment, receive a report composed from your **entire response pattern** (so no two reports are ever identical), and then turn that same data toward growth with an **evidence-based development plan** from where you are to where you want to be.

> Status: **v0.1 — foundation.** A working, tested core with three flagship instruments. Built to be extended into "every personality test in the world" via a data-driven instrument model. See [Roadmap](#roadmap).

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

## The instruments (v0.1)

1. **Big Five (IPIP-50)** — the empirical gold standard. Five factors (O, C, E, A, N) scored against approximate population norms. *Public-domain items.*
2. **Jungian Type Profiler (16 Types)** — four dichotomies → one of sixteen types, with the Jungian cognitive-function stack. *Original items; not the MBTI® instrument.*
3. **Enneagram of Personality** — nine motivation-based types with wing, center of intelligence, and passion→virtue growth framing. *Original items grounded in the Enneagram literature.*

Each instrument is a single data file (`src/core/instruments/*.ts`) — adding HEXACO, DISC, the Dark Triad, VIA Strengths, etc. is a matter of describing items, scales, and (optionally) a type-resolution function.

---

## Architecture

```
src/
├── core/                      # framework-agnostic engine (no DOM/React) — unit-tested
│   ├── types.ts               # domain model: Instrument, Item, ScaleScore, AssessmentResult…
│   ├── prng.ts                # cyrb53 hash + mulberry32 seeded RNG + nonce  (uniqueness primitives)
│   ├── variation.ts           # pure text helpers
│   ├── scoring.ts             # keying, means, normal-CDF percentiles, levels, type resolution
│   ├── instruments/           # bigfive.ts · jung.ts · enneagram.ts · index.ts
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
- **Accessibility & i18n** — full keyboard/screen-reader passes and translated instruments.

---

## License

MIT — see [LICENSE](./LICENSE).
