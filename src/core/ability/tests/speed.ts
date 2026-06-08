import type { AbilityItem, AbilityTest } from "../types";

/**
 * Verbal-Numerical Aptitude — a short, speeded mixed test in the spirit of the
 * Wonderlic: many quick verbal, numerical, and logical items under time pressure.
 * Rewards both reasoning and speed. Items are ORIGINAL to this platform.
 */

const q = (id: string, domain: string, prompt: string, options: string[], answer: number, pCorrect: number, explain: string): AbilityItem =>
  ({ id, domain, prompt, options, answer, pCorrect, explain });

const items: AbilityItem[] = [
  // ── Verbal ──
  q("V1", "verbal", "Which word means the same as ABUNDANT?", ["plentiful", "scarce", "heavy", "loud"], 0, 0.82, "Abundant means existing in large quantity — plentiful."),
  q("V2", "verbal", "Which word is most nearly OPPOSITE to ANCIENT?", ["old", "modern", "fragile", "sacred"], 1, 0.85, "Ancient means very old; its opposite is modern."),
  q("V3", "verbal", "Cub is to bear as ___ is to dog.", ["kitten", "foal", "puppy", "calf"], 2, 0.88, "A cub is a young bear; a puppy is a young dog."),
  q("V4", "verbal", "Which word does NOT belong?", ["apple", "banana", "carrot", "mango"], 2, 0.84, "A carrot is a vegetable; the others are fruits."),
  q("V5", "verbal", "Which word means the same as RAPID?", ["slow", "quick", "rough", "rare"], 1, 0.9, "Rapid means fast — quick."),
  q("V6", "verbal", "Author is to book as composer is to ___.", ["music", "painting", "stage", "poem"], 0, 0.83, "An author creates a book; a composer creates music."),
  q("V7", "verbal", "Which word is most nearly OPPOSITE to GENEROUS?", ["giving", "kind", "stingy", "brave"], 2, 0.82, "Generous means free in giving; its opposite is stingy."),
  q("V8", "verbal", "Which one is a kind of TREE?", ["oak", "trout", "copper", "violet"], 0, 0.8, "An oak is a tree (a trout is a fish, copper a metal, violet a flower)."),
  q("V9", "verbal", "Which word means the same as FATIGUED?", ["tired", "hungry", "angry", "curious"], 0, 0.84, "Fatigued means worn out — tired."),
  q("V10", "verbal", "Petal is to flower as ___ is to wheel.", ["spoke", "road", "car", "engine"], 0, 0.74, "A petal is part of a flower; a spoke is part of a wheel."),

  // ── Numerical ──
  q("N1", "numerical", "What comes next?  5, 10, 15, 20, ___", ["25", "30", "22", "24"], 0, 0.9, "The numbers go up by 5; 20 + 5 = 25."),
  q("N2", "numerical", "12 × 4 = ?", ["44", "48", "46", "52"], 1, 0.88, "12 × 4 = 48."),
  q("N3", "numerical", "What is half of 86?", ["42", "43", "44", "46"], 1, 0.85, "86 ÷ 2 = 43."),
  q("N4", "numerical", "What comes next?  2, 4, 8, 16, ___", ["24", "30", "32", "36"], 2, 0.82, "Each number doubles; 16 × 2 = 32."),
  q("N5", "numerical", "What is 15% of 200?", ["25", "30", "35", "20"], 1, 0.78, "10% is 20 and 5% is 10, so 15% is 30."),
  q("N6", "numerical", "If 5 pens cost $10, what does one pen cost?", ["$2.00", "$2.50", "$1.50", "$3.00"], 0, 0.86, "$10 ÷ 5 = $2."),
  q("N7", "numerical", "What comes next?  100, 90, 80, 70, ___", ["60", "65", "75", "50"], 0, 0.9, "The numbers drop by 10; 70 − 10 = 60."),
  q("N8", "numerical", "Solve:  7 + 6 × 2 = ?", ["26", "19", "20", "25"], 1, 0.66, "Multiply first: 6 × 2 = 12, then 7 + 12 = 19."),
  q("N9", "numerical", "Which value is the largest?", ["0.7", "0.07", "0.77", "0.707"], 2, 0.7, "0.77 is greater than 0.7, 0.707, and 0.07."),
  q("N10", "numerical", "What comes next?  1, 1, 2, 3, 5, 8, ___", ["11", "12", "13", "15"], 2, 0.7, "Each number is the sum of the previous two; 5 + 8 = 13."),

  // ── Logic ──
  q("L1", "logic", "What letter comes next?  A, B, D, G, ___", ["J", "K", "L", "I"], 1, 0.6, "Gaps grow by 1: +1, +2, +3, +4 → G(7)+4 = K(11)."),
  q("L2", "logic", "All Bloops are Razzies. All Razzies are Lazzies. Therefore all Bloops are:", ["Lazzies", "only Razzies", "neither", "none of these"], 0, 0.78, "The chain Bloops → Razzies → Lazzies makes all Bloops Lazzies."),
  q("L3", "logic", "Which number does NOT belong?", ["4", "6", "9", "10"], 2, 0.7, "4, 6, and 10 are even; 9 is odd."),
  q("L4", "logic", "What comes next?  3, 7, 15, 31, ___", ["47", "63", "62", "55"], 1, 0.58, "Each term is the previous × 2 + 1; 31 × 2 + 1 = 63."),
  q("L5", "logic", "Pencil is to write as scissors are to ___.", ["cut", "paper", "sharp", "draw"], 0, 0.86, "A pencil is used to write; scissors are used to cut."),
  q("L6", "logic", "What comes next?   ● ○ ● ○ ● ___", ["●", "○", "◐", "□"], 1, 0.82, "The pattern alternates filled and empty; after ● comes ○."),
  q("L7", "logic", "Yesterday was Monday. What day is two days after tomorrow?", ["Thursday", "Friday", "Saturday", "Wednesday"], 1, 0.55, "Today is Tuesday, tomorrow Wednesday, and two days later is Friday."),
  q("L8", "logic", "What letter comes next?  Z, Y, X, W, ___", ["U", "V", "T", "W"], 1, 0.84, "The letters go backward one step each; after W comes V."),
  q("L9", "logic", "Some cats are black. Tom is a cat. Therefore Tom:", ["is black", "is not black", "may be black", "is not a cat"], 2, 0.72, "Only SOME cats are black, so Tom may or may not be."),
  q("L10", "logic", "What comes next?  1, 4, 9, 16, ___", ["20", "24", "25", "21"], 2, 0.78, "These are the squares 1², 2², 3², 4²; next is 5² = 25."),
];

