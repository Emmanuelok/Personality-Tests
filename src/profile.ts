import type { ResponseMap } from "@core/types";
import { newResultId } from "@core/prng";
import type { AbilityResult } from "@core/ability";
import type { MemoryResult } from "@core/ability/memory";
import type { SpeedResult } from "@core/ability/processing";
import type { AdaptiveResult } from "@core/ability/adaptive";
import type { CreativityResult } from "@core/ability/creativity";

/**
 * The user's persistent personal space. Psyche Atlas remembers you: your name,
 * every assessment you've taken, your reflections, and your growth streak — all
 * stored locally on your device (no account, no server). This is what makes the
 * platform feel built for one specific person: you.
 */

const KEY = "psyche.profile.v2";

export interface SavedResult {
  instrumentId: string;
  takenAt: string; // ISO
  responses: ResponseMap;
  /** Stable seed so the dashboard headline/report stays consistent for this take. */
  seed: number;
  /** Opaque random id used for durable access and purchases. */
  resultId: string;
}

export interface JournalEntry {
  at: string;
  text: string;
  mood?: number; // 1..5
}

/** A completed cognitive-ability or memory test (right/wrong tests live outside `history`). */
export type CognitiveStoredResult =
  | { kind: "ability"; testId: string; result: AbilityResult }
  | { kind: "memory"; result: MemoryResult }
  | { kind: "corsi"; result: MemoryResult }
  | { kind: "processing"; result: SpeedResult }
  | { kind: "adaptive"; result: AdaptiveResult }
  | { kind: "creativity"; result: CreativityResult };

export interface CognitiveTake {
  id: string;
  name: string;
  takenAt: string; // ISO
  /** A bounded practice observation, never an IQ estimate or fixed-ability label. */
  headline: string; // e.g. "Strong accuracy in this practice session"
  /** Criterion-referenced position within this activity, not a population rank. */
  practiceIndex?: number;
  /** CHC broad-ability contributions (factor id → task-specific practice index). */
  chc?: Record<string, number>;
  /** Opaque id used to reopen this exact local result and its entitlement. */
  resultId?: string;
  /** Local result snapshot; included only in the passphrase-encrypted full backup. */
  stored?: CognitiveStoredResult;
}

export interface PrivacyChoices {
  /** External AI is off until the learner explicitly enables it for a request. */
  externalAI: boolean;
  /** Anonymous norm contribution is separately opt-in. */
  contributeToNorms: boolean;
  /** Reflective evidence is not used for autonomous recommendations by default. */
  reflectiveRecommendations: boolean;
  updatedAt: string;
}

export interface Profile {
  name: string;
  pronoun?: string;
  createdAt: string;
  /** Goals chosen during onboarding (self-discovery, growth, relationships, career…). */
  focus: string[];
  /** All assessment takes, newest first. */
  history: SavedResult[];
  /** Cognitive-ability / memory test takes, newest first. */
  cognitiveHistory?: CognitiveTake[];
  journal: JournalEntry[];
  streak: { last: string; days: number };
  /** ISO dates (YYYY-MM-DD) on which the user completed a coach practice. */
  practiceLog?: string[];
  /** Privacy choices stay local and default to the least-disclosing behavior. */
  privacy?: PrivacyChoices;
}

const RESULT_ID_PATTERN = /^(?:(?:rid1_|fp1_)[a-f0-9]{64}|[a-f0-9]{14})$/;
const isoNow = () => new Date().toISOString();
const cleanDate = (value: unknown, fallback = isoNow()): string =>
  typeof value === "string" && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : fallback;
const cleanString = (value: unknown, max: number, fallback = ""): string =>
  typeof value === "string" ? value.trim().slice(0, max) : fallback;
const cleanNumber = (value: unknown, min: number, max: number, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback;

function cleanNumberRecord(value: unknown, maxEntries = 500): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: Record<string, number> = {};
  for (const [key, item] of Object.entries(value).slice(0, maxEntries)) {
    if (!key || key.length > 80 || typeof item !== "number" || !Number.isFinite(item)) continue;
    output[key] = Math.max(-1, Math.min(10_000, item));
  }
  return output;
}

