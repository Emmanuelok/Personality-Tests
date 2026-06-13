import { capitalize } from "./variation";

/**
 * Localized prose for the Integrated Self synthesis (es/fr; English lives inline
 * in synthesis.ts as the default). Cross-test NLG is grammar-sensitive — the
 * headline especially — so each locale gets its own builders rather than
 * slot-filling English structure.
 */

export type Loc = "en" | "es" | "fr";
export const synthLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

export interface ThemeStr { name: string; adj: string; noun: string; blurb: string; narr: string }

const THEME_ES: Record<string, ThemeStr> = {
  explorer: { name: "La mente exploradora", adj: "imaginativa", noun: "exploradora", blurb: "Una curiosidad inquieta y una atracción por las ideas, la novedad y lo posible.", narr: "Una corriente profunda de curiosidad te recorre: te atraen las ideas, la novedad y lo que podría ser, más que lo que simplemente es." },
  achiever: { name: "El logro motivado", adj: "decidida", noun: "realizadora", blurb: "Un fuerte motor de ambición, disciplina y constancia.", narr: "Hay en ti un poderoso motor de ambición: pones el listón alto y haces el trabajo para alcanzarlo." },
  connector: { name: "El vínculo cálido", adj: "cálida", noun: "conectora", blurb: "Una orientación natural hacia las personas, la calidez y la pertenencia.", narr: "Las personas están en el centro de cómo funcionas: das calidez con facilidad y lees el ambiente sin esfuerzo." },
  anchor: { name: "El ancla serena", adj: "serena", noun: "ancla", blurb: "Calma, constancia y una presencia que estabiliza bajo presión.", narr: "Eres la persona estable: tranquila bajo carga, constante con el tiempo, a quien los demás acuden cuando todo se tambalea." },
  feeler: { name: "La profundidad sensible", adj: "sensible", noun: "alma", blurb: "Profundidad emocional, sensibilidad y una rica vida interior.", narr: "Sientes las cosas en alta resolución. Tu profundidad emocional es fuente de empatía, arte y sentido, y algo que cuidar con esmero." },
  idealist: { name: "El idealista de principios", adj: "íntegra", noun: "idealista", blurb: "Una sólida brújula moral y una atracción por la justicia y la integridad.", narr: "Llevas un fuerte sentido interno del bien y el mal, y una atracción genuina por la justicia, la integridad y un mundo mejor." },
  mover: { name: "El impulsor audaz", adj: "audaz", noun: "catalizador", blurb: "Decisión, asertividad y un impulso por hacer que las cosas pasen.", narr: "Tú mueves primero. Audaz, decidido y cómodo tomando la iniciativa, prefieres actuar y ajustar antes que esperar y dudar." },
  freespirit: { name: "El espíritu libre", adj: "espontánea", noun: "espíritu libre", blurb: "Amor por la libertad, la variedad y vivir el momento.", narr: "Necesitas espacio para respirar: libertad, variedad y la próxima experiencia. La rutina se siente como una jaula; lo posible, como un hogar." },
  strategist: { name: "El estratega agudo", adj: "estratégica", noun: "estratega", blurb: "Analítico, independiente y varios movimientos por delante.", narr: "Piensas en sistemas y vas varios pasos por delante: analítico, autosuficiente y sin sentimentalismos cuando hace falta cabeza fría." },
  introvert: { name: "El introvertido reflexivo", adj: "reflexiva", noun: "pensadora", blurb: "Profundidad antes que amplitud, y un rico mundo interior privado.", narr: "Tu energía mira hacia dentro. Piensas antes de hablar, prefieres la profundidad a la amplitud y rindes mejor en un espacio tranquilo y enfocado." },
};

