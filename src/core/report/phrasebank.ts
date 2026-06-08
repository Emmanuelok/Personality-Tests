/**
 * Phrase banks for the deterministic composer.
 *
 * Uniqueness strategy: each narrative "beat" draws from many interchangeable
 * variants, selected by a seeded PRNG. Generic, level-conditioned templates are
 * parameterized by each trait's own descriptors, so they read as specific while
 * staying compact; trait-specific "color" banks add concrete, grounded detail.
 * Dozens of independent choices per report make the output space astronomically
 * large — two reports are never the same.
 */

export type LevelKey = "very low" | "low" | "moderate" | "high" | "very high";

/** Opening sentences for a trait, conditioned on level. Placeholders:
 *  {name} trait name · {pct} ordinal percentile · {hd} high descriptor ·
 *  {ld} low descriptor · {hi} high pole · {lo} low pole */
export const LEVEL_OPENERS: Record<LevelKey, string[]> = {
  "very high": [
    "Your {name} lands at the {pct} percentile — near the very top of the range. Being {hd} is one of the defining signatures of how you move through the world.",
    "{name} is a headline of your profile: at the {pct} percentile, qualities like being {hd} show up dependably, across very different situations.",
    "You score exceptionally high on {name} ({pct} percentile). The pull toward being {hd} is strong enough that others likely think of it as simply who you are.",
    "On {name}, you sit well into the upper tail — the {pct} percentile. Expect the {hd} side of you to lead, often without any conscious effort.",
    "{name} runs high and clear in you (the {pct} percentile). The {hi} pole isn't just a preference here; it's close to a default setting.",
    "At the {pct} percentile for {name}, you're more {hd} than the large majority of people — a trait strong enough to shape first impressions.",
  ],
  high: [
    "Your {name} is high — around the {pct} percentile. You lean noticeably toward being {hd}, though not to the exclusion of the other side.",
    "On {name} you score above most people (the {pct} percentile). The {hi} pole is your usual mode, with enough range to flex when a situation calls for it.",
    "{name} is a clear strength in your makeup ({pct} percentile): being {hd} comes naturally and reliably.",
    "You land in the upper band on {name} (the {pct} percentile), so the {hd} qualities tend to surface first — while you can still draw on the {lo} side when it helps.",
    "Expect {name} to work in your favor: at the {pct} percentile you're meaningfully {hd}, without it becoming the whole story.",
  ],
  moderate: [
    "Your {name} is balanced — about the {pct} percentile. You can be {hd} or {ld} depending on the moment, which gives you real versatility.",
    "On {name} you sit near the middle (the {pct} percentile). Rather than a fixed setting, you have a dial you can turn toward {hi} or {lo} as the situation asks.",
    "{name} is a flexible zone for you ({pct} percentile): you draw on both the {hd} and the {ld} sides, and context tends to decide which shows up.",
    "You're moderate on {name} — neither pole dominates (the {pct} percentile). That ambiversion is itself an asset, letting you read the room and adapt.",
    "At the {pct} percentile, {name} is one of your adaptable traits: you can lead with being {hd} or fall back on being {ld} as needed.",
  ],
  low: [
    "Your {name} is on the lower side — around the {pct} percentile. You lean toward being {ld}, and the {lo} pole tends to feel more natural than its opposite.",
    "On {name} you score below most people (the {pct} percentile), so being {ld} is your default, with the {hd} mode available but more effortful.",
    "{name} sits in the lower band for you ({pct} percentile): the {lo} side leads, which carries its own quiet strengths.",
    "You're low on {name} (the {pct} percentile). Where others lean {hd}, you more often lean {ld} — and that has real advantages of its own.",
    "Expect the {lo} pole to dominate on {name}: at the {pct} percentile, being {ld} is closer to who you are than being {hd}.",
  ],
  "very low": [
    "Your {name} is very low — the {pct} percentile, near the bottom of the range. Being {ld} is a defining feature of how you operate.",
    "{name} sits in the lower tail ({pct} percentile): the {lo} pole is so consistent that others likely read it as simply your nature.",
    "You score at the {pct} percentile on {name} — markedly {ld}. The {hd} mode is available only with real, deliberate effort.",
    "At the {pct} percentile, {name} is one of the clearest notes of your profile, anchored firmly at the {lo} end.",
    "On {name} you're well into the lower extreme (the {pct} percentile). Being {ld} isn't a mood here; it's close to a constant.",
  ],
};