function normalizeStoredCognitive(value: unknown, resultId?: string): CognitiveStoredResult | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as { kind?: unknown; testId?: unknown; result?: unknown };
  if (!raw.result || typeof raw.result !== "object" || Array.isArray(raw.result)) return undefined;
  const result = raw.result as Record<string, unknown>;
  const fingerprint = typeof result.fingerprint === "string" && RESULT_ID_PATTERN.test(result.fingerprint)
    ? result.fingerprint
    : "";
  if (!fingerprint || (resultId && fingerprint !== resultId)) return undefined;
  const observation = cleanString(result.observation, 500, "Practice snapshot");
  const practiceIndex = Math.round(cleanNumber(result.practiceIndex, 0, 100));

  if (raw.kind === "ability") {
    const testId = cleanString(raw.testId, 80);
    if (!testId || !Array.isArray(result.perDomain)) return undefined;
    const perDomain = result.perDomain.slice(0, 30).flatMap((candidate) => {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
      const domain = candidate as Record<string, unknown>;
      const id = cleanString(domain.domain, 80);
      const name = cleanString(domain.name, 120);
      if (!id || !name) return [];
      const total = Math.round(cleanNumber(domain.total, 0, 1_000));
      const correct = Math.round(cleanNumber(domain.correct, 0, total));
      return [{
        domain: id,
        name,
        correct,
        total,
        pct: Math.round(cleanNumber(domain.pct, 0, 100)),
        practiceIndex: Math.round(cleanNumber(domain.practiceIndex, 0, 100)),
        observation: cleanString(domain.observation, 500, "Practice snapshot"),
      }];
    });
    const total = Math.round(cleanNumber(result.total, 0, 10_000));
    return {
      kind: "ability",
      testId,
      result: {
        testId,
        responses: cleanNumberRecord(result.responses),
        correct: Math.round(cleanNumber(result.correct, 0, total)),
        total,
        perDomain,
        practiceIndex,
        observation,
        fingerprint,
      },
    };
  }

  if (raw.kind === "memory" || raw.kind === "corsi") {
    if (!Array.isArray(result.trials)) return undefined;
    const trials = result.trials.slice(0, 100).flatMap((candidate) => {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
      const trial = candidate as Record<string, unknown>;
      const mode = trial.mode === "forward"
        ? "forward" as const
        : trial.mode === "backward"
          ? "backward" as const
          : null;
      if (!mode) return [];
      return [{
        mode,
        span: Math.round(cleanNumber(trial.span, 0, 100)),
        shown: cleanString(trial.shown, 200),
        entered: cleanString(trial.entered, 200),
        correct: trial.correct === true,
      }];
    });
    return {
      kind: raw.kind,
      result: {
        trials,
        maxForward: Math.round(cleanNumber(result.maxForward, 0, 100)),
        maxBackward: Math.round(cleanNumber(result.maxBackward, 0, 100)),
        forwardCorrect: Math.round(cleanNumber(result.forwardCorrect, 0, trials.length)),
        backwardCorrect: Math.round(cleanNumber(result.backwardCorrect, 0, trials.length)),
        practiceIndex,
        observation,
        fingerprint,
      },
    };
  }

  if (raw.kind === "processing") {
    const attempted = Math.round(cleanNumber(result.attempted, 0, 100_000));
    return {
      kind: "processing",
      result: {
        correct: Math.round(cleanNumber(result.correct, 0, attempted)),
        errors: Math.round(cleanNumber(result.errors, 0, attempted)),
        attempted,
        durationSec: cleanNumber(result.durationSec, 0, 86_400),
        rate: cleanNumber(result.rate, 0, 100_000),
        practiceIndex,
        observation,
        fingerprint,
      },
    };
  }

  if (raw.kind === "adaptive") {
    const trials = Array.isArray(result.trials)
      ? result.trials.slice(0, 100).flatMap((candidate) => {
        if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
        const trial = candidate as Record<string, unknown>;
        return [{
          level: Math.round(cleanNumber(trial.level, 0, 100)),
          correct: trial.correct === true,
        }];
      })
      : [];
    return {
      kind: "adaptive",
      result: {
        trials,
        abilityLevel: cleanNumber(result.abilityLevel, 0, 100),
        correct: Math.round(cleanNumber(result.correct, 0, trials.length)),
        total: Math.round(cleanNumber(result.total, 0, trials.length)),
        practiceIndex,
        observation,
        fingerprint,
      },
    };
  }

  if (raw.kind === "creativity") {
    const prompts = Array.isArray(result.prompts)
      ? result.prompts.slice(0, 20).flatMap((candidate) => {
        if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
        const prompt = candidate as Record<string, unknown>;
        const label = cleanString(prompt.prompt, 200);
        if (!label || !Array.isArray(prompt.uses)) return [];
        return [{
          prompt: label,
          uses: prompt.uses
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim().slice(0, 500))
            .filter(Boolean)
            .slice(0, 200),
        }];
      })
      : [];
    return {
      kind: "creativity",
      result: {
        prompts,
        fluency: Math.round(cleanNumber(result.fluency, 0, 100_000)),
        practiceIndex,
        observation,
        fingerprint,
      },
    };
  }
  return undefined;
}

