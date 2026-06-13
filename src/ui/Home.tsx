import { type ReactNode, useMemo, useState } from "react";
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
import { recommendNext, profileSpotlight, type RecKind } from "@core/recommend";
import { dailyNudge } from "@core/daily";
import { buildRoadmap } from "@core/roadmap";
import { computeMilestones } from "@core/milestones";
import type { SynthEntry } from "@core/synthesis";
import { GOALS, labelsFor, keysFromFocus, toLoc } from "./goals";
import { HeroArt, HeroBackdrop, CategoryEmblem, InstrumentGlyph, Flourish } from "./art";
import { Gauge } from "./charts";
import { useI18n } from "../i18n";

export function Home({
  entries = [],
  name,
  focus = [],
  streakDays = 0,
  cognitiveCount = 0,
  onUpdateGoals,
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
}: {
  entries?: SynthEntry[];
  name?: string;
  focus?: string[];
  streakDays?: number;
  cognitiveCount?: number;
  onUpdateGoals?: (focus: string[]) => void;
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
}) {
  const { locale, t } = useI18n();
  const spotlight = useMemo(() => profileSpotlight(entries, { locale }), [entries, locale]);
  const recs = useMemo(() => recommendNext(entries, { locale, limit: 3 }), [entries, locale]);
  const nudge = useMemo(() => dailyNudge(entries, { locale }), [entries, locale]);
  const roadmap = useMemo(() => buildRoadmap(entries, focus, { locale }), [entries, focus, locale]);
  const milestones = useMemo(() => computeMilestones(entries, { streakDays, cognitiveCount, locale }), [entries, streakDays, cognitiveCount, locale]);
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

  return (
    <div className="container">
      <HeroBackdrop />
      <section className="hero">
        <div className="hero-art-wrap" aria-hidden="true">
          <HeroArt />
        </div>
        <span className="eyebrow">{t("h.eyebrow")}</span>
        <h1>
          {t("h.h1a")} <span className="grad">{t("h.h1grad")}</span>.
          <br /> {t("h.h1b")}
        </h1>
        <p className="lead">
          {t("h.lead1").replace("{n}", String(INSTRUMENTS.length))}<b>{t("h.leadU")}</b>{t("h.lead2")}
        </p>
        <div className="pillars">
          {(["h.pill1", "h.pill2", "h.pill3", "h.pill4"] as const).map((k) => (
            <span className="pill" key={k}><Bold text={t(k)} /></span>
          ))}
        </div>
        <div className="row-actions" style={{ marginTop: 26 }}>
          <button className="btn" onClick={onStartPack}>✨&nbsp;{t("h.startPack")}&nbsp;→</button>
          <button className="btn ghost" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>{t("h.browseAll").replace("{n}", String(INSTRUMENTS.length))}</button>
        </div>
        <p style={{ color: "var(--text-faint)", marginTop: 20, fontSize: 14, fontStyle: "italic" }}>
          {t("h.themesLine").replace("{n}", String(INSTRUMENTS.length)).replace("{c}", String(CATEGORIES.filter((c) => instrumentsByCategory(c.id).length).length))}
        </p>
      </section>

      {(spotlight || focus.length > 0) && (
        <section className="foryou view-enter" aria-label={t("home.forYou")}>
          <div className="foryou-aura" aria-hidden="true" />
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
                      <button key={g.key} className={`chip-toggle ${goalSel.includes(g.key) ? "on" : ""}`} onClick={() => toggleGoal(g.key)}>
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
            </div>
          )}
          {nudge && (
            <div className="panel insight-card foryou-today">
              <span className="eyebrow2">{nudge.eyebrow}</span>
              <h3>{nudge.title}</h3>
              <p style={{ color: "var(--text-dim)", margin: 0 }}>{nudge.line}</p>
              <div className="practice">
                <b>{nudge.practiceLabel}:</b> {nudge.practice}
              </div>
            </div>
          )}
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
            <div className="foryou-foot">
              <button className="btn ghost" onClick={onIntegrated}>{t("home.seeIntegrated")}</button>
            </div>
          )}
        </section>
      )}

      <Flourish />

      <h2 className="section-title" id="catalog">{t("h.choose")}</h2>
      {CATEGORIES.map((cat) => {
        const list = instrumentsByCategory(cat.id);
        if (!list.length) return null;
        const lc = localizeCategory(cat, locale);
        return (
          <div className="cat-block" key={cat.id}>
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
              {list.map((inst) => {
                const li = localizeInstrument(inst, locale);
                return (
                <article className="card" key={inst.id}>
                  <span className={`card-watermark cat-${cat.id}`} aria-hidden="true">
                    <InstrumentGlyph id={inst.id} category={cat.id} />
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
              })}
            </div>
          </div>
        );
      })}

      <div className="cat-block">
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
      </div>

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
  );
}

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
