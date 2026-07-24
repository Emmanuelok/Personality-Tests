import { describe, expect, it } from "vitest";
import { PERSONALITY_RESULT_PRODUCTS, PRODUCTS } from "./commerce";
import { INSTRUMENTS, bigFive, mood } from "./instruments";
import {
  CATALOG_INSTRUMENT_COUNT,
  NORMS_ELIGIBLE_INSTRUMENT_IDS,
  PUBLIC_JOURNEY_INSTRUMENT_IDS,
  SENSITIVE_INSTRUMENT_IDS,
  catalogPolicyForInstrument,
  isNormsEligibleInstrument,
  isPublicJourneyEligibleInstrument,
  isSensitiveInstrument,
} from "./catalogPolicy";
import { scoreAssessment } from "./scoring";
import { recommendNext, relevanceNote } from "./recommend";
import { starterPack, adaptivePack } from "./starter";
import { buildRoadmap } from "./roadmap";
import { autopilotNext } from "./autopilot";

const REQUIRED_RESTRICTED = [
  "adhd-traits",
  "autism-traits",
  "pid5-maladaptive",
  "mood-checkin",
  "worry-checkin",
  "perceived-stress",
  "burnout-mbi",
  "dark-triad-18",
  "dark-tetrad-18",
] as const;

const allHigh = (instrument: typeof bigFive) => Object.fromEntries(
  instrument.items.map((item) => [
    item.id,
    item.keyed === 1 ? instrument.responseFormat.max : instrument.responseFormat.min,
  ]),
);

describe("youth-safe catalog policy", () => {
  it("restricts every required diagnostic-adjacent or sensitive instrument", () => {
    const catalogIds = new Set(INSTRUMENTS.map((instrument) => instrument.id));
    for (const id of REQUIRED_RESTRICTED) {
      expect(catalogIds.has(id)).toBe(true);
      expect(isSensitiveInstrument(id)).toBe(true);
      expect(isPublicJourneyEligibleInstrument(id)).toBe(false);
      expect(isNormsEligibleInstrument(id)).toBe(false);
    }
  });

  it("defaults unknown ids closed while keeping recognized general instruments eligible", () => {
    expect(catalogPolicyForInstrument("not-in-the-catalog")).toMatchObject({
      recognized: false,
      publicJourneyEligible: false,
      normsEligible: false,
    });
    expect(catalogPolicyForInstrument(bigFive.id)).toMatchObject({
      recognized: true,
      sensitive: false,
      publicJourneyEligible: true,
      normsEligible: true,
    });
  });

  it("exports internally consistent allowlists derived from the live catalog", () => {
    expect(CATALOG_INSTRUMENT_COUNT).toBe(INSTRUMENTS.length);
    expect(new Set(SENSITIVE_INSTRUMENT_IDS).size).toBe(SENSITIVE_INSTRUMENT_IDS.length);
    expect(PUBLIC_JOURNEY_INSTRUMENT_IDS.every(isPublicJourneyEligibleInstrument)).toBe(true);
    expect(NORMS_ELIGIBLE_INSTRUMENT_IDS.every(isNormsEligibleInstrument)).toBe(true);
    expect(PUBLIC_JOURNEY_INSTRUMENT_IDS.every((id) => !isSensitiveInstrument(id))).toBe(true);
  });

  it("keeps restricted instruments out of recommendations, starters, and roadmaps", () => {
    const highBigFive = {
      instrument: bigFive,
      result: scoreAssessment(bigFive, allHigh(bigFive)),
    };
    const highMood = {
      instrument: mood,
      result: scoreAssessment(
        mood,
        Object.fromEntries(mood.items.map((item) => [
          item.id,
          item.keyed === 1 ? mood.responseFormat.max : mood.responseFormat.min,
        ])),
      ),
    };
    const recommendations = [
      ...recommendNext([], { limit: INSTRUMENTS.length }),
      ...recommendNext([highBigFive], { limit: INSTRUMENTS.length }),
      ...recommendNext([highMood], { limit: INSTRUMENTS.length }),
    ];
    expect(recommendations.every((item) =>
      isPublicJourneyEligibleInstrument(item.instrument.id),
    )).toBe(true);
    expect(relevanceNote(bigFive, [highMood])).toBeNull();

    for (const focus of [
      ["relationships"],
      ["wellbeing"],
      ["career"],
      ["understand myself"],
    ]) {
      expect(starterPack(focus).every(isPublicJourneyEligibleInstrument)).toBe(true);
      expect(adaptivePack([], focus).every(isPublicJourneyEligibleInstrument)).toBe(true);
      expect(buildRoadmap([], focus, { length: INSTRUMENTS.length }).steps
        .every((step) => isPublicJourneyEligibleInstrument(step.instrumentId))).toBe(true);
    }
  });

  it("skips restricted ids even when an Autopilot plan names them explicitly", () => {
    const next = autopilotNext([], [], {
      plan: [...REQUIRED_RESTRICTED, bigFive.id],
    });
    expect(next?.instrumentId).toBe(bigFive.id);
    expect(autopilotNext([], [], { plan: [...REQUIRED_RESTRICTED] })).toBeNull();
  });
});

describe("catalog-derived commerce claims", () => {
  it("uses the live catalog count and avoids fixed-rank cognitive promises", () => {
    const copy = JSON.stringify(PRODUCTS);
    expect(copy).toContain(String(CATALOG_INSTRUMENT_COUNT));
    expect(copy).not.toMatch(/all 48|complete cognitive profile/i);
    expect(copy).not.toMatch(/percentile[^.]*domain|domain[^.]*percentile/i);
    expect(copy).not.toMatch(/every question|all formats[^.]*every result/i);
  });

  it("does not offer the cognitive-only SKU from a personality result", () => {
    expect(PERSONALITY_RESULT_PRODUCTS.map((product) => product.id)).toEqual([
      "report",
      "allaccess",
      "poster",
    ]);
  });
});
