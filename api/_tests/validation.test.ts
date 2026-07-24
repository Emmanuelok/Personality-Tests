import { describe, expect, it } from "vitest";
import {
  NORMS_ELIGIBLE_INSTRUMENT_IDS,
  SENSITIVE_INSTRUMENT_IDS,
} from "../../src/core/catalogPolicy";
import { INSTRUMENTS } from "../../src/core/instruments";
import { parseAskRequest } from "../_ask-schema";
import { readJsonObject } from "../_http";
import {
  catalogScaleIds,
  isServerNormsEligibleInstrument,
  parseNormContribution,
  SERVER_NORMS_ELIGIBLE_INSTRUMENT_IDS,
} from "../_norms-catalog";
import { fingerprintValue, ValidationError } from "../_validation";
import { request } from "./helpers";

describe("request validation", () => {
  it("requires JSON and enforces the serialized body limit", () => {
    expect(() =>
      readJsonObject(
        request({ headers: { "content-type": "text/plain" }, body: "{}" }),
        100,
      ),
    ).toThrowError(expect.objectContaining({ code: "unsupported_media_type" }));

    expect(() =>
      readJsonObject(
        request({
          headers: { "content-type": "application/json", "content-length": "101" },
          body: {},
        }),
        100,
      ),
    ).toThrowError(expect.objectContaining({ code: "body_too_large" }));
  });

  it("accepts only the deidentified Ask Atlas contract with explicit consent", () => {
    const parsed = parseAskRequest({
      question: "What should I practice next?",
      locale: "en",
      consent: { externalAI: true },
      actionableEvidence: ["Planning was consistent across two recent exercises."],
    });
    expect(parsed.actionableEvidence).toHaveLength(1);

    expect(() =>
      parseAskRequest({
        question: "What should I practice next?",
        locale: "en",
        consent: { externalAI: false },
        actionableEvidence: ["Evidence"],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "external_ai_consent_required",
      }),
    );
    expect(() =>
      parseAskRequest({
        question: "Question",
        locale: "en",
        consent: { externalAI: true },
        actionableEvidence: ["Evidence"],
        name: "Not allowed",
      }),
    ).toThrowError(expect.objectContaining({ code: "unknown_field" }));
  });

  it("requires a complete catalog-allowlisted norms contribution", () => {
    const instrumentId = "big-five-ipip50";
    const scaleIds = catalogScaleIds(instrumentId);
    expect(scaleIds).toEqual(["O", "C", "E", "A", "N"]);
    const buckets = Object.fromEntries(scaleIds!.map((scaleId) => [scaleId, 5]));
    expect(parseNormContribution({ instrumentId, buckets })).toEqual({
      instrumentId,
      buckets,
    });

    expect(() =>
      parseNormContribution({
        instrumentId,
        buckets: { ...buckets, injected: 4 },
      }),
    ).toThrow(ValidationError);
    const incomplete = { ...buckets };
    delete incomplete.O;
    expect(() =>
      parseNormContribution({ instrumentId, buckets: incomplete }),
    ).toThrow(ValidationError);
  });

  it("keeps the audited server norms allowlist in exact parity with client policy", () => {
    expect([...SERVER_NORMS_ELIGIBLE_INSTRUMENT_IDS].sort()).toEqual(
      [...NORMS_ELIGIBLE_INSTRUMENT_IDS].sort(),
    );

    for (const instrument of INSTRUMENTS) {
      if (NORMS_ELIGIBLE_INSTRUMENT_IDS.includes(instrument.id)) {
        expect(catalogScaleIds(instrument.id), instrument.id).toEqual(
          instrument.scales.map((scale) => scale.id),
        );
      }
    }

    for (const instrumentId of SENSITIVE_INSTRUMENT_IDS) {
      expect(isServerNormsEligibleInstrument(instrumentId), instrumentId).toBe(false);
      expect(catalogScaleIds(instrumentId), instrumentId).toBeUndefined();
    }
  });

  it("accepts canonical random IDs and only the two saved legacy formats", () => {
    expect(fingerprintValue(`rid1_${"b".repeat(64)}`)).toBe(`rid1_${"b".repeat(64)}`);
    expect(fingerprintValue(`fp1_${"a".repeat(64)}`)).toBe(`fp1_${"a".repeat(64)}`);
    expect(fingerprintValue("0123456789abcd")).toBe("0123456789abcd");
    expect(() => fingerprintValue("2lsohxawj1h")).toThrow(ValidationError);
    expect(() => fingerprintValue(`rid1_${"B".repeat(64)}`)).toThrow(ValidationError);
    expect(() => fingerprintValue(`fp1_${"A".repeat(64)}`)).toThrow(ValidationError);
    expect(() => fingerprintValue(` rid1_${"b".repeat(64)}`)).toThrow(ValidationError);
  });
});
