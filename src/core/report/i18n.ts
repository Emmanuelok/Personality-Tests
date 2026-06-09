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

import { ordinal } from "../variation";
import { LEVEL_OPENERS, NUANCE_CLAUSES, BIG_FIVE_COLOR, BIG_FIVE_DYNAMICS, type LevelKey, type TraitColor, type DynamicRule } from "./phrasebank";
import { BIG_FIVE_COLOR_ES, BIG_FIVE_DYNAMICS_ES } from "./color.i18n";

export interface ReportStrings {
  /** Trait opener templates, conditioned on level. Placeholders {name}{pct}{hd}{ld}{hi}{lo}. */
  openers: Record<LevelKey, string[]>;
  /** Generic second-sentence nuance clauses. */
  nuance: string[];
  /** Format a percentile for embedding (English ordinal vs. plain number elsewhere). */
  pct: (n: number) => string;
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
  openers: LEVEL_OPENERS,
  nuance: NUANCE_CLAUSES,
  pct: (n) => ordinal(n),
  fallbackWatchHigh: "Leaning hard into being {x} can crowd out its opposite when a situation needs it.",
  fallbackWatchLow: "A strong {lo} lean means the {hi} mode takes deliberate effort.",
  rel: [
    "Your {trait} shows up with the people closest to you as being {d} — it shapes how you give, and how you ask for what you need.",
    "In love and friendship, being {d} (from your {trait}) is part of what people come to rely on in you.",
  ],
  work: [
    "At work, your {trait} makes you {d}; you'll feel most in your element where that's genuinely an asset.",
    "Being {d} colors how you operate professionally — gravitate to roles and teams that reward it.",
  ],
  stress: [
    "Under pressure, your {trait} leans toward being {d} — knowing that lets you choose your reset deliberately rather than by default.",
    "When stress hits, expect your {trait} ({d}) to surface; build recovery rituals that fit it.",
  ],
  relHead: ["In Relationships", "How You Connect"],
  workHead: ["At Work & Collaborating", "How You Operate"],
  stressHead: ["Under Pressure", "Stress & Resilience"],
  strengthsHead: ["Signature Strengths", "Where You Shine", "Your Natural Advantages"],
  strengthsIntro: [
    "These are the capacities your profile most reliably gives you — the moves that come cheaply to you and expensively to others.",
    "Read these as your home turf: the strengths you can lean on without much conscious effort.",
    "Every profile has a few load-bearing strengths. Here are yours, drawn from your most distinctive traits.",
  ],
  growthHead: ["Growth Edges", "Where to Watch Yourself", "The Other Side of Your Strengths"],
  growthIntro: [
    "None of these are flaws so much as the shadow your strengths cast — the predictable cost of your particular wiring.",
    "Every strength overused becomes a liability. These are the edges worth keeping an eye on.",
    "Growth rarely means becoming someone else; it usually means managing the downside of who you already are. Start here.",
  ],
  typeDepthHead: ["Your Type, in Depth", "The Shape of Your Type", "Inside Your Result"],
  typeOpener: [
    "Your result, {code} — {title}, reflects {summary}",
    "{title} ({code}) captures a particular configuration: {summary}",
    "At the center of your result sits {code}, {title}: {summary}",
  ],
  confHigh: [
    "Your responses pointed to this result decisively — the underlying preferences were clear and consistent.",
    "This typing rests on firm ground; your answers leaned the same direction with little ambiguity.",
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
    "The two notes that define you most are your {n0} ({p0} percentile) and your {n1} ({p1} percentile). Almost everything else in this report bends around those two.",
    "Your profile is anchored by {n0} and {n1} — the two traits that pull furthest from average and therefore shape the most about how you operate.",
    "If you remember nothing else: {n0} and {n1} are doing the heavy lifting in your profile, and the rest plays in their key.",
  ],
  ovP3: [
    "This isn't a verdict. The last section turns the same data toward where you want to go — because the point of seeing yourself clearly is to choose, deliberately, what to do next.",
    "Read it as a mirror, not a cage. And when you're ready, the growth planner uses these exact scores to map a route from where you are to where you'd like to be.",
    "Nothing here is fixed. Your traits are tendencies, not sentences — and the improvement plan that follows is built to move them, gently and on purpose.",
  ],
  genericTitle: "Your {top} Portrait",
  genericSubtitle: [
    "A portrait led by your {top} and {second}",
    "Defined most by your {top}",
    "Where your {top} meets your {second}",
  ],
  portraitTitle: "Your Personality Portrait",
  portraitSub: (n) => n,
  uniquenessNote:
    "This report was composed from your full response pattern plus a unique generation seed. " +
    "No two generations produce identical prose — even from identical answers.",
  color: BIG_FIVE_COLOR,
  dynamics: BIG_FIVE_DYNAMICS,
};

