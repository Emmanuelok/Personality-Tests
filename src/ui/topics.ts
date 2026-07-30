import type { Loc } from "./goals";

/**
 * One-tap discovery topics shared by the catalog search (Home) and the
 * Study Together room builder. Each `q` is a canonical English keyword the
 * search engine's theme map recognizes, so a tap returns the same relevant set
 * in any language; the label is what the user sees.
 */
export const TOPICS: { key: string; q: string; label: Record<Loc, string> }[] = [
  { key: "personality", q: "personality", label: { en: "Personality", es: "Personalidad", fr: "Personnalité" } },
  { key: "relationships", q: "relationships", label: { en: "Relationships", es: "Relaciones", fr: "Relations" } },
  { key: "career", q: "career", label: { en: "Career & work", es: "Carrera y trabajo", fr: "Carrière & travail" } },
  { key: "stress", q: "stress", label: { en: "Stress & anxiety", es: "Estrés y ansiedad", fr: "Stress & anxiété" } },
  { key: "wellbeing", q: "wellbeing", label: { en: "Wellbeing", es: "Bienestar", fr: "Bien-être" } },
  { key: "emotions", q: "emotions", label: { en: "Emotions", es: "Emociones", fr: "Émotions" } },
  { key: "communication", q: "communication", label: { en: "Communication", es: "Comunicación", fr: "Communication" } },
  { key: "confidence", q: "confidence", label: { en: "Confidence", es: "Confianza", fr: "Confiance" } },
  { key: "values", q: "values", label: { en: "Values", es: "Valores", fr: "Valeurs" } },
  { key: "learning", q: "learning", label: { en: "Learning", es: "Aprendizaje", fr: "Apprentissage" } },
];
