import type { AssessmentResult, Instrument } from "./types";
import { Rng, nonce, seedFrom } from "./prng";
import { clamp } from "./variation";

/**
 * Relationship compatibility — compare two people's results on the same instrument.
 *
 * Privacy by design: a result is shared as a compact, encoded "code" containing
 * only the scale positions (0–100) and type — never the raw answers. Compatibility
 * is computed from those positions, with construct-aware adjustments for the
 * relational instruments (attachment, love languages, couple communication, the
 * broad trait models). Locale-aware: every line reads naturally in en/es/fr.
 */

export interface ResultSummary {
  instrumentId: string;
  /** scaleId -> normalized position 0..100 */
  scales: Record<string, number>;
  typeCode?: string;
}

export function toSummary(instrument: Instrument, result: AssessmentResult): ResultSummary {
  const scales: Record<string, number> = {};
  for (const s of instrument.scales) {
    if (result.scales[s.id]) scales[s.id] = Math.round(result.scales[s.id].normalized);
  }
  return { instrumentId: instrument.id, scales, typeCode: result.type?.code };
}

/* ── compact share code (browser + Node) ───────────────────────────────── */

function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSummary(sum: ResultSummary): string {
  return b64urlEncode(JSON.stringify({ i: sum.instrumentId, s: sum.scales, t: sum.typeCode }));
}

export function decodeSummary(code: string): ResultSummary | null {
  try {
    const o = JSON.parse(b64urlDecode(code.trim()));
    if (!o || typeof o.i !== "string" || typeof o.s !== "object") return null;
    return { instrumentId: o.i, scales: o.s, typeCode: o.t };
  } catch {
    return null;
  }
}

/* ── compatibility report ───────────────────────────────────────────────── */

export interface CompatDimension {
  id: string;
  name: string;
  you: number;
  them: number;
  gap: number;
  note: string;
}

export interface CompatibilityReport {
  instrumentId: string;
  instrumentName: string;
  reportId: string;
  overall: number; // 0..100
  band: string;
  headline: string;
  summary: string[];
  dimensions: CompatDimension[];
  strengths: string[];
  frictions: string[];
  tips: string[];
}

type Loc = "en" | "es" | "fr";
const cLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

/* ── localized scaffolding ──────────────────────────────────────────────── */

const BANDS: Record<Loc, [number, string][]> = {
  en: [[80, "Highly compatible"], [64, "Strongly compatible"], [48, "Workably compatible"], [32, "Challenging but workable"], [0, "Very different"]],
  es: [[80, "Muy compatibles"], [64, "Bastante compatibles"], [48, "Compatibles con esfuerzo"], [32, "Difícil pero viable"], [0, "Muy diferentes"]],
  fr: [[80, "Très compatibles"], [64, "Fortement compatibles"], [48, "Compatibles avec des efforts"], [32, "Difficile mais viable"], [0, "Très différents"]],
};
function bandFor(n: number, loc: Loc): string {
  for (const [t, label] of BANDS[loc]) if (n >= t) return label;
  return BANDS[loc][BANDS[loc].length - 1][1];
}

