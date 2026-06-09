import { useEffect, useRef, useState } from "react";
import { PROCESSING_TEST, makeSpeedTrial, scoreProcessing, type SpeedResult } from "@core/ability/processing";
import { localizeBand, localizeAbilityMeta } from "@core/ability/i18n";
import { InstrumentGlyph } from "../art";
import { CognitionGrowth } from "./CognitionGrowth";
import { useI18n } from "../../i18n";

type Phase = "intro" | "run" | "result";
type Trial = ReturnType<typeof makeSpeedTrial>;

export function SpeedFlow({ name, onExit, onComplete, unlocked, onPurchase, busy }: { name?: string; onExit: () => void; onComplete?: (r: SpeedResult) => void; unlocked?: boolean; onPurchase?: () => void; busy?: boolean }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [timeLeft, setTimeLeft] = useState<number>(PROCESSING_TEST.durationSec);
  const [trial, setTrial] = useState<Trial>(makeSpeedTrial());
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const flashT = useRef<number | null>(null);
  const i18 = useI18n();
  const meta = localizeAbilityMeta("processing-speed", i18.locale);
  const pct = (n: number) => i18.t("cog.pct").replace("{p}", i18.locale === "en" ? ordinal(n) : String(n));
  const poss = name ? i18.t("cog.possNamed").replace("{name}", name) : i18.t("cog.poss");

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
          <p className="eyebrow">{i18.t("cog.speed.eyebrow")}</p>
          <h1>{meta.name ?? PROCESSING_TEST.name}</h1>
          <p className="lede">{meta.description ?? PROCESSING_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">{i18.t("cog.how")}</span>
            {i18.t("cog.speed.how").replace("{s}", String(PROCESSING_TEST.durationSec))}
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={start}>{i18.t("cog.speed.start")}</button>
          <p className="meta">{i18.t("cog.speed.meta").replace("{s}", String(PROCESSING_TEST.durationSec))}</p>
          <div style={{ marginTop: 22 }}><button className="btn ghost" onClick={onExit}>←&nbsp;{i18.t("common.allAssessments")}</button></div>
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
          <div className="supertitle">{i18.t("cog.speed.super")}</div>
          <h1>{poss} {i18.t("cog.speed.title")}</h1>
          <div className="subtitle">{i18.t("cog.speed.sub").replace("{c}", String(result.correct)).replace("{e}", String(result.errors)).replace("{a}", String(acc))}</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">{i18.t("cog.estimated")}</div>
              <div className="iq-range" style={{ fontSize: "clamp(2.4rem,7vw,3.4rem)" }}>{result.rate}<span>{i18.t("cog.speed.perMin")}</span></div>
              <div className="iq-sub">{localizeBand(result.band, i18.locale)} · {pct(result.percentile)}</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                {i18.t("cog.speed.narr").replace("{c}", String(result.correct)).replace("{a}", String(acc)).replace("{s}", String(result.durationSec)).replace("{r}", String(result.rate))}
              </p>
              <p className="note" style={{ margin: 0 }}>{i18.t("cog.speed.note")}</p>
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>{i18.t("cog.readHonestly")}</h3>
            <ul className="caveats">{(meta.caveats ?? PROCESSING_TEST.caveats).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <CognitionGrowth testId="processing-speed" unlocked={!!unlocked} onPurchase={onPurchase ?? (() => {})} busy={busy} />

          <div className="row-actions no-print">
            <button className="btn" onClick={start}>↻ {i18.t("cog.tryAgain")}</button>
            <button className="btn ghost" onClick={onExit}>↩ {i18.t("common.allAssessments")}</button>
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
          <span>{i18.t("cog.speed.correctCount").replace("{c}", String(correct))}</span>
        </div>
        <div className="progress"><i style={{ width: `${(timeLeft / PROCESSING_TEST.durationSec) * 100}%` }} /></div>

        <div className={`qcard speed-card ${flash ?? ""}`}>
          <div className="qnum">{i18.t("cog.speed.q")}</div>
          <div className="speed-key">
            <span className="speed-label">{i18.t("cog.speed.targets")}</span>
            <div className="speed-syms">{trial.targets.map((s, i) => <span key={i} className="speed-sym tgt">{s}</span>)}</div>
          </div>
          <div className="speed-search">
            <span className="speed-label">{i18.t("cog.speed.set")}</span>
            <div className="speed-syms">{trial.search.map((s, i) => <span key={i} className="speed-sym">{s}</span>)}</div>
          </div>
          <div className="speed-actions">
            <button className="btn ghost" onClick={() => answer(false)}>✗ {i18.t("cog.speed.notPresent")}</button>
            <button className="btn" onClick={() => answer(true)}>✓ {i18.t("cog.speed.present")}</button>
          </div>
          <p className="hint">{i18.t("cog.speed.keyHint")}</p>
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
