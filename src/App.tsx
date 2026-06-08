import { useState } from "react";
import type { AssessmentResult, Instrument, ResponseMap } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { scoreAssessment } from "@core/scoring";
import { composeReport } from "@core/report/composer";
import { Home } from "./ui/Home";
import { Quiz } from "./ui/Quiz";
import { Report } from "./ui/Report";

type View = "home" | "quiz" | "report";

const top = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

export default function App() {
  const [view, setView] = useState<View>("home");
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [report, setReport] = useState<PersonalityReport | null>(null);

  const start = (inst: Instrument) => {
    setInstrument(inst);
    setResult(null);
    setReport(null);
    setView("quiz");
    top();
  };

  const complete = (responses: ResponseMap) => {
    if (!instrument) return;
    const scored = scoreAssessment(instrument, responses);
    setResult(scored);
    setReport(composeReport(instrument, scored));
    setView("report");
    top();
  };

  const regenerate = () => {
    if (instrument && result) setReport(composeReport(instrument, result));
  };

  const home = () => {
    setView("home");
    top();
  };

  return (
    <>
      <header className="topbar">
        <div className="container inner">
          <div className="brand" onClick={home}>
            <span className="mark">🧭</span>
            <span className="name">Psyche <b>Atlas</b></span>
          </div>
          <span className="meta no-print">Science-grounded · uniquely yours · growth-oriented</span>
        </div>
      </header>

      {view === "home" && <Home onStart={start} />}
      {view === "quiz" && instrument && <Quiz instrument={instrument} onComplete={complete} onCancel={home} />}
      {view === "report" && instrument && result && report && (
        <Report instrument={instrument} result={result} report={report} onRegenerate={regenerate} onRestart={home} />
      )}
    </>
  );
}
