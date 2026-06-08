import type { AssessmentResult, Instrument } from "./types";
import { Rng, hashHex, nonce, seedFrom } from "./prng";
import { capitalize, oxford, sentence } from "./variation";

/**
 * Cross-test synthesis — the heart of the platform's intelligence.
 *
 * Most assessment apps test you in silos. This engine reads across EVERY
 * instrument a person has completed and weaves them into one integrated portrait:
 * the themes that keep surfacing, the strengths and growth edges that aggregate,
 * the tensions between different parts of them, and a personal "operating manual."
 * The more they take, the deeper it gets — and it's composed uniquely each time.
 */

export interface SynthEntry {
  instrument: Instrument;
  result: AssessmentResult;
}

export interface ThemeHit {
  id: string;
  name: string;
  blurb: string;
  score: number;
  evidence: string[];
  narrative: string;
}

export interface Tension {
  title: string;
  detail: string;
}

export interface OperatingNote {
  label: string;
  text: string;
}

export interface IntegratedProfile {
  name?: string;
  generatedAt: string;
  reportId: string;
  seedHex: string;
  instrumentsUsed: { id: string; name: string; type?: string }[];
  headline: string;
  subhead: string;
  overview: string[];
  themes: ThemeHit[];
  strengths: string[];
  growthEdges: string[];
  tensions: Tension[];
  operatingManual: OperatingNote[];
  /** 0..100 how complete the picture is (more tests → higher). */
  depth: number;
}

type Dir = "high" | "low";
interface Signal {
  i: string;
  s: string;
  d: Dir;
  w: number;
}
interface ThemeDef {
  id: string;
  name: string;
  adj: string;
  noun: string;
  blurb: string;
  narr: string;
  signals: Signal[];
}