const DIMNOTE: Record<Loc, { close: (n: string) => string[]; wide: (n: string) => string[]; mid: (n: string) => string[] }> = {
  en: {
    close: (n) => [`Closely aligned on ${n} — easy common ground.`, `You see ${n} much the same way.`, `Strong agreement on ${n}.`],
    wide: (n) => [`A wide gap on ${n} — worth talking through openly.`, `You differ markedly on ${n}; expect different instincts here.`, `${n} is where you'll feel the most friction.`],
    mid: (n) => [`Some difference on ${n} — complementary if handled well.`, `A moderate gap on ${n}.`, `You diverge a little on ${n}.`],
  },
  es: {
    close: (n) => [`Muy alineados en ${n}: terreno común fácil.`, `Veis ${n} de forma muy parecida.`, `Fuerte acuerdo en ${n}.`],
    wide: (n) => [`Una gran diferencia en ${n}: conviene hablarlo con franqueza.`, `Difieren mucho en ${n}; esperad instintos distintos aquí.`, `${n} es donde más fricción sentiréis.`],
    mid: (n) => [`Cierta diferencia en ${n}: complementaria si se maneja bien.`, `Una diferencia moderada en ${n}.`, `Divergís un poco en ${n}.`],
  },
  fr: {
    close: (n) => [`Très alignés sur ${n} — un terrain d'entente facile.`, `Vous voyez ${n} de façon très semblable.`, `Fort accord sur ${n}.`],
    wide: (n) => [`Un grand écart sur ${n} — à aborder ouvertement.`, `Vous différez nettement sur ${n} ; attendez-vous à des instincts différents ici.`, `C'est sur ${n} que vous sentirez le plus de friction.`],
    mid: (n) => [`Une certaine différence sur ${n} — complémentaire si bien gérée.`, `Un écart modéré sur ${n}.`, `Vous divergez un peu sur ${n}.`],
  },
};

