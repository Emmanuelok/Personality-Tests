import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Socionics (the sixteen Types of Information Metabolism).
 *
 * An Eastern-European framework descended from Jung that, like the MBTI, sorts
 * people into sixteen types — but with its own functions, three-letter codes, and
 * four "quadras". This profiler resolves your type from four dichotomies. Items are
 * ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Attitude: high = Extratim (E), low = Introtim (I)
  it("AT1", "My energy flows outward — toward people, action, and the external world.", "ATT"),
  it("AT2", "I think best out loud and with others around.", "ATT"),
  it("AT3", "I'd rather initiate and engage than observe from the side.", "ATT"),
  it("AT4", "I need a lot of quiet, solitary time to feel like myself.", "ATT", -1),
  // Perception: high = Intuition (N), low = Sensing (S)
  it("PE1", "I'm drawn to patterns, possibilities, and what could be.", "PER"),
  it("PE2", "I often live in ideas and the future more than the present.", "PER"),
  it("PE3", "Abstract connections come to me more easily than concrete details.", "PER"),
  it("PE4", "I'm grounded in concrete facts, sensations, and the here-and-now.", "PER", -1),
  // Judgment: high = Logic / Thinking (T), low = Ethics / Feeling (F)
  it("JU1", "I decide by impersonal logic and consistency.", "JUD"),
  it("JU2", "I prize being correct and rational over being agreeable.", "JUD"),
  it("JU3", "I analyze systems more naturally than I read emotions.", "JUD"),
  it("JU4", "I tune into people's feelings and relationships first.", "JUD", -1),
  // Organization: high = Rational (judging-led), low = Irrational (perceiving-led)
  it("OR1", "I like things planned, decided, and settled in advance.", "ORG"),
  it("OR2", "I feel calmer once a decision is made and the path is set.", "ORG"),
  it("OR3", "I keep my life structured and on schedule.", "ORG"),
  it("OR4", "I prefer to stay flexible and adapt as things unfold.", "ORG", -1),
];

// Key = E/I + N/S + T/F + Rational(R)/Irrational(I) -> Socionics type.
const KEY: Record<string, { code: string; nick: string; quadra: string }> = {
  ENTI: { code: "ILE", nick: "the Seeker", quadra: "Alpha" },
  ISFI: { code: "SEI", nick: "the Mediator", quadra: "Alpha" },
  ESFR: { code: "ESE", nick: "the Enthusiast", quadra: "Alpha" },
  INTR: { code: "LII", nick: "the Analyst", quadra: "Alpha" },
  ENFR: { code: "EIE", nick: "the Mentor", quadra: "Beta" },
  ISTR: { code: "LSI", nick: "the Inspector", quadra: "Beta" },
  ESTI: { code: "SLE", nick: "the Conqueror", quadra: "Beta" },
  INFI: { code: "IEI", nick: "the Lyricist", quadra: "Beta" },
  ESFI: { code: "SEE", nick: "the Ambassador", quadra: "Gamma" },
  INTI: { code: "ILI", nick: "the Critic", quadra: "Gamma" },
  ENTR: { code: "LIE", nick: "the Pioneer", quadra: "Gamma" },
  ISFR: { code: "ESI", nick: "the Guardian", quadra: "Gamma" },
  ESTR: { code: "LSE", nick: "the Administrator", quadra: "Delta" },
  INFR: { code: "EII", nick: "the Humanist", quadra: "Delta" },
  ENFI: { code: "IEE", nick: "the Psychologist", quadra: "Delta" },
  ISTI: { code: "SLI", nick: "the Craftsman", quadra: "Delta" },
};

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const e = s.ATT.normalized >= 50;
  const n = s.PER.normalized >= 50;
  const t = s.JUD.normalized >= 50;
  const r = s.ORG.normalized >= 50;
  const key = `${e ? "E" : "I"}${n ? "N" : "S"}${t ? "T" : "F"}${r ? "R" : "I"}`;
  const ty = KEY[key];
  const gaps = [s.ATT, s.PER, s.JUD, s.ORG].map((x) => Math.abs(x.normalized - 50) / 50);
  const confidence = Math.max(0.2, Math.min(0.97, 0.4 + (gaps.reduce((a, b) => a + b, 0) / gaps.length)));
  return {
    code: ty.code,
    title: `${ty.code} — ${ty.nick}`,
    summary: `In Socionics you come out as ${ty.code} (${ty.nick}), a member of the ${ty.quadra} quadra — ${e ? "extratim" : "introtim"}, ${n ? "intuitive" : "sensing"}, ${t ? "logical" : "ethical"}, and ${r ? "rational" : "irrational"}.`,
    components: [
      { label: "Type", value: `${ty.code} — ${ty.nick}`, detail: `${ty.quadra} quadra` },
      { label: "Attitude", value: e ? "Extratim (E)" : "Introtim (I)", detail: e ? "outward-directed energy" : "inward-directed energy" },
      { label: "Perception", value: n ? "Intuition (N)" : "Sensing (S)", detail: n ? "possibilities & patterns" : "concrete & tangible" },
      { label: "Judgment", value: t ? "Logic (T)" : "Ethics (F)", detail: t ? "impersonal analysis" : "people & values" },
      { label: "Organization", value: r ? "Rational" : "Irrational", detail: r ? "planful, judging-led" : "flexible, perceiving-led" },
    ],
    confidence,
  };
}