const THEMES: ThemeDef[] = [
  {
    id: "explorer",
    name: "The Explorer's Mind",
    adj: "Imaginative",
    noun: "Explorer",
    blurb: "A restless curiosity and pull toward ideas, novelty, and possibility.",
    narr: "A deep current of curiosity runs through you — you're pulled toward ideas, novelty, and what could be, more than what merely is.",
    signals: [
      { i: "big-five-ipip50", s: "O", d: "high", w: 1 },
      { i: "hexaco-24", s: "O", d: "high", w: 1 },
      { i: "jung-16-types", s: "SN", d: "high", w: 0.8 },
      { i: "schwartz-values", s: "SD", d: "high", w: 0.7 },
      { i: "schwartz-values", s: "ST", d: "high", w: 0.7 },
      { i: "via-24", s: "CURIO", d: "high", w: 0.6 },
      { i: "enneagram-9", s: "T5", d: "high", w: 0.5 },
    ],
  },
  {
    id: "achiever",
    name: "The Driven Achiever",
    adj: "Driven",
    noun: "Achiever",
    blurb: "A strong engine of ambition, discipline, and follow-through.",
    narr: "There's a powerful engine of ambition in you — you set the bar high and you do the work to clear it.",
    signals: [
      { i: "big-five-ipip50", s: "C", d: "high", w: 1 },
      { i: "hexaco-24", s: "C", d: "high", w: 0.9 },
      { i: "schwartz-values", s: "AC", d: "high", w: 0.9 },
      { i: "grit-resilience", s: "PERS", d: "high", w: 0.9 },
      { i: "disc-4", s: "D", d: "high", w: 0.7 },
      { i: "enneagram-9", s: "T3", d: "high", w: 0.6 },
    ],
  },
  {
    id: "connector",
    name: "The Warm Connector",
    adj: "Warm",
    noun: "Connector",
    blurb: "A natural orientation toward people, warmth, and belonging.",
    narr: "People are at the center of how you operate — you give warmth easily and you read the room without trying.",
    signals: [
      { i: "big-five-ipip50", s: "A", d: "high", w: 0.9 },
      { i: "hexaco-24", s: "A", d: "high", w: 0.7 },
      { i: "big-five-ipip50", s: "E", d: "high", w: 0.8 },
      { i: "via-24", s: "KIND", d: "high", w: 0.8 },
      { i: "emotional-intelligence", s: "EM", d: "high", w: 0.8 },
      { i: "disc-4", s: "I", d: "high", w: 0.7 },
      { i: "enneagram-9", s: "T2", d: "high", w: 0.6 },
      { i: "schwartz-values", s: "BE", d: "high", w: 0.6 },
    ],
  },
  {
    id: "anchor",
    name: "The Steady Anchor",
    adj: "Grounded",
    noun: "Anchor",
    blurb: "Calm, consistency, and a stabilizing presence under pressure.",
    narr: "You're the steady one — calm under load, consistent over time, the person others reach for when things wobble.",
    signals: [
      { i: "big-five-ipip50", s: "N", d: "low", w: 1 },
      { i: "emotional-intelligence", s: "SR", d: "high", w: 0.9 },
      { i: "grit-resilience", s: "CONS", d: "high", w: 0.7 },
      { i: "schwartz-values", s: "SE", d: "high", w: 0.6 },
      { i: "disc-4", s: "S", d: "high", w: 0.7 },
      { i: "hexaco-24", s: "E", d: "low", w: 0.5 },
    ],
  },
  {
    id: "feeler",
    name: "The Sensitive Depth",
    adj: "Soulful",
    noun: "Feeler",
    blurb: "Emotional depth, sensitivity, and a rich inner life.",
    narr: "You feel things at high resolution. Your emotional depth is a source of empathy, artistry, and meaning — and something to tend with care.",
    signals: [
      { i: "big-five-ipip50", s: "N", d: "high", w: 0.8 },
      { i: "hexaco-24", s: "E", d: "high", w: 0.8 },
      { i: "jung-16-types", s: "TF", d: "high", w: 0.7 },
      { i: "enneagram-9", s: "T4", d: "high", w: 0.9 },
      { i: "attachment-styles", s: "ANX", d: "high", w: 0.5 },
    ],
  },
  {
    id: "idealist",
    name: "The Principled Idealist",
    adj: "Principled",
    noun: "Idealist",
    blurb: "A strong moral compass and a pull toward fairness and integrity.",
    narr: "You carry a strong inner sense of right and wrong, and a genuine pull toward fairness, integrity, and a better world.",
    signals: [
      { i: "hexaco-24", s: "H", d: "high", w: 1 },
      { i: "schwartz-values", s: "UN", d: "high", w: 0.9 },
      { i: "enneagram-9", s: "T1", d: "high", w: 0.8 },
      { i: "via-24", s: "FAIR", d: "high", w: 0.6 },
    ],
  },
  {
    id: "mover",
    name: "The Bold Mover",
    adj: "Bold",
    noun: "Catalyst",
    blurb: "Decisiveness, assertiveness, and a drive to make things happen.",
    narr: "You move first. Bold, decisive, and comfortable taking the lead, you'd rather act and adjust than wait and wonder.",
    signals: [
      { i: "disc-4", s: "D", d: "high", w: 0.9 },
      { i: "big-five-ipip50", s: "E", d: "high", w: 0.6 },
      { i: "schwartz-values", s: "PO", d: "high", w: 0.7 },
      { i: "enneagram-9", s: "T8", d: "high", w: 0.8 },
      { i: "grit-resilience", s: "PERS", d: "high", w: 0.4 },
    ],
  },
  {
    id: "freespirit",
    name: "The Free Spirit",
    adj: "Spontaneous",
    noun: "Free Spirit",
    blurb: "A love of freedom, variety, and living in the moment.",
    narr: "You crave room to breathe — freedom, variety, and the next experience. Routine feels like a cage; possibility feels like home.",
    signals: [
      { i: "schwartz-values", s: "ST", d: "high", w: 0.8 },
      { i: "schwartz-values", s: "HE", d: "high", w: 0.7 },
      { i: "big-five-ipip50", s: "C", d: "low", w: 0.7 },
      { i: "jung-16-types", s: "JP", d: "low", w: 0.7 },
      { i: "enneagram-9", s: "T7", d: "high", w: 0.8 },
    ],
  },
  {
    id: "strategist",
    name: "The Sharp Strategist",
    adj: "Strategic",
    noun: "Strategist",
    blurb: "Analytical, independent, and several moves ahead.",
    narr: "You think in systems and stay several moves ahead — analytical, self-reliant, and unsentimental when a clear head is what's needed.",
    signals: [
      { i: "jung-16-types", s: "TF", d: "low", w: 0.7 },
      { i: "big-five-ipip50", s: "A", d: "low", w: 0.6 },
      { i: "disc-4", s: "C", d: "high", w: 0.7 },
      { i: "dark-triad-18", s: "MACH", d: "high", w: 0.5 },
      { i: "emotional-intelligence", s: "SR", d: "high", w: 0.4 },
    ],
  },
  {
    id: "introvert",
    name: "The Reflective Introvert",
    adj: "Reflective",
    noun: "Thinker",
    blurb: "Depth over breadth, and a rich, private inner world.",
    narr: "Your energy turns inward. You think before you speak, prefer depth to breadth, and do your best work in quiet, focused space.",
    signals: [
      { i: "big-five-ipip50", s: "E", d: "low", w: 0.9 },
      { i: "jung-16-types", s: "EI", d: "low", w: 0.9 },
      { i: "hexaco-24", s: "X", d: "low", w: 0.7 },
      { i: "enneagram-9", s: "T5", d: "high", w: 0.5 },
    ],
  },
];