interface ConstructStrings {
  attTrap: string; attSecure: string; attTip: string;
  llTip: (themTop: string, youTop: string) => string; llShared: (t: string) => string; llDiffer: (a: string, b: string) => string;
  bfAgree: string; bfSteady: string; hxHonesty: string;
  ccBothHorse: string; ccHorseTip: string; ccBothRepair: string; ccGentleMismatch: string; ccDemandWithdraw: string; ccBothResponsive: string; ccAntidotes: string;
}
const CONSTRUCT: Record<Loc, ConstructStrings> = {
  en: {
    attTrap: "A classic anxious–avoidant pattern: one of you reaches for closeness as the other pulls back. It's workable — name the cycle together rather than blaming each other.",
    attSecure: "You both lean secure — a strong foundation of trust and steadiness.",
    attTip: "When stressed, say what you need plainly ('I need reassurance' / 'I need a little space') instead of acting it out.",
    llTip: (themTop, youTop) => `Speak each other's language: lead with ${themTop} for them, and ask them for more ${youTop}.`,
    llShared: (t) => `You share a top love language (${t}) — what fills you up fills them up too.`,
    llDiffer: (a, b) => `Your top languages differ (${a} vs. ${b}); love can get 'lost in translation' unless you each learn to give the other's.`,
    bfAgree: "You're both high in Agreeableness — warmth and cooperation come easily between you.",
    bfSteady: "You're both emotionally steady — fewer storms, faster recovery after conflict.",
    hxHonesty: "You both score high on Honesty-Humility — a foundation of fairness and trust.",
    ccBothHorse: "You both run high on the Four Horsemen (criticism, contempt, defensiveness, stonewalling) — a shared risk. The good news: naming it together, and practicing the antidotes, can shift it fast.",
    ccHorseTip: "Swap each horseman for its antidote: a gentle start-up for criticism, appreciation for contempt, taking responsibility for defensiveness, and self-soothing breaks for stonewalling.",
    ccBothRepair: "You both repair well and rarely reach for the corrosive patterns — a resilient foundation that recovers quickly after conflict.",
    ccGentleMismatch: "One of you raises hard topics gently while the other comes in hotter — agree on a soft start-up so neither feels ambushed.",
    ccDemandWithdraw: "Watch the demand–withdraw cycle: when one pushes to talk and the other pulls away, both feel unheard. Schedule the talk so the pursuer can relax and the withdrawer isn't cornered.",
    ccBothResponsive: "You both turn toward each other's bids and celebrate each other's wins — the small daily moments that build lasting closeness.",
    ccAntidotes: "Lead with the Gottman basics: a soft start-up, repair early and often, and turn toward each other's bids for connection.",
  },
  es: {
    attTrap: "Un patrón clásico ansioso–evitativo: uno busca cercanía mientras el otro se repliega. Es manejable: nombrad el ciclo juntos en lugar de culparos.",
    attSecure: "Ambos tendéis a lo seguro: una base sólida de confianza y estabilidad.",
    attTip: "Cuando haya estrés, di lo que necesitas con claridad ('necesito que me tranquilices' / 'necesito un poco de espacio') en lugar de actuarlo.",
    llTip: (themTop, youTop) => `Habla el idioma del otro: empieza por ${themTop} para tu pareja y pídele más ${youTop}.`,
    llShared: (t) => `Compartís un lenguaje del amor principal (${t}): lo que te llena a ti, también le llena a tu pareja.`,
    llDiffer: (a, b) => `Vuestros lenguajes principales difieren (${a} vs. ${b}); el amor puede 'perderse en la traducción' a menos que cada uno aprenda a dar el del otro.`,
    bfAgree: "Ambos sois altos en Amabilidad: la calidez y la cooperación surgen con facilidad entre vosotros.",
    bfSteady: "Ambos sois emocionalmente estables: menos tormentas y una recuperación más rápida tras el conflicto.",
    hxHonesty: "Ambos puntuáis alto en Honestidad-Humildad: una base de justicia y confianza.",
    ccBothHorse: "Ambos puntuáis alto en los Cuatro Jinetes (crítica, desprecio, actitud defensiva y evasión): un riesgo compartido. La buena noticia: nombrarlo juntos y practicar los antídotos puede cambiarlo rápido.",
    ccHorseTip: "Cambia cada jinete por su antídoto: arranque suave frente a la crítica, aprecio frente al desprecio, asumir responsabilidad frente a la actitud defensiva y pausas para calmarte frente a la evasión.",
    ccBothRepair: "Ambos reparáis bien y rara vez recurrís a los patrones corrosivos: una base resistente que se recupera rápido tras el conflicto.",
    ccGentleMismatch: "Uno plantea los temas difíciles con suavidad mientras el otro entra más caliente; acordad un arranque suave para que nadie se sienta emboscado.",
    ccDemandWithdraw: "Cuidado con el ciclo demanda–retirada: cuando uno empuja a hablar y el otro se aparta, ambos se sienten desatendidos. Programad la conversación para que quien persigue pueda relajarse y quien se retira no se sienta acorralado.",
    ccBothResponsive: "Ambos os acercáis a los gestos del otro y celebráis sus logros: los pequeños momentos diarios que construyen una cercanía duradera.",
    ccAntidotes: "Apóyate en lo básico de Gottman: un arranque suave, reparar pronto y a menudo, y acercaros a los gestos de conexión del otro.",
  },
  fr: {
    attTrap: "Un schéma classique anxieux–évitant : l'un cherche la proximité tandis que l'autre se replie. C'est gérable : nommez le cycle ensemble plutôt que de vous blâmer.",
    attSecure: "Vous penchez tous les deux vers le sécure : une base solide de confiance et de stabilité.",
    attTip: "En cas de stress, dites clairement ce dont vous avez besoin (« j'ai besoin d'être rassuré(e) » / « j'ai besoin d'un peu d'espace ») plutôt que de l'agir.",
    llTip: (themTop, youTop) => `Parlez le langage de l'autre : commencez par ${themTop} pour votre partenaire, et demandez-lui plus de ${youTop}.`,
    llShared: (t) => `Vous partagez un langage de l'amour principal (${t}) — ce qui vous comble comble aussi votre partenaire.`,
    llDiffer: (a, b) => `Vos langages principaux diffèrent (${a} vs ${b}) ; l'amour peut « se perdre dans la traduction » à moins que chacun apprenne à donner celui de l'autre.`,
    bfAgree: "Vous êtes tous deux élevés en Agréabilité : la chaleur et la coopération viennent facilement entre vous.",
    bfSteady: "Vous êtes tous deux émotionnellement stables : moins de tempêtes et une récupération plus rapide après un conflit.",
    hxHonesty: "Vous obtenez tous deux un score élevé en Honnêteté-Humilité : une base d'équité et de confiance.",
    ccBothHorse: "Vous obtenez tous les deux un score élevé aux Quatre Cavaliers (critique, mépris, attitude défensive, mur du silence) — un risque partagé. La bonne nouvelle : le nommer ensemble et pratiquer les antidotes peut le faire évoluer vite.",
    ccHorseTip: "Remplacez chaque cavalier par son antidote : démarrage en douceur contre la critique, appréciation contre le mépris, prise de responsabilité contre l'attitude défensive et pauses pour s'apaiser contre le mur du silence.",
    ccBothRepair: "Vous réparez tous les deux bien et recourez rarement aux schémas corrosifs — une base solide qui récupère vite après un conflit.",
    ccGentleMismatch: "L'un aborde les sujets difficiles en douceur tandis que l'autre arrive plus à vif — convenez d'un démarrage en douceur pour que personne ne se sente pris en embuscade.",
    ccDemandWithdraw: "Attention au cycle exigence–retrait : quand l'un pousse à parler et l'autre s'éloigne, les deux se sentent incompris. Planifiez la discussion pour que celui qui poursuit puisse se détendre et que celui qui se retire ne se sente pas acculé.",
    ccBothResponsive: "Vous vous tournez tous les deux vers les sollicitations de l'autre et célébrez ses réussites — les petits moments quotidiens qui bâtissent une proximité durable.",
    ccAntidotes: "Appuyez-vous sur les fondamentaux de Gottman : un démarrage en douceur, réparer tôt et souvent, et vous tourner vers les sollicitations de connexion de l'autre.",
  },
};

