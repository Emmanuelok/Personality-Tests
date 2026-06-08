import { describe, it, expect } from "vitest";
import type { Instrument, Item, ResponseMap } from "./types";
import { bigFive, jungTypes, enneagram, hexaco, disc, attachment, darkTriad, via, values, eq, loveLanguages, grit } from "./instruments";
import { computeCompatibility, encodeSummary, decodeSummary, toSummary } from "./compatibility";
import { buildIntegratedProfile, dailyInsight } from "./synthesis";
import { askCompanion, buildReportKnowledge, suggestedQuestions } from "./companion";
import { scoreAssessment } from "./scoring";
import { composeReport } from "./report/composer";
import { generateReport } from "./report";
import { buildGrowthPlan } from "./improvement/plan";

/** Answer every item via a function of the item (lets us drive a scale to a pole). */
function answerAll(instrument: Instrument, fn: (item: Item) => number): ResponseMap {
  const r: ResponseMap = {};
  for (const it of instrument.items) r[it.id] = fn(it);
  return r;
}

/** Drive every scale toward its HIGH pole regardless of item keying. */
const allHigh = (i: Instrument) => answerAll(i, (it) => (it.keyed === 1 ? i.responseFormat.max : i.responseFormat.min));
/** Drive every scale toward its LOW pole. */
const allLow = (i: Instrument) => answerAll(i, (it) => (it.keyed === 1 ? i.responseFormat.min : i.responseFormat.max));

describe("scoring: keying and norming", () => {
  it("drives all Big Five factors to the top when answered toward the high pole", () => {
    const res = scoreAssessment(bigFive, allHigh(bigFive));
    for (const s of Object.values(res.scales)) {
      expect(s.mean).toBeCloseTo(5, 5);
      expect(s.level).toBe("very high");
      expect(s.percentile).toBeGreaterThan(90);
    }
  });

  it("drives all Big Five factors to the bottom when answered toward the low pole", () => {
    const res = scoreAssessment(bigFive, allLow(bigFive));
    for (const s of Object.values(res.scales)) {
      expect(s.mean).toBeCloseTo(1, 5);
      expect(s.level).toBe("very low");
    }
  });

  it("respects reverse keying on a single factor", () => {
    // High Extraversion, neutral elsewhere.
    const responses = answerAll(bigFive, (it) => (it.scale === "E" ? (it.keyed === 1 ? 5 : 1) : 3));
    const res = scoreAssessment(bigFive, responses);
    expect(res.scales.E.mean).toBeCloseTo(5, 5);
    expect(res.scales.A.mean).toBeCloseTo(3, 5);
  });

  it("produces a stable response fingerprint for identical answers", () => {
    const a = scoreAssessment(bigFive, allHigh(bigFive));
    const b = scoreAssessment(bigFive, allHigh(bigFive));
    expect(a.responseFingerprint).toBe(b.responseFingerprint);
  });
});

describe("typology resolution", () => {
  it("resolves the Jungian all-high pattern to ENFJ", () => {
    const res = scoreAssessment(jungTypes, allHigh(jungTypes));
    expect(res.type?.code).toBe("ENFJ");
    expect(res.type?.confidence).toBeGreaterThan(0.9);
  });

  it("resolves the Jungian all-low pattern to ISTP", () => {
    const res = scoreAssessment(jungTypes, allLow(jungTypes));
    expect(res.type?.code).toBe("ISTP");
  });

  it("resolves the dominant Enneagram type from the strongest resonance", () => {
    const responses = answerAll(enneagram, (it) => (it.scale === "T5" ? 5 : 1));
    const res = scoreAssessment(enneagram, responses);
    expect(res.type?.code.startsWith("5")).toBe(true);
  });
});