interface TensionDef {
  a: Signal;
  b: Signal;
  title: string;
  detail: string;
}
const TENSIONS: TensionDef[] = [
  { a: { i: "schwartz-values", s: "ST", d: "high", w: 1 }, b: { i: "big-five-ipip50", s: "C", d: "high", w: 1 }, title: "Adventure vs. structure", detail: "Part of you craves novelty and spontaneity; another part wants order and a plan. Your best life builds in scheduled room for the unplanned." },
  { a: { i: "big-five-ipip50", s: "A", d: "high", w: 1 }, b: { i: "disc-4", s: "D", d: "high", w: 1 }, title: "Warmth vs. drive to win", detail: "You're both deeply considerate and strongly assertive. The growth move is learning when to lead hard and when to soften — and choosing on purpose." },
  { a: { i: "schwartz-values", s: "PO", d: "high", w: 1 }, b: { i: "schwartz-values", s: "UN", d: "high", w: 1 }, title: "Ambition vs. altruism", detail: "You value both personal success and the wellbeing of all. Held well, this makes you a leader who lifts others; held badly, it pulls you in two." },
  { a: { i: "big-five-ipip50", s: "O", d: "high", w: 1 }, b: { i: "big-five-ipip50", s: "C", d: "low", w: 1 }, title: "Ideas vs. execution", detail: "You generate far more ideas than you finish. External structure — deadlines, a finisher, a single next action — is how your creativity becomes real." },
  { a: { i: "attachment-styles", s: "ANX", d: "high", w: 1 }, b: { i: "attachment-styles", s: "AV", d: "high", w: 1 }, title: "Craving and fearing closeness", detail: "You want connection and you protect yourself from it at the same time. Naming this pattern is the first, biggest step toward security." },
  { a: { i: "big-five-ipip50", s: "N", d: "high", w: 1 }, b: { i: "grit-resilience", s: "PERS", d: "high", w: 1 }, title: "Sensitivity vs. relentless drive", detail: "You feel setbacks keenly and you push hard anyway. That's a powerful combination — as long as you build in real recovery, not just more effort." },
];

function lookup(entries: SynthEntry[]) {
  const map = new Map<string, SynthEntry>();
  for (const e of entries) map.set(e.instrument.id, e);
  return (i: string, s: string) => {
    const e = map.get(i);
    if (!e) return null;
    const sc = e.result.scales[s];
    if (!sc) return null;
    return { norm: sc.normalized, instrument: e.instrument, scale: sc };
  };
}

function intensity(norm: number, d: Dir): number {
  return d === "high" ? Math.max(0, (norm - 50) / 50) : Math.max(0, (50 - norm) / 50);
}

function firstClause(desc: string): string {
  return desc.split(/,| and /)[0].trim();
}

/** Instruments whose scales read as clean, celebratable trait strengths. */
const STRENGTH_INSTRUMENTS = new Set([
  "big-five-ipip50",
  "hexaco-24",
  "emotional-intelligence",
  "grit-resilience",
  "disc-4",
  "schwartz-values",
]);

