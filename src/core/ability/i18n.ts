/**
 * Localization layer for the cognitive-ability subsystem — the analog of
 * core/instruments/i18n.ts. It keeps scoring language-agnostic (the scorers
 * keep emitting their canonical English band labels and ids) and translates
 * only at the display edge. Two concerns:
 *
 *   1. localizeBand   — the finite set of qualitative band labels the scorers
 *                       return (range bands + creativity fluency bands).
 *   2. localizeAbilityMeta — per-test display copy (name, description, tagline,
 *                       caveats) for the standalone cognition flows, keyed by
 *                       test id, mirroring how instruments are translated.
 *
 * Anything without a translation falls back to the original English, so adding
 * a language is purely additive and never breaks an untranslated test.
 */

/** Every distinct band string the ability scorers can emit (see memory/processing/creativity/score/chc). */
const BANDS: Record<string, Record<string, string>> = {
  es: {
    "Very high range": "Rango muy alto",
    "Above-average range": "Rango por encima de la media",
    "Average range": "Rango promedio",
    "Below-average range": "Rango por debajo de la media",
    "Well-below-average range": "Rango muy por debajo de la media",
    "Highly fluent": "Muy fluido",
    "Above-average fluency": "Fluidez por encima de la media",
    "Average fluency": "Fluidez promedio",
    "Below-average fluency": "Fluidez por debajo de la media",
    "Low fluency": "Fluidez baja",
  },
  fr: {
    "Very high range": "Niveau très élevé",
    "Above-average range": "Niveau au-dessus de la moyenne",
    "Average range": "Niveau moyen",
    "Below-average range": "Niveau en dessous de la moyenne",
    "Well-below-average range": "Niveau bien en dessous de la moyenne",
    "Highly fluent": "Très fluide",
    "Above-average fluency": "Fluidité au-dessus de la moyenne",
    "Average fluency": "Fluidité moyenne",
    "Below-average fluency": "Fluidité en dessous de la moyenne",
    "Low fluency": "Fluidité faible",
  },
};

