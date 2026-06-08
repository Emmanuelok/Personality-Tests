import { useEffect, useRef, useState } from "react";
import { CORSI_TEST, makeSequence, scoreCorsi, type MemoryTrial, type MemoryResult, type SpanMode } from "@core/ability/memory";
import { InstrumentGlyph } from "../art";

const TRIALS: { mode: SpanMode; span: number }[] = [
  ...CORSI_TEST.forward.map((span) => ({ mode: "forward" as const, span })),
  ...CORSI_TEST.backward.map((span) => ({ mode: "backward" as const, span })),
];

const pretty = (s: string) => (s ? s.split("-").map((n) => +n + 1).join("·") : "—");

type Phase = "intro" | "show" | "recall" | "result";

export function CorsiFlow({ name, onExit, onComplete }: { name?: string; onExit: () => void; onComplete?: (r: MemoryResult) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [trialIdx, setTrialIdx] = useState(0);
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [clicks, setClicks] = useState<number[]>([]);
  const [results, setResults] = useState<MemoryTrial[]>([]);
  const [result, setResult] = useState<MemoryResult | null>(null);
  const timers = useRef<number[]>([]);

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
          <p className="eyebrow">Spatial Memory</p>
          <h1>{CORSI_TEST.name}</h1>
          <p className="lede">{CORSI_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">How it works</span>
            Watch the blocks light up one by one, then tap them in the <b>same order</b>. Later rounds ask for the
            <b> reverse</b> order. The path gets longer each round — just do your best.
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => beginTrial(0)}>Begin&nbsp;→</button>
          <p className="meta">{TRIALS.length} rounds · about 4 min · forward &amp; backward</p>
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
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="corsi-blocks" category="cognition" /></span>
          <div className="supertitle">Spatial Memory · Estimated Profile</div>
          <h1>{name ? `${name}, your` : "Your"} spatial span</h1>
          <div className="subtitle">Forward {result.maxForward} blocks · Backward {result.maxBackward} blocks</div>
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
                You reproduced paths of up to <b>{result.maxForward} blocks</b> forward and <b>{result.maxBackward}</b> in reverse.
                Spatial span is a distinct skill from digit span — many people are notably stronger at one than the other.
              </p>
              <p className="note" style={{ margin: 0 }}>An educational estimate, not a clinical memory assessment.</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>Round by round</h3>
            <div className="mem-review">
              {result.trials.map((t, i) => (
                <div className="mem-row" key={i}>
                  <span className="qr-badge" style={{ background: t.correct ? "var(--good)" : "var(--danger)" }}>{t.correct ? "✓" : "✗"}</span>
                  <span className="mem-mode">{t.mode === "backward" ? "Reverse" : "Forward"} · {t.span}</span>
                  <span className="mem-seq">path <code>{pretty(t.shown)}</code> · you <code>{pretty(t.entered)}</code></span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
            <ul className="caveats">{CORSI_TEST.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
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
  return (
    <div className="container">
      <div className="quiz-wrap" style={{ textAlign: "center" }}>
        <div className="quiz-meta">
          <span>{t.mode === "backward" ? "Reverse order" : "Forward order"}</span>
          <span>Round {trialIdx + 1} of {TRIALS.length}</span>
        </div>
        <div className="progress"><i style={{ width: `${((trialIdx + 1) / TRIALS.length) * 100}%` }} /></div>
        <div className="qcard">
          <div className="qnum">
            {phase === "show" ? "Watch the path…" : t.mode === "backward" ? "Tap them in REVERSE order" : "Tap them in order"}
          </div>
          <Board active={phase === "recall"} />
          <p className="hint">
            {phase === "show"
              ? "Memorize the order the blocks light up."
              : `Tapped ${clicks.length} of ${seq.length}.`}
          </p>
        </div>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const v = n % 100;
  const s = ["th", "st", "nd", "rd"];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
