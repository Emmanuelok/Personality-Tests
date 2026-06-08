import { useEffect, useRef, useState } from "react";
import { PROCESSING_TEST, makeSpeedTrial, scoreProcessing, type SpeedResult } from "@core/ability/processing";
import { InstrumentGlyph } from "../art";

type Phase = "intro" | "run" | "result";
type Trial = ReturnType<typeof makeSpeedTrial>;

export function SpeedFlow({ name, onExit, onComplete }: { name?: string; onExit: () => void; onComplete?: (r: SpeedResult) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [timeLeft, setTimeLeft] = useState<number>(PROCESSING_TEST.durationSec);
  const [trial, setTrial] = useState<Trial>(makeSpeedTrial());
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const flashT = useRef<number | null>(null);

  const start = () => {
    setCorrect(0); setErrors(0); setAttempted(0);
    setTimeLeft(PROCESSING_TEST.durationSec);
    setTrial(makeSpeedTrial());
    setResult(null);
    setPhase("run");
  };

  // Countdown.
  useEffect(() => {
    if (phase !== "run") return;
    const iv = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // Finish when time is up.
  useEffect(() => {
    if (phase === "run" && timeLeft <= 0) {
      const res = scoreProcessing(correct, errors, attempted, PROCESSING_TEST.durationSec);
      setResult(res);
      setPhase("result");
      onComplete?.(res);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const answer = (yes: boolean) => {
    if (phase !== "run" || timeLeft <= 0) return;
    const ok = yes === trial.present;
    if (ok) setCorrect((c) => c + 1); else setErrors((e) => e + 1);
    setAttempted((a) => a + 1);
    setFlash(ok ? "ok" : "no");
    if (flashT.current) clearTimeout(flashT.current);
    flashT.current = window.setTimeout(() => setFlash(null), 140);
    setTrial(makeSpeedTrial());
  };

  // Keyboard: arrows / Y-N.
  useEffect(() => {
    if (phase !== "run") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "y") answer(true);
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "n") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trial, timeLeft]);

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="container">
        <div className="intro view-enter">
          <span className="intro-emblem cat-cognition" aria-hidden="true"><InstrumentGlyph id="processing-speed" category="cognition" /></span>
          <p className="eyebrow">Processing Speed</p>
          <h1>{PROCESSING_TEST.name}</h1>
          <p className="lede">{PROCESSING_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">How it works</span>
            You'll see a couple of <b>target symbols</b> and a small set to search. Hit <b>Present</b> if any target is in
            the set, <b>Not present</b> if not — as fast as you can without guessing. {PROCESSING_TEST.durationSec} seconds on the clock.
            (Keyboard: → / Y for present, ← / N for not.)
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={start}>Start the clock&nbsp;→</button>
          <p className="meta">{PROCESSING_TEST.durationSec}-second timed task · accuracy counts</p>
          <div style={{ marginTop: 22 }}><button className="btn ghost" onClick={onExit}>←&nbsp;All assessments</button></div>
        </div>
      </div>
    );
  }

  /* ── result ── */
  if (phase === "result" && result) {
    const acc = result.attempted ? Math.round((result.correct / result.attempted) * 100) : 0;
    return (
      <div className="container view-enter">
        <div className="report-head">
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="processing-speed" category="cognition" /></span>
          <div className="supertitle">Processing Speed · Estimated Profile</div>
          <h1>{name ? `${name}, your` : "Your"} processing speed</h1>
          <div className="subtitle">{result.correct} correct · {result.errors} errors · {acc}% accuracy</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">Estimated</div>
              <div className="iq-range" style={{ fontSize: "clamp(2.4rem,7vw,3.4rem)" }}>{result.rate}<span>/min</span></div>
              <div className="iq-sub">{result.band} · about the {ordinal(result.percentile)} percentile</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                You made <b>{result.correct}</b> correct decisions ({acc}% accuracy) in {result.durationSec} seconds — a net
                rate of about <b>{result.rate} per minute</b>. Speed and accuracy trade off; the score rewards both.
              </p>
              <p className="note" style={{ margin: 0 }}>An educational estimate, not a clinical assessment.</p>
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
            <ul className="caveats">{PROCESSING_TEST.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <div className="row-actions no-print">
            <button className="btn" onClick={start}>↻ Try again</button>
            <button className="btn ghost" onClick={onExit}>↩ All assessments</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── run ── */
  const mm = Math.floor(Math.max(0, timeLeft) / 60);
  const ss = (Math.max(0, timeLeft) % 60).toString().padStart(2, "0");
  return (
    <div className="container">
      <div className="quiz-wrap" style={{ textAlign: "center" }}>
        <div className="quiz-meta">
          <span className={`ab-timer ${timeLeft <= 15 ? "low" : ""}`}>⏱ {mm}:{ss}</span>
          <span>{correct} correct</span>
        </div>
        <div className="progress"><i style={{ width: `${(timeLeft / PROCESSING_TEST.durationSec) * 100}%` }} /></div>

        <div className={`qcard speed-card ${flash ?? ""}`}>
          <div className="qnum">Is either target in the set?</div>
          <div className="speed-key">
            <span className="speed-label">Targets</span>
            <div className="speed-syms">{trial.targets.map((s, i) => <span key={i} className="speed-sym tgt">{s}</span>)}</div>
          </div>
          <div className="speed-search">
            <span className="speed-label">Set</span>
            <div className="speed-syms">{trial.search.map((s, i) => <span key={i} className="speed-sym">{s}</span>)}</div>
          </div>
          <div className="speed-actions">
            <button className="btn ghost" onClick={() => answer(false)}>✗ Not present</button>
            <button className="btn" onClick={() => answer(true)}>✓ Present</button>
          </div>
          <p className="hint">→ / Y for present · ← / N for not present</p>
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
