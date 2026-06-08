import { useEffect, useState } from "react";
import { CREATIVITY_TEST, scoreCreativity, type CreativityPromptResult, type CreativityResult } from "@core/ability/creativity";
import { localizeBand, localizeAbilityMeta } from "@core/ability/i18n";
import { InstrumentGlyph } from "../art";
import { useI18n } from "../../i18n";

type Phase = "intro" | "prompt" | "result";

export function CreativityFlow({ name, onExit, onComplete }: { name?: string; onExit: () => void; onComplete?: (r: CreativityResult) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [pi, setPi] = useState(0);
  const [uses, setUses] = useState<string[]>([]);
  const [entry, setEntry] = useState("");
  const [done, setDone] = useState<CreativityPromptResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(CREATIVITY_TEST.secondsPerPrompt);
  const [result, setResult] = useState<CreativityResult | null>(null);
  const i18 = useI18n();
  const meta = localizeAbilityMeta("alternative-uses", i18.locale);
  const pct = (n: number) => i18.t("cog.pct").replace("{p}", i18.locale === "en" ? ordinal(n) : String(n));
  const poss = name ? i18.t("cog.possNamed").replace("{name}", name) : i18.t("cog.poss");

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
          <p className="eyebrow">{i18.t("cog.cre.eyebrow")}</p>
          <h1>{meta.name ?? CREATIVITY_TEST.name}</h1>
          <p className="lede">{meta.description ?? CREATIVITY_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">{i18.t("cog.how")}</span>
            {i18.t("cog.cre.how").replace("{s}", String(CREATIVITY_TEST.secondsPerPrompt))}
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => beginPrompt(0)}>{i18.t("cog.begin")}</button>
          <p className="meta">{i18.t("cog.cre.meta").replace("{n}", String(CREATIVITY_TEST.prompts.length)).replace("{s}", String(CREATIVITY_TEST.secondsPerPrompt))}</p>
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
          <span className="report-seal cat-cognition" aria-hidden="true"><InstrumentGlyph id="alternative-uses" category="cognition" /></span>
          <div className="supertitle">{i18.t("cog.cre.super")}</div>
          <h1>{poss} {i18.t("cog.cre.title")}</h1>
          <div className="subtitle">{i18.t("cog.cre.sub").replace("{f}", String(result.fluency)).replace("{n}", String(result.prompts.length))}</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">{i18.t("cog.cre.fluency")}</div>
              <div className="iq-range" style={{ fontSize: "clamp(2.6rem,8vw,3.8rem)" }}>{result.fluency}</div>
              <div className="iq-sub">{localizeBand(result.band, i18.locale)} · {pct(result.percentile)}</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                {i18.t("cog.cre.narr").replace("{f}", String(result.fluency))}
              </p>
              <p className="note" style={{ margin: 0 }}>{i18.t("cog.cre.note")}</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>{i18.t("cog.cre.everything")}</h3>
            {result.prompts.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="thead"><h4>{i18.t("cog.cre.usesFor").replace("{o}", p.prompt)}</h4><span className="level">{p.uses.length}</span></div>
                <div className="use-list">{p.uses.length ? p.uses.map((u, j) => <span className="use-chip" key={j}>{u}</span>) : <span style={{ color: "var(--text-faint)" }}>—</span>}</div>
              </div>
            ))}
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>{i18.t("cog.readHonestly")}</h3>
            <ul className="caveats">{(meta.caveats ?? CREATIVITY_TEST.caveats).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <div className="row-actions no-print">
            <button className="btn" onClick={() => { setDone([]); setResult(null); beginPrompt(0); }}>↻ {i18.t("cog.tryAgain")}</button>
            <button className="btn ghost" onClick={onExit}>↩ {i18.t("common.allAssessments")}</button>
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
          <span>{i18.t("cog.cre.object").replace("{i}", String(pi + 1)).replace("{n}", String(CREATIVITY_TEST.prompts.length)).replace("{u}", String(uses.length))}</span>
        </div>
        <div className="progress"><i style={{ width: `${((CREATIVITY_TEST.secondsPerPrompt - timeLeft) / CREATIVITY_TEST.secondsPerPrompt) * 100}%` }} /></div>
        <div className="qcard">
          <div className="qnum">{i18.t("cog.cre.listFor")}</div>
          <p className="stmt" style={{ margin: "10px auto 18px" }}>{prompt}</p>
          <div className="name-field" style={{ maxWidth: 440 }}>
            <input
              type="text"
              placeholder={i18.t("cog.cre.placeholder")}
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
            <button className="btn sm" onClick={next}>{pi + 1 < CREATIVITY_TEST.prompts.length ? i18.t("cog.cre.nextObject") : i18.t("ability.seeResult")}</button>
          </div>
          <p className="hint">{i18.t("cog.cre.hint")}</p>
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
