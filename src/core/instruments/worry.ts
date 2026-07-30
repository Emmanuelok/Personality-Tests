import type { Instrument, Item } from "../types";

/**
 * Worry Check-in (a supportive anxiety / calm snapshot).
 *
 * Adjacent to the GAD-7 anxiety screen, but reframed around the POSITIVE pole —
 * higher scores mean "calmer and steadier." This is NOT a diagnostic tool; see the
 * caveats and resources. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 4, labels: ["Not at all", "Several days", "More than half the days", "Nearly every day"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Calm & Ease (high = calmer)
  it("C1", "Over the past two weeks, I've felt nervous, anxious, or on edge.", "CALM", -1),
  it("C2", "I haven't been able to stop or control worrying.", "CALM", -1),
  it("C3", "I've felt calm and at ease.", "CALM", 1),
  it("C4", "I've been able to relax when I wanted to.", "CALM", 1),
  // Steadiness (high = steadier)
  it("S1", "I've felt relaxed rather than wound up.", "STDY", 1),
  it("S2", "I've been restless or found it hard to sit still.", "STDY", -1),
  it("S3", "I've felt easily annoyed or irritable.", "STDY", -1),
  it("S4", "I've felt afraid that something awful might happen.", "STDY", -1),
];

export const worry: Instrument = {
  id: "worry-checkin",
  name: "Worry Check-in",
  shortName: "Worry",
  kind: "dimensional",
  category: "emotional",
  tagline: "A gentle two-week snapshot of worry and calm — support, not diagnosis.",
  description:
    "A brief, caring check-in on worry and tension over the past two weeks, in the spirit of common anxiety screens — " +
    "but framed around calm and steadiness rather than symptoms. Higher scores mean more ease. It's a prompt for " +
    "self-awareness and self-care, never a diagnosis.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, adjacent to the GAD-7 anxiety domains.",
  scales: [
    { id: "CALM", name: "Calm & Ease", description: "Freedom from anxious worry.", highDescriptor: "calm, at ease, and able to relax", lowDescriptor: "anxious, on edge, and worried", poles: { low: "Anxious", high: "Calm" }, normMean: 2.7, normSd: 0.8 },
    { id: "STDY", name: "Steadiness", description: "Inner steadiness and freedom from restlessness.", highDescriptor: "settled, even, and steady", lowDescriptor: "restless, irritable, or apprehensive", poles: { low: "Restless", high: "Steady" }, normMean: 2.7, normSd: 0.8 },
  ],
  items,
  caveats: [
    "This is a supportive self-reflection check-in, NOT a diagnostic test. It cannot diagnose an anxiety disorder or any condition.",
    "Everyone feels anxious sometimes; a single snapshot says little on its own. Persistent patterns matter more.",
    "If worry has been hard to control for more than two weeks, or is getting in the way of life, please consider talking with a doctor or mental-health professional — effective help exists.",
    "If you ever feel unsafe or in crisis, please contact local emergency services or a crisis line right away (e.g., in the US dial or text 988; find your local line at findahelpline.com). You are not alone.",
  ],
  citations: [
    { ref: "Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). The GAD-7. Archives of Internal Medicine, 166(10), 1092–1097.", note: "Domain reference; this tool is a reframed wellbeing check-in, not the GAD-7 itself." },
    { ref: "Topp, C. W., et al. (2015). The WHO-5 Well-Being Index: a systematic review. Psychotherapy and Psychosomatics, 84(3), 167–176." },
  ],
};
