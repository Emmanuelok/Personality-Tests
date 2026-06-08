import type { Instrument } from "../types";
import { bigFive } from "./bigfive";
import { hexaco } from "./hexaco";
import { jungTypes } from "./jung";
import { enneagram } from "./enneagram";
import { disc } from "./disc";
import { attachment } from "./attachment";
import { loveLanguages } from "./lovelanguages";
import { via } from "./via";
import { values } from "./values";
import { grit } from "./grit";
import { eq } from "./eq";
import { darkTriad } from "./darktriad";

/** All instruments available on the platform, grouped loosely by category. */
export const INSTRUMENTS: Instrument[] = [
  bigFive,
  hexaco,
  jungTypes,
  enneagram,
  disc,
  attachment,
  loveLanguages,
  via,
  values,
  grit,
  eq,
  darkTriad,
];

const BY_ID = new Map(INSTRUMENTS.map((i) => [i.id, i]));

export function getInstrument(id: string): Instrument | undefined {
  return BY_ID.get(id);
}

/** Instruments in a given category, in catalog order. */
export function instrumentsByCategory(categoryId: string): Instrument[] {
  return INSTRUMENTS.filter((i) => i.category === categoryId);
}

export { bigFive, hexaco, jungTypes, enneagram, disc, attachment, loveLanguages, via, values, grit, eq, darkTriad };
