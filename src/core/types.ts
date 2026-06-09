/**
 * Core domain model for Psyche Atlas.
 *
 * Everything in `src/core` is framework-agnostic (no DOM / React imports) so the
 * scientific logic — instruments, scoring, report composition, growth planning —
 * can be unit-tested in isolation and reused on a server or in a worker later.
 */

/** A Likert-style response format shared by all items of an instrument. */
export interface LikertScale {
  /** Lowest selectable value (usually 1). */
  min: number;
  /** Highest selectable value (usually 5 or 7). */
  max: number;
  /** Human-readable anchors, ordered from `min` to `max`. */
  labels: string[];
}

/** Direction an item is keyed: +1 loads positively on its scale, -1 is reverse-scored. */
export type KeyDirection = 1 | -1;

/** One selectable answer on a multiple-choice item; the chosen option votes for its scale. */
export interface ItemOption {
  /** Option text shown to the respondent. */
  text: string;
  /** Id of the {@link ScaleDef} this option loads on when chosen. */
  scale: string;
  /** Pole direction for forced-choice on a bipolar scale: +1 votes the high pole, -1 the low.
   *  Omit (defaults to +1) for categorical choices where each option is its own scale. */
  keyed?: KeyDirection;
}

/** A single questionnaire item. */
export interface Item {
  id: string;
  /** The statement (Likert) or question stem (multiple-choice) shown to the respondent. */
  text: string;
  /** Id of the {@link ScaleDef} this item loads on. For a multiple-choice item this is the
   *  primary/representative scale; scoring uses the chosen option's scale via {@link options}. */
  scale: string;
  /** Keying direction relative to the scale's high pole (Likert items). */
  keyed: KeyDirection;
  /** Optional finer-grained facet id within the scale. */
  facet?: string;
  /** When present, this is a single-select multiple-choice item: the response value is the
   *  index of the chosen option, and that option's scale receives one vote. */
  options?: ItemOption[];
}

/** Definition of a measured dimension (a factor, dichotomy pole group, or type axis). */
export interface ScaleDef {
  id: string;
  name: string;
  /** Short description of the construct. */
  description: string;
  /** What it means to score high. */
  highDescriptor: string;
  /** What it means to score low. */
  lowDescriptor: string;
  /** Optional bipolar pole labels (e.g., Introversion ↔ Extraversion). */
  poles?: { low: string; high: string };
  /** Optional facets that roll up into this scale. */
  facets?: FacetDef[];
  /** Approximate population mean of the item-mean (1..max), used for norming when no table exists. */
  normMean?: number;
  /** Approximate population SD of the item-mean, used for norming when no table exists. */
  normSd?: number;
}

export interface FacetDef {
  id: string;
  name: string;
  description: string;
}

export type InstrumentKind = "dimensional" | "typological";

export interface Citation {
  /** Formatted reference string (APA-ish). */
  ref: string;
  /** Optional note on how the source informs this instrument. */
  note?: string;
  url?: string;
}

/** A complete assessment instrument: items, scales, scoring metadata, and provenance. */
export interface Instrument {
  id: string;
  name: string;
  shortName: string;
  kind: InstrumentKind;
  /** Response model: "likert" (default — rate each statement) or "choice" (pick one option
   *  per question, each option voting for a scale). Items carry their own {@link Item.options}. */
  format?: "likert" | "choice";
  /** Theme/construct category id (see core/categories.ts) used to group the catalog. */
  category: string;
  /** One-line hook for listings. */
  tagline: string;
  /** Paragraph describing what the instrument measures and its lineage. */
  description: string;
  /** Estimated completion time in minutes. */
  estMinutes: number;
  responseFormat: LikertScale;
  scales: ScaleDef[];
  items: Item[];
  citations: Citation[];
  /** Resolve a categorical type from continuous scale scores (typological instruments).
   *  Accepts an optional locale so the resolved title/summary/components can be localized;
   *  instruments that don't translate their type simply ignore it and return English. */
  resolveType?: (scaleScores: Record<string, ScaleScore>, locale?: string) => TypeResolution;
  /** Honest limitations and ethical framing surfaced to the user. */
  caveats?: string[];
  /** Provenance of the item wording (public-domain set vs. original to this platform). */
  itemProvenance: string;
}

/** itemId -> chosen raw value on the instrument's Likert range. */
export type ResponseMap = Record<string, number>;

export type Level = "very low" | "low" | "moderate" | "high" | "very high";

export interface FacetScore {
  facetId: string;
  name: string;
  /** Mean response across the facet's items, on the Likert range. */
  mean: number;
  /** 0..100 position within the response range. */
  normalized: number;
  level: Level;
  itemCount: number;
}

export interface ScaleScore {
  scaleId: string;
  name: string;
  /** Sum of keyed item scores. */
  raw: number;
  /** Mean keyed item score, on the Likert range (e.g., 1..5). */
  mean: number;
  /** 0..100 position within the raw response range (range-relative). */
  normalized: number;
  /** 0..100 percentile vs. an approximate population norm (when norm params exist). */
  percentile: number;
  level: Level;
  itemCount: number;
  facets: Record<string, FacetScore>;
}

export interface TypeResolution {
  /** Canonical code, e.g. "INTJ" or "5w4". */
  code: string;
  /** Evocative title, e.g. "The Architect". */
  title: string;
  /** Short identity summary. */
  summary: string;
  /** Named component breakdown (axis -> chosen pole, etc.). */
  components: { label: string; value: string; detail?: string }[];
  /** 0..1 clarity/confidence of the typing given how decisive the axes were. */
  confidence: number;
  /** Runner-up code, if meaningful. */
  secondary?: string;
}

/** The full scored outcome of one completed assessment. */
export interface AssessmentResult {
  instrumentId: string;
  /** ISO timestamp the assessment was scored. */
  takenAt: string;
  responses: ResponseMap;
  scales: Record<string, ScaleScore>;
  type?: TypeResolution;
  /** Stable hash of the response vector — identifies the *answers*, not the report. */
  responseFingerprint: string;
}
