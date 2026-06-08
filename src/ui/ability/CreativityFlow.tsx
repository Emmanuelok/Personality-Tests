import { useEffect, useState } from "react";
import { CREATIVITY_TEST, scoreCreativity, type CreativityPromptResult, type CreativityResult } from "@core/ability/creativity";
import { InstrumentGlyph } from "../art";

type Phase = "intro" | "prompt" | "result";

export function CreativityFlow({ name, onExit, onComplete }: { name?: string; onExit: () => void; onComplete?: (r: CreativityResult) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [pi, setPi] = useState(0);
  const [uses, setUses] = useState<string[]>([]);
  const [entry, setEntry] = useState("");
  const [done, setDone] = useState<CreativityPromptResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(CREATIVITY_TEST.secondsPerPrompt);
  const [result, setResult] = useState<CreativityResult | null>(null);

  const prompt = CREATIVITY_TEST.prompts[pi];

  const beginPrompt = (idx: number) => {
    setPi(idx);
    setUses([]);
    setEntry("");
    setTimeLeft(CREATIVITY_TEST.secondsPerPrompt);
    setPhase("prompt");
  };

  // Countdown for the current prompt.
  useEffect(() => {
    if (phase !== "prompt") return;
    if (timeLeft <= 0) { next(); return; }
    const iv = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  const add = () => {
    const v = entry.trim();
    if (!v) return;
    if (!uses.some((u) => u.toLowerCase() === v.toLowerCase())) setUses((u) => [...u, v]);
    setEntry("");
  };

  const next = () => {
    const rec: CreativityPromptResult = { prompt, uses };
    const all = [...done, rec];
    setDone(all);
    if (pi + 1 < CREATIVITY_TEST.prompts.length) beginPrompt(pi + 1);
    else { const res = scoreCreativity(all); setResult(res); setPhase("result"); onComplete?.(res); }
  };

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="container">
        <div className="intro view-enter">
          <span className="intro-emblem cat-cognition" aria-hidden="true"><InstrumentGlyph id="alternative-uses" category="cognition" /></span>
          <p className="eyebrow">Creative Thinking</p>
          <h1>{CREATIVITY_TEST.name}</h1>
          <p className="lede">{CREATIVITY_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">How it works</span>
            For each object, you get <b>{CREATIVITY_TEST.secondsPerPrompt} seconds</b> to type as many different uses as
            you can — common or wild. Press Enter after each. Quantity and variety are the game; there are no wrong answers.
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => beginPrompt(0)}>Begin&nbsp;→</button>
          <p className="meta">{CREATIVITY_TEST.prompts.length} objects · {CREATIVITY_TEST.secondsPerPrompt}s each · divergent thinking</p>
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
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="alternative-uses" category="cognition" /></span>
          <div className="supertitle">Creative Thinking · Estimated Profile</div>
          <h1>{name ? `${name}, your` : "Your"} divergent thinking</h1>
          <div className="subtitle">{result.fluency} distinct uses across {result.prompts.length} objects</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">Fluency</div>
              <div className="iq-range" style={{ fontSize: "clamp(2.6rem,8vw,3.8rem)" }}>{result.fluency}</div>
              <div className="iq-sub">{result.band} · about the {ordinal(result.percentile)} percentile</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                You generated <b>{result.fluency}</b> distinct, sensible uses. Fluency — sheer idea output — is the most
                measurable spark of creativity. The freedom to produce many ideas is exactly what divergent thinking trains.
              </p>
              <p className="note" style={{ margin: 0 }}>A playful estimate of one facet of creativity, not a full measure.</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>Everything you came up with</h3>
            {result.prompts.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="thead"><h4>Uses for {p.prompt}</h4><span className="level">{p.uses.length}</span></div>
                <div className="use-list">{p.uses.length ? p.uses.map((u, j) => <span className="use-chip" key={j}>{u}</span>) : <span style={{ color: "var(--text-faint)" }}>—</span>}</div>
              </div>
            ))}
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
            <ul className="caveats">{CREATIVITY_TEST.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <div className="row-actions no-print">
            <button className="btn" onClick={() => { setDone([]); setResult(null); beginPrompt(0); }}>↻ Try again</button>
            <button className="btn ghost" onClick={onExit}>↩ All assessments</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── prompt ── */
  const mm = Math.floor(Math.max(0, timeLeft) / 60);
  const ss = (Math.max(0, timeLeft) % 60).toString().padStart(2, "0");
  return (
    <div className="container">
      <div className="quiz-wrap" style={{ textAlign: "center" }}>
        <div className="quiz-meta">
          <span className={`ab-timer ${timeLeft <= 10 ? "low" : ""}`}>⏱ {mm}:{ss}</span>
          <span>Object {pi + 1} of {CREATIVITY_TEST.prompts.length} · {uses.length} ideas</span>
        </div>
        <div className="progress"><i style={{ width: `${((CREATIVITY_TEST.secondsPerPrompt - timeLeft) / CREATIVITY_TEST.secondsPerPrompt) * 100}%` }} /></div>
        <div className="qcard">
          <div className="qnum">List as many uses as you can for…</div>
          <p className="stmt" style={{ margin: "10px auto 18px" }}>{prompt}</p>
          <div className="name-field" style={{ maxWidth: 440 }}>
            <input
              type="text"
              placeholder="Type a use, press Enter…"
              value={entry}
              autoFocus
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            />
          </div>
          <div className="use-list" style={{ justifyContent: "center", marginTop: 14 }}>
            {uses.map((u, i) => (
              <span className="use-chip" key={i}>{u}<button className="use-x" onClick={() => setUses(uses.filter((_, j) => j !== i))} aria-label="remove">×</button></span>
            ))}
          </div>
          <div className="quiz-actions" style={{ justifyContent: "center", marginTop: 22 }}>
            <button className="btn sm" onClick={next}>{pi + 1 < CREATIVITY_TEST.prompts.length ? "Next object →" : "See my result →"}</button>
          </div>
          <p className="hint">Common or wild — every distinct idea counts.</p>
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
