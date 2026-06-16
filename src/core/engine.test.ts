import { describe, it, expect } from "vitest";
import type { Instrument, Item, ResponseMap } from "./types";
import { INSTRUMENTS, bigFive, jungTypes, enneagram, hexaco, disc, attachment, darkTriad, via, values, eq, loveLanguages, grit, conflictStyle, chronotype, moralFoundations, temperaments, riasec, adhd, autism, perma, lifeSatisfaction, resilience, selfEsteem, mood, vark, keirsey, kolb, optimism, hope, curiosity, needForCognition } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";
import { starterPack, adaptivePack } from "./starter";
import { computeCompatibility, encodeSummary, decodeSummary, toSummary } from "./compatibility";
import { buildIntegratedProfile, dailyInsight, type SynthEntry } from "./synthesis";
import { recommendNext, profileSpotlight, relevanceNote, standoutTraits } from "./recommend";
import { dailyNudge } from "./daily";
import { buildRoadmap, goalKeys } from "./roadmap";
import { computeMilestones } from "./milestones";
import { analyzeConvergence, triangulationTarget } from "./converge";
import { analyzeCommunication } from "./commsynth";
import { analyzeWellbeing } from "./wellsynth";
import { analyzeResponseStyle } from "./responsestyle";
import { createRoom, encodeRoom, decodeRoom, roomLink, encodeProgress, decodeProgress, roomStandings, planCoverage, groupPortrait, groupInsights, groupRoles, groupResonance, roleLine, pairingNotes, groupNextStep, teamStandings, teamCount, type MemberProgress } from "./collab";
import { autopilotNext, agentBrief, autopilotLength } from "./autopilot";
import { compareTakes, changeNarrative } from "./growth";
import { askCompanion, buildReportKnowledge, buildIntegratedKnowledge, suggestedQuestions } from "./companion";
import { scoreAssessment } from "./scoring";
import { composeReport } from "./report/composer";
import { generateReport } from "./report";
import { buildGrowthPlan, suggestTargets } from "./improvement/plan";

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

  it("localizes the attachment style card while keeping the canonical code stable", () => {
    const secureAns = allLow(attachment); // low anxiety + low avoidance → Secure
    const en = scoreAssessment(attachment, secureAns).type!;
    expect(en.code).toBe("Secure");
    expect(en.title).toBe("Secure Attachment");
    const es = scoreAssessment(localizeInstrument(attachment, "es"), secureAns).type!;
    expect(es.code).toBe("Secure"); // canonical, language-agnostic
    expect(es.title).toBe("Apego seguro");
    expect(es.components.some((c) => c.label === "Ansiedad del apego")).toBe(true);
    const fr = scoreAssessment(localizeInstrument(attachment, "fr"), secureAns).type!;
    expect(fr.code).toBe("Secure");
    expect(fr.title).toBe("Attachement sécure");
    expect(fr.components.some((c) => c.label === "Vers la sécurité")).toBe(true);
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
  it("VIA-24 resolves signature strengths", () => {
    const res = scoreAssessment(via, allHigh(via));
    expect(Object.keys(res.scales)).toHaveLength(24);
    expect(res.type?.code).toBeTruthy();
    expect(res.type?.components.some((c) => c.label === "Leading virtue")).toBe(true);
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
    // choice format: pick the Physical Touch option (index 4) on every scenario
    const responses = Object.fromEntries(loveLanguages.items.map((i) => [i.id, 4]));
    expect(scoreAssessment(loveLanguages, responses).type?.code).toBe("Physical Touch");
  });

  it("localizes Love Languages content, choice options, and the result card (es/fr)", () => {
    const responses = Object.fromEntries(loveLanguages.items.map((i) => [i.id, 4])); // Physical Touch
    const es = localizeInstrument(loveLanguages, "es");
    // The choice options themselves are translated (not just the scenario prompt)…
    expect(es.items[0].text).not.toBe(loveLanguages.items[0].text);
    expect(es.items[0].options![0].text).not.toBe(loveLanguages.items[0].options![0].text);
    // …while option→scale mapping (what scoring keys off) is preserved.
    expect(es.items[0].options!.map((o) => o.scale)).toEqual(loveLanguages.items[0].options!.map((o) => o.scale));
    const esType = scoreAssessment(es, responses).type!;
    expect(esType.code).toBe("Physical Touch"); // canonical, language-agnostic
    expect(esType.title).toContain("Contacto físico");
    expect(esType.components.some((c) => c.label === "Lenguaje principal")).toBe(true);
    const frType = scoreAssessment(localizeInstrument(loveLanguages, "fr"), responses).type!;
    expect(frType.title).toContain("Contact physique");
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

  it("reads couple communication compatibility through a Gottman lens", () => {
    const couple = INSTRUMENTS.find((i) => i.id === "couple-communication")!;
    const healthy = answerAll(couple, (it) => (it.scale === "HORSE" || it.scale === "DEMWD" ? (it.keyed === 1 ? 1 : 5) : it.keyed === 1 ? 5 : 1));
    const hsum = toSummary(couple, scoreAssessment(couple, healthy));
    const good = computeCompatibility(couple, hsum, hsum, { seed: 3 });
    expect(good.overall).toBeGreaterThanOrEqual(70); // both healthy → strong
    expect(good.strengths.length).toBeGreaterThan(0);

    const horsey = answerAll(couple, (it) => (it.scale === "HORSE" || it.scale === "DEMWD" ? (it.keyed === 1 ? 5 : 1) : it.keyed === 1 ? 1 : 5));
    const ssum = toSummary(couple, scoreAssessment(couple, horsey));
    const rough = computeCompatibility(couple, ssum, ssum, { seed: 4 });
    expect(rough.frictions.join(" ").toLowerCase()).toContain("horsemen");
    expect(rough.overall).toBeLessThan(good.overall);
  });

  it("localizes the compatibility report (band + summary) by locale", () => {
    const big = toSummary(bigFive, scoreAssessment(bigFive, allHigh(bigFive)));
    const en = computeCompatibility(bigFive, big, big, { seed: 1, locale: "en" });
    const es = computeCompatibility(bigFive, big, big, { seed: 1, locale: "es" });
    const fr = computeCompatibility(bigFive, big, big, { seed: 1, locale: "fr" });
    expect(en.band).toBe("Highly compatible");
    expect(es.band).toBe("Muy compatibles");
    expect(fr.band).toBe("Très compatibles");
    expect(es.summary.join(" ")).not.toBe(en.summary.join(" "));
    expect(en.overall).toBe(es.overall); // scoring is language-agnostic
  });
});

describe("temperaments, careers & trait screens", () => {
  it("resolves a leading temperament", () => {
    const r = answerAll(temperaments, (i) => (i.scale === "SANG" ? 5 : 1));
    expect(scoreAssessment(temperaments, r).type?.code).toContain("Sanguine");
  });

  it("resolves a Holland career code with career matches", () => {
    const r = answerAll(riasec, (i) => (i.scale === "S" ? 5 : i.scale === "A" ? 4 : 1));
    const res = scoreAssessment(riasec, r);
    expect(res.type?.code[0]).toBe("S");
    expect(res.type?.components.some((c) => c.label === "Career matches")).toBe(true);
  });

  it("bands ADHD / autistic traits with non-diagnostic framing", () => {
    const adhdHigh = scoreAssessment(adhd, allHigh(adhd));
    expect(adhdHigh.type?.code).toBe("Many traits");
    expect(adhdHigh.type?.summary.toLowerCase()).toContain("not a diagnosis");
    expect(scoreAssessment(autism, allLow(autism)).type?.code).toBe("Few traits");
    // localized: canonical code stays English; title + summary translate
    const esA = scoreAssessment(localizeInstrument(adhd, "es"), allHigh(adhd)).type!;
    expect(esA.code).toBe("Many traits");
    expect(esA.summary.toLowerCase()).toContain("no un diagnóstico");
    expect(esA.components.some((c) => c.label === "Inatención")).toBe(true);
    expect(scoreAssessment(localizeInstrument(autism, "fr"), allLow(autism)).type!.summary.toLowerCase()).toContain("pas un diagnostic");
  });
});

describe("conflict, chronotype, moral foundations & starter pack", () => {
  it("resolves a dominant conflict style", () => {
    // choice format: pick the Competing option (index 0) on every scenario
    const responses = Object.fromEntries(conflictStyle.items.map((i) => [i.id, 0]));
    expect(scoreAssessment(conflictStyle, responses).type?.code).toBe("Competing");
    // localized: canonical code stays English; title + labels translate
    const es = scoreAssessment(localizeInstrument(conflictStyle, "es"), responses).type!;
    expect(es.code).toBe("Competing");
    expect(es.title).toBe("El Director");
    expect(es.components.some((c) => c.label === "Estilo principal")).toBe(true);
    const fr = scoreAssessment(localizeInstrument(conflictStyle, "fr"), responses).type!;
    expect(fr.title).toBe("Le Directeur");
  });

  it("classifies chronotype as Lark or Owl", () => {
    expect(scoreAssessment(chronotype, allHigh(chronotype)).type?.code).toBe("Lark");
    expect(scoreAssessment(chronotype, allLow(chronotype)).type?.code).toBe("Owl");
    // localized: canonical code stays English; title + labels translate
    const es = scoreAssessment(localizeInstrument(chronotype, "es"), allHigh(chronotype)).type!;
    expect(es.code).toBe("Lark");
    expect(es.title).toBe("El Madrugador (Alondra)");
    expect(es.components.some((c) => c.label === "Tus horas pico")).toBe(true);
    expect(scoreAssessment(localizeInstrument(chronotype, "fr"), allLow(chronotype)).type!.title).toBe("Le Couche-tard");
  });

  it("scores all five moral foundations", () => {
    expect(Object.keys(scoreAssessment(moralFoundations, allHigh(moralFoundations)).scales)).toHaveLength(5);
  });

  it("tailors the starter pack to a goal", () => {
    expect(starterPack(["Better relationships"])).toContain("attachment-styles");
    expect(starterPack([]).length).toBe(3);
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

  it("answers and suggests questions in the user's language", () => {
    const result = scoreAssessment(bigFive, allHigh(bigFive));
    const report = composeReport(bigFive, result, { seed: 4, name: "Sam" });
    const k = buildReportKnowledge(bigFive, result, report, "Sam");
    // Localized suggested questions.
    const es = suggestedQuestions(k, "es");
    expect(es.join(" ")).toMatch(/fortalezas|mejorar/i);
    expect(es.join(" ")).not.toEqual(suggestedQuestions(k, "en").join(" "));
    // Spanish keyword is understood and answered in Spanish.
    const ans = askCompanion(k, "¿cuáles son mis fortalezas?", 1, "es").text;
    expect(ans.length).toBeGreaterThan(10);
    expect(ans).not.toBe(askCompanion(k, "what are my strengths?", 1, "en").text);
    // French greeting routes to the localized greet answer.
    expect(askCompanion(k, "bonjour", 1, "fr").text.length).toBeGreaterThan(10);
  });

  it("answers cross-test consistency from the integrated convergence data", () => {
    const drive = (inst: Instrument, scale: string, high: boolean) =>
      ({ instrument: inst, result: scoreAssessment(inst, answerAll(inst, (it) => (it.scale === scale ? (it.keyed === 1 ? (high ? inst.responseFormat.max : inst.responseFormat.min) : (high ? inst.responseFormat.min : inst.responseFormat.max)) : 3))) });
    const ip = buildIntegratedProfile([drive(bigFive, "E", true), drive(hexaco, "X", true)], { name: "Sam" });
    const k = buildIntegratedKnowledge(ip);
    const ans = askCompanion(k, "are my results consistent?").text;
    expect(ans.length).toBeGreaterThan(20);
    expect(ans.toLowerCase()).toContain("cross-check");
  });
});

describe("integrated cross-test synthesis", () => {
  it("weaves multiple assessments into one named portrait", () => {
    const e1 = { instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) };
    const e2 = { instrument: enneagram, result: scoreAssessment(enneagram, answerAll(enneagram, (i) => (i.scale === "T1" ? 5 : 1))) };
    const ip = buildIntegratedProfile([e1, e2], { name: "Ada", seed: 5 });
    expect(ip.operatingManual).toHaveLength(7); // +goals +regulate from Big Five
    expect(ip.headline.length).toBeGreaterThan(3);
    expect(ip.themes.length).toBeGreaterThan(0);
    expect(ip.overview.join(" ")).toContain("Ada");
    expect(ip.depth).toBeGreaterThan(0);
  });

  it("localizes the whole portrait — headline, themes, manual, overview", () => {
    const drive = (i: typeof bigFive) => answerAll(i, (it) => (it.scale === "O" || it.scale === "C" ? (it.keyed === 1 ? 5 : 1) : 3));
    const e1 = { instrument: bigFive, result: scoreAssessment(bigFive, drive(bigFive)) };
    const en = buildIntegratedProfile([e1], { name: "Ada", seed: 9, locale: "en" });
    const es = buildIntegratedProfile([e1], { name: "Ada", seed: 9, locale: "es" });
    const fr = buildIntegratedProfile([e1], { name: "Ada", seed: 9, locale: "fr" });
    // Structure identical, prose differs across languages.
    expect(es.themes.length).toBe(en.themes.length);
    expect(es.operatingManual).toHaveLength(7);
    expect(es.headline).not.toBe(en.headline);
    expect(fr.headline).not.toBe(en.headline);
    expect(es.operatingManual[0].label).not.toBe(en.operatingManual[0].label);
    expect(es.overview.join(" ")).not.toBe(en.overview.join(" "));
    // English headline keeps the "The … " composition; es/fr don't.
    expect(en.headline.startsWith("The ")).toBe(true);
    expect(es.headline.startsWith("The ")).toBe(false);
    if (es.themes.length) expect(es.themes[0].name).not.toBe(en.themes[0].name);
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

describe("instrument localization", () => {
  it("translates Big Five content while preserving ids, keying, and scores", () => {
    const es = localizeInstrument(bigFive, "es");
    expect(es.name).toContain("Cinco Grandes");
    expect(es.items.length).toBe(bigFive.items.length);
    // ids, scales, and keying are preserved (scoring is language-agnostic)
    for (let i = 0; i < bigFive.items.length; i++) {
      expect(es.items[i].id).toBe(bigFive.items[i].id);
      expect(es.items[i].scale).toBe(bigFive.items[i].scale);
      expect(es.items[i].keyed).toBe(bigFive.items[i].keyed);
      expect(es.items[i].text).not.toBe(bigFive.items[i].text); // actually translated
    }
    // identical answers score identically in either language
    const ans = allHigh(bigFive);
    const en = scoreAssessment(bigFive, ans);
    const esScored = scoreAssessment(es, ans);
    expect(esScored.scales.E.mean).toBeCloseTo(en.scales.E.mean, 5);
    expect(es.scales.find((s) => s.id === "O")!.name).toBe("Apertura a la experiencia");
  });

  it("falls back to the original for unsupported locales", () => {
    expect(localizeInstrument(bigFive, "en")).toBe(bigFive); // English is the source
    expect(localizeInstrument(via, "de")).toBe(via); // no German translation → original returned
  });

  it("translates DISC (es/fr) while preserving ids and type resolution", () => {
    for (const loc of ["es", "fr"]) {
      const d = localizeInstrument(disc, loc);
      expect(d.name).not.toBe(disc.name);
      expect(d.items.length).toBe(disc.items.length);
      expect(d.items.every((it, i) => it.id === disc.items[i].id && it.scale === disc.items[i].scale)).toBe(true);
      // typological resolution still works (resolveType is preserved)
      const res = scoreAssessment(d, allHigh(disc));
      expect(res.type).toBeTruthy();
      expect(res.type!.code.length).toBeGreaterThan(0);
    }
  });

  it("translates the Enneagram (es/fr) while preserving ids and type resolution", () => {
    for (const loc of ["es", "fr"]) {
      const e = localizeInstrument(enneagram, loc);
      expect(e.name).not.toBe(enneagram.name);
      expect(e.items.length).toBe(enneagram.items.length);
      expect(e.items.every((it, i) => it.id === enneagram.items[i].id && it.scale === enneagram.items[i].scale)).toBe(true);
      expect(e.scales.every((s, i) => s.id === enneagram.scales[i].id)).toBe(true);
      // every item text is actually translated away from English
      expect(e.items.every((it, i) => it.text !== enneagram.items[i].text)).toBe(true);
      // typological resolution still works (resolveType is preserved)
      const res = scoreAssessment(e, answerAll(enneagram, (it) => (it.scale === "T5" ? 5 : 1)));
      expect(res.type).toBeTruthy();
      expect(res.type!.code.length).toBeGreaterThan(0);
    }
  });

  it("localizes the DISC and Enneagram type cards while keeping the canonical code stable", () => {
    // DISC: drive Dominance high → "The Driver" / "El Impulsor" / "Le Meneur"
    const discAns = answerAll(disc, (i) => (i.scale === "D" ? 5 : 1));
    const enTitle = scoreAssessment(disc, discAns).type!.title;
    expect(enTitle).toBe("The Driver");
    const dEs = scoreAssessment(localizeInstrument(disc, "es"), discAns).type!;
    expect(dEs.title).toBe("El Impulsor");
    expect(dEs.components.some((c) => c.label === "Estilo principal")).toBe(true);
    const dFr = scoreAssessment(localizeInstrument(disc, "fr"), discAns).type!;
    expect(dFr.title).toBe("Le Meneur");
    expect(dFr.components.some((c) => c.label === "Style principal")).toBe(true);

    // Enneagram: drive Type 5 high → localized title + label, identical code across locales
    const enneaAns = answerAll(enneagram, (it) => (it.scale === "T5" ? 5 : 1));
    const baseCode = scoreAssessment(enneagram, enneaAns).type!.code;
    const eEs = scoreAssessment(localizeInstrument(enneagram, "es"), enneaAns).type!;
    expect(eEs.title.startsWith("Tipo 5")).toBe(true);
    expect(eEs.title).toContain("Investigador");
    expect(eEs.code).toBe(baseCode); // canonical code is language-agnostic
    expect(eEs.components.some((c) => c.label === "Centro de inteligencia")).toBe(true);
    const eFr = scoreAssessment(localizeInstrument(enneagram, "fr"), enneaAns).type!;
    expect(eFr.title.startsWith("Type 5")).toBe(true);
    expect(eFr.title).toContain("Investigateur");
    expect(eFr.code).toBe(baseCode);

    // Jung: all-high resolves to ENFJ; title + component labels + function stack localize, code stable
    const jAns = allHigh(jungTypes);
    expect(scoreAssessment(jungTypes, jAns).type!.title).toBe("The Teacher");
    const jEs = scoreAssessment(localizeInstrument(jungTypes, "es"), jAns).type!;
    expect(jEs.code).toBe("ENFJ");
    expect(jEs.title).toBe("El Maestro");
    expect(jEs.components.some((c) => c.label === "Energía")).toBe(true);
    expect(jEs.components.find((c) => c.label === "Pila de funciones cognitivas")!.value).toContain("Sentimiento extravertido");
    const jFr = scoreAssessment(localizeInstrument(jungTypes, "fr"), jAns).type!;
    expect(jFr.code).toBe("ENFJ");
    expect(jFr.title).toBe("Le Mentor");
    expect(jFr.components.some((c) => c.label === "Énergie")).toBe(true);
  });

  it("translates the wellbeing + HEXACO + Dark Triad + Optimism/Hope/Curiosity sets (es/fr) preserving ids, keying, scale ids, and scores", () => {
    for (const inst of [perma, lifeSatisfaction, resilience, selfEsteem, mood, hexaco, darkTriad, optimism, hope, curiosity]) {
      for (const loc of ["es", "fr"]) {
        const t = localizeInstrument(inst, loc);
        expect(t.name).not.toBe(inst.name);
        expect(t.items.length).toBe(inst.items.length);
        // ids/scale/keying preserved (scoring is language-agnostic), and text actually translated
        expect(t.items.every((it, i) => it.id === inst.items[i].id && it.scale === inst.items[i].scale && it.keyed === inst.items[i].keyed)).toBe(true);
        expect(t.scales.every((s, i) => s.id === inst.scales[i].id)).toBe(true);
        expect(t.items.every((it, i) => it.text !== inst.items[i].text)).toBe(true);
        // identical answers score identically in either language
        const ans = allHigh(inst);
        const en = scoreAssessment(inst, ans);
        const loc2 = scoreAssessment(t, ans);
        for (const sid of Object.keys(en.scales)) expect(loc2.scales[sid].mean).toBeCloseTo(en.scales[sid].mean, 5);
      }
    }
  });
});

describe("report localization", () => {
  it("composes report prose in es/fr — deterministic, and distinct from English", () => {
    const ans = allHigh(disc);
    const esInst = localizeInstrument(disc, "es");
    const rEs = composeReport(esInst, scoreAssessment(esInst, ans), { seed: 7, locale: "es" });
    const rEn = composeReport(disc, scoreAssessment(disc, ans), { seed: 7, locale: "en" });
    // localized uniqueness note + a localized trait opener (percentile phrasing)
    expect(rEs.uniqueness.note).toContain("semilla");
    expect(rEn.uniqueness.note).toContain("generation seed");
    expect(rEs.traits.some((t) => /percentil/.test(t.narrative))).toBe(true);
    // the prose genuinely differs from English
    expect(rEs.overview.join(" ")).not.toBe(rEn.overview.join(" "));
    // deterministic: same seed + locale reproduces byte-for-byte
    const rEs2 = composeReport(esInst, scoreAssessment(esInst, ans), { seed: 7, locale: "es" });
    expect(rEs2.overview.join(" ")).toBe(rEs.overview.join(" "));
    expect(rEs2.sections.map((s) => s.heading).join("|")).toBe(rEs.sections.map((s) => s.heading).join("|"));
  });

  it("localizes a dimensional wellbeing report (fr) including trait openers and headings", () => {
    const frInst = localizeInstrument(perma, "fr");
    const r = composeReport(frInst, scoreAssessment(frInst, allHigh(perma)), { seed: 3, locale: "fr" });
    expect(r.uniqueness.note).toContain("graine");
    expect(r.traits.some((t) => /centile/.test(t.narrative))).toBe(true);
    // generic headline is localized ("Votre portrait de …")
    expect(/portrait/i.test(r.title)).toBe(true);
  });

  it("leaves English reports unchanged when no locale is given", () => {
    const r = composeReport(disc, scoreAssessment(disc, allHigh(disc)), { seed: 1 });
    expect(r.uniqueness.note).toContain("generation seed");
    expect(r.traits.some((t) => /percentile/.test(t.narrative))).toBe(true);
  });

  it("localizes the Big Five concrete color and dynamics banks (es/fr)", () => {
    const en = composeReport(bigFive, scoreAssessment(bigFive, allHigh(bigFive)), { seed: 5, locale: "en" });
    expect(en.dynamics.join(" ")).toMatch(/Openness|Extraversion|Conscientiousness/);
    const enProse = en.traits.map((t) => t.narrative).join(" ");

    const esInst = localizeInstrument(bigFive, "es");
    const rEs = composeReport(esInst, scoreAssessment(esInst, allHigh(bigFive)), { seed: 5, locale: "es" });
    expect(rEs.dynamics.join(" ")).toMatch(/Apertura|Extraversión|Responsabilidad/);
    expect(rEs.traits.map((t) => t.narrative).join(" ")).not.toBe(enProse);

    const frInst = localizeInstrument(bigFive, "fr");
    const rFr = composeReport(frInst, scoreAssessment(frInst, allHigh(bigFive)), { seed: 5, locale: "fr" });
    expect(rFr.dynamics.join(" ")).toMatch(/Ouverture|Agréabilité|Névrosisme/);
    expect(rFr.traits.map((t) => t.narrative).join(" ")).not.toBe(enProse);
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
    expect(area?.steps.length).toBeGreaterThan(0); // maintenance now carries protect-the-strength steps
  });

  it("produces substantive, evidence-backed plans for instruments without a hand-written bank", () => {
    const res = scoreAssessment(disc, answerAll(disc, (i) => (i.scale === "D" ? 5 : 1)));
    const plan = buildGrowthPlan(disc, res, suggestTargets(disc, res), { seed: 2 });
    const moving = plan.areas.filter((a) => a.direction !== "maintain");
    expect(moving.length).toBeGreaterThan(0);
    for (const a of moving) {
      expect(a.steps.length).toBeGreaterThanOrEqual(3); // not a 2-step stub
      expect(a.steps.every((s) => s.detail.length > 20 && Boolean(s.evidence))).toBe(true);
    }
  });

  it("grows wellbeing toward flourishing with domain-specific interventions", () => {
    const res = scoreAssessment(perma, answerAll(perma, () => 3)); // mid wellbeing
    const targets = suggestTargets(perma, res);
    // every pillar is nudged upward, not toward the midpoint
    expect(targets.every((t) => t.target >= res.scales[t.scaleId].normalized)).toBe(true);
    const plan = buildGrowthPlan(perma, res, targets, { seed: 4 });
    const pos = plan.areas.find((a) => a.scaleId === "POS");
    expect(pos?.direction).toBe("increase");
    // pulls the hand-written positive-psychology bank, not the generic fallback
    expect(pos?.steps.some((s) => /gratitude|savor|lifts you/i.test(s.title + s.detail))).toBe(true);
  });
});

describe("multiple-choice (choice-format) scoring", () => {
  it("scores VARK by tallying the chosen channel, not Likert agreement", () => {
    expect(vark.format).toBe("choice");
    expect(vark.items.every((i) => i.options && i.options.length === 4)).toBe(true);
    // Pick the Visual option (index 0) on every question.
    const allVisual: ResponseMap = Object.fromEntries(vark.items.map((i) => [i.id, 0]));
    const res = scoreAssessment(vark, allVisual);
    // localized: options translate, canonical code stays English, type card localizes
    const esV = localizeInstrument(vark, "es");
    expect(esV.items[0].options![0].text).not.toBe(vark.items[0].options![0].text);
    expect(esV.items[0].options!.map((o) => o.scale)).toEqual(vark.items[0].options!.map((o) => o.scale));
    const esVType = scoreAssessment(esV, allVisual).type!;
    expect(esVType.code).toBe("Visual");
    expect(esVType.title).toBe("El Visualizador");
    expect(scoreAssessment(localizeInstrument(vark, "fr"), allVisual).type!.title).toBe("Le Visualiseur");
    expect(res.scales.VIS.normalized).toBe(100);
    expect(res.scales.AUR.normalized).toBe(0);
    expect(res.type?.code).toBe("Visual");
    // An even spread across all four channels resolves to multimodal.
    const spread: ResponseMap = Object.fromEntries(vark.items.map((i, idx) => [i.id, idx % 4]));
    expect(scoreAssessment(vark, spread).type?.code).toBe("Multimodal");
  });

  it("scores forced-choice bipolar instruments by axis position (Keirsey, Kolb)", () => {
    expect(keirsey.format).toBe("choice");
    expect(kolb.format).toBe("choice");
    // Keirsey: picking the high pole (index 0) on every pair → abstract + utilitarian → Rational (NT)
    const kAllHi = Object.fromEntries(keirsey.items.map((i) => [i.id, 0]));
    const kHi = scoreAssessment(keirsey, kAllHi);
    expect(kHi.scales.COMM.normalized).toBe(100);
    expect(kHi.scales.ACT.normalized).toBe(100);
    expect(kHi.type?.code).toBe("NT");
    // localized: code stays canonical (NT); title + option text translate
    const esKr = localizeInstrument(keirsey, "es");
    expect(esKr.items[0].options![0].text).not.toBe(keirsey.items[0].options![0].text);
    const esKrType = scoreAssessment(esKr, kAllHi).type!;
    expect(esKrType.code).toBe("NT");
    expect(esKrType.title).toBe("El Racional");
    expect(scoreAssessment(localizeInstrument(keirsey, "fr"), kAllHi).type!.title).toBe("Le Rationnel");
    // picking the low pole (index 1) everywhere → concrete + cooperative → Guardian (SJ)
    const kLo = scoreAssessment(keirsey, Object.fromEntries(keirsey.items.map((i) => [i.id, 1])));
    expect(kLo.scales.COMM.normalized).toBe(0);
    expect(kLo.type?.code).toBe("SJ");
    // Kolb: all high → abstract + active → Converging; all low → concrete + reflective → Diverging
    const kolbHi = Object.fromEntries(kolb.items.map((i) => [i.id, 0]));
    expect(scoreAssessment(kolb, kolbHi).type?.code).toBe("Converging");
    expect(scoreAssessment(kolb, Object.fromEntries(kolb.items.map((i) => [i.id, 1]))).type?.code).toBe("Diverging");
    // localized: forced-choice options translate, code stays canonical, title localizes
    const esK = localizeInstrument(kolb, "es");
    expect(esK.items[0].options![0].text).not.toBe(kolb.items[0].options![0].text);
    expect(esK.items[0].options!.map((o) => o.keyed)).toEqual(kolb.items[0].options!.map((o) => o.keyed));
    const esKType = scoreAssessment(esK, kolbHi).type!;
    expect(esKType.code).toBe("Converging");
    expect(esKType.title).toBe("El Convergente");
    expect(scoreAssessment(localizeInstrument(kolb, "fr"), kolbHi).type!.title).toBe("Le Convergent");
  });
});

describe("every catalog instrument is structurally sound", () => {
  for (const inst of INSTRUMENTS) {
    it(`${inst.id}: keys, scores, resolves, and composes`, () => {
      // unique item ids
      const ids = new Set(inst.items.map((i) => i.id));
      expect(ids.size).toBe(inst.items.length);
      // every item loads on a defined scale; every scale has ≥2 items
      const scaleIds = new Set(inst.scales.map((s) => s.id));
      for (const it of inst.items) expect(scaleIds.has(it.scale)).toBe(true);
      for (const s of inst.scales) {
        expect(inst.items.filter((i) => i.scale === s.id).length).toBeGreaterThanOrEqual(2);
      }

      // scoring yields exactly one in-range score per scale
      const res = scoreAssessment(inst, allHigh(inst));
      expect(Object.keys(res.scales).length).toBe(inst.scales.length);
      for (const s of Object.values(res.scales)) {
        expect(s.normalized).toBeGreaterThanOrEqual(0);
        expect(s.normalized).toBeLessThanOrEqual(100);
        expect(s.percentile).toBeGreaterThanOrEqual(0);
        expect(s.percentile).toBeLessThanOrEqual(100);
      }

      // typological instruments resolve a valid, well-formed type
      if (inst.kind === "typological") {
        expect(res.type).toBeTruthy();
        expect(typeof res.type!.code).toBe("string");
        expect(res.type!.code.length).toBeGreaterThan(0);
        expect(res.type!.confidence).toBeGreaterThanOrEqual(0);
        expect(res.type!.confidence).toBeLessThanOrEqual(1);
        expect(res.type!.components.length).toBeGreaterThan(0);
      }

      // a report composes with at least one trait (large instruments show a subset)
      const rep = composeReport(inst, res, { seed: 7 });
      expect(rep.traits.length).toBeGreaterThan(0);
      expect(rep.traits.length).toBeLessThanOrEqual(inst.scales.length);
      expect(rep.overview.length).toBeGreaterThan(0);
    });
  }
});

describe("recommendation engine", () => {
  const entry = (inst: Instrument, resp: ResponseMap): SynthEntry => ({ instrument: inst, result: scoreAssessment(inst, resp) });
  // High on one Big Five factor, neutral elsewhere.
  const bfFactor = (scale: string) => entry(bigFive, answerAll(bigFive, (it) => (it.scale === scale ? (it.keyed === 1 ? 5 : 1) : 3)));
  const bfLow = (scale: string) => entry(bigFive, answerAll(bigFive, (it) => (it.scale === scale ? (it.keyed === 1 ? 1 : 5) : 3)));

  it("starts a brand-new visitor on the Big Five foundation", () => {
    const recs = recommendNext([], {});
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].instrument.id).toBe("big-five-ipip50");
    expect(recs[0].kind).toBe("foundation");
    expect(recs[0].reason.length).toBeGreaterThan(10);
  });

  it("never recommends an instrument the user already completed", () => {
    const recs = recommendNext([bfFactor("O")], {});
    expect(recs.every((r) => r.instrument.id !== "big-five-ipip50")).toBe(true);
  });

  it("deepens high Openness toward the thinking-style scales", () => {
    const recs = recommendNext([bfFactor("O")], { limit: 8 });
    const ids = recs.map((r) => r.instrument.id);
    expect(ids).toContain("need-for-cognition");
    const nfc = recs.find((r) => r.instrument.id === "need-for-cognition")!;
    expect(nfc.kind).toBe("deepen");
  });

  it("routes high Neuroticism to supportive wellbeing tools", () => {
    const recs = recommendNext([bfFactor("N")], { limit: 8 });
    expect(recs.some((r) => r.kind === "support")).toBe(true);
  });

  it("offers low-Conscientiousness users a self-control deep dive", () => {
    const recs = recommendNext([bfLow("C")], { limit: 8 });
    expect(recs.map((r) => r.instrument.id)).toContain("self-control-bscs");
  });

  it("pairs the Big Five with HEXACO", () => {
    const recs = recommendNext([bfFactor("O")], { limit: 8 });
    const hex = recs.find((r) => r.instrument.id === "hexaco-24");
    expect(hex).toBeTruthy();
    expect(hex!.kind === "pairing" || hex!.kind === "explore").toBe(true);
  });

  it("respects the limit and returns localized, well-formed reasons", () => {
    const recs = recommendNext([bfFactor("O")], { limit: 3, locale: "es" });
    expect(recs.length).toBeLessThanOrEqual(3);
    for (const r of recs) {
      expect(r.reason.trim().length).toBeGreaterThan(8);
      expect(r.badge.trim().length).toBeGreaterThan(0);
      expect(r.score).toBeGreaterThan(0);
    }
  });

  it("recommends a triangulating cross-check for a singly-measured trait", () => {
    const eysenck = INSTRUMENTS.find((i) => i.id === "eysenck-pen")!;
    const recs = recommendNext([{ instrument: eysenck, result: scoreAssessment(eysenck, allHigh(eysenck)) }], { limit: 12 });
    expect(recs.some((r) => r.kind === "triangulate")).toBe(true);
  });

  it("is deterministic for identical inputs", () => {
    const a = recommendNext([bfFactor("O")], { seed: 42 });
    const b = recommendNext([bfFactor("O")], { seed: 42 });
    expect(a.map((r) => r.instrument.id)).toEqual(b.map((r) => r.instrument.id));
  });

  it("nudges the missing communication tests once the portrait is started", () => {
    const conflict = INSTRUMENTS.find((i) => i.id === "conflict-style")!;
    const recs = recommendNext([{ instrument: conflict, result: scoreAssessment(conflict, allHigh(conflict)) }], { limit: 16 });
    const portrait = recs.filter((r) => r.kind === "portrait");
    expect(portrait.length).toBeGreaterThan(0);
    // it should nudge the comm tests not yet taken, never the one already done
    expect(portrait.map((r) => r.instrument.id)).toContain("communication-style");
    expect(portrait.every((r) => r.instrument.id !== "conflict-style")).toBe(true);
    // and the reason names the progress
    expect(portrait[0].reason.toLowerCase()).toMatch(/communication|portrait/);
  });

  it("localizes reasons differently across languages", () => {
    const en = recommendNext([bfFactor("O")], { seed: 1, locale: "en" });
    const fr = recommendNext([bfFactor("O")], { seed: 1, locale: "fr" });
    const enNfc = en.find((r) => r.instrument.id === "need-for-cognition")!;
    const frNfc = fr.find((r) => r.instrument.id === "need-for-cognition")!;
    expect(enNfc.reason).not.toBe(frNfc.reason);
  });
});

describe("relevance note (personalized intro)", () => {
  const bfHighO = { instrument: bigFive, result: scoreAssessment(bigFive, answerAll(bigFive, (it) => (it.scale === "O" ? (it.keyed === 1 ? 5 : 1) : 3))) };

  it("is null for first-time visitors", () => {
    expect(relevanceNote(hexaco, [], {})).toBeNull();
  });

  it("explains a trait-driven match in the user's terms", () => {
    const note = relevanceNote(needForCognition, [bfHighO], {});
    expect(note).toBeTruthy();
    expect(note!.length).toBeGreaterThan(15);
  });

  it("explains a flagship pairing (Big Five → HEXACO)", () => {
    const note = relevanceNote(hexaco, [bfHighO], { locale: "fr" });
    expect(note).toBeTruthy();
  });

  it("falls back to a warm journey note for unrelated tests", () => {
    const note = relevanceNote(vark, [bfHighO], {});
    expect(note).toBeTruthy();
    expect(note).toContain("1");
  });

  it("returns null for an already-completed instrument", () => {
    expect(relevanceNote(bigFive, [bfHighO], {})).toBeNull();
  });
});

describe("daily nudge engine", () => {
  const vivid = () => [{ instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) }];
  const day = new Date("2026-06-09T10:00:00Z");

  it("returns null with no history", () => {
    expect(dailyNudge([], {})).toBeNull();
  });

  it("composes a trait-anchored nudge with all parts present", () => {
    const n = dailyNudge(vivid(), { date: day })!;
    expect(n.eyebrow).toContain("Today");
    expect(n.title.length).toBeGreaterThan(8);
    expect(n.line.length).toBeGreaterThan(30);
    expect(n.practice.length).toBeGreaterThan(10);
    expect(n.title).not.toContain("{trait}");
    expect(n.line).not.toContain("{desc}");
  });

  it("is stable within a day and changes across days", () => {
    const a = dailyNudge(vivid(), { date: day })!;
    const b = dailyNudge(vivid(), { date: day })!;
    expect(a).toEqual(b);
    const days = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const d = new Date(day.getTime() + i * 86400000);
      days.add(dailyNudge(vivid(), { date: d })!.title + dailyNudge(vivid(), { date: d })!.practice);
    }
    expect(days.size).toBeGreaterThan(2);
  });

  it("keeps the same selection across languages, with translated wording", () => {
    const en = dailyNudge(vivid(), { date: day, locale: "en" })!;
    const fr = dailyNudge(vivid(), { date: day, locale: "fr" })!;
    expect(fr.eyebrow).toContain("Aujourd'hui");
    expect(fr.title).not.toBe(en.title);
    expect(fr.practiceLabel).toBe("Une petite pratique");
  });

  it("falls back to the steady-center message for balanced profiles", () => {
    const mid = { instrument: bigFive, result: scoreAssessment(bigFive, answerAll(bigFive, () => 3)) };
    const n = dailyNudge([mid], { date: day })!;
    expect(n.title).toBe("Your steady center");
  });
});

describe("category localization", () => {
  it("translates every category for es and fr, and falls back for unknown locales", async () => {
    const { CATEGORIES } = await import("./categories");
    const { localizeCategory } = await import("./categories.i18n");
    for (const c of CATEGORIES) {
      for (const L of ["es", "fr"] as const) {
        const lc = localizeCategory(c, L);
        expect(lc.name.length).toBeGreaterThan(2);
        expect(lc.blurb.length).toBeGreaterThan(10);
        expect(lc.name).not.toBe(c.name);
      }
      expect(localizeCategory(c, "de")).toBe(c);
      expect(localizeCategory(c, "en")).toBe(c);
    }
  });
});

describe("standout traits helper", () => {
  it("localizes trait names through the instrument layer", () => {
    const e = [{ instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) }];
    const en = standoutTraits(e, { locale: "en" });
    const es = standoutTraits(e, { locale: "es" });
    expect(en.length).toBeGreaterThan(0);
    expect(es.length).toBe(en.length);
    expect(es.map((p) => p.name)).not.toEqual(en.map((p) => p.name));
  });
});

describe("personalized roadmap", () => {
  it("maps multilingual focus labels to canonical goal keys", () => {
    expect(goalKeys(["Better relationships"])).toEqual(["relationships"]);
    expect(goalKeys(["Career & work"])).toEqual(["career"]);
    expect(goalKeys(["Bienestar emocional"])).toEqual(["wellbeing"]);
    expect(goalKeys([])).toEqual(["self"]);
    expect(goalKeys(["Understand myself", "Career & work"])).toEqual(["self", "career"]);
  });

  it("always opens with the Big Five foundation", () => {
    const r = buildRoadmap([], ["Better relationships"], {});
    expect(r.steps[0].instrumentId).toBe("big-five-ipip50");
    expect(r.steps[0].current).toBe(true);
    expect(r.pct).toBe(0);
  });

  it("includes goal-relevant instruments for the chosen focus", () => {
    const ids = buildRoadmap([], ["Better relationships"], {}).steps.map((s) => s.instrumentId);
    expect(ids).toContain("attachment-styles");
  });

  it("tracks progress and advances the current step as tests complete", () => {
    const e = [{ instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) }];
    const r = buildRoadmap(e, ["Understand myself"], {});
    expect(r.steps[0].done).toBe(true);
    expect(r.steps[0].current).toBe(false);
    expect(r.doneCount).toBe(1);
    expect(r.pct).toBeGreaterThan(0);
    expect(r.nextStep).toBeTruthy();
    expect(r.nextStep!.done).toBe(false);
  });

  it("respects the length cap and localizes step names + reasons", () => {
    const r = buildRoadmap([], ["Understand myself"], { locale: "fr", length: 5 });
    expect(r.steps.length).toBeLessThanOrEqual(5);
    expect(r.total).toBe(r.steps.length);
    for (const s of r.steps) {
      expect(s.reason.trim().length).toBeGreaterThan(8);
      expect(s.name.trim().length).toBeGreaterThan(1);
    }
  });
});

describe("new focused instruments", () => {
  it("scores Self-Efficacy as a single dimension", () => {
    const inst = INSTRUMENTS.find((i) => i.id === "self-efficacy-gse")!;
    expect(inst).toBeTruthy();
    const res = scoreAssessment(inst, allHigh(inst));
    expect(Object.keys(res.scales)).toHaveLength(1);
    expect(res.scales.GSE.level).toBe("very high");
  });

  it("scores Emotion Regulation across reappraisal and suppression", () => {
    const inst = INSTRUMENTS.find((i) => i.id === "emotion-regulation-erq")!;
    expect(inst).toBeTruthy();
    const res = scoreAssessment(inst, allHigh(inst));
    expect(Object.keys(res.scales).sort()).toEqual(["REAP", "SUPP"]);
  });

  it("threads the new instruments into goal roadmaps", () => {
    expect(buildRoadmap([], ["Grow & improve"], { length: 8 }).steps.map((s) => s.instrumentId)).toContain("self-efficacy-gse");
    expect(buildRoadmap([], ["Emotional wellbeing"], { length: 8 }).steps.map((s) => s.instrumentId)).toContain("emotion-regulation-erq");
  });

  it("scores the communication & conflict instruments across their full scale set", () => {
    const couple = INSTRUMENTS.find((i) => i.id === "couple-communication")!;
    expect(Object.keys(scoreAssessment(couple, allHigh(couple)).scales).sort()).toEqual(["CONSTR", "DEMWD", "GENTLE", "HORSE", "REPAIR", "RESPOND"]);
    const team = INSTRUMENTS.find((i) => i.id === "team-communication")!;
    expect(Object.keys(scoreAssessment(team, allHigh(team)).scales).sort()).toEqual(["COORD", "FRICTION", "OPEN", "RESOLVE", "SAFETY", "TASK"]);
    const style = INSTRUMENTS.find((i) => i.id === "communication-style")!;
    expect(Object.keys(scoreAssessment(style, allHigh(style)).scales).sort()).toEqual(["ASSERT", "COLLAB", "EMPATH", "ENGAGE", "LISTEN", "REGUL"]);
    // all three live in the new Communication & Conflict category, alongside conflict-style
    for (const id of ["couple-communication", "team-communication", "communication-style", "conflict-style"]) {
      expect(INSTRUMENTS.find((i) => i.id === id)!.category).toBe("communication");
    }
  });
});

describe("procrastination / perfectionism / gratitude", () => {
  const get = (id: string) => INSTRUMENTS.find((i) => i.id === id)!;
  it("are fully localized into es/fr (taglines, scales, and items)", () => {
    for (const id of ["procrastination-pps", "perfectionism-2f", "gratitude-gq6", "self-efficacy-gse", "emotion-regulation-erq", "self-control-bscs", "eysenck-pen", "perceived-stress", "worry-checkin", "zkpq-alt5", "tci-cloninger", "sensation-seeking", "panas-affect", "ryff-wellbeing", "burnout-mbi", "locus-of-control", "self-monitoring", "moral-foundations", "big-five-aspects", "career-derailers", "pid5-maladaptive", "rokeach-values", "schwartz-values", "sixteen-pf", "attachment-styles", "love-languages", "conflict-style", "kolb-learning", "vark-learning", "chronotype", "four-temperaments", "color-styles", "keirsey-temperaments", "leadership-styles", "mcclelland-needs", "career-anchors", "coping-styles", "adhd-traits", "autism-traits", "dark-tetrad-18", "socionics-16", "via-24", "couple-communication", "team-communication", "communication-style", "money-scripts", "self-compassion-scs", "time-perspective-ztpi"]) {
      const inst = get(id);
      const es = localizeInstrument(inst, "es");
      const fr = localizeInstrument(inst, "fr");
      // Taglines + items are reliably different (names can be cognates like "Gratitude").
      expect(es.tagline).not.toBe(inst.tagline);
      expect(fr.tagline).not.toBe(inst.tagline);
      expect(es.items[0].text).not.toBe(inst.items[0].text);
      expect(fr.items[0].text).not.toBe(inst.items[0].text);
      // Scale name OR description must change — some scale names are true cognates
      // (e.g. VARK "Visual"), so a translated description still proves localization.
      expect(es.scales[0].name !== inst.scales[0].name || es.scales[0].description !== inst.scales[0].description).toBe(true);
    }
  });

  it("localizes the VIA signature-strength card while keeping the canonical strength code", () => {
    const viaInst = get("via-24");
    const ans = answerAll(viaInst, (it) => (it.scale === "CREAT" ? 5 : 1)); // Creativity on top
    const en = scoreAssessment(viaInst, ans).type!;
    expect(en.code).toBe("Creativity");
    const es = scoreAssessment(localizeInstrument(viaInst, "es"), ans).type!;
    expect(es.code).toBe("Creativity"); // canonical, language-agnostic
    expect(es.title).toContain("Creatividad");
    expect(es.components.some((c) => c.label === "Virtud principal")).toBe(true);
    const fr = scoreAssessment(localizeInstrument(viaInst, "fr"), ans).type!;
    expect(fr.title).toContain("Créativité");
  });

  it("score and expose the expected scales", () => {
    expect(Object.keys(scoreAssessment(get("procrastination-pps"), allHigh(get("procrastination-pps"))).scales)).toEqual(["PROC"]);
    expect(Object.keys(scoreAssessment(get("perfectionism-2f"), allHigh(get("perfectionism-2f"))).scales).sort()).toEqual(["CONC", "STAND"]);
    expect(Object.keys(scoreAssessment(get("gratitude-gq6"), allHigh(get("gratitude-gq6"))).scales)).toEqual(["GRAT"]);
  });

  it("procrastination cross-checks Conscientiousness (inverse) with the Big Five", () => {
    const bf = { instrument: bigFive, result: scoreAssessment(bigFive, answerAll(bigFive, (it) => (it.scale === "C" ? (it.keyed === 1 ? 5 : 1) : 3))) };
    const proc = get("procrastination-pps");
    // High procrastination → low conscientiousness; pair with high-C Big Five → divergence.
    const pr = { instrument: proc, result: scoreAssessment(proc, answerAll(proc, (it) => (it.keyed === 1 ? 5 : 1))) };
    const ext = analyzeConvergence([bf, pr], {}).readings.find((r) => r.id === "conscientiousness")!;
    expect(ext).toBeTruthy();
    expect(ext.sources.length).toBe(2);
  });
});

describe("money scripts (Klontz)", () => {
  const money = INSTRUMENTS.find((i) => i.id === "money-scripts")!;

  it("scores all four scripts and resolves the dominant one", () => {
    expect(Object.keys(scoreAssessment(money, allHigh(money)).scales).sort()).toEqual(["AVOID", "STATUS", "VIGIL", "WORSHIP"]);
    // Drive Money Avoidance to the top (every item is keyed +1).
    const avoidant = answerAll(money, (it) => (it.scale === "AVOID" ? 5 : 1));
    const t = scoreAssessment(money, avoidant).type!;
    expect(t.code).toBe("Money Avoidance");
    expect(t.title).toBe("The Avoider");
    expect(t.components.some((c) => c.label === "Dominant script")).toBe(true);
    expect(t.components.find((c) => c.label === "Full ranking")!.value).toContain("›"); // ranks all four
  });

  it("keeps the canonical script code while localizing the result card (es/fr)", () => {
    const avoidant = answerAll(money, (it) => (it.scale === "AVOID" ? 5 : 1));
    const es = scoreAssessment(localizeInstrument(money, "es"), avoidant).type!;
    expect(es.code).toBe("Money Avoidance"); // canonical, language-agnostic
    expect(es.title).toBe("El Evitador");
    expect(es.components.some((c) => c.label === "Guion dominante")).toBe(true);
    const fr = scoreAssessment(localizeInstrument(money, "fr"), avoidant).type!;
    expect(fr.code).toBe("Money Avoidance");
    expect(fr.title).toBe("L'Évitant");
  });
});

describe("self-compassion (Neff)", () => {
  const scs = INSTRUMENTS.find((i) => i.id === "self-compassion-scs")!;
  const POS = ["SK", "CH", "MI"]; // the warmer three; the other three are their harsher opposites

  it("scores six facets and bands the composite from warm to harsh", () => {
    expect(Object.keys(scoreAssessment(scs, allHigh(scs)).scales).sort()).toEqual(["CH", "IS", "MI", "OI", "SJ", "SK"]);
    // Warmer three high, harsher three low → strongly self-compassionate.
    const warm = answerAll(scs, (it) => (POS.includes(it.scale) ? 5 : 1));
    const t = scoreAssessment(scs, warm).type!;
    expect(t.code).toBe("Self-Compassionate");
    expect(t.title).toBe("A Warm Inner Voice");
    expect(t.components.some((c) => c.label === "Greatest strength")).toBe(true);
    expect(t.components.find((c) => c.label === "Overall self-compassion")!.value).toBe("100/100");
    // Flip every facet → a harsh inner critic.
    const harsh = answerAll(scs, (it) => (POS.includes(it.scale) ? 1 : 5));
    const h = scoreAssessment(scs, harsh).type!;
    expect(h.code).toBe("Self-Critical");
    expect(h.title).toBe("A Harsh Inner Critic");
  });

  it("keeps the canonical band code while localizing the result card (es/fr)", () => {
    const warm = answerAll(scs, (it) => (POS.includes(it.scale) ? 5 : 1));
    const es = scoreAssessment(localizeInstrument(scs, "es"), warm).type!;
    expect(es.code).toBe("Self-Compassionate"); // canonical, language-agnostic
    expect(es.title).toBe("Una voz interior cálida");
    expect(es.components.some((c) => c.label === "Mayor fortaleza")).toBe(true);
    const fr = scoreAssessment(localizeInstrument(scs, "fr"), warm).type!;
    expect(fr.code).toBe("Self-Compassionate");
    expect(fr.title).toBe("Une voix intérieure bienveillante");
  });
});

describe("time perspective (Zimbardo)", () => {
  const time = INSTRUMENTS.find((i) => i.id === "time-perspective-ztpi")!;

  it("scores five frames and names the leading one", () => {
    expect(Object.keys(scoreAssessment(time, allHigh(time)).scales).sort()).toEqual(["FU", "PF", "PH", "PN", "PP"]);
    // Drive Future high, the rest low → a future-dominant profile.
    const future = answerAll(time, (it) => (it.scale === "FU" ? 5 : 1));
    const t = scoreAssessment(time, future).type!;
    expect(t.code).toBe("Future");
    expect(t.title).toBe("The Planner");
    expect(t.components.find((c) => c.label === "Full profile")!.value).toContain("›"); // ranks all five
  });

  it("recognizes a balanced time perspective as its own (healthiest) type", () => {
    // Answers chosen to sit near Zimbardo's balanced ideal: warm past, engaged present, planful future, low negativity.
    const target: Record<string, number> = { PP: 4, FU: 4, PH: 3, PN: 2, PF: 2 };
    const balanced = answerAll(time, (it) => target[it.scale] ?? 3);
    const t = scoreAssessment(time, balanced).type!;
    expect(t.code).toBe("Balanced Time Perspective");
    expect(t.title).toBe("The Time-Balanced");
    // canonical code stable across locales; title + balance label localize
    const es = scoreAssessment(localizeInstrument(time, "es"), balanced).type!;
    expect(es.code).toBe("Balanced Time Perspective");
    expect(es.title).toBe("El Equilibrado en el Tiempo");
    expect(es.components.some((c) => c.label === "Equilibrio temporal")).toBe(true);
    const fr = scoreAssessment(localizeInstrument(time, "fr"), balanced).type!;
    expect(fr.code).toBe("Balanced Time Perspective");
    expect(fr.title).toBe("L'Équilibré dans le Temps");
  });

  it("lets a future orientation triangulate Conscientiousness", () => {
    // Big Five high-C + time-perspective high-Future → both speak to conscientiousness.
    const highC = { instrument: bigFive, result: scoreAssessment(bigFive, answerAll(bigFive, (it) => (it.scale === "C" ? (it.keyed === 1 ? 5 : 1) : 3))) };
    const future = { instrument: time, result: scoreAssessment(time, answerAll(time, (it) => (it.scale === "FU" ? 5 : 1))) };
    const reading = analyzeConvergence([highC, future], {}).readings.find((r) => r.id === "conscientiousness")!;
    expect(reading).toBeTruthy();
    expect(reading.sources.some((s) => s.instrumentId === "time-perspective-ztpi")).toBe(true);
    expect(reading.position).toBeGreaterThan(60);
  });
});

describe("cross-test convergence", () => {
  const driveScale = (inst: Instrument, scale: string, high: boolean) =>
    ({ instrument: inst, result: scoreAssessment(inst, answerAll(inst, (it) => (it.scale === scale ? (it.keyed === 1 ? (high ? inst.responseFormat.max : inst.responseFormat.min) : (high ? inst.responseFormat.min : inst.responseFormat.max)) : Math.round((inst.responseFormat.min + inst.responseFormat.max) / 2)))) });

  it("needs at least two instruments to cross-check a construct", () => {
    const r = analyzeConvergence([{ instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) }], {});
    expect(r.readings).toHaveLength(0);
  });

  it("flags a high-confidence convergence when two tests agree", () => {
    const entries = [driveScale(bigFive, "E", true), driveScale(hexaco, "X", true)];
    const r = analyzeConvergence(entries, {});
    const ext = r.readings.find((x) => x.id === "extraversion")!;
    expect(ext).toBeTruthy();
    expect(ext.sources.length).toBe(2);
    expect(ext.position).toBeGreaterThan(60);
    expect(ext.convergent).toBe(true);
    expect(ext.agreement).toBeGreaterThan(0.66);
  });

  it("flags a divergence when two tests disagree about the same trait", () => {
    const entries = [driveScale(bigFive, "E", true), driveScale(hexaco, "X", false)];
    const r = analyzeConvergence(entries, {});
    const ext = r.readings.find((x) => x.id === "extraversion")!;
    expect(ext.divergent).toBe(true);
    expect(ext.agreement).toBeLessThan(0.5);
    expect(r.topDivergent?.id).toBe("extraversion");
  });

  it("localizes construct names and insights", () => {
    const entries = [driveScale(bigFive, "E", true), driveScale(hexaco, "X", true)];
    const en = analyzeConvergence(entries, { locale: "en" }).readings.find((x) => x.id === "extraversion")!;
    const fr = analyzeConvergence(entries, { locale: "fr" }).readings.find((x) => x.id === "extraversion")!;
    expect(en.name).toBe("Extraversion");
    expect(fr.insight).not.toBe(en.insight);
  });

  it("lets self-compassion triangulate emotional stability with the Big Five", () => {
    const scs = INSTRUMENTS.find((i) => i.id === "self-compassion-scs")!;
    // Big Five with low Neuroticism (steady) + self-compassion warm (low self-judgment/isolation/over-identification).
    const stableBf = { instrument: bigFive, result: scoreAssessment(bigFive, answerAll(bigFive, (it) => (it.scale === "N" ? (it.keyed === 1 ? 1 : 5) : 3))) };
    const warmScs = { instrument: scs, result: scoreAssessment(scs, answerAll(scs, (it) => (["SK", "CH", "MI"].includes(it.scale) ? 5 : 1))) };
    const reading = analyzeConvergence([stableBf, warmScs], {}).readings.find((r) => r.id === "stability")!;
    expect(reading).toBeTruthy();
    expect(reading.sources.length).toBe(2); // both instruments now speak to stability
    expect(reading.sources.some((s) => s.instrumentId === "self-compassion-scs")).toBe(true);
    expect(reading.position).toBeGreaterThan(60); // both read "steady"
    expect(reading.convergent).toBe(true);
  });

  it("picks a cross-validating target — a contradiction first, then a strong single-source read", () => {
    // Divergence: E high vs X low → Extraversion is contested; agent reaches for a fresh lens.
    const contested = [driveScale(bigFive, "E", true), driveScale(hexaco, "X", false)];
    const t1 = triangulationTarget(contested, {})!;
    expect(t1).toBeTruthy();
    expect(t1.constructId).toBe("extraversion");
    expect(t1.kind).toBe("divergent");
    expect(t1.instrumentId).toBe("eysenck-pen"); // first not-yet-taken Extraversion source
    // Localized construct name follows the locale.
    expect(triangulationTarget(contested, { locale: "fr" })!.constructName).toBe("Extraversion");

    // Only Extraversion is extreme and it rests on one test → confirm it from a new angle.
    const single = [driveScale(bigFive, "E", true)];
    const t2 = triangulationTarget(single, {})!;
    expect(t2.constructId).toBe("extraversion");
    expect(t2.kind).toBe("single");
    expect(t2.instrumentId).toBe("hexaco-24");

    // Nothing to shore up with no history.
    expect(triangulationTarget([], {})).toBeNull();
  });
});

