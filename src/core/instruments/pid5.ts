import type { Instrument, Item } from "../types";

/**
 * Maladaptive Trait Domains (PID-5 / DSM-5 Alternative Model tradition).
 *
 * The DSM-5's dimensional trait model describes personality difficulty along five
 * broad domains — essentially the "maladaptive" mirror of the Big Five. This is an
 * EDUCATIONAL self-reflection screen with original items; it is explicitly NOT a
 * diagnostic instrument.
 */

const L = { min: 1, max: 5, labels: ["Very false for me", "Somewhat false", "Neutral", "Somewhat true", "Very true for me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Negative Affectivity
  it("NA1", "My emotions swing intensely and can change quickly.", "NEGA"),
  it("NA2", "I worry about a great many different things.", "NEGA"),
  it("NA3", "I get very anxious when people important to me might pull away.", "NEGA"),
  it("NA4", "Small stresses can leave me feeling overwhelmed.", "NEGA"),
  // Detachment
  it("DE1", "I keep my distance from people, even those close to me.", "DETA"),
  it("DE2", "I rarely get much pleasure or enthusiasm out of life.", "DETA"),
  it("DE3", "I'd usually rather be alone than with others.", "DETA"),
  it("DE4", "I don't show much emotion to other people.", "DETA"),
  // Antagonism
  it("AN1", "I use charm or flattery to get what I want.", "ANTA"),
  it("AN2", "I feel I deserve special treatment.", "ANTA"),
  it("AN3", "I'll bend the truth when it suits me.", "ANTA"),
  it("AN4", "I don't mind putting my own interests well ahead of others'.", "ANTA"),
  // Disinhibition
  it("DI1", "I act on impulse without thinking ahead.", "DISI"),
  it("DI2", "I often don't follow through on my obligations.", "DISI"),
  it("DI3", "I get distracted easily and leave things unfinished.", "DISI"),
  it("DI4", "I take risks that could cause me real problems.", "DISI"),
  // Psychoticism
  it("PS1", "I have experiences others would find hard to believe.", "PSYO"),
  it("PS2", "My thoughts often feel scattered or hard to follow.", "PSYO"),
  it("PS3", "People tell me my ideas or behavior are unusual or eccentric.", "PSYO"),
  it("PS4", "I sometimes have perceptions or hunches that feel hard to explain.", "PSYO"),
];

export const pid5: Instrument = {
  id: "pid5-maladaptive",
  name: "Maladaptive Trait Domains",
  shortName: "Trait Domains",
  kind: "dimensional",
  category: "shadow",
  tagline: "The DSM-5's five trait domains — the 'difficult' mirror of the Big Five.",
  description:
    "Modern psychiatry describes personality difficulty not as boxes but as dimensions: five broad trait domains that " +
    "are essentially the maladaptive end of the Big Five — Negative Affectivity, Detachment, Antagonism, Disinhibition, " +
    "and Psychoticism. This educational screen maps where you sit on each, as a prompt for self-understanding — never a diagnosis.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the DSM-5 trait model (PID-5 domains).",
  scales: [
    { id: "NEGA", name: "Negative Affectivity", description: "Frequent, intense negative emotion (the maladaptive pole of high Neuroticism).", highDescriptor: "emotionally intense, anxious, and easily overwhelmed", lowDescriptor: "emotionally steady and slow to distress", poles: { low: "Steady", high: "Volatile" }, normMean: 2.8, normSd: 0.85 },
    { id: "DETA", name: "Detachment", description: "Withdrawal and reduced pleasure (the maladaptive pole of low Extraversion).", highDescriptor: "withdrawn, flat, and intimacy-avoidant", lowDescriptor: "engaged, warm, and emotionally present", poles: { low: "Engaged", high: "Detached" }, normMean: 2.5, normSd: 0.82 },
    { id: "ANTA", name: "Antagonism", description: "Manipulativeness and grandiosity (the maladaptive pole of low Agreeableness).", highDescriptor: "self-serving, deceptive, and entitled", lowDescriptor: "honest, considerate, and cooperative", poles: { low: "Agreeable", high: "Antagonistic" }, normMean: 2.3, normSd: 0.78 },
    { id: "DISI", name: "Disinhibition", description: "Impulsivity and irresponsibility (the maladaptive pole of low Conscientiousness).", highDescriptor: "impulsive, distractible, and unreliable", lowDescriptor: "controlled, dependable, and planful", poles: { low: "Controlled", high: "Disinhibited" }, normMean: 2.5, normSd: 0.8 },
    { id: "PSYO", name: "Psychoticism", description: "Unusual experiences and eccentric thinking (the maladaptive pole of high Openness).", highDescriptor: "unconventional, with unusual perceptions and scattered thought", lowDescriptor: "conventional and clear-thinking", poles: { low: "Conventional", high: "Eccentric" }, normMean: 2.2, normSd: 0.78 },
  ],
  items,
  caveats: [
    "This is an EDUCATIONAL self-reflection screen, not a diagnostic tool. It cannot diagnose a personality disorder or any mental health condition.",
    "Elevated scores are common and do not mean something is wrong with you — these traits exist in everyone to some degree.",
    "Only a qualified clinician can assess personality difficulty, using a full evaluation and clinical judgment.",
    "If any item or result brings up distress, please consider talking with a mental-health professional — and if you ever feel unsafe, contact local emergency services or a crisis line.",
  ],
  citations: [
    { ref: "Krueger, R. F., Derringer, J., Markon, K. E., Watson, D., & Skodol, A. E. (2012). Initial construction of a maladaptive personality trait model and inventory for DSM-5. Psychological Medicine, 42(9), 1879–1890." },
    { ref: "American Psychiatric Association (2013). DSM-5, Section III: Alternative Model for Personality Disorders." },
  ],
};
