import { describe, expect, it } from "vitest";
import {
  getLandingScrollProgress,
  getLandingVideoTime,
  shouldLoadLandingVideo,
} from "./landingMedia";

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

describe("landing hero scroll timeline", () => {
  it("clamps document scroll to a normalized sticky-sequence progress", () => {
    const geometry = {
      sequenceTop: 400,
      sequenceHeight: 2700,
      viewportHeight: 900,
    };

    expect(getLandingScrollProgress({ ...geometry, scrollY: 0 })).toBe(0);
    expect(getLandingScrollProgress({ ...geometry, scrollY: 1300 })).toBe(0.5);
    expect(getLandingScrollProgress({ ...geometry, scrollY: 2200 })).toBe(1);
    expect(getLandingScrollProgress({ ...geometry, scrollY: 4000 })).toBe(1);
  });

  it("treats a collapsed runway as a static opening frame", () => {
    expect(getLandingScrollProgress({
      scrollY: 900,
      sequenceTop: 0,
      sequenceHeight: 900,
      viewportHeight: 900,
    })).toBe(0);
  });

  it("maps forward and reverse progress to frame-quantized video time", () => {
    expect(getLandingVideoTime(0, 8)).toBe(0);
    expect(getLandingVideoTime(0.5, 8)).toBe(4);
    expect(getLandingVideoTime(0.25, 8)).toBe(2);
    expect(getLandingVideoTime(1, 8)).toBeCloseTo(8 - 1 / 24, 6);
  });

  it("never seeks outside a playable duration", () => {
    expect(getLandingVideoTime(-10, 8)).toBe(0);
    expect(getLandingVideoTime(10, 8)).toBeCloseTo(8 - 1 / 24, 6);
    expect(getLandingVideoTime(0.5, Number.NaN)).toBe(0);
    expect(getLandingVideoTime(0.5, 0)).toBe(0);
  });
});