/** Translate a scorer's qualitative band label; falls back to the English input. */
export function localizeBand(band: string, locale: string): string {
  return BANDS[locale]?.[band] ?? band;
}

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
      "Esto es una estimación EDUCATIVA, no una evaluación clínica. La prueba real de memoria de trabajo se realiza en condiciones controladas por un profesional.",
      "Los navegadores, las distracciones y la tentación de apuntar las cosas afectan al resultado: por favor, no anotes los dígitos; deja que tu memoria haga el trabajo.",
      "La memoria de trabajo es solo una porción de la mente; puede entrenarse un poco y varía con el sueño, el estrés y la edad.",
      "Esto mide una capacidad concreta, no tu inteligencia, tu valía ni tu potencial.",
    ],
  },
  "corsi-blocks": {
    name: "Memoria espacial (Corsi)",
    tagline: "Observa un camino que se ilumina en el tablero y reprodúcelo de memoria.",
    description:
      "La prueba de golpeo de bloques de Corsi es la contraparte visoespacial de la amplitud de dígitos. Los bloques se " +
      "iluminan uno a uno en una secuencia; tú la reproduces tocándolos en el mismo orden (y luego al revés). Mide la " +
      "memoria de trabajo espacial (Gsm), una capacidad bastante distinta de cómo te desenvuelves con palabras y números.",
    caveats: [
      "Esto es una estimación EDUCATIVA, no una evaluación clínica, y no puede sustituir a una prueba administrada por un profesional.",
      "El tamaño de la pantalla, la precisión del puntero y las distracciones afectan al resultado: trata una sola sesión como una instantánea aproximada.",
      "La memoria espacial es solo una capacidad y varía con el sueño, el estrés y la práctica. No es una medida de inteligencia ni de valía.",
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
      "Esto es una estimación EDUCATIVA, no una evaluación clínica, y no puede sustituir a una prueba administrada por un profesional.",
      "El dispositivo de entrada, la pantalla y las distracciones afectan a la velocidad: una pantalla táctil y un ratón no puntúan igual.",
      "La velocidad de procesamiento es solo una capacidad; disminuye de forma natural con la edad y varía con el sueño y la concentración.",
      "Mide la velocidad en una tarea simple, no tu inteligencia, tu valía ni tu potencial.",
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
      "Las tareas de pensamiento divergente predicen el potencial creativo de forma modesta; la creatividad real también exige conocimiento, motivación y constancia.",
      "Una estimación educativa y lúdica, no una evaluación validada de la creatividad, y desde luego no un veredicto sobre tu imaginación.",
      "Tu puntuación se presenta como un rango y un percentil, nunca como un número preciso.",
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
    tagline: "La dificultad se adapta a ti: una estimación más precisa en menos preguntas.",
    description:
      "Una prueba de matrices adaptativa por ordenador: si aciertas, la siguiente es más difícil; si fallas, se " +
      "suaviza. Al afinar en el nivel donde te mantienes, precisa tu capacidad de razonamiento fluido (Gf) en menos " +
      "ítems que una prueba fija. Cada acertijo se genera de nuevo, así que no hay dos partidas iguales.",
    caveats: [
      "Esto es una estimación EDUCATIVA, no una prueba de CI administrada clínicamente.",
      "La puntuación adaptativa aquí es aproximada: un verdadero motor de teoría de respuesta al ítem calibra cada ítem con datos reales; este usa niveles de dificultad basados en reglas.",
      "Tu resultado se muestra como un rango y un percentil, nunca como un único número preciso.",
      "Mide el razonamiento fluido, no tu valía, tu creatividad ni tu potencial.",
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
      "Ceci est une estimation ÉDUCATIVE, pas une évaluation clinique. Un vrai test de mémoire de travail se fait dans des conditions contrôlées par un professionnel.",
      "Les navigateurs, les distractions et l'envie de noter les choses influent sur le résultat — ne notez pas les chiffres ; laissez votre mémoire travailler.",
      "La mémoire de travail n'est qu'une partie de l'esprit ; elle s'entraîne un peu et varie avec le sommeil, le stress et l'âge.",
      "Ceci mesure une capacité précise, pas votre intelligence, votre valeur ni votre potentiel.",
    ],
  },
  "corsi-blocks": {
    name: "Mémoire spatiale (Corsi)",
    tagline: "Regardez un chemin s'illuminer sur le plateau, puis reproduisez-le de mémoire.",
    description:
      "Le test des blocs de Corsi est le pendant visuo-spatial de l'empan de chiffres. Les blocs s'allument un à un en " +
      "séquence ; vous la reproduisez en les touchant dans le même ordre (puis à l'envers). Il mesure la mémoire de " +
      "travail spatiale (Gsm), une capacité bien distincte de votre aisance avec les mots et les chiffres.",
    caveats: [
      "Ceci est une estimation ÉDUCATIVE, pas une évaluation clinique, et ne peut remplacer un test administré par un professionnel.",
      "La taille de l'écran, la précision du pointeur et les distractions influent sur le résultat — considérez une séance comme un instantané approximatif.",
      "La mémoire spatiale n'est qu'une capacité et varie avec le sommeil, le stress et l'entraînement. Ce n'est pas une mesure d'intelligence ni de valeur.",
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
      "Ceci est une estimation ÉDUCATIVE, pas une évaluation clinique, et ne peut remplacer un test administré par un professionnel.",
      "Le périphérique de saisie, l'écran et les distractions influent sur la vitesse — un écran tactile et une souris ne donnent pas le même score.",
      "La vitesse de traitement n'est qu'une capacité ; elle décline naturellement avec l'âge et varie avec le sommeil et la concentration.",
      "Elle mesure la vitesse sur une tâche simple, pas votre intelligence, votre valeur ni votre potentiel.",
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
      "Les tâches de pensée divergente prédisent modestement le potentiel créatif ; la vraie créativité demande aussi des connaissances, de la motivation et de la persévérance.",
      "Une estimation éducative et ludique, pas une évaluation validée de la créativité, et certainement pas un verdict sur votre imagination.",
      "Votre score est présenté sous forme de niveau et de centile, jamais d'un nombre précis.",
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
    tagline: "La difficulté s'adapte à vous — une estimation plus fine en moins de questions.",
    description:
      "Un test de matrices adaptatif par ordinateur : une bonne réponse rend la suivante plus difficile ; une erreur " +
      "l'allège. En cernant le niveau où vous oscillez, il précise votre raisonnement fluide (Gf) en moins d'items " +
      "qu'un test fixe. Chaque énigme est générée à neuf, donc deux passations ne se ressemblent jamais tout à fait.",
    caveats: [
      "Ceci est une estimation ÉDUCATIVE, pas un test de QI administré cliniquement.",
      "Le score adaptatif est approximatif ici — un vrai moteur de théorie de réponse à l'item calibre chaque item sur des données réelles ; celui-ci utilise des niveaux de difficulté fondés sur des règles.",
      "Votre résultat est présenté sous forme de niveau et de centile, jamais d'un nombre précis.",
      "Il mesure le raisonnement fluide, pas votre valeur, votre créativité ni votre potentiel.",
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
