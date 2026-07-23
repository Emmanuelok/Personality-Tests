import { describe, it, expect } from "vitest";
import { ABILITY_TESTS, scoreAbility, scoreAbilitySubmission } from "./index";
import { CORSI_TEST, makeDigits, makeSequence, scoreMemory, scoreCorsi, type MemoryTrial } from "./memory";
import { makeSpeedTrial, scoreProcessing } from "./processing";
import { chcFromDomains, buildBattery } from "./chc";
import { ADAPTIVE_TEST, genItem, scoreAdaptive, type AdaptiveTrial } from "./adaptive";
import { IAT_BLOCKS, makeIatStimulus, scoreIat, type IatTrial } from "./iat";
import { scoreCreativity } from "./creativity";
import { localizeObservation, localizeAbilityMeta, hasAbilityTranslation } from "./i18n";
import { abilityGrowth } from "./improve";
import type { AbilityResponses } from "./types";
import { beginTimedAttempt } from "../timing";
import { STRINGS, type Locale } from "../../i18n/strings";

describe("cognitive improvement guidance", () => {
  it("gives honest, evidence-based tips per test plus brain-health basics", () => {
    for (const id of ["memory-span", "corsi-blocks", "processing-speed", "adaptive-reasoning", "alternative-uses"]) {
      const g = abilityGrowth(id);
      expect(g.tips.length).toBeGreaterThanOrEqual(4); // domain tips + basics
      expect(g.headline.length).toBeGreaterThan(0);
      expect(g.caveat).toMatch(/transfer|brain training/i); // honesty about limited transfer
      expect(g.unlockScope).toMatch(/standalone activity|actividad independiente|activité autonome/i);
      expect(g.unlockScope).toMatch(/question|pregunta/);
      expect(g.unlockScope).toMatch(/pdf/i);
    }
    const def = abilityGrowth("unknown");
    expect(def.tips.length).toBeGreaterThanOrEqual(3); // basics still present
    expect(def.caveat.length).toBeGreaterThan(0);
  });

  it("localizes the guidance into es/fr (English fallback otherwise)", () => {
    expect(abilityGrowth("memory-span", "es").caveat).toMatch(/entrenamiento cerebral/);
    expect(abilityGrowth("memory-span", "fr").caveat).toMatch(/entraînement cérébral/);
    expect(abilityGrowth("memory-span", "es").headline).not.toBe(abilityGrowth("memory-span", "en").headline);
    expect(abilityGrowth("memory-span", "de").caveat).toBe(abilityGrowth("memory-span", "en").caveat); // unknown locale → English
  });

  it("frames adaptive reasoning as task-specific practice, not fixed ability", () => {
    const locales: Locale[] = ["en", "es", "fr"];
    for (const locale of locales) {
      const meta = locale === "en" ? ADAPTIVE_TEST : localizeAbilityMeta("adaptive-reasoning", locale);
      const copy = [
        meta.tagline,
        meta.description,
        ...(meta.caveats ?? []),
        STRINGS[locale]["cog.adp.how"],
        STRINGS[locale]["cog.adp.narr"],
        STRINGS[locale]["cog.adp.note"],
        STRINGS[locale]["cog.adp.pathIntro"],
        abilityGrowth("adaptive-reasoning", locale).headline,
      ].join(" ");

      expect(copy).not.toMatch(
        /pins down.*ability|fluid reasoning is stable|razonamiento fluido es estable|raisonnement fluide est stable|capacidad de razonamiento|capacité de raisonnement|estimación más precisa|estimation plus fine|hacia tu nivel|vers votre niveau|toward your level/i,
      );
      expect(copy).toMatch(/practice|sitting|responses|task|práctica|sesión|respuestas|tarea|pratique|séance|réponses|tâche/i);
    }
  });

  it("frames Corsi copy in en/es/fr as a session-specific task observation", () => {
    const locales: Locale[] = ["en", "es", "fr"];
    for (const locale of locales) {
      const meta = locale === "en" ? CORSI_TEST : localizeAbilityMeta("corsi-blocks", locale);
      const copy = [
        meta.tagline,
        meta.description,
        ...(meta.caveats ?? []),
        STRINGS[locale]["cog.corsi.title"],
        STRINGS[locale]["cog.corsi.super"],
        STRINGS[locale]["cog.corsi.narr"],
        STRINGS[locale]["cog.corsi.note"],
      ].join(" ");

      expect(copy).not.toMatch(
        /distinct skill|quite separate|stronger at one|estimated profile|capacidad bastante distinta|habilidad distinta|notablemente mejor|perfil estimado|capacité bien distincte|aptitude distincte|nettement plus forts?|profil estimé/i,
      );
      expect(copy).toMatch(/practice|sitting|session|task|práctica|sesión|tarea|pratique|séance|tâche/i);
    }
  });
});

