import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { Instrument } from "@core/types";
import { INSTRUMENTS, instrumentsByCategory, getInstrument } from "@core/instruments";
import { ABILITY_TESTS, type AbilityTest } from "@core/ability";
import { MEMORY_TEST, CORSI_TEST } from "@core/ability/memory";
import { PROCESSING_TEST } from "@core/ability/processing";
import { ADAPTIVE_TEST } from "@core/ability/adaptive";
import { IAT_TEST } from "@core/ability/iat";
import { CREATIVITY_TEST } from "@core/ability/creativity";
import { CATEGORIES } from "@core/categories";
import { localizeCategory } from "@core/categories.i18n";
import { localizeInstrument } from "@core/instruments/i18n";
import { searchInstruments, matchesQuery } from "@core/search";
import { recommendNext, profileSpotlight, type RecKind } from "@core/recommend";
import { dailyNudgeFromEvidence } from "@core/daily";
import { coachNextPractice, practiceStreak } from "@core/wellbeingagent";
import { buildRoadmap } from "@core/roadmap";
import { computeMilestones } from "@core/milestones";
import { analyzeConvergence } from "@core/converge";
import {
  autonomousEntries,
  type EvidenceConsent,
  type EvidenceRecord,
} from "@core/evidence";
import { downloadICS } from "./calendar";
import type { SynthEntry } from "@core/synthesis";
import { GOALS, labelsFor, keysFromFocus, toLoc, type Loc } from "./goals";
import { TOPICS } from "./topics";
import { HeroBackdrop, CategoryEmblem, InstrumentGlyph, Flourish } from "./art";
import { Gauge } from "./charts";
import { Reveal } from "./Reveal";
import { useI18n } from "../i18n";

