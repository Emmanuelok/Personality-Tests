import type { Instrument, Item } from "../types";

/**
 * Couple Communication & Conflict.
 *
 * A research-grounded read on HOW partners talk and fight — the strongest known
 * behavioral predictors of whether a relationship thrives or erodes. Synthesizes
 * three lineages: Gottman's work on the "Four Horsemen", gentle start-up, repair,
 * and turning toward bids; Christensen's demand–withdraw / constructive-communication
 * patterns (CPQ); and Gable's active-constructive responding (capitalization).
 * Items are ORIGINAL to this platform; framed for any committed relationship.
 */

const L = { min: 1, max: 5, labels: ["Never", "Rarely", "Sometimes", "Often", "Almost always"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Gentle Start-Up (antidote to criticism)
  it("GEN1", "When something bothers me, I bring it up gently rather than with blame.", "GENTLE"),
  it("GEN2", "I describe how I feel and what I need instead of attacking my partner.", "GENTLE"),
  it("GEN3", "I open touchy conversations with a complaint about the issue, not a criticism of my partner.", "GENTLE"),
  it("GEN4", "I start difficult conversations with an accusation or a dig.", "GENTLE", -1),
  // Constructive Communication (CPQ)
  it("CON1", "We discuss our problems openly and try to understand each other.", "CONSTR"),
  it("CON2", "I express my feelings honestly when we disagree.", "CONSTR"),
  it("CON3", "We work together to negotiate and solve the issue.", "CONSTR"),
  it("CON4", "When a problem comes up, I avoid it or change the subject.", "CONSTR", -1),
  // Repair & Accepting Influence (antidotes to defensiveness / stonewalling)
  it("REP1", "When things heat up, I make an effort to calm down and de-escalate.", "REPAIR"),
  it("REP2", "I take responsibility for my part instead of getting defensive.", "REPAIR"),
  it("REP3", "I accept my partner's influence and let them change my mind.", "REPAIR"),
  it("REP4", "Once a fight starts, neither of us can stop it until it burns out.", "REPAIR", -1),
  // Responsiveness & Turning Toward (bids + active-constructive responding + fondness)
  it("RES1", "When my partner shares good news, I respond with genuine enthusiasm.", "RESPOND"),
  it("RES2", "I notice and respond to my partner's small bids for attention and affection.", "RESPOND"),
  it("RES3", "I let my partner know I value and appreciate them.", "RESPOND"),
  it("RES4", "When my partner wants to connect, I'm too busy or distracted to respond.", "RESPOND", -1),
  // The Four Horsemen (risk cluster)
  it("HOR1", "In conflict, I criticize my partner's character, not just their behavior.", "HORSE"),
  it("HOR2", "I show contempt — sarcasm, eye-rolling, or talking down to my partner.", "HORSE"),
  it("HOR3", "When criticized, I defend myself and deny responsibility rather than listen.", "HORSE"),
  it("HOR4", "I shut down, go silent, or withdraw to end a difficult conversation.", "HORSE"),
  // Demand–Withdraw / mutual avoidance (risk cluster)
  it("DEM1", "One of us pushes to talk about the problem while the other pulls away.", "DEMWD"),
  it("DEM2", "I nag or pressure my partner while they avoid the topic or stonewall.", "DEMWD"),
  it("DEM3", "When I raise an issue, my partner withdraws — or when they raise one, I do.", "DEMWD"),
  it("DEM4", "We both avoid difficult topics and let problems simmer unaddressed.", "DEMWD"),
];

export const coupleComm: Instrument = {
  id: "couple-communication",
  name: "Couple Communication & Conflict",
  shortName: "Couple Comms",
  kind: "dimensional",
  category: "communication",
  tagline: "How you and a partner talk, repair, and fight — the patterns that make or break love.",
  description:
    "Decades of research show that relationships rise or fall less on what couples fight about than on HOW they " +
    "communicate. This profiler reads six of the most predictive patterns — gentle start-up, constructive " +
    "communication, repair and accepting influence, responsiveness and turning toward, the 'Four Horsemen' " +
    "(criticism, contempt, defensiveness, stonewalling), and the demand–withdraw cycle. Higher is healthier on the " +
    "first four; the last two are risk patterns worth softening. A mirror for growth, for any committed relationship.",
  estMinutes: 6,
  responseFormat: L,
  itemProvenance:
    "Original items written for this platform, grounded in Gottman's relationship research, Christensen's Communication Patterns model, and Gable's active-constructive responding.",
  scales: [
    { id: "GENTLE", name: "Gentle Start-Up", description: "Raising hard topics softly, as a specific complaint rather than a personal attack.", highDescriptor: "gentle and specific when opening hard conversations", lowDescriptor: "prone to harsh, blaming start-ups", poles: { low: "Harsh start-up", high: "Gentle start-up" }, normMean: 3.3, normSd: 0.78 },
    { id: "CONSTR", name: "Constructive Communication", description: "Openly discussing, expressing feelings, and negotiating problems together.", highDescriptor: "open, expressive, and collaborative about problems", lowDescriptor: "avoidant or shut-down about problems", poles: { low: "Avoidant", high: "Constructive" }, normMean: 3.4, normSd: 0.74 },
    { id: "REPAIR", name: "Repair & Accepting Influence", description: "De-escalating, taking responsibility, self-soothing, and letting your partner influence you.", highDescriptor: "quick to repair, take responsibility, and yield to influence", lowDescriptor: "defensive and slow to de-escalate", poles: { low: "Escalates", high: "Repairs" }, normMean: 3.3, normSd: 0.76 },
    { id: "RESPOND", name: "Responsiveness & Turning Toward", description: "Noticing bids, celebrating good news, and expressing appreciation.", highDescriptor: "warmly responsive and quick to turn toward your partner", lowDescriptor: "often distracted or turning away from bids", poles: { low: "Turns away", high: "Turns toward" }, normMean: 3.5, normSd: 0.72 },
    { id: "HORSE", name: "The Four Horsemen", description: "Criticism, contempt, defensiveness, and stonewalling — the most corrosive conflict behaviors.", highDescriptor: "the corrosive patterns show up often (worth softening)", lowDescriptor: "largely free of the corrosive patterns", poles: { low: "Rare", high: "Frequent" }, normMean: 2.4, normSd: 0.82 },
    { id: "DEMWD", name: "Demand–Withdraw", description: "The pursue-then-distance cycle and mutual avoidance that intensify conflict.", highDescriptor: "caught in pursue-withdraw or mutual avoidance", lowDescriptor: "able to engage problems without the cycle", poles: { low: "Balanced", high: "Demand–withdraw" }, normMean: 2.6, normSd: 0.8 },
  ],
  items,
  caveats: [
    "This rates your own view of one relationship; your partner might see it differently — the richest use is to compare notes together, kindly.",
    "Patterns are learnable. Gottman's antidotes (gentle start-up, appreciation, taking responsibility, self-soothing) can shift even long-standing habits.",
    "An educational tool for reflection and growth, not couples therapy or a verdict on your relationship. If conflict ever involves fear or harm, please seek professional support.",
  ],
  citations: [
    { ref: "Gottman, J. M., & Silver, N. (1999). The Seven Principles for Making Marriage Work. Crown." },
    { ref: "Gottman, J. M. (1994). What Predicts Divorce? The Relationship Between Marital Processes and Marital Outcomes. Erlbaum.", note: "Source of the Four Horsemen and repair research." },
    { ref: "Christensen, A., & Shenk, J. L. (1991). Communication, conflict, and psychological distance in nondistressed, clinic, and divorcing couples. Journal of Consulting and Clinical Psychology, 59(3), 458–463.", note: "Demand–withdraw and constructive communication (CPQ)." },
    { ref: "Gable, S. L., Reis, H. T., Impett, E. A., & Asher, E. R. (2004). What do you do when things go right? The intrapersonal and interpersonal benefits of sharing positive events. JPSP, 87(2), 228–245.", note: "Active-constructive responding (capitalization)." },
  ],
};
