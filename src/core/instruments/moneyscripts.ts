import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { moneyTypeStrings, type RankedStyleBundle } from "./i18n";

/**
 * Money Scripts (Klontz) — the unconscious beliefs about money, usually formed in
 * childhood, that quietly drive financial behavior. The Klontz Money Script
 * Inventory maps four: Money Avoidance, Money Worship, Money Status, and Money
 * Vigilance. Three (avoidance, worship, status) tend to predict poorer financial
 * health; vigilance is the healthiest, unless it tips into anxiety. Items are
 * ORIGINAL to this platform, grounded in the KMSI tradition. Educational
 * self-reflection — never financial advice.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Money Avoidance — money is bad, corrupting, or undeserved
  it("AV1", "Money is, at its root, the cause of much that's wrong with the world.", "AVOID"),
  it("AV2", "There's real virtue in living with less money.", "AVOID"),
  it("AV3", "I don't deserve a lot of money when others have so little.", "AVOID"),
  it("AV4", "Wealthy people tend to be greedy or to have cut corners to get there.", "AVOID"),
  it("AV5", "I avoid thinking about or dealing with my money.", "AVOID"),
  // Money Worship — more money = happiness, solves problems, never enough
  it("WO1", "Things would get better for me if I had more money.", "WORSHIP"),
  it("WO2", "More money would make me happier.", "WORSHIP"),
  it("WO3", "It's hard to be poor and happy at the same time.", "WORSHIP"),
  it("WO4", "No matter how much I have, there's never quite enough money.", "WORSHIP"),
  it("WO5", "Money would solve most of my problems.", "WORSHIP"),
  // Money Status — self-worth tied to net worth, visible success
  it("ST1", "Your self-worth is closely tied to your net worth.", "STATUS"),
  it("ST2", "People are about as successful as the money they earn.", "STATUS"),
  it("ST3", "I want to be able to show people that I have money.", "STATUS"),
  it("ST4", "If something is the most expensive, it's probably the best.", "STATUS"),
  it("ST5", "I admire people who own expensive things, and want the same.", "STATUS"),
  // Money Vigilance — alert, careful, frugal, private (the healthiest, watch for anxiety)
  it("VG1", "I keep a close, careful watch over my finances.", "VIGIL"),
  it("VG2", "It's important to save for a rainy day.", "VIGIL"),
  it("VG3", "I prefer not to tell others how much money I have or earn.", "VIGIL"),
  it("VG4", "I feel uneasy if I'm not being careful and frugal with money.", "VIGIL"),
  it("VG5", "I always want to know exactly where my money is going.", "VIGIL"),
];

/** Canonical, language-agnostic script codes. */
const CODE_EN: Record<string, string> = { AVOID: "Money Avoidance", WORSHIP: "Money Worship", STATUS: "Money Status", VIGIL: "Money Vigilance" };

/** English default; es/fr live in core/instruments/i18n.ts (moneyTypeStrings). */
const MONEY_TYPE_EN: RankedStyleBundle = {
  meta: {
    AVOID: { name: "Money Avoidance", title: "The Avoider", desc: "money feels bad or undeserved", summary: "Your leading money script is avoidance — a sense that money is bad, corrupting, or undeserved. It can keep you principled and unmaterialistic, but watch for neglecting your finances or sabotaging your own success." },
    WORSHIP: { name: "Money Worship", title: "The Seeker", desc: "more money = happiness", summary: "Your leading money script is worship — the belief that more money will solve problems and bring happiness. It can fuel ambition, but tips into overspending, overwork, and a feeling that there's never enough." },
    STATUS: { name: "Money Status", title: "The Status-Seeker", desc: "self-worth tied to net worth", summary: "Your leading money script is status — tying self-worth to net worth and visible success. It can drive achievement, but risks overspending to impress and a self-esteem that rises and falls with your balance." },
    VIGIL: { name: "Money Vigilance", title: "The Vigilant", desc: "alert, careful, private", summary: "Your leading money script is vigilance — alert, careful, and private about money. It's the healthiest of the four and guards against debt, as long as it doesn't tip into anxiety or never letting yourself enjoy what you have." },
  },
  labels: { dominant: "Dominant script", secondary: "Secondary script", range: "Full ranking", profile: "Balance" },
  lead: "one script clearly leads", blend: "two scripts run close", profileDetail: "Money Vigilance is the healthiest of the four; avoidance, worship, and status are worth gently rebalancing.",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = moneyTypeStrings(locale) ?? MONEY_TYPE_EN;
  const arr = Object.keys(CODE_EN).map((id) => ({ id, mean: s[id].mean }));
  const sorted = [...arr].sort((a, b) => b.mean - a.mean);
  const top = sorted[0];
  const sep = top.mean - sorted[1].mean;
  const meta = T.meta[top.id];
  const sName = T.meta[sorted[1].id].name;
  return {
    code: CODE_EN[top.id],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.dominant, value: meta.name, detail: meta.desc },
      { label: T.labels.secondary, value: sName, detail: T.meta[sorted[1].id].desc },
      { label: T.labels.range, value: sorted.map((x) => T.meta[x.id].name).join(" › ") },
      { label: T.labels.profile, value: sep >= 0.5 ? T.lead : T.blend, detail: T.profileDetail },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.5 + sep)),
    secondary: sName,
  };
}

