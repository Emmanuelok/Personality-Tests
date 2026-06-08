import { useEffect, useMemo, useState } from "react";
import type { AssessmentResult, Instrument, ResponseMap } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { scoreAssessment } from "@core/scoring";
import { composeReport } from "@core/report/composer";
import { getInstrument } from "@core/instruments";
import { buildIntegratedProfile, type IntegratedProfile as IP, type SynthEntry } from "@core/synthesis";
import { starterPack } from "@core/starter";
import { Home } from "./ui/Home";
import { Intro } from "./ui/Intro";
import { Quiz } from "./ui/Quiz";
import { Calculating } from "./ui/Calculating";
import { Report } from "./ui/Report";
import { BriefResult } from "./ui/BriefResult";
import { Compatibility } from "./ui/Compatibility";
import { Growth } from "./ui/Growth";
import { IntegratedProfile } from "./ui/IntegratedProfile";
import { PackStep } from "./ui/PackStep";
import { AbilityFlow } from "./ui/ability/AbilityFlow";
import type { AbilityTest } from "@core/ability";
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
  completedInstrumentIds,
  createProfile,
  latestResult,
  loadProfile,
  recordResult,
  saveProfile,
  type Profile,
} from "./profile";

type View = "home" | "intro" | "quiz" | "calc" | "result" | "compatibility" | "integrated" | "growth" | "packstep" | "ability";

const top = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
const randSeed = () => Math.floor(Math.random() * 2_000_000_000);

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [view, setView] = useState<View>("home");
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [integrated, setIntegrated] = useState<IP | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockNonce, setUnlockNonce] = useState(0);
  const [pack, setPack] = useState<string[]>([]);
  const [packTotal, setPackTotal] = useState(0);
  const [abilityTest, setAbilityTest] = useState<AbilityTest | null>(null);

  const name = profile?.name || undefined;
  const unlocked = useMemo(() => !!result && isUnlocked(result.responseFingerprint), [result, unlockNonce]);

  // Rescore the latest take of each completed instrument for synthesis.
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
      setReport(composeReport(inst, scored, { name: loadProfile()?.name || undefined }));
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

  /* ── navigation ─────────────────────────────────────────────────────── */
  const goHome = () => {
    setView("home");
    setError(null);
    top();
  };
  const goCompat = () => {
    setView("compatibility");
    top();
  };
  const goGrowth = () => {
    setView("growth");
    top();
  };
  const goIntegrated = () => {
    if (!entries.length) return;
    setIntegrated(buildIntegratedProfile(entries, { name }));
    setView("integrated");
    top();
  };

  /* ── test flow: catalog → intro → quiz → calc → result ──────────────── */
  const start = (inst: Instrument) => {
    setPack([]);
    setPackTotal(0);
    setInstrument(inst);
    setResult(null);
    setReport(null);
    setError(null);
    setView("intro");
    top();
  };

  const startAbility = (t: AbilityTest) => {
    setAbilityTest(t);
    setView("ability");
    top();
  };

  const beginInstrument = (inst: Instrument) => {
    setInstrument(inst);
    setResult(null);
    setReport(null);
    setError(null);
    setView("quiz");
    top();
  };

  const beginQuiz = (nm: string) => {
    const trimmed = nm.trim();
    let p = profile ?? createProfile(trimmed, []);
    if (trimmed && p.name !== trimmed) p = { ...p, name: trimmed };
    else if (!trimmed && !profile) p = { ...p, name: "" };
    saveProfile(p);
    setProfile(p);
    if (instrument) beginInstrument(instrument);
  };

  const startPack = (ids: string[]) => {
    const first = ids[0] && getInstrument(ids[0]);
    if (!first) return;
    setPackTotal(ids.length);
    setPack(ids.slice(1));
    start(first);
  };
  const packNext = () => {
    if (pack.length) {
      const [next, ...rest] = pack;
      const inst = getInstrument(next);
      setPack(rest);
      if (inst) beginInstrument(inst);
    } else {
      setPackTotal(0);
      setPack([]);
      goIntegrated();
    }
  };
  const skipPack = () => {
    setPackTotal(0);
    setPack([]);
    goHome();
  };

  const complete = (responses: ResponseMap) => {
    if (!instrument) return;
    const scored = scoreAssessment(instrument, responses);
    const seed = randSeed();
    setResult(scored);
    setReport(composeReport(instrument, scored, { name, seed }));
    if (profile) setProfile(recordResult(profile, instrument.id, responses, seed));
    setView("calc");
    top();
  };
  const afterCalc = () => {
    setView(packTotal > 0 ? "packstep" : "result");
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

  const hasHistory = entries.length > 0;
  const showChrome = view !== "quiz" && view !== "calc" && view !== "ability";

  return (
    <>
      {showChrome && (
        <header className="topbar">
          <div className="container inner">
            <div className="brand" onClick={goHome}>
              <span className="mark">🧭</span>
              <span className="name">Psyche <b>Atlas</b></span>
            </div>
            <nav className="navlinks">
              <button className={view === "home" || view === "intro" ? "active" : ""} onClick={goHome}>Assessments</button>
              {hasHistory && <button className={view === "integrated" ? "active" : ""} onClick={goIntegrated}>Integrated</button>}
              {hasHistory && <button className={view === "growth" ? "active" : ""} onClick={goGrowth}>Journey</button>}
              <button className={view === "compatibility" ? "active" : ""} onClick={goCompat}>Compatibility</button>
            </nav>
          </div>
        </header>
      )}

      {view === "home" && (
        <Home
          onStart={start}
          onCompatibility={goCompat}
          onStartPack={() => startPack(starterPack(profile?.focus ?? []))}
          onStartAbility={startAbility}
        />
      )}

      {view === "ability" && abilityTest && (
        <AbilityFlow test={abilityTest} name={name} onExit={goHome} />
      )}

      {view === "intro" && instrument && (
        <Intro instrument={instrument} initialName={name} onBegin={beginQuiz} onBack={goHome} />
      )}

      {view === "quiz" && instrument && <Quiz instrument={instrument} onComplete={complete} onCancel={goHome} />}

      {view === "calc" && <Calculating onDone={afterCalc} />}

      {view === "result" && instrument && result && report && (
        unlocked ? (
          <Report
            instrument={instrument}
            result={result}
            report={report}
            onRegenerate={regenerate}
            onRestart={goHome}
            onCompatibility={goCompat}
            name={name}
          />
        ) : (
          <BriefResult
            instrument={instrument}
            result={result}
            report={report}
            onPurchase={onPurchase}
            onRestart={goHome}
            busy={busy}
            error={error}
          />
        )
      )}

      {view === "integrated" && integrated && <IntegratedProfile ip={integrated} onBack={goHome} onBrowse={goHome} />}

      {view === "compatibility" && (
        <Compatibility instrument={instrument} result={result} onStart={start} onBack={goHome} />
      )}

      {view === "growth" && profile && <Growth profile={profile} onBrowse={goHome} onBack={goHome} />}

      {view === "packstep" && report && (
        <PackStep report={report} done={packTotal - pack.length} total={packTotal} name={name} onContinue={packNext} onSkip={skipPack} />
      )}
    </>
  );
}
