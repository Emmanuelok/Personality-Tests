import { useEffect, useMemo, useState } from "react";
import type { AssessmentResult, Instrument, ResponseMap } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { scoreAssessment } from "@core/scoring";
import { composeReport } from "@core/report/composer";
import { getInstrument } from "@core/instruments";
import { buildIntegratedProfile, type IntegratedProfile as IP, type SynthEntry } from "@core/synthesis";
import { Aurora } from "./ui/Aurora";
import { Onboarding } from "./ui/Onboarding";
import { Dashboard } from "./ui/Dashboard";
import { IntegratedProfile } from "./ui/IntegratedProfile";
import { Home } from "./ui/Home";
import { Quiz } from "./ui/Quiz";
import { Report } from "./ui/Report";
import { BriefResult } from "./ui/BriefResult";
import { Compatibility } from "./ui/Compatibility";
import {
  grantProduct,
  isUnlocked,
  loadPending,
  recoverEntitlements,
  startCheckout,
  verifyCheckout,
  type PendingResult,
} from "./store";
import {
  addJournal,
  completedInstrumentIds,
  createProfile,
  latestResult,
  loadProfile,
  recordResult,
  resetProfile,
  touchStreak,
  type Profile,
} from "./profile";

type View = "onboarding" | "dashboard" | "library" | "quiz" | "result" | "compatibility" | "integrated";

const top = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
const randSeed = () => Math.floor(Math.random() * 2_000_000_000);

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [view, setView] = useState<View>(() => (loadProfile() ? "dashboard" : "onboarding"));
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [integrated, setIntegrated] = useState<IP | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockNonce, setUnlockNonce] = useState(0);

  const name = profile?.name;

  const unlocked = useMemo(
    () => !!result && isUnlocked(result.responseFingerprint),
    [result, unlockNonce],
  );

  // Rescore the latest take of each completed instrument for synthesis & the dashboard.
  const entries = useMemo<SynthEntry[]>(() => {
    if (!profile) return [];
    const out: SynthEntry[] = [];
    for (const id of completedInstrumentIds(profile)) {
      const inst = getInstrument(id);
      const saved = latestResult(profile, id);
      if (inst && saved) out.push({ instrument: inst, result: scoreAssessment(inst, saved.responses) });
    }
    return out;
  }, [profile]);

  // Daily-streak bump on first load.
  useEffect(() => {
    setProfile((p) => (p ? touchStreak(p) : p));
  }, []);

  // Return trip from Stripe Checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cleanUrl = () => window.history.replaceState({}, "", window.location.pathname);
    const restore = (pending: PendingResult) => {
      const inst = getInstrument(pending.instrumentId);
      if (!inst) return false;
      const scored = scoreAssessment(inst, pending.responses);
      setInstrument(inst);
      setResult(scored);
      setReport(composeReport(inst, scored, { name: loadProfile()?.name }));
      setView("result");
      return true;
    };

    if (params.get("paid") === "1") {
      (async () => {
        const v = await verifyCheckout(params.get("session_id") || "");
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

  // Recover a prior purchase for the current result (KV-backed), if any.
  useEffect(() => {
    if (result && !isUnlocked(result.responseFingerprint)) {
      recoverEntitlements(result.responseFingerprint).then((ok) => ok && setUnlockNonce((n) => n + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const onboardingDone = (nm: string, focus: string[]) => {
    setProfile(createProfile(nm, focus));
    setView("dashboard");
    top();
  };

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
    const seed = randSeed();
    setResult(scored);
    setReport(composeReport(instrument, scored, { name, seed }));
    if (profile) setProfile(recordResult(profile, instrument.id, responses, seed));
    setView("result");
    top();
  };

  const openResult = (instrumentId: string) => {
    const inst = getInstrument(instrumentId);
    const saved = profile ? latestResult(profile, instrumentId) : undefined;
    if (!inst || !saved) return;
    const scored = scoreAssessment(inst, saved.responses);
    setInstrument(inst);
    setResult(scored);
    setReport(composeReport(inst, scored, { name, seed: saved.seed }));
    setView("result");
    top();
  };

  const regenerate = () => {
    if (instrument && result) setReport(composeReport(instrument, result, { name }));
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
    if ("redirected" in outcome) return;
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

  const goIntegrated = () => {
    if (!entries.length) return;
    setIntegrated(buildIntegratedProfile(entries, { name }));
    setView("integrated");
    top();
  };
  const goLibrary = () => {
    setView("library");
    top();
  };
  const goCompat = () => {
    setView("compatibility");
    top();
  };
  const goDashboard = () => {
    setView(profile ? "dashboard" : "onboarding");
    setError(null);
    top();
  };
  const onJournal = (text: string) => {
    if (profile) setProfile(addJournal(profile, { at: new Date().toISOString(), text }));
  };
  const onReset = () => {
    if (!confirm("Reset your space? This erases your name, history, and reflections on this device.")) return;
    resetProfile();
    setProfile(null);
    setResult(null);
    setReport(null);
    setIntegrated(null);
    setView("onboarding");
    top();
  };

  return (
    <>
      <Aurora />
      {view !== "onboarding" && (
        <header className="topbar">
          <div className="container inner">
            <div className="brand" onClick={goDashboard}>
              <span className="mark">🧭</span>
              <span className="name">Psyche <b>Atlas</b></span>
            </div>
            {profile && (
              <nav className="navlinks">
                <button className={view === "dashboard" ? "active" : ""} onClick={goDashboard}>Home</button>
                <button className={view === "library" ? "active" : ""} onClick={goLibrary}>Explore</button>
                <button className={view === "integrated" ? "active" : ""} onClick={goIntegrated} disabled={!entries.length}>Integrated</button>
                <button className={view === "compatibility" ? "active" : ""} onClick={goCompat}>Compatibility</button>
              </nav>
            )}
          </div>
        </header>
      )}

      {view === "onboarding" && <Onboarding onDone={onboardingDone} />}

      {view === "dashboard" && profile && (
        <Dashboard
          profile={profile}
          entries={entries}
          onBrowse={goLibrary}
          onOpen={openResult}
          onStartInstrument={start}
          onIntegrated={goIntegrated}
          onCompatibility={goCompat}
          onJournal={onJournal}
          onReset={onReset}
        />
      )}

      {view === "library" && <Home onStart={start} onCompatibility={goCompat} />}

      {view === "quiz" && instrument && <Quiz instrument={instrument} onComplete={complete} onCancel={goDashboard} />}

      {view === "result" && instrument && result && report && (
        unlocked ? (
          <Report
            instrument={instrument}
            result={result}
            report={report}
            onRegenerate={regenerate}
            onRestart={goDashboard}
            onCompatibility={goCompat}
            name={name}
          />
        ) : (
          <BriefResult
            instrument={instrument}
            result={result}
            report={report}
            onPurchase={onPurchase}
            onRestart={goDashboard}
            busy={busy}
            error={error}
          />
        )
      )}

      {view === "integrated" && integrated && (
        <IntegratedProfile ip={integrated} onBack={goDashboard} onBrowse={goLibrary} />
      )}

      {view === "compatibility" && (
        <Compatibility instrument={instrument} result={result} onStart={start} onBack={goDashboard} />
      )}
    </>
  );
}