describe("ability tests are well-formed", () => {
  for (const test of ABILITY_TESTS) {
    it(`${test.id}: items, options, and answer keys are valid`, () => {
      const ids = new Set(test.items.map((i) => i.id));
      expect(ids.size).toBe(test.items.length); // unique ids
      const domainIds = new Set(test.domains.map((d) => d.id));
      for (const it of test.items) {
        expect(domainIds.has(it.domain)).toBe(true);
        expect(it.options.length).toBeGreaterThanOrEqual(2);
        expect(it.answer).toBeGreaterThanOrEqual(0);
        expect(it.answer).toBeLessThan(it.options.length);
        expect(it.pCorrect).toBeGreaterThan(0);
        expect(it.pCorrect).toBeLessThan(1);
        if (it.optionFigures) expect(it.optionFigures.length).toBe(it.options.length);
      }
      // every domain has at least one item
      for (const d of test.domains) {
        expect(test.items.some((i) => i.domain === d.id)).toBe(true);
      }
    });
  }
});

describe("ability scoring", () => {
  const test = ABILITY_TESTS[0];
  const allCorrect: AbilityResponses = Object.fromEntries(test.items.map((i) => [i.id, i.answer]));
  const allWrong: AbilityResponses = Object.fromEntries(
    test.items.map((i) => [i.id, (i.answer + 1) % i.options.length]),
  );

  it("scores a perfect set at the top of the range", () => {
    const r = scoreAbility(test, allCorrect);
    expect(r.correct).toBe(test.items.length);
    expect(r.practiceIndex).toBe(100);
    expect(r.observation).toContain("Strong performance");
    expect(Object.keys(r).sort()).toEqual([
      "correct",
      "fingerprint",
      "observation",
      "perDomain",
      "practiceIndex",
      "responses",
      "testId",
      "total",
    ]);
  });

  it("scores an all-wrong set at the bottom", () => {
    const r = scoreAbility(test, allWrong);
    expect(r.correct).toBe(0);
    expect(r.practiceIndex).toBe(0);
    expect(r.observation).toContain("Limited evidence");
  });

  it("per-domain correct counts sum to the overall correct count", () => {
    const r = scoreAbility(test, allCorrect);
    const sum = r.perDomain.reduce((s, d) => s + d.correct, 0);
    expect(sum).toBe(r.correct);
    const totals = r.perDomain.reduce((s, d) => s + d.total, 0);
    expect(totals).toBe(r.total);
  });

  it("produces opaque, random result ids even for identical responses", () => {
    const first = scoreAbility(test, allCorrect).fingerprint;
    const second = scoreAbility(test, allCorrect).fingerprint;
    expect(first).toMatch(/^rid1_[0-9a-f]{64}$/);
    expect(second).toMatch(/^rid1_[0-9a-f]{64}$/);
    expect(first).not.toBe(second);
  });

  it("rejects stale and repeated ability submissions", () => {
    const attempt = beginTimedAttempt({ attemptId: "live", startedAtMs: 1_000 });
    expect(scoreAbilitySubmission(test, allCorrect, attempt, {
      attemptId: "old",
      submissionId: "stale",
      observedAtMs: 2_000,
    })).toMatchObject({ accepted: false, reason: "stale-attempt" });
    const first = scoreAbilitySubmission(test, allCorrect, attempt, {
      attemptId: "live",
      submissionId: "first",
      observedAtMs: 2_000,
    });
    expect(first.accepted).toBe(true);
    if (first.accepted) {
      expect(scoreAbilitySubmission(test, allCorrect, first.attempt, {
        attemptId: "live",
        submissionId: "again",
        observedAtMs: 2_100,
      })).toMatchObject({ accepted: false, reason: "already-submitted" });
    }
  });
});

describe("working-memory scoring", () => {
  it("makeDigits returns a string of the requested length using digits 1-9", () => {
    const s = makeDigits(6);
    expect(s).toHaveLength(6);
    expect(/^[1-9]+$/.test(s)).toBe(true);
  });

  it("reports the longest correct span per mode and a high band when strong", () => {
    const trials: MemoryTrial[] = [
      { mode: "forward", span: 5, shown: "12345", entered: "12345", correct: true },
      { mode: "forward", span: 8, shown: "12345678", entered: "12345678", correct: true },
      { mode: "backward", span: 6, shown: "123456", entered: "654321", correct: true },
    ];
    const r = scoreMemory(trials);
    expect(r.maxForward).toBe(8);
    expect(r.maxBackward).toBe(6);
    expect(r.practiceIndex).toBeGreaterThan(80);
  });

  it("scores all-incorrect at the bottom", () => {
    const trials: MemoryTrial[] = [
      { mode: "forward", span: 3, shown: "123", entered: "", correct: false },
      { mode: "backward", span: 3, shown: "123", entered: "", correct: false },
    ];
    const r = scoreMemory(trials);
    expect(r.maxForward).toBe(0);
    expect(r.maxBackward).toBe(0);
    expect(r.practiceIndex).toBe(0);
  });
});

