import { it, expect } from "vitest";
import { createElement as h } from "react";
import { Document, Page, Text, renderToBuffer } from "@react-pdf/renderer";

it("renders a valid PDF buffer", async () => {
  const doc = h(Document, null, h(Page, null, h(Text, null, "Psyche Atlas PDF smoke test")));
  const buf = await renderToBuffer(doc as any);
  expect(buf.length).toBeGreaterThan(500);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
});
