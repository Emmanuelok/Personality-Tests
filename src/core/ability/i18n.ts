/**
 * Localization layer for the cognitive-ability subsystem — the analog of
 * core/instruments/i18n.ts. It keeps scoring language-agnostic (the scorers
 * keep emitting their canonical English observation labels and ids) and translates
 * only at the display edge. Two concerns:
 *
 *   1. localizeObservation — the finite set of task observations scorers return.
 *   2. localizeAbilityMeta — per-test display copy (name, description, tagline,
 *                       caveats) for the standalone cognition flows, keyed by
 *                       test id, mirroring how instruments are translated.
 *
 * Anything without a translation falls back to the original English, so adding
 * a language is purely additive and never breaks an untranslated test.
 */

const OBSERVATIONS: Record<string, Record<string, string>> = {
  es: {
    "Strong performance on this practice set": "Desempeño sólido en este conjunto de práctica",
    "Mostly consistent performance on this practice set": "Desempeño mayormente consistente en este conjunto de práctica",
    "Mixed performance on this practice set": "Desempeño mixto en este conjunto de práctica",
    "Developing familiarity with this practice set": "Familiaridad en desarrollo con este conjunto de práctica",
    "Limited evidence from this attempt": "Evidencia limitada en este intento",
  },
  fr: {
    "Strong performance on this practice set": "Performance solide sur cet ensemble d'exercices",
    "Mostly consistent performance on this practice set": "Performance plutôt régulière sur cet ensemble d'exercices",
    "Mixed performance on this practice set": "Performance contrastée sur cet ensemble d'exercices",
    "Developing familiarity with this practice set": "Familiarisation en cours avec cet ensemble d'exercices",
    "Limited evidence from this attempt": "Peu d'éléments à tirer de cet essai",
  },
};

/** Translate a scorer's task observation; falls back to the English input. */
export function localizeObservation(observation: string, locale: string): string {
  return OBSERVATIONS[locale]?.[observation] ?? observation;
}

/** @deprecated Use localizeObservation. Retained as a display-edge compatibility alias. */
export const localizeBand = localizeObservation;

export interface AbilityMetaTranslation {
  name?: string;
  tagline?: string;
  description?: string;
  caveats?: string[];
}