describe("Corsi spatial span", () => {
  it("makeSequence returns distinct indices of the requested length", () => {
    const seq = makeSequence(5, 9);
    expect(seq).toHaveLength(5);
    expect(new Set(seq).size).toBe(5);
    expect(seq.every((n) => n >= 0 && n < 9)).toBe(true);
  });

  it("scores spatial span and reports the longest correct path", () => {
    const trials: MemoryTrial[] = [
      { mode: "forward", span: 4, shown: "0-1-2-3", entered: "0-1-2-3", correct: true },
      { mode: "forward", span: 6, shown: "0-1-2-3-4-5", entered: "0-1-2-3-4-5", correct: true },
      { mode: "backward", span: 5, shown: "0-1-2-3-4", entered: "4-3-2-1-0", correct: true },
    ];
    const r = scoreCorsi(trials);
    expect(r.maxForward).toBe(6);
    expect(r.maxBackward).toBe(5);
    expect(r.practiceIndex).toBeGreaterThan(50);
  });
});

describe("processing speed", () => {
  it("builds trials whose 'present' flag matches the search set", () => {
    for (let i = 0; i < 50; i++) {
      const t = makeSpeedTrial();
      expect(t.targets.length).toBe(2);
      expect(t.search.length).toBe(5);
      const anyTarget = t.search.some((s) => t.targets.includes(s));
      expect(anyTarget).toBe(t.present);
    }
  });

  it("rewards fast, accurate work and penalizes errors", () => {
    const fast = scoreProcessing(50, 1, 51, 90);
    const slow = scoreProcessing(8, 6, 14, 90);
    expect(fast.practiceIndex).toBeGreaterThan(slow.practiceIndex);
    expect(fast.practiceIndex).toBeGreaterThan(80);
    expect(slow.practiceIndex).toBeLessThan(30);
  });

  it("does not reward implausibly short caller-reported elapsed time", () => {
    const short = scoreProcessing(5, 0, 5, 1);
    const honest = scoreProcessing(5, 0, 5, 45);
    expect(short.durationSec).toBe(45);
    expect(short.practiceIndex).toBe(honest.practiceIndex);
  });
});

describe("CHC battery aggregation", () => {
  it("maps domains onto CHC factors", () => {
    const chc = chcFromDomains([
      { domain: "verbal", practiceIndex: 80 },
      { domain: "abstract", practiceIndex: 60 },
      { domain: "numerical", practiceIndex: 70 },
      { domain: "spatial", practiceIndex: 50 },
    ]);
    expect(chc).toEqual({ Gc: 80, Gf: 60, Gq: 70, Gv: 50 });
  });

  it("builds a battery, averaging per factor and overall, ignoring empty takes", () => {
    const b = buildBattery([{ chc: { Gf: 80, Gc: 70 } }, { chc: { Gv: 60 } }, { chc: {} }, {}]);
    expect(b).not.toBeNull();
    expect(b!.tests).toBe(2);
    expect(b!.factors.map((f) => f.id).sort()).toEqual(["Gc", "Gf", "Gv"]);
    expect(b!.practiceIndex).toBe(70);
    expect(b!.observation.length).toBeGreaterThan(0);
    expect(Object.keys(b!).sort()).toEqual([
      "factors",
      "observation",
      "practiceIndex",
      "tests",
    ]);
  });

  it("returns null with no CHC data", () => {
    expect(buildBattery([{}, { chc: {} }])).toBeNull();
  });

  it("keeps judgment/creativity domains out of the battery (no CHC mapping)", () => {
    expect(chcFromDomains([
      { domain: "interpersonal", practiceIndex: 80 },
      { domain: "integrity", practiceIndex: 70 },
    ])).toEqual({});
  });
});

describe("creative thinking (fluency)", () => {
  it("counts distinct uses per object and rewards more ideas", () => {
    const many = scoreCreativity([
      { prompt: "a brick", uses: ["doorstop", "weapon", "build a wall", "paperweight", "art", "exercise weight", "heat sink"] },
      { prompt: "a paperclip", uses: ["pick a lock", "earring", "reset button", "bookmark", "hook", "fix a zipper"] },
    ]);
    const few = scoreCreativity([{ prompt: "a brick", uses: ["build"] }, { prompt: "a paperclip", uses: [] }]);
    expect(many.fluency).toBe(13);
    expect(many.practiceIndex).toBeGreaterThan(few.practiceIndex);
  });

  it("de-duplicates repeated uses within an object", () => {
    const r = scoreCreativity([{ prompt: "a brick", uses: ["doorstop", "Doorstop", " doorstop ", "weapon"] }]);
    expect(r.fluency).toBe(2);
  });
});

