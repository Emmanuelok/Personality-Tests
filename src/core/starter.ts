import type { SynthEntry } from "./synthesis";
import { recommendNext } from "./recommend";
import { INSTRUMENTS } from "./instruments";
import { isPublicJourneyEligibleInstrument } from "./catalogPolicy";

/**
 * A guided "starter pack" — three complementary assessments tailored to a new
 * user's stated goal, designed to take them from zero to a rich Integrated Self
 * in a single sitting. Returns instrument ids in order.
 */
export function starterPack(focus: string[]): string[] {
  const f = focus.join(" ").toLowerCase();
  const requested = f.includes("relationship")
    ? ["attachment-styles", "love-languages", "big-five-ipip50"]
    : f.includes("career") || f.includes("work")
      ? ["riasec-careers", "disc-4", "big-five-ipip50"]
      : f.includes("emotional") || f.includes("wellbeing")
        ? ["emotional-intelligence", "chronotype", "via-24"]
        : f.includes("grow") || f.includes("improve")
          ? ["big-five-ipip50", "grit-resilience", "emotional-intelligence"]
          : ["big-five-ipip50", "enneagram-9", "via-24"];
  const safe: string[] = [];
  for (const id of [
    ...requested,
    "big-five-ipip50",
    "enneagram-9",
    "via-24",
    "emotional-intelligence",
  ]) {
    if (
      safe.length < 3 &&
      !safe.includes(id) &&
      isPublicJourneyEligibleInstrument(id)
    ) safe.push(id);
  }
  return safe;
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
    if (
      isPublicJourneyEligibleInstrument(id) &&
      !done.has(id) &&
      !ids.includes(id) &&
      ids.length < 3
    ) ids.push(id);
  };
  for (const r of recommendNext(entries, { limit: 6 })) push(r.instrument.id);
  if (ids.length < 3) for (const id of starterPack(focus)) push(id);
  if (ids.length < 3) for (const inst of INSTRUMENTS) push(inst.id);
  return ids;
}
