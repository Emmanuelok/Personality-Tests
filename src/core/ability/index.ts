import type { AbilityTest } from "./types";
import { cognitive } from "./tests/cognitive";
import { culturefair } from "./tests/culturefair";
import { speed } from "./tests/speed";

export const ABILITY_TESTS: AbilityTest[] = [cognitive, culturefair, speed];

const BY_ID = new Map(ABILITY_TESTS.map((t) => [t.id, t]));
export function getAbilityTest(id: string): AbilityTest | undefined {
  return BY_ID.get(id);
}

export { scoreAbility } from "./score";
export { cognitive, culturefair, speed };
export type { AbilityTest, AbilityItem, AbilityResult, AbilityResponses, AbilityDomain, DomainScore, AbilityDomainId } from "./types";