const THEME_FR: Record<string, ThemeStr> = {
  explorer: { name: "L'esprit explorateur", adj: "imaginatif", noun: "explorateur", blurb: "Une curiosité insatiable et un attrait pour les idées, la nouveauté et le possible.", narr: "Un profond courant de curiosité vous traverse : les idées, la nouveauté et ce qui pourrait être vous attirent, plus que ce qui est simplement." },
  achiever: { name: "L'ambition motrice", adj: "déterminé", noun: "bâtisseur", blurb: "Un puissant moteur d'ambition, de discipline et de persévérance.", narr: "Il y a en vous un puissant moteur d'ambition : vous placez la barre haut et faites le travail pour l'atteindre." },
  connector: { name: "Le lien chaleureux", adj: "chaleureux", noun: "connecteur", blurb: "Une orientation naturelle vers les autres, la chaleur et l'appartenance.", narr: "Les gens sont au cœur de votre fonctionnement : vous donnez de la chaleur facilement et lisez l'ambiance sans effort." },
  anchor: { name: "L'ancre sereine", adj: "posé", noun: "ancre", blurb: "Calme, constance et une présence stabilisante sous pression.", narr: "Vous êtes la personne stable : calme sous la charge, constant dans le temps, celui vers qui on se tourne quand tout vacille." },
  feeler: { name: "La profondeur sensible", adj: "sensible", noun: "âme", blurb: "Profondeur émotionnelle, sensibilité et une riche vie intérieure.", narr: "Vous ressentez les choses en haute résolution. Votre profondeur émotionnelle est source d'empathie, d'art et de sens — et une chose à cultiver avec soin." },
  idealist: { name: "L'idéaliste de principes", adj: "intègre", noun: "idéaliste", blurb: "Une solide boussole morale et un attrait pour la justice et l'intégrité.", narr: "Vous portez un fort sens intérieur du bien et du mal, et un attrait sincère pour la justice, l'intégrité et un monde meilleur." },
  mover: { name: "Le moteur audacieux", adj: "audacieux", noun: "catalyseur", blurb: "Décision, assurance et l'envie de faire bouger les choses.", narr: "Vous agissez en premier. Audacieux, décidé et à l'aise pour mener, vous préférez agir et ajuster plutôt qu'attendre et hésiter." },
  freespirit: { name: "L'esprit libre", adj: "spontané", noun: "esprit libre", blurb: "Un amour de la liberté, de la variété et de l'instant présent.", narr: "Vous avez besoin d'air : liberté, variété et la prochaine expérience. La routine est une cage ; le possible, un foyer." },
  strategist: { name: "Le stratège affûté", adj: "stratégique", noun: "stratège", blurb: "Analytique, indépendant et plusieurs coups d'avance.", narr: "Vous pensez en systèmes et gardez plusieurs coups d'avance : analytique, autonome et sans sentimentalisme quand il faut garder la tête froide." },
  introvert: { name: "L'introverti réfléchi", adj: "réfléchi", noun: "penseur", blurb: "La profondeur avant l'étendue, et un riche monde intérieur.", narr: "Votre énergie se tourne vers l'intérieur. Vous réfléchissez avant de parler, préférez la profondeur à l'étendue et donnez le meilleur au calme." },
};

export function themeStr(id: string, en: ThemeStr, loc: Loc): ThemeStr {
  if (loc === "es") return THEME_ES[id] ?? en;
  if (loc === "fr") return THEME_FR[id] ?? en;
  return en;
}

/** Grammar-aware headline. English stacks adjectives before the noun; es/fr put
 *  the role first, then the descriptors, avoiding article gender and agreement. */
