import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { AtlasOverview, GroupsHub } from "./ui/WorkspaceViews";
import { decodeRoom, type StudyRoom } from "@core/collab";
import { AgentStep } from "./ui/AgentStep";
import { autopilotNext, autopilotLength, agentBrief, autopilotNextUp } from "@core/autopilot";
import { autonomousEntries, completionEvidence, evidenceConsent } from "@core/evidence";
import { Intro } from "./ui/Intro";
import { Quiz } from "./ui/Quiz";
import { Calculating } from "./ui/Calculating";
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
const Study = lazy(() => import("./ui/Study").then((m) => ({ default: m.Study })));
const Report = lazy(() => import("./ui/Report").then((m) => ({ default: m.Report })));
const BriefResult = lazy(() => import("./ui/BriefResult").then((m) => ({ default: m.BriefResult })));
import { getAbilityTest, scoreAbility as scoreAbilityTest, type AbilityTest, type AbilityResult as ARes } from "@core/ability";
import { buildBattery } from "@core/ability/chc";
import {
  grantProduct,
  isUnlocked,
  clearPending,
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
  recordPractice,
  recordResult,
  resetProfile,
  saveProfile,
  touchStreak,
  type CognitiveStoredResult,
  type Profile,
} from "./profile";

type View = "home" | "atlas" | "explore" | "groups" | "intro" | "quiz" | "calc" | "result" | "compatibility" | "integrated" | "growth" | "packstep" | "ability" | "abilityResult" | "memory" | "corsi" | "speed" | "adaptive" | "iat" | "creativity" | "battery" | "admin" | "study" | "agent";
type PrimaryArea = "today" | "atlas" | "explore" | "groups";