describe("adaptive reasoning", () => {
  it("generates well-formed items at every difficulty level", () => {
    for (let level = 1; level <= 7; level++) {
      for (let k = 0; k < 8; k++) {
        const it = genItem(level);
        expect(it.options.length).toBe(6);
        expect(it.optionFigures.length).toBe(6);
        expect(it.answer).toBeGreaterThanOrEqual(0);
        expect(it.answer).toBeLessThan(6);
        expect(it.figure.length).toBeGreaterThan(20);
        // the correct option's figure must be unique (distractors differ from the key)
        const key = it.optionFigures[it.answer];
        expect(it.optionFigures.filter((f) => f === key).length).toBe(1);
      }
    }
  });

  it("estimates higher ability when the staircase settles high", () => {
    const high: AdaptiveTrial[] = Array.from({ length: 16 }, () => ({ level: 6, correct: true }));
    const low: AdaptiveTrial[] = Array.from({ length: 16 }, () => ({ level: 1, correct: false }));
    expect(scoreAdaptive(high).practiceIndex).toBeGreaterThan(scoreAdaptive(low).practiceIndex);
    expect(scoreAdaptive(high).practiceIndex).toBeGreaterThan(60);
    expect(scoreAdaptive(low).practiceIndex).toBeLessThan(20);
  });
});

describe("Implicit Association Test", () => {
  it("places each stimulus on the side its category occupies", () => {
    for (const block of IAT_BLOCKS) {
      for (let k = 0; k < 20; k++) {
        const s = makeIatStimulus(block);
        const onLeft = (block.left as readonly string[]).includes(s.cat);
        expect(s.correct).toBe(onLeft ? "left" : "right");
      }
    }
  });

  it("yields a positive D when the compatible pairing is faster", () => {
    const trials: IatTrial[] = [];
    for (const b of [3, 4]) for (let i = 0; i < 12; i++) trials.push({ block: b, rt: 600, firstCorrect: true });
    for (const b of [6, 7]) for (let i = 0; i < 12; i++) trials.push({ block: b, rt: 1000, firstCorrect: true });
    const r = scoreIat(trials);
    expect(r.d).toBeGreaterThan(0.15);
    expect(r.direction).toBe("flowers");
  });

  it("yields ~zero D when both pairings are equally fast", () => {
    const trials: IatTrial[] = [];
    for (const b of [3, 4, 6, 7]) for (let i = 0; i < 12; i++) trials.push({ block: b, rt: 700, firstCorrect: true });
    const r = scoreIat(trials);
    expect(Math.abs(r.d)).toBeLessThan(0.15);
    expect(r.direction).toBe("none");
  });
});

describe("ability localization", () => {
  const OBSERVATIONS = [
    "Strong performance on this practice set",
    "Mostly consistent performance on this practice set",
    "Mixed performance on this practice set",
    "Developing familiarity with this practice set",
    "Limited evidence from this attempt",
  ];
  const COG_IDS = ["memory-span", "corsi-blocks", "processing-speed", "alternative-uses", "iat-demo", "adaptive-reasoning"];

  it("translates every observation the scorers can emit, in es and fr", () => {
    for (const observation of OBSERVATIONS) {
      for (const loc of ["es", "fr"]) {
        const out = localizeObservation(observation, loc);
        expect(out).not.toBe(observation);
        expect(out.length).toBeGreaterThan(0);
      }
      expect(localizeObservation(observation, "en")).toBe(observation);
    }
  });

  it("passes unknown observations and locales through unchanged", () => {
    expect(localizeObservation("Unknown observation", "es")).toBe("Unknown observation");
    expect(localizeObservation(OBSERVATIONS[0], "de")).toBe(OBSERVATIONS[0]);
  });

  it("provides es/fr meta (name, description, caveats) for every standalone cognition test", () => {
    for (const id of COG_IDS) {
      for (const loc of ["es", "fr"]) {
        expect(hasAbilityTranslation(id, loc)).toBe(true);
        const m = localizeAbilityMeta(id, loc);
        expect(m.name && m.name.length).toBeTruthy();
        expect(m.description && m.description.length).toBeTruthy();
        expect(m.caveats && m.caveats.length).toBeTruthy();
      }
    }
  });

  it("falls back to an empty translation for unknown ids or locales", () => {
    expect(localizeAbilityMeta("memory-span", "en")).toEqual({});
    expect(localizeAbilityMeta("no-such-test", "es")).toEqual({});
    expect(hasAbilityTranslation("no-such-test", "es")).toBe(false);
  });
});
