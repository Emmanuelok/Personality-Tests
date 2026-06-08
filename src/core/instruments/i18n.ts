import type { Instrument } from "../types";

/**
 * Instrument content localization. The engine is language-agnostic (scoring keys
 * off item/scale ids, never text), so an instrument can be fully translated by
 * supplying overrides keyed by locale → instrument id. `localizeInstrument`
 * returns a clone with the translated strings, falling back per-field to English.
 *
 * Big Five is fully translated here (es, fr) as the end-to-end proof; other
 * instruments simply fall through to English until their translations are added.
 */

export interface InstrumentTranslation {
  name?: string;
  shortName?: string;
  tagline?: string;
  description?: string;
  scales?: Record<string, { name?: string; description?: string; poles?: { low: string; high: string } }>;
  items?: Record<string, string>;
}

const BIG_FIVE_ES: InstrumentTranslation = {
  name: "Personalidad de los Cinco Grandes (IPIP-50)",
  shortName: "Cinco Grandes",
  tagline: "El estándar científico: cinco grandes dimensiones de la personalidad.",
  description:
    "El Modelo de los Cinco Factores es el marco más validado empíricamente en la ciencia de la personalidad. Esta " +
    "versión emplea los marcadores IPIP de dominio público (50 ítems) para estimar tu posición en Apertura, " +
    "Responsabilidad, Extraversión, Amabilidad y Neuroticismo, comparada con normas poblacionales aproximadas.",
  scales: {
    O: { name: "Apertura a la experiencia", description: "Receptividad a nuevas ideas, la estética, la imaginación y la exploración intelectual.", poles: { low: "Convencional", high: "Inventivo/a" } },
    C: { name: "Responsabilidad", description: "Tendencia a la organización, la diligencia, la planificación y el autocontrol.", poles: { low: "Espontáneo/a", high: "Disciplinado/a" } },
    E: { name: "Extraversión", description: "Impulso hacia la interacción social, la estimulación, la asertividad y la energía positiva.", poles: { low: "Introvertido/a", high: "Extravertido/a" } },
    A: { name: "Amabilidad", description: "Orientación hacia la compasión, la cooperación, la confianza y la consideración de los demás.", poles: { low: "Exigente", high: "Compasivo/a" } },
    N: { name: "Neuroticismo", description: "Tendencia a experimentar emociones negativas, reactividad al estrés e inestabilidad de ánimo.", poles: { low: "Estable", high: "Reactivo/a" } },
  },
  items: {
    E1: "Soy el alma de la fiesta.", A1: "Me preocupo poco por los demás.", C1: "Siempre estoy preparado/a.", N1: "Me estreso con facilidad.", O1: "Tengo un vocabulario rico.",
    E2: "No hablo mucho.", A2: "Me intereso por la gente.", C2: "Dejo mis cosas tiradas por ahí.", N2: "Estoy relajado/a la mayor parte del tiempo.", O2: "Me cuesta entender ideas abstractas.",
    E3: "Me siento cómodo/a entre la gente.", A3: "Insulto a la gente.", C3: "Presto atención a los detalles.", N3: "Me preocupo por las cosas.", O3: "Tengo una imaginación vívida.",
    E4: "Me mantengo en segundo plano.", A4: "Comprendo los sentimientos de los demás.", C4: "Lo desordeno todo.", N4: "Rara vez me siento triste.", O4: "No me interesan las ideas abstractas.",
    E5: "Inicio conversaciones.", A5: "No me interesan los problemas de los demás.", C5: "Hago las tareas de inmediato.", N5: "Me altero con facilidad.", O5: "Tengo excelentes ideas.",
    E6: "Tengo poco que decir.", A6: "Tengo buen corazón.", C6: "A menudo olvido devolver las cosas a su sitio.", N6: "Me molesto con facilidad.", O6: "No tengo buena imaginación.",
    E7: "Hablo con mucha gente distinta en las fiestas.", A7: "En realidad no me interesan los demás.", C7: "Me gusta el orden.", N7: "Cambio mucho de humor.", O7: "Entiendo las cosas con rapidez.",
    E8: "No me gusta llamar la atención.", A8: "Dedico tiempo a los demás.", C8: "Eludo mis obligaciones.", N8: "Tengo cambios de humor frecuentes.", O8: "Uso palabras difíciles.",
    E9: "No me importa ser el centro de atención.", A9: "Siento las emociones de los demás.", C9: "Sigo un horario.", N9: "Me irrito con facilidad.", O9: "Dedico tiempo a reflexionar sobre las cosas.",
    E10: "Soy callado/a con desconocidos.", A10: "Hago que la gente se sienta a gusto.", C10: "Soy meticuloso/a en mi trabajo.", N10: "A menudo me siento triste.", O10: "Estoy lleno/a de ideas.",
  },
};

