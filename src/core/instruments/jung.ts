import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Jungian Type Profiler — 16 psychological types across four dichotomies.
 *
 * Grounded in Jung's theory of psychological types (attitudes of Extraversion/
 * Introversion and the functions of Sensation, Intuition, Thinking, Feeling) and
 * the type framework later operationalized by Myers & Briggs. The item wording is
 * ORIGINAL to this platform — the MBTI® instrument's items are proprietary; this
 * is an independent measure of the same Jungian dichotomies and is not affiliated
 * with or endorsed by the Myers-Briggs Company.
 */

const L = {
  min: 1,
  max: 5,
  labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
};

const it = (id: string, text: string, scale: string, keyed: 1 | -1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Extraversion (high) ↔ Introversion (low)
  it("EI1", "Meeting new people tends to energize me more than it drains me.", "EI", 1),
  it("EI2", "I think out loud, working ideas through by talking them over with others.", "EI", 1),
  it("EI3", "In a lively group I'm usually one of the more talkative people.", "EI", 1),
  it("EI4", "I actively seek out social events to recharge after a busy stretch.", "EI", 1),
  it("EI5", "After a lot of socializing I need solitude to feel like myself again.", "EI", -1),
  it("EI6", "I do my best thinking quietly and alone before I share it.", "EI", -1),
  it("EI7", "I prefer a few deep friendships to a wide circle of acquaintances.", "EI", -1),
  it("EI8", "Large gatherings often leave me depleted rather than energized.", "EI", -1),

  // Intuition (high) ↔ Sensing (low)
  it("SN1", "I'm drawn to abstract ideas, patterns, and what things could become.", "SN", 1),
  it("SN2", "I often notice connections and meanings that aren't obvious on the surface.", "SN", 1),
  it("SN3", "I enjoy imagining future possibilities more than managing present details.", "SN", 1),
  it("SN4", "I trust theories and hunches nearly as much as hard facts.", "SN", 1),
  it("SN5", "I focus on concrete facts and what is actually in front of me.", "SN", -1),
  it("SN6", "I trust direct experience more than speculation about possibilities.", "SN", -1),
  it("SN7", "I prefer practical, step-by-step instructions to open-ended concepts.", "SN", -1),
  it("SN8", "I tend to notice specific, sensory details that others overlook.", "SN", -1),

  // Feeling (high) ↔ Thinking (low)
  it("TF1", "When deciding, I weigh how people will be affected as much as the logic.", "TF", 1),
  it("TF2", "Keeping harmony in a group matters a great deal to me.", "TF", 1),
  it("TF3", "My personal values and empathy guide how I judge a situation.", "TF", 1),
  it("TF4", "I find it easy to feel what another person is feeling.", "TF", 1),
  it("TF5", "I prefer to decide by impartial logic, even if it ruffles some feelings.", "TF", -1),
  it("TF6", "I value being candid and consistent over being tactful.", "TF", -1),
  it("TF7", "I tend to analyze problems objectively, setting emotion aside.", "TF", -1),
  it("TF8", "Fairness by a clear principle matters more to me than everyone's comfort.", "TF", -1),

  // Judging (high) ↔ Perceiving (low)
  it("JP1", "I like to plan ahead and settle decisions well before the deadline.", "JP", 1),
  it("JP2", "I feel calmer when my day follows an organized schedule.", "JP", 1),
  it("JP3", "I prefer matters decided and closed rather than left open.", "JP", 1),
  it("JP4", "I make lists and enjoy checking tasks off in order.", "JP", 1),
  it("JP5", "I'd rather keep my options open than commit to a fixed plan.", "JP", -1),
  it("JP6", "I work best in spontaneous bursts rather than steady, scheduled effort.", "JP", -1),
  it("JP7", "Last-minute flexibility suits me better than a set routine.", "JP", -1),
  it("JP8", "I often start something new before I've finished the last thing.", "JP", -1),
];

interface TypeMeta {
  title: string;
  stack: [string, string, string, string]; // dominant, auxiliary, tertiary, inferior
  summary: string;
}

