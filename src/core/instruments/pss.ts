import type { Instrument, Item } from "../types";

/**
 * Perceived Stress Scale (Cohen) — how unpredictable, uncontrollable, and
 * overloaded you've found your life lately. The most widely used measure of
 * perceived stress. Wording follows the public-domain PSS-10.
 */

const L = { min: 1, max: 5, labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  it("S1", "In the last month, how often have you been upset by something that happened unexpectedly?", "STRESS"),
  it("S2", "How often have you felt unable to control the important things in your life?", "STRESS"),
  it("S3", "How often have you felt nervous and stressed?", "STRESS"),
  it("S4", "How often have you found that you could not cope with all the things you had to do?", "STRESS"),
  it("S5", "How often have you been angered by things that were outside of your control?", "STRESS"),
  it("S6", "How often have you felt difficulties were piling up so high you could not overcome them?", "STRESS"),
  it("S7", "How often have you felt confident about your ability to handle your personal problems?", "STRESS", -1),
  it("S8", "How often have you felt that things were going your way?", "STRESS", -1),
  it("S9", "How often have you been able to control irritations in your life?", "STRESS", -1),
  it("S10", "How often have you felt that you were on top of things?", "STRESS", -1),
];

export const pss: Instrument = {
  id: "perceived-stress",
  name: "Perceived Stress",
  shortName: "Stress",
  kind: "dimensional",
  category: "wellbeing",
  tagline: "How overloaded, unpredictable, and out-of-control life has felt lately.",
  description:
    "Stress isn't only about what happens to you — it's about how much you feel able to handle it. The Perceived Stress " +
    "Scale, the field's most-used measure, captures that appraisal: how unpredictable, uncontrollable, and overloaded " +
    "the past month has felt. It's a snapshot of a stretch of time, and it moves as your circumstances and coping do.",
  estMinutes: 3,
  responseFormat: L,
  itemProvenance: "Items follow the public-domain Perceived Stress Scale (PSS-10; Cohen et al., 1983).",
  scales: [
    { id: "STRESS", name: "Perceived Stress", description: "Appraised stress over the past month.", highDescriptor: "feeling overloaded and short on control", lowDescriptor: "feeling steady and on top of things", poles: { low: "In control", high: "Overloaded" }, normMean: 2.8, normSd: 0.78 },
  ],
  items,
  caveats: [
    "Perceived stress is a snapshot of recent weeks, not a fixed trait — it rises and falls with what's on your plate and your coping.",
    "Some stress is normal and even useful; the concern is when it's high and sustained.",
    "This is an educational self-reflection, not a clinical measure. If stress feels unmanageable, reaching out for support is wise and common.",
  ],
  citations: [
    { ref: "Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global measure of perceived stress. Journal of Health and Social Behavior, 24(4), 385–396." },
    { ref: "Cohen, S., & Williamson, G. (1988). Perceived stress in a probability sample of the United States. In The Social Psychology of Health." },
  ],
};
