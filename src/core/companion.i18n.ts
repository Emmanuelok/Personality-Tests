import { oxford } from "./variation";

/**
 * Localized scaffolding for the "Ask Atlas" companion (es/fr; English is the
 * default and is reproduced here so behavior is identical). The data the
 * companion quotes — trait narratives, operating-manual text, section
 * paragraphs, theme narratives — is already localized upstream, so localizing
 * the connective wrappers, intent keywords, and suggested questions makes the
 * whole conversation speak the user's language.
 */

export type Loc = "en" | "es" | "fr";
export const cLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

/* ── suggested questions ────────────────────────────────────────────────── */
const Q: Record<Loc, { integrated: string[]; report: string[]; trait: (n: string) => string }> = {
  en: {
    integrated: ["What are my biggest strengths?", "What's my next practice?", "Where should I focus on growing?", "How consistent are my results?", "How do I handle stress?", "Sum me up in a sentence."],
    report: ["What does this mean for me?", "What are my strengths?", "What should I watch out for?", "How am I in relationships?", "How do I improve?"],
    trait: (n) => `Tell me about my ${n}.`,
  },
  es: {
    integrated: ["¿Cuáles son mis mayores fortalezas?", "¿Cuál es mi próxima práctica?", "¿En qué debería centrarme para crecer?", "¿Qué tan consistentes son mis resultados?", "¿Cómo manejo el estrés?", "Resúmeme en una frase."],
    report: ["¿Qué significa esto para mí?", "¿Cuáles son mis fortalezas?", "¿A qué debo prestar atención?", "¿Cómo soy en las relaciones?", "¿Cómo puedo mejorar?"],
    trait: (n) => `Háblame de mi ${n}.`,
  },
  fr: {
    integrated: ["Quelles sont mes plus grandes forces ?", "Quelle est ma prochaine pratique ?", "Où devrais-je me concentrer pour progresser ?", "Mes résultats sont-ils cohérents ?", "Comment gérer le stress ?", "Résumez-moi en une phrase."],
    report: ["Qu'est-ce que cela signifie pour moi ?", "Quelles sont mes forces ?", "À quoi dois-je faire attention ?", "Comment suis-je en relation ?", "Comment progresser ?"],
    trait: (n) => `Parlez-moi de mon ${n}.`,
  },
};

export function cSuggest(kind: "report" | "integrated", distinctName: string | undefined, loc: Loc): string[] {
  if (kind === "integrated") return Q[loc].integrated;
  const base = [...Q[loc].report];
  if (distinctName) base.splice(2, 0, Q[loc].trait(distinctName));
  return base.slice(0, 5);
}

/* ── intent keywords (each locale also carries the English words, so mixed or
 *    English input keeps working and the en path is unchanged) ───────────── */
