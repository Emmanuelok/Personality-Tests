import type { AssessmentResult, Citation, Instrument, ScaleScore } from "../types";
import { Rng, nonce, seedFrom } from "../prng";
import { clamp, ordinal, round1, sentence } from "../variation";

export interface GrowthTarget {
  scaleId: string;
  /** Desired standing on the 0..100 normalized scale (where you want to be). */
  target: number;
}

export interface GrowthStep {
  title: string;
  detail: string;
  cadence?: string;
  evidence?: string;
}

export type GrowthDirection = "increase" | "decrease" | "maintain";

export interface GrowthArea {
  scaleId: string;
  name: string;
  current: number; // normalized 0..100
  target: number;
  gap: number; // target - current
  direction: GrowthDirection;
  rationale: string;
  steps: GrowthStep[];
}

export interface GrowthPlan {
  instrumentId: string;
  generatedAt: string;
  planId: string;
  summary: string[];
  areas: GrowthArea[];
  principles: string[];
  citations: Citation[];
}

/** A meaningful gap; below this we treat the target as "maintain". */
const GAP_THRESHOLD = 8;

/**
 * Suggest sensible default growth targets so a plan can be shown (and put into the
 * PDF) before the user customizes anything. For the Big Five we nudge toward the
 * directions most associated with well-being and effectiveness in the literature;
 * for typologies we gently encourage developing the less-used side. These are
 * starting points, explicitly meant to be adjusted to the user's own goals.
 */
export function suggestTargets(instrument: Instrument, result: AssessmentResult): GrowthTarget[] {
  const scales = instrument.scales.filter((s) => result.scales[s.id]);
  const shown =
    scales.length > 6
      ? [...scales].sort((a, b) => result.scales[b.id].normalized - result.scales[a.id].normalized).slice(0, 6)
      : scales;
  return shown.map((s) => {
    const cur = result.scales[s.id].normalized;
    let target = cur;
    if (instrument.id === "big-five-ipip50") {
      const nudge: Record<string, number> = { C: 12, A: 8, O: 6, E: cur < 50 ? 10 : 0, N: -14 };
      target = clamp(cur + (nudge[s.id] ?? 0), 5, 95);
    } else if (instrument.id === "hexaco-24") {
      const up: Record<string, number> = { H: 14, A: 8, C: 8, O: 6, X: cur < 50 ? 8 : 0, E: 0 };
      target = clamp(cur + (up[s.id] ?? 0), 5, 95);
    } else if (instrument.id === "dark-triad-18") {
      target = cur > 45 ? clamp(cur - 16, 10, 90) : cur; // soften elevated dark traits
    } else if (instrument.id === "attachment-styles") {
      target = clamp(cur - 18, 8, 92); // move toward security: lower anxiety & avoidance
    } else {
      // DISC and other typologies: gently moderate extremes.
      if (cur > 60) target = Math.max(50, cur - 12);
      else if (cur < 40) target = Math.min(50, cur + 12);
      else target = cur;
    }
    return { scaleId: s.id, target: Math.round(target) };
  });
}

/**
 * Evidence-based change strategies per Big Five factor and direction. Grounded in
 * the personality-change literature (see CHANGE_CITATIONS). "increase" moves
 * toward the scale's high pole; "decrease" toward the low pole.
 */
