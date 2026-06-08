import { useEffect, useState } from "react";
import { MEMORY_TEST, makeDigits, scoreMemory, type MemoryTrial, type MemoryResult, type SpanMode } from "@core/ability/memory";
import { InstrumentGlyph } from "../art";

const reverse = (s: string) => s.split("").reverse().join("");

const TRIALS: { mode: SpanMode; span: number }[] = [
  ...MEMORY_TEST.forward.map((span) => ({ mode: "forward" as const, span })),
  ...MEMORY_TEST.backward.map((span) => ({ mode: "backward" as const, span })),
];

type Phase = "intro" | "show" | "recall" | "result";

export function MemoryFlow({ name, onExit, onComplete }: { name?: string; onExit: () => void; onComplete?: (r: MemoryResult) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [trialIdx, setTrialIdx] = useState(0);
  const [shown, setShown] = useState("");
  const [entered, setEntered] = useState("");
  const [results, setResults] = useState<MemoryTrial[]>([]);
  const [result, setResult] = useState<MemoryResult | null>(null);

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
          <p className="eyebrow">Working Memory</p>
          <h1>{MEMORY_TEST.name}</h1>
          <p className="lede">{MEMORY_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">How it works</span>
            A line of digits appears, then vanishes. Type it back — <b>in order</b> for the first block, then <b>in
            reverse</b> for the second. It gets longer each round. Please don't write anything down.
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => beginTrial(0)}>Begin&nbsp;→</button>
          <p className="meta">{TRIALS.length} rounds · about 4 min · forward &amp; backward span</p>
          <div style={{ marginTop: 22 }}><button className="btn ghost" onClick={onExit}>←&nbsp;All assessments</button></div>
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
          <div className="supertitle">Working Memory Span · Estimated Profile</div>
          <h1>{name ? `${name}, your` : "Your"} memory span</h1>
          <div className="subtitle">Forward {result.maxForward} digits · Backward {result.maxBackward} digits</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">Estimated</div>
              <div className="iq-range" style={{ fontSize: "clamp(2.4rem,7vw,3.4rem)" }}>{result.maxForward}<span>/</span>{result.maxBackward}</div>
              <div className="iq-sub">{result.band} · about the {ordinal(result.percentile)} percentile</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                You reliably held <b>{result.maxForward} digits</b> in order and <b>{result.maxBackward}</b> in reverse.
                Backward span is harder because you must hold <i>and</i> manipulate — most people reach about 5 forward, 4 backward.
              </p>
              <p className="note" style={{ margin: 0 }}>An educational estimate, not a clinical memory assessment.</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>Round by round</h3>
            <div className="mem-review">
              {result.trials.map((t, i) => (
                <div className={`mem-row ${t.correct ? "ok" : "no"}`} key={i}>
                  <span className="qr-badge" style={{ background: t.correct ? "var(--good)" : "var(--danger)" }}>{t.correct ? "✓" : "✗"}</span>
                  <span className="mem-mode">{t.mode === "backward" ? "Reverse" : "Forward"} · {t.span}</span>
                  <span className="mem-seq">shown <code>{t.shown}</code> · you <code>{t.entered || "—"}</code></span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
            <ul className="caveats">{MEMORY_TEST.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <div className="row-actions no-print">
            <button className="btn" onClick={() => { setResults([]); setResult(null); beginTrial(0); }}>↻ Try again</button>
            <button className="btn ghost" onClick={onExit}>↩ All assessments</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── show / recall ── */
  const t = TRIALS[trialIdx];
  const modeLabel = t.mode === "backward" ? "Type them in REVERSE order" : "Type them in the order shown";
  return (
    <div className="container">
      <div className="quiz-wrap">
        <div className="quiz-meta">
          <span>{t.mode === "backward" ? "Backward span" : "Forward span"}</span>
          <span>Round {trialIdx + 1} of {TRIALS.length}</span>
        </div>
        <div className="progress"><i style={{ width: `${((trialIdx + 1) / TRIALS.length) * 100}%` }} /></div>

        {phase === "show" ? (
          <div className="qcard">
            <div className="qnum">Memorize…</div>
            <div className="mem-digits" aria-label="digits to memorize">{shown}</div>
            <p className="hint">{t.mode === "backward" ? "You'll type these in reverse." : "Hold them in mind."}</p>
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
              <button className="btn" onClick={submit}>Submit&nbsp;→</button>
            </div>
            <p className="hint">Enter what you remember, then submit. Blank is fine if you've lost it.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const v = n % 100;
  const s = ["th", "st", "nd", "rd"];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