function normalizeCognitiveHistory(value: unknown): CognitiveTake[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 100)
    .flatMap((candidate) => {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
      const take = candidate as Partial<CognitiveTake> & { percentile?: unknown };
      const id = cleanString(take.id, 80);
      if (!id) return [];
      const legacy = typeof take.percentile === "number" && Number.isFinite(take.percentile)
        ? take.percentile
        : undefined;
      const current = typeof take.practiceIndex === "number" && Number.isFinite(take.practiceIndex)
        ? take.practiceIndex
        : legacy;
      const resultId = typeof take.resultId === "string" && RESULT_ID_PATTERN.test(take.resultId)
        ? take.resultId
        : undefined;
      const chc = cleanNumberRecord(take.chc, 30);
      return [{
        id,
        name: cleanString(take.name, 120, "Learning practice"),
        takenAt: cleanDate(take.takenAt),
        headline: cleanString(take.headline, 500, "Practice snapshot"),
        practiceIndex: current == null ? undefined : Math.max(0, Math.min(100, current)),
        chc: Object.keys(chc).length ? chc : undefined,
        resultId,
        stored: normalizeStoredCognitive(take.stored, resultId),
      }];
    });
}

function normalizeHistory(value: unknown): SavedResult[] {
  if (!Array.isArray(value)) return [];
  const output: SavedResult[] = [];
  for (const candidate of value.slice(0, 200)) {
    if (!candidate || typeof candidate !== "object") continue;
    const raw = candidate as Partial<SavedResult>;
    if (typeof raw.instrumentId !== "string" || !raw.instrumentId.trim()) continue;
    if (!raw.responses || typeof raw.responses !== "object" || Array.isArray(raw.responses)) continue;
    const responses: ResponseMap = {};
    let valid = true;
    for (const [itemId, answer] of Object.entries(raw.responses).slice(0, 500)) {
      if (!itemId || itemId.length > 80 || typeof answer !== "number" || !Number.isFinite(answer)) {
        valid = false;
        break;
      }
      responses[itemId] = answer;
    }
    if (!valid) continue;
    const takenAt = typeof raw.takenAt === "string" && Number.isFinite(Date.parse(raw.takenAt))
      ? new Date(raw.takenAt).toISOString()
      : new Date().toISOString();
    const seed = typeof raw.seed === "number" && Number.isFinite(raw.seed) ? raw.seed : 0;
    const resultId = typeof raw.resultId === "string" && RESULT_ID_PATTERN.test(raw.resultId)
      ? raw.resultId
      : newResultId();
    output.push({
      instrumentId: raw.instrumentId.trim().slice(0, 80),
      takenAt,
      responses,
      seed,
      resultId,
    });
  }
  return output;
}

function normalizeProfile(value: unknown): Profile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Partial<Profile>;
  if (typeof raw.name !== "string" || !Array.isArray(raw.history)) return null;
  const now = isoNow();
  const focus = Array.isArray(raw.focus)
    ? [...new Set(raw.focus
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().slice(0, 60))
      .filter(Boolean))]
      .slice(0, 12)
    : [];
  const journal = Array.isArray(raw.journal)
    ? raw.journal
      .slice(0, 500)
      .flatMap((candidate) => {
        if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
        const entry = candidate as Partial<JournalEntry>;
        const text = cleanString(entry.text, 4_000);
        if (!text) return [];
        return [{
          at: cleanDate(entry.at),
          text,
          mood: typeof entry.mood === "number" && Number.isFinite(entry.mood)
            ? Math.max(1, Math.min(5, Math.round(entry.mood)))
            : undefined,
        }];
      })
    : [];
  const practiceLog = Array.isArray(raw.practiceLog)
    ? [...new Set(raw.practiceLog
      .filter((item): item is string => typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item))
      .slice(0, 400))]
    : [];
  const streakValue = raw.streak && typeof raw.streak === "object" ? raw.streak : undefined;
  const privacyValue = raw.privacy && typeof raw.privacy === "object" ? raw.privacy : undefined;
  return {
    name: cleanString(raw.name, 40, "Learner") || "Learner",
    pronoun: cleanString(raw.pronoun, 30) || undefined,
    createdAt: cleanDate(raw.createdAt, now),
    focus,
    history: normalizeHistory(raw.history),
    cognitiveHistory: normalizeCognitiveHistory(raw.cognitiveHistory),
    journal,
    streak: {
      last: typeof streakValue?.last === "string" && /^\d{4}-\d{2}-\d{2}$/.test(streakValue.last)
        ? streakValue.last
        : now.slice(0, 10),
      days: Math.round(cleanNumber(streakValue?.days, 1, 10_000, 1)),
    },
    practiceLog,
    privacy: {
      externalAI: privacyValue?.externalAI === true,
      contributeToNorms: privacyValue?.contributeToNorms === true,
      reflectiveRecommendations: privacyValue?.reflectiveRecommendations === true,
      updatedAt: cleanDate(privacyValue?.updatedAt, now),
    },
  };
}

