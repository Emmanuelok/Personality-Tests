import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Autistic Traits — an EDUCATIONAL, neurodiversity-affirming self-screen for traits
 * associated with autism, across social communication, focus/detail, and
 * routine/sensory facets. Items are ORIGINAL to this platform, informed by the
 * AQ framework. This is a reflection tool, NOT a diagnosis. Autistic traits are
 * differences, not deficits.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Social communication
  it("SC1", "Social situations and small talk often feel confusing or draining.", "SOCIAL"),
  it("SC2", "Reading between the lines and sensing others' emotions doesn't come naturally.", "SOCIAL"),
  it("SC3", "I usually prefer doing things alone to doing them with others.", "SOCIAL"),
  it("SC4", "People have told me I'm blunt or that I miss social cues.", "SOCIAL"),
  // Focus & detail / patterns
  it("DT1", "I notice tiny details and patterns that other people miss.", "DETAIL"),
  it("DT2", "I focus intensely on topics that fascinate me.", "DETAIL"),
  it("DT3", "I love to collect, categorize, or deeply systematize information.", "DETAIL"),
  it("DT4", "I'm more drawn to how systems work than to the social side of things.", "DETAIL"),
  // Routine & sensory
  it("RT1", "I strongly prefer routines and get unsettled when plans change.", "ROUTINE"),
  it("RT2", "I'm sensitive to certain sounds, textures, lights, or sensations.", "ROUTINE"),
  it("RT3", "I like to do the same things in the same way and dislike disruption.", "ROUTINE"),
  it("RT4", "Unexpected change is stressful and hard for me to handle.", "ROUTINE"),
];

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const overall = Math.round((s.SOCIAL.normalized + s.DETAIL.normalized + s.ROUTINE.normalized) / 3);
  const lvl = (n: number) => (n >= 66 ? "many" : n >= 40 ? "some" : "few");
  let code: string;
  if (overall >= 66) code = "Many traits";
  else if (overall >= 40) code = "Some traits";
  else code = "Few traits";
  return {
    code,
    title: `${code[0].toUpperCase()}${code.slice(1)} autistic traits`,
    summary:
      `This is an educational self-screen, not a diagnosis — and autistic traits are differences, not deficits. ` +
      `You reported ${lvl(overall)} traits associated with autism. ` +
      (overall >= 66
        ? "If this resonates and you'd like clarity or support, a clinician experienced in adult autism can offer a proper assessment."
        : "Many people share some of these traits; they're simply part of the rich variation in how minds work."),
    components: [
      { label: "Social communication", value: lvl(s.SOCIAL.normalized), detail: `${Math.round(s.SOCIAL.normalized)}/100` },
      { label: "Focus & detail", value: lvl(s.DETAIL.normalized), detail: `${Math.round(s.DETAIL.normalized)}/100` },
      { label: "Routine & sensory", value: lvl(s.ROUTINE.normalized), detail: `${Math.round(s.ROUTINE.normalized)}/100` },
      { label: "Important", value: "Only a qualified professional can assess autism. This screen can't." },
    ],
    confidence: 0.6,
  };
}

export const autism: Instrument = {
  id: "autism-traits",
  name: "Autistic Traits (educational screen)",
  shortName: "Autistic Traits",
  kind: "typological",
  category: "mind",
  tagline: "Explore how your mind is wired — a neurodiversity-affirming reflection.",
  description:
    "An educational, affirming self-reflection screen for traits associated with autism — across social " +
    "communication, focus and detail, and routine and sensory sensitivity. Autistic traits are differences in " +
    "how minds work, not deficits. This is NOT a diagnostic tool: only a qualified professional can assess autism.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, informed by the Autism Spectrum Quotient (AQ) framework. Educational, affirming use only.",
  scales: [
    { id: "SOCIAL", name: "Social Communication", description: "How social interaction and reading others feel for you.", highDescriptor: "finding social cues effortful and solitude comfortable", lowDescriptor: "socially intuitive and at ease", poles: { low: "Socially intuitive", high: "Socially effortful" }, normMean: 2.9, normSd: 0.85 },
    { id: "DETAIL", name: "Focus & Detail", description: "Attention to detail, patterns, and deep interests.", highDescriptor: "detail-focused, systematic, and deeply absorbed in interests", lowDescriptor: "more big-picture than detail-driven", poles: { low: "Big-picture", high: "Detail-focused" }, normMean: 3.3, normSd: 0.78 },
    { id: "ROUTINE", name: "Routine & Sensory", description: "Preference for routine and sensitivity to sensory input.", highDescriptor: "routine-loving and sensorily sensitive", lowDescriptor: "flexible with change and less sensory-sensitive", poles: { low: "Flexible", high: "Routine-seeking" }, normMean: 3.0, normSd: 0.82 },
  ],
  items,
  resolveType,
  caveats: [
    "This is NOT a diagnosis. Only a qualified professional can assess autism, and many autistic people are diagnosed late or self-identify.",
    "Autistic traits are differences, not deficits — every profile here is valid and whole.",
    "If this resonates and you want clarity or support, an autism-informed clinician can help.",
  ],
  citations: [
    { ref: "Baron-Cohen, S., et al. (2001). The Autism-Spectrum Quotient (AQ). Journal of Autism and Developmental Disorders, 31(1), 5–17." },
    { ref: "Kapp, S. K., et al. (2013). Deficit, difference, or both? Autism and neurodiversity. Developmental Psychology, 49(1), 59–71." },
  ],
};