export function buildHeadline(defs: { adj: string; noun: string }[], name: string | undefined, loc: Loc): string {
  if (defs.length >= 2) {
    const [a, b] = defs;
    if (loc === "es") return `${capitalize(a.noun)}: ${a.adj} y ${b.adj}`;
    if (loc === "fr") return `${capitalize(a.noun)} : ${a.adj} et ${b.adj}`;
    return `The ${a.adj}, ${b.adj} ${a.noun}`;
  }
  if (defs.length === 1) {
    const a = defs[0];
    if (loc === "es") return `${capitalize(a.noun)}: ${a.adj}`;
    if (loc === "fr") return `${capitalize(a.noun)} : ${a.adj}`;
    return `The ${a.adj} ${a.noun}`;
  }
  if (loc === "es") return name ? `Retrato emergente de ${name}` : "Tu retrato emergente";
  if (loc === "fr") return name ? `Portrait émergent de ${name}` : "Votre portrait émergent";
  return name ? `${name}'s Emerging Portrait` : "Your Emerging Portrait";
}

/* ── tensions ───────────────────────────────────────────────────────────── */
export interface TensionStr { title: string; detail: string }
const TENSION_ES: Record<string, TensionStr> = {
  advstruct: { title: "Aventura vs. estructura", detail: "Una parte de ti ansía novedad y espontaneidad; otra quiere orden y un plan. Tu mejor vida reserva, dentro del plan, espacio para lo imprevisto." },
  warmwin: { title: "Calidez vs. afán de ganar", detail: "Eres a la vez muy considerado y muy asertivo. El paso de crecimiento es aprender cuándo liderar con fuerza y cuándo suavizar, y elegirlo a propósito." },
  ambalt: { title: "Ambición vs. altruismo", detail: "Valoras tanto el éxito personal como el bienestar de todos. Bien llevado, te hace un líder que eleva a los demás; mal llevado, te parte en dos." },
  ideaexec: { title: "Ideas vs. ejecución", detail: "Generas muchas más ideas de las que terminas. La estructura externa —plazos, alguien que cierre, una única próxima acción— es cómo tu creatividad se vuelve real." },
  closeness: { title: "Anhelar y temer la cercanía", detail: "Quieres conexión y a la vez te proteges de ella. Nombrar este patrón es el primer y mayor paso hacia la seguridad." },
  sensdrive: { title: "Sensibilidad vs. impulso incansable", detail: "Sientes los reveses con intensidad y aun así empujas con fuerza. Es una combinación poderosa, siempre que incorpores recuperación real, no solo más esfuerzo." },
};
const TENSION_FR: Record<string, TensionStr> = {
  advstruct: { title: "Aventure vs. structure", detail: "Une part de vous réclame nouveauté et spontanéité ; une autre veut de l'ordre et un plan. Votre meilleure vie ménage, dans le plan, de la place pour l'imprévu." },
  warmwin: { title: "Chaleur vs. envie de gagner", detail: "Vous êtes à la fois très attentionné et très affirmé. Le pas de croissance : apprendre quand mener fort et quand adoucir — et le choisir exprès." },
  ambalt: { title: "Ambition vs. altruisme", detail: "Vous valorisez la réussite personnelle et le bien-être de tous. Bien tenu, cela fait de vous un leader qui élève les autres ; mal tenu, cela vous écartèle." },
  ideaexec: { title: "Idées vs. exécution", detail: "Vous générez bien plus d'idées que vous n'en finissez. La structure externe — échéances, quelqu'un qui termine, une seule prochaine action — rend votre créativité réelle." },
  closeness: { title: "Désirer et craindre la proximité", detail: "Vous voulez le lien et vous vous en protégez en même temps. Nommer ce schéma est le premier et plus grand pas vers la sécurité." },
  sensdrive: { title: "Sensibilité vs. élan incessant", detail: "Vous encaissez les revers de plein fouet et poussez fort malgré tout. C'est une combinaison puissante — à condition d'intégrer une vraie récupération, pas seulement plus d'effort." },
};
export function tensionStr(id: string, en: TensionStr, loc: Loc): TensionStr {
  if (loc === "es") return TENSION_ES[id] ?? en;
  if (loc === "fr") return TENSION_FR[id] ?? en;
  return en;
}