function read(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalizeProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function loadProfile(): Profile | null {
  return read();
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full / disabled — ignore */
  }
}

export function createProfile(name: string, focus: string[], pronoun?: string): Profile {
  const now = new Date().toISOString();
  const p: Profile = {
    name: name.trim().slice(0, 40) || "Learner",
    pronoun: pronoun?.trim().slice(0, 30) || undefined,
    createdAt: now,
    focus: [...new Set(focus.filter((value): value is string => typeof value === "string").map((value) => value.trim().slice(0, 60)).filter(Boolean))].slice(0, 12),
    history: [],
    journal: [],
    streak: { last: now.slice(0, 10), days: 1 },
    privacy: {
      externalAI: false,
      contributeToNorms: false,
      reflectiveRecommendations: false,
      updatedAt: now,
    },
  };
  saveProfile(p);
  return p;
}

function dayString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Update the daily-visit streak (call when the user is active). */
export function touchStreak(p: Profile): Profile {
  const today = dayString();
  if (p.streak.last === today) return p;
  const last = new Date(p.streak.last + "T00:00:00Z").getTime();
  const diff = Math.round((new Date(today + "T00:00:00Z").getTime() - last) / 86400000);
  const days = diff === 1 ? p.streak.days + 1 : 1;
  const next = { ...p, streak: { last: today, days } };
  saveProfile(next);
  return next;
}

/** Record an assessment take (keeps full history; newest first). */
export function recordResult(
  p: Profile,
  instrumentId: string,
  responses: ResponseMap,
  seed: number,
  resultId = newResultId(),
): Profile {
  const entry: SavedResult = { instrumentId, takenAt: new Date().toISOString(), responses, seed, resultId };
  const next = { ...p, history: [entry, ...p.history].slice(0, 200) };
  saveProfile(next);
  return next;
}

/** Record a cognitive-ability or memory take (newest first). */
export function recordCognitive(p: Profile, take: CognitiveTake): Profile {
  const next = { ...p, cognitiveHistory: [take, ...(p.cognitiveHistory ?? [])].slice(0, 100) };
  saveProfile(next);
  return next;
}

export function latestResult(p: Profile, instrumentId: string): SavedResult | undefined {
  return p.history.find((h) => h.instrumentId === instrumentId);
}

/** Unique instrument ids the user has completed, most-recent first. */
export function completedInstrumentIds(p: Profile): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of p.history) {
    if (!seen.has(h.instrumentId)) {
      seen.add(h.instrumentId);
      out.push(h.instrumentId);
    }
  }
  return out;
}

/** Mark today's coach practice complete (idempotent per day). Feeds the practice streak. */
export function recordPractice(p: Profile, date = new Date()): Profile {
  const day = date.toISOString().slice(0, 10);
  if (p.practiceLog?.includes(day)) return p;
  const next = { ...p, practiceLog: [day, ...(p.practiceLog ?? [])].slice(0, 400) };
  saveProfile(next);
  return next;
}

export function addJournal(p: Profile, entry: JournalEntry): Profile {
  const clean: JournalEntry = {
    at: entry.at,
    text: entry.text.trim().slice(0, 4_000),
    mood: typeof entry.mood === "number" ? Math.max(1, Math.min(5, Math.round(entry.mood))) : undefined,
  };
  const next = { ...p, journal: [clean, ...p.journal].slice(0, 500) };
  saveProfile(next);
  return next;
}