const GEN: Record<Loc, { strength: (n: string) => string; friction: (n: string) => string }> = {
  en: { strength: (n) => `Shared ground on ${n}.`, friction: (n) => `Different wiring on ${n} — a place to practice curiosity over judgment.` },
  es: { strength: (n) => `Terreno común en ${n}.`, friction: (n) => `Forma de ser distinta en ${n}: un lugar para practicar la curiosidad antes que el juicio.` },
  fr: { strength: (n) => `Terrain d'entente sur ${n}.`, friction: (n) => `Un fonctionnement différent sur ${n} — un endroit pour cultiver la curiosité plutôt que le jugement.` },
};

const TIPS: Record<Loc, string[]> = {
  en: [
    "Treat differences as information, not verdicts — ask 'how do you see this?' before reacting.",
    "Name one thing you each appreciate about how the other is different from you.",
    "Pick the single widest gap above and have one honest, low-stakes conversation about it this week.",
  ],
  es: [
    "Trata las diferencias como información, no como veredictos: pregunta '¿cómo lo ves tú?' antes de reaccionar.",
    "Nombrad cada uno algo que apreciáis de aquello en lo que el otro es diferente.",
    "Elegid la mayor diferencia de arriba y tened esta semana una conversación honesta y de baja tensión sobre ella.",
  ],
  fr: [
    "Traitez les différences comme une information, pas un verdict — demandez « comment vois-tu ça ? » avant de réagir.",
    "Nommez chacun une chose que vous appréciez dans ce qui vous différencie.",
    "Choisissez le plus grand écart ci-dessus et ayez cette semaine une conversation honnête et à faible enjeu à ce sujet.",
  ],
};

