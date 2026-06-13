import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { AssessmentResult, Instrument, ResponseMap } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { scoreAssessment } from "@core/scoring";
import { composeReport } from "@core/report/composer";
import { getInstrument } from "@core/instruments";
import { localizeInstrument } from "@core/instruments/i18n";
import { buildIntegratedProfile, type IntegratedProfile as IP, type SynthEntry } from "@core/synthesis";
import { adaptivePack } from "@core/starter";
import { Home } from "./ui/Home";
import { Onboarding } from "./ui/Onboarding";
import { CoachDock } from "./ui/CoachDock";
import { Settings } from "./ui/Settings";
import { Intro } from "./ui/Intro";
import { Quiz } from "./ui/Quiz";
import { Calculating } from "./ui/Calculating";
import { Report } from "./ui/Report";
import { BriefResult } from "./ui/BriefResult";
import { PackStep } from "./ui/PackStep";
// Heavy, non-first-paint views are code-split so the initial load stays lean.
const Compatibility = lazy(() => import("./ui/Compatibility").then((m) => ({ default: m.Compatibility })));
const Growth = lazy(() => import("./ui/Growth").then((m) => ({ default: m.Growth })));
const IntegratedProfile = lazy(() => import("./ui/IntegratedProfile").then((m) => ({ default: m.IntegratedProfile })));
const AbilityFlow = lazy(() => import("./ui/ability/AbilityFlow").then((m) => ({ default: m.AbilityFlow })));
const AbilityResult = lazy(() => import("./ui/ability/AbilityResult").then((m) => ({ default: m.AbilityResult })));
const MemoryFlow = lazy(() => import("./ui/ability/MemoryFlow").then((m) => ({ default: m.MemoryFlow })));
const CorsiFlow = lazy(() => import("./ui/ability/CorsiFlow").then((m) => ({ default: m.CorsiFlow })));
const SpeedFlow = lazy(() => import("./ui/ability/SpeedFlow").then((m) => ({ default: m.SpeedFlow })));
const AdaptiveFlow = lazy(() => import("./ui/ability/AdaptiveFlow").then((m) => ({ default: m.AdaptiveFlow })));
const IatFlow = lazy(() => import("./ui/ability/IatFlow").then((m) => ({ default: m.IatFlow })));
const CreativityFlow = lazy(() => import("./ui/ability/CreativityFlow").then((m) => ({ default: m.CreativityFlow })));
const BatteryView = lazy(() => import("./ui/ability/BatteryView").then((m) => ({ default: m.BatteryView })));
const AdminNorms = lazy(() => import("./ui/AdminNorms").then((m) => ({ default: m.AdminNorms })));
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
import { ThemeToggle } from "./ui/theme";
import { submitNorms } from "./calibration";
import {
  completedInstrumentIds,
  createProfile,
  latestResult,
  loadProfile,
  recordCognitive,
  recordResult,
  resetProfile,
  saveProfile,
  touchStreak,
  type Profile,
} from "./profile";

type View = "home" | "intro" | "quiz" | "calc" | "result" | "compatibility" | "integrated" | "growth" | "packstep" | "ability" | "abilityResult" | "memory" | "corsi" | "speed" | "adaptive" | "iat" | "creativity" | "battery" | "admin";

const top = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
const randSeed = () => Math.floor(Math.random() * 2_000_000_000);

