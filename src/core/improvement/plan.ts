import type { AssessmentResult, Citation, Instrument, ScaleDef, ScaleScore } from "../types";
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

/** Wellbeing instruments grow toward flourishing rather than toward the midpoint. */
const WELLBEING_IDS = new Set(["perma-flourishing", "brief-resilience", "self-esteem-rses", "mood-checkin", "life-satisfaction-swls", "mindfulness-ffmq"]);

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
    } else if (instrument.id === "self-compassion-scs") {
      // Grow the warmer facets; soften the harsher three (self-judgment, isolation, over-identification).
      const harsher = new Set(["SJ", "IS", "OI"]);
      target = harsher.has(s.id)
        ? clamp(cur - (cur > 30 ? 14 : 6), 5, 95)
        : clamp(cur + (cur < 70 ? 12 : 6), 5, 95);
    } else if (instrument.id === "time-perspective-ztpi") {
      // Soften Past-Negative & Present-Fatalistic; grow Past-Positive & Future; keep Present-Hedonistic (moderate only if very high).
      if (s.id === "PN" || s.id === "PF") target = clamp(cur - (cur > 30 ? 14 : 6), 5, 95);
      else if (s.id === "PP" || s.id === "FU") target = clamp(cur + (cur < 70 ? 12 : 6), 5, 95);
      else target = cur > 65 ? cur - 10 : cur;
    } else if (WELLBEING_IDS.has(instrument.id)) {
      target = clamp(cur + (cur < 70 ? 12 : 6), 5, 95); // grow toward flourishing, not the middle
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

/** Protect-the-strength steps for areas already at their target. */
const MAINTAIN_STEPS: GrowthStep[] = [
  { title: "Name what keeps this steady", detail: "Write down the specific habits and conditions that hold this where you want it, so you protect them deliberately rather than by luck.", cadence: "Once, then revisit monthly", evidence: "Self-monitoring; relapse-prevention principles" },
  { title: "Guard against quiet drift", detail: "Strengths erode silently under stress and busyness. A simple monthly check-in catches early slippage before it compounds.", cadence: "Monthly", evidence: "Roberts et al. (2017)" },
  { title: "Put it to work on something you care about", detail: "Point this strength at a real project, relationship, or community. Strengths grow through deliberate use, not preservation under glass.", cadence: "Ongoing", evidence: "Seligman et al. (2005), using signature strengths" },
];

function maintainSteps(rng: Rng): GrowthStep[] {
  return rng.sample(MAINTAIN_STEPS, 2);
}

/**
 * Universal, evidence-based change techniques, tailored to the specific scale and
 * direction. Used for any instrument without a hand-written strategy bank, so every
 * plan — for all 50+ instruments — is concrete and substantive rather than a stub.
 */
function genericSteps(rng: Rng, scaleDef: ScaleDef, direction: GrowthDirection): GrowthStep[] {
  if (direction === "maintain") return maintainSteps(rng);
  const lower = scaleDef.name.toLowerCase();
  const verb = direction === "increase" ? "strengthen" : "soften";
  const toward =
    direction === "increase" ? scaleDef.poles?.high ?? "that side" : scaleDef.poles?.low ?? "that side";
  const pool: GrowthStep[] = [
    { title: "Turn the goal into an if-then plan", detail: `Write an implementation intention: “When [a specific recurring situation] happens, I will [a concrete action that leans toward ${toward}].” Naming the cue and the response roughly doubles follow-through versus a vague resolve.`, cadence: "One per recurring situation", evidence: "Gollwitzer (1999); Gollwitzer & Sheeran (2006)" },
    { title: "Stack the new behavior onto an old one", detail: `Anchor one small ${lower}-building action immediately after a routine you already do without fail, so the established habit becomes its trigger.`, cadence: "Daily", evidence: "Wood & Neal (2007); Clear (2018)" },
    { title: "Run a one-week behavioral experiment", detail: `Pick a single concrete behavior that expresses the ${toward} side of your ${lower}, do it deliberately for a week, and note what shifted. Acting “as if” — rather than waiting to feel different — is how traits actually move.`, cadence: "Weekly", evidence: "Hudson & Fraley (2015); Fleeson (2001)" },
    { title: "Adopt the identity, not just the task", detail: `Frame it as “I’m becoming someone who ${verb}s their ${lower},” not a one-off fix. Identity-based goals outlast outcome-based ones.`, cadence: "Ongoing", evidence: "Clear (2018); Oyserman et al. (2015)" },
    { title: "Design the environment around it", detail: `Make the ${toward} choice the easy one: strip cues and friction from the old pattern, and add cues and convenience for the new one.`, cadence: "Weekly setup", evidence: "Duckworth, Gendler & Gross (2016)" },
    { title: "Track it and review weekly", detail: `Log the target behavior daily and review it every week. What gets measured — and honestly reflected on — is what tends to change.`, cadence: "Daily log / weekly review", evidence: "Roberts et al. (2017)" },
  ];
  return rng.sample(pool, 4);
}

/**
 * Evidence-based positive-psychology interventions for the wellbeing instruments,
 * keyed by scale. Wellbeing is almost always grown (increase); the decrease side
 * falls back to the generic techniques.
 */
type DirSteps = Partial<Record<"increase" | "decrease", GrowthStep[]>>;

const PERMA_STRATEGIES: Record<string, DirSteps> = {
  POS: { increase: [
    { title: "Run a daily gratitude practice", detail: "Each evening note three specific good things from the day and why each happened. One of the most replicated ways to raise positive emotion and lower low mood.", cadence: "Daily, 5 min", evidence: "Emmons & McCullough (2003); Seligman et al. (2005)" },
    { title: "Savor deliberately", detail: "Pick one pleasant moment a day and stretch it — attend fully, replay it, share it. Savoring turns ordinary experiences into lasting positive feeling.", cadence: "Daily", evidence: "Bryant & Veroff (2007)" },
    { title: "Schedule what lifts you", detail: "Put two activities you know reliably brighten your mood on the calendar this week, and do them even if motivation is low.", cadence: "Weekly", evidence: "Behavioral activation (Jacobson et al., 1996)" },
  ] },
  ENG: { increase: [
    { title: "Engineer flow", detail: "Match one challenging-but-doable task to an uninterrupted block, kill distractions, and set a clear goal. Flow appears where challenge meets skill.", cadence: "Several times a week", evidence: "Csikszentmihalyi (1990)" },
    { title: "Use a signature strength in a new way", detail: "Identify a top strength and deploy it on a fresh task each week — a reliable, tested lift to engagement and well-being.", cadence: "Weekly", evidence: "Seligman et al. (2005)" },
    { title: "Protect one block of single-tasking", detail: "Defend a daily stretch of full absorption in something that matters, with no switching. Attention is the raw material of engagement.", cadence: "Daily", evidence: "Attention-and-flow research" },
  ] },
  REL: { increase: [
    { title: "Respond actively and constructively", detail: "When someone shares good news, react with genuine, enthusiastic interest. How you celebrate others' wins predicts bond strength more than how you handle their setbacks.", cadence: "In conversation", evidence: "Gable et al. (2004), capitalization" },
    { title: "Invest in one tie a week", detail: "Reach out deliberately to one person — a call, a meet-up, a real message. Connection grows from frequency and depth, not chance.", cadence: "Weekly", evidence: "Social-connection research" },
    { title: "Perform small acts of kindness", detail: "Do a few deliberate kind acts for others each week; giving reliably raises the giver's well-being and strengthens relationships.", cadence: "Weekly", evidence: "Lyubomirsky et al. (2005)" },
  ] },
  MEA: { increase: [
    { title: "Connect daily tasks to a bigger why", detail: "Write one sentence linking your routine work to something beyond yourself you care about. Reframing toward purpose raises meaning and resilience.", cadence: "Weekly", evidence: "Steger (2012); job-crafting research" },
    { title: "Contribute to something larger", detail: "Give time to a cause, community, or person beyond your own circle. Meaning grows most through contribution.", cadence: "Ongoing", evidence: "Eudaimonic well-being research" },
    { title: "Clarify and act on your values", detail: "Name your top values and one concrete action this week that expresses each. Values clarity anchors a sense of meaning.", cadence: "Monthly review", evidence: "Acceptance & Commitment Therapy (Hayes et al., 1999)" },
  ] },
  ACC: { increase: [
    { title: "Set specific, hard-but-reachable goals", detail: "Replace vague aims with one specific, measurable, slightly stretching goal and a deadline. Specific challenging goals beat 'do your best.'", cadence: "Per goal", evidence: "Locke & Latham (2002)" },
    { title: "Track small wins", detail: "Log incremental progress daily; visible forward motion is itself one of the strongest motivators.", cadence: "Daily", evidence: "Amabile & Kramer (2011), the progress principle" },
    { title: "Reduce each goal to its next action", detail: "Define the single next physical step for every goal. Momentum comes from finishing small, concrete actions.", cadence: "Ongoing", evidence: "Goal-striving research" },
  ] },
};

const STRATEGY_BANKS: Record<string, Record<string, DirSteps>> = {
  "big-five-ipip50": BIG_FIVE_STRATEGIES,
  "perma-flourishing": PERMA_STRATEGIES,
  "brief-resilience": {
    RES: { increase: [
      { title: "Build your reappraisal skill", detail: "After a setback, deliberately reframe it — 'what can I learn or control here?' Cognitive reappraisal is the engine of bouncing back.", cadence: "After setbacks", evidence: "Gross (2002); Southwick & Charney (2018)" },
      { title: "Strengthen your support network", detail: "Identify two people you can genuinely lean on and stay in real contact. Social support is the single most robust predictor of resilience.", cadence: "Ongoing", evidence: "Southwick & Charney (2018)" },
      { title: "Practice self-compassion", detail: "In hard moments, speak to yourself as you would to a good friend. Self-compassion speeds recovery where self-criticism prolongs it.", cadence: "In the moment", evidence: "Neff (2003)" },
      { title: "Keep the physical basics steady", detail: "Protect sleep, movement, and routine — the physiological floor recovery stands on.", cadence: "Daily", evidence: "Stress-recovery & exercise research" },
    ] },
  },
  "self-esteem-rses": {
    EST: { increase: [
      { title: "Catch and challenge the inner critic", detail: "Notice harsh self-talk, write it down, and answer it with the evidence you'd offer a friend. CBT-style restructuring durably lifts self-worth.", cadence: "Daily", evidence: "Fennell (1999); Beck (1979)" },
      { title: "Favor self-compassion over esteem-chasing", detail: "Treat yourself kindly regardless of performance; this gives steadier self-worth than esteem that rides on winning.", cadence: "Daily", evidence: "Neff (2003)" },
      { title: "Build an evidence trail", detail: "Do small things that align with who you want to be and log them. Self-worth grows from a track record, not affirmations alone.", cadence: "Weekly", evidence: "Behavioral self-esteem research" },
    ] },
  },
  "mood-checkin": {
    MOOD: { increase: [
      { title: "Schedule rewarding activity", detail: "Plan and do small, rewarding or meaningful activities even when motivation is low. Behavioral activation is a frontline, evidence-based lift for low mood.", cadence: "Daily", evidence: "Behavioral activation (Dimidjian et al., 2006)" },
      { title: "Challenge bleak, absolute thoughts", detail: "When your mind says something dark and all-or-nothing, write it down and find the more balanced, accurate version.", cadence: "As needed", evidence: "Cognitive therapy (Beck, 1979)" },
      { title: "Reach out — you don't have to do it alone", detail: "Tell one trusted person how you've been. If low mood lasts beyond two weeks or affects daily life, talk to a doctor or therapist.", cadence: "This week", evidence: "Social support; clinical guidance" },
    ] },
    ENRG: { increase: [
      { title: "Anchor a consistent sleep schedule", detail: "Same wake time daily, morning light, screens down at night. Regular sleep is the foundation of energy and mood.", cadence: "Daily", evidence: "Sleep-hygiene research" },
      { title: "Move your body regularly", detail: "Even short, regular aerobic activity reliably raises energy and lifts mood.", cadence: "Most days", evidence: "Exercise–affect literature" },
    ] },
  },
  "life-satisfaction-swls": {
    SWL: { increase: [
      { title: "Practice gratitude and savoring", detail: "Regularly note what's going well and stretch good moments. Both reliably raise the reflective judgment that life is going well.", cadence: "Weekly", evidence: "Emmons & McCullough (2003); Bryant & Veroff (2007)" },
      { title: "Align your time with your values", detail: "Audit where your week actually goes and shift one recurring block toward what you most value. Satisfaction tracks living by your own standards.", cadence: "Monthly", evidence: "Self-concordance (Sheldon & Elliot, 1999)" },
      { title: "Invest in close ties and a meaningful goal", detail: "Put deliberate effort into your closest relationships and one goal that matters; both are among the strongest correlates of life satisfaction.", cadence: "Ongoing", evidence: "Diener & Seligman (2002)" },
    ] },
  },
  "self-compassion-scs": {
    SK: { increase: [
      { title: "Take a self-compassion break", detail: "When you're struggling, pause for the three-part practice: name it ('this is a hard moment'), normalize it ('hard moments are part of being human'), and offer yourself a kind phrase ('may I be gentle with myself'). The core, most-tested self-compassion exercise.", cadence: "In hard moments", evidence: "Neff & Germer (2013), MSC program" },
      { title: "Write yourself a compassionate letter", detail: "Write to yourself about a current struggle from the voice of a wise, unconditionally caring friend. Re-read it when the critic is loud.", cadence: "Weekly", evidence: "Shapira & Mongrain (2010)" },
      { title: "Try a soothing-touch gesture", detail: "A hand over the heart or a gentle self-hug activates the body's care system and calms the threat response — surprisingly physical, surprisingly effective.", cadence: "In the moment", evidence: "Neff (2011), Self-Compassion" },
    ] },
    SJ: { decrease: [
      { title: "Name and externalize the inner critic", detail: "Give the critical voice a name and notice when it speaks. Seeing it as one voice — not the truth, not you — loosens its grip.", cadence: "Daily", evidence: "Gilbert (2009), Compassion-Focused Therapy" },
      { title: "Find the critic's kinder intention", detail: "The critic usually wants to keep you safe or improving. Acknowledge that aim, thank it, then restate the message the way a supportive coach would.", cadence: "As it arises", evidence: "Gilbert (2009), CFT" },
      { title: "Talk to yourself as you would a friend", detail: "Catch the harsh line, then ask: 'what would I say to someone I love in this exact spot?' Say that to yourself instead.", cadence: "Daily", evidence: "Neff (2003)" },
    ] },
    CH: { increase: [
      { title: "Remember the 'me too'", detail: "When you feel singled out by a struggle, deliberately recall that countless people feel exactly this. Suffering shared is suffering halved.", cadence: "In hard moments", evidence: "Neff (2003), common humanity" },
      { title: "Trade comparison for connection", detail: "Notice compare-and-despair scrolling or thinking, and replace it with one honest conversation about real struggles. Authentic contact dissolves the illusion that you're uniquely flawed.", cadence: "Weekly", evidence: "Common-humanity research" },
    ] },
    IS: { decrease: [
      { title: "Reach toward, not away", detail: "Isolation says 'withdraw'; do the opposite in a small way — text one person, sit near others. Acting against the pull-to-hide is how it loosens.", cadence: "When low", evidence: "Behavioral activation; social-connection research" },
      { title: "Normalize out loud", detail: "Say the quiet part to someone safe: 'I've been struggling with…'. Naming it almost always surfaces a 'me too' you couldn't see alone.", cadence: "As needed", evidence: "Neff (2003)" },
    ] },
    MI: { increase: [
      { title: "Label the feeling to tame it", detail: "Put painful emotion into words — 'this is anxiety,' 'this is grief.' Affect labeling measurably calms the brain's threat response.", cadence: "In the moment", evidence: "Lieberman et al. (2007)" },
      { title: "Ground in the senses (5-4-3-2-1)", detail: "When feelings escalate, name five things you see, four you hear, three you feel, two you smell, one you taste. It anchors you in the present instead of the spiral.", cadence: "When overwhelmed", evidence: "Mindfulness-based grounding" },
    ] },
    OI: { decrease: [
      { title: "Watch thoughts like weather", detail: "Picture difficult thoughts as clouds passing through a wide sky — you are the sky, not the weather. Observing feelings pass keeps them from becoming your whole identity.", cadence: "Daily, briefly", evidence: "Mindfulness; cognitive defusion (ACT)" },
      { title: "Add a pause before the spiral", detail: "At the first sign of being swept up, take three slow breaths and name 'I'm getting pulled in.' The pause restores enough distance to choose your next move.", cadence: "As it arises", evidence: "Emotion-regulation research" },
    ] },
  },
  "time-perspective-ztpi": {
    PN: { decrease: [
      { title: "Reframe the past narrative", detail: "Write about a hard chapter, then write what it taught you and the strengths it built. Expressive, meaning-making writing reliably loosens a painful past's hold.", cadence: "Weekly", evidence: "Pennebaker (1997); Zimbardo & Boyd (2008)" },
      { title: "Build a positive-memory archive", detail: "Collect photos, notes, and small mementos of good times in one place and revisit them. It rebalances a memory that over-weights the negative.", cadence: "Ongoing", evidence: "Sword et al. (2014), time-perspective therapy" },
      { title: "Practice self-forgiveness", detail: "Name a regret you still carry, acknowledge it honestly, and deliberately release it — you did what you could with what you knew then.", cadence: "As needed", evidence: "Self-forgiveness research; time-perspective therapy" },
    ] },
    PF: { decrease: [
      { title: "Run small agency experiments", detail: "Pick one thing you can control today and act on it. Repeated proof that your choices change outcomes is the antidote to fatalism.", cadence: "Daily", evidence: "Learned optimism (Seligman, 1991)" },
      { title: "Sort what's in vs. out of your control", detail: "Split a worry into two columns — controllable and not — and put your energy only in the first. It rebuilds a sense of agency where helplessness crept in.", cadence: "As needed", evidence: "Stoic 'dichotomy of control'; CBT" },
    ] },
    PP: { increase: [
      { title: "Keep a nostalgia and gratitude journal", detail: "Regularly record good memories and what you're grateful for. Deliberately tending the positive past strengthens this warm, wellbeing-linked frame.", cadence: "Weekly", evidence: "Sword et al. (2014); Emmons & McCullough (2003)" },
      { title: "Strengthen rituals and roots", detail: "Invest in traditions, reunions, and the relationships that carry your story forward. Positive continuity is built, not just remembered.", cadence: "Ongoing", evidence: "Time-perspective research" },
    ] },
    FU: { increase: [
      { title: "Make goals vivid and time-bound", detail: "Turn 'someday' into a specific, dated goal with a defined next step. Concrete future goals pull present behavior forward.", cadence: "Per goal", evidence: "Locke & Latham (2002)" },
      { title: "Meet your future self", detail: "Vividly picture — or even write a letter from — yourself years ahead. Feeling connected to your future self increases patience, saving, and planning.", cadence: "Monthly", evidence: "Hershfield (2011), future-self continuity" },
      { title: "Bind it with if-then plans", detail: "Pre-commit with 'When X happens, I will do Y' for the actions your future depends on. Implementation intentions roughly double follow-through.", cadence: "Ongoing", evidence: "Gollwitzer (1999)" },
    ] },
  },
  "mindfulness-ffmq": {
    OBS: { increase: [
      { title: "Run a daily body scan", detail: "Spend a few minutes moving your attention slowly through the body, noticing sensations as they are without trying to change them. The classic way to train Observing.", cadence: "Daily, 5–10 min", evidence: "Kabat-Zinn (1990), MBSR" },
      { title: "Do a 5-4-3-2-1 senses check", detail: "Deliberately name five things you see, four you hear, three you feel, two you smell, and one you taste. A fast way to drop into direct experience.", cadence: "Daily", evidence: "Sensory grounding (MBSR)" },
      { title: "Take a one-sense minute", detail: "Once a day, give 60 seconds of full attention to a single sense — the taste of your coffee, the sounds in the room. Small, repeatable, real.", cadence: "Daily", evidence: "Informal mindfulness practice" },
    ] },
    DES: { increase: [
      { title: "Name the feeling precisely", detail: "Put what you feel into specific words ('disappointed,' 'apprehensive') rather than 'bad.' Precise labeling — affect labeling — calms the brain's threat response.", cadence: "In the moment", evidence: "Lieberman et al. (2007); Barrett (2017)" },
      { title: "Keep a two-line feelings log", detail: "Each evening, write the main feeling you had and the situation around it. Naming builds the vocabulary that makes inner life legible.", cadence: "Daily", evidence: "Expressive writing (Pennebaker, 1997)" },
      { title: "Widen your emotion vocabulary", detail: "When you're stuck on 'fine' or 'stressed,' consult a feelings wheel to find the more exact word. Granularity is a learnable skill.", cadence: "As needed", evidence: "Emotional granularity research" },
    ] },
    AWA: { increase: [
      { title: "Single-task on purpose", detail: "Do one thing at a time, fully — phone away, other tabs closed. Acting with awareness is mostly the absence of autopilot multitasking.", cadence: "Daily", evidence: "Attention research; MBSR" },
      { title: "Three breaths at transitions", detail: "Between activities, take three conscious breaths before starting the next thing. It re-enters the present and breaks the autopilot chain.", cadence: "At transitions", evidence: "Informal MBSR practice" },
      { title: "Choose one daily activity to do mindfully", detail: "Pick a routine — a shower, a walk, washing up — and do it with full attention to the senses each day. Everyday life becomes the practice.", cadence: "Daily", evidence: "Kabat-Zinn (1990)" },
    ] },
    NJ: { increase: [
      { title: "Notice and name 'judging'", detail: "When you catch a verdict on your own thoughts or feelings, silently note 'judging' and return to the experience itself. Seeing the judge loosens it.", cadence: "Daily", evidence: "MBCT (Segal, Williams & Teasdale, 2002)" },
      { title: "Add 'and that's okay'", detail: "When a hard feeling shows up, let it be there without ruling it wrong. Acceptance reduces the second layer of suffering judgment adds.", cadence: "In the moment", evidence: "Acceptance & Commitment Therapy (Hayes et al., 1999)" },
      { title: "Speak to yourself as a friend", detail: "Swap the harsh inner verdict for what you'd say to someone you care about in the same spot. Kindness is a trainable default.", cadence: "Daily", evidence: "Neff (2003), self-compassion" },
    ] },
    NR: { increase: [
      { title: "Surf the urge", detail: "When a strong feeling or impulse hits, watch it rise, peak, and fall like a wave instead of acting on it. Urges pass faster than they promise to.", cadence: "When triggered", evidence: "Urge surfing (Marlatt); DBT (Linehan)" },
      { title: "Put a pause between trigger and response", detail: "Build a deliberate gap — three slow breaths — before you react. The gap is where choice lives.", cadence: "When triggered", evidence: "Emotion-regulation research" },
      { title: "Watch thoughts like clouds", detail: "Picture difficult thoughts drifting across a wide sky — you are the sky, not the weather. Decentering keeps feelings from becoming facts.", cadence: "Daily, briefly", evidence: "Cognitive defusion (ACT); MBCT decentering" },
    ] },
  },
};

function strategiesFor(
  rng: Rng,
  instrument: Instrument,
  scaleDef: ScaleDef,
  direction: GrowthDirection,
): GrowthStep[] {
  if (direction === "maintain") return maintainSteps(rng);
  const bank = STRATEGY_BANKS[instrument.id]?.[scaleDef.id]?.[direction];
  if (bank && bank.length) return rng.sample(bank, Math.min(3, bank.length));
  return genericSteps(rng, scaleDef, direction);
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
      steps: strategiesFor(rng, instrument, scaleDef, direction),
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
