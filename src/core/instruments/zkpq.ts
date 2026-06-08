import type { Instrument, Item } from "../types";

/**
 * Zuckerman-Kuhlman "Alternative Five" (ZKPQ).
 *
 * A biologically-oriented alternative to the Big Five, built from the trait terms
 * Zuckerman argued have the clearest evolutionary and neurochemical basis. Items
 * are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("IS1", "I act on impulse and crave new, exciting experiences.", "IMPSS"),
  it("IS2", "I like to do things just for the thrill of it.", "IMPSS"),
  it("IS3", "I plan carefully and steer clear of risks.", "IMPSS", -1),
  it("NA1", "I often feel tense, worried, or upset.", "NANX"),
  it("NA2", "Little things easily get me down or anxious.", "NANX"),
  it("NA3", "I'm calm and rarely rattled.", "NANX", -1),
  it("AH1", "I can be sharp-tongued or quick to anger when provoked.", "AGGH"),
  it("AH2", "I'll readily argue and stand my ground, even bluntly.", "AGGH"),
  it("AH3", "I'm patient and slow to anger.", "AGGH", -1),
  it("AC1", "I'm always on the go and like to keep busy.", "ACT"),
  it("AC2", "I prefer an active, fast-paced life to a relaxed one.", "ACT"),
  it("AC3", "I'm happiest at a slow, leisurely pace.", "ACT", -1),
  it("SY1", "I love being around lots of people and social activity.", "SY"),
  it("SY2", "I'd rather be at a lively party than home alone.", "SY"),
  it("SY3", "I prefer solitude or small gatherings to big crowds.", "SY", -1),
];

export const zkpq: Instrument = {
  id: "zkpq-alt5",
  name: "Alternative Five (ZKPQ)",
  shortName: "Alt-Five",
  kind: "dimensional",
  category: "core",
  tagline: "Zuckerman's biologically-grounded rival to the Big Five.",
  description:
    "Marvin Zuckerman argued the Big Five wasn't quite the right cut of nature's joints, and proposed an 'Alternative " +
    "Five' rooted in traits with clearer biological and evolutionary bases: Impulsive Sensation Seeking, " +
    "Neuroticism-Anxiety, Aggression-Hostility, Activity, and Sociability. A fascinating second opinion on the structure " +
    "of personality.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Zuckerman-Kuhlman Personality Questionnaire.",
  scales: [
    { id: "IMPSS", name: "Impulsive Sensation Seeking", description: "Impulsivity plus a craving for thrill and novelty.", highDescriptor: "impulsive and hungry for novel thrills", lowDescriptor: "planful and risk-averse", poles: { low: "Deliberate", high: "Impulsive-seeking" }, normMean: 3.0, normSd: 0.82 },
    { id: "NANX", name: "Neuroticism-Anxiety", description: "Tension, worry, and emotional upset.", highDescriptor: "tense, worried, and easily upset", lowDescriptor: "calm and emotionally steady", poles: { low: "Calm", high: "Anxious" }, normMean: 3.0, normSd: 0.82 },
    { id: "AGGH", name: "Aggression-Hostility", description: "Readiness for anger, argument, and hostility.", highDescriptor: "quick-tempered, blunt, and combative", lowDescriptor: "patient, mild, and slow to anger", poles: { low: "Easygoing", high: "Hostile" }, normMean: 2.7, normSd: 0.76 },
    { id: "ACT", name: "Activity", description: "Energy, busyness, and need for action.", highDescriptor: "energetic, restless, and always on the go", lowDescriptor: "relaxed and content with a slow pace", poles: { low: "Relaxed", high: "Active" }, normMean: 3.2, normSd: 0.74 },
    { id: "SY", name: "Sociability", description: "Enjoyment of people, parties, and social activity.", highDescriptor: "outgoing and energized by crowds", lowDescriptor: "happiest in solitude or small groups", poles: { low: "Solitary", high: "Sociable" }, normMean: 3.2, normSd: 0.78 },
  ],
  items,
  caveats: [
    "The Alternative Five overlaps the Big Five but isn't identical — notably it has no direct 'Openness' factor and folds impulsivity into sensation seeking.",
    "With three items per scale this is a brief screen, not the full ZKPQ.",
    "This is an educational self-reflection tool, not a clinical instrument.",
  ],
  citations: [
    { ref: "Zuckerman, M., Kuhlman, D. M., Joireman, J., Teta, P., & Kraft, M. (1993). A comparison of three structural models for personality. Journal of Personality and Social Psychology, 65(4), 757–768." },
    { ref: "Zuckerman, M. (2002). Zuckerman-Kuhlman Personality Questionnaire (ZKPQ): An alternative five-factorial model. In Big Five Assessment." },
  ],
};
