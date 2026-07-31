export interface LandingMediaSignals {
  reducedMotion: boolean;
  reducedData: boolean;
  saveData: boolean;
  effectiveType?: string;
}

export const LANDING_VIDEO_FPS = 24;

export function clampLandingProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}

export function getLandingScrollProgress({
  scrollY,
  sequenceTop,
  sequenceHeight,
  viewportHeight,
}: {
  scrollY: number;
  sequenceTop: number;
  sequenceHeight: number;
  viewportHeight: number;
}): number {
  const range = sequenceHeight - viewportHeight;
  if (!Number.isFinite(range) || range <= 0) return 0;
  return clampLandingProgress((scrollY - sequenceTop) / range);
}

export function getLandingVideoTime(
  progress: number,
  duration: number,
  fps = LANDING_VIDEO_FPS,
): number {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(fps) || fps <= 0) {
    return 0;
  }
  const lastSafeFrame = Math.max(0, duration - 1 / fps);
  const requestedTime = clampLandingProgress(progress) * duration;
  const quantizedTime = Math.round(requestedTime * fps) / fps;
  return Math.min(lastSafeFrame, Math.max(0, quantizedTime));
}

export function shouldLoadLandingVideo({
  reducedMotion,
  reducedData,
  saveData,
  effectiveType,
}: LandingMediaSignals): boolean {
  if (reducedMotion || reducedData || saveData) return false;
  return effectiveType !== "slow-2g" && effectiveType !== "2g" && effectiveType !== "3g";
}