const SUMMARY: Record<Loc, { lead: (band: string, overall: number, n: number) => string[]; tail: string[] }> = {
  en: {
    lead: (band, overall, n) => [
      `Across ${n} dimensions, you and your match come out ${band.toLowerCase()} (${overall}%).`,
      `Your two profiles land at ${overall}% — ${band.toLowerCase()}.`,
      `Overall, this pairing reads as ${band.toLowerCase()} (${overall}%).`,
    ],
    tail: [
      "Compatibility isn't about being identical — it's about understanding where you align, where you differ, and turning both into closeness.",
      "Remember: high similarity makes things easy, but well-handled differences are what make a pairing grow. Use the notes below as conversation starters.",
      "No score is destiny here. The most compatible pairs are simply the ones who get curious about their differences.",
    ],
  },
  es: {
    lead: (band, overall, n) => [
      `En ${n} dimensiones, tú y tu match resultáis ${band.toLowerCase()} (${overall}%).`,
      `Vuestros dos perfiles quedan en ${overall}%: ${band.toLowerCase()}.`,
      `En conjunto, esta pareja resulta ${band.toLowerCase()} (${overall}%).`,
    ],
    tail: [
      "La compatibilidad no consiste en ser idénticos, sino en entender dónde coincidís, dónde diferís y convertir ambas cosas en cercanía.",
      "Recuerda: mucha similitud lo hace fácil, pero las diferencias bien gestionadas son las que hacen crecer a una pareja. Usad las notas de abajo como punto de partida.",
      "Ningún puntaje es un destino. Las parejas más compatibles son simplemente las que sienten curiosidad por sus diferencias.",
    ],
  },
  fr: {
    lead: (band, overall, n) => [
      `Sur ${n} dimensions, vous et votre match ressortez ${band.toLowerCase()} (${overall}%).`,
      `Vos deux profils se situent à ${overall}% — ${band.toLowerCase()}.`,
      `Globalement, ce duo apparaît ${band.toLowerCase()} (${overall}%).`,
    ],
    tail: [
      "La compatibilité ne consiste pas à être identiques — mais à comprendre où vous vous rejoignez, où vous différez, et à transformer les deux en proximité.",
      "Rappelez-vous : une grande similarité facilite les choses, mais ce sont les différences bien gérées qui font grandir un duo. Utilisez les notes ci-dessous comme points de départ.",
      "Aucun score n'est une fatalité. Les couples les plus compatibles sont simplement ceux qui se montrent curieux de leurs différences.",
    ],
  },
};

function topScale(scales: Record<string, number>, instrument: Instrument): string {
  let bestId = instrument.scales[0]?.id;
  let best = -1;
  for (const s of instrument.scales) {
    const v = scales[s.id];
    if (v != null && v > best) {
      best = v;
      bestId = s.id;
    }
  }
  return instrument.scales.find((s) => s.id === bestId)?.name ?? bestId;
}

