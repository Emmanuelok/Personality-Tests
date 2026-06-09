import type { SynthEntry } from "./synthesis";
import { Rng, seedFrom } from "./prng";
import { standoutTraits } from "./recommend";

/**
 * Daily companion — a small, living coaching engine.
 *
 * Every day it composes one personal nudge from the user's own results: a
 * distinctive trait of theirs, a warm one-liner about using it on purpose, and a
 * single tiny practice. Deterministic per (day × person), so it feels like a
 * steady companion rather than a slot machine — and it changes overnight, every
 * night. Fully localized (en/es/fr).
 */

export interface DailyNudge {
  /** Small label: "Today · Monday, June 9" (localized weekday/month). */
  eyebrow: string;
  title: string;
  line: string;
  practiceLabel: string;
  practice: string;
}

type Loc = "en" | "es" | "fr";
const loc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

const TODAY: Record<Loc, string> = { en: "Today", es: "Hoy", fr: "Aujourd'hui" };
const PRACTICE_LABEL: Record<Loc, string> = { en: "One tiny practice", es: "Una pequeña práctica", fr: "Une petite pratique" };

/** Trait-anchored templates; {trait} and {desc} are filled from the user's results.
 *  Arrays MUST stay the same length across locales (the day-seed picks an index). */
const TRAIT_TITLES: Record<Loc, string[]> = {
  en: ["Lead with your {trait} today", "Your {trait} is an instrument — play it", "Put your {trait} to work"],
  es: ["Hoy, lidera con tu {trait}", "Tu {trait} es un instrumento: tócalo", "Pon tu {trait} a trabajar"],
  fr: ["Aujourd'hui, menez avec votre {trait}", "Votre {trait} est un instrument — jouez-en", "Mettez votre {trait} au travail"],
};
const TRAIT_LINES: Record<Loc, string[]> = {
  en: [
    "Your results keep pointing the same way: {desc}. That's not an accident — it's a signature. Pick one moment today and use it deliberately.",
    "Being {desc} is one of the clearest threads in your profile. Today, don't just be it — aim it at something that matters.",
    "You read as {desc}. Qualities like that grow when they're used on purpose; give yours one real job today.",
  ],
  es: [
    "Tus resultados apuntan en la misma dirección: {desc}. No es casualidad, es una firma. Elige un momento de hoy y úsala a propósito.",
    "Ser {desc} es uno de los hilos más claros de tu perfil. Hoy no te limites a serlo: apúntalo hacia algo que importe.",
    "Se te lee como {desc}. Esas cualidades crecen cuando se usan a propósito; dale a la tuya un trabajo real hoy.",
  ],
  fr: [
    "Vos résultats pointent dans la même direction : {desc}. Ce n'est pas un hasard — c'est une signature. Choisissez un moment aujourd'hui et utilisez-la délibérément.",
    "Être {desc} est l'un des fils les plus nets de votre profil. Aujourd'hui, ne vous contentez pas de l'être : dirigez-le vers ce qui compte.",
    "Vous apparaissez comme {desc}. Ces qualités grandissent quand on les emploie à dessein ; donnez à la vôtre une vraie mission aujourd'hui.",
  ],
};

/** Fallback for balanced profiles with no standout pole yet. */
const STEADY_TITLE: Record<Loc, string> = {
  en: "Your steady center",
  es: "Tu centro estable",
  fr: "Votre centre stable",
};
const STEADY_LINE: Record<Loc, string> = {
  en: "Your profile so far sits close to the middle on most dials — a flexible, situational style. Today, notice which side of you the moment calls for, and choose it on purpose.",
  es: "Tu perfil hasta ahora se sitúa cerca del centro en casi todo: un estilo flexible y situacional. Hoy, fíjate en qué lado de ti pide el momento, y elígelo a propósito.",
  fr: "Votre profil se tient pour l'instant près du centre sur la plupart des cadrans — un style souple, selon la situation. Aujourd'hui, remarquez quel côté de vous le moment appelle, et choisissez-le délibérément.",
};