export function buildIntegratedProfile(entries: SynthEntry[], opts: { name?: string; seed?: number; now?: Date } = {}): IntegratedProfile {
  const now = opts.now ?? new Date();
  const reportId = nonce(8);
  const seed = opts.seed ?? seedFrom("synth", entries.map((e) => e.result.responseFingerprint).join("|"), now.getTime(), reportId);
  const rng = new Rng(seed);
  const g = lookup(entries);
  const name = opts.name;

  // 1. Themes.
  const themeHits: ThemeHit[] = [];
  for (const t of THEMES) {
    let score = 0;
    const evidence: string[] = [];
    for (const sig of t.signals) {
      const hit = g(sig.i, sig.s);
      if (!hit) continue;
      const inten = intensity(hit.norm, sig.d);
      if (inten > 0) {
        score += sig.w * inten;
        if (inten >= 0.28) evidence.push(`${sig.d === "high" ? "high" : "low"} ${hit.scale.name} (${hit.instrument.shortName})`);
      }
    }
    if (score >= 0.6 && evidence.length >= 1) {
      themeHits.push({ id: t.id, name: t.name, blurb: t.blurb, score, evidence: evidence.slice(0, 4), narrative: t.narr });
    }
  }
  themeHits.sort((a, b) => b.score - a.score);
  const topThemes = themeHits.slice(0, 4);
  const topDefs = topThemes.map((th) => THEMES.find((d) => d.id === th.id)!);

  // 2. Headline.
  let headline: string;
  if (topDefs.length >= 2) headline = `The ${topDefs[0].adj}, ${topDefs[1].adj} ${topDefs[0].noun}`;
  else if (topDefs.length === 1) headline = `The ${topDefs[0].adj} ${topDefs[0].noun}`;
  else headline = name ? `${name}'s Emerging Portrait` : "Your Emerging Portrait";

  // 3. Strengths & growth edges — only from instruments whose scales read as clean
  //    trait strengths, and valence-aware (low Neuroticism is a strength, not a gap).
  const strengthSet = new Map<string, number>();
  const growthSet = new Map<string, number>();
  for (const e of entries) {
    if (!STRENGTH_INSTRUMENTS.has(e.instrument.id)) continue;
    for (const sc of Object.values(e.result.scales)) {
      const def = e.instrument.scales.find((x) => x.id === sc.scaleId);
      if (!def) continue;
      const isN = e.instrument.id === "big-five-ipip50" && sc.scaleId === "N";
      if (isN) {
        if (sc.normalized >= 66) growthSet.set("Building emotional steadiness", Math.max(growthSet.get("Building emotional steadiness") ?? 0, sc.normalized));
        else if (sc.normalized <= 42) strengthSet.set("Calm and emotionally steady", Math.max(strengthSet.get("Calm and emotionally steady") ?? 0, 100 - sc.normalized));
        continue;
      }
      if (sc.normalized >= 66) {
        const phrase = capitalize(firstClause(def.highDescriptor));
        strengthSet.set(phrase, Math.max(strengthSet.get(phrase) ?? 0, sc.normalized));
      } else if (sc.normalized <= 34) {
        growthSet.set(`Building your ${def.name}`, Math.max(growthSet.get(`Building your ${def.name}`) ?? 0, 100 - sc.normalized));
      }
    }
  }
  const strengths = [...strengthSet.entries()].sort((a, b) => b[1] - a[1]).map((x) => x[0]).slice(0, 8);
  const growthEdges = [...growthSet.entries()].sort((a, b) => b[1] - a[1]).map((x) => x[0]).slice(0, 5);

  // 4. Tensions.
  const tensions: Tension[] = [];
  for (const t of TENSIONS) {
    const a = g(t.a.i, t.a.s);
    const b = g(t.b.i, t.b.s);
    if (a && b && intensity(a.norm, t.a.d) >= 0.2 && intensity(b.norm, t.b.d) >= 0.2) {
      tensions.push({ title: t.title, detail: t.detail });
    }
  }

  // 5. Operating manual.
  const om: OperatingNote[] = [
    { label: "How you take in the world", text: omThink(g) },
    { label: "How you decide", text: omDecide(g) },
    { label: "How you do your best work", text: omWork(g) },
    { label: "How you connect & recharge", text: omConnect(g) },
    { label: "How you handle stress", text: omStress(g) },
  ];

  // 6. Overview.
  const n = entries.length;
  const themeNames = topThemes.map((t) => t.name.replace(/^The /, "").toLowerCase());
  const p1 = sentence(
    name
      ? rng.pick([
          `${name}, this is the view from above — everything you've shared across ${n} ${n === 1 ? "assessment" : "assessments"}, woven into one portrait of you.`,
          `${name}, most tests show you a slice. This is the whole mosaic: ${n} ${n === 1 ? "assessment" : "assessments"} synthesized into a single, integrated picture.`,
        ])
      : rng.pick([
          `This is the view from above — everything across your ${n} ${n === 1 ? "assessment" : "assessments"}, woven into one integrated portrait.`,
          `Most tests show a slice; this is the whole mosaic — ${n} ${n === 1 ? "assessment" : "assessments"} synthesized into one picture.`,
        ]),
  );
  const p2 =
    topThemes.length > 0
      ? sentence(
          rng.pick([
            `The threads that keep surfacing: ${oxford(themeNames)}. ${topThemes[0].narrative}`,
            `Read together, a few themes recur — ${oxford(themeNames)}. ${topThemes[0].narrative}`,
          ]),
        )
      : sentence("Take a few more assessments and clear themes will start to emerge here, drawn from across everything you complete.");
  const p3 = sentence(
    rng.pick([
      "None of this is a box. It's a high-resolution mirror — meant to help you understand yourself, play to your strengths, and grow on purpose.",
      "Hold it lightly and use it deliberately: the point of seeing yourself this clearly is to choose, with intention, who you become next.",
    ]),
  );

  const depth = Math.min(100, Math.round((n / 6) * 100));

  return {
    name,
    generatedAt: now.toISOString(),
    reportId,
    seedHex: hashHex(String(seed)),
    instrumentsUsed: entries.map((e) => ({ id: e.instrument.id, name: e.instrument.name, type: e.result.type?.code })),
    headline,
    subhead: topThemes.length ? topThemes.map((t) => t.name.replace(/^The /, "")).join(" · ") : `${n} ${n === 1 ? "assessment" : "assessments"} so far`,
    overview: [p1, p2, p3],
    themes: topThemes,
    strengths,
    growthEdges,
    tensions: tensions.slice(0, 4),
    operatingManual: om,
    depth,
  };
}

