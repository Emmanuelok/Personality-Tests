import { useEffect, useMemo, useState } from "react";
import type { AssessmentResult, Instrument, ResponseMap } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { scoreAssessment } from "@core/scoring";
import { composeReport } from "@core/report/composer";
import { getInstrument } from "@core/instruments";
import { localizeInstrument } from "@core/instruments/i18n";
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
import { AbilityResult } from "./ui/ability/AbilityResult";
import { MemoryFlow } from "./ui/ability/MemoryFlow";
import { CorsiFlow } from "./ui/ability/CorsiFlow";
import { SpeedFlow } from "./ui/ability/SpeedFlow";
import { AdaptiveFlow } from "./ui/ability/AdaptiveFlow";
import { IatFlow } from "./ui/ability/IatFlow";
import { CreativityFlow } from "./ui/ability/CreativityFlow";
import { BatteryView } from "./ui/ability/BatteryView";
import { getAbilityTest, scoreAbility as scoreAbilityTest, type AbilityTest, type AbilityResult as ARes } from "@core/ability";
import { buildBattery } from "@core/ability/chc";
import {
  grantProduct,
  isUnlocked,
  loadPending,
  recoverEntitlements,
  startCheckout,
  verifyCheckout,
  type PendingResult,
} from "./store";
import { MEMORY_TEST, CORSI_TEST, type MemoryResult } from "@core/ability/memory";
import { PROCESSING_TEST, type SpeedResult } from "@core/ability/processing";
import { ADAPTIVE_TEST, type AdaptiveResult } from "@core/ability/adaptive";
import { IAT_TEST, type IatResult } from "@core/ability/iat";
import { CREATIVITY_TEST, type CreativityResult } from "@core/ability/creativity";
import { chcFromDomains } from "@core/ability/chc";
import { useI18n, LanguageSwitcher } from "./i18n";
import {
  completedInstrumentIds,
  createProfile,
  latestResult,
  loadProfile,
  recordCognitive,
  recordResult,
  saveProfile,
  type Profile,
} from "./profile";

type View = "home" | "intro" | "quiz" | "calc" | "result" | "compatibility" | "integrated" | "growth" | "packstep" | "ability" | "abilityResult" | "memory" | "corsi" | "speed" | "adaptive" | "iat" | "creativity" | "battery";

const top = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
const randSeed = () => Math.floor(Math.random() * 2_000_000_000);

