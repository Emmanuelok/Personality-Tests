import type { Instrument } from "../types";
import { bigFive } from "./bigfive";
import { jungTypes } from "./jung";
import { enneagram } from "./enneagram";

/** All instruments available on the platform, in display order. */
export const INSTRUMENTS: Instrument[] = [bigFive, jungTypes, enneagram];

const BY_ID = new Map(INSTRUMENTS.map((i) => [i.id, i]));

export function getInstrument(id: string): Instrument | undefined {
  return BY_ID.get(id);
}

export { bigFive, jungTypes, enneagram };
