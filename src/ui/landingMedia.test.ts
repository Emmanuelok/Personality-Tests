import { describe, expect, it } from "vitest";
import { shouldLoadLandingVideo } from "./landingMedia";

const defaultSignals = {
  reducedMotion: false,
  reducedData: false,
  saveData: false,
  effectiveType: "4g",
};

describe("landing hero media", () => {
  it("loads the cinematic video for an unrestricted connection", () => {
    expect(shouldLoadLandingVideo(defaultSignals)).toBe(true);
    expect(shouldLoadLandingVideo({ ...defaultSignals, effectiveType: undefined })).toBe(true);
  });

  it("keeps the poster for reduced-motion and reduced-data preferences", () => {
    expect(shouldLoadLandingVideo({ ...defaultSignals, reducedMotion: true })).toBe(false);
    expect(shouldLoadLandingVideo({ ...defaultSignals, reducedData: true })).toBe(false);
    expect(shouldLoadLandingVideo({ ...defaultSignals, saveData: true })).toBe(false);
  });

  it("keeps the poster on constrained mobile connections", () => {
    expect(shouldLoadLandingVideo({ ...defaultSignals, effectiveType: "slow-2g" })).toBe(false);
    expect(shouldLoadLandingVideo({ ...defaultSignals, effectiveType: "2g" })).toBe(false);
    expect(shouldLoadLandingVideo({ ...defaultSignals, effectiveType: "3g" })).toBe(false);
  });
});