/** Micro-practices (same length across locales; day-seed picks an index). */
const PRACTICES: Record<Loc, string[]> = {
  en: [
    "Write down one small win from yesterday before you do anything else.",
    "Name the emotion you're feeling right now in a single word. That's it.",
    "Do the smallest version of the thing you're avoiding — just two minutes.",
    "Send one message of genuine appreciation to someone today.",
    "Take three slow breaths before your next hard conversation.",
    "Protect 20 minutes of single-tasking on what matters most.",
    "Ask someone a question and listen all the way to the end of their answer.",
    "Choose one 'good enough' and ship it instead of polishing.",
    "Step outside for five minutes with no phone.",
    "Before bed, note one thing you're grateful for and why.",
  ],
  es: [
    "Anota una pequeña victoria de ayer antes de hacer nada más.",
    "Nombra la emoción que sientes ahora mismo en una sola palabra. Nada más.",
    "Haz la versión más pequeña de eso que evitas: solo dos minutos.",
    "Envía hoy un mensaje de aprecio sincero a alguien.",
    "Respira hondo tres veces antes de tu próxima conversación difícil.",
    "Protege 20 minutos de tarea única para lo que más importa.",
    "Hazle una pregunta a alguien y escucha su respuesta hasta el final.",
    "Elige un 'suficientemente bueno' y entrégalo en vez de pulirlo.",
    "Sal afuera cinco minutos sin teléfono.",
    "Antes de dormir, apunta algo que agradeces y por qué.",
  ],
  fr: [
    "Notez une petite victoire d'hier avant toute autre chose.",
    "Nommez l'émotion que vous ressentez là, en un seul mot. C'est tout.",
    "Faites la plus petite version de ce que vous évitez — deux minutes seulement.",
    "Envoyez aujourd'hui un message d'appréciation sincère à quelqu'un.",
    "Prenez trois respirations lentes avant votre prochaine conversation difficile.",
    "Protégez 20 minutes de concentration sur ce qui compte le plus.",
    "Posez une question à quelqu'un et écoutez sa réponse jusqu'au bout.",
    "Choisissez un « suffisamment bien » et livrez-le au lieu de le polir.",
    "Sortez cinq minutes, sans téléphone.",
    "Avant de dormir, notez une chose dont vous êtes reconnaissant, et pourquoi.",
  ],
};

const INTL_LOCALE: Record<Loc, string> = { en: "en-US", es: "es-ES", fr: "fr-FR" };

/**
 * Compose today's nudge from the user's results. Returns null when there's no
 * history yet (the home surface has its own first-run funnel).
 */
export function dailyNudge(entries: SynthEntry[], opts: { locale?: string; date?: Date } = {}): DailyNudge | null {
  if (!entries.length) return null;
  const L = loc(opts.locale);
  const date = opts.date ?? new Date();
  const day = date.toISOString().slice(0, 10);

  // Language must not change WHICH trait/template/practice is chosen — only its wording —
  // so the seed deliberately excludes the locale.
  const rng = new Rng(seedFrom("daily-nudge", day, entries.map((e) => e.result.responseFingerprint).join("|")));

  const dateLabel = new Intl.DateTimeFormat(INTL_LOCALE[L], { weekday: "long", month: "long", day: "numeric" }).format(date);
  const eyebrow = `${TODAY[L]} · ${dateLabel}`;
  const practice = PRACTICES[L][rng.int(PRACTICES.en.length)];

  const top = standoutTraits(entries, { locale: L, limit: 3 });
  if (!top.length) {
    return { eyebrow, title: STEADY_TITLE[L], line: STEADY_LINE[L], practiceLabel: PRACTICE_LABEL[L], practice };
  }

  const pick = top[rng.int(top.length)];
  const ti = rng.int(TRAIT_TITLES.en.length);
  const li = rng.int(TRAIT_LINES.en.length);
  const title = TRAIT_TITLES[L][ti].replace("{trait}", pick.name);
  const line = TRAIT_LINES[L][li].replace("{desc}", pick.desc);
  return { eyebrow, title, line, practiceLabel: PRACTICE_LABEL[L], practice };
}
