import type { Instrument, Item } from "../types";

/**
 * Communication & Conflict Style (general).
 *
 * The "both as one" instrument: the core communication competencies that travel
 * across every relationship — partners, teammates, friends, family. Where the
 * Thomas–Kilmann conflict-style test asks WHICH mode you reach for, this measures
 * the underlying SKILLS: assertive expression, active listening, empathy, composure
 * under pressure, collaborative (interest-based) problem-solving, and whether you
 * engage or avoid. Grounded in the assertiveness tradition, Rogers' active listening,
 * Rosenberg's Nonviolent Communication, the dual-concern model, and Fisher & Ury.
 * Items are ORIGINAL to this platform.
 */

const L = { min: 1, max: 5, labels: ["Not like me", "A little", "Somewhat", "Mostly like me", "Very much like me"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Assertive Expression
  it("ASR1", "I state my needs and opinions clearly and directly.", "ASSERT"),
  it("ASR2", "I can say no without feeling guilty or making excuses.", "ASSERT"),
  it("ASR3", "I express disagreement respectfully instead of going along to keep the peace.", "ASSERT"),
  it("ASR4", "I hint at what I want, or go quiet, rather than say it outright.", "ASSERT", -1),
  // Active Listening
  it("LIS1", "I listen to fully understand before I respond.", "LISTEN"),
  it("LIS2", "I reflect back what I heard to make sure I got it right.", "LISTEN"),
  it("LIS3", "I ask questions to understand the other person's point of view.", "LISTEN"),
  it("LIS4", "I'm already planning my reply while the other person is still talking.", "LISTEN", -1),
  // Empathy & Perspective-Taking
  it("EMP1", "I try to see the situation from the other person's perspective.", "EMPATH"),
  it("EMP2", "I acknowledge the other person's feelings, even when I disagree.", "EMPATH"),
  it("EMP3", "I assume good intent rather than the worst.", "EMPATH"),
  it("EMP4", "In a dispute I focus on my own case and tune out theirs.", "EMPATH", -1),
  // Composure in Conflict (emotional regulation)
  it("REG1", "I stay calm and composed when a conversation gets heated.", "REGUL"),
  it("REG2", "I take a breath or a short break instead of reacting in the heat of the moment.", "REGUL"),
  it("REG3", "I say things I regret when I'm upset.", "REGUL", -1),
  it("REG4", "Strong emotions hijack me during conflict.", "REGUL", -1),
  // Collaborative Problem-Solving (dual concern, interests over positions)
  it("COL1", "I look for solutions that work for everyone, not just for me.", "COLLAB"),
  it("COL2", "I focus on the underlying needs behind a dispute, not just the stated positions.", "COLLAB"),
  it("COL3", "I'm willing to compromise and find middle ground.", "COLLAB"),
  it("COL4", "Winning the argument matters more to me than the relationship.", "COLLAB", -1),
  // Engages vs Avoids
  it("ENG1", "I address issues directly rather than letting them slide.", "ENGAGE"),
  it("ENG2", "I bring up problems early instead of bottling them up.", "ENGAGE"),
  it("ENG3", "I avoid difficult conversations whenever I can.", "ENGAGE", -1),
  it("ENG4", "I'd rather talk a problem through than sweep it aside.", "ENGAGE"),
];

export const commStyle: Instrument = {
  id: "communication-style",
  name: "Communication & Conflict Style",
  shortName: "Comm Style",
  kind: "dimensional",
  category: "communication",
  tagline: "Your core communication skills across every relationship — express, listen, stay cool, resolve.",
  description:
    "A general read on the communication competencies that shape every relationship — with partners, teammates, " +
    "friends, and family. It measures six skills behind handling friction well: assertive expression, active " +
    "listening, empathy and perspective-taking, composure under pressure, collaborative (win-win) problem-solving, " +
    "and whether you engage or avoid. It complements the conflict-style (Thomas–Kilmann) test — that names the mode " +
    "you pick; this names the skills you bring.",
  estMinutes: 5,
  responseFormat: L,
  itemProvenance:
    "Original items written for this platform, grounded in the assertiveness tradition, Rogers' active listening, Rosenberg's Nonviolent Communication, the dual-concern model, and Fisher & Ury.",
  scales: [
    { id: "ASSERT", name: "Assertive Expression", description: "Stating needs and views clearly and respectfully — neither passive nor aggressive.", highDescriptor: "clear, direct, and respectful in expressing yourself", lowDescriptor: "passive or indirect about your needs", poles: { low: "Passive", high: "Assertive" }, normMean: 3.3, normSd: 0.76 },
    { id: "LISTEN", name: "Active Listening", description: "Listening to understand — reflecting, clarifying, and attending fully.", highDescriptor: "a focused, reflective listener", lowDescriptor: "prone to half-listening or rehearsing your reply", poles: { low: "Half-listening", high: "Active listener" }, normMean: 3.4, normSd: 0.74 },
    { id: "EMPATH", name: "Empathy & Perspective-Taking", description: "Seeing and validating the other person's view and feelings.", highDescriptor: "quick to take the other's perspective and validate feelings", lowDescriptor: "more self-focused in disagreements", poles: { low: "Self-focused", high: "Empathic" }, normMean: 3.5, normSd: 0.72 },
    { id: "REGUL", name: "Composure in Conflict", description: "Staying calm and regulated rather than flooded or reactive.", highDescriptor: "composed and steady under pressure", lowDescriptor: "easily flooded or reactive when upset", poles: { low: "Reactive", high: "Composed" }, normMean: 3.2, normSd: 0.78 },
    { id: "COLLAB", name: "Collaborative Problem-Solving", description: "Seeking win-win solutions by addressing underlying interests, not fixed positions.", highDescriptor: "focused on shared, interest-based solutions", lowDescriptor: "more win-lose or positional", poles: { low: "Win–lose", high: "Win–win" }, normMean: 3.4, normSd: 0.72 },
    { id: "ENGAGE", name: "Engages vs Avoids", description: "Willingness to address issues directly rather than avoid or withdraw.", highDescriptor: "engages issues early and directly", lowDescriptor: "inclined to avoid or postpone hard conversations", poles: { low: "Avoids", high: "Engages" }, normMean: 3.2, normSd: 0.78 },
  ],
  items,
  caveats: [
    "These are skills, not fixed traits — every one of them strengthens with practice and feedback.",
    "The healthiest communicators flex to the situation: assertive and engaged for what matters, willing to let small things go.",
    "An educational self-reflection; honest self-report depends on self-awareness, so pair it with how others experience you.",
  ],
  citations: [
    { ref: "Alberti, R. E., & Emmons, M. L. (2008). Your Perfect Right: Assertiveness and Equality in Your Life and Relationships (9th ed.). Impact Publishers." },
    { ref: "Rogers, C. R., & Farson, R. E. (1957). Active Listening. University of Chicago Industrial Relations Center." },
    { ref: "Rosenberg, M. B. (2003). Nonviolent Communication: A Language of Life. PuddleDancer Press." },
    { ref: "Rahim, M. A. (1983). A measure of styles of handling interpersonal conflict. Academy of Management Journal, 26(2), 368–376.", note: "Dual-concern basis of collaborative style." },
    { ref: "Fisher, R., & Ury, W. (1981). Getting to Yes. Houghton Mifflin." },
  ],
};
