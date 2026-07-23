/**
 * Evidence governance shared by every recommendation engine.
 *
 * Evidence tiers describe what the product may do with a record, not how
 * "important" the person or result is:
 *
 * - actionable: may support an explanation or a suggested next step.
 * - reflective: may be revisited in a user-led reflection, but never silently
 *   turned into a task, mission, notification, or autopilot choice.
 * - private: remains user-controlled. It may be shown back to the user, but is
 *   excluded from interpretation, recommendation, routing, and sharing.
 *
 * Sensitive records add a second guardrail. Even when their tier is actionable,
 * they cannot be used by an autonomous run. A user must deliberately initiate
 * the use and grant sensitive-data consent.
 */

import type { SynthEntry } from "./synthesis";

export const EVIDENCE_TIERS = ["actionable", "reflective", "private"] as const;
export type EvidenceTier = (typeof EVIDENCE_TIERS)[number];

export type EvidenceSource =
  | "assessment"
  | "practice"
  | "progress"
  | "goal"
  | "reflection"
  | "context"
  | "user";

export interface EvidenceRecord<T = unknown> {
  id: string;
  tier: EvidenceTier;
  source: EvidenceSource;
  /** A short, non-sensitive label suitable for a transparent evidence list. */
  summary: string;
  /** Local-only data. Policy checks happen before this value is read. */
  payload?: T;
  collectedAt?: string;
  /** Sensitive data is never available to autonomous runs, regardless of tier. */
  sensitive?: boolean;
  /** Optional tags used for deterministic matching; they must not contain secrets. */
  tags?: string[];
}

export interface EvidenceConsent {
  actionable: boolean;
  reflective: boolean;
  private: boolean;
  sensitive: boolean;
  /** Sharing is separately opt-in and is never implied by another permission. */
  sharing: boolean;
}

export const NO_EVIDENCE_CONSENT: Readonly<EvidenceConsent> = Object.freeze({
  actionable: false,
  reflective: false,
  private: false,
  sensitive: false,
  sharing: false,
});

export function evidenceConsent(overrides: Partial<EvidenceConsent> = {}): EvidenceConsent {
  return { ...NO_EVIDENCE_CONSENT, ...overrides };
}

export type EvidenceUse =
  | "view"
  | "reflect"
  | "interpret"
  | "recommend"
  | "route-practice"
  | "share";

export type AutonomyMode = "user-led" | "autonomous";

export type EvidenceDenialReason =
  | "missing-tier-consent"
  | "sensitive-consent-required"
  | "sensitive-autonomy-block"
  | "reflective-routing-block"
  | "private-use-block"
  | "autonomous-sharing-block"
  | "sharing-consent-required";

export interface EvidenceDecision {
  evidenceId: string;
  allowed: boolean;
  reason?: EvidenceDenialReason;
}

export interface EvidenceSelection<T = unknown> {
  allowed: EvidenceRecord<T>[];
  excluded: EvidenceDecision[];
}

const tierConsented = (tier: EvidenceTier, consent: EvidenceConsent): boolean =>
  tier === "actionable"
    ? consent.actionable
    : tier === "reflective"
      ? consent.reflective
      : consent.private;

/**
 * Decide whether one record may be used for one clearly named purpose.
 *
 * `view` means returning an already-known record to its owner. It is the only
 * operation private evidence can support, and still requires private consent.
 */
export function evidenceDecision(
  record: EvidenceRecord,
  use: EvidenceUse,
  consent: EvidenceConsent,
  mode: AutonomyMode = "user-led",
): EvidenceDecision {
  if (!tierConsented(record.tier, consent)) {
    return { evidenceId: record.id, allowed: false, reason: "missing-tier-consent" };
  }

  if (record.sensitive) {
    if (mode === "autonomous") {
      return { evidenceId: record.id, allowed: false, reason: "sensitive-autonomy-block" };
    }
    if (!consent.sensitive) {
      return { evidenceId: record.id, allowed: false, reason: "sensitive-consent-required" };
    }
  }

  if (record.tier === "private" && use !== "view") {
    return { evidenceId: record.id, allowed: false, reason: "private-use-block" };
  }

  if (
    record.tier === "reflective" &&
    (mode === "autonomous" || use === "recommend" || use === "route-practice" || use === "share")
  ) {
    return { evidenceId: record.id, allowed: false, reason: "reflective-routing-block" };
  }

  if (use === "share") {
    if (mode === "autonomous") {
      return { evidenceId: record.id, allowed: false, reason: "autonomous-sharing-block" };
    }
    if (!consent.sharing) {
      return { evidenceId: record.id, allowed: false, reason: "sharing-consent-required" };
    }
  }

  return { evidenceId: record.id, allowed: true };
}

/** Filter without mutating, reading payloads, or changing caller order. */
export function selectEvidence<T>(
  records: readonly EvidenceRecord<T>[],
  use: EvidenceUse,
  consent: EvidenceConsent,
  mode: AutonomyMode = "user-led",
): EvidenceSelection<T> {
  const allowed: EvidenceRecord<T>[] = [];
  const excluded: EvidenceDecision[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    const decision = evidenceDecision(record, use, consent, mode);
    if (decision.allowed) allowed.push(record);
    else excluded.push(decision);
  }

  return { allowed, excluded };
}

/** Only ids and summaries cross the boundary into recommendation explanations. */
export interface EvidenceReference {
  id: string;
  tier: Exclude<EvidenceTier, "private">;
  source: EvidenceSource;
  summary: string;
}

export function toEvidenceReference(record: EvidenceRecord): EvidenceReference | null {
  if (record.tier === "private" || record.sensitive) return null;
  return {
    id: record.id,
    tier: record.tier,
    source: record.source,
    summary: record.summary,
  };
}

/** Actionable records that an autopilot/recommender may safely use. */
export function autonomousEvidence<T>(
  records: readonly EvidenceRecord<T>[],
  consent: EvidenceConsent,
): EvidenceSelection<T> {
  const selected = selectEvidence(records, "route-practice", consent, "autonomous");
  return {
    allowed: selected.allowed.filter((record) => record.tier === "actionable"),
    excluded: selected.excluded,
  };
}

/**
 * Build the least-disclosing evidence set needed for progress-aware routing.
 *
 * Recommendation engines can see which learning activities were completed, but
 * not answers, scale values, type resolutions, or response fingerprints.
 * Reflective result interpretation stays on user-led report surfaces.
 */
export function completionEvidence(entries: readonly SynthEntry[]): EvidenceRecord<SynthEntry>[] {
  return entries.map(({ instrument, result }) => ({
    id: `completion:${instrument.id}`,
    tier: "actionable",
    source: "progress",
    summary: `Completed ${instrument.name}`,
    collectedAt: result.takenAt,
    payload: {
      instrument,
      result: {
        instrumentId: result.instrumentId,
        takenAt: result.takenAt,
        responses: {},
        scales: {},
        responseFingerprint: `completion:${instrument.id}`,
      },
    },
  }));
}

/** Extract only records policy allows an autonomous router to use. */
export function autonomousEntries(
  records: readonly EvidenceRecord<SynthEntry>[],
  consent: EvidenceConsent,
): SynthEntry[] {
  return autonomousEvidence(records, consent).allowed
    .filter((record): record is EvidenceRecord<SynthEntry> & { payload: SynthEntry } => !!record.payload)
    .map((record) => record.payload);
}
