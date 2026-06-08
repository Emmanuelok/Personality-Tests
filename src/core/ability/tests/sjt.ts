import type { AbilityItem, AbilityTest } from "../types";

/**
 * Situational Judgment Test — realistic scenarios where you pick the most
 * effective response. Used in hiring and admissions (e.g., CASPer). It measures
 * judgment and competencies, NOT general intelligence, so its domains are
 * deliberately left out of the CHC cognitive battery. Items are ORIGINAL.
 */

const q = (id: string, domain: string, prompt: string, options: string[], answer: number, pCorrect: number, explain: string): AbilityItem =>
  ({ id, domain, prompt, options, answer, pCorrect, explain });

const items: AbilityItem[] = [
  // Interpersonal
  q("IP1", "interpersonal", "A teammate keeps interrupting you in meetings. The most effective response is to:",
    ["Interrupt them back so your point lands", "Privately and calmly tell them how it affects you and look for a fix together", "Complain to your manager before talking to them", "Say nothing and hope it stops"], 1, 0.7,
    "Direct, private, non-punitive feedback that invites a shared solution preserves the relationship and addresses the behavior."),
  q("IP2", "interpersonal", "A colleague is visibly upset after receiving tough feedback. You should first:",
    ["Acknowledge how they're feeling and listen before problem-solving", "Tell them to toughen up", "Immediately list ways they can improve", "Avoid them until they've calmed down"], 0, 0.74,
    "People can't hear solutions until they feel heard; acknowledging emotion comes before fixing."),
  q("IP3", "interpersonal", "You disagree with a decision your group just made. The best move is to:",
    ["Quietly work around it later", "Refuse to take part", "Voice your concern with reasons, then commit to the group's choice if it still stands", "Agree out loud but vent to others afterward"], 2, 0.68,
    "Disagree-and-commit: surface concerns openly, then support the decision — this builds trust and better decisions."),
  q("IP4", "interpersonal", "A new team member seems lost but hasn't asked for help. You:",
    ["Wait until they fail, then step in", "Report that they're underperforming", "Do their work for them", "Check in warmly and offer specific support"], 3, 0.72,
    "Proactive, specific support helps them succeed without undermining their autonomy or your trust."),

  // Leadership
  q("LD1", "leadership", "Your team missed an important deadline. As the lead, you first:",
    ["Understand what went wrong without blame, then plan a fix", "Find out who to blame", "Tighten control and micromanage everyone", "Quietly extend the deadline and move on"], 0, 0.7,
    "A blameless post-mortem surfaces the real causes; blame and micromanagement suppress the information you need."),
  q("LD2", "leadership", "Two strong team members are in open conflict. The best approach is to:",
    ["Pick the one you trust more and back them", "Bring them together to surface the real issue and agree on working norms", "Separate them permanently", "Ignore it — they're adults"], 1, 0.66,
    "Facilitating the underlying issue and agreeing norms resolves conflict; avoidance and taking sides escalate it."),
  q("LD3", "leadership", "A high performer is bored and starting to disengage. You:",
    ["Pile on more of the same work", "Threaten consequences if output drops", "Talk with them about growth and offer a stretch challenge", "Start looking for a replacement"], 2, 0.72,
    "Re-engaging top talent means understanding their growth needs and giving meaningful challenge."),
  q("LD4", "leadership", "You must deliver an unpopular change to your team. Best:",
    ["Announce it by email and avoid questions", "Blame the leaders above you", "Delay telling them as long as possible", "Explain the why honestly, acknowledge the downsides, and invite input on the how"], 3, 0.7,
    "Honest rationale plus voice on implementation builds buy-in even for changes people dislike."),

  // Integrity
  q("IN1", "integrity", "You notice a small accounting error that happens to benefit you. You:",
    ["Report and correct it promptly", "Keep quiet since it's small", "Fix it only if someone notices", "Use it now and plan to repay later"], 0, 0.78,
    "Integrity isn't proportional to stakes; promptly correcting it is the clear right action."),
  q("IN2", "integrity", "A client asks you to overstate results 'just slightly' to help the story. You:",
    ["Do it — it's only slight", "Decline, and offer an honest framing that still serves their goal", "Do it but quietly document that they asked", "Hand it to a junior to do"], 1, 0.74,
    "Refusing while offering an honest alternative protects integrity and still helps the client."),
  q("IN3", "integrity", "You realize you unintentionally took credit for a colleague's idea in a meeting. Best:",
    ["Say nothing to avoid awkwardness", "Privately thank them only", "Correct the record publicly and credit them", "Make it up by crediting them next time"], 2, 0.7,
    "Publicly correcting the record repairs the harm where it happened and models fairness."),
  q("IN4", "integrity", "You're asked to sign off on work you haven't fully checked. You:",
    ["Sign to keep things moving", "Sign but add a private note of your doubts", "Ask someone else to sign instead", "Say you'll sign as soon as you've verified it"], 3, 0.72,
    "A sign-off is an attestation; verifying first is what makes it meaningful and honest."),
];

export const sjt: AbilityTest = {
  id: "situational-judgment",
  name: "Situational Judgment",
  shortName: "Judgment",
  category: "cognition",
  tagline: "Realistic scenarios — what's the most effective thing to do?",
  description:
    "Situational Judgment Tests put you in realistic dilemmas — a tense meeting, a missed deadline, an ethical gray " +
    "zone — and ask for the most effective response. Widely used in hiring and admissions (like CASPer for medical " +
    "school), they probe practical judgment across interpersonal skill, leadership, and integrity — not raw IQ.",
  estMinutes: 8,
  domains: [
    { id: "interpersonal", name: "Interpersonal", chc: "Practical judgment", description: "Handling people, feedback, and friction well." },
    { id: "leadership", name: "Leadership", chc: "Practical judgment", description: "Guiding teams through problems and change." },
    { id: "integrity", name: "Integrity", chc: "Practical judgment", description: "Doing the right thing under pressure." },
  ],
  items,
  itemProvenance: "Original scenarios written for this platform, modeled on single-best-response situational judgment tests.",
  caveats: [
    "This measures practical JUDGMENT, not intelligence — so it doesn't feed the cognitive battery.",
    "'Best' answers reflect widely-taught effectiveness principles; real situations are messier and context matters.",
    "An educational self-reflection, not a validated hiring instrument — don't use it for real selection decisions.",
    "Your score is reported as a band and percentile, never a single precise number.",
  ],
  citations: [
    { ref: "Lievens, F., & Sackett, P. R. (2017). Situational judgment tests: From measures of situational judgment to measures of general domain knowledge. Industrial and Organizational Psychology, 10(1), 3–22." },
    { ref: "Dore, K. L., et al. (2017). The reliability and acceptability of the Multiple Mini-Interview and CASPer. Academic Medicine." },
  ],
};
