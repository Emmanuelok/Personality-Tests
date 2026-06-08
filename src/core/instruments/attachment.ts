import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";

/**
 * Attachment Style (Anxiety × Avoidance → four styles).
 *
 * Adult attachment is well modelled by two dimensions — attachment anxiety and
 * attachment avoidance — whose combination yields four styles (Bartholomew &
 * Horowitz; Brennan/Fraley ECR tradition). Items are ORIGINAL to this platform and
 * are framed around close relationships generally.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Attachment Anxiety (fear of abandonment, need for reassurance)
  it("ANX1", "I worry that people I love won't care about me as much as I care about them.", "ANX", 1),
  it("ANX2", "I need a lot of reassurance that I'm loved.", "ANX", 1),
  it("ANX3", "I'm often afraid of being abandoned by people I'm close to.", "ANX", 1),
  it("ANX4", "I get upset when someone I'm close to isn't available when I need them.", "ANX", 1),
  it("ANX5", "I rarely worry about being left or rejected.", "ANX", -1),
  it("ANX6", "When I'm close to someone, I often fear the relationship will fall apart.", "ANX", 1),
  it("ANX7", "I crave closeness, sometimes more than the other person seems to want.", "ANX", 1),
  it("ANX8", "I feel secure that the people I love won't leave me.", "ANX", -1),
  // Attachment Avoidance (discomfort with closeness, self-reliance)
  it("AV1", "I prefer not to depend on others, or have them depend on me.", "AV", 1),
  it("AV2", "I find it hard to fully open up to people I'm close to.", "AV", 1),
  it("AV3", "I get uncomfortable when someone wants to be very emotionally close.", "AV", 1),
  it("AV4", "I'm comfortable relying on close others for support.", "AV", -1),
  it("AV5", "I'd rather keep my feelings to myself than share them.", "AV", 1),
  it("AV6", "When someone gets too close, I tend to pull away.", "AV", 1),
  it("AV7", "It's easy for me to be emotionally intimate with the people I love.", "AV", -1),
  it("AV8", "I value my independence more than closeness.", "AV", 1),
];

const META: Record<string, { code: string; title: string; summary: string }> = {
  secure: { code: "Secure", title: "Secure Attachment", summary: "You're comfortable with both intimacy and independence — generally trusting, and not easily thrown by closeness or distance." },
  anxious: { code: "Anxious", title: "Anxious–Preoccupied", summary: "You value closeness deeply and can worry about a partner's love and availability, craving reassurance." },
  avoidant: { code: "Avoidant", title: "Dismissive–Avoidant", summary: "You prize independence and self-reliance, and tend to keep some emotional distance even when close." },
  fearful: { code: "Fearful", title: "Fearful–Avoidant", summary: "You long for closeness yet also fear it — pulled between wanting connection and protecting yourself." },
};

const MID = 50;

function band(n: number): string {
  const d = Math.abs(n - MID);
  return d >= 25 ? "high" : d >= 10 ? "moderate" : "low";
}

function resolveType(s: Record<string, ScaleScore>): TypeResolution {
  const anx = s.ANX.normalized;
  const av = s.AV.normalized;
  const aHigh = anx >= MID;
  const vHigh = av >= MID;
  const key = !aHigh && !vHigh ? "secure" : aHigh && !vHigh ? "anxious" : !aHigh && vHigh ? "avoidant" : "fearful";
  const meta = META[key];
  const confidence = Math.max(0.2, Math.min(0.98, (Math.abs(anx - MID) + Math.abs(av - MID)) / 100 + 0.45));

  return {
    code: meta.code,
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: "Attachment anxiety", value: aHigh ? "Higher" : "Lower", detail: `${band(anx)} (${Math.round(anx)}/100)` },
      { label: "Attachment avoidance", value: vHigh ? "Higher" : "Lower", detail: `${band(av)} (${Math.round(av)}/100)` },
      { label: "Style", value: meta.title },
      { label: "Toward security", value: "lower anxiety + lower avoidance", detail: "where growth tends to head" },
    ],
    confidence,
  };
}

export const attachment: Instrument = {
  id: "attachment-styles",
  name: "Attachment Style in Relationships",
  shortName: "Attachment Style",
  kind: "typological",
  tagline: "How you bond: two dimensions, four relationship styles.",
  description:
    "Adult attachment shapes how we seek closeness and handle distance in relationships. This profiler " +
    "estimates your attachment anxiety and avoidance and places you among four styles — Secure, " +
    "Anxious-Preoccupied, Dismissive-Avoidant, and Fearful-Avoidant — with growth framed as movement " +
    "toward security.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the two-dimensional adult-attachment tradition (Bartholomew; Brennan/Fraley ECR).",
  scales: [
    { id: "ANX", name: "Attachment Anxiety", description: "Fear of abandonment and need for reassurance in close relationships.", highDescriptor: "craving closeness, sensitive to a partner's availability, and quick to fear rejection", lowDescriptor: "secure that you're loved and not preoccupied with abandonment", poles: { low: "Secure", high: "Anxious" }, normMean: 2.9, normSd: 0.85 },
    { id: "AV", name: "Attachment Avoidance", description: "Discomfort with closeness and a preference for self-reliance.", highDescriptor: "valuing independence, guarded with feelings, and uneasy with too much closeness", lowDescriptor: "comfortable with intimacy, depending on others, and opening up", poles: { low: "Connected", high: "Avoidant" }, normMean: 2.8, normSd: 0.8 },
  ],
  items,
  resolveType,
  caveats: [
    "Attachment style is a tendency, not a fixed label — it can and does shift with relationships and effort.",
    "This is a tool for reflection and growth, not a diagnosis. A difficult style is not a flaw.",
    "Security can be 'earned' over time through safe relationships and self-work.",
  ],
  citations: [
    { ref: "Hazan, C., & Shaver, P. (1987). Romantic love conceptualized as an attachment process. Journal of Personality and Social Psychology, 52(3), 511–524." },
    { ref: "Bartholomew, K., & Horowitz, L. M. (1991). Attachment styles among young adults: A test of a four-category model. JPSP, 61(2), 226–244." },
    { ref: "Brennan, K. A., Clark, C. L., & Shaver, P. R. (1998). Self-report measurement of adult attachment (the ECR). In Attachment Theory and Close Relationships (pp. 46–76). Guilford." },
  ],
};