const BIG_FIVE_STRATEGIES: Record<string, Record<"increase" | "decrease", GrowthStep[]>> = {
  C: {
    increase: [
      { title: "Use implementation intentions", detail: "Pre-commit with an explicit “When X happens, I will do Y” plan for each goal. Specifying the cue and response roughly doubles follow-through versus a vague intention.", cadence: "Write one for each important task", evidence: "Gollwitzer (1999); Gollwitzer & Sheeran (2006)" },
      { title: "Stack new habits onto old ones", detail: "Anchor a desired behavior immediately after an existing routine (“after I pour my coffee, I plan my top three tasks”). The established habit becomes the trigger.", cadence: "Daily", evidence: "Clear (2018); Wood & Neal (2007)" },
      { title: "Design the environment", detail: "Make the organized choice the easy one: lay out tomorrow’s materials tonight, remove friction from good defaults, add friction to distractions.", cadence: "Weekly setup", evidence: "Duckworth et al. (2016), situational self-control" },
      { title: "Shrink the first step", detail: "Adopt a two-minute on-ramp for anything you avoid; starting is the hard part, and momentum does the rest.", cadence: "As needed", evidence: "Behavioral activation principles" },
    ],
    decrease: [
      { title: "Schedule deliberate spontaneity", detail: "Block unstructured time and protect it. Counter-intuitively, planning room for flexibility loosens an over-tight grip without dropping the ball.", cadence: "Weekly", evidence: "Self-regulation flexibility research" },
      { title: "Defuse perfectionism", detail: "Set a “good enough” bar in advance and ship at it. Notice the urge to over-polish and name it as a feeling, not a fact.", cadence: "Per project", evidence: "Cognitive defusion (ACT; Hayes et al., 1999)" },
      { title: "Practice tolerating loose ends", detail: "Intentionally leave a small task unfinished and sit with the discomfort; it fades, teaching your system that disorder isn’t danger.", cadence: "Weekly", evidence: "Exposure-based habituation" },
    ],
  },
  N: {
    decrease: [
      { title: "Reappraise, don’t suppress", detail: "When a stressor hits, deliberately reinterpret it (“this is a challenge I can meet,” “this feeling will pass”). Reappraisal lowers distress where bottling it up raises it.", cadence: "In the moment", evidence: "Gross (2002), emotion regulation; Beck (1979), CBT" },
      { title: "Build a daily mindfulness practice", detail: "Ten minutes of focused-attention or breath meditation strengthens the capacity to observe feelings without being swept away.", cadence: "Daily, 10 min", evidence: "Kabat-Zinn (1990); Goyal et al. (2014), JAMA meta-analysis" },
      { title: "Postpone worry to a set window", detail: "Park anxious thoughts for a scheduled 15-minute “worry time.” Most lose their urgency by then, and the rest get problem-solved deliberately.", cadence: "Daily window", evidence: "Borkovec et al. (1983), stimulus-control treatment for worry" },
      { title: "Protect sleep, movement, and self-compassion", detail: "Regulate the body that regulates the mood: consistent sleep, regular aerobic exercise, and talking to yourself as you would a good friend.", cadence: "Daily", evidence: "Neff (2003), self-compassion; exercise–affect literature" },
    ],
    increase: [
      { title: "Tune up your risk radar", detail: "If you’re very even-keeled, deliberately run pre-mortems (“how could this fail?”) to add useful vigilance without genuine anxiety.", cadence: "Per decision", evidence: "Klein (2007), pre-mortem analysis" },
      { title: "Check in on emotional cues", detail: "Practice naming what you and others are feeling; calm people sometimes under-read emotional signals worth catching.", cadence: "Daily", evidence: "Emotional granularity (Barrett, 2017)" },
    ],
  },
  E: {
    increase: [
      { title: "Act outgoing on purpose", detail: "Experiments show that deliberately behaving more talkative, bold, and energetic raises positive affect — even for introverts, in manageable doses.", cadence: "Several times a week", evidence: "Margolis & Lyubomirsky (2020); Fleeson et al. (2002)" },
      { title: "Schedule social exposure", detail: "Put low-stakes interactions on the calendar (a coffee, a call) so connection doesn’t depend on in-the-moment motivation.", cadence: "Weekly", evidence: "Behavioral activation" },
      { title: "Prepare a few openers", detail: "Keep two or three reliable questions ready; reducing the cognitive load of starting conversations makes initiating feel easier.", cadence: "Before events", evidence: "Social-skills practice research" },
    ],
    decrease: [
      { title: "Build in deliberate solitude", detail: "Protect quiet, single-tasking blocks for depth. If you over-socialize, scheduled alone-time restores focus and judgment.", cadence: "Daily", evidence: "Deliberate practice & deep work research" },
      { title: "Listen on a one-in-two ratio", detail: "Aim to ask and listen as much as you broadcast; it deepens relationships and curbs talking-over.", cadence: "In conversation", evidence: "Active-listening literature" },
    ],
  },
  O: {
    increase: [
      { title: "Schedule novelty", detail: "Deliberately seek unfamiliar input — a new genre, route, cuisine, or idea — each week. Openness grows with exposure to the new.", cadence: "Weekly", evidence: "Jackson et al. (2012), training-induced openness gains" },
      { title: "Learn something effortfully", detail: "Take up a skill that stretches you (an instrument, a language, drawing). Cognitively demanding learning broadens the trait.", cadence: "Ongoing", evidence: "Jackson et al. (2012); cognitive-training research" },
      { title: "Practice perspective-taking", detail: "Argue the opposite side of a held belief; steel-manning views you reject builds intellectual flexibility.", cadence: "Per debate", evidence: "Cognitive flexibility training" },
    ],
    decrease: [
      { title: "Commit and finish before exploring", detail: "If ideas outrun delivery, close one loop fully before opening the next; channel curiosity into depth, not just breadth.", cadence: "Per project", evidence: "Goal-shielding (Shah et al., 2002)" },
      { title: "Favor proven methods for core work", detail: "Reserve experimentation for low-stakes contexts; use reliable, standard approaches where consistency matters.", cadence: "Ongoing", evidence: "Exploration–exploitation trade-off" },
    ],
  },
  A: {
    increase: [
      { title: "Practice active, generous listening", detail: "Reflect back what you hear before responding; it builds trust and trains warmth.", cadence: "In conversation", evidence: "Rogers (1957), empathic listening" },
      { title: "Run a gratitude and kindness habit", detail: "Note three things you appreciate about specific people weekly, and act on one. Prosocial practice raises agreeableness and well-being.", cadence: "Weekly", evidence: "Emmons & McCullough (2003); Lyubomirsky (2008)" },
      { title: "Take the other’s perspective in conflict", detail: "Before reacting, articulate the other person’s goal and constraints; it softens edges and finds shared ground.", cadence: "In conflict", evidence: "Galinsky et al. (2008), perspective-taking" },
    ],
    decrease: [
      { title: "Learn to say no with a script", detail: "Prepare and rehearse boundary phrases (“I can’t take that on, but here’s what I can do”). Assertiveness is a skill, not a betrayal.", cadence: "As needed", evidence: "Assertiveness training (Alberti & Emmons)" },
      { title: "Separate the problem from the person", detail: "Practice giving direct, candid feedback on issues while staying warm to the human — disagreeableness in service of honesty, not harm.", cadence: "Per situation", evidence: "Stone et al. (1999), Difficult Conversations" },
      { title: "State your own needs first sometimes", detail: "In low-stakes moments, voice your preference before deferring; it rebalances chronic self-sacrifice.", cadence: "Daily", evidence: "Self-other balance research" },
    ],
  },
};

