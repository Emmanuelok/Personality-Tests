/**
 * A guided "starter pack" — three complementary assessments tailored to a new
 * user's stated goal, designed to take them from zero to a rich Integrated Self
 * in a single sitting. Returns instrument ids in order.
 */
export function starterPack(focus: string[]): string[] {
  const f = focus.join(" ").toLowerCase();
  if (f.includes("relationship")) return ["attachment-styles", "love-languages", "big-five-ipip50"];
  if (f.includes("career") || f.includes("work")) return ["riasec-careers", "disc-4", "big-five-ipip50"];
  if (f.includes("emotional") || f.includes("wellbeing")) return ["emotional-intelligence", "chronotype", "via-24"];
  if (f.includes("grow") || f.includes("improve")) return ["big-five-ipip50", "grit-resilience", "emotional-intelligence"];
  // Understand myself / curious / default — the classic trio.
  return ["big-five-ipip50", "enneagram-9", "via-24"];
}
