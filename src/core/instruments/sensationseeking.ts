import type { Instrument, Item } from "../types";

/**
 * Sensation Seeking (Zuckerman).
 *
 * The appetite for varied, novel, intense experience — and willingness to take
 * risks for it. A biologically-rooted trait that predicts everything from hobbies
 * to risk behavior. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("T1", "I'd love to try activities like skydiving, surfing big waves, or rock climbing.", "TAS"),
  it("T2", "I'm drawn to physical thrills and a touch of danger.", "TAS"),
  it("T3", "Speed, heights, and fast motion excite me more than they scare me.", "TAS"),
  it("T4", "I actively seek out adventurous, adrenaline-filled experiences.", "TAS"),
  it("D1", "I enjoy wild, spontaneous, uninhibited experiences.", "DIS"),
  it("D2", "I'm drawn to things that are novel, intense, or unconventional.", "DIS"),
  it("D3", "I get restless and bored when life becomes too familiar.", "DIS"),
  it("D4", "I'll try something just to see what it's like, even if it's a bit risky.", "DIS"),
];

export const sensationSeeking: Instrument = {
  id: "sensation-seeking",
  name: "Sensation Seeking",
  shortName: "Sensation",
  kind: "dimensional",
  category: "focused",
  tagline: "Your appetite for novelty, intensity, and a little risk.",
  description:
    "Sensation seeking, mapped by Marvin Zuckerman, is the drive for varied, novel, and intense experience — and the " +
    "willingness to take physical or social risks to get it. It shows up in two flavors here: a taste for physical " +
    "thrill and adventure, and a pull toward novel, disinhibited experience. High or low, it shapes the life you build.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in Zuckerman's Sensation Seeking Scale.",
  scales: [
    { id: "TAS", name: "Thrill & Adventure Seeking", description: "Desire for physical thrill, speed, and adventure.", highDescriptor: "drawn to adrenaline, speed, and physical risk", lowDescriptor: "happiest with calm, low-risk activity", poles: { low: "Cautious", high: "Thrill-seeking" }, normMean: 3.0, normSd: 0.85 },
    { id: "DIS", name: "Experience & Disinhibition", description: "Desire for novel, intense, unconventional experience.", highDescriptor: "drawn to novelty, intensity, and spontaneity", lowDescriptor: "content with the familiar and predictable", poles: { low: "Steady", high: "Novelty-seeking" }, normMean: 3.0, normSd: 0.8 },
  ],
  items,
  caveats: [
    "Sensation seeking is value-neutral: it fuels exploration, creativity, and zest — and, unmanaged, riskier choices. The aim is to channel it, not suppress it.",
    "It's partly biological and tends to decline with age; your score is a snapshot of now.",
    "This is an educational self-reflection tool, not a clinical or risk-assessment measure.",
  ],
  citations: [
    { ref: "Zuckerman, M. (1994). Behavioral Expressions and Biosocial Bases of Sensation Seeking. Cambridge University Press." },
    { ref: "Zuckerman, M. (1971). Dimensions of sensation seeking. Journal of Consulting and Clinical Psychology, 36(1), 45–52." },
  ],
};
