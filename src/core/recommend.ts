import type { Instrument } from "./types";
import type { SynthEntry } from "./synthesis";
import { INSTRUMENTS, getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";
import { Rng, seedFrom } from "./prng";

/**
 * Personalized recommendation engine — the platform's "what should I do next?" brain.
 *
 * Most catalogs show everyone the same wall of tests. This reads what a person has
 * already completed — their standout traits, the categories they've touched, the
 * flagship pairings that build on each other — and proposes the genuinely best next
 * steps, each with a warm, specific reason that names *their* result. The goal is the
 * feeling that the platform was built for them as a person.
 *
 * Pure and deterministic (seedable), framework-agnostic, and locale-aware so the
 * reasons read naturally in English, Spanish, and French.
 */

export type RecKind = "foundation" | "deepen" | "pairing" | "explore" | "support";

export interface Recommendation {
  instrument: Instrument;
  /** 0..100 relevance for ordering. */
  score: number;
  kind: RecKind;
  /** A warm, personalized "because you…" sentence (localized). */
  reason: string;
  /** Short chip label for the card (localized). */
  badge: string;
}

export interface Spotlight {
  /** Personal header, name-aware. */
  headline: string;
  /** One warm sentence naming the user's standout descriptors. */
  line: string;
  /** Short trait chips, e.g. "Openness ↑". */
  chips: string[];
  /** True when the user has completed essentially everything. */
  complete: boolean;
}

type Loc = "en" | "es" | "fr";
const loc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

/* ── localized scaffolding ──────────────────────────────────────────────── */

const BADGE: Record<RecKind, Record<Loc, string>> = {
  foundation: { en: "Start here", es: "Empieza aquí", fr: "Commencez ici" },
  deepen: { en: "Goes deeper", es: "Profundiza", fr: "Va plus loin" },
  pairing: { en: "Natural next step", es: "Siguiente paso natural", fr: "Suite naturelle" },
  explore: { en: "New territory", es: "Territorio nuevo", fr: "Nouveau terrain" },
  support: { en: "For you right now", es: "Para ti ahora", fr: "Pour vous, maintenant" },
};

const FOUNDATION_REASON: Record<Loc, string> = {
  en: "The cornerstone of the whole atlas. It maps the full landscape of your personality — the ideal place to begin.",
  es: "La piedra angular de todo el atlas. Mapea el paisaje completo de tu personalidad: el lugar ideal para empezar.",
  fr: "La pierre angulaire de tout l'atlas. Elle cartographie l'ensemble de votre personnalité — l'endroit idéal pour commencer.",
};

const EXPLORE_REASON: Record<Loc, string[]> = {
  en: [
    "A lens you haven't tried yet — and a natural complement to the picture you're building.",
    "Something new for your atlas: this opens a part of you the tests so far haven't touched.",
    "A different angle on who you are, to round out what you've already discovered.",
  ],
  es: [
    "Una mirada que aún no has probado, y un complemento natural al retrato que vas formando.",
    "Algo nuevo para tu atlas: abre una parte de ti que las pruebas aún no han tocado.",
    "Un ángulo distinto de quién eres, para completar lo que ya has descubierto.",
  ],
  fr: [
    "Un regard que vous n'avez pas encore essayé — un complément naturel au portrait qui se dessine.",
    "Du nouveau pour votre atlas : cela ouvre une part de vous que les tests n'ont pas encore explorée.",
    "Un autre angle sur qui vous êtes, pour compléter ce que vous avez déjà découvert.",
  ],
};

/** Reason archetypes for trait-driven and pairing recommendations (trait/source baked in per language). */
type ArchKey =
  | "open_nfc" | "open_curio" | "consc_selfcontrol" | "consc_grit" | "neuro_stress"
  | "neuro_esteem" | "extra_disc" | "agree_empathy" | "agree_shadow" | "lowmood_perma"
  | "stress_cope" | "burnout_cope"
  | "bf_hexaco" | "bf_aspects" | "jung_ennea" | "jung_keirsey" | "ennea_jung"
  | "disc_color" | "att_love" | "att_conflict" | "via_values" | "riasec_anchor" | "eq_empathy";

const ARCH: Record<ArchKey, Record<Loc, string>> = {
  open_nfc: {
    en: "Your Openness ran high — the mark of a mind that enjoys ideas for their own sake. This measures exactly that appetite for thinking.",
    es: "Tu Apertura salió alta: la marca de una mente que disfruta las ideas por sí mismas. Esto mide justo ese apetito por pensar.",
    fr: "Votre Ouverture était élevée — la marque d'un esprit qui aime les idées pour elles-mêmes. Ceci mesure précisément ce goût de penser.",
  },
  open_curio: {
    en: "Curiosity clearly runs in you (your Openness was high). This looks closely at how you chase novelty and embrace the unknown.",
    es: "La curiosidad claramente te habita (tu Apertura fue alta). Esto examina cómo persigues la novedad y abrazas lo desconocido.",
    fr: "La curiosité vous habite clairement (votre Ouverture était élevée). Ceci examine de près comment vous cherchez la nouveauté et accueillez l'inconnu.",
  },
  consc_selfcontrol: {
    en: "Your Conscientiousness came in on the lower side — entirely workable. This zooms in on everyday self-control, where small changes pay off fast.",
    es: "Tu Responsabilidad salió algo baja, algo muy manejable. Esto se centra en el autocontrol diario, donde los pequeños cambios rinden rápido.",
    fr: "Votre Conscience était plutôt basse — tout à fait gérable. Ceci se concentre sur la maîtrise de soi au quotidien, où de petits changements paient vite.",
  },
  consc_grit: {
    en: "You scored high on Conscientiousness. Grit asks the next question: does that diligence become long-haul perseverance?",
    es: "Puntuaste alto en Responsabilidad. La Determinación plantea lo siguiente: ¿se convierte esa diligencia en perseverancia a largo plazo?",
    fr: "Vous avez obtenu un score élevé en Conscience. Le Cran pose la question suivante : cette rigueur devient-elle une persévérance de longue haleine ?",
  },
  neuro_stress: {
    en: "Your sensitivity to stress showed in your profile, so a gentle, honest read on how you're coping right now could be genuinely useful.",
    es: "Tu sensibilidad al estrés se notó en tu perfil, así que una lectura suave y honesta de cómo lo llevas ahora podría serte muy útil.",
    fr: "Votre sensibilité au stress est apparue dans votre profil ; une lecture douce et honnête de la façon dont vous tenez en ce moment pourrait vraiment aider.",
  },
  neuro_esteem: {
    en: "Sensitivity showed up in your profile. This is a kind, well-validated check on how you regard yourself underneath it all.",
    es: "La sensibilidad apareció en tu perfil. Esta es una comprobación amable y bien validada de cómo te valoras en el fondo.",
    fr: "La sensibilité est apparue dans votre profil. Voici un examen bienveillant et validé de la façon dont vous vous estimez au fond.",
  },
  extra_disc: {
    en: "Your Extraversion was high — you bring real energy to people. DISC translates that into how you actually show up in a team.",
    es: "Tu Extraversión fue alta: aportas verdadera energía a la gente. DISC traduce eso en cómo apareces de verdad en un equipo.",
    fr: "Votre Extraversion était élevée — vous apportez une vraie énergie aux autres. DISC traduit cela en votre façon réelle d'agir en équipe.",
  },
  agree_empathy: {
    en: "Your warmth (high Agreeableness) stood out. The Empathy index splits that into feeling with others versus seeing through their eyes.",
    es: "Tu calidez (Amabilidad alta) destacó. El índice de Empatía la divide en sentir con los demás frente a ver con sus ojos.",
    fr: "Votre chaleur (Agréabilité élevée) a ressorti. L'indice d'Empathie la distingue : ressentir avec les autres ou voir par leurs yeux.",
  },
  agree_shadow: {
    en: "You answered Agreeableness on the lower side — an honest, non-judgmental look at the harder-edged traits could be revealing.",
    es: "Respondiste la Amabilidad algo baja: una mirada honesta y sin juicios a los rasgos más duros podría ser reveladora.",
    fr: "Vous avez répondu plutôt bas en Agréabilité — un regard honnête et sans jugement sur les traits plus durs pourrait être révélateur.",
  },
  lowmood_perma: {
    en: "Your recent check-in pointed to a heavier stretch. PERMA maps the five buildable pillars of a life going well — a hopeful next step.",
    es: "Tu registro reciente apuntó a una etapa más pesada. PERMA mapea los cinco pilares construibles de una vida que va bien: un siguiente paso esperanzador.",
    fr: "Votre dernier bilan indiquait une période plus lourde. PERMA cartographie les cinq piliers d'une vie qui va bien — une suite porteuse d'espoir.",
  },
  stress_cope: {
    en: "Your stress reading was elevated. This looks at the coping moves you reach for — and which ones actually serve you.",
    es: "Tu lectura de estrés fue elevada. Esto examina las estrategias de afrontamiento que usas, y cuáles te sirven de verdad.",
    fr: "Votre niveau de stress était élevé. Ceci examine les stratégies d'adaptation que vous mobilisez — et celles qui vous servent vraiment.",
  },
  burnout_cope: {
    en: "Signs of burnout came through. Understanding your coping repertoire is one of the most practical next moves you can make.",
    es: "Aparecieron señales de agotamiento. Entender tu repertorio de afrontamiento es uno de los pasos más prácticos que puedes dar.",
    fr: "Des signes d'épuisement sont apparus. Comprendre votre répertoire d'adaptation est l'un des prochains pas les plus concrets.",
  },
  bf_hexaco: {
    en: "You've mapped the Big Five — HEXACO adds the one major dimension it leaves out: Honesty-Humility.",
    es: "Has mapeado los Cinco Grandes; HEXACO añade la gran dimensión que dejan fuera: Honestidad-Humildad.",
    fr: "Vous avez cartographié les Big Five — HEXACO ajoute la grande dimension qui leur manque : Honnêteté-Humilité.",
  },
  bf_aspects: {
    en: "Ready to go deeper on the Big Five? This splits each of your five traits into two finer aspects.",
    es: "¿Listo para profundizar en los Cinco Grandes? Esto divide cada uno de tus cinco rasgos en dos aspectos más finos.",
    fr: "Prêt à approfondir les Big Five ? Ceci divise chacun de vos cinq traits en deux aspects plus fins.",
  },
  jung_ennea: {
    en: "Your 16-type result describes how you behave. The Enneagram comes from the opposite end — the core motivation driving it.",
    es: "Tu resultado de 16 tipos describe cómo te comportas. El Eneagrama viene del extremo opuesto: la motivación central que lo impulsa.",
    fr: "Votre résultat en 16 types décrit comment vous agissez. L'Ennéagramme part de l'autre bout — la motivation profonde qui l'anime.",
  },
  jung_keirsey: {
    en: "Loved your 16-type? Keirsey groups the same letters into four temperaments with a very different flavor.",
    es: "¿Te gustó tu tipo de 16? Keirsey agrupa las mismas letras en cuatro temperamentos con un matiz muy distinto.",
    fr: "Vous avez aimé votre type en 16 ? Keirsey regroupe les mêmes lettres en quatre tempéraments d'une saveur très différente.",
  },
  ennea_jung: {
    en: "You know your Enneagram type — the 16-type model maps the same person through cognitive style instead of motivation.",
    es: "Conoces tu tipo del Eneagrama; el modelo de 16 tipos mapea a la misma persona por su estilo cognitivo en vez de su motivación.",
    fr: "Vous connaissez votre type d'Ennéagramme — le modèle en 16 types cartographie la même personne par le style cognitif plutôt que la motivation.",
  },
  disc_color: {
    en: "DISC gave you a behavioral read — the Color Styles model paints the same energy in four vivid, memorable colors.",
    es: "DISC te dio una lectura conductual; el modelo de Colores pinta la misma energía en cuatro colores vívidos y memorables.",
    fr: "DISC vous a donné une lecture comportementale — le modèle des Couleurs peint la même énergie en quatre couleurs vives et mémorables.",
  },
  att_love: {
    en: "You've seen how you attach. Love Languages turns that into the day-to-day: how you give and receive love.",
    es: "Has visto cómo te vinculas. Los Lenguajes del Amor lo llevan al día a día: cómo das y recibes amor.",
    fr: "Vous avez vu comment vous vous attachez. Les Langages de l'amour traduisent cela au quotidien : comment vous donnez et recevez l'amour.",
  },
  att_conflict: {
    en: "Now that you know your attachment pattern, this reveals what you do when things get tense.",
    es: "Ahora que conoces tu patrón de apego, esto revela qué haces cuando las cosas se tensan.",
    fr: "Maintenant que vous connaissez votre style d'attachement, ceci révèle ce que vous faites quand la tension monte.",
  },
  via_values: {
    en: "Your signature strengths are mapped. Schwartz's Values uncovers the deeper 'why' powering them.",
    es: "Tus fortalezas distintivas están mapeadas. Los Valores de Schwartz revelan el 'porqué' profundo que las impulsa.",
    fr: "Vos forces de caractère sont cartographiées. Les Valeurs de Schwartz révèlent le « pourquoi » profond qui les anime.",
  },
  riasec_anchor: {
    en: "You've found your interest types — Career Anchors reveals what you most need from work to feel right.",
    es: "Has encontrado tus tipos de interés; los Anclas de Carrera revelan qué necesitas más del trabajo para sentirte bien.",
    fr: "Vous avez trouvé vos types d'intérêts — les Ancres de carrière révèlent ce dont vous avez le plus besoin au travail.",
  },
  eq_empathy: {
    en: "Strong emotional intelligence pairs naturally with empathy — this breaks yours into its component parts.",
    es: "Una inteligencia emocional fuerte se combina de forma natural con la empatía; esto descompone la tuya en sus partes.",
    fr: "Une forte intelligence émotionnelle va de pair avec l'empathie — ceci décompose la vôtre en ses différentes parts.",
  },
};

/* ── trait-driven rules (source result → suggested target) ──────────────── */

interface TraitRule {
  inst: string;
  scale: string;
  dir: "high" | "low";
  target: string;
  arch: ArchKey;
  kind: "deepen" | "support";
  /** minimum intensity (0..1) to fire. */
  threshold: number;
  weight: number;
}

const TRAIT_RULES: TraitRule[] = [
  { inst: "big-five-ipip50", scale: "O", dir: "high", target: "need-for-cognition", arch: "open_nfc", kind: "deepen", threshold: 0.32, weight: 1 },
  { inst: "big-five-ipip50", scale: "O", dir: "high", target: "curiosity-cei", arch: "open_curio", kind: "deepen", threshold: 0.32, weight: 0.9 },
  { inst: "big-five-ipip50", scale: "C", dir: "low", target: "self-control-bscs", arch: "consc_selfcontrol", kind: "deepen", threshold: 0.3, weight: 1 },
  { inst: "big-five-ipip50", scale: "C", dir: "high", target: "grit-resilience", arch: "consc_grit", kind: "deepen", threshold: 0.32, weight: 0.9 },
  { inst: "big-five-ipip50", scale: "N", dir: "high", target: "perceived-stress", arch: "neuro_stress", kind: "support", threshold: 0.3, weight: 1 },
  { inst: "big-five-ipip50", scale: "N", dir: "high", target: "self-esteem-rses", arch: "neuro_esteem", kind: "support", threshold: 0.34, weight: 0.85 },
  { inst: "big-five-ipip50", scale: "E", dir: "high", target: "disc-4", arch: "extra_disc", kind: "deepen", threshold: 0.34, weight: 0.8 },
  { inst: "big-five-ipip50", scale: "A", dir: "high", target: "empathy-iri", arch: "agree_empathy", kind: "deepen", threshold: 0.34, weight: 0.85 },
  { inst: "big-five-ipip50", scale: "A", dir: "low", target: "dark-triad-18", arch: "agree_shadow", kind: "deepen", threshold: 0.42, weight: 0.55 },
  // HEXACO mirrors a few of the same routes for users who took it instead of Big Five.
  { inst: "hexaco-24", scale: "O", dir: "high", target: "need-for-cognition", arch: "open_nfc", kind: "deepen", threshold: 0.34, weight: 0.9 },
  { inst: "hexaco-24", scale: "C", dir: "high", target: "grit-resilience", arch: "consc_grit", kind: "deepen", threshold: 0.34, weight: 0.85 },
  // Wellbeing routing — gentle, timely, never alarmist.
  { inst: "mood-checkin", scale: "MOOD", dir: "low", target: "perma-flourishing", arch: "lowmood_perma", kind: "support", threshold: 0.3, weight: 1 },
  { inst: "perceived-stress", scale: "STRESS", dir: "high", target: "coping-styles", arch: "stress_cope", kind: "support", threshold: 0.3, weight: 1 },
  { inst: "burnout-mbi", scale: "EE", dir: "high", target: "coping-styles", arch: "burnout_cope", kind: "support", threshold: 0.32, weight: 0.95 },
  { inst: "emotional-intelligence", scale: "EM", dir: "high", target: "empathy-iri", arch: "eq_empathy", kind: "deepen", threshold: 0.3, weight: 0.8 },
];

/* ── flagship pairings (completed instrument → suggested companions) ────── */

interface Pairing {
  target: string;
  arch: ArchKey;
}
const PAIRINGS: Record<string, Pairing[]> = {
  "big-five-ipip50": [{ target: "hexaco-24", arch: "bf_hexaco" }, { target: "big-five-aspects", arch: "bf_aspects" }],
  "hexaco-24": [{ target: "big-five-aspects", arch: "bf_aspects" }],
  "jung-16-types": [{ target: "enneagram-9", arch: "jung_ennea" }, { target: "keirsey-temperaments", arch: "jung_keirsey" }],
  "enneagram-9": [{ target: "jung-16-types", arch: "ennea_jung" }],
  "keirsey-temperaments": [{ target: "enneagram-9", arch: "jung_ennea" }],
  "disc-4": [{ target: "color-styles", arch: "disc_color" }],
  "attachment-styles": [{ target: "love-languages", arch: "att_love" }, { target: "conflict-style", arch: "att_conflict" }],
  "love-languages": [{ target: "attachment-styles", arch: "att_love" }],
  "conflict-style": [{ target: "attachment-styles", arch: "att_conflict" }],
  "via-24": [{ target: "schwartz-values", arch: "via_values" }],
  "schwartz-values": [{ target: "via-24", arch: "via_values" }],
  "riasec-careers": [{ target: "career-anchors", arch: "riasec_anchor" }],
  "emotional-intelligence": [{ target: "empathy-iri", arch: "eq_empathy" }],
};

/** One flagship per category to surface when a whole category is unexplored. */
const CATEGORY_FLAGSHIP: Record<string, string> = {
  core: "big-five-ipip50",
  types: "jung-16-types",
  relationships: "attachment-styles",
  strengths: "via-24",
  career: "riasec-careers",
  emotional: "emotional-intelligence",
  wellbeing: "perma-flourishing",
  learning: "vark-learning",
  mind: "adhd-traits",
  focused: "self-esteem-rses",
  shadow: "dark-triad-18",
};

/** A welcoming first-run order for brand-new visitors. */
const FOUNDATION_ORDER = ["big-five-ipip50", "jung-16-types", "via-24", "attachment-styles"];

/* ── engine ─────────────────────────────────────────────────────────────── */

function lookup(entries: SynthEntry[]) {
  const map = new Map<string, SynthEntry>();
  for (const e of entries) map.set(e.instrument.id, e);
  return (i: string, s: string): number | null => {
    const sc = map.get(i)?.result.scales[s];
    return sc ? sc.normalized : null;
  };
}

export function recommendNext(
  entries: SynthEntry[],
  opts: { locale?: string; seed?: number; limit?: number } = {},
): Recommendation[] {
  const L = loc(opts.locale);
  const limit = opts.limit ?? 4;
  const doneIds = new Set(entries.map((e) => e.instrument.id));
  const doneCats = new Set(entries.map((e) => e.instrument.category));
  const rng = new Rng(opts.seed ?? seedFrom("recommend", L, entries.map((e) => e.result.responseFingerprint).join("|")));

  // First run: a curated welcome funnel.
  if (entries.length === 0) {
    const out: Recommendation[] = [];
    for (const id of FOUNDATION_ORDER) {
      const inst = getInstrument(id);
      if (!inst) continue;
      const li = localizeInstrument(inst, L);
      out.push({
        instrument: li,
        score: id === "big-five-ipip50" ? 100 : 70,
        kind: id === "big-five-ipip50" ? "foundation" : "explore",
        reason: id === "big-five-ipip50" ? FOUNDATION_REASON[L] : li.tagline,
        badge: BADGE[id === "big-five-ipip50" ? "foundation" : "explore"][L],
      });
    }
    return out.slice(0, limit);
  }

  const cand = new Map<string, { score: number; kind: RecKind; reason: string }>();
  const add = (targetId: string, score: number, kind: RecKind, reason: string) => {
    if (doneIds.has(targetId) || !getInstrument(targetId)) return;
    const prev = cand.get(targetId);
    if (!prev) cand.set(targetId, { score, kind, reason });
    else if (score > prev.score) cand.set(targetId, { score, kind, reason });
    else prev.score = Math.min(99, prev.score + 7); // corroborating signal
  };

  const g = lookup(entries);

  // 1. Trait-driven deepening & support.
  for (const r of TRAIT_RULES) {
    const norm = g(r.inst, r.scale);
    if (norm == null) continue;
    const inten = r.dir === "high" ? (norm - 50) / 50 : (50 - norm) / 50;
    if (inten < r.threshold) continue;
    const base = r.kind === "support" ? 64 : 58;
    const span = r.kind === "support" ? 30 : 34;
    add(r.target, Math.round(base + inten * span * r.weight), r.kind, ARCH[r.arch][L]);
  }

  // 2. Flagship pairings.
  for (const e of entries) {
    for (const p of PAIRINGS[e.instrument.id] ?? []) add(p.target, 56, "pairing", ARCH[p.arch][L]);
  }

  // 3. Category coverage — surface a flagship from each untouched category.
  for (const [catId, flagshipId] of Object.entries(CATEGORY_FLAGSHIP)) {
    if (doneCats.has(catId)) continue;
    add(flagshipId, 44, "explore", rng.pick(EXPLORE_REASON[L]));
  }

  // 4. Always have a fallback so the surface is never empty while tests remain.
  if (cand.size === 0) {
    for (const inst of INSTRUMENTS) {
      if (doneIds.has(inst.id)) continue;
      add(inst.id, 40, "explore", rng.pick(EXPLORE_REASON[L]));
    }
  }

  const ranked = [...cand.entries()]
    .map(([id, v]) => ({ instrument: localizeInstrument(getInstrument(id)!, L), score: v.score, kind: v.kind, reason: v.reason, badge: BADGE[v.kind][L] }))
    .sort((a, b) => b.score - a.score || a.instrument.name.localeCompare(b.instrument.name));

  // Light category de-duplication so the shortlist feels varied.
  const perCat = new Map<string, number>();
  const out: Recommendation[] = [];
  for (const r of ranked) {
    const c = r.instrument.category;
    const n = perCat.get(c) ?? 0;
    if (n >= 2 && out.length < ranked.length) continue;
    perCat.set(c, n + 1);
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}

/* ── per-instrument relevance (personalized intro copy) ─────────────────── */

const GENERIC_RELEVANCE: Record<Loc, string> = {
  en: "This adds a fresh dimension to the {n}-assessment portrait you're already building.",
  es: "Esto añade una dimensión nueva al retrato de {n} evaluaciones que ya estás construyendo.",
  fr: "Ceci ajoute une dimension nouvelle au portrait de {n} évaluations que vous construisez déjà.",
};

/**
 * A localized "why this matters for you" line for a specific instrument, given
 * what the user has already completed. Powers a personalized intro on every test.
 * Returns null for first-time visitors (nothing to personalize against yet).
 */
export function relevanceNote(target: Instrument, entries: SynthEntry[], opts: { locale?: string } = {}): string | null {
  if (!entries.length) return null;
  const L = loc(opts.locale);
  if (entries.some((e) => e.instrument.id === target.id)) return null;

  const g = lookup(entries);
  let best: { score: number; arch: ArchKey } | null = null;
  for (const r of TRAIT_RULES) {
    if (r.target !== target.id) continue;
    const norm = g(r.inst, r.scale);
    if (norm == null) continue;
    const inten = r.dir === "high" ? (norm - 50) / 50 : (50 - norm) / 50;
    if (inten < r.threshold) continue;
    const score = inten * r.weight;
    if (!best || score > best.score) best = { score, arch: r.arch };
  }
  if (best) return ARCH[best.arch][L];

  for (const e of entries) {
    for (const p of PAIRINGS[e.instrument.id] ?? []) {
      if (p.target === target.id) return ARCH[p.arch][L];
    }
  }
  return GENERIC_RELEVANCE[L].replace("{n}", String(entries.length));
}

/* ── personal spotlight (lightweight, localized) ────────────────────────── */

/** Instruments whose standout scales read as clean, nameable trait descriptors. */
const SPOTLIGHT_INSTRUMENTS = new Set([
  "big-five-ipip50", "hexaco-24", "emotional-intelligence", "grit-resilience",
  "disc-4", "schwartz-values", "via-24", "optimism-lotr", "hope-scale", "curiosity-cei",
]);

const SPOT: Record<Loc, { head: (n?: string) => string; line: (d: string) => string; all: string }> = {
  en: {
    head: (n) => (n ? `${n}, here's the portrait taking shape` : "The portrait taking shape"),
    line: (d) => `So far you read as ${d}.`,
    all: "You've explored every lens we offer — your atlas is remarkably complete.",
  },
  es: {
    head: (n) => (n ? `${n}, este es el retrato que va tomando forma` : "El retrato que va tomando forma"),
    line: (d) => `Hasta ahora se te lee como ${d}.`,
    all: "Has explorado todas las miradas que ofrecemos: tu atlas está notablemente completo.",
  },
  fr: {
    head: (n) => (n ? `${n}, voici le portrait qui se dessine` : "Le portrait qui se dessine"),
    line: (d) => `Jusqu'ici, vous apparaissez comme ${d}.`,
    all: "Vous avez exploré tous les regards proposés — votre atlas est remarquablement complet.",
  },
};

function firstClause(desc: string): string {
  return desc.split(/,| and | y | et /)[0].trim();
}

/** A warm, localized header that names the user's most distinctive descriptors so far. */
export function profileSpotlight(entries: SynthEntry[], opts: { name?: string; locale?: string } = {}): Spotlight | null {
  if (!entries.length) return null;
  const L = loc(opts.locale);
  const s = SPOT[L];
  const complete = entries.length >= INSTRUMENTS.length - 2;

  type Pick = { label: string; desc: string; dist: number };
  const picks: Pick[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    if (!SPOTLIGHT_INSTRUMENTS.has(e.instrument.id)) continue;
    const li = localizeInstrument(e.instrument, L);
    for (const sc of Object.values(e.result.scales)) {
      const def = li.scales.find((x) => x.id === sc.scaleId);
      if (!def) continue;
      const dist = Math.abs(sc.normalized - 50);
      if (dist < 18) continue;
      // Low Neuroticism is a strength, not a deficit; flip the descriptor sense.
      const high = sc.normalized >= 50;
      const desc = firstClause(high ? def.highDescriptor : def.lowDescriptor);
      const key = def.name;
      if (seen.has(key)) continue;
      seen.add(key);
      picks.push({ label: `${def.name} ${high ? "↑" : "↓"}`, desc, dist });
    }
  }
  picks.sort((a, b) => b.dist - a.dist);
  const top = picks.slice(0, 3);

  const line = top.length ? s.line(oxfordLite(top.map((p) => p.desc), L)) : (complete ? s.all : s.head(opts.name));
  return {
    headline: s.head(opts.name),
    line: complete && !top.length ? s.all : line,
    chips: top.map((p) => p.label),
    complete,
  };
}

function oxfordLite(list: string[], L: Loc): string {
  const items = list.filter(Boolean);
  const and = L === "es" ? "y" : L === "fr" ? "et" : "and";
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} ${and} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}