describe("expanded instruments", () => {
  it("scores HEXACO toward the top across all six dimensions", () => {
    const res = scoreAssessment(hexaco, allHigh(hexaco));
    expect(Object.keys(res.scales)).toHaveLength(6);
    for (const sc of Object.values(res.scales)) expect(sc.level).toBe("very high");
  });

  it("resolves the dominant DISC style", () => {
    const responses = answerAll(disc, (i) => (i.scale === "D" ? 5 : 1));
    const res = scoreAssessment(disc, responses);
    expect(res.type?.code.startsWith("D")).toBe(true);
  });

  it("classifies attachment styles from the two dimensions", () => {
    const secure = scoreAssessment(attachment, allLow(attachment));
    expect(secure.type?.code).toBe("Secure");

    const anxiousResponses = answerAll(attachment, (i) =>
      i.scale === "ANX" ? (i.keyed === 1 ? 5 : 1) : i.keyed === 1 ? 1 : 5,
    );
    const anxious = scoreAssessment(attachment, anxiousResponses);
    expect(anxious.type?.code).toBe("Anxious");
  });

  it("scores the Dark Triad and composes a unique dimensional report", () => {
    const res = scoreAssessment(darkTriad, allHigh(darkTriad));
    for (const sc of Object.values(res.scales)) expect(sc.mean).toBeCloseTo(5, 5);
    const report = composeReport(darkTriad, res, { seed: 3 });
    expect(report.title.length).toBeGreaterThan(3);
    expect(report.traits).toHaveLength(3);
  });
});

describe("strengths, values, EQ, love languages, grit", () => {
  it("VIA measures the six virtues", () => {
    const res = scoreAssessment(via, allHigh(via));
    expect(Object.keys(res.scales)).toHaveLength(6);
    for (const sc of Object.values(res.scales)) expect(sc.level).toBe("very high");
  });

  it("Values scores ten priorities", () => {
    const res = scoreAssessment(values, allHigh(values));
    expect(Object.keys(res.scales)).toHaveLength(10);
  });

  it("EQ respects reverse-keyed items", () => {
    const res = scoreAssessment(eq, allHigh(eq));
    for (const sc of Object.values(res.scales)) expect(sc.mean).toBeCloseTo(5, 5);
  });

  it("Love Languages resolves a primary language", () => {
    const responses = answerAll(loveLanguages, (i) => (i.scale === "TOUCH" ? 5 : 1));
    expect(scoreAssessment(loveLanguages, responses).type?.code).toBe("Physical Touch");
  });

  it("Grit bands from high to emerging", () => {
    expect(scoreAssessment(grit, allHigh(grit)).type?.code).toBe("High Grit");
    expect(scoreAssessment(grit, allLow(grit)).type?.code).toBe("Emerging Grit");
  });
});

describe("compatibility engine", () => {
  it("round-trips a privacy-safe share code", () => {
    const r = scoreAssessment(bigFive, allHigh(bigFive));
    const back = decodeSummary(encodeSummary(toSummary(bigFive, r)));
    expect(back?.instrumentId).toBe(bigFive.id);
    expect(Object.keys(back?.scales ?? {})).toHaveLength(5);
  });

  it("scores identical Big Five profiles as highly compatible", () => {
    const sum = toSummary(bigFive, scoreAssessment(bigFive, allHigh(bigFive)));
    const rep = computeCompatibility(bigFive, sum, sum, { seed: 1 });
    expect(rep.overall).toBeGreaterThanOrEqual(80);
    expect(rep.dimensions).toHaveLength(5);
  });

  it("flags an anxious–avoidant attachment pairing", () => {
    const anxious = answerAll(attachment, (i) => (i.scale === "ANX" ? (i.keyed === 1 ? 5 : 1) : i.keyed === 1 ? 1 : 5));
    const avoidant = answerAll(attachment, (i) => (i.scale === "AV" ? (i.keyed === 1 ? 5 : 1) : i.keyed === 1 ? 1 : 5));
    const a = toSummary(attachment, scoreAssessment(attachment, anxious));
    const b = toSummary(attachment, scoreAssessment(attachment, avoidant));
    const rep = computeCompatibility(attachment, a, b, { seed: 2 });
    expect(rep.frictions.join(" ").toLowerCase()).toContain("anxious");
  });
});

describe("Ask Atlas companion", () => {
  it("answers questions from a report's own data", () => {
    const result = scoreAssessment(bigFive, allHigh(bigFive));
    const report = composeReport(bigFive, result, { seed: 3, name: "Sam" });
    const k = buildReportKnowledge(bigFive, result, report, "Sam");
    expect(suggestedQuestions(k).length).toBeGreaterThan(0);
    expect(askCompanion(k, "what are my strengths?").text.length).toBeGreaterThan(10);
    expect(askCompanion(k, "tell me about my openness").text.toLowerCase()).toContain("openness");
    expect(askCompanion(k, "how do I improve?").text.length).toBeGreaterThan(10);
    expect(askCompanion(k, "thanks").text.toLowerCase()).toContain("sam");
  });
});