const CHANGE_CITATIONS: Citation[] = [
  { ref: "Roberts, B. W., Luo, J., Briley, D. A., Chow, P. I., Su, R., & Hill, P. L. (2017). A systematic review of personality trait change through intervention. Psychological Bulletin, 143(2), 117–141.", note: "Evidence that traits change with sustained intervention." },
  { ref: "Hudson, N. W., & Fraley, R. C. (2015). Volitional personality trait change: Can people choose to change their personality traits? Journal of Personality and Social Psychology, 109(3), 490–507.", note: "People can intentionally shift traits over months." },
  { ref: "Stieger, M., Flückiger, C., Rüegger, D., Kowatsch, T., Roberts, B. W., & Allemand, M. (2021). Changing personality traits with the help of a digital personality change intervention. PNAS, 118(8), e2017548118.", note: "A digital intervention produced measurable Big Five change." },
  { ref: "Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493–503.", note: "Mechanism behind if-then planning." },
];

function levelWord(n: number): string {
  if (n < 10) return "very low";
  if (n < 30) return "low";
  if (n <= 70) return "moderate";
  if (n <= 90) return "high";
  return "very high";
}

function genericSteps(rng: Rng, name: string, direction: GrowthDirection): GrowthStep[] {
  if (direction === "maintain") return [];
  const verb = direction === "increase" ? "strengthen" : "soften";
  return [
    {
      title: `Define one concrete behavior that would ${verb} your ${name}`,
      detail: `Translate the goal into a single observable action you can do this week — vague intentions don’t move traits; specific repeated behaviors do.`,
      cadence: "Weekly",
      evidence: "Hudson & Fraley (2015)",
    },
    {
      title: `Track it and review`,
      detail: `Log the behavior daily and review weekly. What gets measured, and reflected on, tends to shift.`,
      cadence: "Daily / weekly review",
      evidence: "Roberts et al. (2017)",
    },
  ].map((s) => ({ ...s, title: rng.chance(0.5) ? s.title : s.title }));
}

function strategiesFor(
  rng: Rng,
  instrument: Instrument,
  scaleId: string,
  name: string,
  direction: GrowthDirection,
): GrowthStep[] {
  if (direction === "maintain") return [];
  const bank = instrument.id === "big-five-ipip50" ? BIG_FIVE_STRATEGIES[scaleId]?.[direction] : undefined;
  if (bank && bank.length) {
    return rng.sample(bank, Math.min(3, bank.length));
  }
  return genericSteps(rng, name, direction);
}

