import { useEffect, useState } from "react";
import { MEMORY_TEST, makeDigits, scoreMemory, type MemoryTrial, type MemoryResult, type SpanMode } from "@core/ability/memory";
import { localizeAbilityMeta } from "@core/ability/i18n";
import { InstrumentGlyph } from "../art";
import { CognitionGrowth } from "./CognitionGrowth";
import { useI18n } from "../../i18n";

const reverse = (s: string) => s.split("").reverse().join("");

const TRIALS: { mode: SpanMode; span: number }[] = [
  ...MEMORY_TEST.forward.map((span) => ({ mode: "forward" as const, span })),
  ...MEMORY_TEST.backward.map((span) => ({ mode: "backward" as const, span })),
];

type Phase = "intro" | "show" | "recall" | "result";

export function MemoryFlow({ name, onExit, onComplete, unlocked, onPurchase, busy, initialResult }: { name?: string; onExit: () => void; onComplete?: (r: MemoryResult) => void; unlocked?: boolean; onPurchase?: () => void; busy?: boolean; initialResult?: MemoryResult }) {
  const [phase, setPhase] = useState<Phase>(initialResult ? "result" : "intro");
  const [trialIdx, setTrialIdx] = useState(0);
  const [shown, setShown] = useState("");
  const [entered, setEntered] = useState("");
  const [results, setResults] = useState<MemoryTrial[]>([]);
  const [result, setResult] = useState<MemoryResult | null>(initialResult ?? null);
  const i18 = useI18n();
  const meta = localizeAbilityMeta("memory-span", i18.locale);
  const poss = name ? i18.t("cog.possNamed").replace("{name}", name) : i18.t("cog.poss");

  const beginTrial = (idx: number) => {
    setTrialIdx(idx);
    setShown(makeDigits(TRIALS[idx].span));
    setEntered("");
    setPhase("show");
  };

  // Hide the string after its exposure window.
  useEffect(() => {
    if (phase !== "show") return;
    const id = setTimeout(() => setPhase("recall"), TRIALS[trialIdx].span * MEMORY_TEST.msPerDigit);
    return () => clearTimeout(id);
  }, [phase, trialIdx]);

  const submit = () => {
    const t = TRIALS[trialIdx];
    const expected = t.mode === "backward" ? reverse(shown) : shown;
    const rec: MemoryTrial = { mode: t.mode, span: t.span, shown, entered: entered.trim(), correct: entered.trim() === expected };
    const all = [...results, rec];
    setResults(all);
    if (trialIdx + 1 < TRIALS.length) beginTrial(trialIdx + 1);
    else { const res = scoreMemory(all); setResult(res); setPhase("result"); onComplete?.(res); }
  };

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="container">
        <div className="intro view-enter">
          <span className="intro-emblem cat-cognition" aria-hidden="true"><InstrumentGlyph id="memory-span" category="cognition" /></span>
          <p className="eyebrow">{i18.t("cog.mem.eyebrow")}</p>
          <h1>{meta.name ?? MEMORY_TEST.name}</h1>
          <p className="lede">{meta.description ?? MEMORY_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">{i18.t("cog.how")}</span>
            {i18.t("cog.mem.how")}
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => beginTrial(0)}>{i18.t("cog.begin")}</button>
          <p className="meta">{i18.t("cog.mem.meta").replace("{n}", String(TRIALS.length))}</p>
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
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="memory-span" category="cognition" /></span>
          <div className="supertitle">{i18.t("cog.mem.super")}</div>
          <h1>{poss} {i18.t("cog.mem.title")}</h1>
          <div className="subtitle">{i18.t("cog.mem.sub").replace("{f}", String(result.maxForward)).replace("{b}", String(result.maxBackward))}</div>
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
                {i18.t("cog.mem.narr").replace("{f}", String(result.maxForward)).replace("{b}", String(result.maxBackward))}
              </p>
              <p className="note" style={{ margin: 0 }}>{i18.t("cog.mem.note")}</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>{i18.t("cog.roundByRound")}</h3>
            <div className="mem-review">
              {result.trials.map((t, i) => (
                <div className={`mem-row ${t.correct ? "ok" : "no"}`} key={i}>
                  <span className="qr-badge" style={{ background: t.correct ? "var(--good)" : "var(--danger)" }}>{t.correct ? "✓" : "✗"}</span>
                  <span className="mem-mode">{t.mode === "backward" ? i18.t("cog.reverse") : i18.t("cog.forward")} · {t.span}</span>
                  <span className="mem-seq">{i18.t("cog.shown")} <code>{t.shown}</code> · {i18.t("cog.you")} <code>{t.entered || "—"}</code></span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>{i18.t("cog.readHonestly")}</h3>
            <ul className="caveats">{(meta.caveats ?? MEMORY_TEST.caveats).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <CognitionGrowth testId="memory-span" unlocked={!!unlocked} onPurchase={onPurchase ?? (() => {})} busy={busy} />

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
  const modeLabel = t.mode === "backward" ? i18.t("cog.mem.typeBwd") : i18.t("cog.mem.typeFwd");
  return (
    <div className="container">
      <div className="quiz-wrap">
        <div className="quiz-meta">
          <span>{t.mode === "backward" ? i18.t("cog.mem.bwdSpan") : i18.t("cog.mem.fwdSpan")}</span>
          <span>{i18.t("cog.round").replace("{i}", String(trialIdx + 1)).replace("{n}", String(TRIALS.length))}</span>
        </div>
        <div className="progress"><i style={{ width: `${((trialIdx + 1) / TRIALS.length) * 100}%` }} /></div>

        {phase === "show" ? (
          <div className="qcard">
            <div className="qnum">{i18.t("cog.mem.memorize")}</div>
            <div className="mem-digits" aria-label="digits to memorize">{shown}</div>
            <p className="hint">{t.mode === "backward" ? i18.t("cog.mem.holdBwd") : i18.t("cog.mem.holdFwd")}</p>
          </div>
        ) : (
          <div className="qcard">
            <div className="qnum">{modeLabel}</div>
            <input
              className="mem-input"
              inputMode="numeric"
              autoFocus
              value={entered}
              onChange={(e) => setEntered(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="••••"
              aria-label="your answer"
            />
            <div className="quiz-actions" style={{ justifyContent: "center" }}>
              <button className="btn" onClick={submit}>{i18.t("cog.mem.submit")}</button>
            </div>
            <p className="hint">{i18.t("cog.mem.recallHint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
