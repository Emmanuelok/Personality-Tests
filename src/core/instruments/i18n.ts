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

const ENNEAGRAM_ES: InstrumentTranslation = {
  name: "Eneagrama de la personalidad",
  shortName: "Eneagrama",
  tagline: "Nueve tipos, tres centros: un mapa de la motivación central.",
  description:
    "El Eneagrama describe nueve tipos de personalidad organizados en torno a motivaciones centrales —el deseo básico " +
    "y el miedo básico de cada tipo— más que a rasgos superficiales. Este perfilador estima tu resonancia con los nueve " +
    "tipos y resuelve tu tipo dominante, tu ala y tu centro de inteligencia, planteando el crecimiento como el paso de " +
    "la pasión característica de cada tipo hacia su virtud.",
  scales: {
    T1: { name: "Tipo 1 · Reformador", description: "Íntegro, autodisciplinado, orientado a la mejora." },
    T2: { name: "Tipo 2 · Ayudador", description: "Cariñoso, generoso, centrado en las relaciones." },
    T3: { name: "Tipo 3 · Triunfador", description: "Ambicioso, adaptable, orientado al éxito." },
    T4: { name: "Tipo 4 · Individualista", description: "Sensible, expresivo, en busca de identidad." },
    T5: { name: "Tipo 5 · Investigador", description: "Cerebral, reservado, en busca de competencia." },
    T6: { name: "Tipo 6 · Leal", description: "Vigilante, comprometido, en busca de seguridad." },
    T7: { name: "Tipo 7 · Entusiasta", description: "Optimista, espontáneo, en busca de posibilidades." },
    T8: { name: "Tipo 8 · Desafiador", description: "Asertivo, protector, en busca de control." },
    T9: { name: "Tipo 9 · Pacificador", description: "Conciliador, sereno, en busca de armonía." },
  },
  items: {
    T1a: "Tengo un fuerte sentido interno de cómo deberían ser las cosas y noto cuando se quedan cortas.", T1b: "Me exijo estándares altos y me siento culpable cuando no los cumplo.", T1c: "Siento la necesidad de corregir errores y mejorar lo que no está bien.", T1d: "Ser bueno, justo e intachable me importa profundamente.",
    T2a: "Percibo lo que los demás necesitan y me muevo instintivamente para ayudarlos.", T2b: "Me siento más valorado/a cuando la gente cuenta conmigo y agradece mi cuidado.", T2c: "Antepongo las necesidades de los demás a las mías, a veces más de lo que me conviene.", T2d: "Me cuesta cuando alguien a quien quiero está molesto/a conmigo.",
    T3a: "Siento un fuerte impulso por triunfar y por que me vean exitoso/a.", T3b: "Adapto cómo me presento para ganar admiración y lograr resultados.", T3c: "Mido mi valía en gran parte por mis logros y las metas alcanzadas.", T3d: "Me mantengo ocupado/a y eficiente, y odio cualquier cosa que me haga parecer un fracaso.",
    T4a: "A menudo me siento diferente de los demás, apartado/a de algún modo esencial.", T4b: "Mis emociones son profundas y me atrae lo auténtico, lo bello o lo agridulce.", T4c: "Anhelo algo que me falta y que otros parecen tener.", T4d: "Expresar mi individualidad me importa; no soporto ser del montón.",
    T5a: "Cuido mi tiempo y mi energía, y prefiero observar antes de implicarme.", T5b: "Me siento más seguro/a cuando tengo conocimiento y soy autosuficiente.", T5c: "Me retiro a pensar las cosas en privado en lugar de actuar al momento.", T5d: "Prefiero conservar mis recursos antes que depender de los demás.",
    T6a: "Estoy atento/a a lo que podría salir mal para estar preparado/a.", T6b: "La lealtad y la confianza me importan enormemente, aunque la confianza cuesta ganarla.", T6c: "Cuestiono las garantías y la autoridad, y luego a menudo las busco igualmente.", T6d: "Me inquieta la seguridad y busco garantías de que estaré a salvo.",
    T7a: "Mantengo abiertas mis opciones y persigo experiencias nuevas y emocionantes.", T7b: "Cuando las cosas se vuelven dolorosas o aburridas, busco rápido algo más estimulante.", T7c: "Soy optimista y estoy lleno/a de planes, a menudo más de los que puedo terminar.", T7d: "Detesto sentirme atrapado/a, limitado/a o privado/a de algo.",
    T8a: "Instintivamente tomo el mando y protejo a las personas que me importan.", T8b: "Soy directo/a y enérgico/a, y no rehúyo la confrontación.", T8c: "Me resisto a que me controlen e impongo mi voluntad cuando me desafían.", T8d: "Mostrar debilidad me parece arriesgado, así que me mantengo fuerte y al mando.",
    T9a: "Me adapto a los demás para mantener la paz y evitar el conflicto.", T9b: "Veo todos los lados, lo que a veces me dificulta saber qué quiero.", T9c: "Tiendo a fundirme con los planes de los demás y pierdo de vista mis propias prioridades.", T9d: "Prefiero la comodidad y la calma, y desconecto cuando hay tensión.",
  },
};

