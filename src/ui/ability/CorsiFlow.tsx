import { useEffect, useRef, useState } from "react";
import { CORSI_TEST, makeSequence, scoreCorsi, type MemoryTrial, type MemoryResult, type SpanMode } from "@core/ability/memory";
import { localizeAbilityMeta } from "@core/ability/i18n";
import { InstrumentGlyph } from "../art";
import { CognitionGrowth } from "./CognitionGrowth";
import { useI18n } from "../../i18n";

const TRIALS: { mode: SpanMode; span: number }[] = [
  ...CORSI_TEST.forward.map((span) => ({ mode: "forward" as const, span })),
  ...CORSI_TEST.backward.map((span) => ({ mode: "backward" as const, span })),
];

const pretty = (s: string) => (s ? s.split("-").map((n) => +n + 1).join("·") : "—");

type Phase = "intro" | "show" | "recall" | "result";

export function CorsiFlow({ name, onExit, onComplete, unlocked, onPurchase, busy, initialResult }: { name?: string; onExit: () => void; onComplete?: (r: MemoryResult) => void; unlocked?: boolean; onPurchase?: () => void; busy?: boolean; initialResult?: MemoryResult }) {
  const [phase, setPhase] = useState<Phase>(initialResult ? "result" : "intro");
  const [trialIdx, setTrialIdx] = useState(0);
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [clicks, setClicks] = useState<number[]>([]);
  const [results, setResults] = useState<MemoryTrial[]>([]);
  const [result, setResult] = useState<MemoryResult | null>(initialResult ?? null);
  const timers = useRef<number[]>([]);
  const i18 = useI18n();
  const meta = localizeAbilityMeta("corsi-blocks", i18.locale);
  const poss = name ? i18.t("cog.possNamed").replace("{name}", name) : i18.t("cog.poss");

  const clearTimers = () => { timers.current.forEach((t) => clearTimeout(t)); timers.current = []; };

  const beginTrial = (idx: number) => {
    setTrialIdx(idx);
    setSeq(makeSequence(TRIALS[idx].span, CORSI_TEST.blocks.length));
    setClicks([]);
    setLit(null);
    setPhase("show");
  };

  // Flash the sequence during the "show" phase.
  useEffect(() => {
    if (phase !== "show" || seq.length === 0) return;
    clearTimers();
    const step = CORSI_TEST.litMs + CORSI_TEST.gapMs;
    seq.forEach((b, k) => {
      timers.current.push(window.setTimeout(() => setLit(b), k * step + 300));
      timers.current.push(window.setTimeout(() => setLit(null), k * step + 300 + CORSI_TEST.litMs));
    });
    timers.current.push(window.setTimeout(() => setPhase("recall"), seq.length * step + 400));
    return clearTimers;
  }, [phase, trialIdx, seq]);

  const finishTrial = (nc: number[]) => {
    const t = TRIALS[trialIdx];
    const expected = t.mode === "backward" ? [...seq].reverse() : seq;
    const correct = nc.length === expected.length && nc.every((v, i) => v === expected[i]);
    const rec: MemoryTrial = { mode: t.mode, span: t.span, shown: seq.join("-"), entered: nc.join("-"), correct };
    const all = [...results, rec];
    setResults(all);
    if (trialIdx + 1 < TRIALS.length) beginTrial(trialIdx + 1);
    else { const res = scoreCorsi(all); setResult(res); setPhase("result"); onComplete?.(res); }
  };

  const tap = (b: number) => {
    if (phase !== "recall") return;
    setLit(b);
    timers.current.push(window.setTimeout(() => setLit(null), 170));
    const nc = [...clicks, b];
    setClicks(nc);
    if (nc.length >= seq.length) finishTrial(nc);
  };

  const Board = ({ active }: { active: boolean }) => (
    <div className="corsi-board" style={{ pointerEvents: active ? "auto" : "none" }}>
      {CORSI_TEST.blocks.map((b, i) => (
        <button
          key={i}
          className={`corsi-block ${lit === i ? "lit" : ""}`}
          style={{ left: b.x - 26, top: b.y - 26 }}
          onClick={() => tap(i)}
          aria-label={`block ${i + 1}`}
        />
      ))}
    </div>
  );

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="container">
        <div className="intro view-enter">
          <span className="intro-emblem cat-cognition" aria-hidden="true"><InstrumentGlyph id="corsi-blocks" category="cognition" /></span>
          <p className="eyebrow">{i18.t("cog.corsi.eyebrow")}</p>
          <h1>{meta.name ?? CORSI_TEST.name}</h1>
          <p className="lede">{meta.description ?? CORSI_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">{i18.t("cog.how")}</span>
            {i18.t("cog.corsi.how")}
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => beginTrial(0)}>{i18.t("cog.begin")}</button>
          <p className="meta">{i18.t("cog.corsi.meta").replace("{n}", String(TRIALS.length))}</p>
          <div style={{ marginTop: 22 }}><button className="btn ghost" onClick={onExit}>←&nbsp;{i18.t("common.allAssessments")}</button></div>
        </div>
      </div>
    );
  }

  /* ── result ── */
  if (phase === "result" && result) {
    return (
      <div className="container view-enter">
        <div className="report-head">
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="corsi-blocks" category="cognition" /></span>
          <div className="supertitle">{i18.t("cog.corsi.super")}</div>
          <h1>{poss} {i18.t("cog.corsi.title")}</h1>
          <div className="subtitle">{i18.t("cog.corsi.sub").replace("{f}", String(result.maxForward)).replace("{b}", String(result.maxBackward))}</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">{i18.t("cog.estimated")}</div>
              <div className="iq-range" style={{ fontSize: "clamp(2.4rem,7vw,3.4rem)" }}>{result.practiceIndex}<span>/100</span></div>
              <div className="iq-sub">{result.observation}</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                {i18.t("cog.corsi.narr").replace("{f}", String(result.maxForward)).replace("{b}", String(result.maxBackward))}
              </p>
              <p className="note" style={{ margin: 0 }}>{i18.t("cog.corsi.note")}</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>{i18.t("cog.roundByRound")}</h3>
            <div className="mem-review">
              {result.trials.map((t, i) => (
                <div className="mem-row" key={i}>
                  <span className="qr-badge" style={{ background: t.correct ? "var(--good)" : "var(--danger)" }}>{t.correct ? "✓" : "✗"}</span>
                  <span className="mem-mode">{t.mode === "backward" ? i18.t("cog.reverse") : i18.t("cog.forward")} · {t.span}</span>
                  <span className="mem-seq">{i18.t("cog.corsi.path")} <code>{pretty(t.shown)}</code> · {i18.t("cog.you")} <code>{pretty(t.entered)}</code></span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>{i18.t("cog.readHonestly")}</h3>
            <ul className="caveats">{(meta.caveats ?? CORSI_TEST.caveats).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <CognitionGrowth testId="corsi-blocks" unlocked={!!unlocked} onPurchase={onPurchase ?? (() => {})} busy={busy} />

          <div className="row-actions no-print">
            <button className="btn" onClick={() => { setResults([]); setResult(null); beginTrial(0); }}>↻ {i18.t("cog.tryAgain")}</button>
            <button className="btn ghost" onClick={onExit}>↩ {i18.t("common.allAssessments")}</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── show / recall ── */
  const t = TRIALS[trialIdx];
  return (
    <div className="container">
      <div className="quiz-wrap" style={{ textAlign: "center" }}>
        <div className="quiz-meta">
          <span>{t.mode === "backward" ? i18.t("cog.corsi.revOrder") : i18.t("cog.corsi.fwdOrder")}</span>
          <span>{i18.t("cog.round").replace("{i}", String(trialIdx + 1)).replace("{n}", String(TRIALS.length))}</span>
        </div>
        <div className="progress"><i style={{ width: `${((trialIdx + 1) / TRIALS.length) * 100}%` }} /></div>
        <div className="qcard">
          <div className="qnum">
            {phase === "show" ? i18.t("cog.corsi.watch") : t.mode === "backward" ? i18.t("cog.corsi.tapRev") : i18.t("cog.corsi.tapFwd")}
          </div>
          <Board active={phase === "recall"} />
          <p className="hint">
            {phase === "show"
              ? i18.t("cog.corsi.memHint")
              : i18.t("cog.corsi.tapped").replace("{a}", String(clicks.length)).replace("{n}", String(seq.length))}
          </p>
        </div>
      </div>
    </div>
  );
}