/** Second-sentence nuance clauses (generic, level-agnostic). */
export const NUANCE_CLAUSES: string[] = [
  "What makes this yours specifically is the exact blend below rather than the label alone.",
  "The interesting detail is less the score itself than how it combines with your other traits.",
  "Two people can share this score and still express it completely differently — yours is shaped by the pattern around it.",
  "Numbers set the stage; the texture comes from how this plays against the rest of your profile.",
  "Treat the percentile as a starting coordinate, not a verdict — the nuance is in the combinations.",
];

interface PoleColor {
  strengths: string[];
  watchouts: string[];
  behavior: string[];
  relationships: string[];
  work: string[];
  stress: string[];
}
export interface TraitColor {
  high: PoleColor;
  low: PoleColor;
  /** Extra notes when the score is near the middle. */
  mid: string[];
}

/**
 * Concrete, grounded color for the five factors. Drawn on by the composer to add
 * specificity beyond the generic templates. "high" describes the high pole of the
 * named scale (e.g., for N, high = reactive; low = stable).
 */
export const BIG_FIVE_COLOR: Record<string, TraitColor> = {
  O: {
    high: {
      strengths: ["spotting connections others miss", "generating original ideas", "comfort with ambiguity and nuance", "aesthetic and intellectual range"],
      watchouts: ["chasing novelty over finishing what you started", "overcomplicating simple problems", "boredom with necessary routine"],
      behavior: ["You collect ideas, books, and what-ifs the way others collect keepsakes.", "Abstract problems that bore other people are exactly the ones that light you up.", "You're quick to question how things have 'always been done.'"],
      relationships: ["You're drawn to people who can trade ideas and surprise you.", "You may need a partner who tolerates your need to explore and reinvent."],
      work: ["You thrive where invention, strategy, and open problems are rewarded.", "Highly repetitive roles will starve you; build variety into your week."],
      stress: ["Under stress you can spin into too many possibilities at once — narrowing to one is the antidote."],
    },
    low: {
      strengths: ["practicality and common sense", "staying grounded in what works", "consistency and predictability", "focus on the concrete and proven"],
      watchouts: ["dismissing useful new ideas too quickly", "discomfort when plans change", "preferring the familiar past its usefulness"],
      behavior: ["You trust what's tried and tested over the latest theory.", "You'd rather refine a known method than reinvent it.", "Concrete, hands-on tasks suit you better than abstract speculation."],
      relationships: ["You offer partners steadiness and a no-nonsense reliability.", "You may clash with people who want constant novelty or reinvention."],
      work: ["You excel in roles that reward execution, standards, and dependable delivery.", "You bring others' big ideas safely down to earth."],
      stress: ["Sudden change is your main stressor; advance notice and a clear plan settle you."],
    },
    mid: ["You can switch between visionary and pragmatist, which makes you a useful bridge between dreamers and doers."],
  },
  C: {
    high: {
      strengths: ["follow-through and reliability", "organization and planning", "self-discipline under temptation", "high personal standards"],
      watchouts: ["perfectionism and difficulty delegating", "rigidity when plans must change", "being hard on yourself over small misses"],
      behavior: ["You make a plan and you work the plan.", "Loose ends genuinely bother you until they're tied.", "People learn that if you said you'd do it, it's done."],
      relationships: ["You're the dependable one others lean on.", "You may need to soften expectations you place on less-organized partners."],
      work: ["You're trusted with responsibility and complex, long-horizon goals.", "Watch for taking on too much because you can't bear to let standards slip."],
      stress: ["When overloaded you double down on control; deliberately lowering the bar a notch protects you from burnout."],
    },
    low: {
      strengths: ["flexibility and spontaneity", "ease with the unplanned", "low rigidity and quick pivots", "relaxed about imperfection"],
      watchouts: ["procrastination and missed deadlines", "losing track of details", "starting more than you finish"],
      behavior: ["You'd rather keep things open than locked to a schedule.", "You work in bursts of energy rather than steady increments.", "Structure feels like a cage more than a comfort."],
      relationships: ["You bring lightness and adaptability to relationships.", "Reliable partners may need you to shore up follow-through on shared commitments."],
      work: ["You shine in fast, improvisational, low-bureaucracy environments.", "External structure — deadlines, accountability, lists — turns your energy into output."],
      stress: ["Under pressure, tasks pile up; a single 'next action' breaks the logjam better than a grand plan."],
    },
    mid: ["You can be organized when it matters and loose when it doesn't — useful, as long as you choose deliberately rather than by default."],
  },
  E: {
    high: {
      strengths: ["energizing a room", "initiating and connecting", "assertiveness and visible warmth", "comfort being seen"],
      watchouts: ["talking over quieter people", "needing stimulation to the point of restlessness", "thinking out loud before you've thought it through"],
      behavior: ["You recharge around people and wilt in too much solitude.", "You often speak to think, not just to report a finished thought.", "You gravitate to the center of the action."],
      relationships: ["You bring energy, initiative, and social glue.", "Quieter partners may need you to leave space and listen longer."],
      work: ["You do well where networking, persuasion, and visible leadership matter.", "Long stretches of solo, heads-down work will drain you — build in interaction."],
      stress: ["When stressed you may seek company compulsively; pairing that with one honest conversation beats many shallow ones."],
    },
    low: {
      strengths: ["depth over breadth", "calm, considered presence", "comfort with solitude and focus", "listening more than broadcasting"],
      watchouts: ["being overlooked because you don't self-promote", "draining quickly at large events", "holding back ideas worth sharing"],
      behavior: ["You recharge alone and pay an energy tax for socializing.", "You think first and speak once it's formed.", "You prefer a few deep conversations to a crowded room."],
      relationships: ["You offer steadiness, deep attention, and loyalty to a close few.", "Make your inner world visible — partners can't read the depth you don't voice."],
      work: ["You excel at focused, independent, deep work and one-to-one influence.", "Advocate for your contributions; quiet excellence can go unseen otherwise."],
      stress: ["Over-socializing is itself a stressor; protected solitude is your most reliable reset."],
    },
    mid: ["You can work a room and then happily disappear to recharge — an ambivert's range that lets you meet people where they are."],
  },
  A: {
    high: {
      strengths: ["empathy and warmth", "building trust and cooperation", "generosity and tact", "reading others' feelings"],
      watchouts: ["difficulty saying no", "avoiding necessary conflict", "being taken advantage of", "suppressing your own needs"],
      behavior: ["You instinctively look for the cooperative, win-win path.", "Other people's distress lands on you quickly and physically.", "You'd rather smooth things over than win the point."],
      relationships: ["You're a deeply supportive, considerate partner and friend.", "Practice voicing your needs as clearly as you honor everyone else's."],
      work: ["You build cohesive teams and defuse friction.", "In negotiation, guard against conceding too much for the sake of harmony."],
      stress: ["You absorb others' stress as your own; a boundary is not a betrayal — it's maintenance."],
    },
    low: {
      strengths: ["frankness and honesty", "comfort with conflict and competition", "objectivity under emotional pressure", "willingness to be the dissenting voice"],
      watchouts: ["coming across as blunt or cold", "skepticism that curdles into cynicism", "winning arguments at the cost of relationships"],
      behavior: ["You say the hard, true thing others tiptoe around.", "You weigh claims skeptically before extending trust.", "You're comfortable competing and holding an unpopular line."],
      relationships: ["You give partners honesty and a backbone they can rely on.", "Add warmth to your candor — being right and being kind aren't opposites."],
      work: ["You make tough calls and give straight feedback others avoid.", "Tact is a skill worth deliberately practicing, not a betrayal of honesty."],
      stress: ["Under stress, edges sharpen; naming the goal you share with the other person lowers the temperature."],
    },
    mid: ["You can be warm and you can be firm, which lets you cooperate without being a pushover — provided you pick the register on purpose."],
  },
  N: {
    high: {
      strengths: ["emotional sensitivity and self-awareness", "vigilance to risk and problems", "depth and seriousness of feeling", "empathy born of feeling things keenly"],
      watchouts: ["rumination and worry", "stress spilling into mood", "taking setbacks personally", "harsh self-criticism"],
      behavior: ["You feel things at high resolution — the good and the difficult alike.", "Your mind scans ahead for what could go wrong.", "Setbacks can echo longer for you than for others."],
      relationships: ["Your sensitivity makes you attuned and caring when it's pointed outward.", "Share what you're feeling early; partners can't soothe a storm they can't see."],
      work: ["Your risk-radar catches problems others miss.", "Build recovery rituals; without them, pressure compounds into overwhelm."],
      stress: ["Your nervous system reacts strongly and recovers slowly; naming the feeling and slowing the breath are not clichés for you — they work."],
    },
    low: {
      strengths: ["calm under pressure", "emotional resilience", "even, stable moods", "not being rattled by setbacks"],
      watchouts: ["underestimating real risks", "missing emotional cues in others", "seeming unbothered when others need you to care"],
      behavior: ["You stay level when things get tense.", "Setbacks roll off you faster than off most people.", "You rarely get swept away by your own moods."],
      relationships: ["You're a stabilizing, reassuring presence in a storm.", "Make sure your calm doesn't read as indifference to someone who's hurting."],
      work: ["You're the steady hand in a crisis and in high-stakes decisions.", "Lean on more anxious colleagues' risk-radar; calm can overlook real danger."],
      stress: ["You handle stress well — so well that your blind spot is ignoring early warning signs until they're large."],
    },
    mid: ["You feel things but aren't ruled by them — sensitive enough to be attuned, stable enough to function under load."],
  },
};

