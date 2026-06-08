import { useEffect, useMemo, useRef, useState } from "react";
import type { AbilityTest, AbilityResponses, AbilityResult as AR } from "@core/ability";
import { scoreAbility } from "@core/ability";
import { InstrumentGlyph } from "../art";
import { Calculating } from "../Calculating";
import { Figure } from "./Figure";
import { useI18n } from "../../i18n";

type Phase = "intro" | "quiz" | "calc";

export function AbilityFlow({ test, onExit, onComplete }: { test: AbilityTest; onExit: () => void; onComplete: (r: AR) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [responses, setResponses] = useState<AbilityResponses>({});
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<AR | null>(null);
  const [remaining, setRemaining] = useState(test.timeLimitSec ?? 0);
  const finishedRef = useRef(false);
  const { t } = useI18n();

  const item = test.items[idx];
  const answeredCount = useMemo(() => Object.keys(responses).length, [responses]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDone(scoreAbility(test, responses));
    setPhase("calc");
  };

  // Countdown timer during the quiz.
  useEffect(() => {
    if (phase !== "quiz" || !test.timeLimitSec) return;
    if (remaining <= 0) {
      finish();
      return;
    }
    const t = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining, test.timeLimitSec]);

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="container">
        <div className="intro view-enter">
          <span className="intro-emblem cat-cognition" aria-hidden="true">
            <InstrumentGlyph id={test.id} category="cognition" />
          </span>
          <p className="eyebrow">Cognitive Ability</p>
          <h1>{test.name}</h1>
          <p className="lede">{test.description}</p>
          <div className="aside" style={{ textAlign: "left", marginTop: 30 }}>
            <span className="label">{t("ability.before")}</span>
            {t("ability.timed")}
          </div>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => { setPhase("quiz"); }}>
            {t("ability.beginTest")}
          </button>
          <p className="meta">
            {test.items.length} questions · about {test.estMinutes} min{test.timeLimitSec ? ` · ${Math.round(test.timeLimitSec / 60)}-min timer` : ""}
          </p>
          <div style={{ marginTop: 22 }}>
            <button className="btn ghost" onClick={onExit}>←&nbsp;{t("common.allAssessments")}</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── calculating → hand the result up to the app ── */
  if (phase === "calc") return <Calculating onDone={() => { if (done) onComplete(done); }} />;

  /* ── quiz ── */
  const choose = (oi: number) => setResponses((r) => ({ ...r, [item.id]: oi }));
  const chosen = responses[item.id];
  const last = idx === test.items.length - 1;
  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, "0");
  const dnum = test.domains.find((d) => d.id === item.domain);

  return (
    <div className="container">
      <div className="quiz-wrap">
        <div className="quiz-meta">
          <span>{dnum?.name ?? ""}</span>
          {test.timeLimitSec ? <span className={`ab-timer ${remaining <= 60 ? "low" : ""}`}>⏱ {mm}:{ss}</span> : <span />}
          <span>{answeredCount}/{test.items.length} answered</span>
        </div>
        <div className="progress"><i style={{ width: `${((idx + 1) / test.items.length) * 100}%` }} /></div>

        <div className="qcard" key={item.id}>
          <div className="qnum">{t("ability.qOf").replace("{i}", String(idx + 1)).replace("{n}", String(test.items.length))}</div>
          <p className="stmt ab-prompt">{item.prompt}</p>
          {item.figure && <div className="ab-stem"><Figure svg={item.figure} /></div>}

          {item.optionFigures ? (
            <div className={`ab-figgrid ${item.optionFigures.length > 4 ? "six" : ""}`}>
              {item.optionFigures.map((fig, oi) => (
                <button key={oi} className={`ab-figopt ${chosen === oi ? "active" : ""}`} onClick={() => choose(oi)}>
                  <Figure svg={fig} />
                  <span className="ab-figlabel">{item.options[oi]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="likert ab-opts">
              {item.options.map((opt, oi) => (
                <button key={oi} className={chosen === oi ? "active" : ""} onClick={() => choose(oi)}>
                  <span className="dot">{String.fromCharCode(65 + oi)}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          )}

          <div className="quiz-actions">
            <button className="btn ghost sm" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>← {t("common.back")}</button>
            {last ? (
              <button className="btn sm" onClick={finish}>{t("ability.seeResult")}</button>
            ) : (
              <button className="btn sm" onClick={() => setIdx((i) => Math.min(test.items.length - 1, i + 1))}>{t("ability.next")}</button>
            )}
          </div>
          <p className="hint">{t("ability.changeAnswers")}</p>
        </div>
      </div>
    </div>
  );
}