const BIG_FIVE_FR: InstrumentTranslation = {
  name: "Personnalité des Big Five (IPIP-50)",
  shortName: "Big Five",
  tagline: "La référence scientifique : cinq grandes dimensions de la personnalité.",
  description:
    "Le modèle à cinq facteurs est le cadre le plus validé empiriquement en psychologie de la personnalité. Cette " +
    "version utilise les marqueurs IPIP du domaine public (50 items) pour estimer votre position sur l'Ouverture, le " +
    "caractère Consciencieux, l'Extraversion, l'Agréabilité et le Névrosisme, comparée à des normes approximatives.",
  scales: {
    O: { name: "Ouverture à l'expérience", description: "Réceptivité aux idées nouvelles, à l'esthétique, à l'imagination et à l'exploration intellectuelle.", poles: { low: "Conventionnel(le)", high: "Inventif(ve)" } },
    C: { name: "Caractère consciencieux", description: "Tendance à l'organisation, à la rigueur, à la planification et à la maîtrise de soi.", poles: { low: "Spontané(e)", high: "Discipliné(e)" } },
    E: { name: "Extraversion", description: "Élan vers l'engagement social, la stimulation, l'assertivité et l'énergie positive.", poles: { low: "Introverti(e)", high: "Extraverti(e)" } },
    A: { name: "Agréabilité", description: "Orientation vers la compassion, la coopération, la confiance et l'attention aux autres.", poles: { low: "Exigeant(e)", high: "Bienveillant(e)" } },
    N: { name: "Névrosisme", description: "Tendance à éprouver des émotions négatives, une réactivité au stress et une instabilité de l'humeur.", poles: { low: "Stable", high: "Réactif(ve)" } },
  },
  items: {
    E1: "Je suis le boute-en-train de la fête.", A1: "Je me soucie peu des autres.", C1: "Je suis toujours prêt(e).", N1: "Je me stresse facilement.", O1: "J'ai un vocabulaire riche.",
    E2: "Je ne parle pas beaucoup.", A2: "Je m'intéresse aux gens.", C2: "Je laisse traîner mes affaires.", N2: "Je suis détendu(e) la plupart du temps.", O2: "J'ai du mal à comprendre les idées abstraites.",
    E3: "Je me sens à l'aise avec les gens.", A3: "J'insulte les gens.", C3: "Je fais attention aux détails.", N3: "Je me fais du souci.", O3: "J'ai une imagination vive.",
    E4: "Je reste en retrait.", A4: "Je comprends les sentiments des autres.", C4: "Je mets la pagaille.", N4: "Je me sens rarement déprimé(e).", O4: "Les idées abstraites ne m'intéressent pas.",
    E5: "J'engage la conversation.", A5: "Les problèmes des autres ne m'intéressent pas.", C5: "Je fais mes tâches tout de suite.", N5: "Je suis facilement perturbé(e).", O5: "J'ai d'excellentes idées.",
    E6: "J'ai peu de choses à dire.", A6: "J'ai bon cœur.", C6: "J'oublie souvent de ranger les choses à leur place.", N6: "Je me contrarie facilement.", O6: "Je n'ai pas une bonne imagination.",
    E7: "Je parle à beaucoup de gens différents en soirée.", A7: "Je ne m'intéresse pas vraiment aux autres.", C7: "J'aime l'ordre.", N7: "Mon humeur change beaucoup.", O7: "Je comprends vite les choses.",
    E8: "Je n'aime pas attirer l'attention sur moi.", A8: "Je prends du temps pour les autres.", C8: "Je me dérobe à mes devoirs.", N8: "J'ai de fréquentes sautes d'humeur.", O8: "J'emploie des mots difficiles.",
    E9: "Cela ne me dérange pas d'être le centre de l'attention.", A9: "Je ressens les émotions des autres.", C9: "Je suis un emploi du temps.", N9: "Je m'irrite facilement.", O9: "Je passe du temps à réfléchir aux choses.",
    E10: "Je suis silencieux(se) avec les inconnus.", A10: "Je mets les gens à l'aise.", C10: "Je suis exigeant(e) dans mon travail.", N10: "Je me sens souvent déprimé(e).", O10: "Je déborde d'idées.",
  },
};