/** Dynamics: pairwise trait interactions for the Big Five. Conditions are level
 *  buckets on `normalized` (0..100). Each rule yields one of several phrasings. */
export interface DynamicRule {
  a: string;
  b: string;
  /** Predicate over normalized scores 0..100. */
  when: (na: number, nb: number) => boolean;
  variants: string[];
}

const HI = (x: number) => x >= 60;
const LO = (x: number) => x <= 40;

export const BIG_FIVE_DYNAMICS: DynamicRule[] = [
  { a: "O", b: "C", when: (o, c) => HI(o) && HI(c), variants: ["High Openness paired with high Conscientiousness is the rare 'visionary who executes' combination — you generate original ideas and actually ship them.", "Because both your imagination and your discipline run high, you can dream up a system and then build it — ideas rarely die on the vine with you."] },
  { a: "O", b: "C", when: (o, c) => HI(o) && LO(c), variants: ["Your ideas outrun your follow-through: Openness is high but Conscientiousness is lower, so capturing and finishing — not generating — is your bottleneck.", "You're idea-rich and structure-light; external scaffolding (deadlines, a collaborator who finishes) turns your creativity into output."] },
  { a: "E", b: "A", when: (e, a) => HI(e) && HI(a), variants: ["High Extraversion plus high Agreeableness makes you a natural connector — warm, outgoing, and genuinely liked.", "You combine social energy with warmth, which tends to make you the glue in groups and the person others gravitate toward."] },
  { a: "E", b: "N", when: (e, n) => LO(e) && HI(n), variants: ["Lower Extraversion alongside higher Neuroticism means you both need solitude and feel things keenly — protected downtime isn't a luxury for you, it's maintenance.", "You're inward-facing and sensitive at once; quiet, low-stimulation recovery is how you stay regulated."] },
  { a: "C", b: "N", when: (c, n) => HI(c) && LO(n), variants: ["High Conscientiousness with low Neuroticism is the 'unflappable operator' pattern — organized and calm, you're the person others trust in a crisis.", "You combine reliability with emotional steadiness, which makes you a stabilizing force under pressure."] },
  { a: "A", b: "C", when: (a, c) => LO(a) && HI(c), variants: ["Low Agreeableness with high Conscientiousness makes you exacting and frank — you hold a high bar and you'll say so plainly.", "You pair high standards with bluntness; great for quality, worth tempering with a little warmth in delivery."] },
  { a: "O", b: "E", when: (o, e) => HI(o) && HI(e), variants: ["High Openness and high Extraversion make you an expressive idea-sharer — you think out loud and bring others into your imagination.", "Your curiosity is outward and social; you spark off other people and turn conversations into discovery."] },
  { a: "A", b: "N", when: (a, n) => HI(a) && HI(n), variants: ["High Agreeableness with higher Neuroticism means you feel others' pain acutely and can absorb it — compassion is a strength, but boundaries keep it sustainable.", "You're deeply empathic and emotionally porous at once; protecting your own reserves lets your care last."] },
  { a: "C", b: "O", when: (c, o) => HI(c) && LO(o), variants: ["High Conscientiousness with lower Openness makes you a dependable finisher who prefers proven methods over experiments — excellent for execution, worth pairing with an idea person.", "You bring order and reliability and trust what works; novel approaches feel risky until shown to deliver."] },
  { a: "E", b: "C", when: (e, c) => HI(e) && HI(c), variants: ["High Extraversion and high Conscientiousness is a leadership pattern — you mobilize people and follow through, combining drive with delivery.", "You both energize others and execute, which is why this combination so often ends up running things."] },
];
