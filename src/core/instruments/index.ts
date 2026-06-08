import type { Instrument } from "../types";
import { bigFive } from "./bigfive";
import { hexaco } from "./hexaco";
import { jungTypes } from "./jung";
import { enneagram } from "./enneagram";
import { disc } from "./disc";
import { attachment } from "./attachment";
import { darkTriad } from "./darktriad";

/** All instruments available on the platform, in display order. */
export const INSTRUMENTS: Instrument[] = [bigFive, hexaco, jungTypes, enneagram, disc, attachment, darkTriad];

const BY_ID = new Map(INSTRUMENTS.map((i) => [i.id, i]));

export function getInstrument(id: string): Instrument | undefined {
  return BY_ID.get(id);
}

export { bigFive, hexaco, jungTypes, enneagram, disc, attachment, darkTriad };
