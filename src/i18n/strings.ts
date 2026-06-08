/**
 * UI string catalog. This is i18n *scaffolding*: the chrome and shared UI strings
 * are localized here, and `useI18n().t("key")` resolves them with an English
 * fallback. The data-driven instruments (items, scales, narratives) are a much
 * larger content layer — they can be localized later by providing translated
 * instrument data keyed by locale; the engine is already framework- and
 * language-agnostic, so nothing structural blocks it.
 */

export type Locale = "en" | "es" | "fr";

export const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
];

export type StringKey =
  | "brand.tagline"
  | "nav.assessments"
  | "nav.integrated"
  | "nav.journey"
  | "nav.compatibility"
  | "common.back"
  | "common.allAssessments"
  | "lang.label";

type Dict = Record<StringKey, string>;

const en: Dict = {
  "brand.tagline": "Know yourself with scientific depth.",
  "nav.assessments": "Assessments",
  "nav.integrated": "Integrated",
  "nav.journey": "Journey",
  "nav.compatibility": "Compatibility",
  "common.back": "Back",
  "common.allAssessments": "All assessments",
  "lang.label": "Language",
};

const es: Dict = {
  "brand.tagline": "Conócete con profundidad científica.",
  "nav.assessments": "Evaluaciones",
  "nav.integrated": "Yo integrado",
  "nav.journey": "Trayecto",
  "nav.compatibility": "Compatibilidad",
  "common.back": "Atrás",
  "common.allAssessments": "Todas las evaluaciones",
  "lang.label": "Idioma",
};

const fr: Dict = {
  "brand.tagline": "Connais-toi avec une profondeur scientifique.",
  "nav.assessments": "Évaluations",
  "nav.integrated": "Moi intégré",
  "nav.journey": "Parcours",
  "nav.compatibility": "Compatibilité",
  "common.back": "Retour",
  "common.allAssessments": "Toutes les évaluations",
  "lang.label": "Langue",
};

export const STRINGS: Record<Locale, Dict> = { en, es, fr };