const TYPES: Record<string, TypeMeta> = {
  ISTJ: { title: "The Inspector", stack: ["Si", "Te", "Fi", "Ne"], summary: "Dependable, methodical, and loyal to commitments and standards." },
  ISFJ: { title: "The Protector", stack: ["Si", "Fe", "Ti", "Ne"], summary: "Warm, conscientious, and quietly devoted to caring for others." },
  INFJ: { title: "The Counselor", stack: ["Ni", "Fe", "Ti", "Se"], summary: "Insightful and principled, guided by a private vision of what could be." },
  INTJ: { title: "The Architect", stack: ["Ni", "Te", "Fi", "Se"], summary: "Strategic and independent, building long-range systems toward a goal." },
  ISTP: { title: "The Craftsman", stack: ["Ti", "Se", "Ni", "Fe"], summary: "Practical problem-solver who masters how things actually work." },
  ISFP: { title: "The Composer", stack: ["Fi", "Se", "Ni", "Te"], summary: "Gentle, present-focused, and guided by deeply held personal values." },
  INFP: { title: "The Mediator", stack: ["Fi", "Ne", "Si", "Te"], summary: "Idealistic and imaginative, anchored to a strong inner moral compass." },
  INTP: { title: "The Logician", stack: ["Ti", "Ne", "Si", "Fe"], summary: "Analytical and inventive, driven to understand the underlying logic of things." },
  ESTP: { title: "The Dynamo", stack: ["Se", "Ti", "Fe", "Ni"], summary: "Bold and pragmatic, thriving on action and real-time problem solving." },
  ESFP: { title: "The Performer", stack: ["Se", "Fi", "Te", "Ni"], summary: "Spontaneous and warm, bringing energy and delight to the present moment." },
  ENFP: { title: "The Champion", stack: ["Ne", "Fi", "Te", "Si"], summary: "Enthusiastic and imaginative, seeing possibility and potential in people." },
  ENTP: { title: "The Visionary", stack: ["Ne", "Ti", "Fe", "Si"], summary: "Quick, inventive debater who loves generating and testing new ideas." },
  ESTJ: { title: "The Supervisor", stack: ["Te", "Si", "Ne", "Fi"], summary: "Organized and decisive, marshaling people and resources to get results." },
  ESFJ: { title: "The Provider", stack: ["Fe", "Si", "Ne", "Ti"], summary: "Sociable and dutiful, attentive to others' needs and group harmony." },
  ENFJ: { title: "The Teacher", stack: ["Fe", "Ni", "Se", "Ti"], summary: "Charismatic and empathic, drawing the best out of the people around them." },
  ENTJ: { title: "The Commander", stack: ["Te", "Ni", "Se", "Fi"], summary: "Strategic leader who organizes the world toward an ambitious vision." },
};

const FUNCTION_NAMES: Record<string, string> = {
  Ni: "Introverted Intuition", Ne: "Extraverted Intuition",
  Si: "Introverted Sensing", Se: "Extraverted Sensing",
  Ti: "Introverted Thinking", Te: "Extraverted Thinking",
  Fi: "Introverted Feeling", Fe: "Extraverted Feeling",
};

const MID = 3; // midpoint of the 1..5 range

function clarityLabel(distance: number): string {
  if (distance >= 1.3) return "very clear";
  if (distance >= 0.8) return "clear";
  if (distance >= 0.35) return "moderate";
  return "slight";
}

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const axis = (id: string, hi: string, lo: string) => {
    const mean = s[id].mean;
    const dist = Math.abs(mean - MID);
    return { letter: mean >= MID ? hi : lo, dist, clarity: clarityLabel(dist), mean };
  };
  const e = axis("EI", "E", "I");
  const n = axis("SN", "N", "S");
  const f = axis("TF", "F", "T");
  const j = axis("JP", "J", "P");

  const code = `${e.letter}${n.letter}${f.letter}${j.letter}`;
  const meta = TYPES[code];

  // Confidence = how decisively the four axes fell away from the midpoint.
  const confidence = Math.min(1, ((e.dist + n.dist + f.dist + j.dist) / 4) / 2);

  // A meaningful runner-up flips the single least-decisive axis.
  const dists = [e.dist, n.dist, f.dist, j.dist];
  const flipIdx = dists.indexOf(Math.min(...dists));
  const letters = [e.letter, n.letter, f.letter, j.letter];
  const flips: Record<string, [string, string]> = { E: ["E", "I"], I: ["I", "E"], N: ["N", "S"], S: ["S", "N"], F: ["F", "T"], T: ["T", "F"], J: ["J", "P"], P: ["P", "J"] };
  const flipped = letters.slice();
  flipped[flipIdx] = flips[letters[flipIdx]][1];
  const secondary = flipped.join("");

  const stack = meta.stack
    .map((fn, i) => `${["dominant", "auxiliary", "tertiary", "inferior"][i]} ${fn} (${FUNCTION_NAMES[fn]})`)
    .join(", ");

  return {
    code,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: "Energy", value: e.letter === "E" ? "Extraversion" : "Introversion", detail: `${e.clarity} preference` },
      { label: "Information", value: n.letter === "N" ? "Intuition" : "Sensing", detail: `${n.clarity} preference` },
      { label: "Decisions", value: f.letter === "F" ? "Feeling" : "Thinking", detail: `${f.clarity} preference` },
      { label: "Structure", value: j.letter === "J" ? "Judging" : "Perceiving", detail: `${j.clarity} preference` },
      { label: "Cognitive function stack", value: stack },
    ],
    confidence,
    secondary: secondary !== code ? secondary : undefined,
  };
}