describe("response-style analysis", () => {
  const entry = (resp: ResponseMap) => ({ instrument: bigFive, result: scoreAssessment(bigFive, resp) });
  const all = (v: number) => entry(answerAll(bigFive, () => v));

  it("stays quiet with nothing to analyze", () => {
    const r = analyzeResponseStyle([], {});
    expect(r.summary).toBeNull();
    expect(r.itemsAnalyzed).toBe(0);
  });

  it("excludes choice-format instruments (option index, not a rating)", () => {
    const resp = Object.fromEntries(loveLanguages.items.map((i) => [i.id, 0]));
    const r = analyzeResponseStyle([{ instrument: loveLanguages, result: scoreAssessment(loveLanguages, resp) }], {});
    expect(r.itemsAnalyzed).toBe(0);
  });

  it("detects yea-saying when everything is rated at the top", () => {
    const r = analyzeResponseStyle([all(bigFive.responseFormat.max)], {});
    expect(r.itemsAnalyzed).toBeGreaterThanOrEqual(24);
    expect(r.acquiescence).toBeGreaterThan(0.9);
    expect(r.flags.some((f) => f.id === "acquiescence")).toBe(true);
    expect(r.extremity).toBeGreaterThan(0.9);
    expect(r.flags.some((f) => f.id === "extreme")).toBe(true);
  });

  it("detects fence-sitting when everything is the midpoint", () => {
    const r = analyzeResponseStyle([all(3)], {}); // 1..5 scale midpoint
    expect(r.flags.some((f) => f.id === "middle")).toBe(true);
    expect(r.middling).toBeGreaterThan(0.9);
  });

  it("calls a varied answer pattern balanced and localizes the note", () => {
    let i = 0;
    const varied = entry(answerAll(bigFive, () => [1, 2, 3, 4, 5][i++ % 5]));
    const en = analyzeResponseStyle([varied], { locale: "en" });
    const fr = analyzeResponseStyle([varied], { locale: "fr" });
    expect(en.flags).toHaveLength(0);
    expect(en.summary).toBeTruthy();
    expect(fr.summary).not.toBe(en.summary);
  });
});

