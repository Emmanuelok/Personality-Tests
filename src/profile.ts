import type { ResponseMap } from "@core/types";

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
}

export interface JournalEntry {
  at: string;
  text: string;
  mood?: number; // 1..5
}

/** A completed cognitive-ability or memory test (right/wrong tests live outside `history`). */
export interface CognitiveTake {
  id: string;
  name: string;
  takenAt: string; // ISO
  headline: string; // e.g. "Above-average range · 112–124"
  percentile: number;
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
}

function read(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
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
    name: name.trim().slice(0, 40) || "Friend",
    pronoun,
    createdAt: now,
    focus,
    history: [],
    journal: [],
    streak: { last: now.slice(0, 10), days: 1 },
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
export function recordResult(p: Profile, instrumentId: string, responses: ResponseMap, seed: number): Profile {
  const entry: SavedResult = { instrumentId, takenAt: new Date().toISOString(), responses, seed };
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

export function addJournal(p: Profile, entry: JournalEntry): Profile {
  const next = { ...p, journal: [entry, ...p.journal].slice(0, 500) };
  saveProfile(next);
  return next;
}

export function resetProfile(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
