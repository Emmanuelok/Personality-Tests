import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Career Interests (Holland's RIASEC model) — six interest themes that predict the
 * work environments where people thrive: Realistic, Investigative, Artistic,
 * Social, Enterprising, Conventional. Resolves your three-letter Holland code and
 * concrete career fields that fit it. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Dislike", "Slightly", "Neutral", "Like", "Love it"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("R1", "Working with my hands, tools, machines, or the outdoors.", "R"),
  it("R2", "Building, fixing, or operating things with tangible results.", "R"),
  it("R3", "Practical, hands-on, physical tasks over desk work.", "R"),
  it("I1", "Analyzing problems, data, and how things work.", "I"),
  it("I2", "Research, science, and figuring things out from first principles.", "I"),
  it("I3", "Diving into ideas, theories, and deep understanding.", "I"),
  it("A1", "Expressing myself through art, writing, music, or design.", "A"),
  it("A2", "Creative, original work with room to improvise.", "A"),
  it("A3", "Aesthetic, imaginative, unstructured projects.", "A"),
  it("S1", "Helping, teaching, coaching, or caring for people.", "S"),
  it("S2", "Working closely with others and supporting them.", "S"),
  it("S3", "Work that visibly improves people's lives.", "S"),
  it("E1", "Leading, persuading, pitching, and selling ideas.", "E"),
  it("E2", "Business, ambition, deals, and influence.", "E"),
  it("E3", "Taking charge and driving toward goals and growth.", "E"),
  it("C1", "Organized, detail-oriented work with clear procedures.", "C"),
  it("C2", "Managing data, records, schedules, and systems.", "C"),
  it("C3", "Clear rules and orderly processes over ambiguity.", "C"),
];

const NAMES: Record<string, string> = { R: "Realistic", I: "Investigative", A: "Artistic", S: "Social", E: "Enterprising", C: "Conventional" };
const MATCHES: Record<string, string[]> = {
  R: ["Engineering", "Skilled trades", "Architecture & construction", "Agriculture & environment", "Logistics & operations", "Athletics & physical work"],
  I: ["Science & research", "Data science & analytics", "Medicine & healthcare", "Software engineering", "Academia", "Strategy & analysis"],
  A: ["Design (graphic/UX/product)", "Writing & media", "Music & performing arts", "Marketing & creative", "Architecture (design)", "Film & content"],
  S: ["Teaching & education", "Nursing & healthcare", "Counseling & therapy", "Social work", "HR & people ops", "Community & nonprofit"],
  E: ["Entrepreneurship", "Sales & business development", "Management & leadership", "Law", "Marketing & PR", "Finance & consulting"],
  C: ["Accounting & finance", "Operations & administration", "Project management", "Data & records management", "Compliance & QA", "Banking"],
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const ids = ["R", "I", "A", "S", "E", "C"];
  const sorted = ids.map((id) => ({ id, mean: s[id].mean })).sort((a, b) => b.mean - a.mean);
  const top3 = sorted.slice(0, 3);
  const code = top3.map((x) => x.id).join("");

  // Career fields from the top two themes, de-duplicated.
  const fields = Array.from(new Set([...MATCHES[top3[0].id], ...MATCHES[top3[1].id]])).slice(0, 6);
  const sep = sorted[0].mean - sorted[3].mean;

  return {
    code,
    title: `Holland code: ${code}`,
    summary: `Your strongest career interests are ${top3.map((x) => NAMES[x.id]).join(", ")}. You'll do your best work where those themes are central.`,
    components: [
      { label: "Holland code", value: code, detail: top3.map((x) => NAMES[x.id]).join(" · ") },
      { label: "Top interest", value: NAMES[top3[0].id] },
      { label: "Career matches", value: fields.join(" · ") },
      { label: "Tip", value: "Look for roles that combine your top two themes — that overlap is your sweet spot." },
    ],
    confidence: Math.max(0.3, Math.min(0.97, 0.45 + sep)),
    secondary: NAMES[top3[1].id],
  };
}

export const riasec: Instrument = {
  id: "riasec-careers",
  name: "Career Interests (Holland Code)",
  shortName: "Career",
  kind: "typological",
  category: "career",
  tagline: "Your Holland code — and the careers that fit it.",
  description:
    "Holland's RIASEC model is the backbone of modern career counseling. It maps six interest themes — " +
    "Realistic, Investigative, Artistic, Social, Enterprising, Conventional — and your top three form your " +
    "'Holland code.' This profiler finds yours and translates it into concrete career fields worth exploring.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original interest items written for this platform, grounded in Holland's RIASEC theory of vocational interests.",
  scales: [
    { id: "R", name: "Realistic", description: "Hands-on, practical, physical, technical work.", highDescriptor: "practical, hands-on, and technically inclined", lowDescriptor: "less drawn to hands-on technical work", normMean: 3.0, normSd: 0.8 },
    { id: "I", name: "Investigative", description: "Analytical, scientific, idea-driven work.", highDescriptor: "analytical, curious, and research-minded", lowDescriptor: "less drawn to analysis and research", normMean: 3.3, normSd: 0.78 },
    { id: "A", name: "Artistic", description: "Creative, expressive, unstructured work.", highDescriptor: "creative, expressive, and original", lowDescriptor: "less drawn to artistic, open-ended work", normMean: 3.2, normSd: 0.82 },
    { id: "S", name: "Social", description: "Helping, teaching, caring work with people.", highDescriptor: "people-centered, helpful, and caring", lowDescriptor: "less drawn to people-helping roles", normMean: 3.5, normSd: 0.75 },
    { id: "E", name: "Enterprising", description: "Leading, persuading, business-driven work.", highDescriptor: "ambitious, persuasive, and leadership-oriented", lowDescriptor: "less drawn to leading and selling", normMean: 3.2, normSd: 0.78 },
    { id: "C", name: "Conventional", description: "Organized, detail-oriented, structured work.", highDescriptor: "organized, detail-oriented, and systematic", lowDescriptor: "less drawn to structured, procedural work", normMean: 3.1, normSd: 0.78 },
  ],
  items,
  resolveType,
  caveats: [
    "Interests aren't the same as skills or salary — they predict fit and satisfaction, not guaranteed success.",
    "Your code can evolve with experience; revisit it at career turning points.",
    "Use the career matches as starting points to explore, not a fixed list.",
  ],
  citations: [
    { ref: "Holland, J. L. (1997). Making Vocational Choices: A Theory of Vocational Personalities and Work Environments (3rd ed.). PAR." },
    { ref: "Nauta, M. M. (2010). The development, evolution, and status of Holland's theory of vocational personalities. Journal of Counseling Psychology, 57(1), 11–22." },
  ],
};