describe("longitudinal change narrative", () => {
  const cmp = () => compareTakes(bigFive, "2026-01-01", scoreAssessment(bigFive, allLow(bigFive)), "2026-06-01", scoreAssessment(bigFive, allHigh(bigFive)), 2);

  it("narrates the biggest movers and localizes", () => {
    const en = changeNarrative(cmp(), "en");
    const es = changeNarrative(cmp(), "es");
    expect(en.length).toBeGreaterThan(30);
    expect(en).toMatch(/rose|eased/);
    expect(es).not.toBe(en);
  });

  it("reports a steady profile when nothing moved much", () => {
    const same = scoreAssessment(bigFive, answerAll(bigFive, () => 3));
    const c = compareTakes(bigFive, "2026-01-01", same, "2026-06-01", same, 2);
    expect(changeNarrative(c, "en").toLowerCase()).toContain("steady");
  });
});

describe("Atlas Autopilot agent", () => {
  it("opens a new traveler on the foundation and advances after it", () => {
    const first = autopilotNext([], ["Understand myself"], {});
    expect(first?.instrumentId).toBe("big-five-ipip50");
    const e = [{ instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) }];
    const second = autopilotNext(e, ["Understand myself"], {});
    expect(second).toBeTruthy();
    expect(second!.instrumentId).not.toBe("big-five-ipip50");
    expect(second!.reason.length).toBeGreaterThan(8);
  });

  it("composes a narrated, localized brief with a running insight", () => {
    const e = [
      { instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) },
      { instrument: hexaco, result: scoreAssessment(hexaco, allHigh(hexaco)) },
    ];
    const next = autopilotNext(e, [], { locale: "fr" })!;
    const b = agentBrief(e, next, 3, 5, { locale: "fr" });
    expect(b.eyebrow).toContain("3/5");
    expect(b.nextName.length).toBeGreaterThan(1);
    expect(b.insight).toBeTruthy(); // 2+ tests → a cross-test insight
    expect(autopilotLength([])).toBeGreaterThanOrEqual(3);
  });
});

