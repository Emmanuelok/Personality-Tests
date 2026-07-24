import {
  CATALOG_ID_PATTERN,
  exactKeys,
  finiteNumber,
  objectValue,
  stringValue,
  type JsonObject,
  ValidationError,
} from "./_validation";

/**
 * Audited server allowlist for community norms. This is intentionally separate
 * from the large client instrument catalog so the API function does not bundle
 * browser catalog code. The parity test fails if client policy or scale IDs
 * change without a deliberate server review.
 */
const AUDITED_NORMS_CATALOG = {
  "big-five-ipip50": ["O", "C", "E", "A", "N"],
  "hexaco-24": ["H", "E", "X", "A", "C", "O"],
  "eysenck-pen": ["EXT", "NEU", "PSY"],
  "sixteen-pf": ["A", "B", "C", "E", "F", "G", "H", "I", "L", "M", "N", "O", "Q1", "Q2", "Q3", "Q4"],
  "big-five-aspects": ["INT", "AES", "IND", "ORD", "ENT", "ASR", "COM", "POL", "VOL", "WTH"],
  "tci-cloninger": ["NS", "HA", "RD", "PS", "SD", "CO", "ST"],
  "zkpq-alt5": ["IMPSS", "NANX", "AGGH", "ACT", "SY"],
  "jung-16-types": ["EI", "SN", "TF", "JP"],
  "keirsey-temperaments": ["COMM", "ACT"],
  "enneagram-9": ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"],
  "disc-4": ["D", "I", "S", "C"],
  "four-temperaments": ["SANG", "CHOL", "MEL", "PHLEG"],
  "color-styles": ["GOLD", "BLUE", "GREEN", "ORANGE"],
  "socionics-16": ["ATT", "PER", "JUD", "ORG"],
  "love-languages": ["WORDS", "TIME", "SERVICE", "GIFTS", "TOUCH"],
  "conflict-style": ["COMPETE", "COLLAB", "COMPROMISE", "AVOID", "ACCOMM"],
  "team-communication": ["SAFETY", "OPEN", "TASK", "FRICTION", "COORD", "RESOLVE"],
  "communication-style": ["ASSERT", "LISTEN", "EMPATH", "REGUL", "COLLAB", "ENGAGE"],
  "via-24": [
    "CREAT", "CURIO", "JUDGE", "LEARN", "PERSP", "BRAVE", "PERSV", "HONES",
    "ZEST", "LOVE", "KIND", "SOCIN", "TEAM", "FAIR", "LEAD", "FORGV", "HUMIL",
    "PRUD", "SELFR", "BEAUT", "GRAT", "HOPE", "HUMOR", "SPIRIT",
  ],
  "schwartz-values": ["SD", "ST", "HE", "AC", "PO", "SE", "CO", "TR", "BE", "UN"],
  "grit-resilience": ["PERS", "CONS"],
  "moral-foundations": ["CARE", "FAIR", "LOYAL", "AUTH", "SANCT"],
  "rokeach-values": ["TERMP", "TERMS", "INSTM", "INSTC"],
  "mcclelland-needs": ["ACH", "AFF", "POW"],
  "riasec-careers": ["R", "I", "A", "S", "E", "C"],
  "career-anchors": ["TF", "GM", "AU", "SE", "EC", "SV", "CH", "LS"],
  "leadership-styles": ["TFM", "TRN", "LFR"],
  "emotional-intelligence": ["SA", "SR", "MO", "EM", "SS"],
  chronotype: ["MORN"],
  "perma-flourishing": ["POS", "ENG", "REL", "MEA", "ACC"],
  "ryff-wellbeing": ["AUT", "MAS", "GRO", "REL", "PUR", "ACC"],
  "coping-styles": ["PROB", "EMO", "SUP", "AVO"],
  "money-scripts": ["AVOID", "WORSHIP", "STATUS", "VIGIL"],
  "self-compassion-scs": ["SK", "SJ", "CH", "IS", "MI", "OI"],
  "time-perspective-ztpi": ["PN", "PP", "PH", "PF", "FU"],
  "meaning-mlq": ["PRES", "SRCH"],
  "mindfulness-ffmq": ["OBS", "DES", "AWA", "NJ", "NR"],
  "vark-learning": ["VIS", "AUR", "RDW", "KIN"],
  "kolb-learning": ["GRASP", "TRANS"],
  "locus-of-control": ["LOC"],
  "mindset-dweck": ["MIND"],
  "self-monitoring": ["SM"],
  "sensation-seeking": ["TAS", "DIS"],
  "need-for-cognition": ["NFC"],
  "empathy-iri": ["PT", "EC", "FS", "PD"],
  "life-satisfaction-swls": ["SWL"],
  "brief-resilience": ["RES"],
  "optimism-lotr": ["OPT", "PES"],
  "hope-scale": ["AGENCY", "PATHWAYS"],
  "curiosity-cei": ["STRETCH", "EMBRACE"],
  "self-control-bscs": ["RESTRAINT", "DISCIPLINE"],
  "self-efficacy-gse": ["GSE"],
  "emotion-regulation-erq": ["REAP", "SUPP"],
  "procrastination-pps": ["PROC"],
  "perfectionism-2f": ["STAND", "CONC"],
  "gratitude-gq6": ["GRAT"],
} as const satisfies Readonly<Record<string, readonly string[]>>;

const CATALOG = new Map<string, readonly string[]>(
  Object.entries(AUDITED_NORMS_CATALOG).map(([instrumentId, scaleIds]) => [
    instrumentId,
    Object.freeze([...scaleIds]),
  ]),
);

export const SERVER_NORMS_ELIGIBLE_INSTRUMENT_IDS: readonly string[] = Object.freeze(
  [...CATALOG.keys()],
);

export interface NormContribution {
  instrumentId: string;
  buckets: Record<string, number>;
}

export function catalogScaleIds(instrumentId: string): readonly string[] | undefined {
  return CATALOG.get(instrumentId);
}

export function isServerNormsEligibleInstrument(instrumentId: string): boolean {
  return CATALOG.has(instrumentId);
}

export function instrumentIdValue(value: unknown, field = "instrumentId"): string {
  const instrumentId = stringValue(value, field, {
    min: 1,
    max: 64,
    pattern: CATALOG_ID_PATTERN,
  });
  if (!isServerNormsEligibleInstrument(instrumentId)) {
    throw new ValidationError("norms_not_eligible", field);
  }
  return instrumentId;
}

export function parseNormContribution(body: JsonObject): NormContribution {
  exactKeys(body, ["instrumentId", "buckets"], ["instrumentId", "buckets"]);
  const instrumentId = instrumentIdValue(body.instrumentId);
  const expectedScaleIds = CATALOG.get(instrumentId);
  if (!expectedScaleIds || expectedScaleIds.length === 0 || expectedScaleIds.length > 64) {
    throw new ValidationError("invalid_catalog", "instrumentId");
  }

  const rawBuckets = objectValue(body.buckets, "buckets");
  exactKeys(rawBuckets, expectedScaleIds, expectedScaleIds, "buckets");
  if (Object.keys(rawBuckets).length !== expectedScaleIds.length) {
    throw new ValidationError("incomplete_scales", "buckets");
  }

  const buckets: Record<string, number> = Object.create(null) as Record<string, number>;
  for (const scaleId of expectedScaleIds) {
    buckets[scaleId] = finiteNumber(rawBuckets[scaleId], `buckets.${scaleId}`, {
      min: 0,
      max: 9,
      integer: true,
    });
  }
  return { instrumentId, buckets };
}
