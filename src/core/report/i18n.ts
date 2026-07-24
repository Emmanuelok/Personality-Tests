/**
 * Locale bundles for the deterministic report composer.
 *
 * The composer makes ~15-20 independent seeded choices per report; this module
 * supplies the phrase banks it draws from, per locale. English is the canonical
 * default (and reuses the generic openers/nuance from phrasebank.ts); es/fr
 * provide their own banks. Anything a locale omits falls back to English, so the
 * report always composes — adding a language is purely additive.
 *
 * NOT covered here (English by design, a documented follow-up): the Big-Five
 * concrete color bank (BIG_FIVE_COLOR), its pairwise dynamics, and its adjective/
 * noun headline. Every other instrument composes fully in the active locale.
 */

import type { ScaleStanding } from "../types";
import { NUANCE_CLAUSES, BIG_FIVE_COLOR, BIG_FIVE_DYNAMICS, type LevelKey, type TraitColor, type DynamicRule } from "./phrasebank";
import { BIG_FIVE_COLOR_ES, BIG_FIVE_DYNAMICS_ES, BIG_FIVE_COLOR_FR, BIG_FIVE_DYNAMICS_FR } from "./color.i18n";

export interface ReportStrings {
  /** Response-range openers. Placeholders {name}{pos}{hd}{ld}{hi}{lo}. */
  positionOpeners: Record<LevelKey, string[]>;
  /** Generic second-sentence nuance clauses. */
  nuance: string[];
  /** Honest short label used by overview/export surfaces. */
  standingLabel: (standing: ScaleStanding) => string;
  /** Fallback trait watch-outs when no color bank exists. {x} a descriptor phrase; {hi}{lo} poles. */
  fallbackWatchHigh: string;
  fallbackWatchLow: string;
  /** Generic life sections (no color bank). Templates use {trait} (lower-cased name) and {d} (a descriptor word). */
  rel: string[];
  work: string[];
  stress: string[];
  relHead: string[];
  workHead: string[];
  stressHead: string[];
  /** Section headings + intros. */
  strengthsHead: string[];
  strengthsIntro: string[];
  growthHead: string[];
  growthIntro: string[];
  /** Typological deep-dive. typeOpener templates use {code}{title}{summary}. */
  typeDepthHead: string[];
  typeOpener: string[];
  confHigh: string[];
  confMid: string[];
  confLow: string[];
  /** Signature responses. sigTemplate uses {stmt}{agree}{tail}; sigTail uses {trait}. */
  sigAgreeMax: string[];
  sigAgreeMin: string[];
  sigTail: string[];
  sigTemplate: string;
  /** Overview paragraphs. p1Type {who}{short}{code}{title}; p1Dim {who}{name}{title}; p2 {n0}{p0}{n1}{p1}. */
  ovP1Type: string[];
  ovP1Dim: string[];
  ovP2: string[];
  ovP3: string[];
  /** Generic (non-Big-Five) headline. genericTitle uses {top}; genericSubtitle {top}{second}. */
  genericTitle: string;
  genericSubtitle: string[];
  portraitTitle: string;
  portraitSub: (instrumentName: string) => string;
  /** The uniqueness footnote. */
  uniquenessNote: string;
  /** Big-Five concrete color bank (by scale id) and pairwise dynamics; English for untranslated locales. */
  color: Record<string, TraitColor>;
  dynamics: DynamicRule[];
}

