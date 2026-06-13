import type { AssessmentResult, Instrument } from "./types";

/**
 * Response-style analysis — honest, self-aware meta-intelligence.
 *
 * Every self-report carries the fingerprint of HOW a person answers, not just
 * what they answered: some agree with almost everything (acquiescence), some
 * answer in absolutes (extreme responding), some hug the middle. Reading across
 * all of a user's raw answers, this surfaces those tendencies — not to discredit
 * the results, but so the reader knows which parts to trust most. It's the
 * platform's "a mirror, not a verdict" ethos, made concrete from their own data.
 *
 * Likert only — choice/forced-choice formats record an option index, not a rating.
 */

type Loc = "en" | "es" | "fr";
const rsLoc = (l?: string): Loc => (l === "es" || l === "fr" ? l : "en");

export interface StyleFlag {
  id: "acquiescence" | "naysaying" | "extreme" | "middle";
  label: string;
  note: string;
}
export interface ResponseStyle {
  itemsAnalyzed: number;
  /** 0..1 mean answer position across all rated items (0.5 = neutral). */
  acquiescence: number;
  /** 0..1 share of answers at a scale endpoint. */
  extremity: number;
  /** 0..1 share of answers at the scale midpoint (odd-point scales). */
  middling: number;
  flags: StyleFlag[];
  /** A leading "read with this in mind" line, or null when the style is balanced. */
  summary: string | null;
}

const STR: Record<Loc, {
  summary: string;
  balanced: string;
  flags: Record<StyleFlag["id"], { label: string; note: string }>;
}> = {
  en: {
    summary: "A note on how to read these results, drawn from how you answered:",
    balanced: "Your answering style looks balanced — using the full scale without leaning high, low, or to the middle. That makes these results especially trustworthy to read at face value.",
    flags: {
      acquiescence: { label: "You leaned toward agreeing", note: "You tended to agree with most statements. Your trait levels may read a little high across the board — so trust the contrasts between your traits more than the absolute scores." },
      naysaying: { label: "You leaned toward disagreeing", note: "You tended to disagree with most statements. Your scores may read a little low overall — the relative shape of your profile is more reliable than the absolute levels." },
      extreme: { label: "You answered in absolutes", note: "You often picked the ends of the scale rather than the middle. That points to a decisive, clear self-image — just know that nuance and 'it depends' may be a little understated." },
      middle: { label: "You stayed near the middle", note: "You often chose the neutral middle. That can reflect a genuinely balanced, situational style — or that some items didn't quite fit. Either way, your strongest few traits are the most telling." },
    },
  },
  es: {
    summary: "Una nota sobre cómo leer estos resultados, a partir de cómo respondiste:",
    balanced: "Tu estilo de respuesta parece equilibrado: usas toda la escala sin inclinarte hacia arriba, abajo ni al centro. Eso hace que estos resultados se puedan leer con especial confianza tal cual.",
    flags: {
      acquiescence: { label: "Tendiste a estar de acuerdo", note: "Tendiste a estar de acuerdo con la mayoría de las afirmaciones. Tus niveles de rasgo pueden leerse algo altos en general; confía más en los contrastes entre tus rasgos que en las puntuaciones absolutas." },
      naysaying: { label: "Tendiste a estar en desacuerdo", note: "Tendiste a estar en desacuerdo con la mayoría de las afirmaciones. Tus puntuaciones pueden leerse algo bajas en conjunto; la forma relativa de tu perfil es más fiable que los niveles absolutos." },
      extreme: { label: "Respondiste en absolutos", note: "A menudo elegiste los extremos de la escala en vez del centro. Eso apunta a una autoimagen decidida y clara; solo ten en cuenta que el matiz y el 'depende' pueden quedar algo subestimados." },
      middle: { label: "Te mantuviste cerca del centro", note: "A menudo elegiste el centro neutral. Puede reflejar un estilo genuinamente equilibrado y situacional, o que algunos ítems no encajaban del todo. En cualquier caso, tus pocos rasgos más marcados son los más reveladores." },
    },
  },
  fr: {
    summary: "Une note sur la façon de lire ces résultats, d'après votre manière de répondre :",
    balanced: "Votre style de réponse paraît équilibré : vous utilisez toute l'échelle sans pencher vers le haut, le bas ou le milieu. Ces résultats se lisent donc avec une confiance particulière, tels quels.",
    flags: {
      acquiescence: { label: "Vous avez plutôt acquiescé", note: "Vous avez eu tendance à approuver la plupart des affirmations. Vos niveaux de traits peuvent paraître un peu élevés dans l'ensemble — fiez-vous davantage aux contrastes entre vos traits qu'aux scores absolus." },
      naysaying: { label: "Vous avez plutôt désapprouvé", note: "Vous avez eu tendance à désapprouver la plupart des affirmations. Vos scores peuvent paraître un peu bas globalement — la forme relative de votre profil est plus fiable que les niveaux absolus." },
      extreme: { label: "Vous avez répondu en absolus", note: "Vous avez souvent choisi les extrémités de l'échelle plutôt que le milieu. Cela traduit une image de soi nette et décidée — sachez seulement que la nuance et le « ça dépend » sont peut-être sous-représentés." },
      middle: { label: "Vous êtes resté près du milieu", note: "Vous avez souvent choisi le milieu neutre. Cela peut refléter un style vraiment équilibré et situationnel — ou que certains items ne collaient pas tout à fait. Dans tous les cas, vos quelques traits les plus marqués sont les plus parlants." },
    },
  },
};

export function analyzeResponseStyle(
  entries: { instrument: Instrument; result: AssessmentResult }[],
  opts: { locale?: string } = {},
): ResponseStyle {
  const loc = rsLoc(opts.locale);
  let n = 0, sumPos = 0, endpoints = 0, mids = 0, midEligible = 0;

  for (const { instrument, result } of entries) {
    if (instrument.format === "choice") continue; // option-index, not a rating
    const { min, max } = instrument.responseFormat;
    const span = max - min;
    if (span <= 0) continue;
    const hasMid = span % 2 === 0; // odd number of points → a true midpoint exists
    const mid = (min + max) / 2;
    for (const it of instrument.items) {
      const raw = result.responses[it.id];
      if (typeof raw !== "number") continue;
      n++;
      sumPos += (raw - min) / span;
      if (raw === min || raw === max) endpoints++;
      if (hasMid) { midEligible++; if (raw === mid) mids++; }
    }
  }

  const acquiescence = n ? sumPos / n : 0.5;
  const extremity = n ? endpoints / n : 0;
  const middling = midEligible ? mids / midEligible : 0;

  const flags: StyleFlag[] = [];
  // Need a reasonable sample before commenting on style.
  if (n >= 24) {
    const f = STR[loc].flags;
    if (acquiescence >= 0.66) flags.push({ id: "acquiescence", ...f.acquiescence });
    else if (acquiescence <= 0.34) flags.push({ id: "naysaying", ...f.naysaying });
    if (extremity >= 0.5) flags.push({ id: "extreme", ...f.extreme });
    else if (middling >= 0.42) flags.push({ id: "middle", ...f.middle });
  }

  return {
    itemsAnalyzed: n,
    acquiescence: Math.round(acquiescence * 100) / 100,
    extremity: Math.round(extremity * 100) / 100,
    middling: Math.round(middling * 100) / 100,
    flags,
    summary: n >= 24 ? (flags.length ? STR[loc].summary : STR[loc].balanced) : null,
  };
}