describe("Study Together collaboration", () => {
  const room = () => createRoom({ title: "Big Five study group", plan: ["big-five-ipip50", "hexaco-24", "jung-16-types"], host: "Ada" });

  it("round-trips a room through an invite link", () => {
    const r = room();
    const link = roomLink(r, "https://psyche.example/app");
    expect(link).toContain("?study=");
    const back = decodeRoom(link);
    expect(back).toBeTruthy();
    expect(back!.title).toBe(r.title);
    expect(back!.plan).toEqual(r.plan);
    expect(back!.host).toBe("Ada");
  });

  it("round-trips a raw encoded room and rejects junk", () => {
    expect(decodeRoom(encodeRoom(room()))?.plan).toHaveLength(3);
    expect(decodeRoom("not-a-real-code")).toBeNull();
  });

  it("round-trips member progress codes", () => {
    const back = decodeProgress(encodeProgress({ name: "Béa", done: ["big-five-ipip50"], at: "2026-06-14" }));
    expect(back?.name).toBe("Béa");
    expect(back?.done).toEqual(["big-five-ipip50"]);
  });

  it("round-trips shared scores and builds a group portrait", () => {
    const back = decodeProgress(encodeProgress({ name: "A", done: ["big-five-ipip50"], at: "x", scores: { "big-five-ipip50": { O: 75 } } }));
    expect(back?.scores?.["big-five-ipip50"].O).toBe(75);

    const members = [
      { name: "Ada", done: ["big-five-ipip50"], at: "x", scores: { "big-five-ipip50": { O: 80, C: 50, E: 70, A: 60, N: 30 } } },
      { name: "Bo", done: ["big-five-ipip50"], at: "y", scores: { "big-five-ipip50": { O: 60, C: 90, E: 20, A: 60, N: 40 } } },
    ];
    const gp = groupPortrait(["big-five-ipip50"], members, {});
    expect(gp).toHaveLength(1);
    expect(gp[0].n).toBe(2);
    expect(gp[0].scales.find((s) => s.id === "O")!.mean).toBe(70);
    expect(gp[0].widestScaleId).toBe("E"); // 70 vs 20 is the widest gap
    expect(groupPortrait(["big-five-ipip50"], [members[0]], {})).toHaveLength(0); // needs 2+
    const ins = groupInsights(gp, { locale: "fr" });
    expect(ins.length).toBeGreaterThan(0);
    expect(ins[0].length).toBeGreaterThan(15);
  });

  it("computes standings and per-step coverage", () => {
    const r = room();
    const members = [
      { name: "Ada", done: ["big-five-ipip50", "hexaco-24"], at: "x" },
      { name: "Bo", done: ["big-five-ipip50"], at: "y" },
    ];
    const st = roomStandings(r, members);
    expect(st[0].name).toBe("Ada");
    expect(st[0].pct).toBe(67);
    expect(st[1].pct).toBe(33);
    const cov = planCoverage(r, members);
    expect(cov.find((c) => c.instrumentId === "big-five-ipip50")!.doneBy.sort()).toEqual(["Ada", "Bo"]);
    expect(cov.find((c) => c.instrumentId === "jung-16-types")!.doneBy).toEqual([]);
  });

  it("reads group dynamics — each member's signature role and pairwise resonance", () => {
    const members: MemberProgress[] = [
      { name: "Ada", done: ["big-five-ipip50"], at: "x", scores: { "big-five-ipip50": { O: 90, C: 50, E: 50, A: 55, N: 30 } } },
      { name: "Bo", done: ["big-five-ipip50"], at: "y", scores: { "big-five-ipip50": { O: 52, C: 95, E: 48, A: 55, N: 32 } } },
      { name: "Cy", done: ["big-five-ipip50"], at: "z", scores: { "big-five-ipip50": { O: 50, C: 52, E: 50, A: 56, N: 31 } } },
    ];
    const roles = groupRoles(["big-five-ipip50"], members, { locale: "en" });
    // Ada's signature is Openness (far above the group mean); Bo's is Conscientiousness.
    const ada = roles.find((r) => r.name === "Ada")!;
    expect(ada.scaleId).toBe("O");
    expect(ada.delta).toBeGreaterThan(0);
    expect(roles.find((r) => r.name === "Bo")!.scaleId).toBe("C");
    expect(roleLine(ada, { locale: "en" })).toContain("Ada");
    expect(roleLine(ada, { locale: "fr" })).not.toBe(roleLine(ada, { locale: "en" }));

    const res = groupResonance(["big-five-ipip50"], members);
    // Cy sits near the middle on every scale, so Cy is closest to the others;
    // Ada (high O) and Bo (high C) are the most complementary pair.
    expect(res.mostAligned).toBeTruthy();
    expect(res.mostComplementary).toBeTruthy();
    expect([res.mostComplementary!.a, res.mostComplementary!.b].sort()).toEqual(["Ada", "Bo"]);
    expect(res.mostAligned!.similarity).toBeGreaterThan(res.mostComplementary!.similarity);
    const notes = pairingNotes(res, { locale: "es" });
    expect(notes.length).toBe(2);
    expect(notes[0]).toMatch(/afinidad/);

    // A single sharer yields no roles and no comparable pairs.
    expect(groupRoles(["big-five-ipip50"], [members[0]], {})).toHaveLength(0);
    expect(groupResonance(["big-five-ipip50"], [members[0]]).pairs).toHaveLength(0);
  });

  it("nudges the group toward the earliest step it hasn't all converged on", () => {
    const plan = ["big-five-ipip50", "hexaco-24", "jung-16-types"];
    const members: MemberProgress[] = [
      { name: "Ada", done: ["big-five-ipip50", "hexaco-24"], at: "x" },
      { name: "Bo", done: ["big-five-ipip50"], at: "y" },
    ];
    const next = groupNextStep(plan, members, { locale: "es" })!;
    expect(next.instrumentId).toBe("hexaco-24"); // earliest step not everyone finished
    expect(next.started).toBe(true); // Ada already did it
    expect(next.pending).toEqual(["Bo"]);
    expect(next.instrumentName).toBe(localizeInstrument(hexaco, "es").name); // localized to es

    // A fresh step nobody has started.
    const fresh = groupNextStep(["jung-16-types"], members, {})!;
    expect(fresh.instrumentId).toBe("jung-16-types");
    expect(fresh.started).toBe(false);
    expect(fresh.pending.sort()).toEqual(["Ada", "Bo"]);

    // Everyone finished everything → nothing to nudge.
    const allDone: MemberProgress[] = [{ name: "Ada", done: plan, at: "x" }, { name: "Bo", done: plan, at: "y" }];
    expect(groupNextStep(plan, allDone, {})).toBeNull();
    expect(groupNextStep(plan, [], {})).toBeNull();
  });

  it("paces a study plan into a spaced evening series", async () => {
    const { eveningSeries } = await import("../ui/calendar");
    const start = new Date("2026-06-15T18:00:00");
    const series = eveningSeries(start, 3, 2);
    expect(series).toHaveLength(3);
    expect(series[0].getTime()).toBe(start.getTime());
    // each subsequent session is everyDays later, same time of day
    expect((series[1].getTime() - series[0].getTime()) / 86400000).toBe(2);
    expect((series[2].getTime() - series[1].getTime()) / 86400000).toBe(2);
    expect(series[2].getHours()).toBe(start.getHours());
    expect(eveningSeries(start, 0)).toHaveLength(0);
  });

  it("groups members by team/org and reports each team's plan coverage", () => {
    const r = createRoom({ title: "Cross-org study", plan: ["big-five-ipip50", "hexaco-24", "jung-16-types"], host: "Ada" });
    const members: MemberProgress[] = [
      { name: "Ada", done: ["big-five-ipip50", "hexaco-24"], at: "x", org: "Lincoln High" },
      { name: "Bo", done: ["jung-16-types"], at: "y", org: "Lincoln High" },
      { name: "Cy", done: ["big-five-ipip50"], at: "z", org: "Globe Academy" },
      { name: "Di", done: [], at: "w" }, // no org → ungrouped
    ];
    expect(teamCount(members)).toBe(2);
    const teams = teamStandings(r, members, { ungrouped: "Independent" });
    // Lincoln High collectively covered all 3 plan steps → 100%, leads.
    expect(teams[0].org).toBe("Lincoln High");
    expect(teams[0].members).toBe(2);
    expect(teams[0].covered).toBe(3);
    expect(teams[0].pct).toBe(100);
    const globe = teams.find((t) => t.org === "Globe Academy")!;
    expect(globe.covered).toBe(1);
    expect(teams.some((t) => t.org === "Independent")).toBe(true);

    // org survives the progress round-trip.
    const back = decodeProgress(encodeProgress(members[0]));
    expect(back?.org).toBe("Lincoln High");
  });
});

