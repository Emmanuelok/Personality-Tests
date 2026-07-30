import type { Instrument, Item } from "../types";

/**
 * Brief Resilience Scale (Smith et al.).
 *
 * Resilience defined as it should be: the ability to bounce BACK from stress, not
 * merely to endure it. Six balanced items. Distinct from grit (which is about
 * long-term perseverance). Wording follows the public Brief Resilience Scale.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("R1", "I tend to bounce back quickly after hard times.", "RES"),
  it("R2", "I have a hard time making it through stressful events.", "RES", -1),
  it("R3", "It does not take me long to recover from a stressful event.", "RES"),
  it("R4", "It is hard for me to snap back when something bad happens.", "RES", -1),
  it("R5", "I usually come through difficult times with little trouble.", "RES"),
  it("R6", "I tend to take a long time to get over setbacks in my life.", "RES", -1),
];

export const resilience: Instrument = {
  id: "brief-resilience",
  name: "Resilience (Bounce-Back)",
  shortName: "Resilience",
  kind: "dimensional",
  category: "focused",
  tagline: "How quickly you recover and bounce back from stress.",
  description:
    "Resilience is often muddled with toughness or grit, but the Brief Resilience Scale measures the original meaning: " +
    "how readily you bounce BACK after stress and adversity. It's not about never struggling — it's about recovery. And " +
    "because resilience grows with support, skills, and meaning, a lower score is a place to build from.",
  estMinutes: 1,
  responseFormat: L,
  itemProvenance: "Items follow the public-domain Brief Resilience Scale (Smith et al., 2008).",
  scales: [
    { id: "RES", name: "Bounce-Back Resilience", description: "Capacity to recover quickly from stress and setbacks.", highDescriptor: "you recover quickly and come through difficulty intact", lowDescriptor: "setbacks tend to knock you down for longer", poles: { low: "Slow to recover", high: "Bounces back" }, normMean: 3.4, normSd: 0.72 },
  ],
  items,
  caveats: [
    "Resilience is the ability to recover, not to feel no pain — struggling after hard events is normal and human.",
    "It's buildable: strong relationships, meaning, self-care, and skills like reframing all raise it over time.",
    "This is an educational self-reflection tool. If you're finding it hard to recover from something heavy, reaching out for support is a sign of strength, not weakness.",
  ],
  citations: [
    { ref: "Smith, B. W., Dalen, J., Wiggins, K., Tooley, E., Christopher, P., & Bernard, J. (2008). The Brief Resilience Scale. International Journal of Behavioral Medicine, 15(3), 194–200." },
    { ref: "Connor, K. M., & Davidson, J. R. T. (2003). Development of a new resilience scale (CD-RISC). Depression and Anxiety, 18(2), 76–82." },
  ],
};