type IntentKey = "greet" | "thanks" | "improve" | "strengths" | "relationships" | "work" | "stress" | "type" | "summary" | "themes" | "consistency" | "coach";
const KW_EN: Record<IntentKey, string[]> = {
  greet: ["hello", "hi ", "hey", "help", "what can you"],
  thanks: ["thank", "thanks", "appreciate"],
  improve: ["improve", "grow", "better", "work on", "develop", "weak", "blind", "watch", "flaw"],
  strengths: ["strength", "good at", "best", "superpower", "shine", "advantage"],
  relationships: ["relationship", "partner", "love", "dating", "friend", "marriage", "romantic"],
  work: ["work", "career", "job", "team", "leader", "boss", "colleague", "profession", "manage"],
  stress: ["stress", "anxiety", "overwhelm", "cope", "pressure", "burnout", "calm down", "anxious"],
  type: ["type", "what am i", "who am i", "my result", "code"],
  summary: ["summary", "sum me", "tell me about", "describe me", "overview", "in a sentence", "tldr"],
  themes: ["theme", "thread", "pattern", "core"],
  consistency: ["consistent", "consisten", "agree", "disagree", "contradict", "conflict", "reliable", "accurate", "cross-check", "cross check", "line up", "match up", "the same"],
  coach: ["work on", "growth edge", "practice", "where do i start", "where to start", "what now", "what should i do", "next step", "my plan", "coach me"],
};
const KW_ES: Record<IntentKey, string[]> = {
  greet: ["hola", "ayuda", "qué puedes", "que puedes"],
  thanks: ["gracias", "agradezco"],
  improve: ["mejor", "crec", "desarroll", "trabajar en", "débil", "punto ciego", "cuidar", "defecto"],
  strengths: ["fortaleza", "se me da bien", "mejor", "superpoder", "destac", "ventaja", "fuerte"],
  relationships: ["relaci", "pareja", "amor", "cita", "amig", "matrimonio", "romántic", "romantic"],
  work: ["trabaj", "carrera", "empleo", "equipo", "líder", "lider", "jefe", "coleg", "profesi", "gestion"],
  stress: ["estrés", "estres", "ansiedad", "abrumad", "afront", "presión", "presion", "agotamiento", "calma", "ansios"],
  type: ["tipo", "qué soy", "que soy", "quién soy", "quien soy", "mi resultado", "código", "codigo"],
  summary: ["resum", "descríbeme", "describeme", "visión general", "en una frase", "en pocas palabras"],
  themes: ["tema", "hilo", "patrón", "patron", "núcleo", "nucleo"],
  consistency: ["consisten", "coincid", "coheren", "contradic", "conflicto", "fiable", "precis", "se cruzan", "concuerd", "lo mismo", "de acuerdo"],
  coach: ["trabajar en", "punto de crecimiento", "práctica", "practica", "por dónde empiezo", "por donde empiezo", "qué hago ahora", "que hago ahora", "siguiente paso", "mi plan"],
};
const KW_FR: Record<IntentKey, string[]> = {
  greet: ["bonjour", "salut", "aide", "que peux", "que pouvez"],
  thanks: ["merci", "reconnais"],
  improve: ["amélior", "amelior", "grandir", "progress", "mieux", "travailler sur", "faible", "angle mort", "défaut", "defaut"],
  strengths: ["force", "doué", "doue", "meilleur", "superpouvoir", "briller", "atout", "fort"],
  relationships: ["relation", "partenaire", "amour", "rencontre", "ami", "mariage", "romantique", "couple"],
  work: ["travail", "carrière", "carriere", "emploi", "équipe", "equipe", "leader", "patron", "collègue", "collegue", "profession", "gérer", "gerer"],
  stress: ["stress", "anxiété", "anxiete", "débord", "debord", "gérer", "pression", "épuisement", "epuisement", "calme", "anxieux"],
  type: ["type", "que suis-je", "qui suis-je", "mon résultat", "mon resultat", "code"],
  summary: ["résum", "resum", "décris-moi", "decris-moi", "aperçu", "apercu", "en une phrase", "en bref"],
  themes: ["thème", "theme", "fil", "motif", "noyau", "cœur", "coeur"],
  consistency: ["cohéren", "coheren", "concord", "contradic", "conflit", "fiable", "précis", "precis", "recoup", "pareil", "d'accord", "se croisent"],
  coach: ["travailler sur", "axe de progrès", "axe de progres", "pratique", "par où commencer", "par ou commencer", "prochaine étape", "prochaine pratique", "mon plan"],
};
const KW: Record<Loc, Record<IntentKey, string[]>> = { en: KW_EN, es: KW_ES, fr: KW_FR };

/** True if the question hits an intent in this locale (English words always included). */
export function hasIntent(q: string, loc: Loc, intent: IntentKey): boolean {
  const words = loc === "en" ? KW_EN[intent] : [...KW[loc][intent], ...KW_EN[intent]];
  return words.some((w) => q.includes(w));
}

const conjOf = (loc: Loc) => (loc === "es" ? "y" : loc === "fr" ? "et" : "and");
const list = (arr: string[], loc: Loc) => oxford(arr, conjOf(loc));