export const socionics: Instrument = {
  id: "socionics-16",
  name: "Socionics Type",
  shortName: "Socionics",
  kind: "typological",
  category: "types",
  tagline: "The Eastern-European cousin of the MBTI — sixteen types and four quadras.",
  description:
    "Socionics is a Jungian typology developed in Eastern Europe. Like the MBTI it yields sixteen types, but with its " +
    "own model of mental 'functions', distinctive three-letter codes (ILE, SEI, LIE…), and four 'quadras' of kindred " +
    "types. This profiler resolves your type from four dichotomies — a fascinating alternate lens for type enthusiasts.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Socionics' four dichotomies.",
  scales: [
    { id: "ATT", name: "Attitude", description: "Extratim (outward) vs. Introtim (inward) energy.", highDescriptor: "extratim — energized by the outer world", lowDescriptor: "introtim — energized from within", poles: { low: "Introtim", high: "Extratim" }, normMean: 3.0, normSd: 0.78 },
    { id: "PER", name: "Perception", description: "Intuition vs. Sensing.", highDescriptor: "intuitive — patterns and possibility", lowDescriptor: "sensing — concrete and tangible", poles: { low: "Sensing", high: "Intuition" }, normMean: 3.0, normSd: 0.75 },
    { id: "JUD", name: "Judgment", description: "Logic vs. Ethics.", highDescriptor: "logical — impersonal analysis", lowDescriptor: "ethical — people and values", poles: { low: "Ethics", high: "Logic" }, normMean: 3.0, normSd: 0.75 },
    { id: "ORG", name: "Organization", description: "Rational (judging-led) vs. Irrational (perceiving-led).", highDescriptor: "rational — planful and decided", lowDescriptor: "irrational — flexible and emergent", poles: { low: "Irrational", high: "Rational" }, normMean: 3.0, normSd: 0.72 },
  ],
  items,
  resolveType,
  caveats: [
    "Socionics shares the Jungian roots of the MBTI and, like it, has limited empirical validation — enjoy it as a reflective lens, not a fact.",
    "The deeper Socionics theory (Model A, intertype relations) goes well beyond this brief dichotomy-based read.",
    "Type labels describe tendencies, not limits — and people of the same type still differ enormously.",
  ],
  citations: [
    { ref: "Augustinavičiūtė, A. (1980s). Socionics: the theory of information metabolism. (Foundational work.)" },
    { ref: "Jung, C. G. (1921). Psychological Types. (Shared theoretical root.)" },
  ],
};
