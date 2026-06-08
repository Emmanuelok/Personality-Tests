import type { Instrument, Item } from "../types";

/**
 * Burnout (Maslach tradition) — emotional exhaustion, cynicism, and (reduced)
 * professional efficacy. Original items inspired by the Maslach Burnout Inventory;
 * educational and non-diagnostic.
 */

const L = { min: 1, max: 5, labels: ["Never", "Rarely", "Sometimes", "Often", "Almost always"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  it("EE1", "I feel emotionally drained by my work and daily demands.", "EE"),
  it("EE2", "I feel used up at the end of the day.", "EE"),
  it("EE3", "Just getting through the day feels like a strain.", "EE"),
  it("EE4", "I feel burned out by my responsibilities.", "EE"),
  it("CY1", "I've grown more cynical about whether my work really matters.", "CY"),
  it("CY2", "I've become more detached from the people I work with or for.", "CY"),
  it("CY3", "I just want to do my tasks and be left alone.", "CY"),
  it("CY4", "I increasingly doubt the value of what I do.", "CY"),
  it("PA1", "I feel I'm accomplishing worthwhile things.", "PA"),
  it("PA2", "I deal with problems effectively.", "PA"),
  it("PA3", "I feel energized when I do my work well.", "PA"),
  it("PA4", "I have a positive impact on others through what I do.", "PA"),
];

export const burnout: Instrument = {
  id: "burnout-mbi",
  name: "Burnout Check",
  shortName: "Burnout",
  kind: "dimensional",
  category: "wellbeing",
  tagline: "Exhaustion, cynicism, and efficacy — the three faces of burnout.",
  description:
    "Burnout, as Christina Maslach mapped it, isn't just tiredness — it's a syndrome with three parts: emotional " +
    "exhaustion, cynicism/detachment, and a dwindling sense of accomplishment. This check reflects all three so you can " +
    "see not only how depleted you feel, but where the erosion is happening — and where your sense of efficacy still holds.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, inspired by the Maslach Burnout Inventory; not the proprietary MBI.",
  scales: [
    { id: "EE", name: "Emotional Exhaustion", description: "Feeling drained and depleted by demands.", highDescriptor: "running on empty and emotionally spent", lowDescriptor: "energized and emotionally resourced", poles: { low: "Resourced", high: "Exhausted" }, normMean: 2.9, normSd: 0.95 },
    { id: "CY", name: "Cynicism", description: "Detachment from and disillusionment with work.", highDescriptor: "detached, cynical, and disengaged", lowDescriptor: "engaged and connected to your work", poles: { low: "Engaged", high: "Cynical" }, normMean: 2.6, normSd: 0.9 },
    { id: "PA", name: "Professional Efficacy", description: "Sense of accomplishment and competence.", highDescriptor: "effective and accomplishing worthwhile things", lowDescriptor: "doubting your impact and competence", poles: { low: "Diminished", high: "Effective" }, normMean: 3.6, normSd: 0.7 },
  ],
  items,
  caveats: [
    "Burnout is a response to chronic stress, often driven by environment and workload — not a personal failing or a fixed trait.",
    "This is an educational self-reflection, not a clinical diagnosis. Persistent exhaustion deserves real rest and, if it lingers, professional support.",
    "High exhaustion AND cynicism alongside low efficacy is the classic burnout pattern; any one alone is less conclusive.",
  ],
  citations: [
    { ref: "Maslach, C., & Jackson, S. E. (1981). The measurement of experienced burnout. Journal of Occupational Behavior, 2(2), 99–113." },
    { ref: "Maslach, C., & Leiter, M. P. (2016). Understanding the burnout experience. World Psychiatry, 15(2), 103–111." },
  ],
};