/* ── answer templates ───────────────────────────────────────────────────── */
export const CT = {
  greet: (profile: string, who: string, loc: Loc): string => {
    if (loc === "es") return `${who}pregúntame lo que quieras sobre tu ${profile}: tus fortalezas, tus puntos ciegos, cómo te muestras en las relaciones o en el trabajo, o cómo crecer. Prueba una de las sugerencias de abajo.`;
    if (loc === "fr") return `${who}demandez-moi tout sur votre ${profile} : vos forces, vos angles morts, comment vous vous montrez en relation ou au travail, ou comment progresser. Essayez une des suggestions ci-dessous.`;
    return `${who}ask me anything about your ${profile} — your strengths, your blind spots, how you show up in relationships or at work, or how to grow. Try one of the suggestions below.`;
  },
  profileWord: (integrated: boolean, loc: Loc): string => {
    if (loc === "es") return integrated ? "perfil integrado" : "resultado";
    if (loc === "fr") return integrated ? "profil intégré" : "résultat";
    return integrated ? "integrated profile" : "result";
  },
  thanks: (name: string | undefined, loc: Loc, pickSecond: boolean): string => {
    const n = name ? `, ${name}` : "";
    if (loc === "es") return pickSecond ? `De nada${n}. Pregúntame cualquier otra cosa.` : `Cuando quieras${n}. Aquí estoy si quieres profundizar.`;
    if (loc === "fr") return pickSecond ? `Je vous en prie${n}. Demandez-moi autre chose.` : `Quand vous voulez${n}. Je suis là dès que vous voulez approfondir.`;
    return pickSecond ? `You're welcome${n}. Ask me anything else.` : `Anytime${n}. I'm here whenever you want to go deeper.`;
  },
  traitLead: (who: string, name: string, standing: string, level: string, loc: Loc): string => {
    if (loc === "es") return `${who}tu resultado en ${name} es ${standing} (${level}).`;
    if (loc === "fr") return `${who}votre résultat en ${name} est ${standing} (${level}).`;
    return `${who}your ${name} result is ${standing} (${level}).`;
  },
  upside: (arr: string[], loc: Loc): string => {
    if (loc === "es") return ` A favor: ${list(arr, loc)}.`;
    if (loc === "fr") return ` Côté positif : ${list(arr, loc)}.`;
    return ` On the upside: ${list(arr, loc)}.`;
  },
  strengthsIntegrated: (who: string, arr: string[], loc: Loc): string => {
    if (loc === "es") return `${who}en todo lo que has hecho, tus fortalezas distintivas son ${list(arr, loc)}. Apóyate en ellas: son tu terreno.`;
    if (loc === "fr") return `${who}sur tout ce que vous avez passé, vos forces marquantes sont ${list(arr, loc)}. Appuyez-vous dessus : c'est votre terrain.`;
    return `${who}across everything you've taken, your standout strengths are ${list(arr, loc)}. Lean on these — they're your home turf.`;
  },
  strengthsReport: (who: string, arr: string[], loc: Loc, pick: number): string => {
    const tailEn = ["These come cheaply to you and expensively to others.", "Build your life around these and you'll feel in your element.", "Use them on purpose, especially under pressure."];
    const tailEs = ["Te salen baratas a ti y caras a los demás.", "Construye tu vida en torno a ellas y te sentirás en tu elemento.", "Úsalas a propósito, sobre todo bajo presión."];
    const tailFr = ["Elles vous coûtent peu et coûtent cher aux autres.", "Bâtissez votre vie autour d'elles et vous serez dans votre élément.", "Utilisez-les exprès, surtout sous pression."];
    const tail = (loc === "es" ? tailEs : loc === "fr" ? tailFr : tailEn)[pick];
    if (loc === "es") return `${who}tus mayores fortalezas son ${list(arr, loc)}. ${tail}`;
    if (loc === "fr") return `${who}vos plus grandes forces sont ${list(arr, loc)}. ${tail}`;
    return `${who}your biggest strengths are ${list(arr, loc)}. ${tail}`;
  },
  growthScale: (who: string, name: string, watch: string, loc: Loc): string => {
    if (loc === "es") return `${who}para desarrollar tu ${name}: elige un comportamiento pequeño y repetible que lo impulse, hazlo a diario y revísalo cada semana; los rasgos se mueven con práctica, no con fuerza de voluntad.${watch} El Plan de Crecimiento de tu informe lo convierte en pasos concretos.`;
    if (loc === "fr") return `${who}pour développer votre ${name} : choisissez un petit comportement répétable qui le stimule, faites-le chaque jour et faites le point chaque semaine — les traits bougent par la pratique, pas par la volonté.${watch} Le Plan de croissance de votre rapport en fait des étapes concrètes.`;
    return `${who}to grow your ${name}: pick one small, repeated behavior that nudges it, do it daily, and review weekly — traits move with practice, not willpower.${watch} The Growth Plan in your report turns this into specific steps.`;
  },
  watch: (arr: string[], loc: Loc): string => {
    if (loc === "es") return ` Cuidado con ${list(arr, loc)}.`;
    if (loc === "fr") return ` Attention à ${list(arr, loc)}.`;
    return ` Watch for ${list(arr, loc)}.`;
  },
  coachPlan: (who: string, focus: string, band: string, practices: string[], loc: Loc): string => {
    const tag = band ? ` (${band})` : "";
    if (loc === "es") return `${who}tu punto de crecimiento ahora mismo es ${focus}${tag}. Empieza por estas prácticas: ${list(practices, loc)}. Pequeño y repetido gana a grande y ocasional; tu coach de bienestar en el Perfil Integrado lo convierte en un calendario.`;
    if (loc === "fr") return `${who}votre axe de progrès en ce moment est ${focus}${tag}. Commencez par ces pratiques : ${list(practices, loc)}. Petit et répété vaut mieux que grand et rare — votre coach de bien-être dans le Profil Intégré en fait un planning.`;
    return `${who}your growth edge right now is ${focus}${tag}. Start with these practices: ${list(practices, loc)}. Small and repeated beats big and rare — your wellbeing coach in the Integrated Profile turns this into a schedule.`;
  },
  growthIntegrated: (who: string, arr: string[], loc: Loc): string => {
    if (loc === "es") return `${who}tu frontera de crecimiento más clara ahora mismo es ${list(arr, loc)}. Crecer no es un salto: es un comportamiento deliberado, repetido. Empieza por el que más importa esta temporada.`;
    if (loc === "fr") return `${who}votre frontière de croissance la plus nette en ce moment est ${list(arr, loc)}. Grandir n'est pas un bond : c'est un comportement délibéré, répété. Commencez par celui qui compte le plus cette saison.`;
    return `${who}your clearest growth frontier right now is ${list(arr, loc)}. Growth isn't a leap — it's one deliberate behavior, repeated. Start with the single one that matters most this season.`;
  },
  growthReport: (who: string, arr: string[], loc: Loc): string => {
    if (loc === "es") return `${who}tus márgenes de crecimiento son ${list(arr, loc)}. Ninguno es un defecto: son el coste de tu forma particular de ser. El Plan de Crecimiento de tu informe traza pasos concretos y con base científica.`;
    if (loc === "fr") return `${who}vos axes de progrès sont ${list(arr, loc)}. Aucun n'est un défaut : c'est le prix de votre câblage particulier. Le Plan de croissance de votre rapport trace des étapes concrètes et fondées.`;
    return `${who}your current growth observations are ${list(arr, loc)}. None are flaws — they are context-sensitive patterns worth exploring. Your report's Growth Plan maps concrete, evidence-based steps.`;
  },
  relFallback: (who: string, loc: Loc): string => {
    if (loc === "es") return `${who}tu perfil influye en cómo te vinculas: prueba la herramienta de Compatibilidad para compararte con alguien, y mira la sección «En las relaciones» de tu informe.`;
    if (loc === "fr") return `${who}votre profil façonne vos liens — essayez l'outil de Compatibilité pour vous comparer à quelqu'un, et voyez la section « En relation » de votre rapport.`;
    return `${who}your profile shapes how you bond — try the Compatibility tool to compare with someone, and see the "In Relationships" section of your report.`;
  },
  workFallback: (who: string, loc: Loc): string => {
    if (loc === "es") return `${who}tus rasgos apuntan a entornos donde prosperarás: mira la sección «En el trabajo» de tu informe para más detalles.`;
    if (loc === "fr") return `${who}vos traits pointent vers des environnements où vous vous épanouirez — voyez la section « Au travail » de votre rapport.`;
    return `${who}your traits point to environments where you'll thrive — see the "At Work" section of your report for specifics.`;
  },
  stressFallback: (who: string, loc: Loc): string => {
    if (loc === "es") return `${who}bajo presión, nombra la emoción, frena la respiración y protege la recuperación antes de que el estrés se acumule: los pequeños reinicios ganan a los grandes.`;
    if (loc === "fr") return `${who}sous pression, nommez l'émotion, ralentissez votre souffle et protégez la récupération avant que le stress ne s'accumule — les petits réinitialisations valent mieux que les grandes.`;
    return `${who}under pressure, name the feeling, slow your breathing, and protect recovery before stress compounds — small resets beat big ones.`;
  },
  typeIs: (who: string, code: string, title: string, summary: string, loc: Loc): string => {
    if (loc === "es") return `${who}saliste como ${code} — ${title}. ${summary}`;
    if (loc === "fr") return `${who}vous ressortez comme ${code} — ${title}. ${summary}`;
    return `${who}you came out as ${code} — ${title}. ${summary}`;
  },
  typeReads: (who: string, title: string, ov: string, loc: Loc): string => {
    if (loc === "es") return `${who}tu perfil se lee como «${title}». ${ov}`;
    if (loc === "fr") return `${who}votre profil se lit comme « ${title} ». ${ov}`;
    return `${who}your profile reads as "${title}". ${ov}`;
  },
  summaryIntegrated: (who: string, title: string, tail: string, loc: Loc): string => {
    if (loc === "es") return `${who}en una frase: eres «${title}». ${tail}`;
    if (loc === "fr") return `${who}en une phrase : vous êtes « ${title} ». ${tail}`;
    return `${who}in a sentence: you're "${title}". ${tail}`;
  },
  summaryReportTitle: (title: string, loc: Loc): string => {
    if (loc === "es") return `tu resultado es «${title}».`;
    if (loc === "fr") return `votre résultat est « ${title} ».`;
    return `your result is "${title}".`;
  },
  typeTail: (code: string, title: string, loc: Loc): string => {
    if (loc === "es") return ` Eres ${code} — ${title}.`;
    if (loc === "fr") return ` Vous êtes ${code} — ${title}.`;
    return ` You're ${code} — ${title}.`;
  },
  themesIntro: (who: string, loc: Loc): string => {
    if (loc === "es") return `${who}los hilos que reaparecen en tus evaluaciones son:`;
    if (loc === "fr") return `${who}les fils qui reviennent dans vos évaluations sont :`;
    return `${who}the threads that keep surfacing across your assessments are:`;
  },
  themesEmpty: (loc: Loc): string => {
    if (loc === "es") return "Haz unas cuantas evaluaciones más y aquí emergerán tus temas recurrentes.";
    if (loc === "fr") return "Passez quelques évaluations de plus et vos thèmes récurrents émergeront ici.";
    return "Take a few more assessments and your recurring themes will emerge here.";
  },
  fallback: (who: string, traitHint: string, loc: Loc): string => {
    if (loc === "es") return `${who}respondo mejor sobre tus fortalezas, márgenes de crecimiento, relaciones, estilo de trabajo, estrés y qué significa tu resultado.${traitHint} Prueba una sugerencia de abajo.`;
    if (loc === "fr") return `${who}je réponds le mieux sur vos forces, axes de progrès, relations, style de travail, stress et ce que signifie votre résultat.${traitHint} Essayez une suggestion ci-dessous.`;
    return `${who}I can answer best about your strengths, growth edges, relationships, work style, stress, and what your result means.${traitHint} Try a suggestion below.`;
  },
  consistency: (who: string, count: number, conv: { name: string; insight: string } | undefined, div: { insight: string } | undefined, loc: Loc): string => {
    const agree = conv ? conv.insight : "";
    const split = div ? " " + div.insight : "";
    if (loc === "es") return `${who}he cruzado los rasgos profundos que comparten tus ${count} evaluaciones. ${agree}${split}`;
    if (loc === "fr") return `${who}j'ai recoupé les traits profonds que partagent vos ${count} évaluations. ${agree}${split}`;
    return `${who}I cross-checked the deep traits your ${count} assessments share. ${agree}${split}`;
  },
  consistencyNone: (who: string, loc: Loc): string => {
    if (loc === "es") return `${who}aún no tienes suficientes pruebas que se solapen para cruzarlas. Haz una o dos más que midan rasgos parecidos y podré decirte dónde coinciden y dónde difieren.`;
    if (loc === "fr") return `${who}vous n'avez pas encore assez de tests qui se recoupent pour les croiser. Passez-en un ou deux de plus mesurant des traits proches et je pourrai dire où ils concordent ou divergent.`;
    return `${who}you don't yet have enough overlapping tests for me to cross-check. Take one or two more that measure similar traits and I'll show you where they agree and differ.`;
  },
  traitHint: (name: string, loc: Loc): string => {
    if (loc === "es") return ` También puedes preguntar por un rasgo concreto, como «${name}».`;
    if (loc === "fr") return ` Vous pouvez aussi demander un trait précis, comme « ${name} ».`;
    return ` You can also ask about a specific trait, like "${name}."`;
  },
};