export const speed: AbilityTest = {
  id: "verbal-numerical",
  name: "Verbal-Numerical Aptitude",
  shortName: "Aptitude",
  category: "cognition",
  tagline: "A fast, mixed test of words, numbers, and logic — beat the clock.",
  description:
    "A short, speeded test in the spirit of the Wonderlic: thirty quick verbal, numerical, and logical questions under " +
    "a tight clock. It rewards not just reasoning but how fast and accurately you work under pressure — the kind of " +
    "mental agility that workplace aptitude tests probe. Move fast; don't get stuck.",
  estMinutes: 9,
  timeLimitSec: 9 * 60,
  domains: [
    { id: "verbal", name: "Verbal", chc: "Gc — verbal knowledge", description: "Quick reasoning with words and meaning." },
    { id: "numerical", name: "Numerical", chc: "Gq — quantitative", description: "Quick reasoning with numbers and arithmetic." },
    { id: "logic", name: "Logic", chc: "Gf — fluid reasoning", description: "Quick pattern, sequence, and deductive reasoning." },
  ],
  items,
  itemProvenance: "Original items written for this platform, modeled on speeded aptitude tests such as the Wonderlic and on ICAR item types.",
  caveats: [
    "This is an EDUCATIONAL estimate, not a clinically administered IQ test, and is not a hiring or selection tool.",
    "Speeded tests reward fast, accurate work — a low score may reflect a careful, deliberate style as much as ability.",
    "Your score is reported as a band and a percentile, never a single precise number.",
    "It measures particular skills under time pressure, not your worth, creativity, or potential.",
  ],
  citations: [
    { ref: "Wonderlic, E. F. (1992). Wonderlic Personnel Test Manual. Wonderlic & Associates.", note: "Model for the speeded, mixed-aptitude format." },
    { ref: "Condon, D. M., & Revelle, W. (2014). The International Cognitive Ability Resource (ICAR). Intelligence, 43, 52–64." },
  ],
};