const DISC_ES: InstrumentTranslation = {
  name: "Estilos de comportamiento DISC",
  shortName: "DISC",
  tagline: "Cuatro estilos de comportamiento: cómo actúas, decides y trabajas con los demás.",
  description:
    "DISC mapea el comportamiento observable en cuatro estilos —Dominancia, Influencia, Estabilidad y Cumplimiento—. " +
    "En lugar de un tipo fijo, la mayoría somos una mezcla, guiada por un estilo principal y otro secundario. Es " +
    "especialmente útil para la comunicación, el trabajo en equipo y el liderazgo.",
  scales: {
    D: { name: "Dominancia", description: "Impulso por los resultados, franqueza y control.", poles: { low: "Tranquilo/a", high: "Dominante" } },
    I: { name: "Influencia", description: "Sociabilidad, entusiasmo y persuasión.", poles: { low: "Reservado/a", high: "Extrovertido/a" } },
    S: { name: "Estabilidad", description: "Paciencia, fiabilidad y cooperación.", poles: { low: "Dinámico/a", high: "Estable" } },
    C: { name: "Cumplimiento", description: "Precisión, análisis y estándares.", poles: { low: "Improvisador/a", high: "Preciso/a" } },
  },
  items: {
    D1: "Tomo el mando rápido y empujo con fuerza para lograr resultados.", D2: "Me siento cómodo/a tomando decisiones audaces y afrontando los problemas de frente.", D3: "Me centro en los resultados y en ganar, incluso bajo presión.", D4: "Me impaciento cuando las cosas van demasiado lentas o con demasiada cautela.", D5: "Prefiero liderar que seguir.", D6: "Soy directo/a y claro/a sobre lo que quiero.",
    I1: "Me encanta conocer gente nueva y entablar conversación con facilidad.", I2: "Soy entusiasta y sé contagiar a los demás el entusiasmo por una idea.", I3: "Persuado e inspiro a la gente más que presionarla.", I4: "Soy optimista y aporto energía al grupo.", I5: "El reconocimiento y caer bien me importan mucho.", I6: "Pienso en voz alta y me gusta comentar mis ideas con los demás.",
    S1: "Soy paciente y constante, y prefiero un ritmo tranquilo y predecible.", S2: "Soy un/a compañero/a de equipo fiable que apoya a los demás sin alardes.", S3: "No me gustan los cambios bruscos y prefiero la estabilidad.", S4: "Escucho con atención y rara vez meto prisa a la gente.", S5: "Valoro la armonía y evito el conflicto cuando puedo.", S6: "La gente cuenta conmigo por ser constante y leal.",
    C1: "Presto mucha atención a la exactitud, los detalles y la calidad.", C2: "Me gustan las reglas claras, los estándares y los planes bien pensados.", C3: "Analizo con cuidado antes de decidir.", C4: "Quiero que las cosas se hagan bien, aunque lleve más tiempo.", C5: "Confío en los hechos y la lógica más que en la intuición.", C6: "Me exijo a mí mismo/a y a mi trabajo estándares altos.",
  },
};

