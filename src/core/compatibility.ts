import type { AssessmentResult, Instrument } from "./types";
import { Rng, hashHex, seedFrom } from "./prng";

/**
 * Relationship connection map — compare two people's observations on the same
 * instrument without collapsing a relationship into one score.
 *
 * Privacy by design: a result is shared as a compact, encoded "code" containing
 * only the scale positions (0–100) and type — never the raw answers. Differences
 * are described dimension by dimension, with construct-aware conversation prompts.
 * Similarity is not treated as relationship quality, destiny, or a ranking.
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
  comparison: "closely-aligned" | "some-difference" | "wide-difference";
  note: string;
  guardrail: string;
}

export interface CompatibilityReport {
  instrumentId: string;
  instrumentName: string;
  reportId: string;
  headline: string;
  summary: string[];
  dimensions: CompatDimension[];
  sharedGround: string[];
  differences: string[];
  conversationStarters: string[];
  guardrails: string[];
}

type Loc = "en" | "es" | "fr";
const cLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

/* ── localized scaffolding ──────────────────────────────────────────────── */

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
  en: { strength: (n) => `Shared ground on ${n}.`, friction: (n) => `A different current observation on ${n} — a place to practice curiosity over judgment.` },
  es: { strength: (n) => `Terreno común en ${n}.`, friction: (n) => `Una observación actual distinta en ${n}: un lugar para practicar la curiosidad antes que el juicio.` },
  fr: { strength: (n) => `Terrain d'entente sur ${n}.`, friction: (n) => `Une observation actuelle différente sur ${n} — un endroit pour cultiver la curiosité plutôt que le jugement.` },
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