export default function App() {
  const { t, locale } = useI18n();
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
  const [abilityResult, setAbilityResult] = useState<ARes | null>(null);
  const [abilityNonce, setAbilityNonce] = useState(0);

  const name = profile?.name || undefined;
  const unlocked = useMemo(() => !!result && isUnlocked(result.responseFingerprint), [result, unlockNonce]);
  const abilityUnlocked = useMemo(() => !!abilityResult && isUnlocked(abilityResult.fingerprint), [abilityResult, unlockNonce]);
  const battery = useMemo(() => buildBattery(profile?.cognitiveHistory ?? []), [profile]);

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
      if (inst) {
        const scored = scoreAssessment(inst, pending.responses);
        setInstrument(localizeInstrument(inst, locale));
        setResult(scored);
        setReport(composeReport(inst, scored, { name: loadProfile()?.name || undefined }));
        setView("result");
        return true;
      }
      const at = getAbilityTest(pending.instrumentId);
      if (at) {
        setAbilityTest(at);
        setAbilityResult(scoreAbilityTest(at, pending.responses));
        setView("abilityResult");
        return true;
      }
      return false;
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

  // Same recovery for a cognitive result.
  useEffect(() => {
    if (abilityResult && !isUnlocked(abilityResult.fingerprint)) {
      recoverEntitlements(abilityResult.fingerprint).then((ok) => ok && setUnlockNonce((n) => n + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abilityResult]);

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
  const goBattery = () => {
    if (!battery) return;
    setView("battery");
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
    setInstrument(localizeInstrument(inst, locale));
    setResult(null);
    setReport(null);
    setError(null);
    setView("intro");
    top();
  };

  const startAbility = (t: AbilityTest) => {
    setAbilityTest(t);
    setAbilityResult(null);
    setError(null);
    setView("ability");
    top();
  };
  const abilityDone = (r: ARes) => {
    setAbilityResult(r);
    if (abilityTest) {
      const base = profile ?? createProfile("", []);
      setProfile(recordCognitive(base, {
        id: abilityTest.id, name: abilityTest.name, takenAt: new Date().toISOString(),
        headline: `${r.band} · ${r.iqLow}–${r.iqHigh}`, percentile: r.percentile,
        chc: chcFromDomains(r.perDomain),
      }));
    }
    setView("abilityResult");
    top();
  };
  const memoryDone = (r: MemoryResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: MEMORY_TEST.id, name: MEMORY_TEST.name, takenAt: new Date().toISOString(),
      headline: `Forward ${r.maxForward} · Backward ${r.maxBackward} digits`, percentile: r.percentile,
      chc: { Gsm: r.percentile },
    }));
  };
  const corsiDone = (r: MemoryResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: CORSI_TEST.id, name: CORSI_TEST.name, takenAt: new Date().toISOString(),
      headline: `Forward ${r.maxForward} · Backward ${r.maxBackward} blocks`, percentile: r.percentile,
      chc: { Gv: r.percentile },
    }));
  };
  const speedDone = (r: SpeedResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: PROCESSING_TEST.id, name: PROCESSING_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.correct} correct · ${r.rate}/min`, percentile: r.percentile,
      chc: { Gs: r.percentile },
    }));
  };
  const adaptiveDone = (r: AdaptiveResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: ADAPTIVE_TEST.id, name: ADAPTIVE_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.band} · ${r.iqLow}–${r.iqHigh}`, percentile: r.percentile,
      chc: { Gf: r.percentile },
    }));
  };
  const retakeAbility = () => {
    setAbilityResult(null);
    setAbilityNonce((n) => n + 1);
    setView("ability");
    top();
  };
  const onPurchaseAbility = async (productId: string) => {
    if (!abilityTest || !abilityResult) return;
    setError(null);
    setBusy(true);
    const pending: PendingResult = {
      instrumentId: abilityTest.id,
      responses: abilityResult.responses,
      fingerprint: abilityResult.fingerprint,
      productId,
    };
    const outcome = await startCheckout(productId, pending);
    if ("redirected" in outcome) return;
    if ("demo" in outcome) {
      grantProduct(productId, abilityResult.fingerprint);
      setUnlockNonce((n) => n + 1);
      setBusy(false);
      top();
    } else {
      setError(outcome.error);
      setBusy(false);
    }
  };
  const startMemory = () => {
    setView("memory");
    top();
  };
  const startCorsi = () => {
    setView("corsi");
    top();
  };
  const startSpeed = () => {
    setView("speed");
    top();
  };
  const startAdaptive = () => {
    setView("adaptive");
    top();
  };
  const startIat = () => {
    setView("iat");
    top();
  };
  const iatDone = (r: IatResult) => {
    const base = profile ?? createProfile("", []);
    const dir = r.direction === "none" ? "balanced associations" : `${r.magnitude} ${r.direction}–pleasant association`;
    setProfile(recordCognitive(base, {
      id: IAT_TEST.id, name: IAT_TEST.name, takenAt: new Date().toISOString(),
      headline: `${dir} (D ${r.d.toFixed(2)})`, percentile: 50,
    }));
  };
  const startCreativity = () => { setView("creativity"); top(); };
  const creativityDone = (r: CreativityResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: CREATIVITY_TEST.id, name: CREATIVITY_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.fluency} uses · ${r.band}`, percentile: r.percentile,
    }));
  };

  const beginInstrument = (inst: Instrument) => {
    setInstrument(localizeInstrument(inst, locale));
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

  const hasHistory = entries.length > 0 || (profile?.cognitiveHistory?.length ?? 0) > 0;
  const showChrome = view !== "quiz" && view !== "calc" && view !== "ability" && view !== "memory" && view !== "corsi" && view !== "speed" && view !== "adaptive" && view !== "iat" && view !== "creativity";

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
              <button className={view === "home" || view === "intro" ? "active" : ""} onClick={goHome}>{t("nav.assessments")}</button>
              {hasHistory && <button className={view === "integrated" ? "active" : ""} onClick={goIntegrated}>{t("nav.integrated")}</button>}
              {hasHistory && <button className={view === "growth" ? "active" : ""} onClick={goGrowth}>{t("nav.journey")}</button>}
              <button className={view === "compatibility" ? "active" : ""} onClick={goCompat}>{t("nav.compatibility")}</button>
              <LanguageSwitcher />
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
          onStartMemory={startMemory}
          onStartCorsi={startCorsi}
          onStartSpeed={startSpeed}
          onStartAdaptive={startAdaptive}
          onStartIat={startIat}
          onStartCreativity={startCreativity}
          onBattery={battery ? goBattery : undefined}
        />
      )}

      {view === "ability" && abilityTest && (
        <AbilityFlow key={`${abilityTest.id}-${abilityNonce}`} test={abilityTest} onExit={goHome} onComplete={abilityDone} />
      )}

      {view === "abilityResult" && abilityTest && abilityResult && (
        <AbilityResult
          test={abilityTest}
          result={abilityResult}
          name={name}
          unlocked={abilityUnlocked}
          busy={busy}
          error={error}
          onPurchase={onPurchaseAbility}
          onRestart={retakeAbility}
          onExit={goHome}
        />
      )}

      {view === "memory" && <MemoryFlow name={name} onExit={goHome} onComplete={memoryDone} />}

      {view === "corsi" && <CorsiFlow name={name} onExit={goHome} onComplete={corsiDone} />}

      {view === "speed" && <SpeedFlow name={name} onExit={goHome} onComplete={speedDone} />}

      {view === "adaptive" && <AdaptiveFlow name={name} onExit={goHome} onComplete={adaptiveDone} />}

      {view === "iat" && <IatFlow name={name} onExit={goHome} onComplete={iatDone} />}

      {view === "creativity" && <CreativityFlow name={name} onExit={goHome} onComplete={creativityDone} />}

      {view === "battery" && battery && (
        <BatteryView battery={battery} takes={profile?.cognitiveHistory ?? []} name={name} onExit={goHome} />
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

      {view === "integrated" && integrated && <IntegratedProfile ip={integrated} onBack={goHome} onBrowse={goHome} cognitive={profile?.cognitiveHistory} />}

      {view === "compatibility" && (
        <Compatibility instrument={instrument} result={result} onStart={start} onBack={goHome} />
      )}

      {view === "growth" && profile && (
        <Growth
          profile={profile}
          onBrowse={goHome}
          onBack={goHome}
          onBattery={battery ? goBattery : undefined}
          onImport={(p) => { saveProfile(p); setProfile(p); top(); }}
        />
      )}

      {view === "packstep" && report && (
        <PackStep report={report} done={packTotal - pack.length} total={packTotal} name={name} onContinue={packNext} onSkip={skipPack} />
      )}
    </>
  );
}