const EN: ReportStrings = {
  positionOpeners: {
    "very high": [
      "Within this instrument's response range, your {name} is near the high end ({pos}/100). No population comparison is available; your answers leaned strongly toward being {hd}.",
    ],
    high: [
      "Within this instrument's response range, your {name} leans toward the high end ({pos}/100). This is a response-range position, not a population comparison.",
    ],
    moderate: [
      "Your {name} sits near the midpoint of this instrument's response range ({pos}/100). This describes your answer pattern, not where you rank among people.",
    ],
    low: [
      "Within this instrument's response range, your {name} leans toward the low end ({pos}/100). This is a response-range position, not a population comparison.",
    ],
    "very low": [
      "Within this instrument's response range, your {name} is near the low end ({pos}/100). No population comparison is available; your answers leaned strongly toward being {ld}.",
    ],
  },
  nuance: NUANCE_CLAUSES,
  standingLabel: (standing) => `${Math.round(standing.position)}/100 · response-range position`,
  fallbackWatchHigh: "Leaning hard into being {x} can crowd out its opposite when a situation needs it.",
  fallbackWatchLow: "A strong {lo} lean means the {hi} mode takes deliberate effort.",
  rel: [
    "In close relationships, this {trait} response pattern may sometimes appear as being {d}. Check that possibility against real situations.",
    "One hypothesis to test is whether being {d} affects how you communicate needs with people you trust.",
  ],
  work: [
    "In work or study settings, this {trait} pattern may appear as being {d}; notice when that helps and when it does not.",
    "A small experiment is to watch whether being {d} changes how you approach different tasks or teams.",
  ],
  stress: [
    "Under pressure, this {trait} response pattern might appear as being {d}. Treat that as a prompt to observe, not a prediction.",
    "If being {d} shows up under stress, compare it with calmer situations before drawing a conclusion.",
  ],
  relHead: ["In Relationships", "How You Connect"],
  workHead: ["At Work & Collaborating", "How You Operate"],
  stressHead: ["Under Pressure", "Stress & Resilience"],
  strengthsHead: ["Possible Strengths", "Patterns to Build On", "Potential Advantages"],
  strengthsIntro: [
    "These are possible advantages suggested by this response pattern. Keep only the ones that match your lived experience.",
    "Read these as hypotheses to test in context, not abilities the activity has proven.",
    "These possibilities come from the most distinctive responses in this sitting and may change with context.",
  ],
  growthHead: ["Possible Trade-offs", "Patterns to Watch", "Another Side of the Pattern"],
  growthIntro: [
    "None of these are flaws; they are possible trade-offs around the strengths observed in this snapshot.",
    "A helpful tendency in one setting can be less useful in another. Notice before deciding.",
    "Use these as prompts for a small experiment, not as defects or instructions to change who you are.",
  ],
  typeDepthHead: ["Your Type, in Depth", "The Shape of Your Type", "Inside Your Result"],
  typeOpener: [
    "Your result, {code} — {title}, reflects {summary}",
    "{title} ({code}) captures a particular configuration: {summary}",
    "At the center of your result sits {code}, {title}: {summary}",
  ],
  confHigh: [
    "Within this activity's scoring rule, your answers separated this label clearly from its alternatives. That does not make the label universal or permanent.",
    "Your answers leaned consistently within this item set; keep the resulting type as a shorthand to examine, not a fact about your identity.",
  ],
  confMid: [
    "This result is a good fit, though a couple of dimensions were closer to the middle — read your runner-up too.",
    "Hold this typing lightly at the edges: some preferences were moderate rather than emphatic.",
  ],
  confLow: [
    "Several dimensions sat near the midpoint, so treat this as the best of a few near-ties and explore the alternatives.",
    "Your profile is genuinely balanced across some axes — the label is a starting point, not a verdict.",
  ],
  sigAgreeMax: ["completely true of you", "exactly like you", "strongly accurate"],
  sigAgreeMin: ["not true of you at all", "nothing like you", "strongly inaccurate"],
  sigTail: [
    "— a specific brushstroke in your {trait} that a score alone would flatten.",
    ", which colors your {trait} in a way the headline number can't.",
    "— one of the concrete details that makes this profile yours and no one else's.",
  ],
  sigTemplate: "You rated “{stmt}” as {agree} {tail}",
  ovP1Type: [
    "{who}this is a portrait of how you, specifically, come out on the {short}. Your result is {code} — {title}.",
    "{who}what follows is built entirely from your own answers on the {short}. They resolve to {title} ({code}).",
  ],
  ovP1Dim: [
    "{who}this is a portrait of how you, specifically, come out on the {name}. If your profile had a name, it might be “{title}”",
    "{who}what follows is assembled entirely from your own answers. As a shorthand, your pattern reads like “{title}”",
  ],
  ovP2: [
    "The two most distinctive notes in this result are your {n0} ({p0}) and your {n1} ({p1}). Treat them as current observations rather than definitions.",
    "This result is led by {n0} and {n1} — the two traits furthest from the midpoint of this instrument's response range.",
    "If you remember nothing else: {n0} and {n1} are doing the heavy lifting in your profile, and the rest plays in their key.",
  ],
  ovP3: [
    "This is a snapshot, not a verdict. Confirm, reject, or refine each interpretation using your own context.",
    "Read it as a prompt for reflection, not a cage. Any next practice should follow your chosen goal, not an assumed identity.",
    "Context, wording, and ordinary measurement noise can all affect a result. Compare later attempts cautiously.",
  ],
  genericTitle: "Your {top} Portrait",
  genericSubtitle: [
    "A current response pattern led by {top} and {second}",
    "This sitting leaned most toward {top}",
    "One snapshot of {top} alongside {second}",
  ],
  portraitTitle: "Your Current Response Portrait",
  portraitSub: (n) => n,
  uniquenessNote:
    "This report was composed from your full response pattern plus a unique generation seed. " +
    "Repeated generations may vary the wording while preserving the same scored observations.",
  color: BIG_FIVE_COLOR,
  dynamics: BIG_FIVE_DYNAMICS,
};