/* ── operating manual ───────────────────────────────────────────────────── */
export const OM_LABELS: Record<Loc, Record<string, string>> = {
  en: { think: "How you take in the world", decide: "How you decide", work: "How you do your best work", connect: "How you connect & recharge", stress: "How you handle stress" },
  es: { think: "Cómo percibes el mundo", decide: "Cómo decides", work: "Cómo rindes al máximo", connect: "Cómo conectas y recargas", stress: "Cómo manejas el estrés" },
  fr: { think: "Comment vous percevez le monde", decide: "Comment vous décidez", work: "Comment vous donnez le meilleur", connect: "Comment vous vous reliez et rechargez", stress: "Comment vous gérez le stress" },
};

const OM: Record<string, Record<Loc, string>> = {
  "think.sn.hi": {
    en: "You take in the world through patterns and possibility — your mind reaches for meaning, connections, and what could be.",
    es: "Percibes el mundo a través de patrones y posibilidades: tu mente busca significado, conexiones y lo que podría ser.",
    fr: "Vous percevez le monde par schémas et possibilités — votre esprit cherche le sens, les liens et ce qui pourrait être.",
  },
  "think.sn.lo": {
    en: "You take in the world through concrete reality — you trust facts, direct experience, and what's actually in front of you.",
    es: "Percibes el mundo a través de la realidad concreta: confías en los hechos, la experiencia directa y lo que tienes delante.",
    fr: "Vous percevez le monde par la réalité concrète — vous faites confiance aux faits, à l'expérience directe et à ce qui est devant vous.",
  },
  "think.o.hi": {
    en: "You're drawn to ideas, novelty, and the abstract; your imagination is always a little ahead of the present.",
    es: "Te atraen las ideas, la novedad y lo abstracto; tu imaginación va siempre un poco por delante del presente.",
    fr: "Les idées, la nouveauté et l'abstrait vous attirent ; votre imagination devance toujours un peu le présent.",
  },
  "think.o.lo": {
    en: "You're practical and grounded, preferring the proven and tangible to the theoretical.",
    es: "Eres práctico y con los pies en la tierra: prefieres lo probado y tangible a lo teórico.",
    fr: "Vous êtes pratique et ancré, préférant l'éprouvé et le tangible au théorique.",
  },
  "think.default": {
    en: "You move fluidly between concrete detail and big-picture thinking, drawing on whichever the moment needs.",
    es: "Te mueves con fluidez entre el detalle concreto y la visión de conjunto, según lo que pida el momento.",
    fr: "Vous passez avec aisance du détail concret à la vue d'ensemble, selon ce que le moment exige.",
  },
  "decide.tf.hi": {
    en: "You decide with your values and your read on people — what's right and humane weighs as much as what's logical.",
    es: "Decides con tus valores y tu lectura de las personas: lo correcto y humano pesa tanto como lo lógico.",
    fr: "Vous décidez avec vos valeurs et votre lecture des gens — le juste et l'humain pèsent autant que le logique.",
  },
  "decide.tf.lo": {
    en: "You decide with impartial logic — you step back, weigh the evidence, and follow the principle even when it's uncomfortable.",
    es: "Decides con lógica imparcial: tomas distancia, sopesas la evidencia y sigues el principio aunque sea incómodo.",
    fr: "Vous décidez avec une logique impartiale — vous prenez du recul, pesez les preuves et suivez le principe même quand c'est inconfortable.",
  },
  "decide.a.hi": {
    en: "You weigh how choices land on people, and you lean toward the cooperative path.",
    es: "Sopesas cómo afectan tus decisiones a las personas y te inclinas por el camino cooperativo.",
    fr: "Vous pesez l'effet de vos choix sur les autres et penchez pour la voie coopérative.",
  },
  "decide.a.lo": {
    en: "You're willing to make the unpopular call and say the hard, true thing.",
    es: "Estás dispuesto a tomar la decisión impopular y a decir la verdad difícil.",
    fr: "Vous êtes prêt à trancher de façon impopulaire et à dire la vérité difficile.",
  },
  "decide.default": {
    en: "You blend head and heart when you decide, balancing logic against human impact.",
    es: "Mezclas cabeza y corazón al decidir, equilibrando la lógica con el impacto humano.",
    fr: "Vous mêlez tête et cœur pour décider, équilibrant la logique et l'impact humain.",
  },
  "work.c.hi": {
    en: "You do your best work with structure and ownership: a clear goal, a plan, and the satisfaction of finishing. People trust you to deliver.",
    es: "Rindes al máximo con estructura y responsabilidad: una meta clara, un plan y la satisfacción de terminar. La gente confía en que cumplirás.",
    fr: "Vous donnez le meilleur avec structure et responsabilité : un objectif clair, un plan et la satisfaction de finir. On compte sur vous pour livrer.",
  },
  "work.c.lo": {
    en: "You do your best work in bursts of energy and flexibility; rigid systems drain you, so lean on light external scaffolding — deadlines, a list, a partner who finishes.",
    es: "Rindes al máximo en ráfagas de energía y flexibilidad; los sistemas rígidos te agotan, así que apóyate en andamiaje externo ligero: plazos, una lista, alguien que cierre.",
    fr: "Vous donnez le meilleur par à-coups d'énergie et de souplesse ; les systèmes rigides vous épuisent, alors appuyez-vous sur un léger échafaudage externe — échéances, une liste, un partenaire qui termine.",
  },
  "work.grit": {
    en: "You do your best work through sheer perseverance — you outlast problems other people give up on.",
    es: "Rindes al máximo por pura perseverancia: aguantas más que problemas que otros abandonan.",
    fr: "Vous donnez le meilleur par pure persévérance — vous tenez plus longtemps que les problèmes que d'autres abandonnent.",
  },
  "work.default": {
    en: "You work best with a balance of structure and freedom — enough plan to aim, enough room to adapt.",
    es: "Trabajas mejor con un equilibrio de estructura y libertad: plan suficiente para apuntar, espacio suficiente para adaptarte.",
    fr: "Vous travaillez mieux avec un équilibre entre structure et liberté — assez de plan pour viser, assez d'espace pour vous adapter.",
  },
  "connect.e.hi": {
    en: "You're energized by people and recharge in company; connection is fuel, and solitude in large doses can feel flat.",
    es: "Las personas te dan energía y recargas en compañía; la conexión es combustible, y la soledad en grandes dosis puede saber a poco.",
    fr: "Les autres vous dynamisent et vous rechargez en leur compagnie ; le lien est un carburant, et la solitude à fortes doses peut sembler fade.",
  },
  "connect.e.lo": {
    en: "You recharge in solitude and connect best one-to-one; after a lot of socializing, quiet time isn't a luxury — it's how you reset.",
    es: "Recargas en soledad y conectas mejor uno a uno; tras mucho socializar, la calma no es un lujo: es como te reinicias.",
    fr: "Vous rechargez dans la solitude et vous reliez mieux en tête-à-tête ; après beaucoup de social, le calme n'est pas un luxe — c'est ainsi que vous vous réinitialisez.",
  },
  "connect.default": {
    en: "You move between sociability and solitude, reading your own energy to know which you need.",
    es: "Te mueves entre la sociabilidad y la soledad, leyendo tu propia energía para saber qué necesitas.",
    fr: "Vous oscillez entre sociabilité et solitude, lisant votre propre énergie pour savoir ce qu'il vous faut.",
  },
  "stress.n.hi": {
    en: "Under stress your system reacts strongly and recovers slowly. Your most reliable tools are naming the feeling, slowing your breath, and protecting recovery before pressure compounds.",
    es: "Bajo estrés tu sistema reacciona con fuerza y se recupera despacio. Tus herramientas más fiables: nombrar la emoción, frenar la respiración y proteger la recuperación antes de que la presión se acumule.",
    fr: "Sous stress, votre système réagit fort et récupère lentement. Vos outils les plus fiables : nommer l'émotion, ralentir votre souffle et protéger la récupération avant que la pression ne s'accumule.",
  },
  "stress.sr.hi": {
    en: "Under stress you stay composed and reset quickly — your steadiness is a real asset. Watch only that calm doesn't tip into ignoring early warning signs.",
    es: "Bajo estrés mantienes la calma y te recompones rápido: tu serenidad es una verdadera ventaja. Cuida solo que la calma no te lleve a ignorar señales tempranas.",
    fr: "Sous stress, vous restez posé et vous vous reprenez vite — votre stabilité est un vrai atout. Veillez seulement à ce que le calme ne masque pas les premiers signaux d'alerte.",
  },
  "stress.n.lo": {
    en: "You stay remarkably level under pressure; setbacks roll off you. Your blind spot is under-reacting to real risks until they're large.",
    es: "Te mantienes notablemente sereno bajo presión; los reveses te resbalan. Tu punto ciego es reaccionar tarde ante riesgos reales hasta que se hacen grandes.",
    fr: "Vous restez remarquablement stable sous pression ; les revers glissent sur vous. Votre angle mort : sous-réagir aux risques réels jusqu'à ce qu'ils deviennent grands.",
  },
  "stress.default": {
    en: "Under stress you're fairly resilient, with normal ups and downs; simple recovery rituals keep you steady.",
    es: "Bajo estrés eres bastante resiliente, con altibajos normales; rituales sencillos de recuperación te mantienen estable.",
    fr: "Sous stress, vous êtes assez résilient, avec des hauts et des bas normaux ; des rituels de récupération simples vous gardent stable.",
  },
};
export function omText(key: string, loc: Loc): string {
  return OM[key]?.[loc] ?? OM[key]?.en ?? "";
}
export const OM_CONNECT_AVOID: Record<Loc, string> = {
  en: " You also guard your independence in close relationships — sharing your inner world more openly is a growth edge.",
  es: " Además proteges tu independencia en las relaciones cercanas: compartir tu mundo interior más abiertamente es un margen de crecimiento.",
  fr: " Vous protégez aussi votre indépendance dans les relations proches — partager votre monde intérieur plus ouvertement est un axe de progrès.",
};

