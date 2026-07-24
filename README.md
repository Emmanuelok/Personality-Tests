# Psyche Atlas

Psyche Atlas is a local-first, evidence-aware learner workspace for structured
self-reflection, deliberate practice, and progress review.

It brings the product's assessments, cognitive practice activities, integrated
profile, growth planning, collaborative study, and Connection Map into one
coherent journey:

**Today → My Atlas → Explore → Groups**

The platform is educational. It does not diagnose conditions, estimate clinical
IQ, determine compatibility, predict a person's future, or make admissions,
employment, treatment, or other high-impact decisions.

## What the workspace does

- **Today** turns the learner's stated goals and completed activities into one
  transparent next step, a small practice, and a reason it was suggested.
- **My Atlas** shows the evidence behind insights, separates observations from
  interpretations, and keeps uncertainty visible.
- **Explore** provides assessments and practice activities by learner question
  rather than presenting a disconnected wall of tests.
- **Groups** connects Study Together and the Connection Map without treating
  another person as a score.
- **Ask Atlas** is deterministic and on-device by default. External AI is a
  separate, explicit action and receives only the actionable evidence the learner
  approves for that request.

## Evidence before automation

Every piece of learner context belongs to one of three tiers:

| Tier | Examples | Autonomous use |
| --- | --- | --- |
| **Actionable** | chosen goal, completed practice, learner-approved next step | may inform a bounded recommendation |
| **Reflective** | assessment pattern, journal interpretation, Connection Map observation | shown for reflection; excluded from autonomous recommendations unless explicitly enabled |
| **Private** | raw answers, journal text, sensitive or identifying context | never sent to external AI, norms, or autonomous recommendation logic |

Recommendations expose their supporting evidence, confidence, and limitations.
If there is not enough appropriate evidence, Atlas asks for a learner choice
instead of inventing certainty.

## Eight bounded learner agents

The learner engine is deterministic and framework-independent. Its agents are
small capability modules, not unrestricted autonomous actors:

1. **Consent agent** — verifies that the requested use is permitted.
2. **Evidence curator** — filters context by tier, recency, and relevance.
3. **Interpretation agent** — turns observations into calibrated possibilities.
4. **Goal mapper** — connects the learner's chosen goals to supported actions.
5. **Mission agent** — creates a bounded objective with a clear completion state.
6. **Practice router** — selects a small activity and explains the match.
7. **Progress reviewer** — compares attempts while accounting for context and
   practice effects.
8. **Reflection agent** — prompts the learner to confirm, reject, or refine what
   the system inferred.

The orchestrator records why an agent ran, what evidence it used, and whether
consent allowed the action.

## Responsible assessment design

- Personality and wellbeing activities are self-reflection tools, not clinical
  instruments.
- Cognitive activities report session-specific practice observations and
  performance dimensions. They do not convert results into IQ ranges or fixed
  potential.
- Local personality reports show positions within each activity's possible
  response range, not population percentiles. Separately opted-in community
  reference data appears only after the configured privacy threshold is met.
- Timed activities use wall-clock observations and guard against stale or
  repeated submissions.
- Results describe measurement noise, environmental context, retest effects,
  and the limits of short self-administered activities.
- Growth views compare change carefully; movement between attempts is not
  automatically treated as durable personal change.
- The Connection Map compares dimensions one at a time. It does not calculate
  an overall compatibility percentage or verdict.

Instrument references and caveats are displayed in their reports. Inclusion in
the catalog does not mean that every activity has been independently validated
for every population, language, or decision context.

## Privacy model

- Profile history, raw answers, reflections, learner goals, and most generated
  outputs stay in the browser.
- External AI is off by default and requires an informed action for each request.
  The request is deidentified, minimized, and restricted to learner-approved
  actionable evidence.
- Anonymous norm contribution is a separate opt-in path. The API allowlists
  eligible measures and suppresses norm output below the configured minimum
  sample threshold.
- Portable profile backups are encrypted in the browser with AES-GCM and a
  learner-chosen passphrase. The passphrase is neither stored nor transmitted.
- Connection Map and Study Together codes are **encoded, not encrypted**.
  Anyone who receives one of those collaboration codes can decode the
  deliberately limited summary inside it.
- Reset removes profile and transient session data while preserving legitimate
  local purchase entitlements. It does not revoke an already-issued HttpOnly
  recovery cookie or retroactively delete records the server must retain for
  fulfillment, refunds, disputes, abuse prevention, or thresholded norms.
- The service worker avoids caching API responses and other sensitive,
  request-specific data.

## Commerce and recovery

Stripe Checkout is optional. Prices and product identifiers are authoritative on
the server, not in the browser.

Production checkout:

- validates the product and result fingerprint;
- binds verification and recovery to both a signed checkout snapshot and the
  browser that started checkout;
- removes the payment provider's return-session identifier from the address bar
  immediately, before verification begins;
- keeps recovery authorization in a 30-day Secure, HttpOnly, SameSite cookie;
- handles webhook idempotency;
- records refunds and disputes with a privacy-minimal per-result revocation
  marker, then removes matching cached report/poster grants on that result's
  next successful online status check; and
- fails closed when production secrets or durable storage are unavailable.

Refund and dispute webhooks cannot update browser storage while the device is
offline. A previously cached report or poster can therefore remain available
offline until the app reconnects and completes a status check. Network,
authorization, and service failures do not erase local grants; only a confirmed
server revocation does.

