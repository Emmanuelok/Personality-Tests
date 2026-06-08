import type { AssessmentResult, Instrument } from "./types";
import { Rng, nonce, seedFrom } from "./prng";
import { clamp } from "./variation";

/**
 * Relationship compatibility — compare two people's results on the same instrument.
 *
 * Privacy by design: a result is shared as a compact, encoded "code" containing
 * only the scale positions (0–100) and type — never the raw answers. Compatibility
 * is computed from those positions, with construct-aware adjustments for the
 * relational instruments (attachment, love languages, the broad trait models).
 */

export interface ResultSummary {
  instrumentId: string;
  /** scaleId -> normalized position 0..100 */
  scales: Record<string, number>;
  typeCode?: string;
}

export function toSummary(instrument: Instrument, result: AssessmentResult): ResultSummary {
  const scales: Record<string, number> = {};
  for (const s of instrument.scales) {
    if (result.scales[s.id]) scales[s.id] = Math.round(result.scales[s.id].normalized);
  }
  return { instrumentId: instrument.id, scales, typeCode: result.type?.code };
}

/* ── compact share code (browser + Node) ───────────────────────────────── */

function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSummary(sum: ResultSummary): string {
  return b64urlEncode(JSON.stringify({ i: sum.instrumentId, s: sum.scales, t: sum.typeCode }));
}

export function decodeSummary(code: string): ResultSummary | null {
  try {
    const o = JSON.parse(b64urlDecode(code.trim()));
    if (!o || typeof o.i !== "string" || typeof o.s !== "object") return null;
    return { instrumentId: o.i, scales: o.s, typeCode: o.t };
  } catch {
    return null;
  }
}

/* ── compatibility report ───────────────────────────────────────────────── */

export interface CompatDimension {
  id: string;
  name: string;
  you: number;
  them: number;
  gap: number;
  note: string;
}

export interface CompatibilityReport {
  instrumentId: string;
  instrumentName: string;
  reportId: string;
  overall: number; // 0..100
  band: string;
  headline: string;
  summary: string[];
  dimensions: CompatDimension[];
  strengths: string[];
  frictions: string[];
  tips: string[];
}

function bandFor(n: number): string {
  if (n >= 80) return "Highly compatible";
  if (n >= 64) return "Strongly compatible";
  if (n >= 48) return "Workably compatible";
  if (n >= 32) return "Challenging but workable";
  return "Very different";
}

function topScale(scales: Record<string, number>, instrument: Instrument): string {
  let bestId = instrument.scales[0]?.id;
  let best = -1;
  for (const s of instrument.scales) {
    const v = scales[s.id];
    if (v != null && v > best) {
      best = v;
      bestId = s.id;
    }
  }
  return instrument.scales.find((s) => s.id === bestId)?.name ?? bestId;
}

