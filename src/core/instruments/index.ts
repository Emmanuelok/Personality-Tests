import type { Instrument } from "../types";
import { bigFive } from "./bigfive";
import { hexaco } from "./hexaco";
import { eysenck } from "./eysenck";
import { sixteenPf } from "./sixteenpf";
import { bigFiveAspects } from "./bigfiveaspects";
import { jungTypes } from "./jung";
import { keirsey } from "./keirsey";
import { enneagram } from "./enneagram";
import { disc } from "./disc";
import { temperaments } from "./fourtemperaments";
import { colorStyles } from "./colorstyles";
import { socionics } from "./socionics";
import { attachment } from "./attachment";
import { loveLanguages } from "./lovelanguages";
import { conflictStyle } from "./conflictstyle";
import { via } from "./via";
import { values } from "./values";
import { grit } from "./grit";
import { moralFoundations } from "./moralfoundations";
import { rokeach } from "./rokeach";
import { riasec } from "./riasec";
import { derailers } from "./derailers";
import { eq } from "./eq";
import { chronotype } from "./chronotype";
import { perma } from "./perma";
import { adhd } from "./adhd";
import { autism } from "./autism";
import { darkTriad } from "./darktriad";
import { darkTetrad } from "./darktetrad";
import { pid5 } from "./pid5";

/** All instruments available on the platform, grouped loosely by category. */
export const INSTRUMENTS: Instrument[] = [
  bigFive,
  hexaco,
  eysenck,
  sixteenPf,
  bigFiveAspects,
  jungTypes,
  keirsey,
  enneagram,
  disc,
  temperaments,
  colorStyles,
  socionics,
  attachment,
  loveLanguages,
  conflictStyle,
  via,
  values,
  grit,
  moralFoundations,
  rokeach,
  riasec,
  derailers,
  eq,
  chronotype,
  perma,
  adhd,
  autism,
  darkTriad,
  darkTetrad,
  pid5,
];

const BY_ID = new Map(INSTRUMENTS.map((i) => [i.id, i]));

export function getInstrument(id: string): Instrument | undefined {
  return BY_ID.get(id);
}

/** Instruments in a given category, in catalog order. */
export function instrumentsByCategory(categoryId: string): Instrument[] {
  return INSTRUMENTS.filter((i) => i.category === categoryId);
}

export {
  bigFive,
  hexaco,
  eysenck,
  sixteenPf,
  bigFiveAspects,
  jungTypes,
  keirsey,
  enneagram,
  disc,
  temperaments,
  colorStyles,
  socionics,
  attachment,
  loveLanguages,
  conflictStyle,
  via,
  values,
  grit,
  moralFoundations,
  rokeach,
  riasec,
  derailers,
  eq,
  chronotype,
  perma,
  adhd,
  autism,
  darkTriad,
  darkTetrad,
  pid5,
};