const ES: Record<string, AbilityMetaTranslation> = {
  "memory-span": {
    name: "Amplitud de memoria de trabajo",
    tagline: "Cuántos elementos puedes retener —y manejar— en la mente a la vez.",
    description:
      "Una prueba en vivo de la memoria de trabajo (Gsm): verás una serie de dígitos, desaparece y la escribes de " +
      "nuevo. Primero en el orden mostrado (amplitud directa, almacenamiento puro) y luego en orden inverso (amplitud " +
      "inversa, almacenamiento más manipulación mental). Es breve, sube de dificultad y mide algo que las pruebas de " +
      "razonamiento no captan.",
    caveats: [
      "Esta es una instantánea educativa de una práctica.",
      "Los navegadores, las distracciones y la tentación de apuntar las cosas afectan al resultado: por favor, no anotes los dígitos; deja que tu memoria haga el trabajo.",
      "El desempeño cambia con el sueño, el estrés, el contexto, la estrategia y la práctica previa.",
      "Lee el índice como una observación de esta tarea y esta sesión, no como un rasgo personal estable.",
    ],
  },
  "corsi-blocks": {
    name: "Memoria espacial (Corsi)",
    tagline: "Observa un camino que se ilumina en el tablero y reprodúcelo de memoria.",
    description:
      "La prueba de golpeo de bloques de Corsi es la contraparte visoespacial de la amplitud de dígitos. Los bloques se " +
      "iluminan uno a uno en una secuencia; tú la reproduces tocándolos en el mismo orden (y luego al revés). Esta actividad " +
      "ofrece una observación de cómo reprodujiste caminos espaciales en esta sesión; no estima una capacidad fija ni te " +
      "compara con tu desempeño en tareas de palabras o números.",
    caveats: [
      "Esta es una instantánea educativa de una práctica.",
      "El tamaño de la pantalla, la precisión del puntero y las distracciones afectan al resultado: trata una sola sesión como una instantánea aproximada.",
      "El desempeño cambia con el sueño, el estrés, el contexto, la estrategia y la práctica previa.",
      "Lee el índice como una observación de esta tarea y esta sesión, no como un rasgo personal estable.",
    ],
  },
  "processing-speed": {
    name: "Velocidad de procesamiento",
    tagline: "Con qué rapidez y precisión tomas decisiones visuales simples.",
    description:
      "La velocidad de procesamiento (Gs) es el motor silencioso detrás de casi todo lo demás: la rapidez con que " +
      "captas y actúas sobre información simple. En el espíritu del subtest de Búsqueda de Símbolos del WAIS, decidirás " +
      "lo más rápido posible si un símbolo objetivo aparece en un pequeño conjunto. Es breve, contra reloj, y la " +
      "precisión sigue contando.",
    caveats: [
      "Esta es una instantánea educativa de una práctica.",
      "El dispositivo de entrada, la pantalla y las distracciones afectan a la velocidad: una pantalla táctil y un ratón no puntúan igual.",
      "El desempeño cambia con el sueño, la concentración, la familiaridad, la práctica previa y el contexto.",
      "Lee el índice como una observación de esta tarea y esta sesión, no como un rasgo personal estable.",
    ],
  },
  "alternative-uses": {
    name: "Pensamiento creativo",
    tagline: "¿Cuántos usos puedes imaginar? Una prueba de pensamiento divergente.",
    description:
      "La Tarea de Usos Alternativos de Guilford es la medida clásica del pensamiento divergente, el motor generador de " +
      "ideas detrás de la creatividad. Para cada objeto cotidiano tendrás un minuto para enumerar tantos usos distintos " +
      "como puedas. Puntuamos la fluidez (cuántas ideas distintas y sensatas produces). No hay respuestas incorrectas: " +
      "deja volar tu mente.",
    caveats: [
      "Esto puntúa la FLUIDEZ (número de ideas), que es solo una faceta de la creatividad: la originalidad y la utilidad también importan y requieren juicio humano.",
      "La fluidez en una sesión depende de la familiaridad, el idioma, el estado de ánimo, el tiempo y la práctica previa.",
      "Esta es una instantánea educativa de una tarea, no un veredicto sobre la creatividad.",
      "El índice describe únicamente cuántas ideas distintas aparecieron en esta tarea.",
    ],
  },
  "iat-demo": {
    name: "Asociaciones implícitas",
    tagline: "Lo que revelan tus reacciones instantáneas: una demostración en vivo.",
    description:
      "El Test de Asociaciones Implícitas mide algo que ningún cuestionario puede: la fuerza de las asociaciones " +
      "mentales automáticas, leída a partir de la rapidez con que clasificas cosas bajo dos emparejamientos. Esta es una " +
      "demostración NEUTRAL —Flores frente a Insectos, emparejados con Agradable frente a Desagradable— para que " +
      "experimentes el método en sí. Clasifica con rapidez y precisión, usando las teclas (o los botones) indicados.",
    caveats: [
      "Esto es una demostración EDUCATIVA de un método, no un diagnóstico. Un solo IAT tiene una fiabilidad test-retest modesta y nunca debe leerse como un hecho fijo sobre ti.",
      "Usamos la versión neutral de Flores/Insectos a propósito. La validez del IAT para medir el sesgo real de una persona en temas sensibles es científicamente discutida, así que aquí no hacemos esas afirmaciones.",
      "El orden, la fatiga y la lateralidad influyen en las puntuaciones del IAT. Trata tu resultado como una mirada divertida al método, no como un veredicto.",
      "La mayoría muestra una asociación flores-agradable: ese es el efecto de demostración esperado, no un defecto tuyo.",
    ],
  },
  "adaptive-reasoning": {
    name: "Razonamiento adaptativo",
    tagline: "La dificultad sigue tus respuestas para mantener enfocada esta sesión de práctica.",
    description:
      "Una prueba de matrices adaptativa por ordenador: si aciertas, la siguiente es más difícil; si fallas, se " +
      "suaviza. Al seguir el nivel de reto alcanzado en esta sesión, mantiene la práctica enfocada sin estimar una " +
      "capacidad fija. Cada acertijo se genera de nuevo, así que no hay dos partidas iguales.",
    caveats: [
      "Esta es una instantánea educativa de una práctica.",
      "La puntuación adaptativa es aproximada: una calibración representativa requeriría datos adecuados; aquí se usan niveles de dificultad basados en reglas.",
      "El índice describe el desempeño en estos acertijos durante esta sesión.",
      "El sueño, la familiaridad, el dispositivo, las distracciones y la práctica previa pueden cambiar la observación.",
    ],
  },
};