export function updatePrivacy(p: Profile, changes: Partial<Omit<PrivacyChoices, "updatedAt">>): Profile {
  const current: PrivacyChoices = p.privacy ?? {
    externalAI: false,
    contributeToNorms: false,
    reflectiveRecommendations: false,
    updatedAt: p.createdAt,
  };
  const next: Profile = {
    ...p,
    privacy: {
      externalAI: changes.externalAI ?? current.externalAI,
      contributeToNorms: changes.contributeToNorms ?? current.contributeToNorms,
      reflectiveRecommendations: changes.reflectiveRecommendations ?? current.reflectiveRecommendations,
      updatedAt: new Date().toISOString(),
    },
  };
  saveProfile(next);
  return next;
}

/* ── Account-free backup / sync (a portable code, no server) ────────────── */

const CODE_PREFIX = "PA1:";
const ENCRYPTED_CODE_PREFIX = "PAE2:";

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

/** Encode the whole profile into a portable, copy-pasteable code. */
export function exportProfileCode(p: Profile): string {
  try {
    return CODE_PREFIX + btoa(encodeURIComponent(JSON.stringify(p)));
  } catch {
    return "";
  }
}

/**
 * Encrypt the complete local profile for portable backup.
 *
 * The passphrase is never stored or transmitted. AES-GCM protects contents and
 * integrity; PBKDF2 makes short passphrase guesses more expensive.
 */
export async function exportEncryptedProfileCode(p: Profile, passphrase: string): Promise<string> {
  const secret = passphrase.trim();
  if (secret.length < 10 || secret.length > 200) throw new Error("Passphrase must be 10–200 characters.");
  if (!globalThis.crypto?.subtle) throw new Error("Encrypted backup is unavailable in this browser.");
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 210_000 },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const plaintext = encoder.encode(JSON.stringify(p));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const packed = new Uint8Array(salt.length + iv.length + ciphertext.length);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(ciphertext, salt.length + iv.length);
  return ENCRYPTED_CODE_PREFIX + bytesToBase64Url(packed);
}

export async function importEncryptedProfileCode(code: string, passphrase: string): Promise<Profile | null> {
  try {
    const trimmed = code.trim();
    const secret = passphrase.trim();
    if (!trimmed.startsWith(ENCRYPTED_CODE_PREFIX) || trimmed.length > 2_000_000 || secret.length < 10 || secret.length > 200) return null;
    if (!globalThis.crypto?.subtle) return null;
    const packed = base64UrlToBytes(trimmed.slice(ENCRYPTED_CODE_PREFIX.length));
    if (packed.length < 16 + 12 + 16) return null;
    const salt = packed.slice(0, 16);
    const iv = packed.slice(16, 28);
    const ciphertext = packed.slice(28);
    const encoder = new TextEncoder();
    const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: 210_000 },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    const json = new TextDecoder().decode(plaintext);
    // Reuse the strict legacy payload validator after decryption.
    return importProfileCode(CODE_PREFIX + btoa(encodeURIComponent(json)));
  } catch {
    return null;
  }
}

/** Decode a profile code back into a Profile (returns null if invalid). */
export function importProfileCode(code: string): Profile | null {
  try {
    const trimmed = code.trim();
    if (!trimmed || trimmed.length > 2_000_000) return null;
    const raw = trimmed.startsWith(CODE_PREFIX) ? trimmed.slice(CODE_PREFIX.length) : trimmed;
    const parsed: unknown = JSON.parse(decodeURIComponent(atob(raw)));
    return normalizeProfile(parsed);
  } catch {
    /* malformed code */
  }
  return null;
}

export function resetProfile(): void {
  try {
    // Remove every learner-data surface, including orphaned room-member records.
    // Appearance/language preferences and verified purchase entitlements are
    // deliberately preserved; the server-issued recovery credential is HttpOnly.
    const exactKeys = [
      KEY,
      "psyche.calib.consent",
      "psyche-rooms",
      "psyche-collab-profile",
    ];
    for (const key of exactKeys) localStorage.removeItem(key);
    const roomMemberKeys: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith("psyche-room-mem-")) roomMemberKeys.push(key);
    }
    for (const key of roomMemberKeys) localStorage.removeItem(key);

    sessionStorage.removeItem("psyche.pending.v1");
    sessionStorage.removeItem("psyche.ask-atlas.v1");
  } catch {
    /* ignore */
  }
}