/* ── operating-manual facet writers ─────────────────────────────────────── */
type G = (i: string, s: string) => { norm: number } | null;
const lean = (v: { norm: number } | null, t = 12) => (v && Math.abs(v.norm - 50) >= t ? v.norm : null);

function omThink(g: G): string {
  const sn = lean(g("jung-16-types", "SN"));
  const o = lean(g("big-five-ipip50", "O")) ?? lean(g("hexaco-24", "O"));
  if (sn != null) return sn >= 50 ? "You take in the world through patterns and possibility — your mind reaches for meaning, connections, and what could be." : "You take in the world through concrete reality — you trust facts, direct experience, and what's actually in front of you.";
  if (o != null) return o >= 50 ? "You're drawn to ideas, novelty, and the abstract; your imagination is always a little ahead of the present." : "You're practical and grounded, preferring the proven and tangible to the theoretical.";
  return "You move fluidly between concrete detail and big-picture thinking, drawing on whichever the moment needs.";
}
function omDecide(g: G): string {
  const tf = lean(g("jung-16-types", "TF"));
  const a = lean(g("big-five-ipip50", "A"));
  if (tf != null) return tf >= 50 ? "You decide with your values and your read on people — what's right and humane weighs as much as what's logical." : "You decide with impartial logic — you step back, weigh the evidence, and follow the principle even when it's uncomfortable.";
  if (a != null) return a >= 50 ? "You weigh how choices land on people, and you lean toward the cooperative path." : "You're willing to make the unpopular call and say the hard, true thing.";
  return "You blend head and heart when you decide, balancing logic against human impact.";
}
function omWork(g: G): string {
  const c = lean(g("big-five-ipip50", "C")) ?? lean(g("hexaco-24", "C"));
  const grit = lean(g("grit-resilience", "PERS"));
  if (c != null && c >= 50) return "You do your best work with structure and ownership: a clear goal, a plan, and the satisfaction of finishing. People trust you to deliver.";
  if (c != null && c < 50) return "You do your best work in bursts of energy and flexibility; rigid systems drain you, so lean on light external scaffolding — deadlines, a list, a partner who finishes.";
  if (grit != null && grit >= 50) return "You do your best work through sheer perseverance — you outlast problems other people give up on.";
  return "You work best with a balance of structure and freedom — enough plan to aim, enough room to adapt.";
}
function omConnect(g: G): string {
  const e = lean(g("big-five-ipip50", "E")) ?? lean(g("jung-16-types", "EI"));
  const att = lean(g("attachment-styles", "AV"));
  let base: string;
  if (e != null) base = e >= 50 ? "You're energized by people and recharge in company; connection is fuel, and solitude in large doses can feel flat." : "You recharge in solitude and connect best one-to-one; after a lot of socializing, quiet time isn't a luxury — it's how you reset.";
  else base = "You move between sociability and solitude, reading your own energy to know which you need.";
  if (att != null && att >= 60) base += " You also guard your independence in close relationships — sharing your inner world more openly is a growth edge.";
  return base;
}
function omStress(g: G): string {
  const nrt = lean(g("big-five-ipip50", "N"));
  const sr = lean(g("emotional-intelligence", "SR"));
  if (nrt != null && nrt >= 55) return "Under stress your system reacts strongly and recovers slowly. Your most reliable tools are naming the feeling, slowing your breath, and protecting recovery before pressure compounds.";
  if (sr != null && sr >= 55) return "Under stress you stay composed and reset quickly — your steadiness is a real asset. Watch only that calm doesn't tip into ignoring early warning signs.";
  if (nrt != null && nrt < 45) return "You stay remarkably level under pressure; setbacks roll off you. Your blind spot is under-reacting to real risks until they're large.";
  return "Under stress you're fairly resilient, with normal ups and downs; simple recovery rituals keep you steady.";
}

