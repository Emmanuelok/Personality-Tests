import type { Instrument, Item } from "../types";

/**
 * Character Strengths & Virtues (VIA — six virtues).
 *
 * The VIA Classification (Peterson & Seligman, 2004) organizes 24 character
 * strengths under six universal virtues. This profiler measures the six virtues
 * and surfaces your signature ones — the strengths most worth building a life
 * around. Items are ORIGINAL to this platform; the VIA-IS instrument is not used.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "A little", "Somewhat", "Mostly like me", "Very much like me"] };
const it = (id: string, text: string, scale: string): Item => ({ id, text, scale, keyed: 1 });

const items: Item[] = [
  // Wisdom & Knowledge
  it("W1", "I love learning new things, just for the joy of understanding.", "WIS"),
  it("W2", "I'm curious about the world and ask a lot of questions.", "WIS"),
  it("W3", "People come to me for wise advice and perspective.", "WIS"),
  it("W4", "I think creatively and enjoy coming up with original ideas.", "WIS"),
  // Courage
  it("C1", "I stand up for what's right, even when it's hard or unpopular.", "COU"),
  it("C2", "I finish what I start, even when it gets difficult.", "COU"),
  it("C3", "I'm honest and authentic about who I really am.", "COU"),
  it("C4", "I approach life with energy and enthusiasm.", "COU"),
  // Humanity
  it("H1", "I genuinely care about others and show it through kindness.", "HUM"),
  it("H2", "I invest in close, loving relationships and value them deeply.", "HUM"),
  it("H3", "I'm good at sensing what other people are feeling.", "HUM"),
  it("H4", "Helping someone makes my whole day better.", "HUM"),
  // Justice
  it("J1", "I work well as part of a team and pull my weight.", "JUS"),
  it("J2", "I treat everyone fairly, regardless of who they are.", "JUS"),
  it("J3", "I can organize and motivate a group toward a shared goal.", "JUS"),
  it("J4", "I believe in doing my part for my community.", "JUS"),
  // Temperance
  it("T1", "I forgive people rather than hold on to grudges.", "TEM"),
  it("T2", "I'm humble and let my actions speak for themselves.", "TEM"),
  it("T3", "I'm careful and think things through before I act.", "TEM"),
  it("T4", "I have good control over my impulses and habits.", "TEM"),
  // Transcendence
  it("R1", "I'm often moved by beauty in art, nature, or skill.", "TRA"),
  it("R2", "I feel grateful for the good things in my life.", "TRA"),
  it("R3", "I stay hopeful and optimistic about the future.", "TRA"),
  it("R4", "Humor and playfulness are a big part of who I am.", "TRA"),
];

export const via: Instrument = {
  id: "via-virtues",
  name: "Character Strengths & Virtues (VIA)",
  shortName: "Strengths",
  kind: "dimensional",
  category: "strengths",
  tagline: "Discover your signature strengths — the best of who you are.",
  description:
    "Based on the VIA Classification of character strengths and virtues, this profiler measures the six " +
    "universal virtues — Wisdom, Courage, Humanity, Justice, Temperance, and Transcendence — and highlights " +
    "your signature strengths. Using your strengths in new ways is one of the most reliably effective routes " +
    "to greater wellbeing.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance: "Original items written for this platform, grounded in the VIA Classification (Peterson & Seligman, 2004). The VIA-IS is not used.",
  scales: [
    { id: "WIS", name: "Wisdom & Knowledge", description: "Curiosity, love of learning, creativity, judgment, and perspective.", highDescriptor: "curious, open-minded, and drawn to learning and ideas", lowDescriptor: "practical and grounded rather than intellectually restless", normMean: 3.7, normSd: 0.6 },
    { id: "COU", name: "Courage", description: "Bravery, perseverance, honesty, and zest.", highDescriptor: "brave, persistent, authentic, and full of drive", lowDescriptor: "measured and cautious rather than bold", normMean: 3.6, normSd: 0.6 },
    { id: "HUM", name: "Humanity", description: "Love, kindness, and social intelligence.", highDescriptor: "warm, caring, and attuned to others", lowDescriptor: "more self-contained than nurturing", normMean: 3.9, normSd: 0.55 },
    { id: "JUS", name: "Justice", description: "Teamwork, fairness, and leadership.", highDescriptor: "fair, civic-minded, and a dependable team member or leader", lowDescriptor: "more independent than group-oriented", normMean: 3.7, normSd: 0.58 },
    { id: "TEM", name: "Temperance", description: "Forgiveness, humility, prudence, and self-regulation.", highDescriptor: "self-disciplined, humble, forgiving, and measured", lowDescriptor: "spontaneous and uninhibited rather than restrained", normMean: 3.5, normSd: 0.6 },
    { id: "TRA", name: "Transcendence", description: "Appreciation of beauty, gratitude, hope, humor, and meaning.", highDescriptor: "grateful, hopeful, playful, and moved by meaning and beauty", lowDescriptor: "down-to-earth rather than transcendence-seeking", normMean: 3.7, normSd: 0.6 },
  ],
  items,
  caveats: [
    "Strengths aren't ranked against other people so much as within you — your top virtues are your 'signature.'",
    "There are no bad results here: every virtue is a genuine strength. Growth is about using your top ones more, on purpose.",
    "A brief measure of the six virtues, not the full 24-strength VIA-IS.",
  ],
  citations: [
    { ref: "Peterson, C., & Seligman, M. E. P. (2004). Character Strengths and Virtues: A Handbook and Classification. Oxford University Press / APA." },
    { ref: "Niemiec, R. M. (2018). Character Strengths Interventions: A Field Guide for Practitioners. Hogrefe." },
    { ref: "Seligman, M. E. P., Steen, T. A., Park, N., & Peterson, C. (2005). Positive psychology progress: Empirical validation of interventions. American Psychologist, 60(5), 410–421." },
  ],
};
