import type { Instrument } from "./types";
import { INSTRUMENTS } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";
import { CATEGORIES } from "./categories";
import { localizeCategory } from "./categories.i18n";

/**
 * Catalog search — so people find the one test (or topic) they want instead of
 * scrolling the whole wall. Deterministic, locale-aware, and theme-smart: each
 * instrument carries a curated set of topic keywords and synonyms, so a query
 * like "anxiety", "money", "dating", or "focus" surfaces the right tests even
 * when that exact word never appears in the title. Matching also spans the
 * localized name, tagline, description, scale names, and category, and ignores
 * case and accents so it works naturally across English, Spanish, and French.
 */

/** Lowercase, strip accents/diacritics (U+0300–U+036F), for accent-insensitive matching. */
function norm(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/** Split a query into normalized word tokens. */
export function tokenize(q: string): string[] {
  return norm(q).split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Curated topic keywords / synonyms per instrument (mostly English, with a few
 * common Spanish/French topic words). The localized name/tagline/description
 * already carry most language coverage; these add the *concepts* a searcher
 * reaches for that the formal title may not contain.
 */
const THEME_KEYWORDS: Record<string, string[]> = {
  "big-five-ipip50": ["personality", "ocean", "five factor", "traits", "introvert", "extrovert", "openness", "conscientiousness", "neuroticism", "personalidad", "personnalite"],
  "hexaco-24": ["personality", "honesty", "humility", "integrity", "traits", "six factor"],
  "eysenck-pen": ["personality", "extraversion", "neuroticism", "psychoticism", "temperament"],
  "sixteen-pf": ["personality", "cattell", "16 factors", "traits"],
  "big-five-aspects": ["personality", "facets", "aspects", "big five deep"],
  "tci-cloninger": ["temperament", "character", "personality", "novelty seeking"],
  "zkpq-alt5": ["personality", "sensation", "impulsivity", "alternative five"],
  "jung-16-types": ["mbti", "16 types", "myers briggs", "personality type", "intj", "enfp", "cognitive functions", "tipo", "type"],
  "keirsey-temperaments": ["temperament", "16 types", "guardian", "rational", "idealist", "artisan"],
  "enneagram-9": ["enneagram", "type", "core motivation", "9 types", "wing", "eneagrama"],
  "disc-4": ["disc", "work style", "behavior", "dominance", "influence", "team", "leadership"],
  "four-temperaments": ["temperament", "sanguine", "choleric", "melancholic", "phlegmatic", "humors"],
  "color-styles": ["colors", "personality colors", "insights", "work style"],
  "socionics-16": ["socionics", "16 types", "information metabolism", "intertype"],
  "attachment-styles": ["relationships", "attachment", "anxious", "avoidant", "secure", "dating", "intimacy", "love", "partner", "apego", "relaciones", "attachement"],
  "love-languages": ["relationships", "love", "romance", "affection", "partner", "couples", "dating", "amor", "pareja"],
  "conflict-style": ["conflict", "arguments", "disagreement", "negotiation", "resolution", "communication", "fight", "conflicto", "conflit"],
  "couple-communication": ["relationships", "couples", "marriage", "partner", "communication", "gottman", "conflict", "pareja", "couple"],
  "team-communication": ["team", "work", "workplace", "collaboration", "psychological safety", "meetings", "communication", "equipo", "equipe"],
  "communication-style": ["communication", "assertive", "listening", "empathy", "conversation", "comunicacion", "communication"],
  "via-24": ["strengths", "character", "virtues", "via", "positive psychology", "what's good about me", "fortalezas", "forces"],
  "schwartz-values": ["values", "what matters", "priorities", "motivation", "valores", "valeurs"],
  "grit-resilience": ["grit", "perseverance", "resilience", "determination", "discipline", "follow through", "perseverancia"],
  "moral-foundations": ["morality", "ethics", "politics", "fairness", "loyalty", "values", "moral", "moralidad"],
  "rokeach-values": ["values", "beliefs", "priorities", "terminal", "instrumental"],
  "mcclelland-needs": ["motivation", "achievement", "power", "affiliation", "drive", "needs", "work"],
  "riasec-careers": ["career", "job", "vocation", "holland", "interests", "work", "occupation", "what job", "carrera", "carriere", "empleo"],
  "career-derailers": ["career", "work", "leadership", "weaknesses", "blind spots", "derailers"],
  "career-anchors": ["career", "work", "job", "values", "what i want from work", "schein"],
  "leadership-styles": ["leadership", "manager", "lead", "transformational", "boss", "management", "liderazgo", "leadership"],
  "emotional-intelligence": ["emotional intelligence", "eq", "emotions", "self awareness", "empathy", "inteligencia emocional"],
  "chronotype": ["sleep", "morning", "night owl", "lark", "circadian", "schedule", "energy", "sueno", "sommeil"],
  "perma-flourishing": ["wellbeing", "happiness", "flourishing", "positive psychology", "life", "thriving", "bienestar", "bien-etre", "felicidad"],
  "mood-checkin": ["mood", "depression", "sad", "feelings", "low", "down", "emotional state", "animo", "humeur"],
  "worry-checkin": ["anxiety", "worry", "anxious", "nervous", "rumination", "fear", "stress", "ansiedad", "anxiete", "preocupacion"],
  "burnout-mbi": ["burnout", "exhaustion", "work stress", "overwhelmed", "tired", "cynicism", "agotamiento", "epuisement"],
  "perceived-stress": ["stress", "stressed", "overwhelmed", "pressure", "coping", "estres", "stress"],
  "panas-affect": ["mood", "affect", "emotions", "positive negative", "feelings"],
  "ryff-wellbeing": ["wellbeing", "psychological wellbeing", "purpose", "growth", "autonomy", "meaning"],
  "coping-styles": ["coping", "stress", "dealing with", "problem solving", "avoidance", "afrontamiento"],
  "money-scripts": ["money", "finance", "financial", "spending", "wealth", "budget", "rich", "saving", "dinero", "argent", "finanzas"],
  "self-compassion-scs": ["self compassion", "self kindness", "inner critic", "self criticism", "self esteem", "kindness", "mindfulness", "shame", "autocompasion", "autocompassion"],
  "time-perspective-ztpi": ["time", "past", "future", "present", "planning", "nostalgia", "fatalism", "zimbardo", "tiempo", "temps"],
  "vark-learning": ["learning", "study", "learning style", "visual", "auditory", "kinesthetic", "how i learn", "aprendizaje", "apprentissage"],
  "kolb-learning": ["learning", "study", "experiential", "learning style", "how i learn"],
  "adhd-traits": ["adhd", "add", "attention", "focus", "distraction", "hyperactivity", "concentration", "tdah"],
  "autism-traits": ["autism", "autistic", "neurodivergent", "asd", "spectrum", "aq", "autismo", "autisme"],
  "self-esteem-rses": ["self esteem", "self worth", "confidence", "rosenberg", "how i see myself", "autoestima", "estime de soi"],
  "locus-of-control": ["control", "agency", "fate", "luck", "responsibility", "locus"],
  "mindset-dweck": ["mindset", "growth mindset", "fixed mindset", "dweck", "ability", "learning"],
  "self-monitoring": ["self monitoring", "social", "impression management", "adaptability"],
  "sensation-seeking": ["sensation seeking", "thrill", "risk", "adventure", "novelty", "excitement"],
  "need-for-cognition": ["thinking", "intellectual", "curiosity", "ideas", "analysis", "need for cognition"],
  "empathy-iri": ["empathy", "compassion", "perspective taking", "understanding others", "empatia", "empathie"],
  "life-satisfaction-swls": ["happiness", "life satisfaction", "satisfied", "wellbeing", "contentment", "satisfaccion"],
  "brief-resilience": ["resilience", "bounce back", "recovery", "tough", "adversity", "resiliencia", "resilience"],
  "dark-triad-18": ["dark triad", "narcissism", "machiavellianism", "psychopathy", "manipulation", "ego", "narcisismo"],
  "dark-tetrad-18": ["dark tetrad", "narcissism", "sadism", "machiavellianism", "psychopathy", "manipulation"],
  "pid5-maladaptive": ["personality disorder", "maladaptive", "clinical", "dsm", "traits"],
  "optimism-lotr": ["optimism", "positive", "hopeful", "outlook", "glass half full", "optimismo", "optimisme"],
  "hope-scale": ["hope", "goals", "motivation", "agency", "future", "esperanza", "espoir"],
  "curiosity-cei": ["curiosity", "novelty", "exploration", "wonder", "interest", "curiosidad", "curiosite"],
  "self-control-bscs": ["self control", "willpower", "discipline", "impulse", "temptation", "autocontrol"],
  "self-efficacy-gse": ["self efficacy", "confidence", "capability", "i can do it", "competence", "autoeficacia"],
  "emotion-regulation-erq": ["emotion regulation", "reappraisal", "managing emotions", "suppression", "feelings", "regulacion emocional"],
  "procrastination-pps": ["procrastination", "putting off", "delay", "avoidance", "deadlines", "procrastinacion"],
  "perfectionism-2f": ["perfectionism", "high standards", "self critical", "perfectionist", "perfeccionismo"],
  "gratitude-gq6": ["gratitude", "thankful", "appreciation", "grateful", "gratitud", "gratitude"],
};

interface SearchHit {
  instrument: Instrument;
  score: number;
}

const W = { name: 12, short: 9, keyword: 6, scale: 4, category: 4, tagline: 3, desc: 1 } as const;

/**
 * Rank instruments by relevance to a free-text query. Returns the localized
 * instruments (so the caller can render names directly), best match first.
 * Empty/whitespace query returns [] (the UI treats that as "not searching").
 */
export function searchInstruments(query: string, opts: { locale?: string; limit?: number } = {}): Instrument[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const loc = opts.locale ?? "en";

  const hits: SearchHit[] = [];
  for (const base of INSTRUMENTS) {
    const inst = localizeInstrument(base, loc);
    const cat = CATEGORIES.find((c) => c.id === inst.category);
    const catName = cat ? localizeCategory(cat, loc).name : "";
    const fields: Array<{ text: string; w: number }> = [
      { text: norm(inst.name), w: W.name },
      { text: norm(inst.shortName), w: W.short },
      { text: norm((THEME_KEYWORDS[base.id] ?? []).join(" ")), w: W.keyword },
      { text: norm(inst.scales.map((s) => `${s.name} ${s.description ?? ""}`).join(" ")), w: W.scale },
      { text: norm(catName), w: W.category },
      { text: norm(inst.tagline), w: W.tagline },
      { text: norm(inst.description), w: W.desc },
    ];

    let score = 0;
    let everyTokenMatched = true;
    for (const tok of tokens) {
      let best = 0;
      for (const f of fields) {
        if (!f.text) continue;
        if (f.text.includes(tok)) {
          // Word-boundary / prefix matches are stronger than a mid-word hit.
          const boundary = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(f.text);
          const w = boundary ? f.w : f.w * 0.5;
          if (w > best) best = w;
        }
      }
      if (best === 0) { everyTokenMatched = false; break; }
      score += best;
    }
    if (!everyTokenMatched) continue;

    // Strong bonus when the name itself leads with the whole query.
    const fullName = norm(inst.name);
    const fullQuery = tokens.join(" ");
    if (fullName.startsWith(fullQuery)) score += 15;
    else if (fullName.includes(fullQuery)) score += 6;

    hits.push({ instrument: inst, score });
  }

  hits.sort((a, b) => b.score - a.score || a.instrument.name.localeCompare(b.instrument.name));
  const ranked = hits.map((h) => h.instrument);
  return opts.limit ? ranked.slice(0, opts.limit) : ranked;
}

/** Does a query match a loose set of fields? Used for non-instrument tests
 *  (e.g. the cognition battery) that aren't in the INSTRUMENTS catalog. */
export function matchesQuery(query: string, ...fields: Array<string | string[]>): boolean {
  const tokens = tokenize(query);
  if (!tokens.length) return false;
  const hay = norm(fields.map((f) => (Array.isArray(f) ? f.join(" ") : f)).join(" "));
  return tokens.every((tok) => hay.includes(tok));
}