const MAP_COPY: Record<Loc, {
  headline: string;
  lead: (n: number, close: number, mid: number, wide: number) => string;
  tail: string;
  dimensionGuardrail: string;
  guardrails: string[];
}> = {
  en: {
    headline: "Your connection map",
    lead: (n, close, mid, wide) =>
      `Across ${n} shared dimensions: ${close} closely aligned, ${mid} showing some difference, and ${wide} showing a wider difference.`,
    tail: "Use each dimension as a conversation prompt, then compare it with lived experience.",
    dimensionGuardrail: "Similarity or difference on one dimension does not measure relationship quality.",
    guardrails: [
      "This map describes current self-report observations; it does not score the relationship.",
      "Similarity is not automatically good, and difference is not automatically a problem.",
      "Context, mood, interpretation, and measurement noise can move either person's result.",
      "No dimension predicts safety, commitment, or the future of a relationship.",
    ],
  },
  es: {
    headline: "Vuestro mapa de conexión",
    lead: (n, close, mid, wide) =>
      `En ${n} dimensiones compartidas: ${close} muy alineadas, ${mid} con alguna diferencia y ${wide} con una diferencia más amplia.`,
    tail: "Usad cada dimensión como punto de conversación y contrastadla con vuestra experiencia real.",
    dimensionGuardrail: "La similitud o diferencia en una dimensión no mide la calidad de la relación.",
    guardrails: [
      "Este mapa describe observaciones actuales de autoinforme; no puntúa la relación.",
      "La similitud no es automáticamente buena y la diferencia no es automáticamente un problema.",
      "El contexto, el estado de ánimo, la interpretación y el ruido de medición pueden mover ambos resultados.",
      "Ninguna dimensión predice la seguridad, el compromiso o el futuro de una relación.",
    ],
  },
  fr: {
    headline: "Votre carte de connexion",
    lead: (n, close, mid, wide) =>
      `Sur ${n} dimensions partagées : ${close} très proches, ${mid} avec un certain écart et ${wide} avec un écart plus large.`,
    tail: "Utilisez chaque dimension comme point de discussion, puis confrontez-la à votre vécu.",
    dimensionGuardrail: "La similarité ou la différence sur une dimension ne mesure pas la qualité de la relation.",
    guardrails: [
      "Cette carte décrit des observations actuelles auto-déclarées ; elle ne note pas la relation.",
      "La similarité n'est pas automatiquement bonne et la différence n'est pas automatiquement un problème.",
      "Le contexte, l'humeur, l'interprétation et le bruit de mesure peuvent modifier les deux résultats.",
      "Aucune dimension ne prédit la sécurité, l'engagement ou l'avenir d'une relation.",
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
  const stableScales = (summary: ResultSummary): string => Object.keys(summary.scales)
    .sort()
    .map((id) => `${id}:${summary.scales[id]}`)
    .join("|");
  const reportId = `map-${hashHex(`${instrument.id}|${stableScales(you)}|${stableScales(them)}`)}`;
  const seed = opts.seed ?? seedFrom("connection-map", reportId);
  const rng = new Rng(seed);
  const copy = MAP_COPY[L];

  const dimensions: CompatDimension[] = instrument.scales
    .filter((s) => you.scales[s.id] != null && them.scales[s.id] != null)
    .map((s) => {
      const a = you.scales[s.id];
      const b = them.scales[s.id];
      const gap = Math.abs(a - b);
      const dn = DIMNOTE[L];
      const comparison = gap <= 15
        ? "closely-aligned" as const
        : gap >= 40
          ? "wide-difference" as const
          : "some-difference" as const;
      const note = comparison === "closely-aligned"
        ? rng.pick(dn.close(s.name))
        : comparison === "wide-difference"
          ? rng.pick(dn.wide(s.name))
          : rng.pick(dn.mid(s.name));
      return {
        id: s.id,
        name: s.name,
        you: a,
        them: b,
        gap,
        comparison,
        note,
        guardrail: copy.dimensionGuardrail,
      };
    });

  const sharedGround: string[] = [];
  const differences: string[] = [];
  const conversationStarters: string[] = [];
  const C = CONSTRUCT[L];

  // Construct-aware descriptions. These add context; they never alter or imply
  // an overall relationship score.
  if (instrument.id === "attachment-styles") {
    const sec = 100 - (
      (you.scales.ANX ?? 50) +
      (you.scales.AV ?? 50) +
      (them.scales.ANX ?? 50) +
      (them.scales.AV ?? 50)
    ) / 4;
    const trap =
      ((you.scales.ANX ?? 0) >= 55 && (them.scales.AV ?? 0) >= 55) ||
      ((them.scales.ANX ?? 0) >= 55 && (you.scales.AV ?? 0) >= 55);
    if (trap) differences.unshift(C.attTrap);
    if (sec >= 65) sharedGround.unshift(C.attSecure);
    conversationStarters.push(C.attTip);
  } else if (instrument.id === "love-languages") {
    const youTop = topScale(you.scales, instrument);
    const themTop = topScale(them.scales, instrument);
    conversationStarters.push(C.llTip(themTop, youTop));
    if (youTop === themTop) sharedGround.unshift(C.llShared(youTop));
    else differences.push(C.llDiffer(youTop, themTop));
  } else if (instrument.id === "couple-communication") {
    if ((you.scales.HORSE ?? 0) >= 55 && (them.scales.HORSE ?? 0) >= 55) {
      differences.unshift(C.ccBothHorse);
      conversationStarters.push(C.ccHorseTip);
    }
    if (
      (you.scales.HORSE ?? 100) <= 40 &&
      (them.scales.HORSE ?? 100) <= 40 &&
      (you.scales.REPAIR ?? 0) >= 55 &&
      (them.scales.REPAIR ?? 0) >= 55
    ) sharedGround.unshift(C.ccBothRepair);
    if (Math.abs((you.scales.GENTLE ?? 50) - (them.scales.GENTLE ?? 50)) >= 30) {
      differences.push(C.ccGentleMismatch);
    }
    if ((you.scales.DEMWD ?? 0) >= 55 || (them.scales.DEMWD ?? 0) >= 55) {
      differences.push(C.ccDemandWithdraw);
    }
    if ((you.scales.RESPOND ?? 0) >= 60 && (them.scales.RESPOND ?? 0) >= 60) {
      sharedGround.push(C.ccBothResponsive);
    }
    conversationStarters.push(C.ccAntidotes);
  } else if (instrument.id === "big-five-ipip50") {
    if ((you.scales.A ?? 0) >= 60 && (them.scales.A ?? 0) >= 60) sharedGround.push(C.bfAgree);
    if ((you.scales.N ?? 50) <= 45 && (them.scales.N ?? 50) <= 45) sharedGround.push(C.bfSteady);
  } else if (instrument.id === "hexaco-24") {
    if ((you.scales.H ?? 0) >= 55 && (them.scales.H ?? 0) >= 55) sharedGround.push(C.hxHonesty);
  }

  // Generic shared ground/differences from the closest and widest dimensions.
  const sorted = [...dimensions].sort((a, b) => a.gap - b.gap);
  for (const dimension of sorted.slice(0, 2)) {
    if (dimension.gap <= 22) sharedGround.push(GEN[L].strength(dimension.name));
  }
  for (const dimension of [...sorted].reverse().slice(0, 2)) {
    if (dimension.gap >= 28) differences.push(GEN[L].friction(dimension.name));
  }

  conversationStarters.push(rng.pick(TIPS[L]));

  const closeCount = dimensions.filter((dimension) => dimension.comparison === "closely-aligned").length;
  const midCount = dimensions.filter((dimension) => dimension.comparison === "some-difference").length;
  const wideCount = dimensions.filter((dimension) => dimension.comparison === "wide-difference").length;
  const summary = [
    copy.lead(dimensions.length, closeCount, midCount, wideCount),
    copy.tail,
  ];

  return {
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    reportId,
    headline: copy.headline,
    summary,
    dimensions,
    sharedGround: Array.from(new Set(sharedGround)).slice(0, 5),
    differences: Array.from(new Set(differences)).slice(0, 5),
    conversationStarters: Array.from(new Set(conversationStarters)).slice(0, 5),
    guardrails: copy.guardrails,
  };
}
