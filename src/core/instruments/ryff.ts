import type { Instrument, Item } from "../types";

/**
 * Ryff Psychological Well-Being — six dimensions of eudaimonic flourishing
 * (autonomy, environmental mastery, personal growth, positive relations, purpose,
 * self-acceptance). Original items inspired by Ryff's scales.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("AU1", "I'm not afraid to voice my opinions, even when they differ from the crowd.", "AUT"),
  it("AU2", "I judge myself by my own standards, not by what others think.", "AUT"),
  it("AU3", "I'm easily swayed by the opinions of those around me.", "AUT", -1),
  it("MA1", "I manage the demands of daily life well.", "MAS"),
  it("MA2", "I've built a life and surroundings that suit me.", "MAS"),
  it("MA3", "The demands of everyday life often get on top of me.", "MAS", -1),
  it("GR1", "I see myself as growing and developing as a person.", "GRO"),
  it("GR2", "I seek out new experiences that challenge how I see myself.", "GRO"),
  it("GR3", "I feel I've stopped growing or improving.", "GRO", -1),
  it("RE1", "I have warm, trusting relationships I can count on.", "REL"),
  it("RE2", "People would describe me as a giving person.", "REL"),
  it("RE3", "I find it hard to be truly open with other people.", "REL", -1),
  it("PU1", "I have a clear sense of direction and purpose in life.", "PUR"),
  it("PU2", "My goals give my life meaning.", "PUR"),
  it("PU3", "I sometimes feel my life lacks real purpose.", "PUR", -1),
  it("AC1", "I like most aspects of who I am.", "ACC"),
  it("AC2", "I'm largely at peace with how my life has turned out.", "ACC"),
  it("AC3", "I'm disappointed about many things in my life.", "ACC", -1),
];

export const ryff: Instrument = {
  id: "ryff-wellbeing",
  name: "Psychological Well-Being",
  shortName: "Well-Being",
  kind: "dimensional",
  category: "wellbeing",
  tagline: "Six pillars of a life well-lived, beyond just feeling good.",
  description:
    "Carol Ryff argued that wellbeing is more than pleasant feelings — it's flourishing. Her model maps six dimensions: " +
    "Autonomy, Environmental Mastery, Personal Growth, Positive Relations, Purpose in Life, and Self-Acceptance. " +
    "Together they sketch a richer, eudaimonic picture of how fully you're living — and which pillar would most repay attention.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Ryff's Psychological Well-Being scales.",
  scales: [
    { id: "AUT", name: "Autonomy", description: "Self-direction and independence from social pressure.", highDescriptor: "self-governing and true to your own standards", lowDescriptor: "guided heavily by others' expectations", poles: { low: "Other-directed", high: "Self-directed" }, normMean: 3.4, normSd: 0.72 },
    { id: "MAS", name: "Environmental Mastery", description: "Managing life and shaping your surroundings.", highDescriptor: "on top of life's demands and in command of your context", lowDescriptor: "often overwhelmed by everyday demands", poles: { low: "Overwhelmed", high: "In command" }, normMean: 3.4, normSd: 0.74 },
    { id: "GRO", name: "Personal Growth", description: "Continued development and openness to challenge.", highDescriptor: "growing, learning, and expanding", lowDescriptor: "feeling static or stalled", poles: { low: "Static", high: "Growing" }, normMean: 3.7, normSd: 0.68 },
    { id: "REL", name: "Positive Relations", description: "Warm, trusting, giving relationships.", highDescriptor: "warmly and deeply connected to others", lowDescriptor: "more isolated or guarded in relationships", poles: { low: "Guarded", high: "Connected" }, normMean: 3.6, normSd: 0.74 },
    { id: "PUR", name: "Purpose in Life", description: "Direction, meaning, and goals.", highDescriptor: "anchored in clear purpose and meaning", lowDescriptor: "searching for direction", poles: { low: "Adrift", high: "Purposeful" }, normMean: 3.5, normSd: 0.78 },
    { id: "ACC", name: "Self-Acceptance", description: "A positive, peaceful regard for yourself and your past.", highDescriptor: "accepting and at peace with who you are", lowDescriptor: "self-critical or unsettled about your life", poles: { low: "Self-critical", high: "Self-accepting" }, normMean: 3.4, normSd: 0.8 },
  ],
  items,
  caveats: [
    "Eudaimonic wellbeing is about living fully, which is distinct from moment-to-moment happiness — you can score differently on each.",
    "Every pillar is buildable; a lower one is an invitation, not a flaw.",
    "An educational self-reflection, not a clinical measure.",
  ],
  citations: [
    { ref: "Ryff, C. D. (1989). Happiness is everything, or is it? Explorations on the meaning of psychological well-being. JPSP, 57(6), 1069–1081." },
    { ref: "Ryff, C. D., & Keyes, C. L. M. (1995). The structure of psychological well-being revisited. JPSP, 69(4), 719–727." },
  ],
};
