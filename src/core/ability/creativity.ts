import { cyrb53 } from "../prng";
import { normalCdf } from "./score";

/**
 * Creative Thinking — Guilford's Alternative Uses Task: in a fixed time, list as
 * many uses as you can for an everyday object. We score FLUENCY (the number of
 * distinct, sensible uses), the most objective divergent-thinking index. Originality
 * needs human/AI judgement, so we don't claim to score it.
 */

export interface CreativityPromptResult { prompt: string; uses: string[] }
export interface CreativityResult {
  prompts: CreativityPromptResult[];
  fluency: number;
  percentile: number;
  band: string;
  fingerprint: string;
}

export const CREATIVITY_TEST = {
  id: "alternative-uses",
  name: "Creative Thinking",
  shortName: "Creativity",
  category: "cognition",
  tagline: "How many uses can you dream up? A test of divergent thinking.",
  description:
    "Guilford's Alternative Uses Task is the classic measure of divergent thinking — the idea-generating engine behind " +
    "creativity. For each everyday object, you'll have one minute to list as many different uses as you can. We score " +
    "fluency (how many distinct, sensible ideas you produce). There are no wrong answers — let your mind run.",
  prompts: ["a brick", "a paperclip", "a newspaper"],
  secondsPerPrompt: 60,
  citations: [
    { ref: "Guilford, J. P. (1967). The Nature of Human Intelligence. McGraw-Hill." },
    { ref: "Torrance, E. P. (1974). Torrance Tests of Creative Thinking. Scholastic Testing Service." },
  ],
  caveats: [
    "This scores FLUENCY (idea count), which is only one facet of creativity — originality and usefulness matter too, and need human judgement.",
    "Divergent-thinking tasks predict creative potential modestly; real creativity also takes knowledge, motivation, and follow-through.",
    "An educational, playful estimate — not a validated creativity assessment, and certainly not a verdict on your imagination.",
    "Your score is reported as a band and percentile, never a single precise number.",
  ],
} as const;

function band(percentile: number): string {
  if (percentile >= 91) return "Highly fluent";
  if (percentile >= 75) return "Above-average fluency";
  if (percentile >= 25) return "Average fluency";
  if (percentile >= 9) return "Below-average fluency";
  return "Low fluency";
}

export function scoreCreativity(prompts: CreativityPromptResult[]): CreativityResult {
  const seen = new Set<string>();
  for (const p of prompts) {
    for (const u of p.uses) {
      const norm = u.trim().toLowerCase();
      if (norm.length >= 2) seen.add(p.prompt + "::" + norm); // distinct within each object
    }
  }
  const fluency = seen.size;
  const n = prompts.length || 1;
  const mean = n * 7;
  const sd = n * 3;
  const z = (fluency - mean) / sd;
  const percentile = Math.max(1, Math.min(99, Math.round(normalCdf(z) * 100)));
  const fp = cyrb53("create|" + fluency + "|" + prompts.map((p) => p.uses.length).join(",")).toString(36);
  return { prompts, fluency, percentile, band: band(percentile), fingerprint: fp };
}
