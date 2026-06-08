import type { AbilityItem, AbilityTest } from "../types";
import { flag } from "../figures";

/**
 * General Cognitive Ability — a four-domain reasoning test grounded in the
 * public-domain ICAR framework (Condon & Revelle, 2014) and Cattell-Horn-Carroll
 * theory. Verbal (Gc), Numerical (Gq/Gf), Abstract (Gf), and Spatial (Gv). Items
 * are ORIGINAL to this platform; spatial figures are generated so the key is
 * correct by construction.
 */

// Mental-rotation item: 3 figures are pure rotations, one (at `mirrorAt`) is a mirror.
function rot(id: string, angles: number[], mirrorAt: number, pCorrect: number): AbilityItem {
  return {
    id,
    domain: "spatial",
    prompt: "Three of these figures are the same shape turned to different angles. Which one is a mirror image — not just a rotation?",
    options: ["Figure 1", "Figure 2", "Figure 3", "Figure 4"],
    optionFigures: angles.map((a, i) => flag(a, i === mirrorAt)),
    answer: mirrorAt,
    pCorrect,
    explain: "Rotating a shape never flips its handedness; only a mirror reflection does. The flipped flag is the reflection.",
  };
}

const items: AbilityItem[] = [
  // ── Verbal Reasoning (Gc) ──
  { id: "V1", domain: "verbal", prompt: "Bird is to nest as bee is to ___ ?", options: ["honey", "hive", "flower", "wax"], answer: 1, pCorrect: 0.82, explain: "A nest is a bird's dwelling; a hive is a bee's dwelling." },
  { id: "V2", domain: "verbal", prompt: "Which word is closest in meaning to BENEVOLENT?", options: ["kind", "hostile", "wealthy", "curious"], answer: 0, pCorrect: 0.7, explain: "Benevolent means well-meaning and kindly." },
  { id: "V3", domain: "verbal", prompt: "Which word is most nearly OPPOSITE to FRUGAL?", options: ["thrifty", "wasteful", "quiet", "honest"], answer: 1, pCorrect: 0.68, explain: "Frugal means sparing/economical; its opposite is wasteful." },
  { id: "V4", domain: "verbal", prompt: "All cats are mammals. All mammals breathe air. Therefore:", options: ["All mammals are cats", "All cats breathe air", "Some cats do not breathe air", "No valid conclusion"], answer: 1, pCorrect: 0.78, explain: "The premises chain: cats → mammals → breathe air." },
  { id: "V5", domain: "verbal", prompt: "A 'gregarious' person is best described as:", options: ["sociable", "dishonest", "fearful", "stingy"], answer: 0, pCorrect: 0.6, explain: "Gregarious means fond of company; sociable." },
  { id: "V6", domain: "verbal", prompt: "Which word does NOT belong with the others?", options: ["tulip", "oak", "rose", "daisy"], answer: 1, pCorrect: 0.85, explain: "Oak is a tree; the others are flowers." },

  // ── Numerical Reasoning (Gq / Gf) ──
  { id: "N1", domain: "numerical", prompt: "What number comes next?  2, 6, 12, 20, 30, ___", options: ["40", "42", "44", "36"], answer: 1, pCorrect: 0.62, explain: "Differences grow by 2: +4, +6, +8, +10, +12 → 42." },
  { id: "N2", domain: "numerical", prompt: "What number comes next?  1, 4, 9, 16, 25, ___", options: ["30", "35", "36", "49"], answer: 2, pCorrect: 0.8, explain: "These are the squares 1²…5²; next is 6² = 36." },
  { id: "N3", domain: "numerical", prompt: "If 3 pencils cost 60 cents, how much do 7 pencils cost?", options: ["120 cents", "140 cents", "160 cents", "180 cents"], answer: 1, pCorrect: 0.78, explain: "Each pencil is 20 cents; 7 × 20 = 140." },
  { id: "N4", domain: "numerical", prompt: "What number comes next?  3, 6, 12, 24, ___", options: ["36", "48", "30", "42"], answer: 1, pCorrect: 0.84, explain: "Each term doubles: 24 × 2 = 48." },
  { id: "N5", domain: "numerical", prompt: "A shirt costs $40 and is discounted 25%. What is the sale price?", options: ["$30", "$32", "$35", "$28"], answer: 0, pCorrect: 0.7, explain: "25% of 40 is 10; 40 − 10 = 30." },
  { id: "N6", domain: "numerical", prompt: "Complete the analogy:  5 : 25  ::  8 : ___", options: ["16", "40", "64", "48"], answer: 2, pCorrect: 0.66, explain: "Each number is squared: 5² = 25, so 8² = 64." },

  // ── Abstract / Logical Reasoning (Gf) ──
  { id: "A1", domain: "abstract", prompt: "What letter comes next?  A, C, F, J, ___", options: ["N", "O", "P", "M"], answer: 1, pCorrect: 0.6, explain: "Gaps grow: +2, +3, +4, +5 → J(10)+5 = O(15)." },
  { id: "A2", domain: "abstract", prompt: "What letter comes next?  Z, W, T, Q, ___", options: ["O", "N", "M", "P"], answer: 1, pCorrect: 0.55, explain: "Each letter steps back 3: Q(17) − 3 = N(14)." },
  { id: "A3", domain: "abstract", prompt: "What comes next in the pattern?   ▲  ■  ●  ▲  ■  ___", options: ["▲", "■", "●", "◆"], answer: 2, pCorrect: 0.72, explain: "The trio ▲ ■ ● repeats; after ▲ ■ comes ●." },
  { id: "A4", domain: "abstract", prompt: "Which number does NOT belong?", options: ["3", "5", "9", "11"], answer: 2, pCorrect: 0.58, explain: "3, 5, and 11 are prime; 9 = 3 × 3 is not." },
  { id: "A5", domain: "abstract", prompt: "Find the missing number:\n   2  4  6\n   3  6  9\n   4  8  ?", options: ["10", "11", "12", "16"], answer: 2, pCorrect: 0.64, explain: "Each row is the first number × 1, × 2, × 3: 4 × 3 = 12." },
  { id: "A6", domain: "abstract", prompt: "Square is to cube as circle is to ___ ?", options: ["sphere", "disc", "cylinder", "oval"], answer: 0, pCorrect: 0.62, explain: "A cube is the 3-D form of a square; a sphere is the 3-D form of a circle." },

  // ── Spatial Reasoning (Gv) — mental rotation ──
  rot("S1", [0, 90, 180, 270], 2, 0.6),
  rot("S2", [30, 120, 210, 300], 0, 0.52),
  rot("S3", [45, 135, 225, 315], 3, 0.46),
  rot("S4", [0, 60, 150, 240], 1, 0.54),
  rot("S5", [20, 110, 200, 290], 3, 0.42),
  rot("S6", [15, 105, 195, 285], 0, 0.45),
];

