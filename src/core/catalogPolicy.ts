import type { Instrument } from "./types";
import { INSTRUMENTS } from "./instruments";

/**
 * Central catalog policy for automatic, public-facing journeys and community
 * norm collection. Restricted modules remain available to deliberate,
 * user-led product surfaces; this policy does not delete or reclassify them as
 * diagnoses.
 */
export type CatalogSensitivity =
  | "diagnostic-adjacent"
  | "current-wellbeing"
  | "sensitive-relationship"
  | "maladaptive-or-risk";

const RESTRICTED: Readonly<Record<string, CatalogSensitivity>> = Object.freeze({
  "adhd-traits": "diagnostic-adjacent",
  "autism-traits": "diagnostic-adjacent",
  "pid5-maladaptive": "diagnostic-adjacent",

  "mood-checkin": "current-wellbeing",
  "worry-checkin": "current-wellbeing",
  "perceived-stress": "current-wellbeing",
  "burnout-mbi": "current-wellbeing",
  "panas-affect": "current-wellbeing",
  "self-esteem-rses": "current-wellbeing",

  "attachment-styles": "sensitive-relationship",
  "couple-communication": "sensitive-relationship",

  "dark-triad-18": "maladaptive-or-risk",
  "dark-tetrad-18": "maladaptive-or-risk",
  "career-derailers": "maladaptive-or-risk",
});

const CATALOG_IDS = new Set(INSTRUMENTS.map((instrument) => instrument.id));

export interface InstrumentCatalogPolicy {
  instrumentId: string;
  recognized: boolean;
  sensitive: boolean;
  sensitivity?: CatalogSensitivity;
  /** May be selected automatically by foundation, roadmap, recommendation, or Autopilot flows. */
  publicJourneyEligible: boolean;
  /** May contribute to or retrieve aggregate community norms. */
  normsEligible: boolean;
}

export const CATALOG_INSTRUMENT_COUNT = INSTRUMENTS.length;
export const SENSITIVE_INSTRUMENT_IDS: readonly string[] = Object.freeze(Object.keys(RESTRICTED));

export function catalogPolicyForInstrument(instrumentId: string): InstrumentCatalogPolicy {
  const recognized = CATALOG_IDS.has(instrumentId);
  const sensitivity = RESTRICTED[instrumentId];
  const sensitive = sensitivity != null;
  return {
    instrumentId,
    recognized,
    sensitive,
    ...(sensitivity == null ? {} : { sensitivity }),
    publicJourneyEligible: recognized && !sensitive,
    normsEligible: recognized && !sensitive,
  };
}

export function isSensitiveInstrument(instrumentId: string): boolean {
  return catalogPolicyForInstrument(instrumentId).sensitive;
}

export function isPublicJourneyEligibleInstrument(instrumentId: string): boolean {
  return catalogPolicyForInstrument(instrumentId).publicJourneyEligible;
}

export function isNormsEligibleInstrument(instrumentId: string): boolean {
  return catalogPolicyForInstrument(instrumentId).normsEligible;
}

export const PUBLIC_JOURNEY_INSTRUMENTS: readonly Instrument[] = Object.freeze(
  INSTRUMENTS.filter((instrument) => isPublicJourneyEligibleInstrument(instrument.id)),
);
export const PUBLIC_JOURNEY_INSTRUMENT_IDS: readonly string[] = Object.freeze(
  PUBLIC_JOURNEY_INSTRUMENTS.map((instrument) => instrument.id),
);
export const PUBLIC_JOURNEY_INSTRUMENT_COUNT = PUBLIC_JOURNEY_INSTRUMENTS.length;

export const NORMS_ELIGIBLE_INSTRUMENT_IDS: readonly string[] = Object.freeze(
  INSTRUMENTS
    .filter((instrument) => isNormsEligibleInstrument(instrument.id))
    .map((instrument) => instrument.id),
);
