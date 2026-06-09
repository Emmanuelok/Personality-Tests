/**
 * "How to strengthen this" guidance for the cognitive tests.
 *
 * Integrity first: cognitive abilities are far more stable and heritable than
 * personality traits, and the evidence on "brain training" is clear that practice
 * gains are mostly task-specific and rarely transfer to general ability or daily
 * life (Melby-Lervåg & Hulme, 2013; Simons et al., 2016). So this offers honest,
 * evidence-backed levers — real brain-health habits and task strategies — rather
 * than promising to raise your IQ. Framework-agnostic data (no DOM).
 */

export interface AbilityTip {
  title: string;
  detail: string;
}

export interface AbilityGrowth {
  headline: string;
  tips: AbilityTip[];
  /** The honest limitation, always shown. */
  caveat: string;
}

/** Brain-health basics with real evidence — appended to every test's guidance. */
const BASICS: AbilityTip[] = [
  { title: "Protect your sleep", detail: "Memory, attention, and speed all run on sleep. Consistent, sufficient sleep is the single highest-leverage thing you can do for day-to-day mental performance." },
  { title: "Move your body", detail: "Regular aerobic exercise is one of the few interventions with solid evidence for supporting cognition and protecting it as you age." },
  { title: "Lower chronic stress", detail: "Sustained stress and anxiety quietly tax working memory and attention. Practices that downshift the nervous system free those resources back up." },
];

const HONEST_CAVEAT =
  "Be skeptical of “brain training”: practising a task makes you better at that task, but the gains rarely transfer to general intelligence or everyday life (Melby-Lervåg & Hulme, 2013; Simons et al., 2016). The habits here — sleep, exercise, and learning real things — have far better evidence than any app, and your score is an educational estimate, not a fixed ceiling.";

const PER_TEST: Record<string, { headline: string; tips: AbilityTip[] }> = {
  "memory-span": {
    headline: "Working memory is fairly stable — but you can work cleverly with it",
    tips: [
      { title: "Chunk information", detail: "Group items into meaningful clusters (a number as a few chunks, not ten loose digits). Chunking is how experts hold more in mind without a bigger “buffer.”" },
      { title: "Offload deliberately", detail: "Use notes, lists, and tools so working memory isn't your bottleneck. Reducing the load beats trying to expand the capacity." },
    ],
  },
  "corsi-blocks": {
    headline: "Spatial memory responds to strategy more than raw drilling",
    tips: [
      { title: "Turn space into a story", detail: "Convert a spatial sequence into a path or a little narrative; the “method of loci” borrows the spatial memory you already have." },
      { title: "Rehearse in your mind's eye", detail: "Deliberately re-walk the pattern visually before reproducing it — active visualization holds a sequence longer than passive looking." },
    ],
  },
  "processing-speed": {
    headline: "Speed is practice- and state-dependent",
    tips: [
      { title: "Practise the specific skill", detail: "Speed improves with practice on a given task — just know the gains are mostly specific to it, not a global speed-up." },
      { title: "Remove friction", detail: "Cut distractions and context-switching; a lot of what feels “slow” is interruption and divided attention, not raw processing speed." },
    ],
  },
  "adaptive-reasoning": {
    headline: "Fluid reasoning is stable; knowledge and strategy are your real levers",
    tips: [
      { title: "Learn the domain deeply", detail: "Reasoning rides on knowledge. Deep familiarity with a field lets you reason far better within it than raw “IQ” alone ever could." },
      { title: "Externalize the problem", detail: "Draw it, write the steps, break it into parts. Off-loading working memory frees capacity for the actual reasoning." },
    ],
  },
  "alternative-uses": {
    headline: "Divergent thinking genuinely improves with practice",
    tips: [
      { title: "Defer judgment", detail: "Generate first, evaluate later. The biggest creativity killer is critiquing ideas the moment they arrive." },
      { title: "Force remote connections", detail: "Combine unrelated things on purpose (“how is this like a river? a market? a song?”). Originality comes from distant associations." },
      { title: "Feed the well", detail: "Expose yourself to varied domains, people, and inputs — you can only recombine what you've taken in." },
    ],
  },
};

/** Honest, evidence-based ways to support performance on a given cognitive test. */
export function abilityGrowth(testId: string): AbilityGrowth {
  const t = PER_TEST[testId];
  return {
    headline: t?.headline ?? "Supporting your cognitive performance",
    tips: [...(t?.tips ?? []), ...BASICS],
    caveat: HONEST_CAVEAT,
  };
}