export const cognitive: AbilityTest = {
  id: "cognitive-ability",
  name: "General Cognitive Ability",
  shortName: "Cognitive",
  category: "cognition",
  tagline: "A four-domain reasoning test — verbal, numerical, abstract, and spatial.",
  description:
    "Unlike the rest of Psyche Atlas, this is an ABILITY test: the questions have right and wrong answers. Modeled on " +
    "the open, research-grade ICAR item bank and built on Cattell-Horn-Carroll theory — the science behind the WAIS, " +
    "Stanford-Binet, and Raven's Matrices — it samples four broad reasoning abilities and gives you a profile plus an " +
    "honest, clearly-bounded estimate of where you'd fall. Work quickly but carefully.",
  estMinutes: 18,
  timeLimitSec: 18 * 60,
  domains: [
    { id: "verbal", name: "Verbal Reasoning", chc: "Gc — crystallized knowledge", description: "Reasoning with words, meaning, and language-based logic." },
    { id: "numerical", name: "Numerical Reasoning", chc: "Gq / Gf — quantitative & fluid", description: "Reasoning with numbers, quantities, and arithmetic relationships." },
    { id: "abstract", name: "Abstract Reasoning", chc: "Gf — fluid intelligence", description: "Spotting patterns and rules in novel, content-free material." },
    { id: "spatial", name: "Spatial Reasoning", chc: "Gv — visual-spatial processing", description: "Mentally rotating and manipulating shapes in space." },
  ],
  items,
  itemProvenance:
    "Original items written for this platform, modeled on the public-domain ICAR (International Cognitive Ability Resource) item types and CHC broad abilities.",
  caveats: [
    "This is an EDUCATIONAL estimate, not a clinically administered IQ test. A real IQ assessment (e.g., the WAIS or Stanford-Binet) is given one-to-one by a trained psychologist under standardized conditions — this cannot replace it.",
    "The score is reported as a wide band and a percentile, never a single precise number, because a short self-administered test simply cannot support that precision.",
    "Many things move a score that have nothing to do with ability: sleep, stress, distractions, practice, language background, and test conditions. Treat one sitting as a rough snapshot.",
    "Intelligence tests measure particular reasoning skills — they do not measure your worth, creativity, character, wisdom, or potential. No life decision should rest on this.",
    "If you need a valid score for school, work, or clinical reasons, seek a professionally administered assessment.",
  ],
  citations: [
    { ref: "Condon, D. M., & Revelle, W. (2014). The International Cognitive Ability Resource (ICAR): Development and initial validation of a public-domain measure. Intelligence, 43, 52–64.", note: "Open framework these item types are modeled on." },
    { ref: "Carroll, J. B. (1993). Human Cognitive Abilities: A Survey of Factor-Analytic Studies. Cambridge University Press.", note: "The Cattell-Horn-Carroll structure of abilities." },
    { ref: "Raven, J. (2000). The Raven's Progressive Matrices: Change and stability over culture and time. Cognitive Psychology, 41(1), 1–48." },
  ],
};
