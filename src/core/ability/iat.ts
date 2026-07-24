import { newResultId } from "../prng";

/**
 * Implicit Association Test (Greenwald, McGhee & Schwartz, 1998) — a reaction-time
 * method that infers the strength of mental associations from how fast you sort
 * paired concepts. This is a NEUTRAL demonstration (Flowers/Insects × Pleasant/
 * Unpleasant): it shows the method honestly without making sensitive social-bias
 * claims about an individual, which the IAT cannot reliably support.
 *
 * Scoring follows Greenwald, Nosek & Banaji's (2003) improved D algorithm (D1),
 * using error-correction latencies (the participant must correct mistakes).
 */

export type IatSide = "left" | "right";

export interface IatTrial {
  block: number;
  /** Time (ms) from stimulus onset to the eventually-correct response. */
  rt: number;
  /** Whether the FIRST response was correct (for an accuracy stat). */
  firstCorrect: boolean;
}

export interface IatResult {
  d: number;
  /** "flowers" if flowers↔pleasant is the stronger association, else "insects". */
  direction: "flowers" | "insects" | "none";
  magnitude: "little to no" | "a slight" | "a moderate" | "a strong";
  errorRate: number;
  fingerprint: string;
}

export const IAT_TEST = {
  id: "iat-demo",
  name: "Implicit Associations",
  shortName: "IAT",
  category: "cognition",
  tagline: "What your split-second reactions reveal — a live demonstration.",
  description:
    "The Implicit Association Test measures something no questionnaire can: the strength of automatic mental " +
    "associations, read from how fast you sort things under two pairings. This is a NEUTRAL demonstration — Flowers vs " +
    "Insects, paired with Pleasant vs Unpleasant — so you can experience the method itself. Sort quickly and accurately, " +
    "using the keys (or buttons) shown.",
  categories: {
    flowers: { label: "Flowers", words: ["rose", "tulip", "daisy", "lily", "orchid", "daffodil"] },
    insects: { label: "Insects", words: ["wasp", "beetle", "moth", "roach", "gnat", "hornet"] },
    pleasant: { label: "Pleasant", words: ["joy", "love", "peace", "happy", "warmth", "smile"] },
    unpleasant: { label: "Unpleasant", words: ["pain", "hate", "grief", "ugly", "filth", "gloom"] },
  },
  citations: [
    { ref: "Greenwald, A. G., McGhee, D. E., & Schwartz, J. L. K. (1998). Measuring individual differences in implicit cognition: The Implicit Association Test. JPSP, 74(6), 1464–1480." },
    { ref: "Greenwald, A. G., Nosek, B. A., & Banaji, M. R. (2003). Understanding and using the IAT: I. An improved scoring algorithm. JPSP, 85(2), 197–216." },
  ],
  caveats: [
    "This is an EDUCATIONAL demonstration of a method, not a diagnosis. A single IAT has modest test-retest reliability and should never be read as a fixed fact about you.",
    "We use the neutral Flowers/Insects version on purpose. The IAT's validity for measuring an individual's real-world bias on sensitive topics is scientifically contested — so we don't make those claims here.",
    "Order, fatigue, and handedness all sway IAT scores. Treat your result as a fun look at the method, not a verdict.",
    "Most people show a flowers-pleasant association — that's the expected demonstration effect, not a flaw in you.",
  ],
} as const;

/** The 7-block structure (block → trial count). Attributes stay on fixed sides; targets swap. */
export const IAT_BLOCKS = [
  { n: 1, kind: "target", count: 16, left: ["flowers"], right: ["insects"], label: "Sort the flowers and insects." },
  { n: 2, kind: "attribute", count: 16, left: ["pleasant"], right: ["unpleasant"], label: "Sort the pleasant and unpleasant words." },
  { n: 3, kind: "combined", count: 16, left: ["flowers", "pleasant"], right: ["insects", "unpleasant"], label: "Now both together." },
  { n: 4, kind: "combined", count: 24, left: ["flowers", "pleasant"], right: ["insects", "unpleasant"], label: "Keep going — same pairing." },
  { n: 5, kind: "target", count: 24, left: ["insects"], right: ["flowers"], label: "The sides have switched — look carefully." },
  { n: 6, kind: "combined", count: 16, left: ["insects", "pleasant"], right: ["flowers", "unpleasant"], label: "Both together, new pairing." },
  { n: 7, kind: "combined", count: 24, left: ["insects", "pleasant"], right: ["flowers", "unpleasant"], label: "Last one — same new pairing." },
] as const;

type CatKey = "flowers" | "insects" | "pleasant" | "unpleasant";

export interface IatStimulus { word: string; cat: CatKey; correct: IatSide }

/** Generate the randomized stimulus for a trial in a given block. */
export function makeIatStimulus(block: typeof IAT_BLOCKS[number]): IatStimulus {
  const cats = [...block.left, ...block.right] as CatKey[];
  const cat = cats[Math.floor(Math.random() * cats.length)];
  const words = IAT_TEST.categories[cat].words;
  const word = words[Math.floor(Math.random() * words.length)];
  const correct: IatSide = (block.left as readonly string[]).includes(cat) ? "left" : "right";
  return { word, cat, correct };
}

const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const sd = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1));
};

export function scoreIat(trials: IatTrial[], resultId?: string): IatResult {
  // Improved D (D1): trim >10s; compatible = blocks 3/4, incompatible = 6/7.
  const keep = trials.filter((t) => t.rt <= 10000);
  const rt = (b: number[]) => keep.filter((t) => b.includes(t.block)).map((t) => t.rt);
  const c3 = rt([3]), c4 = rt([4]), c6 = rt([6]), c7 = rt([7]);

  const safeD = (compat: number[], incompat: number[]) => {
    const pooled = sd([...compat, ...incompat]);
    if (!compat.length || !incompat.length || pooled === 0) return 0;
    return (mean(incompat) - mean(compat)) / pooled;
  };
  const dPractice = safeD(c3, c6);
  const dTest = safeD(c4, c7);
  const d = Math.round(((dPractice + dTest) / 2) * 1000) / 1000;

  const abs = Math.abs(d);
  const magnitude = abs < 0.15 ? "little to no" : abs < 0.35 ? "a slight" : abs < 0.65 ? "a moderate" : "a strong";
  const direction = abs < 0.15 ? "none" : d > 0 ? "flowers" : "insects";
  const combined = keep.filter((t) => t.block >= 3);
  const errorRate = combined.length ? Math.round((combined.filter((t) => !t.firstCorrect).length / combined.length) * 100) : 0;

  const fp = resultId ?? newResultId();
  return { d, direction, magnitude, errorRate, fingerprint: fp };
}
