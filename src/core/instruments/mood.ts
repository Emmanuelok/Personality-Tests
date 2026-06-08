import type { Instrument, Item } from "../types";

/**
 * Mood Check-in (a supportive low-mood snapshot).
 *
 * Adjacent to the PHQ-9 depression screen, but deliberately reframed around the
 * POSITIVE pole — higher scores mean "doing better" — so it reads as a caring
 * wellbeing check-in, not a deficit tally. This is NOT a diagnostic tool; see the
 * caveats and resources. Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 4, labels: ["Not at all", "Several days", "More than half the days", "Nearly every day"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Mood & Outlook (high = brighter mood)
  it("M1", "Over the past two weeks, I've felt down, depressed, or hopeless.", "MOOD", -1),
  it("M2", "I've had little interest or pleasure in things I usually enjoy.", "MOOD", -1),
  it("M3", "I've felt good about myself and hopeful about the days ahead.", "MOOD", 1),
  it("M4", "I've been able to enjoy parts of my day.", "MOOD", 1),
  // Energy & Rest (high = better energy)
  it("E1", "I've slept reasonably well and felt rested.", "ENRG", 1),
  it("E2", "I've had the energy to do what I needed to do.", "ENRG", 1),
  it("E3", "I've felt tired or low on energy.", "ENRG", -1),
  it("E4", "I've felt slowed down, or restless and unable to settle.", "ENRG", -1),
];

export const mood: Instrument = {
  id: "mood-checkin",
  name: "Mood Check-in",
  shortName: "Mood",
  kind: "dimensional",
  category: "emotional",
  tagline: "A gentle two-week snapshot of mood and energy — support, not diagnosis.",
  description:
    "A brief, caring check-in on how your mood and energy have been over the past two weeks, in the spirit of common " +
    "wellbeing screens — but framed around how you're doing, not what's wrong. Higher scores mean steadier mood and " +
    "energy. It's a prompt for self-awareness and self-care, never a diagnosis.",
  estMinutes: 2,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, adjacent to the PHQ-9 wellbeing domains (cognitive-affective and somatic).",
  scales: [
    { id: "MOOD", name: "Mood & Outlook", description: "Brightness of mood, interest, and hope.", highDescriptor: "brighter mood, interest, and hope", lowDescriptor: "lower, flatter mood and less interest", poles: { low: "Low & flat", high: "Bright & hopeful" }, normMean: 2.7, normSd: 0.8 },
    { id: "ENRG", name: "Energy & Rest", description: "Energy, rest, and physical steadiness.", highDescriptor: "rested, energized, and settled", lowDescriptor: "tired, depleted, or restless", poles: { low: "Depleted", high: "Energized" }, normMean: 2.7, normSd: 0.8 },
  ],
  items,
  caveats: [
    "This is a supportive self-reflection check-in, NOT a diagnostic test. It cannot diagnose depression or any condition.",
    "Mood naturally moves with circumstances; one snapshot says little on its own. Patterns over time are more telling.",
    "If low mood has lasted more than two weeks, or is affecting daily life, please consider reaching out to a doctor or mental-health professional — it helps, and you deserve support.",
    "If you ever have thoughts of harming yourself, please contact local emergency services or a crisis line right away (e.g., in the US dial or text 988; find your local line at findahelpline.com). You are not alone.",
  ],
  citations: [
    { ref: "Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9. Journal of General Internal Medicine, 16(9), 606–613.", note: "Domain reference; this tool is a reframed wellbeing check-in, not the PHQ-9 itself." },
    { ref: "World Health Organization (2021). WHO-5 Well-Being Index.", note: "Model for strengths-framed wellbeing measurement." },
  ],
};