const ES: ReportStrings = {
  openers: {
    "very high": [
      "Tu {name} se sitúa en el percentil {pct}, cerca de lo más alto del rango. Ser {hd} es una de las firmas que definen cómo te mueves por el mundo.",
      "El {name} es un titular de tu perfil: en el percentil {pct}, cualidades como ser {hd} aparecen de forma fiable, en situaciones muy distintas.",
      "Puntúas excepcionalmente alto en {name} (percentil {pct}). La atracción hacia ser {hd} es tan fuerte que los demás probablemente lo ven como simplemente quien eres.",
      "En {name} te asientas bien en la cola superior, el percentil {pct}. Espera que el lado {hd} de ti lleve la voz cantante, a menudo sin ningún esfuerzo consciente.",
    ],
    high: [
      "Tu {name} es alto, en torno al percentil {pct}. Te inclinas notablemente a ser {hd}, aunque no hasta excluir el otro lado.",
      "En {name} puntúas por encima de la mayoría (percentil {pct}). El polo {hi} es tu modo habitual, con margen para flexibilizar cuando la situación lo pide.",
      "El {name} es una fortaleza clara de tu carácter (percentil {pct}): ser {hd} surge con naturalidad y fiabilidad.",
      "Te sitúas en la banda superior de {name} (percentil {pct}), así que las cualidades {hd} tienden a aflorar primero, aunque aún puedes recurrir al lado {lo} cuando ayuda.",
    ],
    moderate: [
      "Tu {name} es equilibrado, alrededor del percentil {pct}. Puedes ser {hd} o {ld} según el momento, lo que te da una versatilidad real.",
      "En {name} te sitúas cerca del medio (percentil {pct}). Más que un ajuste fijo, tienes un dial que puedes girar hacia {hi} o {lo} según pida la situación.",
      "El {name} es una zona flexible para ti (percentil {pct}): recurres tanto al lado {hd} como al {ld}, y el contexto suele decidir cuál aparece.",
      "En el percentil {pct}, el {name} es uno de tus rasgos adaptables: puedes liderar siendo {hd} o replegarte hacia ser {ld} según haga falta.",
    ],
    low: [
      "Tu {name} está en el lado más bajo, en torno al percentil {pct}. Te inclinas a ser {ld}, y el polo {lo} suele sentirse más natural que su opuesto.",
      "En {name} puntúas por debajo de la mayoría (percentil {pct}), así que ser {ld} es tu modo por defecto, con el modo {hd} disponible pero más costoso.",
      "El {name} se sitúa en la banda baja para ti (percentil {pct}): lleva la voz el lado {lo}, que tiene sus propias fortalezas silenciosas.",
      "Espera que el polo {lo} domine en {name}: en el percentil {pct}, ser {ld} se acerca más a quien eres que ser {hd}.",
    ],
    "very low": [
      "Tu {name} es muy bajo, el percentil {pct}, cerca del fondo del rango. Ser {ld} es un rasgo que define cómo funcionas.",
      "El {name} se sitúa en la cola baja (percentil {pct}): el polo {lo} es tan constante que los demás probablemente lo leen como simplemente tu naturaleza.",
      "Puntúas en el percentil {pct} en {name}, marcadamente {ld}. El modo {hd} solo está disponible con un esfuerzo real y deliberado.",
      "En {name} estás bien dentro del extremo inferior (percentil {pct}). Ser {ld} no es un estado de ánimo aquí; es casi una constante.",
    ],
  },
  nuance: [
    "Lo que lo hace tuyo en concreto es la mezcla exacta de abajo, no la etiqueta por sí sola.",
    "El detalle interesante es menos la puntuación en sí que cómo se combina con tus otros rasgos.",
    "Dos personas pueden compartir esta puntuación y expresarla de forma totalmente distinta; la tuya la moldea el patrón que la rodea.",
    "Los números ponen el escenario; la textura viene de cómo juega esto con el resto de tu perfil.",
    "Toma el percentil como una coordenada de partida, no como un veredicto: el matiz está en las combinaciones.",
  ],
  pct: (n) => String(Math.round(n)),
  fallbackWatchHigh: "Inclinarte con fuerza hacia ser {x} puede desplazar a su opuesto cuando una situación lo necesita.",
  fallbackWatchLow: "Una marcada inclinación hacia {lo} significa que el modo {hi} requiere un esfuerzo deliberado.",
  rel: [
    "Tu {trait} aparece con las personas más cercanas como ser {d}: moldea cómo das y cómo pides lo que necesitas.",
    "En el amor y la amistad, ser {d} (por tu {trait}) es parte de lo que la gente llega a esperar de ti.",
  ],
  work: [
    "En el trabajo, tu {trait} te hace {d}; te sentirás en tu elemento donde eso sea genuinamente una ventaja.",
    "Ser {d} tiñe cómo operas profesionalmente: gravita hacia roles y equipos que lo recompensen.",
  ],
  stress: [
    "Bajo presión, tu {trait} se inclina hacia ser {d}: saberlo te permite elegir tu reinicio a propósito en lugar de por defecto.",
    "Cuando llega el estrés, espera que aflore tu {trait} ({d}); crea rituales de recuperación que le encajen.",
  ],
  relHead: ["En las relaciones", "Cómo conectas"],
  workHead: ["En el trabajo y la colaboración", "Cómo operas"],
  stressHead: ["Bajo presión", "Estrés y resiliencia"],
  strengthsHead: ["Fortalezas distintivas", "Donde brillas", "Tus ventajas naturales"],
  strengthsIntro: [
    "Estas son las capacidades que tu perfil te da de forma más fiable: las jugadas que a ti te salen baratas y a otros, caras.",
    "Léelas como tu terreno: las fortalezas en las que puedes apoyarte sin mucho esfuerzo consciente.",
    "Todo perfil tiene unas pocas fortalezas portantes. Aquí están las tuyas, sacadas de tus rasgos más distintivos.",
  ],
  growthHead: ["Aristas de crecimiento", "Dónde vigilarte", "La otra cara de tus fortalezas"],
  growthIntro: [
    "Ninguna de estas es un defecto, sino la sombra que proyectan tus fortalezas: el coste predecible de tu cableado particular.",
    "Toda fortaleza llevada al exceso se vuelve un lastre. Estas son las aristas que conviene vigilar.",
    "Crecer rara vez significa volverse otra persona; suele significar gestionar el lado flaco de quien ya eres. Empieza aquí.",
  ],
  typeDepthHead: ["Tu tipo, en profundidad", "La forma de tu tipo", "Por dentro de tu resultado"],
  typeOpener: [
    "Tu resultado, {code} — {title}, refleja {summary}",
    "{title} ({code}) capta una configuración particular: {summary}",
    "En el centro de tu resultado se asienta {code}, {title}: {summary}",
  ],
  confHigh: [
    "Tus respuestas apuntaron a este resultado de forma decidida: las preferencias subyacentes eran claras y consistentes.",
    "Esta tipificación se asienta sobre terreno firme; tus respuestas se inclinaron en la misma dirección con poca ambigüedad.",
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
    "Las dos notas que más te definen son tu {n0} (percentil {p0}) y tu {n1} (percentil {p1}). Casi todo lo demás en este informe se curva en torno a esas dos.",
    "Tu perfil se ancla en {n0} y {n1}: los dos rasgos que más se alejan de la media y que, por tanto, más moldean cómo funcionas.",
    "Si no recuerdas nada más: {n0} y {n1} llevan el peso de tu perfil, y el resto suena en su tonalidad.",
  ],
  ovP3: [
    "Esto no es un veredicto. La última sección orienta los mismos datos hacia dónde quieres ir, porque el sentido de verte con claridad es elegir, a propósito, qué hacer después.",
    "Léelo como un espejo, no como una jaula. Y cuando estés listo, el planificador de crecimiento usa estas mismas puntuaciones para trazar una ruta de donde estás a donde te gustaría estar.",
    "Nada de esto es fijo. Tus rasgos son tendencias, no sentencias, y el plan de mejora que sigue está hecho para moverlos, con suavidad y a propósito.",
  ],
  genericTitle: "Tu retrato de {top}",
  genericSubtitle: [
    "Un retrato guiado por tu {top} y tu {second}",
    "Definido sobre todo por tu {top}",
    "Donde tu {top} se encuentra con tu {second}",
  ],
  portraitTitle: "Tu retrato de personalidad",
  portraitSub: (n) => n,
  uniquenessNote:
    "Este informe se compuso a partir de tu patrón completo de respuestas más una semilla de generación única. " +
    "No hay dos generaciones que produzcan una prosa idéntica, ni siquiera con las mismas respuestas.",
  color: BIG_FIVE_COLOR_ES,
  dynamics: BIG_FIVE_DYNAMICS_ES,
};

