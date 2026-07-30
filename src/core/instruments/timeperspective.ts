import type { Instrument, Item, ScaleScore, TypeResolution } from "../types";
import { timeTypeStrings, type TimeTypeBundle } from "./i18n";

/**
 * Time Perspective (Zimbardo) — the largely unconscious way you partition lived
 * experience into past, present, and future, which quietly steers decisions,
 * mood, and goals. The ZTPI maps five frames: Past-Negative, Past-Positive,
 * Present-Hedonistic, Present-Fatalistic, and Future. Zimbardo's key finding is
 * that no single frame is "best" — wellbeing tracks a BALANCED time perspective
 * (warm about the past, engaged in the present, planful about the future, low on
 * the negative/fatalistic frames). Items are ORIGINAL to this platform, grounded
 * in the ZTPI tradition. Educational self-reflection.
 */

const L = { min: 1, max: 5, labels: ["Very untrue of me", "Untrue", "Neutral", "True", "Very true of me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Past-Negative — an aversive, regretful view of the past
  it("PN1", "I often think about the bad things that have happened to me.", "PN"),
  it("PN2", "Painful past experiences keep replaying in my mind.", "PN"),
  it("PN3", "It's hard for me to forget unpleasant scenes from my past.", "PN"),
  it("PN4", "When I look back, I see more disappointments than good times.", "PN"),
  // Past-Positive — a warm, nostalgic view of the past
  it("PP1", "Happy memories of good times come back to me easily.", "PP"),
  it("PP2", "Familiar routines and rituals from my past bring me comfort.", "PP"),
  it("PP3", "I love revisiting old places and the feelings they bring back.", "PP"),
  it("PP4", "Looking back, I feel glad about much of how my life has gone.", "PP"),
  // Present-Hedonistic — pleasure, spontaneity, and living for now
  it("PH1", "I take each day as it comes rather than planning ahead.", "PH"),
  it("PH2", "I'll do things on impulse if they sound fun.", "PH"),
  it("PH3", "I'd rather enjoy the moment than worry about what comes next.", "PH"),
  it("PH4", "A bit of risk and excitement keeps life from getting boring.", "PH"),
  // Present-Fatalistic — a helpless, fate-driven view of the present
  it("PF1", "It doesn't make much sense to plan, since so much is out of my hands.", "PF"),
  it("PF2", "My life is largely shaped by forces I can't control.", "PF"),
  it("PF3", "Whatever will be, will be — my choices don't change much.", "PF"),
  it("PF4", "There's little point worrying about the future; fate will decide it.", "PF"),
  // Future — planning, goals, and delayed gratification
  it("FU1", "I make lists of things to do and work my way through them.", "FU"),
  it("FU2", "I meet my deadlines and obligations on time.", "FU"),
  it("FU3", "I'll give up enjoyment now for a bigger payoff later.", "FU"),
  it("FU4", "Before deciding, I weigh how it will affect my future.", "FU"),
];

/** Canonical, language-agnostic codes (standard ZTPI frame names + the balanced ideal). */
const CODE: Record<string, string> = {
  PN: "Past-Negative", PP: "Past-Positive", PH: "Present-Hedonistic", PF: "Present-Fatalistic", FU: "Future",
  BAL: "Balanced Time Perspective",
};

/** The empirically "healthy" target profile (0..100), per Zimbardo's balanced time perspective. */
const IDEAL: Record<string, number> = { PP: 75, FU: 70, PH: 50, PN: 25, PF: 20 };
const FRAMES = ["PN", "PP", "PH", "PF", "FU"];

/** English default; es/fr live in core/instruments/i18n.ts (timeTypeStrings). */
const TIME_TYPE_EN: TimeTypeBundle = {
  meta: {
    PN: { name: "Past-Negative", title: "The Burdened", desc: "the past still weighs on you", summary: "Your strongest time frame is Past-Negative — old hurts and regrets still carry weight. It can make you careful and deep, but left untended it feeds rumination and low mood. Of the five frames, this is the most worth (and most able to be) softened, through reframing, self-compassion, and sometimes support." },
    PP: { name: "Past-Positive", title: "The Nostalgic", desc: "warmth and roots in the past", summary: "Your strongest time frame is Past-Positive — you draw warmth, identity, and comfort from good memories, traditions, and roots. It's a genuine strength linked to wellbeing; just keep it from sliding into living in the past at the expense of the present and future." },
    PH: { name: "Present-Hedonistic", title: "The Adventurer", desc: "pleasure and the present", summary: "Your strongest time frame is Present-Hedonistic — you live for the moment, chase enjoyment, and embrace spontaneity. It brings joy, energy, and zest; paired with a little future orientation, it's wonderful, but unchecked it can crowd out planning and long-term goals." },
    PF: { name: "Present-Fatalistic", title: "The Fatalist", desc: "life feels out of your hands", summary: "Your strongest time frame is Present-Fatalistic — a sense that your choices don't change much and life is shaped by forces beyond you. It can bring a certain acceptance, but it tends to sap motivation and agency. Rebuilding a sense that your actions matter is the key growth lever here." },
    FU: { name: "Future", title: "The Planner", desc: "goals and the road ahead", summary: "Your strongest time frame is Future — you plan, set goals, and trade enjoyment now for a bigger payoff later. It powers achievement and health behaviors; just guard against living so far ahead that you lose the present, and pair it with warmth toward the past." },
    BAL: { name: "Balanced Time Perspective", title: "The Time-Balanced", desc: "a flexible blend across time", summary: "Your frames sit close to the balanced time perspective Zimbardo links to the highest wellbeing: warm about the past, engaged in the present, planful about the future, and low on the negative and fatalistic frames. Rather than being ruled by one frame, you can flex to whichever the moment calls for — the healthiest profile of all." },
  },
  labels: { dominant: "Leading time frame", secondary: "Secondary frame", range: "Full profile", balance: "Time balance" },
  balanceBands: { balanced: "close to the balanced ideal", moderate: "moderately balanced", skewed: "dominated by one or two frames" },
  balanceDetail: "Wellbeing tracks balance across frames more than any single one — warm past, engaged present, planful future, low negativity.",
};

function resolveType(s: Record<string, ScaleScore>, locale?: string): TypeResolution {
  const T = timeTypeStrings(locale) ?? TIME_TYPE_EN;
  const ranked = [...FRAMES].sort((a, b) => s[b].normalized - s[a].normalized);
  const top = ranked[0];
  // Distance from the balanced ideal: lower = more balanced.
  const deviation = FRAMES.reduce((a, f) => a + Math.abs(s[f].normalized - IDEAL[f]), 0) / FRAMES.length;
  const balanceBand = deviation <= 18 ? "balanced" : deviation <= 32 ? "moderate" : "skewed";
  const key = balanceBand === "balanced" ? "BAL" : top;
  const meta = T.meta[key];

  return {
    code: CODE[key],
    title: meta.title,
    summary: meta.summary,
    components: [
      { label: T.labels.dominant, value: T.meta[top].name, detail: T.meta[top].desc },
      { label: T.labels.secondary, value: T.meta[ranked[1]].name, detail: T.meta[ranked[1]].desc },
      { label: T.labels.range, value: ranked.map((f) => T.meta[f].name).join(" › ") },
      { label: T.labels.balance, value: T.balanceBands[balanceBand], detail: T.balanceDetail },
    ],
    confidence: Math.max(0.2, Math.min(0.95, 0.5 + (s[top].normalized - s[ranked[1]].normalized) / 100)),
    secondary: T.meta[ranked[1]].name,
  };
}

export const timePerspective: Instrument = {
  id: "time-perspective-ztpi",
  name: "Time Perspective",
  shortName: "Time Perspective",
  kind: "typological",
  category: "wellbeing",
  tagline: "How your relationship with the past, present, and future quietly shapes your life.",
  description:
    "Time perspective is the mostly-unconscious way you sort experience into past, present, and future — and it " +
    "steers far more than you'd think: your decisions, moods, risks, and goals. Philip Zimbardo's model maps five " +
    "frames: Past-Negative, Past-Positive, Present-Hedonistic, Present-Fatalistic, and Future. The research twist is " +
    "that no single frame is ideal — the happiest, healthiest profile is a BALANCED time perspective that flexes to " +
    "the moment. This profiler shows your leading frame, your full profile, and how close you sit to that balance.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the Zimbardo Time Perspective Inventory (ZTPI) tradition.",
  scales: [
    { id: "PN", name: "Past-Negative", description: "An aversive, regretful focus on the past.", highDescriptor: "haunted by past hurts and regrets", lowDescriptor: "largely at peace with your past", poles: { low: "At peace", high: "Burdened" }, normMean: 2.9, normSd: 0.85 },
    { id: "PP", name: "Past-Positive", description: "A warm, nostalgic, rooted relationship with the past.", highDescriptor: "warmly connected to memories, traditions, and roots", lowDescriptor: "less drawn to nostalgia or the past", poles: { low: "Detached", high: "Nostalgic" }, normMean: 3.7, normSd: 0.7 },
    { id: "PH", name: "Present-Hedonistic", description: "Pleasure-seeking, spontaneity, and living in the now.", highDescriptor: "spontaneous, pleasure-seeking, and living for the moment", lowDescriptor: "more measured and less impulsive about pleasure", poles: { low: "Measured", high: "Hedonistic" }, normMean: 3.4, normSd: 0.68 },
    { id: "PF", name: "Present-Fatalistic", description: "A helpless, fate-driven view that choices don't matter.", highDescriptor: "feeling life is shaped by forces beyond your control", lowDescriptor: "feeling a strong sense of agency over your life", poles: { low: "In control", high: "Fatalistic" }, normMean: 2.5, normSd: 0.78 },
    { id: "FU", name: "Future", description: "Planning, goal-setting, and delaying gratification.", highDescriptor: "planful, goal-driven, and willing to delay gratification", lowDescriptor: "more present-focused and less driven by long-term plans", poles: { low: "Present-focused", high: "Planful" }, normMean: 3.6, normSd: 0.66 },
  ],
  items,
  resolveType,
  caveats: [
    "Time perspective is learned and changeable — it shifts with culture, circumstances, and deliberate practice. No frame is your fate.",
    "No single frame is 'good' or 'bad'; wellbeing tracks a flexible BALANCE — warm past, engaged present, planful future, and low negativity/fatalism.",
    "This is an educational self-reflection, not a clinical measure. A persistently heavy Past-Negative or Present-Fatalistic frame can accompany low mood and is worth talking through with someone.",
  ],
  citations: [
    { ref: "Zimbardo, P. G., & Boyd, J. N. (1999). Putting time in perspective: A valid, reliable individual-differences metric. Journal of Personality and Social Psychology, 77(6), 1271–1288." },
    { ref: "Zimbardo, P., & Boyd, J. (2008). The Time Paradox: The New Psychology of Time That Will Change Your Life. Free Press." },
    { ref: "Stolarski, M., Fieulaine, N., & van Beek, W. (Eds.) (2015). Time Perspective Theory; Review, Research and Application. Springer." },
  ],
};