export function computeCompatibility(
  instrument: Instrument,
  you: ResultSummary,
  them: ResultSummary,
  opts: { seed?: number; now?: Date; locale?: string } = {},
): CompatibilityReport {
  const L = cLoc(opts.locale);
  const reportId = nonce(6);
  const seed = opts.seed ?? seedFrom(instrument.id, JSON.stringify(you.scales), JSON.stringify(them.scales), (opts.now ?? new Date()).getTime(), reportId);
  const rng = new Rng(seed);

  const dimensions: CompatDimension[] = instrument.scales
    .filter((s) => you.scales[s.id] != null && them.scales[s.id] != null)
    .map((s) => {
      const a = you.scales[s.id];
      const b = them.scales[s.id];
      const gap = Math.abs(a - b);
      const dn = DIMNOTE[L];
      const note = gap <= 15 ? rng.pick(dn.close(s.name)) : gap >= 40 ? rng.pick(dn.wide(s.name)) : rng.pick(dn.mid(s.name));
      return { id: s.id, name: s.name, you: a, them: b, gap, note };
    });

  const meanGap = dimensions.length ? dimensions.reduce((x, d) => x + d.gap, 0) / dimensions.length : 50;
  let overall = 100 - meanGap; // base: similarity

  const strengths: string[] = [];
  const frictions: string[] = [];
  const tips: string[] = [];
  const C = CONSTRUCT[L];

  // Construct-aware adjustments.
  if (instrument.id === "attachment-styles") {
    const sec = 100 - (you.scales.ANX + you.scales.AV + them.scales.ANX + them.scales.AV) / 4;
    overall = 0.6 * sec + 0.4 * (100 - meanGap);
    const trap = (you.scales.ANX >= 55 && them.scales.AV >= 55) || (them.scales.ANX >= 55 && you.scales.AV >= 55);
    if (trap) {
      overall -= 12;
      frictions.unshift(C.attTrap);
    }
    if (sec >= 65) strengths.unshift(C.attSecure);
    tips.push(C.attTip);
  } else if (instrument.id === "love-languages") {
    const youTop = topScale(you.scales, instrument);
    const themTop = topScale(them.scales, instrument);
    tips.push(C.llTip(themTop, youTop));
    if (youTop === themTop) strengths.unshift(C.llShared(youTop));
    else frictions.push(C.llDiffer(youTop, themTop));
  } else if (instrument.id === "couple-communication") {
    const pos = (s: Record<string, number>) => ((s.GENTLE ?? 50) + (s.CONSTR ?? 50) + (s.REPAIR ?? 50) + (s.RESPOND ?? 50)) / 4;
    const risk = (s: Record<string, number>) => ((s.HORSE ?? 50) + (s.DEMWD ?? 50)) / 2;
    const health = ((pos(you.scales) + pos(them.scales)) / 2) * 0.6 + (100 - (risk(you.scales) + risk(them.scales)) / 2) * 0.4;
    overall = 0.55 * health + 0.45 * (100 - meanGap);
    if ((you.scales.HORSE ?? 0) >= 55 && (them.scales.HORSE ?? 0) >= 55) { overall -= 10; frictions.unshift(C.ccBothHorse); tips.push(C.ccHorseTip); }
    if ((you.scales.HORSE ?? 100) <= 40 && (them.scales.HORSE ?? 100) <= 40 && (you.scales.REPAIR ?? 0) >= 55 && (them.scales.REPAIR ?? 0) >= 55) { overall += 6; strengths.unshift(C.ccBothRepair); }
    if (Math.abs((you.scales.GENTLE ?? 50) - (them.scales.GENTLE ?? 50)) >= 30) frictions.push(C.ccGentleMismatch);
    if ((you.scales.DEMWD ?? 0) >= 55 || (them.scales.DEMWD ?? 0) >= 55) frictions.push(C.ccDemandWithdraw);
    if ((you.scales.RESPOND ?? 0) >= 60 && (them.scales.RESPOND ?? 0) >= 60) { overall += 4; strengths.push(C.ccBothResponsive); }
    tips.push(C.ccAntidotes);
  } else if (instrument.id === "big-five-ipip50") {
    if ((you.scales.A ?? 0) >= 60 && (them.scales.A ?? 0) >= 60) { overall += 5; strengths.push(C.bfAgree); }
    if ((you.scales.N ?? 50) <= 45 && (them.scales.N ?? 50) <= 45) { overall += 5; strengths.push(C.bfSteady); }
  } else if (instrument.id === "hexaco-24") {
    if ((you.scales.H ?? 0) >= 55 && (them.scales.H ?? 0) >= 55) { overall += 5; strengths.push(C.hxHonesty); }
  }

  overall = Math.round(clamp(overall, 5, 99));
  const band = bandFor(overall, L);

  // Generic strengths/frictions from the closest and widest dimensions.
  const sorted = [...dimensions].sort((a, b) => a.gap - b.gap);
  for (const d of sorted.slice(0, 2)) if (d.gap <= 22) strengths.push(GEN[L].strength(d.name));
  for (const d of [...sorted].reverse().slice(0, 2)) if (d.gap >= 28) frictions.push(GEN[L].friction(d.name));

  tips.push(rng.pick(TIPS[L]));

  const headline = `${overall}% — ${band}`;
  const summary = [rng.pick(SUMMARY[L].lead(band, overall, dimensions.length)), rng.pick(SUMMARY[L].tail)];

  return {
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    reportId,
    overall,
    band,
    headline,
    summary,
    dimensions,
    strengths: Array.from(new Set(strengths)).slice(0, 5),
    frictions: Array.from(new Set(frictions)).slice(0, 5),
    tips: Array.from(new Set(tips)).slice(0, 5),
  };
}
