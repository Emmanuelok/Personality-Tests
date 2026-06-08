/**
 * UI string catalog. `useI18n().t("key")` resolves these with an English fallback.
 * The data-driven instruments are localized separately (see core/instruments/i18n.ts);
 * this covers the chrome and the take/report experience.
 */

export type Locale = "en" | "es" | "fr";

export const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
];

export type StringKey =
  | "brand.tagline"
  | "nav.assessments" | "nav.integrated" | "nav.journey" | "nav.compatibility"
  | "common.back" | "common.allAssessments" | "lang.label"
  | "intro.begin" | "intro.before" | "intro.namePlaceholder" | "intro.honest" | "intro.meta"
  | "calc.1" | "calc.2" | "calc.3"
  | "report.personal" | "report.snapshot" | "report.glance" | "report.traitByTrait" | "report.dimByDim"
  | "report.dynamics" | "report.unique" | "report.responsibly" | "report.strengths" | "report.watchouts"
  | "report.takeAnother" | "report.shareCard"
  | "paywall.unlock" | "paywall.takeDifferent"
  | "ability.before" | "ability.timed" | "ability.beginTest" | "ability.next" | "ability.seeResult" | "ability.qOf" | "ability.changeAnswers";

type Dict = Record<StringKey, string>;

const en: Dict = {
  "brand.tagline": "Know yourself with scientific depth.",
  "nav.assessments": "Assessments", "nav.integrated": "Integrated", "nav.journey": "Journey", "nav.compatibility": "Compatibility",
  "common.back": "Back", "common.allAssessments": "All assessments", "lang.label": "Language",
  "intro.begin": "Begin the assessment →", "intro.before": "Before you start",
  "intro.namePlaceholder": "Your name (optional)",
  "intro.honest": "Choose the answer that feels most like the real you — not who you wish you were. There are no right answers, just your honest instinct.",
  "intro.meta": "About {m} min · {n} questions · no sign-up, nothing leaves your device",
  "calc.1": "Reading your responses…", "calc.2": "Weighing the patterns…", "calc.3": "Composing your report…",
  "report.personal": "Personal Report", "report.snapshot": "Free snapshot",
  "report.glance": "Your Profile at a Glance", "report.traitByTrait": "Trait by Trait", "report.dimByDim": "Dimension by Dimension",
  "report.dynamics": "How Your Traits Interact", "report.unique": "What Makes This Profile Uniquely Yours",
  "report.responsibly": "Read responsibly", "report.strengths": "Strengths", "report.watchouts": "Watch-outs",
  "report.takeAnother": "Take another", "report.shareCard": "Share card",
  "paywall.unlock": "Unlock your full report", "paywall.takeDifferent": "Take a different assessment",
  "ability.before": "Before you start",
  "ability.timed": "This is a timed ability test — the questions have right and wrong answers. Work somewhere quiet, move quickly but carefully, and don't look anything up. Your result is an educational estimate, shown as a range — never a clinical IQ score.",
  "ability.beginTest": "Begin the test →", "ability.next": "Next →", "ability.seeResult": "See my result →",
  "ability.qOf": "Question {i} of {n}", "ability.changeAnswers": "You can go back and change answers any time before you finish.",
};