const ES: ReportStrings = {
  positionOpeners: {
    "very high": [
      "Dentro del rango de respuesta de este instrumento, tu {name} está cerca del extremo alto ({pos}/100). No hay una comparación poblacional; tus respuestas se inclinaron con fuerza hacia ser {hd}.",
    ],
    high: [
      "Dentro del rango de respuesta de este instrumento, tu {name} se inclina hacia el extremo alto ({pos}/100). Es una posición en el rango de respuesta, no una comparación poblacional.",
    ],
    moderate: [
      "Tu {name} queda cerca del punto medio del rango de respuesta de este instrumento ({pos}/100). Describe tu patrón de respuestas, no tu posición entre otras personas.",
    ],
    low: [
      "Dentro del rango de respuesta de este instrumento, tu {name} se inclina hacia el extremo bajo ({pos}/100). Es una posición en el rango de respuesta, no una comparación poblacional.",
    ],
    "very low": [
      "Dentro del rango de respuesta de este instrumento, tu {name} está cerca del extremo bajo ({pos}/100). No hay una comparación poblacional; tus respuestas se inclinaron con fuerza hacia ser {ld}.",
    ],
  },
  nuance: [
    "Lo que lo hace tuyo en concreto es la mezcla exacta de abajo, no la etiqueta por sí sola.",
    "El detalle interesante es menos la puntuación en sí que cómo se combina con tus otros rasgos.",
    "Dos personas pueden compartir esta puntuación y expresarla de forma totalmente distinta; la tuya la moldea el patrón que la rodea.",
    "Los números ponen el escenario; la textura viene de cómo juega esto con el resto de tu perfil.",
    "Toma esta puntuación como una observación inicial, no como un veredicto: el matiz está en las combinaciones.",
  ],
  standingLabel: (standing) => `${Math.round(standing.position)}/100 · posición en el rango de respuesta`,
  fallbackWatchHigh: "Inclinarte con fuerza hacia ser {x} puede desplazar a su opuesto cuando una situación lo necesita.",
  fallbackWatchLow: "Una marcada inclinación hacia {lo} significa que el modo {hi} requiere un esfuerzo deliberado.",
  rel: [
    "En relaciones cercanas, este patrón de {trait} puede aparecer a veces como ser {d}. Contrástalo con situaciones reales.",
    "Una hipótesis que puedes comprobar es si ser {d} influye en cómo comunicas tus necesidades a personas de confianza.",
  ],
  work: [
    "En el trabajo o el estudio, este patrón de {trait} puede aparecer como ser {d}; observa cuándo ayuda y cuándo no.",
    "Un pequeño experimento es observar si ser {d} cambia tu forma de abordar tareas o equipos distintos.",
  ],
  stress: [
    "Bajo presión, este patrón de {trait} podría aparecer como ser {d}. Tómalo como una invitación a observar, no como una predicción.",
    "Si ser {d} aparece con estrés, compáralo con situaciones más tranquilas antes de concluir.",
  ],
  relHead: ["En las relaciones", "Cómo conectas"],
  workHead: ["En el trabajo y la colaboración", "Cómo operas"],
  stressHead: ["Bajo presión", "Estrés y resiliencia"],
  strengthsHead: ["Fortalezas posibles", "Patrones en los que apoyarte", "Ventajas potenciales"],
  strengthsIntro: [
    "Estas son ventajas posibles sugeridas por este patrón de respuestas. Conserva solo las que encajen con tu experiencia.",
    "Léelas como hipótesis que comprobar en contexto, no como capacidades demostradas por la actividad.",
    "Estas posibilidades parten de las respuestas más distintivas de esta sesión y pueden variar según el contexto.",
  ],
  growthHead: ["Posibles compensaciones", "Patrones que observar", "Otra cara del patrón"],
  growthIntro: [
    "Ninguna es un defecto; son posibles compensaciones alrededor de los patrones observados en esta instantánea.",
    "Una tendencia útil en un contexto puede ayudar menos en otro. Observa antes de decidir.",
    "Úsalas como propuestas para un pequeño experimento, no como defectos ni instrucciones para cambiar quién eres.",
  ],
  typeDepthHead: ["Tu tipo, en profundidad", "La forma de tu tipo", "Por dentro de tu resultado"],
  typeOpener: [
    "Tu resultado, {code} — {title}, refleja {summary}",
    "{title} ({code}) capta una configuración particular: {summary}",
    "En el centro de tu resultado se asienta {code}, {title}: {summary}",
  ],
  confHigh: [
    "Dentro de la regla de puntuación de esta actividad, tus respuestas separaron esta etiqueta de sus alternativas. Eso no la vuelve universal ni permanente.",
    "Tus respuestas fueron consistentes dentro de este conjunto de ítems; conserva el tipo como un atajo para examinar, no como un hecho sobre tu identidad.",
  ],
  confMid: [
    "Este resultado encaja bien, aunque un par de dimensiones quedaron más cerca del medio: lee también tu segundo lugar.",
    "Sostén esta tipificación con suavidad en los bordes: algunas preferencias fueron moderadas más que enfáticas.",
  ],
  confLow: [
    "Varias dimensiones quedaron cerca del punto medio, así que tómalo como el mejor de varios empates y explora las alternativas.",
    "Tu perfil está genuinamente equilibrado en algunos ejes: la etiqueta es un punto de partida, no un veredicto.",
  ],
  sigAgreeMax: ["completamente cierto de ti", "exactamente como tú", "muy acertado"],
  sigAgreeMin: ["nada cierto de ti", "para nada como tú", "muy desacertado"],
  sigTail: [
    "— una pincelada concreta de tu {trait} que una puntuación por sí sola aplanaría.",
    ", lo que tiñe tu {trait} de un modo que el número titular no puede.",
    "— uno de los detalles concretos que hacen este perfil tuyo y de nadie más.",
  ],
  sigTemplate: "Calificaste «{stmt}» como {agree} {tail}",
  ovP1Type: [
    "{who}este es un retrato de cómo sales tú, en concreto, en el {short}. Tu resultado es {code} — {title}.",
    "{who}lo que sigue está construido por completo a partir de tus propias respuestas en el {short}. Se resuelven en {title} ({code}).",
  ],
  ovP1Dim: [
    "{who}este es un retrato de cómo sales tú, en concreto, en el {name}. Si tu perfil tuviera un nombre, podría ser «{title}»",
    "{who}lo que sigue se arma por completo a partir de tus propias respuestas. Como atajo, tu patrón se lee como «{title}»",
  ],
  ovP2: [
    "Las dos notas más distintivas de este resultado son tu {n0} ({p0}) y tu {n1} ({p1}). Trátalas como observaciones actuales, no como definiciones.",
    "Este resultado está encabezado por {n0} y {n1}: los dos rasgos más alejados del punto medio del rango de respuesta del instrumento.",
    "Si no recuerdas nada más: {n0} y {n1} llevan el peso de tu perfil, y el resto suena en su tonalidad.",
  ],
  ovP3: [
    "Es una instantánea, no un veredicto. Confirma, rechaza o ajusta cada interpretación con tu propio contexto.",
    "Léelo como una invitación a reflexionar, no como una jaula. Cualquier práctica siguiente debe partir de tu objetivo elegido, no de una identidad supuesta.",
    "El contexto, la redacción y el ruido normal de medición pueden afectar el resultado. Compara intentos posteriores con cautela.",
  ],
  genericTitle: "Tu retrato de {top}",
  genericSubtitle: [
    "Un patrón actual guiado por {top} y {second}",
    "Esta sesión se inclinó sobre todo hacia {top}",
    "Una instantánea de {top} junto a {second}",
  ],
  portraitTitle: "Tu retrato actual de respuestas",
  portraitSub: (n) => n,
  uniquenessNote:
    "Este informe se compuso a partir de tu patrón completo de respuestas más una semilla de generación única. " +
    "Las regeneraciones pueden variar la redacción y conservar las mismas observaciones puntuadas.",
  color: BIG_FIVE_COLOR_ES,
  dynamics: BIG_FIVE_DYNAMICS_ES,
};

