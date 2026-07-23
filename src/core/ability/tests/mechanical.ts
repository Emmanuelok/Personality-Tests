import type { AbilityItem, AbilityTest } from "../types";

/**
 * Mechanical Reasoning — applied physical intuition in the Bennett tradition:
 * levers and torque, gears and pulleys, fluids and rotation. Items are ORIGINAL
 * to this platform; each has a single physically-correct key.
 */

const q = (id: string, domain: string, prompt: string, options: string[], answer: number, pCorrect: number, explain: string): AbilityItem =>
  ({ id, domain, prompt, options, answer, pCorrect, explain });

const items: AbilityItem[] = [
  // Levers & torque
  q("L1", "levers", "On a balanced seesaw, a heavy child sits close to the pivot and a light child sits far out. Who is heavier?", ["The child closer to the pivot", "The child farther from the pivot", "They weigh exactly the same", "It cannot be determined"], 0, 0.62, "Balance means equal torque (weight × distance); the closer child needs more weight."),
  q("L2", "levers", "To pry up a heavy rock with a crowbar using the least effort, place the fulcrum:", ["As close to the rock as possible", "As close to your hands as possible", "Exactly in the middle", "It makes no difference"], 0, 0.6, "A fulcrum near the load lengthens your effort arm, multiplying force."),
  q("L3", "levers", "A wheelbarrow lets you lift a heavy load easily because:", ["The load sits between the wheel (pivot) and your hands — a lever", "The wheel removes the weight", "It is made of light metal", "Air in the tire lifts it"], 0, 0.66, "It's a second-class lever: the load is between fulcrum and effort."),
  q("L4", "levers", "Two people carry a load on a pole between them. To make the LEFT person bear more weight, slide the load:", ["Toward the left person", "Toward the right person", "To the exact center", "It changes nothing"], 0, 0.7, "Moving the load nearer one person shortens their lever arm and loads them more."),

  // Gears & pulleys
  q("G1", "gears", "Two meshed gears: the left one turns clockwise. The right one turns:", ["Counterclockwise", "Clockwise", "It cannot turn", "Either way"], 0, 0.78, "Meshed gears rotate in opposite directions."),
  q("G2", "gears", "A small gear drives a much larger meshed gear. The large gear turns:", ["Slower than the small gear", "Faster than the small gear", "At exactly the same speed", "Only backwards"], 0, 0.66, "More teeth means fewer turns per drive — the big gear is slower (but stronger)."),
  q("G3", "gears", "Three gears mesh in a row. If the first turns clockwise, the third turns:", ["Clockwise", "Counterclockwise", "It locks up", "Randomly"], 0, 0.6, "Direction alternates; an odd number of gears returns to the original direction."),
  q("G4", "gears", "On a bike in a high gear (big front sprocket, small rear), each pedal stroke makes the rear wheel turn:", ["More, but it's harder to pedal", "Less, and it's easier", "The same as any gear", "Backwards"], 0, 0.62, "High gearing trades higher wheel speed for greater pedaling effort."),

  // Fluids, rotation & misc
  q("W1", "fluids", "Two open containers are filled with water to the SAME height — one wide, one narrow. Water pressure at the bottom is:", ["The same in both", "Greater in the wide one", "Greater in the narrow one", "Zero in both"], 0, 0.5, "Liquid pressure depends on depth, not the container's shape or width."),
  q("W2", "fluids", "A glass is filled to the brim with water and floating ice. When the ice melts, the water:", ["Stays at the same level", "Overflows the glass", "Drops well below the brim", "Depends on the ice's shape"], 0, 0.52, "Floating ice displaces its own weight in water, so melting doesn't change the level."),
  q("W3", "fluids", "A spinning figure skater pulls their arms in tight. They spin:", ["Faster", "Slower", "At the same rate", "They stop"], 0, 0.7, "Pulling mass inward reduces moment of inertia, so spin speeds up (conserved angular momentum)."),
  q("W4", "fluids", "Water flowing through a pipe reaches a narrower section. There the water moves:", ["Faster", "Slower", "At the same speed", "It stops"], 0, 0.64, "The same flow through a smaller area must speed up (continuity)."),
];

export const mechanical: AbilityTest = {
  id: "mechanical-reasoning",
  name: "Mechanical Reasoning",
  shortName: "Mechanical",
  category: "cognition",
  tagline: "Physical intuition — levers, gears, pulleys, and fluids.",
  description:
    "In the tradition of the Bennett Mechanical Comprehension Test, this measures applied physical reasoning: how " +
    "levers multiply force, which way meshed gears turn, how pressure and flow behave, and what happens when a spinning " +
    "body pulls in. It's the practical, hands-on side of intelligence that pure verbal tests miss.",
  estMinutes: 8,
  timeLimitSec: 12 * 60,
  domains: [
    { id: "levers", name: "Levers & Torque", chc: "Gv — visual-spatial / mechanical", description: "Force, distance, and balance around a pivot." },
    { id: "gears", name: "Gears & Pulleys", chc: "Gv — visual-spatial / mechanical", description: "Direction, speed, and force in linked rotating parts." },
    { id: "fluids", name: "Fluids & Motion", chc: "Gv — visual-spatial / mechanical", description: "Pressure, flow, buoyancy, and rotation." },
  ],
  items,
  itemProvenance: "Original items written for this platform, modeled on the Bennett Mechanical Comprehension Test.",
  caveats: [
    "This is an EDUCATIONAL estimate, not a professionally validated aptitude test.",
    "Mechanical reasoning reflects exposure and practice as much as raw aptitude — it grows with hands-on experience.",
    "The practice index describes performance on these items in this sitting; it is not a population rank.",
    "It samples physical intuition, not your overall intelligence or worth.",
  ],
  citations: [
    { ref: "Bennett, G. K. (1940/2008). Bennett Mechanical Comprehension Test (BMCT). The Psychological Corporation / Pearson." },
  ],
};