describe("communication portrait", () => {
  const get = (id: string) => INSTRUMENTS.find((i) => i.id === id)!;
  const ent = (inst: Instrument, fn: (it: Item) => number) => ({ instrument: inst, result: scoreAssessment(inst, answerAll(inst, fn)) });
  const healthy = (it: Item) => (it.scale === "HORSE" || it.scale === "DEMWD" ? (it.keyed === 1 ? 1 : 5) : it.keyed === 1 ? 5 : 1);

  it("returns null when no communication instrument is present", () => {
    expect(analyzeCommunication([{ instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) }], {})).toBeNull();
  });

  it("synthesizes five cross-context themes, flipping risk scales to mean 'healthier'", () => {
    const styleHi = ent(get("communication-style"), (it) => (it.keyed === 1 ? 5 : 1));
    const coupleHealthy = ent(get("couple-communication"), healthy);
    const p = analyzeCommunication([styleHi, coupleHealthy], { locale: "en" })!;
    expect(p).toBeTruthy();
    expect(p.themes).toHaveLength(5);
    expect(p.instrumentsUsed.map((u) => u.id).sort()).toEqual(["communication-style", "couple-communication"]);
    // healthy answers (incl. LOW Four Horsemen) → every theme reads high
    expect(p.themes.every((t) => t.score >= 60)).toBe(true);
    expect(p.themes.find((t) => t.id === "composure")!.score).toBeGreaterThan(70);
    expect(p.topStrength).toBeTruthy();
    expect(p.insight.length).toBeGreaterThan(30);
  });

  it("lets frequent Four Horsemen drag down the Composure & Repair theme", () => {
    const horsemen = ent(get("couple-communication"), (it) => (it.scale === "HORSE" || it.scale === "DEMWD" ? (it.keyed === 1 ? 5 : 1) : it.keyed === 1 ? 1 : 5));
    const comp = analyzeCommunication([horsemen], { locale: "en" })!.themes.find((t) => t.id === "composure")!;
    expect(comp.score).toBeLessThan(40);
  });

  it("localizes theme names and the synthesis insight", () => {
    const styleHi = ent(get("communication-style"), (it) => (it.keyed === 1 ? 5 : 1));
    const en = analyzeCommunication([styleHi], { locale: "en" })!;
    const es = analyzeCommunication([styleHi], { locale: "es" })!;
    expect(en.themes[0].name).not.toBe(es.themes[0].name);
    expect(en.insight).not.toBe(es.insight);
  });
});