export default function App() {
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [skipOnb, setSkipOnb] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
  // The most recent standalone cognition mini-test result, for gating its full report.
  const [cog, setCog] = useState<{ id: string; fingerprint: string } | null>(null);

  const name = profile?.name || undefined;
  const unlocked = useMemo(() => !!result && isUnlocked(result.responseFingerprint), [result, unlockNonce]);
  const abilityUnlocked = useMemo(() => !!abilityResult && isUnlocked(abilityResult.fingerprint), [abilityResult, unlockNonce]);
  const cogUnlocked = useMemo(() => !!cog && isUnlocked(cog.fingerprint), [cog, unlockNonce]);
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
        const li = localizeInstrument(inst, locale);
        const scored = scoreAssessment(li, pending.responses);
        setInstrument(li);
        setResult(scored);
        setReport(composeReport(li, scored, { name: loadProfile()?.name || undefined, locale }));
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

  // Operator norms dashboard via the ?admin URL param.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("admin") !== null) setView("admin");
  }, []);

  // Keep the daily-visit streak current whenever a returning user opens the app.
  useEffect(() => {
    setProfile((p) => {
      if (!p) return p;
      const next = touchStreak(p);
      if (next !== p) saveProfile(next);
      return next;
    });
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
    setIntegrated(buildIntegratedProfile(entries, { name, locale }));
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
    setCog({ id: MEMORY_TEST.id, fingerprint: r.fingerprint });
  };
  const corsiDone = (r: MemoryResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: CORSI_TEST.id, name: CORSI_TEST.name, takenAt: new Date().toISOString(),
      headline: `Forward ${r.maxForward} · Backward ${r.maxBackward} blocks`, percentile: r.percentile,
      chc: { Gv: r.percentile },
    }));
    setCog({ id: CORSI_TEST.id, fingerprint: r.fingerprint });
  };
  const speedDone = (r: SpeedResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: PROCESSING_TEST.id, name: PROCESSING_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.correct} correct · ${r.rate}/min`, percentile: r.percentile,
      chc: { Gs: r.percentile },
    }));
    setCog({ id: PROCESSING_TEST.id, fingerprint: r.fingerprint });
  };
  const adaptiveDone = (r: AdaptiveResult) => {
    const base = profile ?? createProfile("", []);
    setProfile(recordCognitive(base, {
      id: ADAPTIVE_TEST.id, name: ADAPTIVE_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.band} · ${r.iqLow}–${r.iqHigh}`, percentile: r.percentile,
      chc: { Gf: r.percentile },
    }));
    setCog({ id: ADAPTIVE_TEST.id, fingerprint: r.fingerprint });
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
  const onPurchaseCognition = async () => {
    if (!cog) return;
    setError(null);
    setBusy(true);
    const pending: PendingResult = { instrumentId: cog.id, responses: {}, fingerprint: cog.fingerprint, productId: "cognitive" };
    const outcome = await startCheckout("cognitive", pending);
    if ("redirected" in outcome) return;
    if ("demo" in outcome) {
      grantProduct("cognitive", cog.fingerprint);
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
    setCog({ id: CREATIVITY_TEST.id, fingerprint: r.fingerprint });
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

  const completeOnboarding = (nm: string, focus: string[]) => {
    const p = createProfile(nm.trim(), focus);
    saveProfile(p);
    setProfile(p);
    setView("home");
    top();
  };

  const updateGoals = (focus: string[]) => {
    setProfile((p) => {
      const base = p ?? createProfile("", []);
      const next = { ...base, focus };
      saveProfile(next);
      return next;
    });
  };

  const saveName = (nm: string) => {
    setProfile((p) => {
      if (!p) return p;
      const next = { ...p, name: nm.slice(0, 40) || "Friend" };
      saveProfile(next);
      return next;
    });
  };

  const resetAll = () => {
    resetProfile();
    setProfile(null);
    setSettingsOpen(false);
    setSkipOnb(false);
    setView("home");
    top();
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
    setReport(composeReport(instrument, scored, { name, seed, locale }));
    if (profile) setProfile(recordResult(profile, instrument.id, responses, seed));
    submitNorms(instrument.id, scored.scales); // opt-in, anonymous, fire-and-forget
    setView("calc");
    top();
  };
  const afterCalc = () => {
    setView(packTotal > 0 ? "packstep" : "result");
    top();
  };

  const regenerate = () => {
    if (instrument && result) setReport(composeReport(instrument, result, { name, locale }));
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

  // First-run: a goal-based onboarding wizard that previews the personalized roadmap.
  if (!profile && !skipOnb && view === "home") {
    return <Onboarding onDone={completeOnboarding} onSkip={() => setSkipOnb(true)} />;
  }

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
              <ThemeToggle locale={locale} />
              {profile && <button className="theme-toggle" onClick={() => setSettingsOpen(true)} title={t("nav.settings")} aria-label={t("nav.settings")}>⚙</button>}
            </nav>
          </div>
        </header>
      )}

      <Suspense fallback={<div className="container" style={{ padding: "80px 22px", textAlign: "center", color: "var(--text-faint)" }}>…</div>}>

      {view === "home" && (
        <Home
          entries={entries}
          name={name}
          focus={profile?.focus ?? []}
          streakDays={profile?.streak.days ?? 0}
          cognitiveCount={profile?.cognitiveHistory?.length ?? 0}
          onUpdateGoals={updateGoals}
          onStart={start}
          onCompatibility={goCompat}
          onIntegrated={entries.length ? goIntegrated : undefined}
          onStartPack={() => startPack(adaptivePack(entries, profile?.focus ?? []))}
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

      {view === "memory" && <MemoryFlow name={name} onExit={goHome} onComplete={memoryDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy} />}

      {view === "corsi" && <CorsiFlow name={name} onExit={goHome} onComplete={corsiDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy} />}

      {view === "speed" && <SpeedFlow name={name} onExit={goHome} onComplete={speedDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy} />}

      {view === "adaptive" && <AdaptiveFlow name={name} onExit={goHome} onComplete={adaptiveDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy} />}

      {view === "iat" && <IatFlow name={name} onExit={goHome} onComplete={iatDone} />}

      {view === "creativity" && <CreativityFlow name={name} onExit={goHome} onComplete={creativityDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy} />}

      {view === "battery" && battery && (
        <BatteryView battery={battery} takes={profile?.cognitiveHistory ?? []} name={name} onExit={goHome} />
      )}

      {view === "admin" && <AdminNorms onBack={goHome} />}

      {view === "intro" && instrument && (
        <Intro instrument={instrument} initialName={name} entries={entries} onBegin={beginQuiz} onBack={goHome} />
      )}

      {view === "quiz" && instrument && <Quiz instrument={instrument} onComplete={complete} onCancel={goHome} />}

      {view === "calc" && <Calculating onDone={afterCalc} />}

      {view === "result" && instrument && result && report && (
        unlocked ? (
          <Report
            instrument={instrument}
            result={result}
            report={report}
            entries={entries}
            onRegenerate={regenerate}
            onRestart={goHome}
            onStartInstrument={start}
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

      {["home", "integrated", "growth", "compatibility", "battery"].includes(view) && (
        <CoachDock entries={entries} name={name} />
      )}

      {settingsOpen && profile && (
        <Settings profile={profile} onSaveName={saveName} onReset={resetAll} onClose={() => setSettingsOpen(false)} />
      )}
      </Suspense>
    </>
  );
}