describe("integrated cross-test synthesis", () => {
  it("weaves multiple assessments into one named portrait", () => {
    const e1 = { instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) };
    const e2 = { instrument: enneagram, result: scoreAssessment(enneagram, answerAll(enneagram, (i) => (i.scale === "T1" ? 5 : 1))) };
    const ip = buildIntegratedProfile([e1, e2], { name: "Ada", seed: 5 });
    expect(ip.operatingManual).toHaveLength(5);
    expect(ip.headline.length).toBeGreaterThan(3);
    expect(ip.themes.length).toBeGreaterThan(0);
    expect(ip.overview.join(" ")).toContain("Ada");
    expect(ip.depth).toBeGreaterThan(0);
  });

  it("produces a deterministic daily insight per day", () => {
    const e = { instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) };
    const d = new Date("2026-06-10T09:00:00Z");
    const a = dailyInsight([e], "Ada", d);
    const b = dailyInsight([e], "Ada", d);
    expect(a.title).toBe(b.title);
    expect(a.practice).toBe(b.practice);
    expect(a.greeting).toContain("Ada");
  });
});

describe("report uniqueness guarantee", () => {
  it("never produces two identical reports from identical answers (default seed)", () => {
    const result = scoreAssessment(bigFive, allHigh(bigFive));
    const r1 = composeReport(bigFive, result);
    const r2 = composeReport(bigFive, result);
    expect(r1.reportId).not.toBe(r2.reportId);
    expect(r1.seedHex).not.toBe(r2.seedHex);
    // Prose should differ too (different seed → different variant selections).
    const prose = (r: typeof r1) => JSON.stringify([r.overview, r.traits.map((t) => t.narrative), r.sections.map((s) => s.paragraphs)]);
    expect(prose(r1)).not.toBe(prose(r2));
  });

  it("reproduces identical prose for a fixed seed (regeneration is deterministic)", () => {
    const result = scoreAssessment(bigFive, allHigh(bigFive));
    const r1 = composeReport(bigFive, result, { seed: 12345 });
    const r2 = composeReport(bigFive, result, { seed: 12345 });
    expect(r1.overview).toEqual(r2.overview);
    expect(r1.traits.map((t) => t.narrative)).toEqual(r2.traits.map((t) => t.narrative));
    expect(r1.sections.map((s) => s.paragraphs)).toEqual(r2.sections.map((s) => s.paragraphs));
    // ...but each generation still carries a unique id.
    expect(r1.reportId).not.toBe(r2.reportId);
  });

  it("surfaces trait-level dynamics for an all-high Big Five profile", () => {
    const result = scoreAssessment(bigFive, allHigh(bigFive));
    const report = composeReport(bigFive, result, { seed: 7 });
    expect(report.dynamics.length).toBeGreaterThan(0);
    expect(report.signatureResponses.length).toBeGreaterThan(0);
  });

  it("generateReport falls back to the deterministic engine with no LLM", async () => {
    const result = scoreAssessment(jungTypes, allHigh(jungTypes));
    const report = await generateReport(jungTypes, result, { seed: 99 });
    expect(report.engine).toBe("deterministic");
    expect(report.type?.code).toBe("ENFJ");
  });
});

describe("growth planning", () => {
  it("builds an evidence-based plan toward a higher target", () => {
    const result = scoreAssessment(bigFive, allLow(bigFive)); // low Conscientiousness
    const plan = buildGrowthPlan(bigFive, result, [{ scaleId: "C", target: 80 }], { seed: 1 });
    const area = plan.areas.find((a) => a.scaleId === "C");
    expect(area?.direction).toBe("increase");
    expect(area?.steps.length).toBeGreaterThan(0);
    expect(plan.citations.length).toBeGreaterThan(0);
  });

  it("treats a near-current target as maintenance, not change", () => {
    const result = scoreAssessment(bigFive, allHigh(bigFive)); // high Conscientiousness (~100)
    const plan = buildGrowthPlan(bigFive, result, [{ scaleId: "C", target: 98 }], { seed: 1 });
    const area = plan.areas.find((a) => a.scaleId === "C");
    expect(area?.direction).toBe("maintain");
  });
});