describe("wellbeing portrait", () => {
  const get = (id: string) => INSTRUMENTS.find((i) => i.id === id)!;
  const ent = (id: string, fn: (it: Item) => number) => ({ instrument: get(id), result: scoreAssessment(get(id), answerAll(get(id), fn)) });

  it("needs at least two wellbeing tests before it synthesizes", () => {
    // One wellbeing test alone → no portrait (its own report covers it).
    expect(analyzeWellbeing([ent("self-compassion-scs", (it) => (["SK", "CH", "MI"].includes(it.scale) ? 5 : 1))], {})).toBeNull();
    // A non-wellbeing test never triggers it either.
    expect(analyzeWellbeing([{ instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) }], {})).toBeNull();
  });

  it("weaves five flourishing dimensions, flipping risk scales to mean 'healthier'", () => {
    // Self-compassion warm + resilience high + low perceived stress → a bright portrait.
    const warmSc = ent("self-compassion-scs", (it) => (["SK", "CH", "MI"].includes(it.scale) ? 5 : 1));
    const resilient = ent("brief-resilience", (it) => (it.keyed === 1 ? 5 : 1));
    const lowStress = ent("perceived-stress", (it) => (it.keyed === 1 ? 1 : 5)); // STRESS is direction-flipped
    const p = analyzeWellbeing([warmSc, resilient, lowStress], { locale: "en" })!;
    expect(p).toBeTruthy();
    expect(p.themes.length).toBeGreaterThanOrEqual(3);
    expect(p.themes.find((th) => th.id === "kindness")!.score).toBeGreaterThan(70);
    expect(p.themes.find((th) => th.id === "resilience")!.score).toBeGreaterThan(70); // high resilience + low stress
    expect(p.topStrength).toBeTruthy();
    expect(p.insight.length).toBeGreaterThan(30);
  });

  it("lets heavy self-judgment & stress drag the relevant dimensions down", () => {
    const harshSc = ent("self-compassion-scs", (it) => (["SK", "CH", "MI"].includes(it.scale) ? 1 : 5));
    const highStress = ent("perceived-stress", (it) => (it.keyed === 1 ? 5 : 1));
    const p = analyzeWellbeing([harshSc, highStress], { locale: "en" })!;
    expect(p.themes.find((th) => th.id === "kindness")!.score).toBeLessThan(35);
    expect(p.themes.find((th) => th.id === "resilience")!.score).toBeLessThan(40);
  });

  it("localizes dimension names and the synthesis insight", () => {
    const a = ent("self-compassion-scs", (it) => (["SK", "CH", "MI"].includes(it.scale) ? 5 : 1));
    const b = ent("brief-resilience", (it) => (it.keyed === 1 ? 5 : 1));
    const en = analyzeWellbeing([a, b], { locale: "en" })!;
    const fr = analyzeWellbeing([a, b], { locale: "fr" })!;
    expect(en.themes[0].name).not.toBe(fr.themes[0].name);
    expect(en.insight).not.toBe(fr.insight);
  });
});

