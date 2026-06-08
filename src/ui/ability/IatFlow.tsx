import { useEffect, useRef, useState } from "react";
import { IAT_TEST, IAT_BLOCKS, makeIatStimulus, scoreIat, type IatStimulus, type IatTrial, type IatResult, type IatSide } from "@core/ability/iat";
import { InstrumentGlyph } from "../art";

type Phase = "intro" | "blockIntro" | "trial" | "result";
const catLabel = (k: string) => (IAT_TEST.categories as Record<string, { label: string }>)[k].label;
const isAttr = (s: IatStimulus) => s.cat === "pleasant" || s.cat === "unpleasant";

export function IatFlow({ name, onExit, onComplete }: { name?: string; onExit: () => void; onComplete?: (r: IatResult) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [bi, setBi] = useState(0);
  const [ti, setTi] = useState(0);
  const [stim, setStim] = useState<IatStimulus | null>(null);
  const [erred, setErred] = useState(false);
  const [trials, setTrials] = useState<IatTrial[]>([]);
  const [result, setResult] = useState<IatResult | null>(null);
  const onset = useRef(0);
  const erredRef = useRef(false);

  const block = IAT_BLOCKS[bi];

  const newStimulus = () => { setStim(makeIatStimulus(IAT_BLOCKS[bi])); setErred(false); erredRef.current = false; onset.current = performance.now(); };

  const startBlock = () => { setTi(0); newStimulus(); setPhase("trial"); };

  const respond = (side: IatSide) => {
    if (phase !== "trial" || !stim) return;
    if (side !== stim.correct) { setErred(true); erredRef.current = true; return; }
    const rt = performance.now() - onset.current;
    const rec: IatTrial = { block: block.n, rt, firstCorrect: !erredRef.current };
    const all = [...trials, rec];
    setTrials(all);
    if (ti + 1 < block.count) { setTi(ti + 1); newStimulus(); }
    else if (bi + 1 < IAT_BLOCKS.length) { setBi(bi + 1); setPhase("blockIntro"); }
    else { const res = scoreIat(all); setResult(res); setPhase("result"); onComplete?.(res); }
  };

  // Keyboard: E = left, I = right.
  useEffect(() => {
    if (phase !== "trial") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "e" || k === "arrowleft") respond("left");
      else if (k === "i" || k === "arrowright") respond("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stim, ti, bi, trials]);

  const Sides = () => (
    <div className="iat-sides">
      <div className="iat-side l">
        <span className="iat-key">E</span>
        {block.left.map((c, i) => <div key={c}><span className={isAttrKey(c) ? "attr" : ""}>{catLabel(c)}</span>{i < block.left.length - 1 ? <div className="iat-or">or</div> : null}</div>)}
      </div>
      <div className="iat-side r">
        <span className="iat-key">I</span>
        {block.right.map((c, i) => <div key={c}><span className={isAttrKey(c) ? "attr" : ""}>{catLabel(c)}</span>{i < block.right.length - 1 ? <div className="iat-or">or</div> : null}</div>)}
      </div>
    </div>
  );

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="container">
        <div className="intro view-enter">
          <span className="intro-emblem cat-cognition" aria-hidden="true"><InstrumentGlyph id="iat-demo" category="cognition" /></span>
          <p className="eyebrow">Implicit Associations</p>
          <h1>{IAT_TEST.name}</h1>
          <p className="lede">{IAT_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">How it works</span>
            Words flash in the middle; sort each to the <b>left (key E)</b> or <b>right (key I)</b> by the labels shown
            in the top corners — as fast as you can. If you slip, a red ✗ appears; just hit the other key to continue.
            Seven short rounds.
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => { setBi(0); setPhase("blockIntro"); }}>Begin&nbsp;→</button>
          <p className="meta">7 rounds · about 5 min · a demonstration of implicit measurement</p>
          <div style={{ marginTop: 22 }}><button className="btn ghost" onClick={onExit}>←&nbsp;All assessments</button></div>
        </div>
      </div>
    );
  }

  /* ── result ── */
  if (phase === "result" && result) {
    const pos = Math.max(-1, Math.min(1, result.d)); // clamp for the bar
    const left = ((pos + 1) / 2) * 100;
    return (
      <div className="container view-enter">
        <div className="report-head">
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="iat-demo" category="cognition" /></span>
          <div className="supertitle">Implicit Associations · Demonstration</div>
          <h1>{name ? `${name}, your` : "Your"} implicit result</h1>
          <div className="subtitle">D = {result.d.toFixed(2)} · {result.errorRate}% first-try errors</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel">
            <p className="lead-para drop">
              Your reactions showed <b>{result.magnitude}</b> automatic association
              {result.direction === "none"
                ? " — your two pairings were about equally fast."
                : ` between ${result.direction === "flowers" ? "flowers" : "insects"} and "pleasant".`}
            </p>
            <div className="iat-scale" aria-hidden="true">
              <div className="iat-track"><span className="iat-mid" /><span className="iat-marker" style={{ left: `${left}%` }} /></div>
              <div className="ends"><span>Insects + Pleasant</span><span>Flowers + Pleasant</span></div>
            </div>
            <p style={{ color: "var(--text-dim)", marginTop: 14 }}>
              Almost everyone lands toward the flowers-pleasant side — that's the textbook demonstration effect, and it
              shows the method is working, not anything unusual about you.
            </p>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
            <ul className="caveats">{IAT_TEST.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", color: "var(--text-faint)", fontSize: 13 }}>How the D-score works</summary>
              <p style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 10 }}>
                The score (Greenwald, Nosek & Banaji, 2003) compares your speed when flowers share a key with "pleasant"
                versus when insects do, scaled by your own variability. Positive means faster on the flowers-pleasant pairing.
              </p>
            </details>
          </section>

          <div className="row-actions no-print">
            <button className="btn" onClick={() => { setTrials([]); setResult(null); setBi(0); setPhase("blockIntro"); }}>↻ Try again</button>
            <button className="btn ghost" onClick={onExit}>↩ All assessments</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── block intro ── */
  if (phase === "blockIntro") {
    return (
      <div className="container">
        <div className="quiz-wrap" style={{ textAlign: "center" }}>
          <div className="quiz-meta"><span>Round {block.n} of {IAT_BLOCKS.length}</span><span /></div>
          <div className="progress"><i style={{ width: `${(block.n / IAT_BLOCKS.length) * 100}%` }} /></div>
          <div className="qcard">
            <Sides />
            <p className="stmt" style={{ fontSize: "clamp(1.2rem,3.5vw,1.6rem)", margin: "26px auto 18px" }}>{block.label}</p>
            <button className="btn" onClick={startBlock}>Start this round&nbsp;→</button>
            <p className="hint">Left = E key · Right = I key (or tap the buttons)</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── trial ── */
  if (!stim) return null;
  return (
    <div className="container">
      <div className="quiz-wrap" style={{ textAlign: "center" }}>
        <div className="quiz-meta"><span>Round {block.n} of {IAT_BLOCKS.length}</span><span>{ti + 1} / {block.count}</span></div>
        <Sides />
        <div className="iat-stage">
          <span className={`iat-word ${isAttr(stim) ? "attr" : ""}`}>{stim.word}</span>
          {erred && <span className="iat-x" aria-hidden="true">✗</span>}
        </div>
        <div className="iat-buttons">
          <button className="btn ghost" onClick={() => respond("left")}>◄ E</button>
          <button className="btn ghost" onClick={() => respond("right")}>I ►</button>
        </div>
      </div>
    </div>
  );
}

function isAttrKey(c: string) {
  return c === "pleasant" || c === "unpleasant";
}