A clearly labelled demo unlock is available only in local development or when
explicitly enabled for a non-production build.

### Data lifetime

The browser and server retain different, bounded data:

| Data | Default lifetime | Purpose |
| --- | --- | --- |
| Local profile, answers, journal, and generated results | until the learner resets or clears browser storage | local workspace and encrypted backup |
| Pre-checkout browser binding | 2 hours | ensures only the browser that began checkout can verify its return |
| Recovery authorization cookie | 30 days | restores an eligible purchase in the same browser |
| Checkout idempotency records | up to 180 days | prevents duplicate fulfillment |
| Fulfilled purchase and revocation records | up to 2 years | entitlement recovery, refunds, and disputes |
| Eligible anonymous norm contributions | up to 2 years | thresholded aggregate reference data |

Deployers should review these defaults against their legal and institutional
requirements before accepting real learner or payment data.

## Visual system

The landing page and workspace use five original, optimized WebP scenes:

- `atlas-learning-hero.webp`
- `atlas-pathways.webp`
- `atlas-study-together.webp`
- `atlas-insight-landscape.webp`
- `atlas-connection-map.webp`

The scenes share recurring connected pathways, evidence-light motifs, and an
indigo/cyan/coral/amber palette, so imagery reinforces the product architecture
instead of decorating unrelated tools.

## Architecture

```text
.
├── api/
│   ├── _http.ts                 request policy and security headers
│   ├── _validation.ts           bounded input schemas
│   ├── _kv.ts                   durable state and atomic operations
│   ├── _stripe.ts               server-authoritative commerce policy
│   ├── ask.ts                   explicit external-AI endpoint
│   ├── norms.ts                 allowlisted, thresholded norms
│   └── stripe-webhook.ts        durable fulfillment and revocation
├── public/
│   ├── images/                  optimized Atlas visual system
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── core/
│   │   ├── evidence.ts          evidence tiers and consent rules
│   │   ├── learner/             graph, agents, and orchestrator
│   │   ├── ability/             bounded cognitive practice engines
│   │   ├── instruments/         assessment catalog
│   │   ├── compatibility.ts     descriptive Connection Map
│   │   ├── recommend.ts         calibrated recommendation logic
│   │   └── report/              deterministic report composition
│   ├── ui/                      accessible workspace experiences
│   ├── App.tsx                  navigation and journey orchestration
│   ├── atlas.ts                 consent-gated external-AI client
│   ├── profile.ts               local learner profile
│   └── store.ts                 checkout and entitlement client
├── .github/workflows/ci.yml
├── tsconfig.api.json
└── vercel.json
```

The core learner and assessment engines contain no React or DOM dependencies and
can be tested independently.

## Local development

Requirements:

- Node.js 20.19 or newer
- npm

```bash
npm ci
npm run dev
```

The Vite application runs without payment, external-AI, or norms credentials.
Server-backed features require the corresponding environment values documented
in `.env.example`.

Useful commands:

```bash
npm run typecheck       # browser/client TypeScript
npm run typecheck:api   # serverless API TypeScript
npm test                # client and core tests
npm run test:api        # API, validation, storage, and commerce tests
npm run build           # production bundle
npm run verify          # all checks above
```

## Deployment

The repository is configured for a Vite application with Vercel serverless
functions.

1. Import the repository into Vercel.
2. Add only the server-side values required for the features you intend to
   enable. Start from `.env.example`.
3. Configure the Stripe webhook for the deployed `/api/stripe-webhook` endpoint
   if payments are enabled.
4. Provision durable Redis-compatible storage before enabling production
   entitlement recovery or norm contribution.
5. Run `npm run verify` before promoting a deployment.

Do not expose provider, Stripe, signing, or storage secrets through `VITE_*`
variables; those values are embedded in client bundles.

## Accessibility

The unified workspace includes:

- a skip link and semantic main landmark;
- keyboard-operable navigation with current-page state;
- route and quiz focus management;
- labelled onboarding progress and goals;
- live status announcements for search, quiz, and companion updates;
- focus-trapped dialogs with Escape and focus restoration;
- responsive mobile navigation and visible horizontal-scroll affordances; and
- fixed image dimensions to reduce layout movement.

Accessibility is an ongoing compatibility commitment, not a one-time
certification. Test with keyboard navigation, screen readers, zoom, reduced
motion, and high-contrast settings before each release.

## Security notes

The API rejects unsupported methods and media types, oversized bodies, unknown
fields, unallowlisted products/measures, malformed identifiers, and
rate-limit abuse. Responses containing private or purchase state use
`Cache-Control: no-store`. Deployment headers establish a restrictive browser
security baseline.

No public application should describe itself as perfectly secure. Report a
suspected vulnerability privately to the repository owner and avoid including
real learner data or credentials in an issue.

## Natural next development phase

The next priority is a **validation and outcomes program**, not a larger catalog:

1. create an instrument-level provenance registry for item source, intended use,
   reliability evidence, translation status, population limits, and review date;
2. run consented usability and accessibility studies with real learners;
3. test whether recommended practices improve learner-chosen outcomes without
   creating harmful dependence or false certainty;
4. add authenticated, encrypted cross-device sync only after a threat model,
   retention policy, deletion workflow, and guardian/age considerations are
   reviewed; and
5. instrument privacy-preserving product analytics around completion,
   comprehension, and recommendation usefulness.

That evidence should decide what Atlas expands next.

## License

MIT. See [`LICENSE`](./LICENSE).