function routeFromHash(hash: string): View {
  const route = hash.replace(/^#\/?/, "").replace(/\/+$/, "");
  if (route === "admin") return "admin";
  if (route.startsWith("my-atlas/result/")) return "result";
  if (route.startsWith("my-atlas/portrait")) return "integrated";
  if (route.startsWith("my-atlas/journey")) return "growth";
  if (route.startsWith("my-atlas/learning")) return "battery";
  if (route.startsWith("my-atlas/")) return "atlas";
  if (route === "my-atlas") return "atlas";
  if (route.startsWith("groups/study")) return "study";
  if (route.startsWith("groups/connection-map")) return "compatibility";
  if (route === "groups") return "groups";
  if (route.startsWith("explore")) return "explore";
  return "home";
}

function primaryAreaFor(view: View): PrimaryArea {
  if (["atlas", "integrated", "growth", "battery"].includes(view)) return "atlas";
  if (["groups", "study", "compatibility"].includes(view)) return "groups";
  if (["explore", "intro", "quiz", "calc", "result", "ability", "abilityResult", "memory", "corsi", "speed", "adaptive", "iat", "creativity", "packstep", "agent"].includes(view)) return "explore";
  return "today";
}

const top = () => window.scrollTo({
  top: 0,
  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "instant" as ScrollBehavior,
});
const randSeed = () => Math.floor(Math.random() * 2_000_000_000);
const AUTONOMOUS_PROGRESS_CONSENT = evidenceConsent({ actionable: true });

const storedCognitiveFingerprint = (stored: CognitiveStoredResult): string => stored.result.fingerprint;
const storedCognitiveId = (stored: CognitiveStoredResult): string =>
  stored.kind === "ability"
    ? stored.testId
    : stored.kind === "memory"
      ? MEMORY_TEST.id
      : stored.kind === "corsi"
        ? CORSI_TEST.id
        : stored.kind === "processing"
          ? PROCESSING_TEST.id
          : stored.kind === "adaptive"
            ? ADAPTIVE_TEST.id
            : CREATIVITY_TEST.id;
const storedCognitiveView = (stored: CognitiveStoredResult): View =>
  stored.kind === "ability"
    ? "abilityResult"
    : stored.kind === "memory"
      ? "memory"
      : stored.kind === "corsi"
        ? "corsi"
        : stored.kind === "processing"
          ? "speed"
          : stored.kind === "adaptive"
            ? "adaptive"
            : "creativity";

export default function App() {
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [skipOnb, setSkipOnb] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [joinRoom, setJoinRoom] = useState<StudyRoom | null>(null);
  const [studySeed, setStudySeed] = useState<{ topic?: string; query?: string } | undefined>(undefined);
  // Shared "study this together" link (?study-topic= / ?study-find=): open the
  // room builder pre-seeded from a topic/search. A full ?study= room invite wins.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("study")) return;
    const st = p.get("study-topic");
    const sf = p.get("study-find");
    if (!st && !sf) return;
    setStudySeed(st ? { topic: st } : { query: sf ?? "" });
    setSkipOnb(true);
    setView("study");
    window.history.replaceState({}, "", `${window.location.pathname}#/groups/study`);
  }, []);

  // Shared discovery link (?topic= / ?find=) — read once, synchronously, so the
  // catalog opens pre-filtered on the very first render (even for returning users).
  const [initialFind, setInitialFind] = useState<{ topic?: string; query?: string } | null>(() => {
    const p = new URLSearchParams(window.location.search);
    const topic = p.get("topic");
    const find = p.get("find");
    return topic ? { topic } : find ? { query: find } : null;
  });
  const [autopilot, setAutopilot] = useState<{ active: boolean; total: number; done: number; plan?: string[] }>({ active: false, total: 0, done: 0 });
  const [view, setView] = useState<View>(() => routeFromHash(window.location.hash));
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
  const [cog, setCog] = useState<{ id: string; fingerprint: string; stored: CognitiveStoredResult } | null>(null);
  const [restoredCognitive, setRestoredCognitive] = useState<CognitiveStoredResult | null>(null);
  const routeInitialized = useRef(false);

  const name = profile?.name || undefined;
  const unlocked = useMemo(() => !!result && isUnlocked(result.responseFingerprint), [result, unlockNonce]);
  const abilityUnlocked = useMemo(() => !!abilityResult && isUnlocked(abilityResult.fingerprint), [abilityResult, unlockNonce]);
  const cogUnlocked = useMemo(() => !!cog && isUnlocked(cog.fingerprint), [cog, unlockNonce]);
  const battery = useMemo(() => buildBattery(profile?.cognitiveHistory ?? []), [profile]);
  const setRoute = useCallback((hash: string, replace = false) => {
    const url = `${window.location.pathname}${hash}`;
    if (replace) window.history.replaceState({}, "", url);
    else if (window.location.hash !== hash || window.location.search) window.history.pushState({}, "", url);
  }, []);

  // Rescore the latest take of each completed instrument for synthesis. Localize the
  // instrument first so resolved type cards (DISC "El Impulsor", etc.) match the active
  // locale across the integrated profile, growth, and collaboration surfaces.
  const entries = useMemo<SynthEntry[]>(() => {
    if (!profile) return [];
    const out: SynthEntry[] = [];
    for (const id of completedInstrumentIds(profile)) {
      const inst = getInstrument(id);
      const saved = latestResult(profile, id);
      if (inst && saved) {
        const li = localizeInstrument(inst, locale);
        out.push({ instrument: li, result: scoreAssessment(li, saved.responses, { resultId: saved.resultId }) });
      }
    }
    return out;
  }, [profile, locale]);
  const recommendationEvidence = useMemo(() => completionEvidence(entries), [entries]);
  const recommendationEntries = useMemo(
    () => autonomousEntries(recommendationEvidence, AUTONOMOUS_PROGRESS_CONSENT),
    [recommendationEvidence],
  );

  // Hash routes make the four workspace areas linkable and let browser Back
  // return through the learner's journey. Subroutes gracefully fall back to
  // their parent area when the in-memory result they need is unavailable.
  useEffect(() => {
    const applyRoute = () => {
      const route = window.location.hash.replace(/^#\/?/, "").replace(/\/+$/, "");
      if (route.startsWith("my-atlas/result/")) {
        const resultId = decodeURIComponent(route.slice("my-atlas/result/".length));
        const saved = profile?.history.find((entry) => entry.resultId === resultId);
        const baseInstrument = saved && getInstrument(saved.instrumentId);
        if (!saved || !baseInstrument) { setView("atlas"); return; }
        const localized = localizeInstrument(baseInstrument, locale);
        const scored = scoreAssessment(localized, saved.responses, { resultId: saved.resultId });
        setInstrument(localized);
        setResult(scored);
        setReport(composeReport(localized, scored, { name, seed: saved.seed, locale }));
        setView("result");
        setError(null);
        return;
      }
      if (route.startsWith("my-atlas/learning/")) {
        const resultId = decodeURIComponent(route.slice("my-atlas/learning/".length));
        const take = profile?.cognitiveHistory?.find((entry) => entry.resultId === resultId);
        if (!take?.stored || storedCognitiveFingerprint(take.stored) !== resultId) {
          setView(battery ? "battery" : "atlas");
          return;
        }
        setRestoredCognitive(take.stored);
        setCog({ id: storedCognitiveId(take.stored), fingerprint: resultId, stored: take.stored });
        if (take.stored.kind === "ability") {
          const test = getAbilityTest(take.stored.testId);
          if (!test) { setView("atlas"); return; }
          setAbilityTest(test);
          setAbilityResult(take.stored.result);
        }
        setView(storedCognitiveView(take.stored));
        setError(null);
        return;
      }
      const target = routeFromHash(window.location.hash);
      if (target === "integrated") {
        if (!entries.length) { setView("atlas"); return; }
        setIntegrated(buildIntegratedProfile(entries, { name, locale }));
      }
      if (target === "battery" && !battery) { setView("atlas"); return; }
      if (target === "growth" && !profile) { setView("atlas"); return; }
      setView(target);
      setError(null);
    };

    if (!routeInitialized.current) {
      const params = new URLSearchParams(window.location.search);
      const queryOwnsInitialRoute = ["paid", "canceled", "admin", "study", "study-topic", "study-find", "topic", "find"]
        .some((key) => params.has(key));
      if (!window.location.hash && !queryOwnsInitialRoute) setRoute("#/today", true);
      else applyRoute();
      routeInitialized.current = true;
    }
    window.addEventListener("popstate", applyRoute);
    window.addEventListener("hashchange", applyRoute);
    return () => {
      window.removeEventListener("popstate", applyRoute);
      window.removeEventListener("hashchange", applyRoute);
    };
  }, [battery, entries, locale, name, profile, setRoute]);

  // Return trip from Stripe Checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cleanUrl = (hash: string) => window.history.replaceState({}, "", `${window.location.pathname}${hash}`);
    const restore = (pending: PendingResult): string | null => {
      if (
        pending.cognitive &&
        storedCognitiveId(pending.cognitive) === pending.instrumentId &&
        storedCognitiveFingerprint(pending.cognitive) === pending.fingerprint
      ) {
        const stored = pending.cognitive;
        setRestoredCognitive(stored);
        setCog({ id: pending.instrumentId, fingerprint: pending.fingerprint, stored });
        if (stored.kind === "ability") {
          const test = getAbilityTest(stored.testId);
          if (!test) return null;
          setAbilityTest(test);
          setAbilityResult(stored.result);
        }
        setView(storedCognitiveView(stored));
        return `#/my-atlas/learning/${encodeURIComponent(pending.fingerprint)}`;
      }
      const inst = getInstrument(pending.instrumentId);
      if (inst) {
        const li = localizeInstrument(inst, locale);
        const scored = scoreAssessment(li, pending.responses, { resultId: pending.fingerprint });
        setInstrument(li);
        setResult(scored);
        setReport(composeReport(li, scored, { name: loadProfile()?.name || undefined, locale }));
        setView("result");
        return `#/my-atlas/result/${encodeURIComponent(pending.fingerprint)}`;
      }
      const at = getAbilityTest(pending.instrumentId);
      if (at) {
        setAbilityTest(at);
        setAbilityResult(scoreAbilityTest(at, pending.responses, pending.fingerprint));
        setView("abilityResult");
        return `#/my-atlas/learning/${encodeURIComponent(pending.fingerprint)}`;
      }
      return null;
    };

    if (params.get("paid") === "1") {
      const sessionId = params.get("session_id") || "";
      // Remove the provider session id from the address bar before the network
      // round trip; it remains only in this closure for one verification call.
      cleanUrl("#/today");
      (async () => {
        const v = await verifyCheckout(sessionId);
        const pending = loadPending();
        let restoredHash: string | null = null;
        if (v.paid && pending) {
          grantProduct(v.product || pending.productId, v.fp || pending.fingerprint);
          restoredHash = restore(pending);
          clearPending();
          setUnlockNonce((n) => n + 1);
        } else if (pending) {
          restoredHash = restore(pending);
          setError("We couldn't confirm a completed payment. You can try the purchase again.");
        }
        cleanUrl(restoredHash ?? "#/today");
        top();
      })();
    } else if (params.get("canceled") === "1") {
      const pending = loadPending();
      const restoredHash = pending ? restore(pending) : null;
      clearPending();
      cleanUrl(restoredHash ?? "#/today");
      top();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Operator norms dashboard via the ?admin URL param.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("admin") !== null) {
      setView("admin");
      window.history.replaceState({}, "", `${window.location.pathname}#/admin`);
    }
  }, []);

  // Study Together invite link (?study=...): open the join flow.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("study");
    if (!code) return;
    const room = decodeRoom(code);
    if (room) { setJoinRoom(room); setSkipOnb(true); setView("study"); }
    window.history.replaceState({}, "", `${window.location.pathname}#/groups/study`);
  }, []);

  // A shared discovery link skips onboarding so it lands straight on the catalog.
  useEffect(() => {
    if (initialFind) {
      setSkipOnb(true);
      setView("explore");
      window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}#/explore`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Reconcile prior purchases and revocations for the current result.
  useEffect(() => {
    if (result) {
      recoverEntitlements(result.responseFingerprint).then((ok) => ok && setUnlockNonce((n) => n + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Same reconciliation for a cognitive result, including an unlocked one.
  useEffect(() => {
    const fingerprint = abilityResult?.fingerprint ?? cog?.fingerprint;
    if (fingerprint) {
      recoverEntitlements(fingerprint).then((ok) => ok && setUnlockNonce((n) => n + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abilityResult, cog]);

  /* ── navigation ─────────────────────────────────────────────────────── */
  const goHome = () => {
    setRoute("#/today");
    setView("home");
    setError(null);
    top();
  };
  const goAtlas = () => {
    setRoute("#/my-atlas");
    setView("atlas");
    setError(null);
    top();
  };
  const goExplore = () => {
    setRoute("#/explore");
    setView("explore");
    setError(null);
    top();
  };
  const goGroups = () => {
    setRoute("#/groups");
    setView("groups");
    setError(null);
    top();
  };
  const goStudy = () => {
    setStudySeed(undefined);
    setRoute("#/groups/study");
    setView("study");
    top();
  };
  const completePractice = () => {
    if (profile) setProfile(recordPractice(profile));
  };
  const goStudyTopic = (s: { topic?: string; query?: string }) => {
    setStudySeed(s);
    setRoute("#/groups/study");
    setView("study");
    top();
  };
  const goCompat = () => {
    setRoute("#/groups/connection-map");
    setView("compatibility");
    top();
  };
  const goGrowth = () => {
    setRoute("#/my-atlas/journey");
    setView("growth");
    top();
  };
  const openSavedResult = (resultId: string) => {
    const saved = profile?.history.find((entry) => entry.resultId === resultId);
    const baseInstrument = saved && getInstrument(saved.instrumentId);
    if (!saved || !baseInstrument) return;
    const localized = localizeInstrument(baseInstrument, locale);
    const scored = scoreAssessment(localized, saved.responses, { resultId: saved.resultId });
    setInstrument(localized);
    setResult(scored);
    setReport(composeReport(localized, scored, { name, seed: saved.seed, locale }));
    setRoute(`#/my-atlas/result/${encodeURIComponent(resultId)}`);
    setView("result");
    setError(null);
    top();
  };
  const openSavedCognitive = (resultId: string) => {
    const take = profile?.cognitiveHistory?.find((entry) => entry.resultId === resultId);
    if (!take?.stored || storedCognitiveFingerprint(take.stored) !== resultId) return;
    setRestoredCognitive(take.stored);
    setCog({ id: storedCognitiveId(take.stored), fingerprint: resultId, stored: take.stored });
    if (take.stored.kind === "ability") {
      const test = getAbilityTest(take.stored.testId);
      if (!test) return;
      setAbilityTest(test);
      setAbilityResult(take.stored.result);
    }
    setRoute(`#/my-atlas/learning/${encodeURIComponent(resultId)}`);
    setView(storedCognitiveView(take.stored));
    setError(null);
    top();
  };
  const goBattery = () => {
    if (!battery) return;
    setRoute("#/my-atlas/learning");
    setView("battery");
    top();
  };
  const goIntegrated = () => {
    if (!entries.length) return;
    setIntegrated(buildIntegratedProfile(entries, { name, locale }));
    setRoute("#/my-atlas/portrait");
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
    setRoute(`#/explore/activity/${encodeURIComponent(inst.id)}`);
    setView("intro");
    top();
  };

  const startAbility = (t: AbilityTest) => {
    setRestoredCognitive(null);
    setAbilityTest(t);
    setAbilityResult(null);
    setError(null);
    setRoute(`#/explore/activity/${encodeURIComponent(t.id)}`);
    setView("ability");
    top();
  };
  const abilityDone = (r: ARes) => {
    setAbilityResult(r);
    if (abilityTest) {
      const base = profile ?? createProfile("", []);
      const stored: CognitiveStoredResult = { kind: "ability", testId: abilityTest.id, result: r };
      setProfile(recordCognitive(base, {
        id: abilityTest.id, name: abilityTest.name, takenAt: new Date().toISOString(),
        headline: `${r.observation} · ${r.practiceIndex}/100 practice index`, practiceIndex: r.practiceIndex,
        chc: chcFromDomains(r.perDomain),
        resultId: r.fingerprint,
        stored,
      }));
    }
    setView("abilityResult");
    top();
  };
  const memoryDone = (r: MemoryResult) => {
    const base = profile ?? createProfile("", []);
    const stored: CognitiveStoredResult = { kind: "memory", result: r };
    setProfile(recordCognitive(base, {
      id: MEMORY_TEST.id, name: MEMORY_TEST.name, takenAt: new Date().toISOString(),
      headline: `Forward ${r.maxForward} · Backward ${r.maxBackward} digits · ${r.observation}`, practiceIndex: r.practiceIndex,
      chc: { Gsm: r.practiceIndex },
      resultId: r.fingerprint,
      stored,
    }));
    setCog({ id: MEMORY_TEST.id, fingerprint: r.fingerprint, stored });
  };
  const corsiDone = (r: MemoryResult) => {
    const base = profile ?? createProfile("", []);
    const stored: CognitiveStoredResult = { kind: "corsi", result: r };
    setProfile(recordCognitive(base, {
      id: CORSI_TEST.id, name: CORSI_TEST.name, takenAt: new Date().toISOString(),
      headline: `Forward ${r.maxForward} · Backward ${r.maxBackward} blocks · ${r.observation}`, practiceIndex: r.practiceIndex,
      chc: { Gv: r.practiceIndex },
      resultId: r.fingerprint,
      stored,
    }));
    setCog({ id: CORSI_TEST.id, fingerprint: r.fingerprint, stored });
  };
  const speedDone = (r: SpeedResult) => {
    const base = profile ?? createProfile("", []);
    const stored: CognitiveStoredResult = { kind: "processing", result: r };
    setProfile(recordCognitive(base, {
      id: PROCESSING_TEST.id, name: PROCESSING_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.correct} correct · ${r.rate}/min · ${r.observation}`, practiceIndex: r.practiceIndex,
      chc: { Gs: r.practiceIndex },
      resultId: r.fingerprint,
      stored,
    }));
    setCog({ id: PROCESSING_TEST.id, fingerprint: r.fingerprint, stored });
  };
  const adaptiveDone = (r: AdaptiveResult) => {
    const base = profile ?? createProfile("", []);
    const stored: CognitiveStoredResult = { kind: "adaptive", result: r };
    setProfile(recordCognitive(base, {
      id: ADAPTIVE_TEST.id, name: ADAPTIVE_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.observation} · level ${r.abilityLevel}`, practiceIndex: r.practiceIndex,
      chc: { Gf: r.practiceIndex },
      resultId: r.fingerprint,
      stored,
    }));
    setCog({ id: ADAPTIVE_TEST.id, fingerprint: r.fingerprint, stored });
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
      cognitive: { kind: "ability", testId: abilityTest.id, result: abilityResult },
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
    const pending: PendingResult = {
      instrumentId: cog.id,
      responses: {},
      fingerprint: cog.fingerprint,
      productId: "cognitive",
      cognitive: cog.stored,
    };
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
    setRestoredCognitive(null);
    setView("memory");
    top();
  };
  const startCorsi = () => {
    setRestoredCognitive(null);
    setView("corsi");
    top();
  };
  const startSpeed = () => {
    setRestoredCognitive(null);
    setView("speed");
    top();
  };
  const startAdaptive = () => {
    setRestoredCognitive(null);
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
      headline: `${dir} (D ${r.d.toFixed(2)})`,
    }));
  };
  const startCreativity = () => { setRestoredCognitive(null); setView("creativity"); top(); };
  const creativityDone = (r: CreativityResult) => {
    const base = profile ?? createProfile("", []);
    const stored: CognitiveStoredResult = { kind: "creativity", result: r };
    setProfile(recordCognitive(base, {
      id: CREATIVITY_TEST.id, name: CREATIVITY_TEST.name, takenAt: new Date().toISOString(),
      headline: `${r.fluency} uses · ${r.observation}`, practiceIndex: r.practiceIndex,
      resultId: r.fingerprint,
      stored,
    }));
    setCog({ id: CREATIVITY_TEST.id, fingerprint: r.fingerprint, stored });
  };

  const beginInstrument = (inst: Instrument) => {
    setInstrument(localizeInstrument(inst, locale));
    setResult(null);
    setReport(null);
    setError(null);
    setRoute(`#/explore/activity/${encodeURIComponent(inst.id)}/take`);
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
    setRoute("#/today", true);
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
    setRoute("#/today", true);
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
    if (profile) setProfile(recordResult(profile, instrument.id, responses, seed, scored.responseFingerprint));
    submitNorms(instrument.id, scored.scales); // opt-in, anonymous, fire-and-forget
    setView("calc");
    top();
  };
  const afterCalc = () => {
    if (autopilot.active) {
      setAutopilot((a) => ({ ...a, done: a.done + 1 }));
      setView("agent");
      top();
      return;
    }
    setRoute(packTotal > 0 ? "#/explore/path" : `#/my-atlas/result/${encodeURIComponent(result?.responseFingerprint ?? "latest")}`);
    setView(packTotal > 0 ? "packstep" : "result");
    top();
  };

  /* ── Atlas Autopilot — autonomous, narrated journey ─────────────────── */
  const startAutopilot = (plan?: string[]) => {
    if (!autopilotNext([], profile?.focus ?? [], {
      locale,
      plan,
      evidence: recommendationEvidence,
      consent: AUTONOMOUS_PROGRESS_CONSENT,
    })) return;
    setPack([]);
    setPackTotal(0);
    const total = plan && plan.length
      ? plan.filter((id) => !entries.some((e) => e.instrument.id === id)).length
      : autopilotLength(recommendationEntries);
    setAutopilot({ active: true, total: Math.max(1, total), done: 0, plan });
    setView("agent");
    top();
  };
  const agentContinue = () => {
    const next = autopilotNext([], profile?.focus ?? [], {
      locale,
      plan: autopilot.plan,
      evidence: recommendationEvidence,
      consent: AUTONOMOUS_PROGRESS_CONSENT,
    });
    const inst = next && getInstrument(next.instrumentId);
    if (inst) beginInstrument(inst);
    else finishAutopilot();
  };
  const finishAutopilot = () => {
    setAutopilot({ active: false, total: 0, done: 0 });
    if (entries.length) {
      setIntegrated(buildIntegratedProfile(entries, { name, locale }));
      setRoute("#/my-atlas/portrait");
      setView("integrated");
    } else {
      setRoute("#/today");
      setView("home");
    }
    top();
  };
  const pauseAutopilot = () => {
    setAutopilot({ active: false, total: 0, done: 0 });
    setRoute(result ? `#/my-atlas/result/${encodeURIComponent(result.responseFingerprint)}` : "#/today");
    setView(result ? "result" : "home");
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

  const showChrome = view !== "quiz" && view !== "calc" && view !== "ability" && view !== "memory" && view !== "corsi" && view !== "speed" && view !== "adaptive" && view !== "iat" && view !== "creativity" && view !== "agent";
  const primaryArea = primaryAreaFor(view);
  const primaryLabel = t(
    primaryArea === "today"
      ? "nav.today"
      : primaryArea === "atlas"
        ? "nav.myAtlas"
        : primaryArea === "explore"
          ? "nav.explore"
          : "nav.groups",
  );

  useEffect(() => {
    if (!showChrome) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view, showChrome]);

  // First-run: a goal-based onboarding wizard that previews the personalized roadmap.
  if (!profile && !skipOnb && view === "home") {
    return (
      <>
        <a className="skip-link" href="#main-content">{t("a11y.skip")}</a>
        <main id="main-content" aria-label={t("a11y.main")} tabIndex={-1}>
          <Onboarding
            onDone={completeOnboarding}
            onSkip={() => {
              setSkipOnb(true);
              goExplore();
            }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content">{t("a11y.skip")}</a>
      {showChrome && (
        <header className="topbar">
          <div className="container inner">
            <button className="brand" onClick={goHome} aria-label={`Psyche Atlas · ${t("nav.today")}`}>
              <span className="mark">🧭</span>
              <span className="name">Psyche <b>Atlas</b></span>
            </button>
            <nav className="navlinks primary-nav" aria-label={t("a11y.main")}>
              <button className={primaryArea === "today" ? "active" : ""} aria-current={primaryArea === "today" ? "page" : undefined} onClick={goHome}>{t("nav.today")}</button>
              <button className={primaryArea === "atlas" ? "active" : ""} aria-current={primaryArea === "atlas" ? "page" : undefined} onClick={goAtlas}>{t("nav.myAtlas")}</button>
              <button className={primaryArea === "explore" ? "active" : ""} aria-current={primaryArea === "explore" ? "page" : undefined} onClick={goExplore}>{t("nav.explore")}</button>
              <button className={primaryArea === "groups" ? "active" : ""} aria-current={primaryArea === "groups" ? "page" : undefined} onClick={goGroups}>{t("nav.groups")}</button>
            </nav>
            <div className="workspace-tools">
              <LanguageSwitcher />
              <ThemeToggle locale={locale} />
              {profile && <button className="theme-toggle" onClick={() => setSettingsOpen(true)} title={t("nav.settings")} aria-label={t("nav.settings")}>⚙</button>}
            </div>
          </div>
        </header>
      )}
      <p className="sr-only" role="status" aria-live="polite">{primaryLabel}</p>

      <main id="main-content" className="workspace-main" aria-label={t("a11y.main")} tabIndex={-1}>
      <Suspense fallback={<div className="app-loader" role="status" aria-label={t("a11y.loading")}><span className="app-loader-ring" /></div>}>

      {view === "home" && (
        <Home
          mode="today"
          entries={entries}
          name={name}
          focus={profile?.focus ?? []}
          streakDays={profile?.streak.days ?? 0}
          cognitiveCount={profile?.cognitiveHistory?.length ?? 0}
          onUpdateGoals={updateGoals}
          onAutopilot={startAutopilot}
          onStart={start}
          onCompatibility={goCompat}
          onIntegrated={entries.length ? goIntegrated : undefined}
          onStartPack={() => startPack(adaptivePack(recommendationEntries, profile?.focus ?? []))}
          onStartAbility={startAbility}
          onStartMemory={startMemory}
          onStartCorsi={startCorsi}
          onStartSpeed={startSpeed}
          onStartAdaptive={startAdaptive}
          onStartIat={startIat}
          onStartCreativity={startCreativity}
          onBattery={battery ? goBattery : undefined}
          initialTopic={initialFind?.topic}
          initialQuery={initialFind?.query}
          onInitialConsumed={() => setInitialFind(null)}
          onStudyTopic={goStudyTopic}
          practiceLog={profile?.practiceLog ?? []}
          onCompletePractice={completePractice}
          onExplore={goExplore}
          recommendationEvidence={recommendationEvidence}
          recommendationConsent={AUTONOMOUS_PROGRESS_CONSENT}
        />
      )}

      {view === "explore" && (
        <Home
          mode="explore"
          entries={entries}
          name={name}
          focus={profile?.focus ?? []}
          streakDays={profile?.streak.days ?? 0}
          cognitiveCount={profile?.cognitiveHistory?.length ?? 0}
          onUpdateGoals={updateGoals}
          onAutopilot={startAutopilot}
          onStart={start}
          onCompatibility={goCompat}
          onIntegrated={entries.length ? goIntegrated : undefined}
          onStartPack={() => startPack(adaptivePack(recommendationEntries, profile?.focus ?? []))}
          onStartAbility={startAbility}
          onStartMemory={startMemory}
          onStartCorsi={startCorsi}
          onStartSpeed={startSpeed}
          onStartAdaptive={startAdaptive}
          onStartIat={startIat}
          onStartCreativity={startCreativity}
          onBattery={battery ? goBattery : undefined}
          initialTopic={initialFind?.topic}
          initialQuery={initialFind?.query}
          onInitialConsumed={() => setInitialFind(null)}
          onStudyTopic={goStudyTopic}
          practiceLog={profile?.practiceLog ?? []}
          onCompletePractice={completePractice}
          onExplore={goExplore}
          recommendationEvidence={recommendationEvidence}
          recommendationConsent={AUTONOMOUS_PROGRESS_CONSENT}
        />
      )}

      {view === "atlas" && (
        <AtlasOverview
          entries={entries}
          cognitiveCount={profile?.cognitiveHistory?.length ?? 0}
          focus={profile?.focus ?? []}
          hasBattery={!!battery}
          onPortrait={goIntegrated}
          onJourney={profile ? goGrowth : goExplore}
          onBattery={battery ? goBattery : goExplore}
          onExplore={goExplore}
        />
      )}

      {view === "groups" && <GroupsHub onStudy={goStudy} onConnectionMap={goCompat} />}

      {view === "ability" && abilityTest && (
        <AbilityFlow key={`${abilityTest.id}-${abilityNonce}`} test={abilityTest} onExit={goExplore} onComplete={abilityDone} />
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
          onExit={goExplore}
        />
      )}

      {view === "memory" && <MemoryFlow key={restoredCognitive?.kind === "memory" ? cog?.fingerprint : "memory-live"} name={name} onExit={goExplore} onComplete={memoryDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy}
        initialResult={restoredCognitive?.kind === "memory" ? restoredCognitive.result : undefined} />}

      {view === "corsi" && <CorsiFlow key={restoredCognitive?.kind === "corsi" ? cog?.fingerprint : "corsi-live"} name={name} onExit={goExplore} onComplete={corsiDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy}
        initialResult={restoredCognitive?.kind === "corsi" ? restoredCognitive.result : undefined} />}

      {view === "speed" && <SpeedFlow key={restoredCognitive?.kind === "processing" ? cog?.fingerprint : "speed-live"} name={name} onExit={goExplore} onComplete={speedDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy}
        initialResult={restoredCognitive?.kind === "processing" ? restoredCognitive.result : undefined} />}

      {view === "adaptive" && <AdaptiveFlow key={restoredCognitive?.kind === "adaptive" ? cog?.fingerprint : "adaptive-live"} name={name} onExit={goExplore} onComplete={adaptiveDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy}
        initialResult={restoredCognitive?.kind === "adaptive" ? restoredCognitive.result : undefined} />}

      {view === "iat" && <IatFlow name={name} onExit={goExplore} onComplete={iatDone} />}

      {view === "creativity" && <CreativityFlow key={restoredCognitive?.kind === "creativity" ? cog?.fingerprint : "creativity-live"} name={name} onExit={goExplore} onComplete={creativityDone} unlocked={cogUnlocked} onPurchase={onPurchaseCognition} busy={busy}
        initialResult={restoredCognitive?.kind === "creativity" ? restoredCognitive.result : undefined} />}

      {view === "battery" && battery && (
        <BatteryView battery={battery} takes={profile?.cognitiveHistory ?? []} name={name} onExit={goAtlas} />
      )}

      {view === "admin" && <AdminNorms onBack={goHome} />}

      {view === "intro" && instrument && (
        <Intro instrument={instrument} initialName={name} entries={entries} onBegin={beginQuiz} onBack={goExplore} />
      )}

      {view === "quiz" && instrument && <Quiz instrument={instrument} onComplete={complete} onCancel={goExplore} />}

      {view === "calc" && <Calculating onDone={afterCalc} />}

      {view === "result" && instrument && result && report && (
        unlocked ? (
          <Report
            instrument={instrument}
            result={result}
            report={report}
            entries={entries}
            onRegenerate={regenerate}
            onRestart={goExplore}
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
            onRestart={goExplore}
            busy={busy}
            error={error}
          />
        )
      )}

      {view === "integrated" && integrated && <IntegratedProfile ip={integrated} entries={entries} onBack={goAtlas} onBrowse={goExplore} cognitive={profile?.cognitiveHistory} />}

      {view === "compatibility" && (
        <Compatibility instrument={instrument} result={result} onStart={start} onBack={goGroups} />
      )}

      {view === "study" && (
        <Study
          name={name}
          entries={entries}
          onStart={start}
          onAutopilot={startAutopilot}
          onBack={goGroups}
          joinRoom={joinRoom}
          seed={studySeed}
        />
      )}

      {view === "agent" && (() => {
        const next = autopilot.done < autopilot.total ? autopilotNext([], profile?.focus ?? [], {
          locale,
          plan: autopilot.plan,
          evidence: recommendationEvidence,
          consent: AUTONOMOUS_PROGRESS_CONSENT,
        }) : null;
        if (!next) {
          return (
            <div className="container view-enter">
              <section className="agent-stage">
                <div className="agent-aura" aria-hidden="true" />
                <span className="agent-eyebrow"><span className="cmp-dot" /> {autopilotNextUp(locale)}</span>
                <h1 className="agent-head">{t("agent.done")}</h1>
                <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 460, margin: "0 auto 26px" }}>{t("agent.doneSub")}</p>
                <button className="glass-btn primary agent-go" onClick={finishAutopilot}>{t("agent.seePortrait")}</button>
              </section>
            </div>
          );
        }
        return (
          <AgentStep
            brief={agentBrief(recommendationEntries, next, autopilot.done + 1, autopilot.total, { locale })}
            nextUpLabel={autopilotNextUp(locale)}
            onContinue={agentContinue}
            onPause={pauseAutopilot}
          />
        );
      })()}

      {view === "growth" && profile && (
        <Growth
          profile={profile}
          onBrowse={goExplore}
          onBack={goAtlas}
          onBattery={battery ? goBattery : undefined}
          onOpenResult={openSavedResult}
          onOpenCognitive={openSavedCognitive}
          onImport={(p) => { saveProfile(p); setProfile(p); top(); }}
        />
      )}

      {view === "packstep" && report && (
        <PackStep report={report} done={packTotal - pack.length} total={packTotal} name={name} onContinue={packNext} onSkip={skipPack} />
      )}
      </Suspense>
      </main>

      {["home", "atlas", "explore", "groups", "integrated", "growth", "compatibility", "battery"].includes(view) && (
        <CoachDock entries={entries} name={name} />
      )}

      {settingsOpen && profile && (
        <Settings profile={profile} onSaveName={saveName} onReset={resetAll} onClose={() => setSettingsOpen(false)} />
      )}
      {showChrome && (
        <nav className="mobile-dock" aria-label={t("a11y.main")}>
          <button className={primaryArea === "today" ? "active" : ""} aria-current={primaryArea === "today" ? "page" : undefined} onClick={goHome}>
            <span aria-hidden="true">☀</span>{t("nav.today")}
          </button>
          <button className={primaryArea === "atlas" ? "active" : ""} aria-current={primaryArea === "atlas" ? "page" : undefined} onClick={goAtlas}>
            <span aria-hidden="true">◈</span>{t("nav.myAtlas")}
          </button>
          <button className={primaryArea === "explore" ? "active" : ""} aria-current={primaryArea === "explore" ? "page" : undefined} onClick={goExplore}>
            <span aria-hidden="true">⌕</span>{t("nav.explore")}
          </button>
          <button className={primaryArea === "groups" ? "active" : ""} aria-current={primaryArea === "groups" ? "page" : undefined} onClick={goGroups}>
            <span aria-hidden="true">◎</span>{t("nav.groups")}
          </button>
        </nav>
      )}
    </>
  );
}
