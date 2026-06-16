import type { Instrument } from "../types";
import { bigFive } from "./bigfive";
import { hexaco } from "./hexaco";
import { eysenck } from "./eysenck";
import { sixteenPf } from "./sixteenpf";
import { bigFiveAspects } from "./bigfiveaspects";
import { tci } from "./tci";
import { zkpq } from "./zkpq";
import { anchors } from "./anchors";
import { leadership } from "./leadership";
import { mcclelland } from "./mcclelland";
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
import { mood } from "./mood";
import { worry } from "./worry";
import { burnout } from "./burnout";
import { pss } from "./pss";
import { panas } from "./panas";
import { ryff } from "./ryff";
import { cope } from "./cope";
import { vark } from "./vark";
import { kolb } from "./kolb";
import { adhd } from "./adhd";
import { autism } from "./autism";
import { selfEsteem } from "./selfesteem";
import { locus } from "./locus";
import { mindset } from "./mindset";
import { selfMonitoring } from "./selfmonitoring";
import { sensationSeeking } from "./sensationseeking";
import { needForCognition } from "./needforcognition";
import { empathy } from "./empathy";
import { lifeSatisfaction } from "./lifesatisfaction";
import { resilience } from "./resilience";
import { darkTriad } from "./darktriad";
import { darkTetrad } from "./darktetrad";
import { pid5 } from "./pid5";
import { optimism } from "./optimism";
import { hope } from "./hope";
import { curiosity } from "./curiosity";
import { selfControl } from "./selfcontrol";
import { selfEfficacy } from "./selfefficacy";
import { emotionRegulation } from "./emotionregulation";
import { procrastination } from "./procrastination";
import { perfectionism } from "./perfectionism";
import { gratitude } from "./gratitude";
import { coupleComm } from "./couplecomm";
import { teamComm } from "./teamcomm";
import { commStyle } from "./commstyle";
import { moneyScripts } from "./moneyscripts";

/** All instruments available on the platform, grouped loosely by category. */
export const INSTRUMENTS: Instrument[] = [
  bigFive,
  hexaco,
  eysenck,
  sixteenPf,
  bigFiveAspects,
  tci,
  zkpq,
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
  coupleComm,
  teamComm,
  commStyle,
  via,
  values,
  grit,
  moralFoundations,
  rokeach,
  mcclelland,
  riasec,
  derailers,
  anchors,
  leadership,
  eq,
  chronotype,
  perma,
  mood,
  worry,
  burnout,
  pss,
  panas,
  ryff,
  cope,
  moneyScripts,
  vark,
  kolb,
  adhd,
  autism,
  selfEsteem,
  locus,
  mindset,
  selfMonitoring,
  sensationSeeking,
  needForCognition,
  empathy,
  lifeSatisfaction,
  resilience,
  darkTriad,
  darkTetrad,
  pid5,
  optimism,
  hope,
  curiosity,
  selfControl,
  selfEfficacy,
  emotionRegulation,
  procrastination,
  perfectionism,
  gratitude,
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
  tci,
  zkpq,
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
  coupleComm,
  teamComm,
  commStyle,
  via,
  values,
  grit,
  moralFoundations,
  rokeach,
  mcclelland,
  riasec,
  derailers,
  anchors,
  leadership,
  eq,
  chronotype,
  perma,
  mood,
  worry,
  burnout,
  pss,
  panas,
  ryff,
  cope,
  moneyScripts,
  vark,
  kolb,
  adhd,
  autism,
  selfEsteem,
  locus,
  mindset,
  selfMonitoring,
  sensationSeeking,
  needForCognition,
  empathy,
  lifeSatisfaction,
  resilience,
  darkTriad,
  darkTetrad,
  pid5,
  optimism,
  hope,
  curiosity,
  selfControl,
  selfEfficacy,
  emotionRegulation,
  procrastination,
  perfectionism,
  gratitude,
};
