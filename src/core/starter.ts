import type { SynthEntry } from "./synthesis";
import { recommendNext } from "./recommend";
import { INSTRUMENTS } from "./instruments";

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

/**
 * The guided pack, made intelligent. First-time visitors get the classic
 * focus-based trio; returning users get a pack built live from the
 * recommendation engine — the three best next tests for who they've shown
 * themselves to be — with sensible fallbacks so it always proposes three.
 */
export function adaptivePack(entries: SynthEntry[], focus: string[]): string[] {
  if (!entries.length) return starterPack(focus);
  const done = new Set(entries.map((e) => e.instrument.id));
  const ids: string[] = [];
  const push = (id: string) => {
    if (!done.has(id) && !ids.includes(id) && ids.length < 3) ids.push(id);
  };
  for (const r of recommendNext(entries, { limit: 6 })) push(r.instrument.id);
  if (ids.length < 3) for (const id of starterPack(focus)) push(id);
  if (ids.length < 3) for (const inst of INSTRUMENTS) push(inst.id);
  return ids;
}
