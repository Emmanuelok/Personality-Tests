import { it, expect } from "vitest";
import { createElement as h } from "react";
import { Document, Page, Text, renderToBuffer } from "@react-pdf/renderer";
import { scoreAssessment } from "@core/scoring";
import { composeReport } from "@core/report/composer";
import { bigFive, disc } from "@core/instruments";
import { ABILITY_TESTS, scoreAbility } from "@core/ability";
import { buildBattery } from "@core/ability/chc";
import { makeReportDoc, makePosterDoc, makeCognitiveDoc, makeBatteryDoc } from "./pdf";

it("renders a valid PDF buffer", async () => {
  const doc = h(Document, null, h(Page, null, h(Text, null, "Psyche Atlas PDF smoke test")));
  const buf = await renderToBuffer(doc as any);
  expect(buf.length).toBeGreaterThan(500);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
});

it("renders the designed report PDF (illustrated cover seal + theme)", async () => {
  const responses = Object.fromEntries(bigFive.items.map((i) => [i.id, 4]));
  const result = scoreAssessment(bigFive, responses);
  const report = composeReport(bigFive, result, { seed: 7 });
  const buf = await renderToBuffer(makeReportDoc(bigFive, result, report) as any);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(buf.length).toBeGreaterThan(2000);
});

it("renders the poster PDF for a typological result", async () => {
  const responses = Object.fromEntries(disc.items.map((i) => [i.id, 5]));
  const result = scoreAssessment(disc, responses);
  const report = composeReport(disc, result, { seed: 7 });
  const buf = await renderToBuffer(makePosterDoc(disc, report) as any);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(buf.length).toBeGreaterThan(2000);
});

it("renders the cognitive report PDF", async () => {
  const t = ABILITY_TESTS[0];
  const responses = Object.fromEntries(t.items.map((i) => [i.id, i.answer]));
  const result = scoreAbility(t, responses);
  const buf = await renderToBuffer(makeCognitiveDoc(t, result) as any);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(buf.length).toBeGreaterThan(2000);
});

it("renders the cognitive battery PDF", async () => {
  const battery = buildBattery([{ chc: { Gf: 80, Gc: 70 } }, { chc: { Gv: 60, Gsm: 55 } }, { chc: { Gs: 65 } }]);
  expect(battery).not.toBeNull();
  const buf = await renderToBuffer(makeBatteryDoc(battery!) as any);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(buf.length).toBeGreaterThan(2000);
});
