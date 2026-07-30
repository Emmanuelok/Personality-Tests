import { useState } from "react";
import { ADAPTIVE_TEST, genItem, scoreAdaptive, type AdaptiveItem, type AdaptiveTrial, type AdaptiveResult } from "@core/ability/adaptive";
import { localizeAbilityMeta } from "@core/ability/i18n";
import { InstrumentGlyph } from "../art";
import { Calculating } from "../Calculating";
import { Figure } from "./Figure";
import { CognitionGrowth } from "./CognitionGrowth";
import { useI18n } from "../../i18n";

type Phase = "intro" | "quiz" | "calc" | "result";

export function AdaptiveFlow({ name, onExit, onComplete, unlocked, onPurchase, busy, initialResult }: { name?: string; onExit: () => void; onComplete?: (r: AdaptiveResult) => void; unlocked?: boolean; onPurchase?: () => void; busy?: boolean; initialResult?: AdaptiveResult }) {
  const [phase, setPhase] = useState<Phase>(initialResult ? "result" : "intro");
  const [level, setLevel] = useState<number>(ADAPTIVE_TEST.startLevel);
  const [item, setItem] = useState<AdaptiveItem | null>(null);
  const [administered, setAdministered] = useState<AdaptiveTrial[]>([]);
  const [result, setResult] = useState<AdaptiveResult | null>(initialResult ?? null);
  const i18 = useI18n();
  const meta = localizeAbilityMeta("adaptive-reasoning", i18.locale);
  const poss = name ? i18.t("cog.possNamed").replace("{name}", name) : i18.t("cog.poss");

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
          <p className="eyebrow">{i18.t("cog.adp.eyebrow")}</p>
          <h1>{meta.name ?? ADAPTIVE_TEST.name}</h1>
          <p className="lede">{meta.description ?? ADAPTIVE_TEST.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">{i18.t("cog.how")}</span>
            {i18.t("cog.adp.how").replace("{n}", String(ADAPTIVE_TEST.maxItems))}
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={begin}>{i18.t("cog.begin")}</button>
          <p className="meta">{i18.t("cog.adp.meta").replace("{n}", String(ADAPTIVE_TEST.maxItems))}</p>
          <div style={{ marginTop: 22 }}><button className="btn ghost" onClick={onExit}>←&nbsp;{i18.t("common.allAssessments")}</button></div>
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
          <div className="supertitle">{i18.t("cog.adp.super")}</div>
          <h1>{poss} {i18.t("cog.adp.title")}</h1>
          <div className="subtitle">{i18.t("cog.adp.sub").replace("{a}", String(result.abilityLevel)).replace("{m}", String(ADAPTIVE_TEST.maxLevel)).replace("{c}", String(result.correct)).replace("{t}", String(result.total))}</div>
        </div>
        <div className="report-grid stagger">
          <section className="panel iq-card">
            <div className="iq-figure">
              <div className="iq-band">{i18.t("cog.adp.estRange")}</div>
              <div className="iq-range">{result.practiceIndex}<span>/100</span></div>
              <div className="iq-sub">{result.observation}</div>
            </div>
            <div className="iq-note">
              <p style={{ marginTop: 0 }}>
                {i18.t("cog.adp.narr").replace("{a}", String(result.abilityLevel))}
              </p>
              <p className="note" style={{ margin: 0 }}>{i18.t("cog.adp.note")}</p>
            </div>
          </section>

          <section className="panel sec">
            <h3>{i18.t("cog.adp.pathTitle")}</h3>
            <p>{i18.t("cog.adp.pathIntro")}</p>
            <div className="adapt-path">
              {result.trials.map((t, i) => (
                <span key={i} className={`adapt-dot ${t.correct ? "ok" : "no"}`} style={{ height: 8 + t.level * 6 }} title={`${t.level} · ${t.correct ? "✓" : "✗"}`} />
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>{i18.t("cog.readHonestly")}</h3>
            <ul className="caveats">{(meta.caveats ?? ADAPTIVE_TEST.caveats).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>

          <CognitionGrowth testId="adaptive-reasoning" unlocked={!!unlocked} onPurchase={onPurchase ?? (() => {})} busy={busy} />

          <div className="row-actions no-print">
            <button className="btn" onClick={begin}>↻ {i18.t("cog.tryAgain")}</button>
            <button className="btn ghost" onClick={onExit}>↩ {i18.t("common.allAssessments")}</button>
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
          <span>{i18.t("cog.adp.quizLabel")}</span>
          <span>{i18.t("cog.adp.puzzle").replace("{i}", String(administered.length + 1)).replace("{n}", String(ADAPTIVE_TEST.maxItems))}</span>
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
          <p className="hint">{i18.t("cog.adp.quizHint")}</p>
        </div>
      </div>
    </div>
  );
}