export const moneyScripts: Instrument = {
  id: "money-scripts",
  name: "Money Scripts",
  shortName: "Money Scripts",
  kind: "typological",
  category: "wellbeing",
  tagline: "The hidden beliefs about money that quietly drive how you earn, spend, and save.",
  description:
    "Most of our money behavior is steered by 'money scripts' — beliefs about money, usually absorbed in childhood, " +
    "that we rarely examine. Brad Klontz's research maps four: Money Avoidance (money is bad or undeserved), Money " +
    "Worship (more money will fix everything), Money Status (self-worth = net worth), and Money Vigilance (alert, " +
    "careful, private). Three of the four predict financial strain; vigilance is the healthiest. This profiler surfaces " +
    "your leading script so you can keep it from running the show.",
  estMinutes: 4,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Klontz Money Script Inventory (KMSI) tradition.",
  scales: [
    { id: "AVOID", name: "Money Avoidance", description: "Belief that money is bad, corrupting, or undeserved.", highDescriptor: "wary of money and prone to neglecting it", lowDescriptor: "at ease with money's place in your life", poles: { low: "At ease", high: "Avoidant" }, normMean: 2.4, normSd: 0.8 },
    { id: "WORSHIP", name: "Money Worship", description: "Belief that more money brings happiness and solves problems.", highDescriptor: "convinced more money is the answer; never quite enough", lowDescriptor: "content that money isn't the key to happiness", poles: { low: "Content", high: "Worshipping" }, normMean: 3.0, normSd: 0.82 },
    { id: "STATUS", name: "Money Status", description: "Tying self-worth and identity to financial success.", highDescriptor: "linking worth and status to wealth and visible success", lowDescriptor: "self-worth held apart from net worth", poles: { low: "Self-worth ≠ net worth", high: "Status-driven" }, normMean: 2.5, normSd: 0.82 },
    { id: "VIGIL", name: "Money Vigilance", description: "Alertness, care, frugality, and privacy about money (the healthiest script).", highDescriptor: "alert, frugal, and careful with money", lowDescriptor: "relaxed, sometimes careless, about money", poles: { low: "Carefree", high: "Vigilant" }, normMean: 3.6, normSd: 0.7 },
  ],
  items,
  resolveType,
  caveats: [
    "Money scripts are learned — usually absorbed from family and early experiences — and they can be revised. None is your destiny.",
    "Three scripts (avoidance, worship, status) tend to predict lower financial health; vigilance is healthiest — but any belief, taken to an extreme, costs you.",
    "This is an educational self-reflection, not financial advice. For real money stress, a financial therapist or planner can help.",
  ],
  citations: [
    { ref: "Klontz, B., Britt, S. L., Mentzer, J., & Klontz, T. (2011). Money beliefs and financial behaviors: Development of the Klontz Money Script Inventory. Journal of Financial Therapy, 2(1), 1–22." },
    { ref: "Klontz, B., & Klontz, T. (2009). Mind Over Money: Overcoming the Money Disorders That Threaten Our Financial Health. Broadway Business." },
    { ref: "Klontz, B. T., Britt, S. L., Archuleta, K. L., & Klontz, T. (2012). Disordered money behaviors: Development of the Klontz Money Behavior Inventory. Journal of Financial Therapy, 3(1)." },
  ],
};