const FR: ReportStrings = {
  positionOpeners: {
    "very high": [
      "Dans l'étendue de réponse de cet instrument, votre {name} se situe près de l'extrémité haute ({pos}/100). Aucune comparaison de population n'est disponible ; vos réponses penchent fortement vers le fait d'être {hd}.",
    ],
    high: [
      "Dans l'étendue de réponse de cet instrument, votre {name} penche vers l'extrémité haute ({pos}/100). C'est une position dans l'étendue de réponse, pas une comparaison de population.",
    ],
    moderate: [
      "Votre {name} se situe près du milieu de l'étendue de réponse de cet instrument ({pos}/100). Cela décrit vos réponses, pas votre rang parmi les personnes.",
    ],
    low: [
      "Dans l'étendue de réponse de cet instrument, votre {name} penche vers l'extrémité basse ({pos}/100). C'est une position dans l'étendue de réponse, pas une comparaison de population.",
    ],
    "very low": [
      "Dans l'étendue de réponse de cet instrument, votre {name} se situe près de l'extrémité basse ({pos}/100). Aucune comparaison de population n'est disponible ; vos réponses penchent fortement vers le fait d'être {ld}.",
    ],
  },
  nuance: [
    "Ce qui le rend vraiment vôtre, c'est le mélange exact ci-dessous, pas l'étiquette seule.",
    "Le détail intéressant tient moins au score lui-même qu'à la façon dont il se combine à vos autres traits.",
    "Deux personnes peuvent partager ce score et l'exprimer tout autrement : le vôtre est façonné par le motif qui l'entoure.",
    "Les chiffres plantent le décor ; la texture vient de la façon dont cela joue avec le reste de votre profil.",
    "Prenez ce score comme une première observation, pas un verdict : la nuance est dans les combinaisons.",
  ],
  standingLabel: (standing) => `${Math.round(standing.position)}/100 · position dans l'étendue de réponse`,
  fallbackWatchHigh: "Pencher fortement vers être {x} peut évincer son opposé quand une situation l'exige.",
  fallbackWatchLow: "Un net penchant vers {lo} signifie que le mode {hi} demande un effort délibéré.",
  rel: [
    "Dans les relations proches, ce motif de {trait} peut parfois apparaître comme le fait d'être {d}. Vérifiez cette possibilité dans des situations réelles.",
    "Une hypothèse à tester est de voir si être {d} influence votre manière d'exprimer vos besoins aux personnes de confiance.",
  ],
  work: [
    "Au travail ou dans les études, ce motif de {trait} peut apparaître comme le fait d'être {d} ; observez quand cela aide ou non.",
    "Une petite expérience consiste à voir si être {d} modifie votre approche selon les tâches ou les équipes.",
  ],
  stress: [
    "Sous pression, ce motif de {trait} pourrait apparaître comme le fait d'être {d}. Prenez-le comme une invitation à observer, pas une prédiction.",
    "Si le fait d'être {d} apparaît sous stress, comparez avec des situations plus calmes avant de conclure.",
  ],
  relHead: ["Dans les relations", "Comment vous reliez"],
  workHead: ["Au travail et en équipe", "Comment vous opérez"],
  stressHead: ["Sous pression", "Stress et résilience"],
  strengthsHead: ["Forces possibles", "Motifs sur lesquels vous appuyer", "Atouts potentiels"],
  strengthsIntro: [
    "Voici des avantages possibles suggérés par ce motif de réponses. Ne gardez que ceux qui correspondent à votre vécu.",
    "Lisez-les comme des hypothèses à tester en contexte, pas comme des capacités prouvées par l'activité.",
    "Ces possibilités viennent des réponses les plus distinctives de cette séance et peuvent varier selon le contexte.",
  ],
  growthHead: ["Compromis possibles", "Motifs à observer", "Un autre côté du motif"],
  growthIntro: [
    "Aucun n'est un défaut ; ce sont des compromis possibles autour des motifs observés dans cet instantané.",
    "Une tendance utile dans un cadre peut l'être moins dans un autre. Observez avant de décider.",
    "Utilisez-les comme pistes pour une petite expérience, pas comme défauts ni consignes pour changer qui vous êtes.",
  ],
  typeDepthHead: ["Votre type, en profondeur", "La forme de votre type", "À l'intérieur de votre résultat"],
  typeOpener: [
    "Votre résultat, {code} — {title}, reflète {summary}",
    "{title} ({code}) capte une configuration particulière : {summary}",
    "Au centre de votre résultat se trouve {code}, {title} : {summary}",
  ],
  confHigh: [
    "Dans la règle de calcul de cette activité, vos réponses ont clairement séparé cette étiquette de ses alternatives. Cela ne la rend ni universelle ni permanente.",
    "Vos réponses étaient cohérentes dans cet ensemble d'items ; gardez ce type comme raccourci à examiner, pas comme fait sur votre identité.",
  ],
  confMid: [
    "Ce résultat convient bien, même si quelques dimensions étaient plus proches du milieu : lisez aussi votre second.",
    "Tenez ce typage avec souplesse sur les bords : certaines préférences étaient modérées plutôt qu'affirmées.",
  ],
  confLow: [
    "Plusieurs dimensions se tenaient près du point médian : prenez-le comme le meilleur de quelques quasi-égalités et explorez les alternatives.",
    "Votre profil est vraiment équilibré sur certains axes : l'étiquette est un point de départ, pas un verdict.",
  ],
  sigAgreeMax: ["tout à fait vrai de vous", "exactement comme vous", "très juste"],
  sigAgreeMin: ["pas du tout vrai de vous", "rien à voir avec vous", "très inexact"],
  sigTail: [
    "— une touche concrète de votre {trait} qu'un score seul aplatirait.",
    ", ce qui colore votre {trait} d'une manière que le chiffre titre ne peut pas.",
    "— l'un des détails concrets qui rendent ce profil vôtre et de personne d'autre.",
  ],
  sigTemplate: "Vous avez jugé « {stmt} » comme {agree} {tail}",
  ovP1Type: [
    "{who}voici un portrait de la façon dont vous, précisément, ressortez au {short}. Votre résultat est {code} — {title}.",
    "{who}ce qui suit est entièrement construit à partir de vos propres réponses au {short}. Elles se résolvent en {title} ({code}).",
  ],
  ovP1Dim: [
    "{who}voici un portrait de la façon dont vous, précisément, ressortez au {name}. Si votre profil avait un nom, ce serait peut-être « {title} »",
    "{who}ce qui suit est assemblé entièrement à partir de vos propres réponses. En raccourci, votre motif se lit comme « {title} »",
  ],
  ovP2: [
    "Les deux notes les plus distinctives de ce résultat sont votre {n0} ({p0}) et votre {n1} ({p1}). Considérez-les comme des observations actuelles, pas comme des définitions.",
    "Ce résultat est mené par {n0} et {n1} : les deux traits les plus éloignés du milieu de l'étendue de réponse de l'instrument.",
    "Si vous ne deviez retenir qu'une chose : {n0} et {n1} portent l'essentiel de votre profil, et le reste joue dans leur tonalité.",
  ],
  ovP3: [
    "C'est un instantané, pas un verdict. Confirmez, rejetez ou affinez chaque interprétation à l'aide de votre contexte.",
    "Lisez-le comme une invitation à réfléchir, pas une cage. Toute pratique suivante doit venir de votre objectif choisi, pas d'une identité supposée.",
    "Le contexte, la formulation et le bruit normal de mesure peuvent affecter le résultat. Comparez les essais ultérieurs avec prudence.",
  ],
  genericTitle: "Votre portrait de {top}",
  genericSubtitle: [
    "Un motif actuel porté par {top} et {second}",
    "Cette séance penche surtout vers {top}",
    "Un instantané de {top} avec {second}",
  ],
  portraitTitle: "Votre portrait actuel de réponses",
  portraitSub: (n) => n,
  uniquenessNote:
    "Ce rapport a été composé à partir de l'ensemble de vos réponses, plus une graine de génération unique. " +
    "Les régénérations peuvent varier la formulation tout en conservant les mêmes observations calculées.",
  color: BIG_FIVE_COLOR_FR,
  dynamics: BIG_FIVE_DYNAMICS_FR,
};

const BUNDLES: Record<string, ReportStrings> = { en: EN, es: ES, fr: FR };

/** The report string bundle for a locale (English default). */
export function reportStrings(locale?: string): ReportStrings {
  return (locale && BUNDLES[locale]) || EN;
}
