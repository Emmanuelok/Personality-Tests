import { useState } from "react";
import { ADAPTIVE_TEST, genItem, scoreAdaptive, type AdaptiveItem, type AdaptiveTrial, type AdaptiveResult } from "@core/ability/adaptive";
import { InstrumentGlyph } from "../art";
import { Calculating } from "../Calculating";
import { Figure } from "./Figure";

type Phase = "intro" | "quiz" | "calc" | "result";

export function AdaptiveFlow({ name, onExit, onComplete }: { name?: string; onExit: () => void; onComplete?: (r: AdaptiveResult) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [level, setLevel] = useState<number>(ADAPTIVE_TEST.startLevel);
  const [item, setItem] = useState<AdaptiveItem | null>(null);
  const [administered, setAdministered] = useState<AdaptiveTrial[]>([]);
  const [result, setResult] = useState<AdaptiveResult | null>(null);

  const begin = () => {
    setLevel(ADAPTIVE_TEST.startLevel);
    setItem(genItem(ADAPTIVE_TEST.startLevel));
    setAdministered([]);
    setResult(null);
    setPhase("quiz");
  };

  const answer = (oi: number) => {
    if (phase !== "quiz" || !item) return;
    const correct = oi === item.answer;
    const adm = [...administered, { level, correct }];
    setAdministered(adm);
    if (adm.length >= ADAPTIVE_TEST.maxItems) {
      const res = scoreAdaptive(adm);
      setResult(res);
      setPhase("calc");
      onComplete?.(res);
    } else {
      const next = Math.max(ADAPTIVE_TEST.minLevel, Math.min(ADAPTIVE_TEST.maxLevel, correct ? level + 1 : level - 1));
      setLevel(next);
      setItem(genItem(next));
    }
  };

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="container">
        <div className="intro view-enter">
          <span className="intro-emblem cat-cognition" aria-hidden="true"><InstrumentGlyph id="adaptive-reasoning" category="cognition" /></span>
          <p className="eyebrow">Adaptive Reasoning</p>
          <h1>{ADAPTIVE_TEST.name}</h1>
          <p className="lede">{ADAPTIVE_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">How it works</span>
            Each puzzle adjusts to how you're doing — right answers bring harder ones, misses bring easier ones. There's
            no going back, so take each one carefully. About {ADAPTIVE_TEST.maxItems} puzzles.
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={begin}>Begin&nbsp;→</button>
          <p className="meta">{ADAPTIVE_TEST.maxItems} adaptive puzzles · fluid reasoning (Gf)</p>
          <div style={{ marginTop: 22 }}><button className="btn ghost" onClick={onExit}>←&nbsp;All assessments</button></div>
        </div>
      </div>
    );
  }

  if (phase === "calc") return <Calculating onDone={() => setPhase("result")} />;

  /* ── result ── */
  if (phase === "result" && result) {
    return (
      <div className="container view-enter">
        <div className="report-head">
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="adaptive-reasoning" category="cognition" /></span>
          <div className="supertitle">Adaptive Reasoning · Estimated Profile</div>
          <h1>{name ? `${name}, your` : "Your"} reasoning estimate</h1>
          <div className="subtitle">You converged around difficulty {result.abilityLevel} of {ADAPTIVE_TEST.maxLevel} · {result.correct}/{result.total} correct</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">Estimated range</div>
              <div className="iq-range">{result.iqLow}<span>–</span>{result.iqHigh}</div>
              <div className="iq-sub">{result.band} · about the {ordinal(result.percentile)} percentile</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                The test homed in on difficulty <b>level {result.abilityLevel}</b> — the point where you got roughly half
                right — and read your fluid-reasoning estimate from there. Adaptive tests reach this in fewer items than fixed ones.
              </p>
              <p className="note" style={{ margin: 0 }}>An educational estimate, not a clinical IQ.</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>Your difficulty path</h3>
            <p>Each step shows the puzzle's difficulty level and whether you got it right — watch it settle toward your level.</p>
            <div className="adapt-path">
              {result.trials.map((t, i) => (
                <span key={i} className={`adapt-dot ${t.correct ? "ok" : "no"}`} style={{ height: 8 + t.level * 6 }} title={`Level ${t.level} · ${t.correct ? "correct" : "missed"}`} />
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
            <ul className="caveats">{ADAPTIVE_TEST.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <div className="row-actions no-print">
            <button className="btn" onClick={begin}>↻ Try again</button>
            <button className="btn ghost" onClick={onExit}>↩ All assessments</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── quiz ── */
  if (!item) return null;
  return (
    <div className="container">
      <div className="quiz-wrap" style={{ textAlign: "center" }}>
        <div className="quiz-meta">
          <span>Adaptive</span>
          <span>Puzzle {administered.length + 1} of {ADAPTIVE_TEST.maxItems}</span>
        </div>
        <div className="progress"><i style={{ width: `${((administered.length + 1) / ADAPTIVE_TEST.maxItems) * 100}%` }} /></div>
        <div className="qcard" key={administered.length}>
          <div className="qnum">{item.prompt}</div>
          <div className="ab-stem"><Figure svg={item.figure} /></div>
          <div className="ab-figgrid six">
            {item.optionFigures.map((fig, oi) => (
              <button key={oi} className="ab-figopt" onClick={() => answer(oi)}>
                <Figure svg={fig} />
                <span className="ab-figlabel">{item.options[oi]}</span>
              </button>
            ))}
          </div>
          <p className="hint">Pick the figure that completes the pattern. The next puzzle adapts to your answer.</p>
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