const FR: ReportStrings = {
  openers: {
    "very high": [
      "Votre {name} se situe au {pct}e centile, près du sommet de l'échelle. Être {hd} est l'une des signatures qui définissent votre façon d'avancer dans le monde.",
      "Le {name} est un titre de votre profil : au {pct}e centile, des qualités comme être {hd} apparaissent de façon fiable, dans des situations très différentes.",
      "Vous obtenez un score exceptionnellement élevé en {name} ({pct}e centile). L'attrait pour être {hd} est si fort que les autres y voient sans doute simplement qui vous êtes.",
      "En {name}, vous vous installez bien dans la queue supérieure, le {pct}e centile. Attendez-vous à ce que votre côté {hd} mène la danse, souvent sans effort conscient.",
    ],
    high: [
      "Votre {name} est élevé, autour du {pct}e centile. Vous penchez nettement vers être {hd}, sans pour autant exclure l'autre côté.",
      "En {name}, vous obtenez un meilleur score que la plupart ({pct}e centile). Le pôle {hi} est votre mode habituel, avec assez de souplesse pour vous adapter quand il le faut.",
      "Le {name} est une force claire de votre tempérament ({pct}e centile) : être {hd} vient naturellement et avec fiabilité.",
      "Vous vous situez dans la bande supérieure de {name} ({pct}e centile), donc les qualités {hd} tendent à surgir d'abord, même si vous pouvez encore puiser dans le côté {lo} quand cela aide.",
    ],
    moderate: [
      "Votre {name} est équilibré, autour du {pct}e centile. Vous pouvez être {hd} ou {ld} selon le moment, ce qui vous donne une réelle polyvalence.",
      "En {name}, vous vous situez près du milieu ({pct}e centile). Plutôt qu'un réglage figé, vous avez un curseur que vous pouvez tourner vers {hi} ou {lo} selon la situation.",
      "Le {name} est une zone souple pour vous ({pct}e centile) : vous puisez aussi bien dans le côté {hd} que dans le {ld}, et le contexte décide souvent lequel apparaît.",
      "Au {pct}e centile, le {name} est l'un de vos traits adaptables : vous pouvez mener en étant {hd} ou vous replier sur être {ld} au besoin.",
    ],
    low: [
      "Votre {name} est plutôt bas, autour du {pct}e centile. Vous penchez vers être {ld}, et le pôle {lo} semble plus naturel que son opposé.",
      "En {name}, vous obtenez un score inférieur à la plupart ({pct}e centile), donc être {ld} est votre mode par défaut, le mode {hd} restant accessible mais plus coûteux.",
      "Le {name} se situe dans la bande basse pour vous ({pct}e centile) : c'est le côté {lo} qui mène, avec ses propres forces discrètes.",
      "Attendez-vous à ce que le pôle {lo} domine en {name} : au {pct}e centile, être {ld} est plus proche de qui vous êtes qu'être {hd}.",
    ],
    "very low": [
      "Votre {name} est très bas, le {pct}e centile, près du bas de l'échelle. Être {ld} est un trait qui définit votre fonctionnement.",
      "Le {name} se situe dans la queue basse ({pct}e centile) : le pôle {lo} est si constant que les autres y voient sans doute simplement votre nature.",
      "Vous obtenez le {pct}e centile en {name}, nettement {ld}. Le mode {hd} n'est accessible qu'au prix d'un effort réel et délibéré.",
      "En {name}, vous êtes bien dans l'extrême inférieur ({pct}e centile). Être {ld} n'est pas une humeur ici ; c'est presque une constante.",
    ],
  },
  nuance: [
    "Ce qui le rend vraiment vôtre, c'est le mélange exact ci-dessous, pas l'étiquette seule.",
    "Le détail intéressant tient moins au score lui-même qu'à la façon dont il se combine à vos autres traits.",
    "Deux personnes peuvent partager ce score et l'exprimer tout autrement : le vôtre est façonné par le motif qui l'entoure.",
    "Les chiffres plantent le décor ; la texture vient de la façon dont cela joue avec le reste de votre profil.",
    "Prenez le centile comme une coordonnée de départ, pas un verdict : la nuance est dans les combinaisons.",
  ],
  pct: (n) => String(Math.round(n)),
  fallbackWatchHigh: "Pencher fortement vers être {x} peut évincer son opposé quand une situation l'exige.",
  fallbackWatchLow: "Un net penchant vers {lo} signifie que le mode {hi} demande un effort délibéré.",
  rel: [
    "Votre {trait} se manifeste avec vos proches par le fait d'être {d} : cela façonne votre façon de donner et de demander ce dont vous avez besoin.",
    "En amour et en amitié, être {d} (de par votre {trait}) fait partie de ce sur quoi les gens apprennent à compter chez vous.",
  ],
  work: [
    "Au travail, votre {trait} vous rend {d} ; vous serez le plus dans votre élément là où c'est vraiment un atout.",
    "Être {d} colore votre façon d'opérer professionnellement : orientez-vous vers des rôles et des équipes qui le valorisent.",
  ],
  stress: [
    "Sous pression, votre {trait} penche vers être {d} : le savoir vous permet de choisir votre réinitialisation à dessein plutôt que par défaut.",
    "Quand le stress survient, attendez-vous à voir surgir votre {trait} ({d}) ; mettez en place des rituels de récupération qui lui conviennent.",
  ],
  relHead: ["Dans les relations", "Comment vous reliez"],
  workHead: ["Au travail et en équipe", "Comment vous opérez"],
  stressHead: ["Sous pression", "Stress et résilience"],
  strengthsHead: ["Forces distinctives", "Là où vous brillez", "Vos atouts naturels"],
  strengthsIntro: [
    "Ce sont les capacités que votre profil vous donne le plus fidèlement : les gestes qui vous coûtent peu et coûtent cher aux autres.",
    "Lisez-les comme votre terrain : les forces sur lesquelles vous pouvez vous appuyer sans grand effort conscient.",
    "Chaque profil a quelques forces porteuses. Voici les vôtres, tirées de vos traits les plus distinctifs.",
  ],
  growthHead: ["Marges de progression", "Où vous surveiller", "L'autre face de vos forces"],
  growthIntro: [
    "Aucune n'est un défaut, mais plutôt l'ombre que projettent vos forces : le coût prévisible de votre câblage particulier.",
    "Toute force poussée à l'excès devient un fardeau. Voici les marges à garder à l'œil.",
    "Progresser signifie rarement devenir quelqu'un d'autre ; le plus souvent, gérer le revers de qui vous êtes déjà. Commencez ici.",
  ],
  typeDepthHead: ["Votre type, en profondeur", "La forme de votre type", "À l'intérieur de votre résultat"],
  typeOpener: [
    "Votre résultat, {code} — {title}, reflète {summary}",
    "{title} ({code}) capte une configuration particulière : {summary}",
    "Au centre de votre résultat se trouve {code}, {title} : {summary}",
  ],
  confHigh: [
    "Vos réponses ont pointé ce résultat de façon décisive : les préférences sous-jacentes étaient claires et cohérentes.",
    "Ce typage repose sur un terrain solide ; vos réponses ont penché dans le même sens avec peu d'ambiguïté.",
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
    "Les deux notes qui vous définissent le plus sont votre {n0} ({p0}e centile) et votre {n1} ({p1}e centile). Presque tout le reste de ce rapport s'articule autour de ces deux-là.",
    "Votre profil est ancré par {n0} et {n1} : les deux traits qui s'écartent le plus de la moyenne et façonnent donc le plus votre fonctionnement.",
    "Si vous ne deviez retenir qu'une chose : {n0} et {n1} portent l'essentiel de votre profil, et le reste joue dans leur tonalité.",
  ],
  ovP3: [
    "Ce n'est pas un verdict. La dernière section oriente les mêmes données vers où vous voulez aller — car le but de se voir clairement est de choisir, à dessein, la suite.",
    "Lisez-le comme un miroir, pas une cage. Et quand vous serez prêt, le planificateur de progression utilise ces mêmes scores pour tracer une route d'où vous êtes vers où vous aimeriez être.",
    "Rien ici n'est figé. Vos traits sont des tendances, pas des sentences — et le plan d'amélioration qui suit est fait pour les déplacer, en douceur et à dessein.",
  ],
  genericTitle: "Votre portrait de {top}",
  genericSubtitle: [
    "Un portrait porté par votre {top} et votre {second}",
    "Défini surtout par votre {top}",
    "Là où votre {top} rencontre votre {second}",
  ],
  portraitTitle: "Votre portrait de personnalité",
  portraitSub: (n) => n,
  uniquenessNote:
    "Ce rapport a été composé à partir de l'ensemble de vos réponses, plus une graine de génération unique. " +
    "Deux générations ne produisent jamais une prose identique — même à partir de réponses identiques.",
  // French Big-Five color/dynamics fall back to English until translated.
  color: BIG_FIVE_COLOR,
  dynamics: BIG_FIVE_DYNAMICS,
};

const BUNDLES: Record<string, ReportStrings> = { en: EN, es: ES, fr: FR };

/** The report string bundle for a locale (English default). */
export function reportStrings(locale?: string): ReportStrings {
  return (locale && BUNDLES[locale]) || EN;
}