const FR: Record<string, AbilityMetaTranslation> = {
  "memory-span": {
    name: "Empan de mémoire de travail",
    tagline: "Combien d'éléments vous pouvez retenir — et manipuler — en tête à la fois.",
    description:
      "Un test en direct de la mémoire de travail (Gsm) : une série de chiffres apparaît, disparaît, et vous la " +
      "retapez. D'abord dans l'ordre affiché (empan direct — stockage pur), puis à l'envers (empan inverse — stockage " +
      "plus manipulation mentale). C'est bref, la difficulté monte, et cela mesure quelque chose que les tests de " +
      "raisonnement ne captent pas.",
    caveats: [
      "Ceci est un instantané éducatif d'un exercice.",
      "Les navigateurs, les distractions et l'envie de noter les choses influent sur le résultat — ne notez pas les chiffres ; laissez votre mémoire travailler.",
      "La performance varie avec le sommeil, le stress, le contexte, la stratégie et l'entraînement antérieur.",
      "Lisez l'indice comme une observation de cette tâche et de cette séance, pas comme un trait personnel stable.",
    ],
  },
  "corsi-blocks": {
    name: "Mémoire spatiale (Corsi)",
    tagline: "Regardez un chemin s'illuminer sur le plateau, puis reproduisez-le de mémoire.",
    description:
      "Le test des blocs de Corsi est le pendant visuo-spatial de l'empan de chiffres. Les blocs s'allument un à un en " +
      "séquence ; vous la reproduisez en les touchant dans le même ordre (puis à l'envers). Cette activité décrit comment " +
      "vous avez reproduit des chemins spatiaux pendant cette séance ; elle n'estime pas une capacité fixe et ne compare " +
      "pas votre performance à celle des tâches verbales ou numériques.",
    caveats: [
      "Ceci est un instantané éducatif d'un exercice.",
      "La taille de l'écran, la précision du pointeur et les distractions influent sur le résultat — considérez une séance comme un instantané approximatif.",
      "La performance varie avec le sommeil, le stress, le contexte, la stratégie et l'entraînement antérieur.",
      "Lisez l'indice comme une observation de cette tâche et de cette séance, pas comme un trait personnel stable.",
    ],
  },
  "processing-speed": {
    name: "Vitesse de traitement",
    tagline: "À quelle vitesse et avec quelle précision vous prenez des décisions visuelles simples.",
    description:
      "La vitesse de traitement (Gs) est le moteur discret derrière presque tout le reste — la rapidité avec laquelle " +
      "vous saisissez et traitez une information simple. Dans l'esprit du subtest Symboles à rechercher du WAIS, vous " +
      "déciderez le plus vite possible si un symbole cible figure dans un petit ensemble. C'est bref, contre la montre, " +
      "et la précision compte toujours.",
    caveats: [
      "Ceci est un instantané éducatif d'un exercice.",
      "Le périphérique de saisie, l'écran et les distractions influent sur la vitesse — un écran tactile et une souris ne donnent pas le même score.",
      "La performance varie avec le sommeil, l'attention, la familiarité, l'entraînement antérieur et le contexte.",
      "Lisez l'indice comme une observation de cette tâche et de cette séance, pas comme un trait personnel stable.",
    ],
  },
  "alternative-uses": {
    name: "Pensée créative",
    tagline: "Combien d'usages pouvez-vous imaginer ? Un test de pensée divergente.",
    description:
      "La tâche des usages alternatifs de Guilford est la mesure classique de la pensée divergente, le moteur à idées " +
      "derrière la créativité. Pour chaque objet du quotidien, vous aurez une minute pour énumérer autant d'usages " +
      "différents que possible. Nous mesurons la fluidité (le nombre d'idées distinctes et sensées que vous produisez). " +
      "Il n'y a pas de mauvaise réponse — laissez votre esprit s'emballer.",
    caveats: [
      "Ceci mesure la FLUIDITÉ (le nombre d'idées), qui n'est qu'une facette de la créativité — l'originalité et l'utilité comptent aussi et exigent un jugement humain.",
      "La fluidité d'une séance dépend de la familiarité, de la langue, de l'humeur, du temps et de l'entraînement antérieur.",
      "Ceci est un instantané éducatif d'une tâche, pas un verdict sur la créativité.",
      "L'indice décrit uniquement le nombre d'idées distinctes apparues dans cette tâche.",
    ],
  },
  "iat-demo": {
    name: "Associations implicites",
    tagline: "Ce que révèlent vos réactions en une fraction de seconde — une démonstration en direct.",
    description:
      "Le test d'associations implicites mesure ce qu'aucun questionnaire ne peut : la force des associations mentales " +
      "automatiques, déduite de la vitesse à laquelle vous triez des éléments sous deux appariements. Ceci est une " +
      "démonstration NEUTRE — Fleurs contre Insectes, appariés à Agréable contre Désagréable — pour que vous " +
      "expérimentiez la méthode elle-même. Triez vite et avec précision, à l'aide des touches (ou des boutons) indiqués.",
    caveats: [
      "Ceci est une démonstration ÉDUCATIVE d'une méthode, pas un diagnostic. Un seul IAT a une fidélité test-retest modeste et ne doit jamais être lu comme un fait figé sur vous.",
      "Nous utilisons exprès la version neutre Fleurs/Insectes. La validité de l'IAT pour mesurer le biais réel d'une personne sur des sujets sensibles est scientifiquement contestée — nous ne faisons donc pas ces affirmations ici.",
      "L'ordre, la fatigue et la latéralité influencent les scores de l'IAT. Considérez votre résultat comme un regard amusant sur la méthode, pas comme un verdict.",
      "La plupart des gens montrent une association fleurs-agréable — c'est l'effet de démonstration attendu, pas un défaut chez vous.",
    ],
  },
  "adaptive-reasoning": {
    name: "Raisonnement adaptatif",
    tagline: "La difficulté suit vos réponses pour garder cette séance de pratique ciblée.",
    description:
      "Un test de matrices adaptatif par ordinateur : une bonne réponse rend la suivante plus difficile ; une erreur " +
      "l'allège. En suivant le niveau de défi atteint pendant cette séance, l'activité garde la pratique ciblée sans " +
      "estimer une capacité fixe. Chaque énigme est générée à neuf, donc deux passations ne se ressemblent jamais tout à fait.",
    caveats: [
      "Ceci est un instantané éducatif d'un exercice.",
      "Le score adaptatif est approximatif : un étalonnage représentatif exigerait des données adaptées ; celui-ci utilise des niveaux de difficulté fondés sur des règles.",
      "L'indice décrit la performance sur ces énigmes pendant cette séance.",
      "Le sommeil, la familiarité, l'appareil, les distractions et l'entraînement antérieur peuvent modifier l'observation.",
    ],
  },
};

const META: Record<string, Record<string, AbilityMetaTranslation>> = { es: ES, fr: FR };

/** Per-test display copy for a locale; returns {} when there is no translation (callers fall back to core English). */
export function localizeAbilityMeta(id: string, locale: string): AbilityMetaTranslation {
  return META[locale]?.[id] ?? {};
}

export function hasAbilityTranslation(id: string, locale: string): boolean {
  return Boolean(META[locale]?.[id]);
}