export const jungTypes: Instrument = {
  id: "jung-16-types",
  name: "Jungian Type Profiler (16 Types)",
  shortName: "16 Types",
  kind: "typological",
  tagline: "Four dichotomies, sixteen types — the Jungian map of the mind.",
  description:
    "Based on Carl Jung's theory of psychological types and the four-dichotomy framework popularized by " +
    "Myers & Briggs. Estimates your preferences on four axes — Extraversion/Introversion, Sensing/Intuition, " +
    "Thinking/Feeling, Judging/Perceiving — and resolves them into one of sixteen types, complete with the " +
    "Jungian cognitive-function stack that underlies it.",
  estMinutes: 6,
  responseFormat: L,
  itemProvenance:
    "Original items written for this platform to measure the Jungian dichotomies; not the proprietary MBTI® instrument.",
  scales: [
    { id: "EI", name: "Extraversion–Introversion", description: "Where attention and energy are primarily directed.", highDescriptor: "outward, toward people and action", lowDescriptor: "inward, toward reflection and depth", poles: { low: "Introversion", high: "Extraversion" }, normMean: 3.0, normSd: 0.85 },
    { id: "SN", name: "Sensing–Intuition", description: "How information is taken in and trusted.", highDescriptor: "abstract patterns and future possibility", lowDescriptor: "concrete facts and present reality", poles: { low: "Sensing", high: "Intuition" }, normMean: 3.0, normSd: 0.85 },
    { id: "TF", name: "Thinking–Feeling", description: "How decisions are weighed and made.", highDescriptor: "values, empathy, and human impact", lowDescriptor: "impartial logic and objective principle", poles: { low: "Thinking", high: "Feeling" }, normMean: 3.0, normSd: 0.85 },
    { id: "JP", name: "Judging–Perceiving", description: "How the outer world is approached.", highDescriptor: "planned, decided, and structured", lowDescriptor: "open, flexible, and spontaneous", poles: { low: "Perceiving", high: "Judging" }, normMean: 3.0, normSd: 0.85 },
  ],
  items,
  resolveType,
  caveats: [
    "Type is a useful lens, not a box — most people use both sides of every dichotomy depending on context.",
    "Preferences near the midpoint are genuinely balanced; treat a borderline letter as a coin-flip, not a verdict.",
    "This is an independent Jungian measure and is not the MBTI® assessment or affiliated with its publisher.",
  ],
  citations: [
    { ref: "Jung, C. G. (1921/1971). Psychological Types (Collected Works, Vol. 6). Princeton University Press.", note: "Original theory of attitudes and functions." },
    { ref: "Myers, I. B., & Myers, P. B. (1980). Gifts Differing: Understanding Personality Type. Davies-Black.", note: "Operationalization into 16 types and the dichotomies." },
    { ref: "Myers, I. B., McCaulley, M. H., Quenk, N. L., & Hammer, A. L. (1998). MBTI Manual (3rd ed.). Consulting Psychologists Press.", note: "Reference for the type and function-stack framework (instrument not used here)." },
  ],
};