/* ── strengths / growth scaffolding + evidence ──────────────────────────── */
export const STR_SCAFFOLD: Record<Loc, { steadinessGrowth: string; calmStrength: string; building: (name: string) => string }> = {
  en: { steadinessGrowth: "Building emotional steadiness", calmStrength: "Calm and emotionally steady", building: (n) => `Building your ${n}` },
  es: { steadinessGrowth: "Desarrollar tu estabilidad emocional", calmStrength: "Sereno y emocionalmente estable", building: (n) => `Desarrollar tu ${n}` },
  fr: { steadinessGrowth: "Développer votre stabilité émotionnelle", calmStrength: "Calme et émotionnellement stable", building: (n) => `Développer votre ${n}` },
};
export const EVID: Record<Loc, { high: string; low: string }> = {
  en: { high: "high", low: "low" },
  es: { high: "alto", low: "bajo" },
  fr: { high: "élevé", low: "bas" },
};

/* ── overview paragraphs ────────────────────────────────────────────────── */
export function assessWord(n: number, loc: Loc): string {
  if (loc === "es") return n === 1 ? "evaluación" : "evaluaciones";
  if (loc === "fr") return n === 1 ? "évaluation" : "évaluations";
  return n === 1 ? "assessment" : "assessments";
}

export const OVERVIEW: Record<Loc, {
  p1Named: (name: string, n: number, w: string) => string[];
  p1Anon: (n: number, w: string) => string[];
  p2Themes: (list: string, narr: string) => string[];
  p2Empty: string;
  p3: string[];
  soFar: (n: number, w: string) => string;
}> = {
  en: {
    p1Named: (name, n, w) => [
      `${name}, this is the view from above — everything you've shared across ${n} ${w}, woven into one portrait of you.`,
      `${name}, most tests show you a slice. This is the whole mosaic: ${n} ${w} synthesized into a single, integrated picture.`,
    ],
    p1Anon: (n, w) => [
      `This is the view from above — everything across your ${n} ${w}, woven into one integrated portrait.`,
      `Most tests show a slice; this is the whole mosaic — ${n} ${w} synthesized into one picture.`,
    ],
    p2Themes: (list, narr) => [
      `The threads that keep surfacing: ${list}. ${narr}`,
      `Read together, a few themes recur — ${list}. ${narr}`,
    ],
    p2Empty: "Take a few more assessments and clear themes will start to emerge here, drawn from across everything you complete.",
    p3: [
      "None of this is a box. It's a high-resolution mirror — meant to help you understand yourself, play to your strengths, and grow on purpose.",
      "Hold it lightly and use it deliberately: the point of seeing yourself this clearly is to choose, with intention, who you become next.",
    ],
    soFar: (n, w) => `${n} ${w} so far`,
  },
  es: {
    p1Named: (name, n, w) => [
      `${name}, esta es la vista desde arriba: todo lo que has compartido en ${n} ${w}, tejido en un solo retrato de ti.`,
      `${name}, la mayoría de los tests te muestran una porción. Este es el mosaico completo: ${n} ${w} sintetizadas en una imagen integrada.`,
    ],
    p1Anon: (n, w) => [
      `Esta es la vista desde arriba: todo lo de tus ${n} ${w}, tejido en un retrato integrado.`,
      `La mayoría de los tests muestran una porción; este es el mosaico completo: ${n} ${w} sintetizadas en una sola imagen.`,
    ],
    p2Themes: (list, narr) => [
      `Los hilos que reaparecen: ${list}. ${narr}`,
      `Leídos en conjunto, recurren algunos temas: ${list}. ${narr}`,
    ],
    p2Empty: "Haz unas cuantas evaluaciones más y aquí empezarán a emerger temas claros, extraídos de todo lo que completes.",
    p3: [
      "Nada de esto es una etiqueta. Es un espejo de alta resolución, pensado para ayudarte a comprenderte, aprovechar tus fortalezas y crecer a propósito.",
      "Tómalo con ligereza y úsalo con intención: ver con esta claridad sirve para elegir, a conciencia, en quién te conviertes después.",
    ],
    soFar: (n, w) => `${n} ${w} hasta ahora`,
  },
  fr: {
    p1Named: (name, n, w) => [
      `${name}, voici la vue d'ensemble : tout ce que vous avez partagé sur ${n} ${w}, tissé en un seul portrait de vous.`,
      `${name}, la plupart des tests n'en montrent qu'une part. Voici la mosaïque entière : ${n} ${w} synthétisées en une image intégrée.`,
    ],
    p1Anon: (n, w) => [
      `Voici la vue d'ensemble : tout ce qui ressort de vos ${n} ${w}, tissé en un portrait intégré.`,
      `La plupart des tests n'en montrent qu'une part ; voici la mosaïque entière — ${n} ${w} synthétisées en une seule image.`,
    ],
    p2Themes: (list, narr) => [
      `Les fils qui reviennent sans cesse : ${list}. ${narr}`,
      `Lus ensemble, quelques thèmes reviennent — ${list}. ${narr}`,
    ],
    p2Empty: "Passez encore quelques évaluations et des thèmes clairs émergeront ici, tirés de tout ce que vous complétez.",
    p3: [
      "Rien de tout cela n'est une case. C'est un miroir haute résolution — pour vous aider à vous comprendre, jouer de vos forces et grandir à dessein.",
      "Tenez-le avec légèreté et utilisez-le avec intention : se voir aussi clairement sert à choisir, en conscience, qui vous devenez ensuite.",
    ],
    soFar: (n, w) => `${n} ${w} à ce jour`,
  },
};
