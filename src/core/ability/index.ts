import type { AbilityTest } from "./types";
import { cognitive } from "./tests/cognitive";

export const ABILITY_TESTS: AbilityTest[] = [cognitive];

const BY_ID = new Map(ABILITY_TESTS.map((t) => [t.id, t]));
export function getAbilityTest(id: string): AbilityTest | undefined {
  return BY_ID.get(id);
}

export { scoreAbility } from "./score";
export { cognitive };
export type { AbilityTest, AbilityItem, AbilityResult, AbilityResponses, AbilityDomain, DomainScore, AbilityDomainId } from "./types";
