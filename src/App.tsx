import { useEffect, useMemo, useState } from "react";
import type { AssessmentResult, Instrument, ResponseMap } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { scoreAssessment } from "@core/scoring";
import { composeReport } from "@core/report/composer";
import { getInstrument } from "@core/instruments";
import { Home } from "./ui/Home";
import { Quiz } from "./ui/Quiz";
import { Report } from "./ui/Report";
import { BriefResult } from "./ui/BriefResult";
import {
  grantProduct,
  isUnlocked,
  loadPending,
  startCheckout,
  verifyCheckout,
  type PendingResult,
} from "./store";

type View = "home" | "quiz" | "result";

const top = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

export default function App() {
  const [view, setView] = useState<View>("home");
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockNonce, setUnlockNonce] = useState(0);

  const unlocked = useMemo(
    () => !!result && isUnlocked(result.responseFingerprint),
    [result, unlockNonce],
  );

  // Rebuild a result + report from a parked pending purchase (after Stripe redirect).
  const restore = (pending: PendingResult) => {
    const inst = getInstrument(pending.instrumentId);
    if (!inst) return false;
    const scored = scoreAssessment(inst, pending.responses);
    setInstrument(inst);
    setResult(scored);
    setReport(composeReport(inst, scored));
    setView("result");
    return true;
  };

  // Handle the return trip from Stripe Checkout once, on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cleanUrl = () => window.history.replaceState({}, "", window.location.pathname);

    if (params.get("paid") === "1") {
      const sessionId = params.get("session_id") || "";
      (async () => {
        const v = await verifyCheckout(sessionId);
        const pending = loadPending();
        if (v.paid && pending) {
          grantProduct(v.product || pending.productId, v.fp || pending.fingerprint);
          restore(pending);
          setUnlockNonce((n) => n + 1);
        } else if (pending) {
          restore(pending);
          setError("We couldn't confirm a completed payment. You can try the purchase again.");
        }
        cleanUrl();
        top();
      })();
    } else if (params.get("canceled") === "1") {
      const pending = loadPending();
      if (pending) restore(pending);
      cleanUrl();
      top();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = (inst: Instrument) => {
    setInstrument(inst);
    setResult(null);
    setReport(null);
    setError(null);
    setView("quiz");
    top();
  };

  const complete = (responses: ResponseMap) => {
    if (!instrument) return;
    const scored = scoreAssessment(instrument, responses);
    setResult(scored);
    setReport(composeReport(instrument, scored));
    setView("result");
    top();
  };

  const onPurchase = async (productId: string) => {
    if (!instrument || !result) return;
    setError(null);
    setBusy(true);
    const pending: PendingResult = {
      instrumentId: instrument.id,
      responses: result.responses,
      fingerprint: result.responseFingerprint,
      productId,
    };
    const outcome = await startCheckout(productId, pending);
    if ("redirected" in outcome) return; // navigating away to Stripe
    if ("demo" in outcome) {
      grantProduct(productId, result.responseFingerprint);
      setUnlockNonce((n) => n + 1);
      setBusy(false);
      top();
    } else {
      setError(outcome.error);
      setBusy(false);
    }
  };

  const regenerate = () => {
    if (instrument && result) setReport(composeReport(instrument, result));
  };

  const home = () => {
    setView("home");
    setError(null);
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
      {view === "result" && instrument && result && report && (
        unlocked ? (
          <Report instrument={instrument} result={result} report={report} onRegenerate={regenerate} onRestart={home} />
        ) : (
          <BriefResult
            instrument={instrument}
            result={result}
            report={report}
            onPurchase={onPurchase}
            onRestart={home}
            busy={busy}
            error={error}
          />
        )
      )}
    </>
  );
}
