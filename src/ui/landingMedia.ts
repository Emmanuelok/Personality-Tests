export interface LandingMediaSignals {
  reducedMotion: boolean;
  reducedData: boolean;
  saveData: boolean;
  effectiveType?: string;
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