const ENNEAGRAM_FR: InstrumentTranslation = {
  name: "Ennéagramme de la personnalité",
  shortName: "Ennéagramme",
  tagline: "Neuf types, trois centres : une carte de la motivation profonde.",
  description:
    "L'Ennéagramme décrit neuf types de personnalité organisés autour de motivations profondes — le désir fondamental " +
    "et la peur fondamentale de chaque type — plutôt que de traits de surface. Ce profil estime votre résonance avec " +
    "les neuf types et détermine votre type dominant, votre aile et votre centre d'intelligence, en présentant la " +
    "croissance comme le passage de la passion caractéristique de chaque type vers sa vertu.",
  scales: {
    T1: { name: "Type 1 · Réformateur", description: "Intègre, autodiscipliné, porté sur l'amélioration." },
    T2: { name: "Type 2 · Altruiste", description: "Attentionné, généreux, centré sur les relations." },
    T3: { name: "Type 3 · Battant", description: "Ambitieux, adaptable, orienté vers la réussite." },
    T4: { name: "Type 4 · Individualiste", description: "Sensible, expressif, en quête d'identité." },
    T5: { name: "Type 5 · Investigateur", description: "Cérébral, réservé, en quête de compétence." },
    T6: { name: "Type 6 · Loyaliste", description: "Vigilant, engagé, en quête de sécurité." },
    T7: { name: "Type 7 · Épicurien", description: "Optimiste, spontané, en quête de possibilités." },
    T8: { name: "Type 8 · Meneur", description: "Affirmé, protecteur, en quête de contrôle." },
    T9: { name: "Type 9 · Médiateur", description: "Accommodant, posé, en quête d'harmonie." },
  },
  items: {
    T1a: "J'ai un fort sens intérieur de la façon dont les choses devraient être, et je remarque quand elles ne le sont pas.", T1b: "Je m'impose des exigences élevées et je culpabilise quand je ne les atteins pas.", T1c: "Je me sens poussé(e) à corriger les erreurs et à améliorer ce qui ne va pas.", T1d: "Être bon, juste et irréprochable compte profondément pour moi.",
    T2a: "Je perçois ce dont les autres ont besoin et je me porte instinctivement à leur aide.", T2b: "Je me sens le plus valorisé(e) quand on compte sur moi et qu'on apprécie mes attentions.", T2c: "Je fais passer les besoins des autres avant les miens, parfois plus que de raison.", T2d: "Je vis mal qu'une personne qui m'est chère soit fâchée contre moi.",
    T3a: "Je suis fortement poussé(e) à réussir et à être perçu(e) comme quelqu'un qui réussit.", T3b: "J'adapte la façon dont je me présente pour gagner l'admiration et obtenir des résultats.", T3c: "Je mesure ma valeur en grande partie à mes accomplissements et aux objectifs atteints.", T3d: "Je reste occupé(e) et efficace, et je déteste tout ce qui me ferait passer pour un échec.",
    T4a: "Je me sens souvent différent(e) des autres, à part d'une manière essentielle.", T4b: "Mes émotions sont profondes et je suis attiré(e) par l'authentique, le beau, le doux-amer.", T4c: "J'aspire à quelque chose qui me manque et que les autres semblent avoir.", T4d: "Exprimer mon individualité compte pour moi ; je déteste être ordinaire.",
    T5a: "Je préserve mon temps et mon énergie, et je préfère observer avant de m'engager.", T5b: "Je me sens le plus en sécurité quand je suis compétent(e) et autonome.", T5c: "Je me retire pour réfléchir au calme plutôt que d'agir sur le moment.", T5d: "Je préfère préserver mes ressources plutôt que dépendre des autres.",
    T6a: "Je guette ce qui pourrait mal tourner afin d'y être préparé(e).", T6b: "La loyauté et la confiance comptent énormément pour moi, même si la confiance se mérite.", T6c: "Je remets en question les assurances et l'autorité, puis je les recherche souvent quand même.", T6d: "La sécurité m'inquiète et je cherche des garanties d'être en sûreté.",
    T7a: "Je garde mes options ouvertes et je recherche des expériences nouvelles et stimulantes.", T7b: "Quand les choses deviennent pénibles ou ennuyeuses, je cherche vite quelque chose de plus stimulant.", T7c: "Je suis optimiste et plein(e) de projets — souvent plus que je ne peux en finir.", T7d: "Je déteste me sentir piégé(e), limité(e) ou privé(e).",
    T8a: "Je prends instinctivement les commandes et protège ceux qui me sont chers.", T8b: "Je suis direct(e) et énergique, et je ne fuis pas la confrontation.", T8c: "Je résiste à être contrôlé(e) et j'impose ma volonté quand on me défie.", T8d: "Montrer de la faiblesse me semble risqué, alors je reste fort(e) et aux commandes.",
    T9a: "Je m'accorde aux autres pour préserver la paix et éviter le conflit.", T9b: "Je vois tous les points de vue, ce qui rend parfois difficile de savoir ce que je veux.", T9c: "J'ai tendance à me fondre dans les projets des autres et à perdre de vue mes priorités.", T9d: "Je préfère le confort et le calme, et je me déconnecte quand la tension monte.",
  },
};

export const TRANSLATIONS: Record<string, Record<string, InstrumentTranslation>> = {
  es: { "big-five-ipip50": BIG_FIVE_ES, "disc-4": DISC_ES, "enneagram-9": ENNEAGRAM_ES },
  fr: { "big-five-ipip50": BIG_FIVE_FR, "disc-4": DISC_FR, "enneagram-9": ENNEAGRAM_FR },
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
