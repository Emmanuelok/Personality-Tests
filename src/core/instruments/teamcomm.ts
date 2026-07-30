import type { Instrument, Item } from "../types";

/**
 * Team Communication & Conflict.
 *
 * How a team talks, disagrees, and works through friction — the levers behind
 * whether conflict makes a team smarter or tears it apart. Synthesizes Edmondson's
 * psychological safety, Jehn's intragroup conflict types (task vs. relationship vs.
 * process), the "constructive controversy" tradition, and Fisher & Ury's
 * interest-based resolution. Items are ORIGINAL to this platform; you rate the team
 * you spend the most time with. Built to pair with the Study Together collaboration
 * tools, so teammates from anywhere can compare and grow.
 */

const L = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const it = (id: string, text: string, scale: string, keyed: 1 | -1 = 1): Item => ({ id, text, scale, keyed });

const items: Item[] = [
  // Psychological Safety (Edmondson)
  it("SAF1", "On my team, it's safe to take a risk or float a half-formed idea.", "SAFETY"),
  it("SAF2", "If I make a mistake on this team, it's held against me.", "SAFETY", -1),
  it("SAF3", "I can bring up problems and tough issues without fear.", "SAFETY"),
  it("SAF4", "My unique skills and perspective are valued by the team.", "SAFETY"),
  // Open & Candid Communication
  it("OPN1", "People on my team say what they really think, not just what's safe.", "OPEN"),
  it("OPN2", "Information is shared openly rather than kept in silos.", "OPEN"),
  it("OPN3", "We give each other direct, honest feedback.", "OPEN"),
  it("OPN4", "People stay quiet in meetings and vent about it afterward.", "OPEN", -1),
  // Constructive Task Debate (Jehn task conflict, well-handled)
  it("TSK1", "We debate ideas and approaches openly to get to the best answer.", "TASK"),
  it("TSK2", "Disagreement about the work is welcomed, not shut down.", "TASK"),
  it("TSK3", "We can argue hard about the problem while respecting the person.", "TASK"),
  it("TSK4", "People here avoid disagreeing even when they see a better way.", "TASK", -1),
  // Relationship Friction (Jehn relationship conflict — risk)
  it("FRC1", "There is real personality friction and tension on this team.", "FRICTION"),
  it("FRC2", "Conflicts here get personal rather than staying about the work.", "FRICTION"),
  it("FRC3", "Some people on the team simply don't get along.", "FRICTION"),
  it("FRC4", "Emotional clashes drain the team's energy.", "FRICTION"),
  // Coordination & Role Clarity (Jehn process conflict, inverted)
  it("COR1", "Roles and responsibilities are clear to everyone.", "COORD"),
  it("COR2", "We agree on who should do what, and by when.", "COORD"),
  it("COR3", "We waste time arguing over how to divide up the work.", "COORD", -1),
  it("COR4", "Hand-offs and coordination between us run smoothly.", "COORD"),
  // Conflict Resolution & Repair (Fisher & Ury — interests, not positions)
  it("RSV1", "When conflict arises, we address it directly and work it through.", "RESOLVE"),
  it("RSV2", "We look for solutions that meet everyone's underlying needs.", "RESOLVE"),
  it("RSV3", "Disagreements get resolved rather than left to fester.", "RESOLVE"),
  it("RSV4", "We sweep conflicts under the rug and hope they go away.", "RESOLVE", -1),
];

export const teamComm: Instrument = {
  id: "team-communication",
  name: "Team Communication & Conflict",
  shortName: "Team Comms",
  kind: "dimensional",
  category: "communication",
  tagline: "How your team speaks up, debates, and resolves friction — what makes conflict productive.",
  description:
    "Conflict can make a team sharper or quietly poison it — the difference is in how the team communicates. This " +
    "profiler reads six research-backed dimensions: psychological safety (is it safe to speak up?), open and candid " +
    "communication, constructive task debate, relationship friction, coordination and role clarity, and conflict " +
    "resolution. The healthiest teams pair high safety, openness, and productive debate with low personal friction — " +
    "and resolve issues rather than burying them.",
  estMinutes: 6,
  responseFormat: L,
  itemProvenance:
    "Original items written for this platform, grounded in Edmondson's psychological safety, Jehn's intragroup conflict types, and Fisher & Ury's interest-based resolution.",
  scales: [
    { id: "SAFETY", name: "Psychological Safety", description: "A shared sense that it's safe to take interpersonal risks — speak up, admit mistakes, ask for help.", highDescriptor: "high — safe to speak up and be yourself", lowDescriptor: "low — speaking up feels risky", poles: { low: "Guarded", high: "Safe" }, normMean: 3.4, normSd: 0.78 },
    { id: "OPEN", name: "Open Communication", description: "Candor, transparency, and direct feedback across the team.", highDescriptor: "candid, transparent, and direct", lowDescriptor: "guarded, with things left unsaid", poles: { low: "Guarded", high: "Candid" }, normMean: 3.4, normSd: 0.74 },
    { id: "TASK", name: "Constructive Task Debate", description: "Healthy disagreement about ideas and the work itself.", highDescriptor: "debates ideas openly to find the best answer", lowDescriptor: "suppresses disagreement about the work", poles: { low: "Suppressed", high: "Healthy debate" }, normMean: 3.2, normSd: 0.76 },
    { id: "FRICTION", name: "Relationship Friction", description: "Personal, emotional tension and clashes between people (not the work).", highDescriptor: "notable personal tension and clashes (worth easing)", lowDescriptor: "largely free of personal friction", poles: { low: "Harmonious", high: "Friction" }, normMean: 2.5, normSd: 0.82 },
    { id: "COORD", name: "Coordination & Role Clarity", description: "Clarity about who does what and how the work fits together.", highDescriptor: "clear roles and smooth coordination", lowDescriptor: "muddled roles and process friction", poles: { low: "Muddled", high: "Clear" }, normMean: 3.3, normSd: 0.76 },
    { id: "RESOLVE", name: "Conflict Resolution", description: "Surfacing and working through disagreements toward solutions everyone can live with.", highDescriptor: "addresses and resolves conflict constructively", lowDescriptor: "lets conflict fester unaddressed", poles: { low: "Festers", high: "Resolves" }, normMean: 3.2, normSd: 0.76 },
  ],
  items,
  caveats: [
    "This captures your perception of your team; teammates may experience it differently — comparing views (e.g., via a Study Together room) is where the insight is.",
    "Psychological safety is a property of the team and its leaders, not a personal failing — low scores point to the environment, not to you.",
    "Some task conflict is healthy and even necessary; the danger sign is relationship friction and unresolved, festering conflict.",
  ],
  citations: [
    { ref: "Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. Administrative Science Quarterly, 44(2), 350–383." },
    { ref: "Jehn, K. A. (1995). A multimethod examination of the benefits and detriments of intragroup conflict. Administrative Science Quarterly, 40(2), 256–282." },
    { ref: "Jehn, K. A., & Mannix, E. A. (2001). The dynamic nature of conflict: A longitudinal study of intragroup conflict and group performance. Academy of Management Journal, 44(2), 238–251.", note: "Task, relationship, and process conflict." },
    { ref: "Fisher, R., & Ury, W. (1981). Getting to Yes: Negotiating Agreement Without Giving In. Houghton Mifflin.", note: "Resolving conflict by focusing on interests, not positions." },
  ],
};
