import { newResultId } from "../prng";
import { practiceObservation } from "./score";

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
  practiceIndex: number;
  observation: string;
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
    "Idea fluency in one sitting depends on familiarity, language, mood, time pressure, and prior practice.",
    "This is an educational practice snapshot, not a validated assessment or a verdict on creativity.",
    "The practice index describes only how many distinct ideas appeared in this task.",
  ],
} as const;

export function scoreCreativity(prompts: CreativityPromptResult[], resultId?: string): CreativityResult {
  const seen = new Set<string>();
  for (const p of prompts) {
    for (const u of p.uses) {
      const norm = u.trim().toLowerCase();
      if (norm.length >= 2) seen.add(p.prompt + "::" + norm); // distinct within each object
    }
  }
  const fluency = seen.size;
  const availablePrompts = Math.max(1, prompts.length);
  // Twelve distinct uses per prompt fills the task-specific practice index.
  const practiceIndex = Math.max(0, Math.min(100, Math.round((fluency / (availablePrompts * 12)) * 100)));
  const fp = resultId ?? newResultId();
  return {
    prompts,
    fluency,
    practiceIndex,
    observation: practiceObservation(practiceIndex),
    fingerprint: fp,
  };
}
