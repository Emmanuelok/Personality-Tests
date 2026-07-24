import { describe, expect, it } from "vitest";
import {
  autonomousEvidence,
  evidenceConsent,
  evidenceDecision,
  selectEvidence,
  toEvidenceReference,
  type EvidenceRecord,
} from "./evidence";
import { bigFive } from "./instruments";
import { scoreAssessment } from "./scoring";
import { recommendNextFromEvidence } from "./recommend";
import { dailyNudgeFromEvidence } from "./daily";
import { autopilotNextFromEvidence } from "./autopilot";
import type { SynthEntry } from "./synthesis";

const record = (
  id: string,
  tier: EvidenceRecord["tier"],
  sensitive = false,
): EvidenceRecord => ({ id, tier, sensitive, source: "user", summary: `${id} summary`, payload: { secret: id } });

describe("evidence governance", () => {
  it("requires affirmative consent for every tier", () => {
    expect(evidenceDecision(record("a", "actionable"), "recommend", evidenceConsent()).reason)
      .toBe("missing-tier-consent");
    expect(evidenceDecision(
      record("a", "actionable"),
      "recommend",
      evidenceConsent({ actionable: true }),
    ).allowed).toBe(true);
  });

  it("keeps reflective evidence out of routing while allowing user-led reflection", () => {
    const consent = evidenceConsent({ reflective: true });
    expect(evidenceDecision(record("r", "reflective"), "reflect", consent).allowed).toBe(true);
    expect(evidenceDecision(record("r", "reflective"), "recommend", consent).reason)
      .toBe("reflective-routing-block");
    expect(evidenceDecision(record("r", "reflective"), "reflect", consent, "autonomous").reason)
      .toBe("reflective-routing-block");
  });

  it("never interprets or routes private evidence", () => {
    const consent = evidenceConsent({ private: true, sensitive: true, sharing: true });
    expect(evidenceDecision(record("p", "private"), "view", consent).allowed).toBe(true);
    for (const use of ["reflect", "interpret", "recommend", "route-practice", "share"] as const) {
      expect(evidenceDecision(record("p", "private"), use, consent).reason).toBe("private-use-block");
    }
    expect(toEvidenceReference(record("p", "private"))).toBeNull();
  });

  it("blocks sensitive evidence from autonomous use even with every consent", () => {
    const consent = evidenceConsent({
      actionable: true,
      reflective: true,
      private: true,
      sensitive: true,
      sharing: true,
    });
    expect(evidenceDecision(record("s", "actionable", true), "recommend", consent, "autonomous").reason)
      .toBe("sensitive-autonomy-block");
    expect(evidenceDecision(record("s", "actionable", true), "interpret", consent, "user-led").allowed)
      .toBe(true);
    expect(toEvidenceReference(record("s", "actionable", true))).toBeNull();
  });

  it("filters deterministically, de-duplicates ids, and does not read excluded payloads", () => {
    const records = [
      record("a", "actionable"),
      record("r", "reflective"),
      record("p", "private"),
      record("a", "actionable"),
      record("s", "actionable", true),
    ];
    const selection = autonomousEvidence(records, evidenceConsent({
      actionable: true,
      reflective: true,
      private: true,
      sensitive: true,
    }));
    expect(selection.allowed.map((item) => item.id)).toEqual(["a"]);
    expect(selection.excluded.map((item) => item.evidenceId)).toEqual(["r", "p", "s"]);
    expect(selectEvidence(records, "view", evidenceConsent({ actionable: true })).allowed)
      .toHaveLength(1);
  });

  it("makes sharing a separate, user-led permission", () => {
    const actionable = record("a", "actionable");
    expect(evidenceDecision(
      actionable,
      "share",
      evidenceConsent({ actionable: true }),
    ).reason).toBe("sharing-consent-required");
    expect(evidenceDecision(
      actionable,
      "share",
      evidenceConsent({ actionable: true, sharing: true }),
    ).allowed).toBe(true);
    expect(evidenceDecision(
      actionable,
      "share",
      evidenceConsent({ actionable: true, sharing: true }),
      "autonomous",
    ).reason).toBe("autonomous-sharing-block");
  });

  it("keeps private and sensitive assessment payloads out of recommendation surfaces", () => {
    const responses = Object.fromEntries(bigFive.items.map((item) => [
      item.id,
      item.keyed === 1 ? 5 : 1,
    ]));
    const entry: SynthEntry = {
      instrument: bigFive,
      result: scoreAssessment(bigFive, responses),
    };
    const consent = evidenceConsent({
      actionable: true,
      private: true,
      sensitive: true,
    });
    const privateRecord: EvidenceRecord<SynthEntry> = {
      id: "private-assessment",
      tier: "private",
      source: "assessment",
      summary: "Private assessment",
      payload: entry,
    };
    const sensitiveRecord: EvidenceRecord<SynthEntry> = {
      id: "sensitive-assessment",
      tier: "actionable",
      source: "assessment",
      summary: "Sensitive assessment",
      payload: entry,
      sensitive: true,
    };

    expect(dailyNudgeFromEvidence([privateRecord], { consent })).toBeNull();
    expect(dailyNudgeFromEvidence([sensitiveRecord], { consent })).toBeNull();
    expect(recommendNextFromEvidence([privateRecord], consent, { limit: 8 })
      .some((recommendation) => recommendation.instrument.id === "need-for-cognition")).toBe(false);
    expect(autopilotNextFromEvidence([sensitiveRecord], consent, [], { plan: [bigFive.id] }))
      .toMatchObject({ instrumentId: bigFive.id, requiresConfirmation: true });
  });
});