export function Home({
  mode = "today",
  entries = [],
  name,
  focus = [],
  streakDays = 0,
  cognitiveCount = 0,
  onUpdateGoals,
  onAutopilot,
  onStart,
  onCompatibility,
  onIntegrated,
  onStartPack,
  onStartAbility,
  onStartMemory,
  onStartCorsi,
  onStartSpeed,
  onStartAdaptive,
  onStartIat,
  onStartCreativity,
  onBattery,
  initialTopic,
  initialQuery,
  onInitialConsumed,
  onStudyTopic,
  practiceLog = [],
  onCompletePractice,
  onExplore,
  recommendationEvidence,
  recommendationConsent,
}: {
  mode?: "today" | "explore";
  entries?: SynthEntry[];
  name?: string;
  focus?: string[];
  streakDays?: number;
  cognitiveCount?: number;
  onUpdateGoals?: (focus: string[]) => void;
  onAutopilot?: () => void;
  onStart: (instrument: Instrument) => void;
  onCompatibility: () => void;
  onIntegrated?: () => void;
  onStartPack: () => void;
  onStartAbility: (test: AbilityTest) => void;
  onStartMemory: () => void;
  onStartCorsi: () => void;
  onStartSpeed: () => void;
  onStartAdaptive: () => void;
  onStartIat: () => void;
  onStartCreativity: () => void;
  onBattery?: () => void;
  /** Deep-link: a topic-chip key (`?topic=`) to pre-select on open. */
  initialTopic?: string;
  /** Deep-link: a free-text catalog query (`?find=`) to pre-fill on open. */
  initialQuery?: string;
  /** Called once the initial deep-link has been applied (so it isn't re-applied on remount). */
  onInitialConsumed?: () => void;
  /** Start a Study Together room seeded from the active catalog topic/search. */
  onStudyTopic?: (seed: { topic?: string; query?: string }) => void;
  /** ISO dates the user has completed a coach practice (for the streak). */
  practiceLog?: string[];
  /** Mark today's coach practice complete. */
  onCompletePractice?: () => void;
  /** Open the dedicated Explore workspace. */
  onExplore?: () => void;
  /** Completion-only evidence available to autonomous/recommendation surfaces. */
  recommendationEvidence: readonly EvidenceRecord<SynthEntry>[];
  recommendationConsent: EvidenceConsent;
}) {
  const { locale, t } = useI18n();
  const routedEntries = useMemo(
    () => autonomousEntries(recommendationEvidence, recommendationConsent),
    [recommendationConsent, recommendationEvidence],
  );
  // Spotlight and convergence are user-led reflections. Actions below use only
  // policy-filtered completion evidence, never raw assessment answers/scores.
  const spotlight = useMemo(() => profileSpotlight(entries, { locale }), [entries, locale]);
  const recs = useMemo(
    () => recommendNext([], {
      locale,
      limit: 3,
      evidence: recommendationEvidence,
      consent: recommendationConsent,
      mode: "autonomous",
    }),
    [locale, recommendationConsent, recommendationEvidence],
  );
  const nudge = useMemo(
    () => dailyNudgeFromEvidence(recommendationEvidence, {
      locale,
      consent: recommendationConsent,
    }),
    [locale, recommendationConsent, recommendationEvidence],
  );
  const coachToday = useMemo(() => coachNextPractice(routedEntries, { locale }), [locale, routedEntries]);
  const practiceDoneToday = practiceLog.includes(new Date().toISOString().slice(0, 10));
  const pStreak = useMemo(() => practiceStreak(practiceLog), [practiceLog]);
  const roadmap = useMemo(() => buildRoadmap(routedEntries, focus, { locale }), [focus, locale, routedEntries]);
  const milestones = useMemo(() => computeMilestones(entries, { streakDays, cognitiveCount, locale }), [entries, streakDays, cognitiveCount, locale]);
  const crossInsight = useMemo(() => {
    if (entries.length < 2) return null;
    const c = analyzeConvergence(entries, { locale });
    return (c.topConvergent ?? c.topDivergent ?? c.readings[0])?.insight ?? null;
  }, [entries, locale]);
  const [editGoals, setEditGoals] = useState(false);
  const [goalSel, setGoalSel] = useState<string[]>([]);
  const openGoals = () => { setGoalSel(keysFromFocus(focus)); setEditGoals(true); };
  const toggleGoal = (k: string) => setGoalSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const saveGoals = () => { onUpdateGoals?.(labelsFor(goalSel, locale)); setEditGoals(false); };
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const key = h < 12 ? "home.greetMorning" : h < 18 ? "home.greetAfternoon" : "home.greetEvening";
    return name ? `${t(key)}, ${name}` : t(key);
  }, [name, t]);

  // Catalog search — find a test by free text, or one-tap a topic chip. The two
  // are mutually exclusive ways to drive the same ranked results. Both can be
  // deep-linked (?topic= / ?find=) so a search is shareable and survives reload.
  const validTopic = initialTopic && TOPICS.some((tp) => tp.key === initialTopic) ? initialTopic : "";
  const [catalogQuery, setCatalogQuery] = useState(validTopic ? "" : (initialQuery ?? ""));
  const [topic, setTopic] = useState(validTopic);
  const activeTopic = TOPICS.find((tp) => tp.key === topic) ?? null;
  const q = activeTopic ? activeTopic.q : catalogQuery.trim();
  const queryLabel = activeTopic ? activeTopic.label[toLoc(locale)] : q;
  const clearSearch = () => { setCatalogQuery(""); setTopic(""); };
  const results = useMemo(() => (q ? searchInstruments(q, { locale }) : null), [q, locale]);

  // Keep the URL in sync so any search/topic is shareable and survives reload.
  useEffect(() => {
    const base = window.location.pathname;
    const hash = window.location.hash;
    const url = topic ? `${base}?topic=${encodeURIComponent(topic)}${hash}`
      : catalogQuery.trim() ? `${base}?find=${encodeURIComponent(catalogQuery.trim())}${hash}`
      : `${base}${hash}`;
    window.history.replaceState({}, "", url);
  }, [topic, catalogQuery]);

  // Arriving via a shared search link: drop the user at the results, and mark the
  // deep-link consumed so navigating away and back doesn't re-apply it.
  useEffect(() => {
    if (validTopic || initialQuery) {
      document.getElementById("catalog")?.scrollIntoView();
      onInitialConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // The cognition battery isn't in INSTRUMENTS, so give it lightweight searchable entries.
  const cognitionTests = [
    ...ABILITY_TESTS.map((at) => ({ id: at.id, name: at.name, short: at.shortName, tagline: at.tagline, kind: t("h.abilityKind"), kw: ["iq", "intelligence", "reasoning", "cognitive", "ability", "matrices", "icar"], run: () => onStartAbility(at) })),
    { id: "memory-span", name: MEMORY_TEST.name, short: MEMORY_TEST.shortName, tagline: MEMORY_TEST.tagline, kind: t("h.abilityKind"), kw: ["memory", "working memory", "digit span", "recall", "cognitive"], run: onStartMemory },
    { id: "corsi-blocks", name: CORSI_TEST.name, short: CORSI_TEST.shortName, tagline: CORSI_TEST.tagline, kind: t("h.abilityKind"), kw: ["memory", "spatial", "visual", "corsi", "recall", "cognitive"], run: onStartCorsi },
    { id: "processing-speed", name: PROCESSING_TEST.name, short: PROCESSING_TEST.shortName, tagline: PROCESSING_TEST.tagline, kind: t("h.abilityKind"), kw: ["speed", "processing", "attention", "timed", "symbol", "cognitive"], run: onStartSpeed },
    { id: "adaptive-reasoning", name: ADAPTIVE_TEST.name, short: ADAPTIVE_TEST.shortName, tagline: ADAPTIVE_TEST.tagline, kind: t("h.abilityKind"), kw: ["iq", "reasoning", "fluid", "adaptive", "intelligence", "logic", "cognitive"], run: onStartAdaptive },
    { id: "iat-demo", name: IAT_TEST.name, short: IAT_TEST.shortName, tagline: IAT_TEST.tagline, kind: t("h.rtKind"), kw: ["implicit", "bias", "association", "reaction time", "cognitive"], run: onStartIat },
    { id: "alternative-uses", name: CREATIVITY_TEST.name, short: CREATIVITY_TEST.shortName, tagline: CREATIVITY_TEST.tagline, kind: t("h.perfKind"), kw: ["creativity", "divergent", "ideas", "imagination", "cognitive"], run: onStartCreativity },
  ];
  const cogResults = q ? cognitionTests.filter((c) => matchesQuery(q, c.name, c.tagline, c.kw)) : [];
  const matchCount = (results?.length ?? 0) + cogResults.length;
  const workspaceCopy = HOME_WORKSPACE[toLoc(locale)];

  const renderInstrumentCard = (inst: Instrument) => {
    const li = localizeInstrument(inst, locale);
    return (
      <article className="card" key={inst.id}>
        <span className={`card-watermark cat-${inst.category}`} aria-hidden="true">
          <InstrumentGlyph id={inst.id} category={inst.category} />
        </span>
        <span className="kind">{inst.kind === "typological" ? t("h.typology") : t("h.dimensional")}</span>
        <h3>{li.name}</h3>
        <p className="tagline">{li.tagline}</p>
        <div className="facts">
          <span>⏱ {t("h.minutes").replace("{m}", String(inst.estMinutes))}</span>
          <span>📝 {t("h.items").replace("{n}", String(inst.items.length))}</span>
          <span>📐 {t(inst.kind === "typological" ? "h.axes" : "h.factors").replace("{n}", String(inst.scales.length))}</span>
        </div>
        <p className="cite">
          {t("h.grounded")
            .replace("{n}", String(inst.citations.length))
            .replace("{s}", t(inst.citations.length === 1 ? "h.source" : "h.sources"))
            .replace("{ref}", inst.citations[0].ref.split("(")[0].trim())}
        </p>
        <button className="btn primary" onClick={() => onStart(inst)}>{t("home.begin")} {li.shortName} →</button>
      </article>
    );
  };
  const renderCogCard = (c: { id: string; name: string; short: string; tagline: string; kind: string; run: () => void }) => (
    <article className="card" key={c.id}>
      <span className="card-watermark cat-cognition" aria-hidden="true">
        <InstrumentGlyph id={c.id} category="cognition" />
      </span>
      <span className="kind">{c.kind}</span>
      <h3>{c.name}</h3>
      <p className="tagline">{c.tagline}</p>
      <button className="btn primary" onClick={c.run}>{t("home.begin")} {c.short} →</button>
    </article>
  );

  return (
    <div className={`container home-workspace home-workspace-${mode}`}>
      {mode === "today" && (
      <div className="today-surface">
      <HeroBackdrop />
      {/* The marketing hero is for first-time visitors. Once someone has goals or
          results, their personalized dashboard (below) leads instead — no
          redundant pitch / empty band above it. */}
      {!(spotlight || focus.length > 0) && (
      <section className="hero hero-stage">
        <div className="hero-aurora" aria-hidden="true" />
        <img
          className="hero-learning-image"
          src="/images/psyche-hero-cinematic-v2.webp"
          width="1920"
          height="1080"
          loading="eager"
          decoding="async"
          alt=""
          aria-hidden="true"
        />
        <span className="eyebrow">{t("h.eyebrow")}</span>
        <h1 className="hero-title">
          {t("h.h1a")} <em className="grad">{t("h.h1grad")}</em>.
          <br /> {t("h.h1b")}
        </h1>
        <p className="lead">
          {t("h.lead1").replace("{n}", String(INSTRUMENTS.length))}<b>{t("h.leadU")}</b>{t("h.lead2")}
        </p>
        <div className="pillars">
          {(["h.pill1", "h.pill2", "h.pill3", "h.pill4"] as const).map((k) => (
            <span className="pill liquid-glass" key={k}><Bold text={t(k)} /></span>
          ))}
        </div>
        <div className="row-actions">
          <button className="glass-btn primary" onClick={onStartPack}>✨&nbsp;{t("h.startPack")}&nbsp;→</button>
          <button className="glass-btn ghost liquid-glass" onClick={onExplore}>{t("h.browseAll").replace("{n}", String(INSTRUMENTS.length))}</button>
        </div>
        <p className="hero-fine">
          {t("h.themesLine").replace("{n}", String(INSTRUMENTS.length)).replace("{c}", String(CATEGORIES.filter((c) => instrumentsByCategory(c.id).length).length))}
        </p>
      </section>
      )}

      {(spotlight || focus.length > 0) && (
        <section className="foryou view-enter" aria-label={t("home.forYou")}>
          <div className="foryou-aura" aria-hidden="true" />
          <img
            className="foryou-image"
            src="/images/psyche-hero-cinematic-v2.webp"
            width="1920"
            height="1080"
            loading="eager"
            decoding="async"
            alt=""
            aria-hidden="true"
          />
          <span className="eyebrow">{greeting}</span>
          <h2 className="foryou-title">{spotlight ? spotlight.headline : t("home.journeyStart")}</h2>
          <p className="foryou-line">{spotlight ? (spotlight.complete && !spotlight.chips.length ? t("home.completedAll") : spotlight.line) : t("home.journeyLine")}</p>
          {spotlight && spotlight.chips.length > 0 && (
            <div className="foryou-chips">
              {spotlight.chips.map((c) => (
                <span className="trait-chip" key={c}>{c}</span>
              ))}
              <span className="trait-chip muted">{t("home.takenCount").replace("{n}", String(entries.length))}</span>
            </div>
          )}
          <div className="foryou-actions">
            <button className="btn primary sm" onClick={onStartPack}>✨&nbsp;{t("h.startPack")}</button>
            <button className="btn ghost sm" onClick={onExplore}>{t("h.browseAll").replace("{n}", String(INSTRUMENTS.length))}</button>
          </div>
          <dl className="today-evidence" aria-label={workspaceCopy.evidenceState}>
            <div>
              <dt>{workspaceCopy.evidence}</dt>
              <dd>{entries.length
                ? workspaceCopy.completed.replace("{n}", String(entries.length))
                : workspaceCopy.gettingStarted}</dd>
            </div>
            <div>
              <dt>{workspaceCopy.progress}</dt>
              <dd>{roadmap.total
                ? workspaceCopy.progressValue.replace("{pct}", String(roadmap.pct))
                : workspaceCopy.pathReady}</dd>
            </div>
            <div>
              <dt>{workspaceCopy.nextAction}</dt>
              <dd>{roadmap.steps.find((step) => step.current)?.name ?? recs[0]?.instrument.name ?? workspaceCopy.chooseActivity}</dd>
            </div>
          </dl>
          {roadmap.steps.length > 0 && (
            <div className="panel roadmap-panel">
              <div className="rm-head">
                <Gauge value={roadmap.pct} size={92} />
                <div className="rm-head-text">
                  <h3>{t("home.roadmap")}</h3>
                  <p>{t("home.roadmapProgress").replace("{d}", String(roadmap.doneCount)).replace("{t}", String(roadmap.total))}</p>
                  {streakDays > 1 && <span className="streak">🔥 <b>{streakDays}</b> {t("home.streak")}</span>}
                </div>
                {onUpdateGoals && !editGoals && (
                  <button className="rm-tune" onClick={openGoals}>✎ {t("home.tuneGoals")}</button>
                )}
              </div>
              {editGoals && (
                <div className="rm-goals">
                  <p className="rm-goals-label">{t("home.tuneGoalsHint")}</p>
                  <div className="chips">
                    {GOALS.map((g) => (
                      <button
                        key={g.key}
                        className={`chip-toggle ${goalSel.includes(g.key) ? "on" : ""}`}
                        aria-pressed={goalSel.includes(g.key)}
                        onClick={() => toggleGoal(g.key)}
                      >
                        <span aria-hidden="true" style={{ marginRight: 6 }}>{g.icon}</span>{g.label[toLoc(locale)]}
                      </button>
                    ))}
                  </div>
                  <div className="row-actions" style={{ marginTop: 12 }}>
                    <button className="btn ghost sm" onClick={() => setEditGoals(false)}>{t("home.cancel")}</button>
                    <button className="btn primary sm" onClick={saveGoals}>{t("home.saveGoals")}</button>
                  </div>
                </div>
              )}
              <ol className="roadmap">
                {roadmap.steps.map((st, i) => {
                  const inst = getInstrument(st.instrumentId);
                  return (
                    <li key={st.instrumentId} className={`rm-step${st.current ? " current" : ""}${st.done ? " done" : ""}`}>
                      <span className="rm-node">{st.done ? "✓" : i + 1}</span>
                      <div className="rm-body">
                        <div className="rm-name">{st.name} {st.current && <span className="rm-badge">{t("home.youAreHere")}</span>}</div>
                        <div className="rm-reason">{st.reason}</div>
                      </div>
                      {st.current && inst
                        ? <button className="btn primary rm-go" onClick={() => onStart(inst)}>{t("home.begin")} →</button>
                        : <span className="rm-min">{st.estMinutes} min</span>}
                    </li>
                  );
                })}
              </ol>
              {onAutopilot && roadmap.pct < 100 && (
                <div className="rm-actions">
                  <button className="btn autopilot-cta" onClick={onAutopilot}>{t("home.autopilot")}</button>
                  <button className="btn ghost sm" onClick={() => {
                    const todo = roadmap.steps.filter((st) => !st.done);
                    if (!todo.length) return;
                    downloadICS("psyche-atlas-journey.ics", todo.map((st, i) => {
                      const start = new Date(); start.setDate(start.getDate() + (i + 1) * 2); start.setHours(18, 0, 0, 0);
                      return { title: `Psyche Atlas — ${st.name}`, description: st.reason, start, durationMin: st.estMinutes };
                    }));
                  }}>📅 {t("home.schedule")}</button>
                </div>
              )}
            </div>
          )}
          {/* One proactive card: the coach practice when a wellbeing portrait exists
              (the daily-habit anchor, with completion + streak), else the trait nudge. */}
          {coachToday ? (
            <div className={`panel insight-card coach-today${practiceDoneToday ? " done" : ""}`}>
              <div className="coach-today-head">
                <span className="eyebrow2">{t("home.todayPractice")}</span>
                <span className="coach-today-count">{coachToday.index}/{coachToday.total}</span>
              </div>
              <h3>{coachToday.practice.title}</h3>
              {coachToday.practice.cadence && <p className="coach-today-cadence">{coachToday.practice.cadence}</p>}
              <p className="coach-today-edge">{t("home.todayFocus").replace("{dim}", coachToday.focusDimensionName)}</p>
              <div className="coach-today-foot">
                {practiceDoneToday
                  ? <span className="coach-done">✓ {t("home.practiceDone")}</span>
                  : onCompletePractice && <button className="btn primary sm" onClick={onCompletePractice}>{t("home.markDone")}</button>}
                {pStreak > 0 && <span className="coach-streak">🔥 <b>{pStreak}</b> {t("home.streak")}</span>}
                {onIntegrated && <button className="btn ghost sm" onClick={onIntegrated}>{t("home.todayOpen")}</button>}
              </div>
              {practiceDoneToday && <p className="coach-tomorrow">{t("home.practiceTomorrow")}</p>}
            </div>
          ) : nudge ? (
            <div className="panel insight-card foryou-today">
              <span className="eyebrow2">{nudge.eyebrow}</span>
              <h3>{nudge.title}</h3>
              <p style={{ color: "var(--text-dim)", margin: 0 }}>{nudge.line}</p>
              <div className="practice">
                <b>{nudge.practiceLabel}:</b> {nudge.practice}
              </div>
            </div>
          ) : null}
          {milestones.achievedCount > 0 && (
            <div className="panel ms-panel">
              <div className="ms-panel-head">
                <h3>{t("home.milestones")}</h3>
                <span className="ms-count">{milestones.achievedCount} / {milestones.total}</span>
              </div>
              <div className="ms-badges">
                {milestones.all.map((m) => (
                  <span key={m.id} className={`ms-badge${m.achieved ? " on" : ""}`} title={`${m.title} — ${m.blurb}`}>
                    <span className="ms-ic" aria-hidden="true">{m.icon}</span>
                    <span className="ms-bt">{m.title}</span>
                  </span>
                ))}
              </div>
              {milestones.next && (
                <div className="ms-next">
                  <span className="ms-next-ic" aria-hidden="true">{milestones.next.icon}</span>
                  <div className="ms-next-body">
                    <div className="ms-next-top">
                      <b>{t("home.nextMilestone")}: {milestones.next.title}</b>
                      <span className="ms-next-label">{milestones.next.label}</span>
                    </div>
                    <div className="ms-bar"><i style={{ width: `${Math.round(milestones.next.progress * 100)}%` }} /></div>
                    <span className="ms-next-blurb">{milestones.next.blurb}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {entries.length > 0 && recs.length > 0 && (
            <>
              <h3 className="foryou-sub">{t("home.nextSteps")}</h3>
              <div className="grid rec-grid">
                {recs.map((r) => (
                  <article className={`card rec-card rec-${r.kind}`} key={r.instrument.id}>
                    <span className={`card-watermark cat-${r.instrument.category}`} aria-hidden="true">
                      <InstrumentGlyph id={r.instrument.id} category={r.instrument.category} />
                    </span>
                    <span className={`rec-badge rec-badge-${r.kind}`}>{recBadgeGlyph(r.kind)} {r.badge}</span>
                    <h3>{r.instrument.name}</h3>
                    <p className="rec-reason">{r.reason}</p>
                    <div className="facts">
                      <span>⏱ {r.instrument.estMinutes} min</span>
                      <span>📝 {r.instrument.items.length}</span>
                    </div>
                    <button className="btn primary" onClick={() => onStart(r.instrument)}>{t("home.begin")} {r.instrument.shortName} →</button>
                  </article>
                ))}
              </div>
            </>
          )}
          {onIntegrated && entries.length >= 2 && (
            crossInsight ? (
              <button className="panel xc-teaser" onClick={onIntegrated} type="button">
                <span className="xc-teaser-label">{t("home.crossInsight")}</span>
                <p>{crossInsight}</p>
                <span className="xc-teaser-cta">{t("home.seeIntegrated")}</span>
              </button>
            ) : (
              <div className="foryou-foot">
                <button className="btn ghost" onClick={onIntegrated}>{t("home.seeIntegrated")}</button>
              </div>
            )
          )}
        </section>
      )}
      </div>
      )}

      {mode === "explore" && (
      <div className="explore-surface">
      <section className="workspace-hero explore-hero">
        <div className="workspace-hero-copy">
          <span className="eyebrow2">{workspaceCopy.exploreEyebrow}</span>
          <h1>{workspaceCopy.exploreTitle}</h1>
          <p>{workspaceCopy.exploreBody}</p>
        </div>
        <img
          src="/images/psyche-explore.webp"
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
          alt=""
          aria-hidden="true"
        />
      </section>
      <Flourish />

      <h2 className="section-title" id="catalog">{t("h.choose")}</h2>

      <div className="catalog-search">
        <span className="catalog-search-icon" aria-hidden="true">🔍</span>
        <label className="sr-only" htmlFor="atlas-catalog-search">{t("h.searchPlaceholder")}</label>
        <input
          id="atlas-catalog-search"
          type="search"
          className="catalog-search-input"
          value={catalogQuery}
          onChange={(e) => { setCatalogQuery(e.target.value); setTopic(""); }}
          placeholder={t("h.searchPlaceholder")}
          aria-controls="catalog-results"
        />
        {(catalogQuery || topic) && (
          <button className="btn ghost sm catalog-search-clear" onClick={clearSearch}>{t("h.searchClear")}</button>
        )}
      </div>

      <p className="horizontal-hint">{workspaceCopy.scrollHint}</p>
      <div className="topic-chips" role="group" aria-label={t("h.topicsLabel")} aria-controls="catalog-results">
        <span className="topic-chips-label">{t("h.topicsLabel")}</span>
        {TOPICS.map((tp) => (
          <button
            key={tp.key}
            className={`chip-toggle ${topic === tp.key ? "on" : ""}`}
            aria-pressed={topic === tp.key}
            onClick={() => { setTopic(topic === tp.key ? "" : tp.key); setCatalogQuery(""); }}
          >
            {tp.label[toLoc(locale)]}
          </button>
        ))}
      </div>

      {results !== null && (
        <div className="search-results view-enter" id="catalog-results">
          <div className="search-head">
            <p className="search-count" role="status" aria-live="polite" aria-atomic="true">
              {t("h.searchCount").replace("{n}", String(matchCount)).replace("{total}", String(INSTRUMENTS.length + cognitionTests.length)).replace("{q}", queryLabel)}
            </p>
            {matchCount > 0 && onStudyTopic && (
              <button className="btn ghost sm" onClick={() => onStudyTopic({ topic: topic || undefined, query: topic ? undefined : catalogQuery.trim() })}>
                {t("h.studyTogether")}
              </button>
            )}
          </div>
          {matchCount === 0 ? (
            <p className="note">{t("h.searchNone").replace("{q}", queryLabel)}</p>
          ) : (
            <div className="grid">
              {results.map(renderInstrumentCard)}
              {cogResults.map(renderCogCard)}
            </div>
          )}
        </div>
      )}

      {results === null && CATEGORIES.map((cat) => {
        const list = instrumentsByCategory(cat.id);
        if (!list.length) return null;
        const lc = localizeCategory(cat, locale);
        return (
          <Reveal as="div" className="cat-block" key={cat.id}>
            <div className="cat-head">
              <span className={`cat-emblem cat-${cat.id}`}>
                <CategoryEmblem id={cat.id} />
              </span>
              <div>
                <h3 className="cat-name">{lc.name}</h3>
                <p className="cat-blurb">{lc.blurb}</p>
              </div>
            </div>
            <div className="grid">
              {list.map(renderInstrumentCard)}
            </div>
          </Reveal>
        );
      })}

      {results === null && (
      <Reveal as="div" className="cat-block">
        <div className="cat-head">
          <span className="cat-emblem cat-cognition">
            <CategoryEmblem id="cognition" />
          </span>
          <div>
            <h3 className="cat-name">{t("h.cogName")}</h3>
            <p className="cat-blurb">{t("h.cogBlurb")}</p>
          </div>
        </div>
        {onBattery && (
          <div className="panel compat-cta" style={{ marginBottom: 18 }}>
            <span className="compat-emblem cat-cognition" aria-hidden="true"><CategoryEmblem id="cognition" /></span>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>{t("h.batteryTitle")}</h3>
              <p style={{ color: "var(--text-dim)", margin: 0 }}>{t("h.batteryBody")}</p>
            </div>
            <button className="btn" onClick={onBattery}>{t("h.batteryBtn")}</button>
          </div>
        )}
        <div className="grid">
          {ABILITY_TESTS.map((at) => (
            <article className="card" key={at.id}>
              <span className="card-watermark cat-cognition" aria-hidden="true">
                <InstrumentGlyph id={at.id} category="cognition" />
              </span>
              <span className="kind">{t("h.abilityKind")}</span>
              <h3>{at.name}</h3>
              <p className="tagline">{at.tagline}</p>
              <div className="facts">
                <span>⏱ {t("h.minutes").replace("{m}", String(at.estMinutes))}</span>
                <span>📝 {t("h.questions").replace("{n}", String(at.items.length))}</span>
                <span>📐 {t("h.domains").replace("{n}", String(at.domains.length))}</span>
              </div>
              <p className="cite">{t("h.citeIcar")}</p>
              <button className="btn primary" onClick={() => onStartAbility(at)}>{t("home.begin")} {at.shortName} →</button>
            </article>
          ))}
          <article className="card">
            <span className="card-watermark cat-cognition" aria-hidden="true">
              <InstrumentGlyph id="memory-span" category="cognition" />
            </span>
            <span className="kind">{t("h.abilityKind")}</span>
            <h3>{MEMORY_TEST.name}</h3>
            <p className="tagline">{MEMORY_TEST.tagline}</p>
            <div className="facts">
              <span>⏱ ~{t("h.minutes").replace("{m}", "4")}</span>
              <span>🧠 {t("h.liveRecall")}</span>
              <span>📐 {t("h.fwdBwd")}</span>
            </div>
            <p className="cite">{t("h.citeDigit")}</p>
            <button className="btn primary" onClick={onStartMemory}>{t("home.begin")} {MEMORY_TEST.shortName} →</button>
          </article>
          <article className="card">
            <span className="card-watermark cat-cognition" aria-hidden="true">
              <InstrumentGlyph id="corsi-blocks" category="cognition" />
            </span>
            <span className="kind">{t("h.abilityKind")}</span>
            <h3>{CORSI_TEST.name}</h3>
            <p className="tagline">{CORSI_TEST.tagline}</p>
            <div className="facts">
              <span>⏱ ~{t("h.minutes").replace("{m}", "4")}</span>
              <span>🟦 {t("h.tapRecall")}</span>
              <span>📐 {t("h.spatialSpan")}</span>
            </div>
            <p className="cite">{t("h.citeCorsi")}</p>
            <button className="btn primary" onClick={onStartCorsi}>{t("home.begin")} {CORSI_TEST.shortName} →</button>
          </article>
          <article className="card">
            <span className="card-watermark cat-cognition" aria-hidden="true">
              <InstrumentGlyph id="processing-speed" category="cognition" />
            </span>
            <span className="kind">{t("h.abilityKind")}</span>
            <h3>{PROCESSING_TEST.name}</h3>
            <p className="tagline">{PROCESSING_TEST.tagline}</p>
            <div className="facts">
              <span>⏱ {PROCESSING_TEST.durationSec}s</span>
              <span>⚡ {t("h.timed")}</span>
              <span>📐 {t("h.symbolSearch")}</span>
            </div>
            <p className="cite">{t("h.citeSymbol")}</p>
            <button className="btn primary" onClick={onStartSpeed}>{t("home.begin")} {PROCESSING_TEST.shortName} →</button>
          </article>
          <article className="card">
            <span className="card-watermark cat-cognition" aria-hidden="true">
              <InstrumentGlyph id="adaptive-reasoning" category="cognition" />
            </span>
            <span className="kind">{t("h.abilityKind")}</span>
            <h3>{ADAPTIVE_TEST.name}</h3>
            <p className="tagline">{ADAPTIVE_TEST.tagline}</p>
            <div className="facts">
              <span>🎯 {t("h.adaptiveFact")}</span>
              <span>📝 {t("h.puzzles").replace("{n}", String(ADAPTIVE_TEST.maxItems))}</span>
              <span>📐 {t("h.fluid")}</span>
            </div>
            <p className="cite">{t("h.citeAdaptive")}</p>
            <button className="btn primary" onClick={onStartAdaptive}>{t("home.begin")} {ADAPTIVE_TEST.shortName} →</button>
          </article>
          <article className="card">
            <span className="card-watermark cat-cognition" aria-hidden="true">
              <InstrumentGlyph id="iat-demo" category="cognition" />
            </span>
            <span className="kind">{t("h.rtKind")}</span>
            <h3>{IAT_TEST.name}</h3>
            <p className="tagline">{IAT_TEST.tagline}</p>
            <div className="facts">
              <span>⏱ ~{t("h.minutes").replace("{m}", "5")}</span>
              <span>⌨ {t("h.keyedFact")}</span>
              <span>📐 {t("h.implicit")}</span>
            </div>
            <p className="cite">{t("h.citeIat")}</p>
            <button className="btn primary" onClick={onStartIat}>{t("home.begin")} {IAT_TEST.shortName} →</button>
          </article>
          <article className="card">
            <span className="card-watermark cat-cognition" aria-hidden="true">
              <InstrumentGlyph id="alternative-uses" category="cognition" />
            </span>
            <span className="kind">{t("h.perfKind")}</span>
            <h3>{CREATIVITY_TEST.name}</h3>
            <p className="tagline">{CREATIVITY_TEST.tagline}</p>
            <div className="facts">
              <span>⏱ ~{t("h.minutes").replace("{m}", "3")}</span>
              <span>💡 {t("h.openEnded")}</span>
              <span>📐 {t("h.divergent")}</span>
            </div>
            <p className="cite">{t("h.citeAut")}</p>
            <button className="btn primary" onClick={onStartCreativity}>{t("home.begin")} {CREATIVITY_TEST.shortName} →</button>
          </article>
        </div>
      </Reveal>
      )}

      <Flourish />

      <h2 className="section-title">{t("h.twoTitle")}</h2>
      <div className="panel compat-cta">
        <span className="compat-emblem cat-relationships" aria-hidden="true">
          <CategoryEmblem id="relationships" />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>{t("h.compatTitle")}</h3>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>{t("h.compatBody")}</p>
        </div>
        <button className="btn" onClick={onCompatibility}>{t("h.compatBtn")}</button>
      </div>

      <h2 className="section-title">{t("h.how")}</h2>
      <div className="panel">
        <div className="steps">
          <Step n="01" title={t("h.s1t")}>{t("h.s1b")}</Step>
          <Step n="02" title={t("h.s2t")}>{t("h.s2b")}</Step>
          <Step n="03" title={t("h.s3t")}>{t("h.s3b")}</Step>
          <Step n="04" title={t("h.s4t")}>{t("h.s4b")}</Step>
        </div>
      </div>

      <p className="note" style={{ marginTop: 24 }}>
        <b>{t("h.noteLead")}</b> {t("h.noteBody")}
      </p>

      <div className="footer">
        {t("h.footer1")}
        <br /> {t("h.footer2")}
      </div>
      </div>
      )}
    </div>
  );
}

const HOME_WORKSPACE: Record<Loc, {
  evidenceState: string;
  evidence: string;
  completed: string;
  gettingStarted: string;
  progress: string;
  progressValue: string;
  pathReady: string;
  nextAction: string;
  chooseActivity: string;
  exploreEyebrow: string;
  exploreTitle: string;
  exploreBody: string;
  scrollHint: string;
}> = {
  en: {
    evidenceState: "Journey snapshot",
    evidence: "Evidence",
    completed: "{n} completed reflection activities",
    gettingStarted: "Getting started",
    progress: "Path progress",
    progressValue: "{pct}% complete",
    pathReady: "Ready to shape",
    nextAction: "Next best action",
    chooseActivity: "Choose an activity",
    exploreEyebrow: "Browse by question, not by label",
    exploreTitle: "Explore",
    exploreBody: "Find a reflection or learning activity by topic. Each result shows its evidence and limits, and feeds the same Atlas journey.",
    scrollHint: "On a small screen, swipe the topic row sideways to see more.",
  },
  es: {
    evidenceState: "Resumen del camino",
    evidence: "Evidencia",
    completed: "{n} actividades de reflexión terminadas",
    gettingStarted: "Primeros pasos",
    progress: "Progreso del camino",
    progressValue: "{pct}% completado",
    pathReady: "Listo para adaptar",
    nextAction: "Mejor siguiente paso",
    chooseActivity: "Elige una actividad",
    exploreEyebrow: "Explora por pregunta, no por etiqueta",
    exploreTitle: "Explorar",
    exploreBody: "Encuentra una actividad de reflexión o aprendizaje por tema. Cada resultado muestra su evidencia y sus límites, y alimenta el mismo camino Atlas.",
    scrollHint: "En pantallas pequeñas, desliza la fila de temas hacia un lado para ver más.",
  },
  fr: {
    evidenceState: "Aperçu du parcours",
    evidence: "Indices",
    completed: "{n} activités de réflexion terminées",
    gettingStarted: "Premiers pas",
    progress: "Progression du parcours",
    progressValue: "{pct} % terminé",
    pathReady: "Prêt à être adapté",
    nextAction: "Prochaine action conseillée",
    chooseActivity: "Choisissez une activité",
    exploreEyebrow: "Explorez par question, pas par étiquette",
    exploreTitle: "Explorer",
    exploreBody: "Trouvez une activité de réflexion ou d’apprentissage par thème. Chaque résultat montre ses indices et ses limites, au sein du même parcours Atlas.",
    scrollHint: "Sur petit écran, balayez la rangée de thèmes horizontalement pour en voir plus.",
  },
};

/** Renders **bold** spans inside a translated string. */
function Bold({ text }: { text: string }) {
  const parts = text.split("**");
  return <>{parts.map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>))}</>;
}

const REC_GLYPH: Record<RecKind, string> = {
  foundation: "✦",
  deepen: "↡",
  pairing: "⇄",
  explore: "✲",
  support: "♥",
  triangulate: "⟗",
  portrait: "◈",
};
function recBadgeGlyph(kind: RecKind): string {
  return REC_GLYPH[kind] ?? "✦";
}

const STEP_GLYPH = ["✶", "❖", "◉", "➜"];

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  const i = (parseInt(n, 10) - 1) % STEP_GLYPH.length;
  return (
    <div className="step-card">
      <div className="step-mark" aria-hidden="true">{STEP_GLYPH[i]}</div>
      <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5 }}>{n}</div>
      <h4 style={{ margin: "4px 0 6px", fontSize: 17, fontFamily: "var(--serif)" }}>{title}</h4>
      <p style={{ color: "var(--text-dim)", fontSize: 14, margin: 0 }}>{children}</p>
    </div>
  );
}