/**
 * Build a personalized, evidence-based growth plan from current scores and the
 * user's targets (where they want to be on each scale). Deterministic per seed.
 */
export function buildGrowthPlan(
  instrument: Instrument,
  result: AssessmentResult,
  targets: GrowthTarget[],
  opts: { seed?: number; now?: Date } = {},
): GrowthPlan {
  const now = opts.now ?? new Date();
  const planId = nonce(8);
  const seed = opts.seed ?? seedFrom(result.responseFingerprint, "plan", now.getTime(), planId);
  const rng = new Rng(seed);

  const areas: GrowthArea[] = [];
  for (const t of targets) {
    const score: ScaleScore | undefined = result.scales[t.scaleId];
    const scaleDef = instrument.scales.find((s) => s.id === t.scaleId);
    if (!score || !scaleDef) continue;

    const current = round1(score.normalized);
    const target = round1(t.target);
    const gap = round1(target - current);
    const direction: GrowthDirection = gap > GAP_THRESHOLD ? "increase" : gap < -GAP_THRESHOLD ? "decrease" : "maintain";

    const towardPole =
      direction === "increase"
        ? scaleDef.poles?.high ?? "the high end"
        : direction === "decrease"
          ? scaleDef.poles?.low ?? "the low end"
          : "where you are";

    const rationale =
      direction === "maintain"
        ? sentence(
            rng.pick([
              `You’re near your target on ${scaleDef.name} (currently ${ordinal(Math.round(score.percentile))} percentile). The work here is protection, not change — keep doing what keeps this steady.`,
              `Your ${scaleDef.name} already sits about where you want it. Treat this as a strength to maintain rather than a gap to close.`,
            ]),
          )
        : sentence(
            rng.pick([
              `You’re currently ${levelWord(current)} on ${scaleDef.name} and you’d like to move toward ${towardPole}. That’s a ${Math.abs(gap)}-point shift — meaningful but achievable with consistent practice.`,
              `Moving your ${scaleDef.name} toward ${towardPole} means closing a ${Math.abs(gap)}-point gap from your current ${levelWord(current)} standing. Traits change slowly but really; aim for small, repeated wins.`,
            ]),
          );

    areas.push({
      scaleId: t.scaleId,
      name: scaleDef.name,
      current,
      target,
      gap,
      direction,
      rationale,
      steps: strategiesFor(rng, instrument, t.scaleId, scaleDef.name, direction),
    });
  }

  // Order by absolute gap so the biggest opportunities lead.
  areas.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));

  const movers = areas.filter((a) => a.direction !== "maintain");
  const summary = [
    sentence(
      movers.length
        ? rng.pick([
            `You’ve set out to shift ${movers.length} ${movers.length === 1 ? "trait" : "traits"}. The biggest opportunity is your ${movers[0].name} — start there, because early wins fuel the rest.`,
            `Your plan targets ${movers.length} ${movers.length === 1 ? "area" : "areas"} of change, led by ${movers[0].name}. Focus your first month on that one; spreading effort thin is the usual way change stalls.`,
          ])
        : rng.pick([
            "Your targets are close to where you already are — this plan is about protecting strengths and small, optional refinements.",
            "You’ve aimed near your current profile, so this is a maintenance plan more than a change plan. That’s a legitimate, healthy choice.",
          ]),
    ),
    sentence(
      rng.pick([
        "Personality change is real but gradual: studies tracking interventions see movement over weeks and months, not days. Treat this as a season of practice.",
        "The science is clear that traits can shift with deliberate effort — and equally clear that it takes sustained, specific behavior, not willpower in the abstract.",
      ]),
    ),
  ];

  const principles = rng.sample(
    [
      "Make goals behavioral and specific — “do X when Y” beats “be more Z.”",
      "Start with the smallest version of the habit you can’t fail at, then grow it.",
      "Change identity, not just actions: “I’m the kind of person who…” makes habits stick.",
      "Track the behavior and review weekly; visibility drives follow-through.",
      "Expect nonlinear progress — plateaus and slips are part of the curve, not failure.",
      "Pair each new habit with an existing routine so the routine triggers it.",
      "Design your environment so the better choice is the easier choice.",
    ],
    5,
  );

  return {
    instrumentId: instrument.id,
    generatedAt: now.toISOString(),
    planId,
    summary,
    areas,
    principles,
    citations: CHANGE_CITATIONS,
  };
}