/* ── daily companion ────────────────────────────────────────────────────── */

export interface DailyInsight {
  greeting: string;
  title: string;
  insight: string;
  practice: string;
  focus?: string;
}

const PRACTICES = [
  "Write down one small win from yesterday before you do anything else.",
  "Name the emotion you're feeling right now in a single word. That's it.",
  "Do the smallest version of the thing you're avoiding — just two minutes.",
  "Send one message of genuine appreciation to someone today.",
  "Take three slow breaths before your next hard conversation.",
  "Protect 20 minutes of single-tasking on what matters most.",
  "Ask someone a question and listen all the way to the end of their answer.",
  "Choose one 'good enough' and ship it instead of polishing.",
  "Step outside for five minutes with no phone.",
  "Before bed, note one thing you're grateful for and why.",
];

export function dailyInsight(entries: SynthEntry[], name: string | undefined, date = new Date()): DailyInsight {
  const day = date.toISOString().slice(0, 10);
  const rng = new Rng(seedFrom("daily", name ?? "", day, entries.map((e) => e.result.responseFingerprint).join("|")));
  const hour = date.getHours();
  const tod = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greeting = name ? `${tod}, ${name}.` : `${tod}.`;

  let title = "Today's nudge";
  let insight = "A tiny, deliberate action today compounds into who you become. Here's a small one.";
  let focus: string | undefined;

  if (entries.length) {
    const integrated = buildIntegratedProfile(entries, { name, seed: seedFrom("daily-int", day, name ?? "") });
    if (integrated.growthEdges.length && rng.chance(0.6)) {
      focus = rng.pick(integrated.growthEdges);
      title = `Lean into: ${focus.replace(/^Building your /, "").replace(/^Growing /, "")}`;
      insight = `Your profile points to "${focus.toLowerCase()}" as a place with real upside. Growth isn't a leap — it's one repeated, deliberate behavior. Try the practice below today.`;
    } else if (integrated.themes.length) {
      const th = rng.pick(integrated.themes);
      title = `Your strength: ${th.name.replace(/^The /, "")}`;
      insight = `${th.narrative} Today, use it on purpose — put your ${th.name.replace(/^The /, "").toLowerCase()} to work somewhere it matters.`;
      focus = th.name;
    }
  }

  return { greeting, title, insight: sentence(insight), practice: rng.pick(PRACTICES), focus };
}