describe("milestones", () => {
  const e = (...insts: Instrument[]): SynthEntry[] => insts.map((i) => ({ instrument: i, result: scoreAssessment(i, allHigh(i)) }));

  it("awards nothing meaningful with no history and points to a first target", () => {
    const m = computeMilestones([], {});
    expect(m.achievedCount).toBe(0);
    expect(m.next).toBeTruthy();
    expect(m.next!.progress).toBe(0);
    expect(m.total).toBeGreaterThan(5);
  });

  it("unlocks First Light after one assessment", () => {
    const m = computeMilestones(e(bigFive), {});
    expect(m.achieved.some((x) => x.id === "first-light")).toBe(true);
  });

  it("unlocks themed milestones from the right categories", () => {
    const m = computeMilestones(e(attachment), {});
    expect(m.achieved.some((x) => x.id === "heart-mapped")).toBe(true);
  });

  it("counts cognition and streak from options", () => {
    const m = computeMilestones(e(bigFive), { cognitiveCount: 1, streakDays: 7 });
    expect(m.achieved.some((x) => x.id === "mind-mapped")).toBe(true);
    expect(m.achieved.some((x) => x.id === "devoted")).toBe(true);
  });

  it("surfaces the closest locked milestone as the next target", () => {
    const m = computeMilestones(e(bigFive, jungTypes), {}); // 2 tests → triangulated (2/3) is closest
    expect(m.next).toBeTruthy();
    expect(m.next!.achieved).toBe(false);
    expect(m.next!.progress).toBeGreaterThan(0);
  });

  it("localizes titles", () => {
    const en = computeMilestones(e(bigFive), { locale: "en" }).all[0];
    const fr = computeMilestones(e(bigFive), { locale: "fr" }).all[0];
    expect(en.title).not.toBe(fr.title);
  });
});

describe("adaptive starter pack", () => {
  it("falls back to the classic focus-based trio for new visitors", () => {
    expect(adaptivePack([], ["relationships"])).toEqual(starterPack(["relationships"]));
  });

  it("builds a fresh trio of uncompleted tests for returning users", () => {
    const e = { instrument: bigFive, result: scoreAssessment(bigFive, allHigh(bigFive)) };
    const pack = adaptivePack([e], []);
    expect(pack.length).toBe(3);
    expect(pack).not.toContain("big-five-ipip50"); // already taken
    expect(new Set(pack).size).toBe(3); // no duplicates
  });
});

describe("profile spotlight", () => {
  it("returns null with no history", () => {
    expect(profileSpotlight([], {})).toBeNull();
  });

  it("names standout traits as chips for a vivid profile", () => {
    const res = scoreAssessment(bigFive, allHigh(bigFive));
    const spot = profileSpotlight([{ instrument: bigFive, result: res }], { name: "Sam" });
    expect(spot).toBeTruthy();
    expect(spot!.headline).toContain("Sam");
    expect(spot!.chips.length).toBeGreaterThan(0);
    expect(spot!.line.length).toBeGreaterThan(10);
  });
});
