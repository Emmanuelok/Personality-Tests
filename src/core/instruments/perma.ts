import type { Instrument, Item } from "../types";

/**
 * Flourishing — PERMA wellbeing profile.
 *
 * Martin Seligman's PERMA model frames wellbeing as five buildable pillars:
 * Positive emotion, Engagement, Relationships, Meaning, and Accomplishment. This is
 * a strengths-based snapshot of how you're flourishing right now (a momentary read,
 * not a clinical measure). Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Almost never", "Rarely", "Sometimes", "Often", "Almost always"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("P1", "I frequently feel joy, gratitude, or contentment.", "POS"),
  it("P2", "Good feelings are a regular part of my days.", "POS"),
  it("P3", "I rarely feel positive or cheerful lately.", "POS", -1),
  it("E1", "I often get completely absorbed in what I'm doing.", "ENG"),
  it("E2", "I lose track of time when engaged in something I love.", "ENG"),
  it("E3", "I'm rarely fully absorbed or 'in flow'.", "ENG", -1),
  it("R1", "I have close, supportive relationships I can count on.", "REL"),
  it("R2", "I feel loved and connected to other people.", "REL"),
  it("R3", "I often feel lonely or unsupported.", "REL", -1),
  it("M1", "My life has a clear sense of purpose and meaning.", "MEA"),
  it("M2", "What I do feels worthwhile and significant.", "MEA"),
  it("M3", "I often feel my life lacks direction or purpose.", "MEA", -1),
  it("A1", "I regularly accomplish goals that matter to me.", "ACC"),
  it("A2", "I feel a real sense of achievement and progress.", "ACC"),
  it("A3", "I rarely feel I'm achieving what I set out to do.", "ACC", -1),
];

export const perma: Instrument = {
  id: "perma-flourishing",
  name: "Flourishing (PERMA)",
  shortName: "PERMA",
  kind: "dimensional",
  category: "emotional",
  tagline: "Five buildable pillars of a life going well.",
  description:
    "Wellbeing isn't one thing — Martin Seligman's PERMA model breaks it into five pillars you can each grow: " +
    "Positive emotion, Engagement, Relationships, Meaning, and Accomplishment. This is a warm, strengths-based snapshot " +
    "of how you're flourishing right now and which pillar would most repay your attention.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Seligman's PERMA model of wellbeing.",
  scales: [
    { id: "POS", name: "Positive Emotion", description: "Joy, gratitude, contentment, and hope.", highDescriptor: "rich in everyday positive feeling", lowDescriptor: "low on positive feeling lately", poles: { low: "Depleted", high: "Joyful" }, normMean: 3.3, normSd: 0.8 },
    { id: "ENG", name: "Engagement", description: "Absorption and flow in what you do.", highDescriptor: "often deeply absorbed and in flow", lowDescriptor: "rarely fully engaged", poles: { low: "Disengaged", high: "Absorbed" }, normMean: 3.3, normSd: 0.78 },
    { id: "REL", name: "Relationships", description: "Closeness, support, and belonging.", highDescriptor: "well-connected and supported", lowDescriptor: "lonely or under-supported", poles: { low: "Isolated", high: "Connected" }, normMean: 3.5, normSd: 0.82 },
    { id: "MEA", name: "Meaning", description: "Purpose and significance.", highDescriptor: "anchored in purpose and significance", lowDescriptor: "searching for direction", poles: { low: "Adrift", high: "Purposeful" }, normMean: 3.4, normSd: 0.82 },
    { id: "ACC", name: "Accomplishment", description: "Mastery, progress, and achievement.", highDescriptor: "a strong sense of achievement and progress", lowDescriptor: "low on a sense of achievement", poles: { low: "Stalled", high: "Accomplished" }, normMean: 3.3, normSd: 0.78 },
  ],
  items,
  caveats: [
    "Wellbeing naturally rises and falls — this is a snapshot of a season, not a fixed trait or a grade.",
    "Each pillar is buildable; a low score points to where small, deliberate practices can help most.",
    "This is a positive-psychology reflection tool, not a clinical or diagnostic measure. If low mood persists or feels heavy, please consider reaching out to a mental-health professional.",
  ],
  citations: [
    { ref: "Seligman, M. E. P. (2011). Flourish: A Visionary New Understanding of Happiness and Well-being. Free Press." },
    { ref: "Butler, J., & Kern, M. L. (2016). The PERMA-Profiler. International Journal of Wellbeing, 6(3), 1–48." },
  ],
};
