import type { Category } from "./categories";

/**
 * Localized names + blurbs for the catalog categories (es/fr; English lives in
 * categories.ts). Same additive pattern as the instrument i18n layer: unknown
 * locales fall back to the original object untouched.
 */

type CatStrings = Record<string, { name: string; blurb: string }>;

const ES: CatStrings = {
  core: { name: "Personalidad central", blurb: "Modelos de rasgos amplios y validados que mapean el conjunto de tu personalidad." },
  types: { name: "Tipos y estilos", blurb: "Tipologías que ordenan tus patrones de energía, pensamiento y conducta en estilos reconocibles." },
  relationships: { name: "Relaciones y amor", blurb: "Cómo te vinculas, conectas y amas — y qué tan bien encajas con las personas que te importan." },
  communication: { name: "Comunicación y conflicto", blurb: "Cómo te expresas, escuchas y resuelves la fricción — con parejas, compañeros y todo el mundo." },
  strengths: { name: "Fortalezas, valores y crecimiento", blurb: "En qué eres excelente, qué te importa y qué te mantiene avanzando." },
  career: { name: "Carrera y vocación", blurb: "El trabajo, los entornos y los roles donde darás lo mejor y te sentirás más vivo." },
  emotional: { name: "Inteligencia emocional y bienestar", blurb: "Tu mundo interior: emociones, resiliencia y las habilidades detrás de una buena vida." },
  wellbeing: { name: "Estrés y bienestar", blurb: "Estrés, afrontamiento, agotamiento, ánimo y florecimiento: una lectura honesta de cómo estás de verdad." },
  learning: { name: "Aprendizaje y pensamiento", blurb: "Cómo recibes, procesas y usas la información: modelos populares, sometidos a un escrutinio científico honesto." },
  mind: { name: "Mente y neurodivergencia", blurb: "Autoevaluaciones educativas sobre cómo está cableado tu cerebro. Comprensión, nunca un diagnóstico." },
  focused: { name: "Escalas focalizadas", blurb: "Un constructo, medido bien: clásicos de la investigación que enfocan un único rasgo poderoso." },
  shadow: { name: "Sombra y riesgo", blurb: "Los lados más oscuros y arriesgados de la personalidad normal, vistos con honestidad, para crecer." },
};

const FR: CatStrings = {
  core: { name: "Personnalité fondamentale", blurb: "De grands modèles de traits validés qui cartographient l'ensemble de votre personnalité." },
  types: { name: "Types et styles", blurb: "Des typologies qui classent vos schémas d'énergie, de pensée et de comportement en styles reconnaissables." },
  relationships: { name: "Relations et amour", blurb: "Comment vous vous attachez, vous liez et aimez — et votre entente avec ceux qui comptent." },
  communication: { name: "Communication et conflit", blurb: "Comment vous vous exprimez, écoutez et résolvez les frictions — avec partenaires, coéquipiers et tout le monde." },
  strengths: { name: "Forces, valeurs et croissance", blurb: "Ce en quoi vous excellez, ce qui vous tient à cœur et ce qui vous fait avancer." },
  career: { name: "Carrière et vocation", blurb: "Le travail, les environnements et les rôles où vous donnerez le meilleur et vous sentirez le plus vivant." },
  emotional: { name: "Intelligence émotionnelle et bien-être", blurb: "Votre monde intérieur : émotions, résilience et les compétences d'une vie qui va bien." },
  wellbeing: { name: "Stress et bien-être", blurb: "Stress, adaptation, épuisement, humeur et épanouissement : une lecture honnête de comment vous allez vraiment." },
  learning: { name: "Apprentissage et pensée", blurb: "Comment vous recevez, traitez et utilisez l'information — des modèles populaires, soumis à un examen scientifique honnête." },
  mind: { name: "Esprit et neurodivergence", blurb: "Des auto-questionnaires éducatifs sur le câblage de votre cerveau. De la compréhension, jamais un diagnostic." },
  focused: { name: "Échelles ciblées", blurb: "Un seul construit, bien mesuré : des classiques de la recherche braqués sur un trait puissant." },
  shadow: { name: "Ombre et risque", blurb: "Les côtés plus sombres et risqués de la personnalité ordinaire — vus avec honnêteté, pour grandir." },
};

const BUNDLES: Record<string, CatStrings> = { es: ES, fr: FR };

export function localizeCategory(cat: Category, locale?: string): Category {
  const b = locale ? BUNDLES[locale]?.[cat.id] : undefined;
  return b ? { ...cat, name: b.name, blurb: b.blurb } : cat;
}
