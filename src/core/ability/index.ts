import type { AbilityTest } from "./types";
import { cognitive } from "./tests/cognitive";
import { culturefair } from "./tests/culturefair";
import { speed } from "./tests/speed";
import { critical } from "./tests/critical";
import { mechanical } from "./tests/mechanical";
import { sjt } from "./tests/sjt";

export const ABILITY_TESTS: AbilityTest[] = [cognitive, culturefair, speed, critical, mechanical, sjt];

const BY_ID = new Map(ABILITY_TESTS.map((t) => [t.id, t]));
export function getAbilityTest(id: string): AbilityTest | undefined {
  return BY_ID.get(id);
}

export { practiceObservation, scoreAbility, scoreAbilitySubmission } from "./score";
export { cognitive, culturefair, speed, critical, mechanical, sjt };
export type { AbilitySubmission } from "./score";
export type { AbilityTest, AbilityItem, AbilityResult, AbilityResponses, AbilityDomain, DomainScore, AbilityDomainId } from "./types";