const es: Dict = {
  "brand.tagline": "Conócete con profundidad científica.",
  "nav.assessments": "Evaluaciones", "nav.integrated": "Yo integrado", "nav.journey": "Trayecto", "nav.compatibility": "Compatibilidad",
  "common.back": "Atrás", "common.allAssessments": "Todas las evaluaciones", "lang.label": "Idioma",
  "intro.begin": "Comenzar la evaluación →", "intro.before": "Antes de empezar",
  "intro.namePlaceholder": "Tu nombre (opcional)",
  "intro.honest": "Elige la respuesta que más se parezca a tu verdadero yo, no a quien desearías ser. No hay respuestas correctas, solo tu instinto sincero.",
  "intro.meta": "Unos {m} min · {n} preguntas · sin registro, nada sale de tu dispositivo",
  "calc.1": "Leyendo tus respuestas…", "calc.2": "Sopesando los patrones…", "calc.3": "Componiendo tu informe…",
  "report.personal": "Informe personal", "report.snapshot": "Resumen gratuito",
  "report.glance": "Tu perfil de un vistazo", "report.traitByTrait": "Rasgo por rasgo", "report.dimByDim": "Dimensión por dimensión",
  "report.dynamics": "Cómo interactúan tus rasgos", "report.unique": "Lo que hace este perfil únicamente tuyo",
  "report.responsibly": "Léelo con responsabilidad", "report.strengths": "Fortalezas", "report.watchouts": "Puntos de atención",
  "report.takeAnother": "Hacer otra", "report.shareCard": "Tarjeta para compartir",
  "paywall.unlock": "Desbloquea tu informe completo", "paywall.takeDifferent": "Hacer otra evaluación",
  "ability.before": "Antes de empezar",
  "ability.timed": "Esta es una prueba de aptitud cronometrada: las preguntas tienen respuestas correctas e incorrectas. Hazla en un lugar tranquilo, ve rápido pero con cuidado y no consultes nada. Tu resultado es una estimación educativa, mostrada como un rango, nunca un CI clínico.",
  "ability.beginTest": "Comenzar la prueba →", "ability.next": "Siguiente →", "ability.seeResult": "Ver mi resultado →",
  "ability.qOf": "Pregunta {i} de {n}", "ability.changeAnswers": "Puedes volver atrás y cambiar tus respuestas antes de terminar.",
};

const fr: Dict = {
  "brand.tagline": "Connais-toi avec une profondeur scientifique.",
  "nav.assessments": "Évaluations", "nav.integrated": "Moi intégré", "nav.journey": "Parcours", "nav.compatibility": "Compatibilité",
  "common.back": "Retour", "common.allAssessments": "Toutes les évaluations", "lang.label": "Langue",
  "intro.begin": "Commencer l'évaluation →", "intro.before": "Avant de commencer",
  "intro.namePlaceholder": "Votre nom (facultatif)",
  "intro.honest": "Choisissez la réponse qui vous ressemble le plus — pas celle que vous aimeriez. Il n'y a pas de bonne réponse, seulement votre instinct sincère.",
  "intro.meta": "Environ {m} min · {n} questions · sans inscription, rien ne quitte votre appareil",
  "calc.1": "Lecture de vos réponses…", "calc.2": "Analyse des tendances…", "calc.3": "Composition de votre rapport…",
  "report.personal": "Rapport personnel", "report.snapshot": "Aperçu gratuit",
  "report.glance": "Votre profil en un coup d'œil", "report.traitByTrait": "Trait par trait", "report.dimByDim": "Dimension par dimension",
  "report.dynamics": "Comment vos traits interagissent", "report.unique": "Ce qui rend ce profil unique",
  "report.responsibly": "À lire avec discernement", "report.strengths": "Forces", "report.watchouts": "Points de vigilance",
  "report.takeAnother": "En faire un autre", "report.shareCard": "Carte à partager",
  "paywall.unlock": "Débloquez votre rapport complet", "paywall.takeDifferent": "Faire une autre évaluation",
  "ability.before": "Avant de commencer",
  "ability.timed": "Ceci est un test d'aptitude chronométré — les questions ont de bonnes et de mauvaises réponses. Installez-vous au calme, allez vite mais avec soin, et ne cherchez rien. Votre résultat est une estimation éducative, présentée sous forme de fourchette — jamais un QI clinique.",
  "ability.beginTest": "Commencer le test →", "ability.next": "Suivant →", "ability.seeResult": "Voir mon résultat →",
  "ability.qOf": "Question {i} sur {n}", "ability.changeAnswers": "Vous pouvez revenir en arrière et modifier vos réponses avant de terminer.",
};

export const STRINGS: Record<Locale, Dict> = { en, es, fr };