const DISC_FR: InstrumentTranslation = {
  name: "Styles comportementaux DISC",
  shortName: "DISC",
  tagline: "Quatre styles comportementaux : comment vous agissez, décidez et collaborez.",
  description:
    "Le DISC cartographie le comportement observable selon quatre styles — Dominance, Influence, Stabilité et " +
    "Conformité. Plutôt qu'un type figé, la plupart des gens sont un mélange, mené par un style principal et un style " +
    "secondaire. C'est particulièrement utile pour la communication, le travail d'équipe et le leadership.",
  scales: {
    D: { name: "Dominance", description: "Recherche de résultats, franchise et contrôle.", poles: { low: "Accommodant(e)", high: "Dominant(e)" } },
    I: { name: "Influence", description: "Sociabilité, enthousiasme et persuasion.", poles: { low: "Réservé(e)", high: "Extraverti(e)" } },
    S: { name: "Stabilité", description: "Patience, fiabilité et coopération.", poles: { low: "Dynamique", high: "Stable" } },
    C: { name: "Conformité", description: "Précision, analyse et exigence.", poles: { low: "Improvisateur(trice)", high: "Précis(e)" } },
  },
  items: {
    D1: "Je prends les choses en main rapidement et pousse fort pour obtenir des résultats.", D2: "Je suis à l'aise pour prendre des décisions audacieuses et affronter les problèmes de front.", D3: "Je reste concentré(e) sur les résultats et la victoire, même sous pression.", D4: "Je m'impatiente quand les choses avancent trop lentement ou trop prudemment.", D5: "Je préfère diriger que suivre.", D6: "Je suis franc(he) et direct(e) sur ce que je veux.",
    I1: "J'adore rencontrer de nouvelles personnes et engage facilement la conversation.", I2: "Je suis enthousiaste et sais enthousiasmer les autres pour une idée.", I3: "Je persuade et inspire les gens plus que je ne les pousse.", I4: "Je suis optimiste et j'apporte de l'énergie au groupe.", I5: "La reconnaissance et le fait d'être apprécié(e) comptent beaucoup pour moi.", I6: "Je pense à voix haute et j'aime discuter de mes idées avec les autres.",
    S1: "Je suis patient(e) et constant(e), et je préfère un rythme calme et prévisible.", S2: "Je suis un(e) coéquipier(ère) fiable qui soutient les autres discrètement.", S3: "Je n'aime pas les changements brusques et préfère la stabilité.", S4: "J'écoute attentivement et bouscule rarement les gens.", S5: "Je valorise l'harmonie et évite le conflit quand je peux.", S6: "Les gens comptent sur moi pour être constant(e) et loyal(e).",
    C1: "Je prête une grande attention à l'exactitude, aux détails et à la qualité.", C2: "J'aime les règles claires, les normes et les plans bien pensés.", C3: "J'analyse soigneusement avant de décider.", C4: "Je veux que les choses soient bien faites, même si cela prend plus de temps.", C5: "Je me fie aux faits et à la logique plutôt qu'à l'intuition.", C6: "J'attends de moi-même et de mon travail des normes élevées.",
  },
};

export const TRANSLATIONS: Record<string, Record<string, InstrumentTranslation>> = {
  es: { "big-five-ipip50": BIG_FIVE_ES, "disc-4": DISC_ES },
  fr: { "big-five-ipip50": BIG_FIVE_FR, "disc-4": DISC_FR },
};

/** Return a locale-translated clone of the instrument (English fallback per field). */
export function localizeInstrument(inst: Instrument, locale: string): Instrument {
  const tr = TRANSLATIONS[locale]?.[inst.id];
  if (!tr) return inst;
  return {
    ...inst,
    name: tr.name ?? inst.name,
    shortName: tr.shortName ?? inst.shortName,
    tagline: tr.tagline ?? inst.tagline,
    description: tr.description ?? inst.description,
    scales: inst.scales.map((s) => {
      const st = tr.scales?.[s.id];
      return st ? { ...s, name: st.name ?? s.name, description: st.description ?? s.description, poles: st.poles ?? s.poles } : s;
    }),
    items: tr.items ? inst.items.map((i) => (tr.items![i.id] ? { ...i, text: tr.items![i.id] } : i)) : inst.items,
  };
}

/** True if any translation exists for this instrument in the locale. */
export function hasTranslation(instrumentId: string, locale: string): boolean {
  return !!TRANSLATIONS[locale]?.[instrumentId];
}