export function computeCompatibility(
  instrument: Instrument,
  you: ResultSummary,
  them: ResultSummary,
  opts: { seed?: number; now?: Date } = {},
): CompatibilityReport {
  const reportId = nonce(6);
  const seed = opts.seed ?? seedFrom(instrument.id, JSON.stringify(you.scales), JSON.stringify(them.scales), (opts.now ?? new Date()).getTime(), reportId);
  const rng = new Rng(seed);

  const dimensions: CompatDimension[] = instrument.scales
    .filter((s) => you.scales[s.id] != null && them.scales[s.id] != null)
    .map((s) => {
      const a = you.scales[s.id];
      const b = them.scales[s.id];
      const gap = Math.abs(a - b);
      const note =
        gap <= 15
          ? rng.pick([`Closely aligned on ${s.name} — easy common ground.`, `You see ${s.name} much the same way.`, `Strong agreement on ${s.name}.`])
          : gap >= 40
            ? rng.pick([`A wide gap on ${s.name} — worth talking through openly.`, `You differ markedly on ${s.name}; expect different instincts here.`, `${s.name} is where you'll feel the most friction.`])
            : rng.pick([`Some difference on ${s.name} — complementary if handled well.`, `A moderate gap on ${s.name}.`, `You diverge a little on ${s.name}.`]);
      return { id: s.id, name: s.name, you: a, them: b, gap, note };
    });

  const meanGap = dimensions.length ? dimensions.reduce((x, d) => x + d.gap, 0) / dimensions.length : 50;
  let overall = 100 - meanGap; // base: similarity

  const strengths: string[] = [];
  const frictions: string[] = [];
  const tips: string[] = [];

  // Construct-aware adjustments.
  if (instrument.id === "attachment-styles") {
    const sec = 100 - (you.scales.ANX + you.scales.AV + them.scales.ANX + them.scales.AV) / 4;
    overall = 0.6 * sec + 0.4 * (100 - meanGap);
    const trap = (you.scales.ANX >= 55 && them.scales.AV >= 55) || (them.scales.ANX >= 55 && you.scales.AV >= 55);
    if (trap) {
      overall -= 12;
      frictions.unshift("A classic anxious–avoidant pattern: one of you reaches for closeness as the other pulls back. It's workable — name the cycle together rather than blaming each other.");
    }
    if (sec >= 65) strengths.unshift("You both lean secure — a strong foundation of trust and steadiness.");
    tips.push("When stressed, say what you need plainly ('I need reassurance' / 'I need a little space') instead of acting it out.");
  } else if (instrument.id === "love-languages") {
    const youTop = topScale(you.scales, instrument);
    const themTop = topScale(them.scales, instrument);
    tips.push(`Speak each other's language: lead with ${themTop} for them, and ask them for more ${youTop}.`);
    if (youTop === themTop) strengths.unshift(`You share a top love language (${youTop}) — what fills you up fills them up too.`);
    else frictions.push(`Your top languages differ (${youTop} vs. ${themTop}); love can get 'lost in translation' unless you each learn to give the other's.`);
  } else if (instrument.id === "big-five-ipip50") {
    if ((you.scales.A ?? 0) >= 60 && (them.scales.A ?? 0) >= 60) { overall += 5; strengths.push("You're both high in Agreeableness — warmth and cooperation come easily between you."); }
    if ((you.scales.N ?? 50) <= 45 && (them.scales.N ?? 50) <= 45) { overall += 5; strengths.push("You're both emotionally steady — fewer storms, faster recovery after conflict."); }
  } else if (instrument.id === "hexaco-24") {
    if ((you.scales.H ?? 0) >= 55 && (them.scales.H ?? 0) >= 55) { overall += 5; strengths.push("You both score high on Honesty-Humility — a foundation of fairness and trust."); }
  }

  overall = Math.round(clamp(overall, 5, 99));
  const band = bandFor(overall);

  // Generic strengths/frictions from the closest and widest dimensions.
  const sorted = [...dimensions].sort((a, b) => a.gap - b.gap);
  for (const d of sorted.slice(0, 2)) if (d.gap <= 22) strengths.push(`Shared ground on ${d.name}.`);
  for (const d of [...sorted].reverse().slice(0, 2)) if (d.gap >= 28) frictions.push(`Different wiring on ${d.name} — a place to practice curiosity over judgment.`);

  tips.push(
    rng.pick([
      "Treat differences as information, not verdicts — ask 'how do you see this?' before reacting.",
      "Name one thing you each appreciate about how the other is different from you.",
      "Pick the single widest gap above and have one honest, low-stakes conversation about it this week.",
    ]),
  );

  const headline = `${overall}% — ${band}`;
  const summary = [
    rng.pick([
      `Across ${dimensions.length} dimensions, you and your match come out ${band.toLowerCase()} (${overall}%).`,
      `Your two profiles land at ${overall}% — ${band.toLowerCase()}.`,
      `Overall, this pairing reads as ${band.toLowerCase()} (${overall}%).`,
    ]),
    rng.pick([
      "Compatibility isn't about being identical — it's about understanding where you align, where you differ, and turning both into closeness.",
      "Remember: high similarity makes things easy, but well-handled differences are what make a pairing grow. Use the notes below as conversation starters.",
      "No score is destiny here. The most compatible pairs are simply the ones who get curious about their differences.",
    ]),
  ];

  return {
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    reportId,
    overall,
    band,
    headline,
    summary,
    dimensions,
    strengths: Array.from(new Set(strengths)).slice(0, 5),
    frictions: Array.from(new Set(frictions)).slice(0, 5),
    tips: Array.from(new Set(tips)).slice(0, 5),
  };
}
