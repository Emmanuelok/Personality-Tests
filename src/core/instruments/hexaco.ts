import type { Instrument, Item } from "../types";

/**
 * HEXACO Personality Profiler (6 dimensions).
 *
 * The HEXACO model extends the Big Five with a sixth factor, Honesty-Humility,
 * and re-organizes Agreeableness and Emotionality. Items here are ORIGINAL to this
 * platform, written to capture each factor's facets (the HEXACO-PI-R's own items
 * are copyrighted; a public-domain HEXACO representation also exists in the IPIP).
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Honesty-Humility (Sincerity, Fairness, Greed-Avoidance, Modesty)
  it("H1", "I wouldn't use flattery to get a raise or promotion, even if it would work.", "H", 1),
  it("H2", "If I knew I could never get caught, I'd be willing to bend the rules for personal gain.", "H", -1),
  it("H3", "Having lots of money and luxury isn't particularly important to me.", "H", 1),
  it("H4", "I feel entitled to more respect and special treatment than the average person.", "H", -1),
  // Emotionality (Fearfulness, Anxiety, Dependence, Sentimentality)
  it("E1", "I would feel quite afraid if I had to travel in very bad weather.", "E", 1),
  it("E2", "I worry a good deal about how things will turn out.", "E", 1),
  it("E3", "I can handle tough situations without needing emotional support from others.", "E", -1),
  it("E4", "I feel strong emotion when someone close to me is leaving for a long time.", "E", 1),
  // eXtraversion (Social Self-Esteem, Social Boldness, Sociability, Liveliness)
  it("X1", "I feel reasonably satisfied with myself and my life.", "X", 1),
  it("X2", "In social situations, I'm usually the one who makes the first move.", "X", 1),
  it("X3", "I enjoy having lots of people around to talk with.", "X", 1),
  it("X4", "Most people are more cheerful and high-spirited than I am.", "X", -1),
  // Agreeableness (Forgiveness, Gentleness, Flexibility, Patience)
  it("A1", "I rarely hold a grudge, even against people who have badly wronged me.", "A", 1),
  it("A2", "People sometimes tell me that I'm too critical of others.", "A", -1),
  it("A3", "I'm usually willing to compromise rather than insist on getting my way.", "A", 1),
  it("A4", "I lose my temper more easily than most people do.", "A", -1),
  // Conscientiousness (Organization, Diligence, Perfectionism, Prudence)
  it("C1", "I keep my belongings neat and well organized.", "C", 1),
  it("C2", "When I work on something, I push myself hard to get it right.", "C", 1),
  it("C3", "I often make decisions on the spur of the moment.", "C", -1),
  it("C4", "I check details carefully before I consider a task finished.", "C", 1),
  // Openness (Aesthetic Appreciation, Inquisitiveness, Creativity, Unconventionality)
  it("O1", "I'm captivated by beauty in art or nature.", "O", 1),
  it("O2", "I like to ask questions about things most people take for granted.", "O", 1),
  it("O3", "People would describe me as imaginative and original.", "O", 1),
  it("O4", "I avoid ideas and people that seem strange or unconventional.", "O", -1),
];

export const hexaco: Instrument = {
  id: "hexaco-24",
  name: "HEXACO Personality (6 Dimensions)",
  shortName: "HEXACO",
  kind: "dimensional",
  tagline: "The Big Five, plus the factor it was missing: Honesty-Humility.",
  description:
    "HEXACO is a six-dimensional model with strong cross-cultural support. Alongside Emotionality, " +
    "eXtraversion, Agreeableness, Conscientiousness, and Openness, it adds Honesty-Humility — the tendency " +
    "toward sincerity, fairness, and modesty — which predicts ethical behavior beyond the Big Five.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance:
    "Original facet-based items written for this platform, grounded in the HEXACO model (Lee & Ashton). The HEXACO-PI-R instrument is not used.",
  scales: [
    { id: "H", name: "Honesty-Humility", description: "Sincerity, fairness, modesty, and lack of greed.", highDescriptor: "sincere, fair, modest, and unwilling to exploit others", lowDescriptor: "status-seeking, self-promoting, and willing to bend rules for advantage", poles: { low: "Self-interested", high: "Honest-Humble" }, normMean: 3.2, normSd: 0.62 },
    { id: "E", name: "Emotionality", description: "Fearfulness, anxiety, sentimentality, and need for support.", highDescriptor: "sensitive, sentimental, and attuned to risk and connection", lowDescriptor: "tough, self-reliant, and calm in the face of danger", poles: { low: "Unsentimental", high: "Sensitive" }, normMean: 3.2, normSd: 0.66 },
    { id: "X", name: "eXtraversion", description: "Social self-esteem, boldness, sociability, and liveliness.", highDescriptor: "outgoing, lively, socially confident, and energized by people", lowDescriptor: "reserved, low-key, and content with their own company", poles: { low: "Reserved", high: "Outgoing" }, normMean: 3.4, normSd: 0.62 },
    { id: "A", name: "Agreeableness (vs. Anger)", description: "Forgiveness, gentleness, flexibility, and patience.", highDescriptor: "forgiving, gentle, easy to get along with, and slow to anger", lowDescriptor: "critical, stubborn, and quick to feel wronged", poles: { low: "Critical", high: "Agreeable" }, normMean: 3.0, normSd: 0.6 },
    { id: "C", name: "Conscientiousness", description: "Organization, diligence, perfectionism, and prudence.", highDescriptor: "organized, disciplined, careful, and thorough", lowDescriptor: "spontaneous, flexible, and comfortable with disorder", poles: { low: "Spontaneous", high: "Disciplined" }, normMean: 3.5, normSd: 0.6 },
    { id: "O", name: "Openness to Experience", description: "Aesthetic appreciation, inquisitiveness, creativity, and unconventionality.", highDescriptor: "curious, imaginative, and drawn to art, ideas, and the unconventional", lowDescriptor: "practical, conventional, and focused on the familiar", poles: { low: "Conventional", high: "Inventive" }, normMean: 3.4, normSd: 0.64 },
  ],
  items,
  caveats: [
    "Estimates from self-report, not a clinical or hiring assessment.",
    "Percentiles are approximate. Honesty-Humility especially can be affected by how candidly one answers.",
  ],
  citations: [
    { ref: "Lee, K., & Ashton, M. C. (2004). Psychometric properties of the HEXACO Personality Inventory. Multivariate Behavioral Research, 39(2), 329–358." },
    { ref: "Ashton, M. C., & Lee, K. (2007). Empirical, theoretical, and practical advantages of the HEXACO model of personality structure. Personality and Social Psychology Review, 11(2), 150–166." },
    { ref: "Ashton, M. C., & Lee, K. (2009). The HEXACO-60: A short measure of the major dimensions of personality. Journal of Personality Assessment, 91(4), 340–345." },
  ],
};
