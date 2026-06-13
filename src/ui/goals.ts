import { goalKeys } from "@core/roadmap";

/**
 * Shared goal options for onboarding and the dashboard goal editor, so both
 * render the same chips and speak the same language.
 */

export type Loc = "en" | "es" | "fr";
export const toLoc = (l: string): Loc => (l === "es" || l === "fr" ? l : "en");

export const GOALS: { key: string; icon: string; label: Record<Loc, string> }[] = [
  { key: "self", icon: "🧭", label: { en: "Understand myself", es: "Comprenderme", fr: "Me comprendre" } },
  { key: "grow", icon: "🌱", label: { en: "Grow & improve", es: "Crecer y mejorar", fr: "Grandir et progresser" } },
  { key: "relationships", icon: "💞", label: { en: "Better relationships", es: "Mejores relaciones", fr: "Meilleures relations" } },
  { key: "career", icon: "💼", label: { en: "Career & work", es: "Carrera y trabajo", fr: "Carrière et travail" } },
  { key: "wellbeing", icon: "🫀", label: { en: "Emotional wellbeing", es: "Bienestar emocional", fr: "Bien-être émotionnel" } },
  { key: "curious", icon: "✨", label: { en: "Just curious", es: "Solo curiosidad", fr: "Juste curieux" } },
];

/** Localized labels for a set of goal keys (what we persist on the profile). */
export function labelsFor(keys: string[], locale: string): string[] {
  const L = toLoc(locale);
  return keys.map((k) => GOALS.find((g) => g.key === k)?.label[L] ?? k);
}

/** Map stored focus labels (any language) back to the goal keys, for re-selecting chips. */
export function keysFromFocus(focus: string[]): string[] {
  return goalKeys(focus);
}
