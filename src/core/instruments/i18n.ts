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
  scales?: Record<string, { name?: string; description?: string; poles?: { low: string; high: string }; highDescriptor?: string; lowDescriptor?: string }>;
  items?: Record<string, string>;
  /** For choice-format items: translated option texts per item id, parallel to the item's options. */
  options?: Record<string, string[]>;
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
    O: { name: "Apertura a la experiencia", description: "Receptividad a nuevas ideas, la estética, la imaginación y la exploración intelectual.", poles: { low: "Convencional", high: "Inventivo/a" }, highDescriptor: "curioso/a, imaginativo/a, intelectualmente aventurero/a, atraído/a por la novedad y el matiz", lowDescriptor: "práctico/a, convencional, anclado/a en lo concreto y lo probado" },
    C: { name: "Responsabilidad", description: "Tendencia a la organización, la diligencia, la planificación y el autocontrol.", poles: { low: "Espontáneo/a", high: "Disciplinado/a" }, highDescriptor: "organizado/a, fiable, disciplinado/a, orientado/a a metas", lowDescriptor: "flexible, espontáneo/a, cómodo/a con lo imprevisto" },
    E: { name: "Extraversión", description: "Impulso hacia la interacción social, la estimulación, la asertividad y la energía positiva.", poles: { low: "Introvertido/a", high: "Extravertido/a" }, highDescriptor: "extrovertido/a, enérgico/a, socialmente audaz, animado/a por la compañía", lowDescriptor: "reservado/a, comedido/a, restaurado/a por la soledad y la profundidad" },
    A: { name: "Amabilidad", description: "Orientación hacia la compasión, la cooperación, la confianza y la consideración de los demás.", poles: { low: "Exigente", high: "Compasivo/a" }, highDescriptor: "cálido/a, cooperativo/a, empático/a, dispuesto/a a dar el beneficio de la duda", lowDescriptor: "franco/a, escéptico/a, competitivo/a, dispuesto/a a anteponer la tarea a la armonía" },
    N: { name: "Neuroticismo", description: "Tendencia a experimentar emociones negativas, reactividad al estrés e inestabilidad de ánimo.", poles: { low: "Estable", high: "Reactivo/a" }, highDescriptor: "emocionalmente reactivo/a, sensible al estrés, propenso/a a la preocupación y a los cambios de humor", lowDescriptor: "tranquilo/a, ecuánime, resistente bajo presión" },
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
    O: { name: "Ouverture à l'expérience", description: "Réceptivité aux idées nouvelles, à l'esthétique, à l'imagination et à l'exploration intellectuelle.", poles: { low: "Conventionnel(le)", high: "Inventif(ve)" }, highDescriptor: "curieux(se), imaginatif(ve), intellectuellement aventureux(se), attiré(e) par la nouveauté et la nuance", lowDescriptor: "pratique, conventionnel(le), ancré(e) dans le concret et l'éprouvé" },
    C: { name: "Caractère consciencieux", description: "Tendance à l'organisation, à la rigueur, à la planification et à la maîtrise de soi.", poles: { low: "Spontané(e)", high: "Discipliné(e)" }, highDescriptor: "organisé(e), fiable, discipliné(e), orienté(e) vers les objectifs", lowDescriptor: "flexible, spontané(e), à l'aise avec l'imprévu" },
    E: { name: "Extraversion", description: "Élan vers l'engagement social, la stimulation, l'assertivité et l'énergie positive.", poles: { low: "Introverti(e)", high: "Extraverti(e)" }, highDescriptor: "sociable, énergique, audacieux(se) en société, ravivé(e) par la compagnie", lowDescriptor: "réservé(e), mesuré(e), ressourcé(e) par la solitude et la profondeur" },
    A: { name: "Agréabilité", description: "Orientation vers la compassion, la coopération, la confiance et l'attention aux autres.", poles: { low: "Exigeant(e)", high: "Bienveillant(e)" }, highDescriptor: "chaleureux(se), coopératif(ve), empathique, prompt(e) à accorder le bénéfice du doute", lowDescriptor: "franc(he), sceptique, compétitif(ve), prêt(e) à faire passer la tâche avant l'harmonie" },
    N: { name: "Névrosisme", description: "Tendance à éprouver des émotions négatives, une réactivité au stress et une instabilité de l'humeur.", poles: { low: "Stable", high: "Réactif(ve)" }, highDescriptor: "émotionnellement réactif(ve), sensible au stress, enclin(e) à l'inquiétude et aux sautes d'humeur", lowDescriptor: "calme, posé(e), résistant(e) sous pression" },
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
    D: { name: "Dominancia", description: "Impulso por los resultados, franqueza y control.", poles: { low: "Tranquilo/a", high: "Dominante" }, highDescriptor: "asertivo/a, de ritmo rápido y centrado/a en resultados", lowDescriptor: "modesto/a, conciliador/a y discreto/a con el control" },
    I: { name: "Influencia", description: "Sociabilidad, entusiasmo y persuasión.", poles: { low: "Reservado/a", high: "Extrovertido/a" }, highDescriptor: "extrovertido/a, expresivo/a y persuasivo/a", lowDescriptor: "reservado/a, reflexivo/a y comedido/a" },
    S: { name: "Estabilidad", description: "Paciencia, fiabilidad y cooperación.", poles: { low: "Dinámico/a", high: "Estable" }, highDescriptor: "estable, solidario/a y en busca de armonía", lowDescriptor: "cambiante, inquieto/a y cómodo/a con el flujo" },
    C: { name: "Cumplimiento", description: "Precisión, análisis y estándares.", poles: { low: "Improvisador/a", high: "Preciso/a" }, highDescriptor: "preciso/a, cuidadoso/a y orientado/a a la calidad", lowDescriptor: "improvisador/a, de mirada amplia y poco apegado/a a las reglas" },
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
    D: { name: "Dominance", description: "Recherche de résultats, franchise et contrôle.", poles: { low: "Accommodant(e)", high: "Dominant(e)" }, highDescriptor: "assertif(ve), au rythme rapide et axé(e) sur les résultats", lowDescriptor: "modeste, accommodant(e) et discret(ète) quant au contrôle" },
    I: { name: "Influence", description: "Sociabilité, enthousiasme et persuasion.", poles: { low: "Réservé(e)", high: "Extraverti(e)" }, highDescriptor: "sociable, expressif(ve) et persuasif(ve)", lowDescriptor: "réservé(e), réfléchi(e) et discret(ète)" },
    S: { name: "Stabilité", description: "Patience, fiabilité et coopération.", poles: { low: "Dynamique", high: "Stable" }, highDescriptor: "stable, soutenant(e) et en quête d'harmonie", lowDescriptor: "changeant(e), agité(e) et à l'aise avec le flux" },
    C: { name: "Conformité", description: "Précision, analyse et exigence.", poles: { low: "Improvisateur(trice)", high: "Précis(e)" }, highDescriptor: "précis(e), soigneux(se) et axé(e) sur la qualité", lowDescriptor: "improvisateur(trice), à vision large et peu attaché(e) aux règles" },
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
    T1: { name: "Tipo 1 · Reformador", description: "Íntegro, autodisciplinado, orientado a la mejora.", highDescriptor: "alta resonancia con la búsqueda de integridad y rectitud del Reformador", lowDescriptor: "baja resonancia con las motivaciones del Tipo 1" },
    T2: { name: "Tipo 2 · Ayudador", description: "Cariñoso, generoso, centrado en las relaciones.", highDescriptor: "alta resonancia con el impulso del Ayudador de ser necesitado y amado", lowDescriptor: "baja resonancia con las motivaciones del Tipo 2" },
    T3: { name: "Tipo 3 · Triunfador", description: "Ambicioso, adaptable, orientado al éxito.", highDescriptor: "alta resonancia con la búsqueda de valor a través del logro del Triunfador", lowDescriptor: "baja resonancia con las motivaciones del Tipo 3" },
    T4: { name: "Tipo 4 · Individualista", description: "Sensible, expresivo, en busca de identidad.", highDescriptor: "alta resonancia con la búsqueda de identidad auténtica del Individualista", lowDescriptor: "baja resonancia con las motivaciones del Tipo 4" },
    T5: { name: "Tipo 5 · Investigador", description: "Cerebral, reservado, en busca de competencia.", highDescriptor: "alta resonancia con el impulso de comprensión y autosuficiencia del Investigador", lowDescriptor: "baja resonancia con las motivaciones del Tipo 5" },
    T6: { name: "Tipo 6 · Leal", description: "Vigilante, comprometido, en busca de seguridad.", highDescriptor: "alta resonancia con la búsqueda de seguridad y apoyo del Leal", lowDescriptor: "baja resonancia con las motivaciones del Tipo 6" },
    T7: { name: "Tipo 7 · Entusiasta", description: "Optimista, espontáneo, en busca de posibilidades.", highDescriptor: "alta resonancia con la búsqueda de satisfacción y libertad del Entusiasta", lowDescriptor: "baja resonancia con las motivaciones del Tipo 7" },
    T8: { name: "Tipo 8 · Desafiador", description: "Asertivo, protector, en busca de control.", highDescriptor: "alta resonancia con el impulso de fuerza y autonomía del Desafiador", lowDescriptor: "baja resonancia con las motivaciones del Tipo 8" },
    T9: { name: "Tipo 9 · Pacificador", description: "Conciliador, sereno, en busca de armonía.", highDescriptor: "alta resonancia con la búsqueda de paz y unión del Pacificador", lowDescriptor: "baja resonancia con las motivaciones del Tipo 9" },
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
    T1: { name: "Type 1 · Réformateur", description: "Intègre, autodiscipliné, porté sur l'amélioration.", highDescriptor: "forte résonance avec la quête d'intégrité et de justesse du Réformateur", lowDescriptor: "faible résonance avec les motivations du Type 1" },
    T2: { name: "Type 2 · Altruiste", description: "Attentionné, généreux, centré sur les relations.", highDescriptor: "forte résonance avec le besoin d'être nécessaire et aimé de l'Altruiste", lowDescriptor: "faible résonance avec les motivations du Type 2" },
    T3: { name: "Type 3 · Battant", description: "Ambitieux, adaptable, orienté vers la réussite.", highDescriptor: "forte résonance avec la quête de valeur par la réussite du Battant", lowDescriptor: "faible résonance avec les motivations du Type 3" },
    T4: { name: "Type 4 · Individualiste", description: "Sensible, expressif, en quête d'identité.", highDescriptor: "forte résonance avec la quête d'identité authentique de l'Individualiste", lowDescriptor: "faible résonance avec les motivations du Type 4" },
    T5: { name: "Type 5 · Investigateur", description: "Cérébral, réservé, en quête de compétence.", highDescriptor: "forte résonance avec la quête de compréhension et d'autonomie de l'Investigateur", lowDescriptor: "faible résonance avec les motivations du Type 5" },
    T6: { name: "Type 6 · Loyaliste", description: "Vigilant, engagé, en quête de sécurité.", highDescriptor: "forte résonance avec la quête de sécurité et de soutien du Loyaliste", lowDescriptor: "faible résonance avec les motivations du Type 6" },
    T7: { name: "Type 7 · Épicurien", description: "Optimiste, spontané, en quête de possibilités.", highDescriptor: "forte résonance avec la quête de satisfaction et de liberté de l'Épicurien", lowDescriptor: "faible résonance avec les motivations du Type 7" },
    T8: { name: "Type 8 · Meneur", description: "Affirmé, protecteur, en quête de contrôle.", highDescriptor: "forte résonance avec l'élan de force et d'autonomie du Meneur", lowDescriptor: "faible résonance avec les motivations du Type 8" },
    T9: { name: "Type 9 · Médiateur", description: "Accommodant, posé, en quête d'harmonie.", highDescriptor: "forte résonance avec la quête de paix et d'union du Médiateur", lowDescriptor: "faible résonance avec les motivations du Type 9" },
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

/* ── Wellbeing set: PERMA, Satisfaction With Life, Resilience, Self-Esteem, Mood ── */

const PERMA_ES: InstrumentTranslation = {
  name: "Florecimiento (PERMA)",
  shortName: "PERMA",
  tagline: "Cinco pilares cultivables de una vida que va bien.",
  description:
    "El bienestar no es una sola cosa: el modelo PERMA de Martin Seligman lo divide en cinco pilares que puedes " +
    "cultivar por separado: Emoción positiva, Compromiso, Relaciones, Sentido y Logro. Esta es una instantánea cálida " +
    "y basada en las fortalezas de cómo estás floreciendo ahora mismo y qué pilar agradecería más tu atención.",
  scales: {
    POS: { name: "Emoción positiva", description: "Alegría, gratitud, satisfacción y esperanza.", poles: { low: "Agotado/a", high: "Alegre" }, highDescriptor: "rico/a en sensaciones positivas cotidianas", lowDescriptor: "bajo/a en sensaciones positivas últimamente" },
    ENG: { name: "Compromiso", description: "Absorción y fluidez en lo que haces.", poles: { low: "Desconectado/a", high: "Absorto/a" }, highDescriptor: "a menudo profundamente absorto/a y en flujo", lowDescriptor: "rara vez plenamente comprometido/a" },
    REL: { name: "Relaciones", description: "Cercanía, apoyo y pertenencia.", poles: { low: "Aislado/a", high: "Conectado/a" }, highDescriptor: "bien conectado/a y apoyado/a", lowDescriptor: "solo/a o con poco apoyo" },
    MEA: { name: "Sentido", description: "Propósito y significado.", poles: { low: "A la deriva", high: "Con propósito" }, highDescriptor: "anclado/a en el propósito y el significado", lowDescriptor: "en busca de rumbo" },
    ACC: { name: "Logro", description: "Maestría, progreso y consecución.", poles: { low: "Estancado/a", high: "Realizado/a" }, highDescriptor: "con un fuerte sentido de logro y progreso", lowDescriptor: "bajo/a en sentido de logro" },
  },
  items: {
    P1: "Con frecuencia siento alegría, gratitud o satisfacción.", P2: "Las buenas sensaciones son parte habitual de mis días.", P3: "Últimamente rara vez me siento positivo/a o animado/a.",
    E1: "A menudo me absorbo por completo en lo que hago.", E2: "Pierdo la noción del tiempo cuando hago algo que me encanta.", E3: "Rara vez estoy plenamente absorto/a o «en flujo».",
    R1: "Tengo relaciones cercanas y de apoyo con las que puedo contar.", R2: "Me siento querido/a y conectado/a con otras personas.", R3: "A menudo me siento solo/a o sin apoyo.",
    M1: "Mi vida tiene un claro sentido de propósito y significado.", M2: "Lo que hago me parece valioso y significativo.", M3: "A menudo siento que mi vida carece de rumbo o propósito.",
    A1: "Logro con regularidad metas que me importan.", A2: "Siento una auténtica sensación de logro y progreso.", A3: "Rara vez siento que consigo lo que me propongo.",
  },
};

const PERMA_FR: InstrumentTranslation = {
  name: "Épanouissement (PERMA)",
  shortName: "PERMA",
  tagline: "Cinq piliers cultivables d'une vie qui va bien.",
  description:
    "Le bien-être n'est pas une chose unique : le modèle PERMA de Martin Seligman le décompose en cinq piliers que " +
    "vous pouvez cultiver chacun — Émotion positive, Engagement, Relations, Sens et Accomplissement. Voici un aperçu " +
    "chaleureux et axé sur les forces de votre épanouissement actuel et du pilier qui mériterait le plus votre attention.",
  scales: {
    POS: { name: "Émotion positive", description: "Joie, gratitude, contentement et espoir.", poles: { low: "Épuisé(e)", high: "Joyeux(se)" }, highDescriptor: "riche en émotions positives au quotidien", lowDescriptor: "en manque d'émotions positives ces derniers temps" },
    ENG: { name: "Engagement", description: "Absorption et fluidité dans ce que vous faites.", poles: { low: "Désengagé(e)", high: "Absorbé(e)" }, highDescriptor: "souvent profondément absorbé(e) et dans le flux", lowDescriptor: "rarement pleinement engagé(e)" },
    REL: { name: "Relations", description: "Proximité, soutien et appartenance.", poles: { low: "Isolé(e)", high: "Connecté(e)" }, highDescriptor: "bien relié(e) et soutenu(e)", lowDescriptor: "seul(e) ou peu soutenu(e)" },
    MEA: { name: "Sens", description: "But et signification.", poles: { low: "À la dérive", high: "Habité(e) d'un but" }, highDescriptor: "ancré(e) dans le but et le sens", lowDescriptor: "en quête de direction" },
    ACC: { name: "Accomplissement", description: "Maîtrise, progrès et réussite.", poles: { low: "À l'arrêt", high: "Accompli(e)" }, highDescriptor: "doté(e) d'un fort sentiment de réussite et de progrès", lowDescriptor: "en manque de sentiment de réussite" },
  },
  items: {
    P1: "Je ressens fréquemment de la joie, de la gratitude ou du contentement.", P2: "Les sensations agréables font régulièrement partie de mes journées.", P3: "Ces derniers temps, je me sens rarement positif(ve) ou enjoué(e).",
    E1: "Je me plonge souvent entièrement dans ce que je fais.", E2: "Je perds la notion du temps quand je fais quelque chose que j'aime.", E3: "Je suis rarement pleinement absorbé(e) ou « dans le flux ».",
    R1: "J'ai des relations proches et soutenantes sur lesquelles je peux compter.", R2: "Je me sens aimé(e) et lié(e) aux autres.", R3: "Je me sens souvent seul(e) ou sans soutien.",
    M1: "Ma vie a un sens clair, un but et une signification.", M2: "Ce que je fais me semble utile et important.", M3: "Je sens souvent que ma vie manque de direction ou de but.",
    A1: "J'atteins régulièrement des objectifs qui comptent pour moi.", A2: "Je ressens un réel sentiment de réussite et de progrès.", A3: "Je sens rarement que j'accomplis ce que je me suis fixé.",
  },
};

const SWLS_ES: InstrumentTranslation = {
  name: "Satisfacción con la vida",
  shortName: "Satisfacción vital",
  tagline: "Tu veredicto general sobre cómo va la vida, según tus propios criterios.",
  description:
    "La Escala de Satisfacción con la Vida es la medida más usada del lado reflexivo y valorativo del bienestar: no " +
    "cómo te sientes momento a momento, sino tu juicio meditado sobre la vida en su conjunto, frente a los estándares " +
    "que tú mismo/a fijas. Cinco frases breves, décadas de validación en todo el mundo.",
  scales: {
    SWL: { name: "Satisfacción con la vida", description: "Juicio cognitivo global de satisfacción con tu vida.", poles: { low: "Insatisfecho/a", high: "Satisfecho/a" }, highDescriptor: "ampliamente satisfecho/a: la vida se acerca a tu ideal", lowDescriptor: "insatisfecho/a: la vida se queda corta respecto a lo que quieres" },
  },
  items: {
    L1: "En la mayoría de los aspectos, mi vida se acerca a mi ideal.",
    L2: "Las condiciones de mi vida son excelentes.",
    L3: "Estoy satisfecho/a con mi vida.",
    L4: "Hasta ahora he conseguido las cosas importantes que quiero en la vida.",
    L5: "Si pudiera vivir mi vida de nuevo, no cambiaría casi nada.",
  },
};

const SWLS_FR: InstrumentTranslation = {
  name: "Satisfaction de vie",
  shortName: "Satisfaction de vie",
  tagline: "Votre jugement global sur le cours de votre vie, selon vos propres critères.",
  description:
    "L'Échelle de satisfaction de vie est la mesure la plus utilisée du versant réfléchi et évaluatif du bien-être : " +
    "non pas ce que vous ressentez d'instant en instant, mais votre jugement posé sur la vie dans son ensemble, au " +
    "regard des critères que vous vous fixez. Cinq courtes affirmations, des décennies de validation à travers le monde.",
  scales: {
    SWL: { name: "Satisfaction de vie", description: "Jugement cognitif global de satisfaction à l'égard de votre vie.", poles: { low: "Insatisfait(e)", high: "Satisfait(e)" }, highDescriptor: "globalement satisfait(e) : la vie est proche de votre idéal", lowDescriptor: "insatisfait(e) : la vie est en deçà de ce que vous voulez" },
  },
  items: {
    L1: "À bien des égards, ma vie est proche de mon idéal.",
    L2: "Les conditions de ma vie sont excellentes.",
    L3: "Je suis satisfait(e) de ma vie.",
    L4: "Jusqu'ici, j'ai obtenu les choses importantes que je veux dans la vie.",
    L5: "Si je pouvais revivre ma vie, je n'y changerais presque rien.",
  },
};

const RESILIENCE_ES: InstrumentTranslation = {
  name: "Resiliencia (capacidad de recuperación)",
  shortName: "Resiliencia",
  tagline: "Con qué rapidez te recuperas y rebotas tras el estrés.",
  description:
    "La resiliencia se confunde a menudo con la dureza o la garra, pero la Escala Breve de Resiliencia mide su sentido " +
    "original: con qué facilidad te recuperas tras el estrés y la adversidad. No se trata de no sufrir nunca, sino de " +
    "recuperarse. Y como la resiliencia crece con el apoyo, las habilidades y el sentido, una puntuación más baja es un punto desde el que construir.",
  scales: {
    RES: { name: "Resiliencia de recuperación", description: "Capacidad de recuperarte rápido del estrés y los reveses.", poles: { low: "Lento/a en recuperarse", high: "Se recupera bien" }, highDescriptor: "te recuperas rápido y sales de la dificultad intacto/a", lowDescriptor: "los reveses tienden a derribarte por más tiempo" },
  },
  items: {
    R1: "Suelo recuperarme rápido tras los momentos difíciles.",
    R2: "Me cuesta superar los acontecimientos estresantes.",
    R3: "No tardo mucho en recuperarme de un suceso estresante.",
    R4: "Me resulta difícil reponerme cuando ocurre algo malo.",
    R5: "Suelo atravesar los tiempos difíciles con pocos problemas.",
    R6: "Tiendo a tardar mucho en superar los reveses de mi vida.",
  },
};

const RESILIENCE_FR: InstrumentTranslation = {
  name: "Résilience (capacité de rebond)",
  shortName: "Résilience",
  tagline: "À quelle vitesse vous récupérez et rebondissez après le stress.",
  description:
    "On confond souvent la résilience avec l'endurance ou la ténacité, mais l'Échelle brève de résilience en mesure le " +
    "sens d'origine : avec quelle facilité vous rebondissez après le stress et l'adversité. Il ne s'agit pas de ne jamais " +
    "souffrir, mais de récupérer. Et comme la résilience grandit avec le soutien, les compétences et le sens, un score plus bas est un point d'appui pour progresser.",
  scales: {
    RES: { name: "Résilience de rebond", description: "Capacité à récupérer vite du stress et des revers.", poles: { low: "Lent(e) à récupérer", high: "Rebondit bien" }, highDescriptor: "vous récupérez vite et traversez l'épreuve intact(e)", lowDescriptor: "les revers ont tendance à vous abattre plus longtemps" },
  },
  items: {
    R1: "J'ai tendance à rebondir vite après les périodes difficiles.",
    R2: "J'ai du mal à traverser les événements stressants.",
    R3: "Il ne me faut pas longtemps pour me remettre d'un événement stressant.",
    R4: "J'ai du mal à me ressaisir quand quelque chose de mauvais arrive.",
    R5: "Je traverse généralement les moments difficiles sans trop d'encombre.",
    R6: "J'ai tendance à mettre longtemps à surmonter les revers de ma vie.",
  },
};

const SELFESTEEM_ES: InstrumentTranslation = {
  name: "Autoestima (Rosenberg)",
  shortName: "Autoestima",
  tagline: "Tu sentido global de autovalía: la medida de autoestima más usada en psicología.",
  description:
    "La Escala de Autoestima de Rosenberg es la medida de referencia de la autovalía global: cómo de positivamente, en " +
    "conjunto, te valoras a ti mismo/a. Diez frases equilibradas, validadas durante décadas y culturas. La autoestima no " +
    "es fija: responde a cómo te tratas y a lo que construyes, así que también sirve como punto de partida para crecer.",
  scales: {
    EST: { name: "Autoestima global", description: "Sentido general de valía personal y autoaceptación.", poles: { low: "Baja autovaloración", high: "Alta autovaloración" }, highDescriptor: "con autorrespeto, seguro/a y aceptándote a ti mismo/a", lowDescriptor: "autocrítico/a y propenso/a a dudar de tu valía" },
  },
  items: {
    S1: "En general, estoy satisfecho/a conmigo mismo/a.",
    S2: "Siento que tengo una serie de buenas cualidades.",
    S3: "Soy capaz de hacer las cosas tan bien como la mayoría de la gente.",
    S4: "Siento que soy una persona valiosa, al menos en igual medida que los demás.",
    S5: "Adopto una actitud positiva hacia mí mismo/a.",
    S6: "A veces pienso que no sirvo para nada.",
    S7: "Siento que no tengo mucho de lo que enorgullecerme.",
    S8: "Ciertamente, a veces me siento inútil.",
    S9: "Desearía poder tenerme más respeto.",
    S10: "En definitiva, tiendo a sentir que soy un fracaso.",
  },
};

const SELFESTEEM_FR: InstrumentTranslation = {
  name: "Estime de soi (Rosenberg)",
  shortName: "Estime de soi",
  tagline: "Votre sentiment global de valeur personnelle — la mesure d'estime de soi la plus utilisée.",
  description:
    "L'Échelle d'estime de soi de Rosenberg est la mesure de référence de la valeur personnelle globale : à quel point, " +
    "dans l'ensemble, vous vous estimez positivement. Dix affirmations équilibrées, validées au fil des décennies et des " +
    "cultures. L'estime de soi n'est pas figée : elle réagit à la façon dont vous vous traitez et à ce que vous construisez, ce qui en fait aussi un point de départ pour progresser.",
  scales: {
    EST: { name: "Estime de soi globale", description: "Sentiment général de valeur personnelle et d'acceptation de soi.", poles: { low: "Faible estime de soi", high: "Forte estime de soi" }, highDescriptor: "respectueux(se) de vous-même, sûr(e) et vous acceptant", lowDescriptor: "autocritique et enclin(e) à douter de votre valeur" },
  },
  items: {
    S1: "Dans l'ensemble, je suis satisfait(e) de moi-même.",
    S2: "Je sens que je possède un certain nombre de belles qualités.",
    S3: "Je suis capable de faire les choses aussi bien que la plupart des gens.",
    S4: "Je sens que je suis une personne de valeur, au moins autant que les autres.",
    S5: "J'adopte une attitude positive envers moi-même.",
    S6: "Il m'arrive de penser que je ne vaux rien.",
    S7: "Je sens que je n'ai pas grand-chose dont être fier(e).",
    S8: "Je me sens parfois vraiment inutile.",
    S9: "J'aimerais pouvoir avoir plus de respect pour moi-même.",
    S10: "Tout compte fait, j'ai tendance à me considérer comme un échec.",
  },
};

const MOOD_ES: InstrumentTranslation = {
  name: "Chequeo del estado de ánimo",
  shortName: "Ánimo",
  tagline: "Una instantánea amable de dos semanas de ánimo y energía: apoyo, no diagnóstico.",
  description:
    "Un chequeo breve y cuidadoso de cómo han estado tu ánimo y tu energía en las últimas dos semanas, en el espíritu " +
    "de los cribados habituales de bienestar, pero enfocado en cómo estás, no en qué va mal. Puntuaciones más altas " +
    "significan un ánimo y una energía más estables. Es un estímulo para el autoconocimiento y el autocuidado, nunca un diagnóstico.",
  scales: {
    MOOD: { name: "Ánimo y perspectiva", description: "Luminosidad del ánimo, el interés y la esperanza.", poles: { low: "Bajo y plano", high: "Luminoso y esperanzado" }, highDescriptor: "ánimo más luminoso, interés y esperanza", lowDescriptor: "ánimo más bajo y plano y menos interés" },
    ENRG: { name: "Energía y descanso", description: "Energía, descanso y estabilidad física.", poles: { low: "Agotado/a", high: "Con energía" }, highDescriptor: "descansado/a, con energía y sereno/a", lowDescriptor: "cansado/a, agotado/a o inquieto/a" },
  },
  items: {
    M1: "En las últimas dos semanas, me he sentido decaído/a, deprimido/a o sin esperanza.",
    M2: "He tenido poco interés o placer en cosas que normalmente disfruto.",
    M3: "Me he sentido bien conmigo mismo/a y con esperanza sobre los días por venir.",
    M4: "He podido disfrutar de partes de mi día.",
    E1: "He dormido razonablemente bien y me he sentido descansado/a.",
    E2: "He tenido energía para hacer lo que necesitaba hacer.",
    E3: "Me he sentido cansado/a o con poca energía.",
    E4: "Me he sentido ralentizado/a, o inquieto/a e incapaz de calmarme.",
  },
};

const MOOD_FR: InstrumentTranslation = {
  name: "Bilan de l'humeur",
  shortName: "Humeur",
  tagline: "Un aperçu bienveillant sur deux semaines de l'humeur et de l'énergie — du soutien, pas un diagnostic.",
  description:
    "Un bilan bref et attentionné de votre humeur et de votre énergie au cours des deux dernières semaines, dans " +
    "l'esprit des dépistages courants du bien-être — mais centré sur comment vous allez, non sur ce qui ne va pas. Des " +
    "scores plus élevés indiquent une humeur et une énergie plus stables. C'est une invitation à la conscience de soi et au soin de soi, jamais un diagnostic.",
  scales: {
    MOOD: { name: "Humeur et perspective", description: "Éclat de l'humeur, intérêt et espoir.", poles: { low: "Bas et terne", high: "Lumineux et plein d'espoir" }, highDescriptor: "humeur plus lumineuse, intérêt et espoir", lowDescriptor: "humeur plus basse et plus terne, et moins d'intérêt" },
    ENRG: { name: "Énergie et repos", description: "Énergie, repos et stabilité physique.", poles: { low: "Épuisé(e)", high: "Plein(e) d'énergie" }, highDescriptor: "reposé(e), plein(e) d'énergie et apaisé(e)", lowDescriptor: "fatigué(e), épuisé(e) ou agité(e)" },
  },
  items: {
    M1: "Au cours des deux dernières semaines, je me suis senti(e) abattu(e), déprimé(e) ou sans espoir.",
    M2: "J'ai eu peu d'intérêt ou de plaisir pour des choses que j'apprécie d'ordinaire.",
    M3: "Je me suis senti(e) bien dans ma peau et plein(e) d'espoir pour les jours à venir.",
    M4: "J'ai pu profiter de certains moments de ma journée.",
    E1: "J'ai assez bien dormi et je me suis senti(e) reposé(e).",
    E2: "J'ai eu l'énergie de faire ce que je devais faire.",
    E3: "Je me suis senti(e) fatigué(e) ou à court d'énergie.",
    E4: "Je me suis senti(e) ralenti(e), ou agité(e) et incapable de me poser.",
  },
};

/* ── HEXACO + Dark Triad (dimensional; reports localize via the shared composer) ── */

const HEXACO_ES: InstrumentTranslation = {
  name: "Personalidad HEXACO (6 dimensiones)",
  shortName: "HEXACO",
  tagline: "Los Cinco Grandes, más el factor que les faltaba: Honestidad-Humildad.",
  description:
    "HEXACO es un modelo de seis dimensiones con un fuerte respaldo intercultural. Junto a Emocionalidad, " +
    "eXtraversión, Amabilidad, Responsabilidad y Apertura, añade la Honestidad-Humildad —la tendencia a la " +
    "sinceridad, la justicia y la modestia—, que predice el comportamiento ético más allá de los Cinco Grandes.",
  scales: {
    H: { name: "Honestidad-Humildad", description: "Sinceridad, justicia, modestia y ausencia de codicia.", poles: { low: "Interesado/a", high: "Honesto/a-Humilde" }, highDescriptor: "sincero/a, justo/a, modesto/a y poco dispuesto/a a explotar a los demás", lowDescriptor: "en busca de estatus, autopromocional y dispuesto/a a torcer las reglas por ventaja" },
    E: { name: "Emocionalidad", description: "Temor, ansiedad, sentimentalidad y necesidad de apoyo.", poles: { low: "Poco sentimental", high: "Sensible" }, highDescriptor: "sensible, sentimental y atento/a al riesgo y al vínculo", lowDescriptor: "duro/a, autosuficiente y tranquilo/a ante el peligro" },
    X: { name: "eXtraversión", description: "Autoestima social, audacia, sociabilidad y vitalidad.", poles: { low: "Reservado/a", high: "Extrovertido/a" }, highDescriptor: "extrovertido/a, vivaz, con confianza social y con energía entre la gente", lowDescriptor: "reservado/a, discreto/a y a gusto en su propia compañía" },
    A: { name: "Amabilidad (vs. Ira)", description: "Perdón, gentileza, flexibilidad y paciencia.", poles: { low: "Crítico/a", high: "Amable" }, highDescriptor: "indulgente, gentil, fácil de tratar y lento/a para la ira", lowDescriptor: "crítico/a, terco/a y rápido/a en sentirse agraviado/a" },
    C: { name: "Responsabilidad", description: "Organización, diligencia, perfeccionismo y prudencia.", poles: { low: "Espontáneo/a", high: "Disciplinado/a" }, highDescriptor: "organizado/a, disciplinado/a, cuidadoso/a y minucioso/a", lowDescriptor: "espontáneo/a, flexible y cómodo/a con el desorden" },
    O: { name: "Apertura a la experiencia", description: "Aprecio estético, curiosidad, creatividad y heterodoxia.", poles: { low: "Convencional", high: "Inventivo/a" }, highDescriptor: "curioso/a, imaginativo/a y atraído/a por el arte, las ideas y lo poco convencional", lowDescriptor: "práctico/a, convencional y centrado/a en lo familiar" },
  },
  items: {
    H1: "No usaría la adulación para conseguir un aumento o un ascenso, aunque funcionara.", H2: "Si supiera que nunca me pillarían, estaría dispuesto/a a torcer las reglas en beneficio propio.", H3: "Tener mucho dinero y lujo no me importa demasiado.", H4: "Siento que merezco más respeto y trato especial que la persona media.",
    E1: "Sentiría bastante miedo si tuviera que viajar con muy mal tiempo.", E2: "Me preocupo bastante por cómo saldrán las cosas.", E3: "Puedo manejar situaciones difíciles sin necesitar apoyo emocional de los demás.", E4: "Siento una emoción intensa cuando alguien cercano se marcha por mucho tiempo.",
    X1: "Me siento razonablemente satisfecho/a conmigo mismo/a y con mi vida.", X2: "En situaciones sociales, suelo ser quien da el primer paso.", X3: "Disfruto de tener mucha gente alrededor con quien hablar.", X4: "La mayoría de la gente es más alegre y animada que yo.",
    A1: "Rara vez guardo rencor, ni siquiera a quienes me han agraviado gravemente.", A2: "A veces me dicen que soy demasiado crítico/a con los demás.", A3: "Suelo estar dispuesto/a a ceder en lugar de insistir en salirme con la mía.", A4: "Pierdo los estribos más fácilmente que la mayoría.",
    C1: "Mantengo mis cosas ordenadas y bien organizadas.", C2: "Cuando trabajo en algo, me exijo mucho para hacerlo bien.", C3: "A menudo tomo decisiones de forma impulsiva.", C4: "Reviso los detalles con cuidado antes de dar una tarea por terminada.",
    O1: "Me cautiva la belleza en el arte o la naturaleza.", O2: "Me gusta hacer preguntas sobre cosas que la mayoría da por sentadas.", O3: "La gente me describiría como imaginativo/a y original.", O4: "Evito las ideas y las personas que parecen extrañas o poco convencionales.",
  },
};

const HEXACO_FR: InstrumentTranslation = {
  name: "Personnalité HEXACO (6 dimensions)",
  shortName: "HEXACO",
  tagline: "Les Big Five, plus le facteur qui leur manquait : Honnêteté-Humilité.",
  description:
    "HEXACO est un modèle à six dimensions solidement appuyé par les études interculturelles. À côté de l'Émotivité, " +
    "de l'eXtraversion, de l'Agréabilité, du caractère Consciencieux et de l'Ouverture, il ajoute l'Honnêteté-Humilité " +
    "— la tendance à la sincérité, à l'équité et à la modestie —, qui prédit le comportement éthique au-delà des Big Five.",
  scales: {
    H: { name: "Honnêteté-Humilité", description: "Sincérité, équité, modestie et absence d'avidité.", poles: { low: "Intéressé(e)", high: "Honnête-Humble" }, highDescriptor: "sincère, équitable, modeste et peu enclin(e) à exploiter autrui", lowDescriptor: "en quête de statut, porté(e) à l'autopromotion et prêt(e) à contourner les règles pour un avantage" },
    E: { name: "Émotivité", description: "Peur, anxiété, sentimentalité et besoin de soutien.", poles: { low: "Peu sentimental(e)", high: "Sensible" }, highDescriptor: "sensible, sentimental(e) et attentif(ve) au risque et au lien", lowDescriptor: "endurci(e), autonome et calme face au danger" },
    X: { name: "eXtraversion", description: "Estime de soi sociale, audace, sociabilité et entrain.", poles: { low: "Réservé(e)", high: "Extraverti(e)" }, highDescriptor: "sociable, vif(ve), sûr(e) de soi en société et stimulé(e) par les autres", lowDescriptor: "réservé(e), discret(ète) et bien dans sa propre compagnie" },
    A: { name: "Agréabilité (vs. Colère)", description: "Pardon, douceur, souplesse et patience.", poles: { low: "Critique", high: "Agréable" }, highDescriptor: "indulgent(e), doux(ce), facile à vivre et lent(e) à la colère", lowDescriptor: "critique, têtu(e) et prompt(e) à se sentir lésé(e)" },
    C: { name: "Caractère consciencieux", description: "Organisation, diligence, perfectionnisme et prudence.", poles: { low: "Spontané(e)", high: "Discipliné(e)" }, highDescriptor: "organisé(e), discipliné(e), soigneux(se) et minutieux(se)", lowDescriptor: "spontané(e), souple et à l'aise avec le désordre" },
    O: { name: "Ouverture à l'expérience", description: "Sens esthétique, curiosité, créativité et non-conformisme.", poles: { low: "Conventionnel(le)", high: "Inventif(ve)" }, highDescriptor: "curieux(se), imaginatif(ve) et attiré(e) par l'art, les idées et l'inhabituel", lowDescriptor: "pratique, conventionnel(le) et centré(e) sur le familier" },
  },
  items: {
    H1: "Je n'utiliserais pas la flatterie pour obtenir une augmentation ou une promotion, même si cela marchait.", H2: "Si je savais que je ne me ferais jamais prendre, je serais prêt(e) à contourner les règles à mon profit.", H3: "Avoir beaucoup d'argent et de luxe ne m'importe pas particulièrement.", H4: "J'estime mériter plus de respect et de traitement de faveur que la moyenne des gens.",
    E1: "J'aurais assez peur si je devais voyager par très mauvais temps.", E2: "Je me soucie beaucoup de la façon dont les choses vont tourner.", E3: "Je peux gérer des situations difficiles sans avoir besoin du soutien émotionnel des autres.", E4: "Je ressens une émotion forte quand un proche part pour longtemps.",
    X1: "Je me sens raisonnablement satisfait(e) de moi-même et de ma vie.", X2: "Dans les situations sociales, je suis souvent celui/celle qui fait le premier pas.", X3: "J'aime avoir beaucoup de monde autour de moi pour discuter.", X4: "La plupart des gens sont plus gais et enjoués que moi.",
    A1: "Je garde rarement rancune, même envers ceux qui m'ont gravement lésé(e).", A2: "On me dit parfois que je suis trop critique envers les autres.", A3: "Je suis généralement prêt(e) à faire des compromis plutôt qu'à imposer ma façon de voir.", A4: "Je m'emporte plus facilement que la plupart des gens.",
    C1: "Je garde mes affaires nettes et bien rangées.", C2: "Quand je travaille sur quelque chose, je me pousse à le réussir.", C3: "Je prends souvent des décisions sur un coup de tête.", C4: "Je vérifie soigneusement les détails avant de considérer une tâche terminée.",
    O1: "La beauté dans l'art ou la nature me captive.", O2: "J'aime poser des questions sur ce que la plupart des gens tiennent pour acquis.", O3: "On me décrirait comme imaginatif(ve) et original(e).", O4: "J'évite les idées et les personnes qui semblent étranges ou non conventionnelles.",
  },
};

const DARKTRIAD_ES: InstrumentTranslation = {
  name: "La Tríada Oscura",
  shortName: "Tríada Oscura",
  tagline: "Tres rasgos de sombra, medidos con honestidad, para comprender, no para juzgar.",
  description:
    "La Tríada Oscura —Maquiavelismo (manipulación estratégica), Narcisismo (grandiosidad y necesidad de admiración) " +
    "y Psicopatía (frialdad e impulsividad)— capta el lado «más oscuro» de la personalidad normal. Ver tus niveles con " +
    "claridad es una vía hacia el autoconocimiento, no un veredicto sobre tu carácter.",
  scales: {
    MACH: { name: "Maquiavelismo", description: "Estratégico, calculador y dispuesto a manipular para lograr sus metas.", poles: { low: "Directo/a", high: "Estratégico/a" }, highDescriptor: "estratégico/a, cauteloso/a y cómodo/a maniobrando para obtener resultados", lowDescriptor: "directo/a, confiado/a y sin interés en manipular" },
    NARC: { name: "Narcisismo", description: "Grandiosidad, sentido de superioridad y necesidad de admiración.", poles: { low: "Modesto/a", high: "Grandioso/a" }, highDescriptor: "seguro/a de sí, buscador/a de atención y ávido/a de reconocimiento", lowDescriptor: "modesto/a, humilde y cómodo/a fuera del foco" },
    PSYCH: { name: "Psicopatía", description: "Frialdad, impulsividad y búsqueda de emociones (rango normal).", poles: { low: "Empático/a", high: "Frío/a" }, highDescriptor: "audaz, impulsivo/a, buscador/a de emociones y con poca culpa o empatía", lowDescriptor: "cauteloso/a, empático/a y considerado/a con los demás" },
  },
  items: {
    M1: "Es sensato guardarte alguna información sobre ti para cuando resulte útil.", M2: "Estoy dispuesto/a a orientar una situación para obtener el resultado que quiero.", M3: "A casi todo el mundo se le puede ganar con el enfoque adecuado, y yo lo aprovecho.", M4: "Prefiero actuar entre bastidores antes que enfrentarme a la gente de frente.", M5: "Es inteligente esperar el momento oportuno para devolvérsela a alguien.", M6: "Me aseguro de que mis planes sirvan a mis intereses, aunque no lo anuncie.",
    N1: "La gente me ve como un líder natural, y estoy de acuerdo.", N2: "Me gusta ser el centro de atención.", N3: "Tengo la firme sensación de ser especial o excepcional.", N4: "Disfruto que me admiren, y me molesta cuando no es así.", N5: "Espero un buen reconocimiento por lo que hago.", N6: "Soy más capaz que la mayoría de la gente que me rodea.",
    P1: "Tiendo a actuar por impulso sin preocuparme mucho por las consecuencias.", P2: "El sufrimiento de los demás no me conmueve con facilidad.", P3: "Me gusta arriesgarme y buscar emociones fuertes.", P4: "Vengarse puede ser satisfactorio.", P5: "Rara vez me siento culpable, incluso cuando probablemente debería.", P6: "Las reglas me parecen más bien sugerencias.",
  },
};

const DARKTRIAD_FR: InstrumentTranslation = {
  name: "La Triade noire",
  shortName: "Triade noire",
  tagline: "Trois traits de l'ombre — mesurés honnêtement, pour comprendre, pas pour juger.",
  description:
    "La Triade noire — Machiavélisme (manipulation stratégique), Narcissisme (grandiosité et besoin d'admiration) et " +
    "Psychopathie (froideur et impulsivité) — capte le côté « plus sombre » de la personnalité normale. Voir vos " +
    "niveaux clairement est une voie vers la connaissance de soi, pas un verdict sur votre caractère.",
  scales: {
    MACH: { name: "Machiavélisme", description: "Stratège, calculateur et prêt à manipuler pour atteindre ses buts.", poles: { low: "Direct(e)", high: "Stratège" }, highDescriptor: "stratège, sur ses gardes et à l'aise pour manœuvrer afin d'obtenir des résultats", lowDescriptor: "direct(e), confiant(e) et sans intérêt pour la manipulation" },
    NARC: { name: "Narcissisme", description: "Grandiosité, sentiment d'importance et besoin d'admiration.", poles: { low: "Modeste", high: "Grandiose" }, highDescriptor: "sûr(e) de lui/elle, en quête d'attention et avide de reconnaissance", lowDescriptor: "modeste, effacé(e) et à l'aise hors des projecteurs" },
    PSYCH: { name: "Psychopathie", description: "Froideur, impulsivité et recherche de sensations (registre normal).", poles: { low: "Empathique", high: "Froid(e)" }, highDescriptor: "audacieux(se), impulsif(ve), en quête de sensations et peu sujet(te) à la culpabilité ou à l'empathie", lowDescriptor: "prudent(e), empathique et soucieux(se) des autres" },
  },
  items: {
    M1: "Il est sage de garder en réserve certaines informations sur soi pour quand elles seront utiles.", M2: "Je suis prêt(e) à orienter une situation pour obtenir le résultat que je veux.", M3: "On peut convaincre presque tout le monde avec la bonne approche — et j'en joue.", M4: "Je préfère agir en coulisses plutôt que d'affronter les gens directement.", M5: "Il est malin d'attendre le bon moment pour rendre la pareille à quelqu'un.", M6: "Je m'assure que mes plans servent mes intérêts, même si je ne l'affiche pas.",
    N1: "Les gens me voient comme un leader naturel — et je suis d'accord.", N2: "J'aime être le centre de l'attention.", N3: "J'ai le sentiment fort d'être spécial(e) ou exceptionnel(le).", N4: "J'aime être admiré(e), et cela me dérange quand je ne le suis pas.", N5: "J'attends une bonne dose de reconnaissance pour ce que je fais.", N6: "Je suis plus capable que la plupart des gens autour de moi.",
    P1: "J'ai tendance à agir sur l'impulsion sans trop me soucier des conséquences.", P2: "La souffrance des autres ne me touche pas facilement.", P3: "J'aime prendre des risques et rechercher des sensations fortes.", P4: "Prendre sa revanche peut être satisfaisant.", P5: "Je me sens rarement coupable, même quand je le devrais probablement.", P6: "Les règles me semblent plutôt des suggestions.",
  },
};

/* ── Jungian 16 Types (typological; type card localized separately via jungTypeStrings) ── */

const JUNG_ES: InstrumentTranslation = {
  name: "Perfilador de tipos junguianos (16 tipos)",
  shortName: "16 Tipos",
  tagline: "Cuatro dicotomías, dieciséis tipos: el mapa junguiano de la mente.",
  description:
    "Basado en la teoría de los tipos psicológicos de Carl Jung y el marco de cuatro dicotomías popularizado por Myers " +
    "y Briggs. Estima tus preferencias en cuatro ejes —Extraversión/Introversión, Sensación/Intuición, Pensamiento/" +
    "Sentimiento, Juicio/Percepción— y las resuelve en uno de dieciséis tipos, con la pila de funciones cognitivas junguianas que lo sustenta.",
  scales: {
    EI: { name: "Extraversión–Introversión", description: "Hacia dónde se dirigen principalmente la atención y la energía.", poles: { low: "Introversión", high: "Extraversión" }, highDescriptor: "hacia fuera, hacia la gente y la acción", lowDescriptor: "hacia dentro, hacia la reflexión y la profundidad" },
    SN: { name: "Sensación–Intuición", description: "Cómo se capta y en qué se confía la información.", poles: { low: "Sensación", high: "Intuición" }, highDescriptor: "patrones abstractos y posibilidad futura", lowDescriptor: "hechos concretos y realidad presente" },
    TF: { name: "Pensamiento–Sentimiento", description: "Cómo se sopesan y toman las decisiones.", poles: { low: "Pensamiento", high: "Sentimiento" }, highDescriptor: "valores, empatía e impacto humano", lowDescriptor: "lógica imparcial y principio objetivo" },
    JP: { name: "Juicio–Percepción", description: "Cómo se aborda el mundo exterior.", poles: { low: "Percepción", high: "Juicio" }, highDescriptor: "planificado, decidido y estructurado", lowDescriptor: "abierto, flexible y espontáneo" },
  },
  items: {
    EI1: "Conocer gente nueva tiende a darme más energía que a quitármela.", EI2: "Pienso en voz alta, desarrollando las ideas al comentarlas con otros.", EI3: "En un grupo animado, suelo ser de los más habladores.", EI4: "Busco activamente eventos sociales para recargarme tras una temporada ajetreada.", EI5: "Después de socializar mucho, necesito soledad para volver a sentirme yo.", EI6: "Pienso mejor en silencio y a solas antes de compartirlo.", EI7: "Prefiero unas pocas amistades profundas a un amplio círculo de conocidos.", EI8: "Las reuniones grandes a menudo me dejan agotado/a en lugar de con energía.",
    SN1: "Me atraen las ideas abstractas, los patrones y lo que las cosas podrían llegar a ser.", SN2: "A menudo noto conexiones y significados que no son evidentes a primera vista.", SN3: "Disfruto más imaginando posibilidades futuras que gestionando los detalles del presente.", SN4: "Confío en las teorías y las corazonadas casi tanto como en los hechos.", SN5: "Me centro en los hechos concretos y en lo que tengo realmente delante.", SN6: "Confío más en la experiencia directa que en la especulación sobre posibilidades.", SN7: "Prefiero instrucciones prácticas paso a paso a los conceptos abiertos.", SN8: "Tiendo a fijarme en detalles sensoriales concretos que otros pasan por alto.",
    TF1: "Al decidir, sopeso cómo se verá afectada la gente tanto como la lógica.", TF2: "Mantener la armonía en un grupo me importa muchísimo.", TF3: "Mis valores personales y mi empatía guían cómo juzgo una situación.", TF4: "Me resulta fácil sentir lo que siente otra persona.", TF5: "Prefiero decidir con lógica imparcial, aunque hiera algunos sentimientos.", TF6: "Valoro ser sincero/a y coherente por encima de ser diplomático/a.", TF7: "Tiendo a analizar los problemas con objetividad, dejando la emoción a un lado.", TF8: "La justicia según un principio claro me importa más que la comodidad de todos.",
    JP1: "Me gusta planificar con antelación y cerrar las decisiones mucho antes del plazo.", JP2: "Me siento más tranquilo/a cuando mi día sigue un horario organizado.", JP3: "Prefiero los asuntos decididos y cerrados a dejarlos abiertos.", JP4: "Hago listas y disfruto tachando tareas en orden.", JP5: "Prefiero mantener mis opciones abiertas que comprometerme con un plan fijo.", JP6: "Trabajo mejor en arranques espontáneos que con un esfuerzo constante y programado.", JP7: "La flexibilidad de última hora me va mejor que una rutina fija.", JP8: "A menudo empiezo algo nuevo antes de haber terminado lo anterior.",
  },
};

const JUNG_FR: InstrumentTranslation = {
  name: "Profileur de types jungiens (16 types)",
  shortName: "16 Types",
  tagline: "Quatre dichotomies, seize types — la carte jungienne de l'esprit.",
  description:
    "Fondé sur la théorie des types psychologiques de Carl Jung et le cadre des quatre dichotomies popularisé par Myers " +
    "et Briggs. Il estime vos préférences sur quatre axes — Extraversion/Introversion, Sensation/Intuition, Pensée/" +
    "Sentiment, Jugement/Perception — et les résout en l'un des seize types, avec la pile de fonctions cognitives jungiennes qui le sous-tend.",
  scales: {
    EI: { name: "Extraversion–Introversion", description: "Vers où l'attention et l'énergie sont principalement dirigées.", poles: { low: "Introversion", high: "Extraversion" }, highDescriptor: "vers l'extérieur, vers les gens et l'action", lowDescriptor: "vers l'intérieur, vers la réflexion et la profondeur" },
    SN: { name: "Sensation–Intuition", description: "Comment l'information est captée et à quoi on se fie.", poles: { low: "Sensation", high: "Intuition" }, highDescriptor: "des schémas abstraits et la possibilité future", lowDescriptor: "des faits concrets et la réalité présente" },
    TF: { name: "Pensée–Sentiment", description: "Comment les décisions sont pesées et prises.", poles: { low: "Pensée", high: "Sentiment" }, highDescriptor: "les valeurs, l'empathie et l'impact humain", lowDescriptor: "la logique impartiale et le principe objectif" },
    JP: { name: "Jugement–Perception", description: "Comment le monde extérieur est abordé.", poles: { low: "Perception", high: "Jugement" }, highDescriptor: "planifié, décidé et structuré", lowDescriptor: "ouvert, flexible et spontané" },
  },
  items: {
    EI1: "Rencontrer de nouvelles personnes me donne plutôt de l'énergie que cela ne m'en retire.", EI2: "Je pense à voix haute, en développant mes idées en les discutant avec les autres.", EI3: "Dans un groupe animé, je suis souvent l'un(e) des plus bavard(e)s.", EI4: "Je recherche activement les événements sociaux pour me ressourcer après une période chargée.", EI5: "Après avoir beaucoup socialisé, j'ai besoin de solitude pour me sentir à nouveau moi-même.", EI6: "Je réfléchis le mieux au calme et seul(e) avant de partager.", EI7: "Je préfère quelques amitiés profondes à un large cercle de connaissances.", EI8: "Les grands rassemblements me laissent souvent vidé(e) plutôt que dynamisé(e).",
    SN1: "Je suis attiré(e) par les idées abstraites, les schémas et ce que les choses pourraient devenir.", SN2: "Je remarque souvent des liens et des sens qui ne sont pas évidents en surface.", SN3: "J'aime davantage imaginer des possibilités futures que gérer les détails du présent.", SN4: "Je fais presque autant confiance aux théories et aux intuitions qu'aux faits concrets.", SN5: "Je me concentre sur les faits concrets et sur ce qui est réellement devant moi.", SN6: "Je fais plus confiance à l'expérience directe qu'à la spéculation sur les possibilités.", SN7: "Je préfère des instructions pratiques, étape par étape, aux concepts ouverts.", SN8: "J'ai tendance à remarquer des détails sensoriels précis que d'autres négligent.",
    TF1: "Quand je décide, je pèse autant l'effet sur les gens que la logique.", TF2: "Préserver l'harmonie dans un groupe compte énormément pour moi.", TF3: "Mes valeurs personnelles et mon empathie guident ma façon de juger une situation.", TF4: "Il m'est facile de ressentir ce que ressent une autre personne.", TF5: "Je préfère décider par une logique impartiale, même si cela froisse quelques sensibilités.", TF6: "Je valorise la franchise et la cohérence plus que le tact.", TF7: "J'ai tendance à analyser les problèmes objectivement, en mettant l'émotion de côté.", TF8: "L'équité selon un principe clair compte plus pour moi que le confort de chacun.",
    JP1: "J'aime planifier à l'avance et trancher les décisions bien avant l'échéance.", JP2: "Je me sens plus serein(e) quand ma journée suit un emploi du temps organisé.", JP3: "Je préfère les affaires décidées et closes plutôt que laissées ouvertes.", JP4: "Je fais des listes et j'aime cocher les tâches dans l'ordre.", JP5: "Je préfère garder mes options ouvertes que m'engager dans un plan figé.", JP6: "Je travaille mieux par élans spontanés que par un effort régulier et programmé.", JP7: "La flexibilité de dernière minute me convient mieux qu'une routine fixe.", JP8: "Je commence souvent quelque chose de nouveau avant d'avoir fini le précédent.",
  },
};

/* ── Optimism, Hope, Curiosity (the newly-added emotional/focused instruments) ── */

const OPTIMISM_ES: InstrumentTranslation = {
  name: "Optimismo (orientación vital)",
  shortName: "Optimismo",
  tagline: "¿Esperas lo mejor, te preparas para lo peor, o ambas cosas?",
  description:
    "El optimismo disposicional es la expectativa general de que vienen cosas buenas, y es uno de los predictores más " +
    "fiables de la resiliencia, el afrontamiento y el bienestar. Este perfilador mide el Optimismo y el Pesimismo como " +
    "dos tendencias separables —mucha gente tiene algo de cada una— y plantea ambas como actitudes que puedes cambiar con la práctica, no destinos fijos.",
  scales: {
    OPT: { name: "Optimismo", description: "Expectativa general de que vienen buenos resultados.", poles: { low: "Cauteloso/a", high: "Optimista" }, highDescriptor: "esperando buenos resultados y mirando el lado bueno", lowDescriptor: "prudente y comedido/a sobre lo que viene" },
    PES: { name: "Pesimismo", description: "Expectativa general de que las cosas saldrán mal.", poles: { low: "Esperanzado/a", high: "Pesimista" }, highDescriptor: "preparándote para la decepción y esperando reveses", lowDescriptor: "rara vez anticipando lo peor" },
  },
  items: {
    O1: "En tiempos inciertos, suelo esperar lo mejor.", O2: "En general, soy optimista sobre mi futuro.", O3: "En conjunto, espero que me ocurran más cosas buenas que malas.", O4: "Suelo creer que las cosas saldrán bien al final.", O5: "Cuando empiezo algo nuevo, espero que vaya bien.", O6: "Normalmente encuentro el lado bueno de una situación difícil.",
    P1: "Si algo puede salirme mal, saldrá mal.", P2: "Casi nunca espero que las cosas vayan a mi favor.", P3: "Rara vez cuento con que me pasen cosas buenas.", P4: "Tiendo a prepararme para lo peor.", P5: "Los reveses me hacen dudar de que las cosas mejoren.", P6: "A menudo espero llevarme una decepción.",
  },
};

const OPTIMISM_FR: InstrumentTranslation = {
  name: "Optimisme (orientation de vie)",
  shortName: "Optimisme",
  tagline: "Attendez-vous le meilleur, vous préparez-vous au pire — ou les deux ?",
  description:
    "L'optimisme dispositionnel est l'attente générale que de bonnes choses arrivent, et c'est l'un des prédicteurs les " +
    "plus fiables de la résilience, de l'adaptation et du bien-être. Ce profil mesure l'Optimisme et le Pessimisme comme " +
    "deux tendances distinctes — beaucoup de gens ont un peu des deux — et présente les deux comme des attitudes que l'on peut faire évoluer avec la pratique, non des destins figés.",
  scales: {
    OPT: { name: "Optimisme", description: "Attente générale de bons résultats.", poles: { low: "Prudent(e)", high: "Optimiste" }, highDescriptor: "attendant de bons résultats et voyant le bon côté", lowDescriptor: "mesuré(e) et prudent(e) quant à l'avenir" },
    PES: { name: "Pessimisme", description: "Attente générale que les choses tournent mal.", poles: { low: "Confiant(e)", high: "Pessimiste" }, highDescriptor: "vous préparant à la déception et anticipant les revers", lowDescriptor: "anticipant rarement le pire" },
  },
  items: {
    O1: "En période d'incertitude, je m'attends généralement au meilleur.", O2: "Dans l'ensemble, je suis optimiste quant à mon avenir.", O3: "Globalement, je m'attends à plus de bonnes choses que de mauvaises.", O4: "Je crois généralement que les choses finiront par s'arranger.", O5: "Quand je commence quelque chose de nouveau, je m'attends à ce que ça se passe bien.", O6: "Je trouve généralement le bon côté d'une situation difficile.",
    P1: "Si quelque chose peut mal tourner pour moi, ça tournera mal.", P2: "Je m'attends rarement à ce que les choses aillent dans mon sens.", P3: "Je compte rarement sur de bonnes choses.", P4: "J'ai tendance à me préparer au pire.", P5: "Les revers me font douter que les choses s'améliorent.", P6: "Je m'attends souvent à être déçu(e).",
  },
};

const HOPE_ES: InstrumentTranslation = {
  name: "Esperanza (agencia y rutas)",
  shortName: "Esperanza",
  tagline: "La voluntad y el camino: dos mitades de cómo persigues tus metas.",
  description:
    "En el modelo de Snyder, la esperanza no es un sentimiento ilusorio, sino una forma de pensar sobre las metas. Tiene " +
    "dos motores: la AGENCIA, el impulso y la fuerza de voluntad para perseguir lo que quieres, y las RUTAS, la habilidad " +
    "para encontrar caminos hacia ello. La esperanza fuerte necesita ambas. Este perfilador muestra el equilibrio entre tu voluntad y tu camino, y ambas mitades crecen con la práctica.",
  scales: {
    AGENCY: { name: "Agencia (la voluntad)", description: "Energía y determinación dirigidas a metas.", poles: { low: "Poco impulso", high: "Decidido/a" }, highDescriptor: "con impulso y persistencia hacia tus metas", lowDescriptor: "con menos impulso hacia las metas ahora mismo" },
    PATHWAYS: { name: "Rutas (el camino)", description: "Capacidad de generar caminos hacia tus metas.", poles: { low: "Pocas rutas", high: "Ingenioso/a" }, highDescriptor: "ingenioso/a para encontrar rodeos a los obstáculos", lowDescriptor: "con menos rutas a tus metas a mano" },
  },
  items: {
    A1: "Persigo con energía las metas que me propongo.", A2: "Aun desanimado/a, sigo avanzando hacia lo que quiero.", A3: "Me siento impulsado/a a cumplir las metas que me importan.", A4: "Mis experiencias pasadas me dan confianza para el futuro.", A5: "Suelo encontrar la motivación para seguir con una meta.", A6: "Una vez que me comprometo con una meta, la llevo a cabo.",
    W1: "Se me ocurren muchas maneras de alcanzar mis metas.", W2: "Cuando me atasco, encuentro la forma de rodear el obstáculo.", W3: "Hay muchas formas de rodear cualquier problema.", W4: "Normalmente encuentro varias rutas hacia lo que quiero.", W5: "Cuando un enfoque falla, ideo otro.", W6: "Soy ingenioso/a para encontrar caminos hacia mis metas.",
  },
};

const HOPE_FR: InstrumentTranslation = {
  name: "Espoir (volonté et chemins)",
  shortName: "Espoir",
  tagline: "La volonté et le chemin — deux moitiés de votre poursuite des objectifs.",
  description:
    "Dans le modèle de Snyder, l'espoir n'est pas un vœu pieux, mais une manière de penser les objectifs. Il a deux " +
    "moteurs : l'AGENTIVITÉ, l'élan et la volonté de poursuivre ce que vous voulez, et les CHEMINS, l'art de trouver des " +
    "voies pour y parvenir. Un espoir fort a besoin des deux. Ce profil montre l'équilibre entre votre volonté et votre chemin, et les deux moitiés grandissent avec la pratique.",
  scales: {
    AGENCY: { name: "Agentivité (la volonté)", description: "Énergie et détermination orientées vers les buts.", poles: { low: "Peu d'élan", high: "Déterminé(e)" }, highDescriptor: "porté(e) et persévérant(e) vers vos objectifs", lowDescriptor: "avec moins d'élan vers les objectifs en ce moment" },
    PATHWAYS: { name: "Chemins (la voie)", description: "Capacité à générer des voies vers vos buts.", poles: { low: "Peu de voies", high: "Ingénieux(se)" }, highDescriptor: "ingénieux(se) pour contourner les obstacles", lowDescriptor: "avec moins de voies vers vos buts qui viennent à l'esprit" },
  },
  items: {
    A1: "Je poursuis avec énergie les objectifs que je me fixe.", A2: "Même découragé(e), je continue vers ce que je veux.", A3: "Je me sens poussé(e) à atteindre les objectifs qui comptent pour moi.", A4: "Mes expériences passées me donnent confiance pour l'avenir.", A5: "Je trouve généralement la motivation de persévérer vers un but.", A6: "Une fois engagé(e) dans un objectif, je le mène à bien.",
    W1: "Je peux imaginer de nombreuses façons d'atteindre mes objectifs.", W2: "Quand je suis bloqué(e), je trouve un moyen de contourner l'obstacle.", W3: "Il y a beaucoup de façons de contourner n'importe quel problème.", W4: "Je trouve généralement plusieurs voies vers ce que je veux.", W5: "Quand une approche échoue, j'en imagine une autre.", W6: "Je suis ingénieux(se) pour trouver des chemins vers mes objectifs.",
  },
};

const CURIOSITY_ES: InstrumentTranslation = {
  name: "Curiosidad y exploración",
  shortName: "Curiosidad",
  tagline: "Con qué fuerza buscas lo nuevo y con qué facilidad abrazas lo desconocido.",
  description:
    "La curiosidad como rasgo tiene dos caras: el IMPULSO EXPLORADOR —el apetito por nuevos conocimientos, habilidades y " +
    "experiencias— y la APERTURA —la disposición a inclinarte hacia la novedad, la incertidumbre y lo impredecible—. " +
    "Juntas alimentan el aprendizaje, la creatividad y un sentido más rico. Este perfilador muestra con qué fuerza corre cada una en ti y dónde podría crecer tu curiosidad.",
  scales: {
    STRETCH: { name: "Impulso explorador", description: "Búsqueda activa de nuevos conocimientos y experiencias.", poles: { low: "Asentado/a", high: "Buscador/a" }, highDescriptor: "ávido/a de nuevos conocimientos, habilidades y experiencias", lowDescriptor: "a gusto con lo familiar y conocido" },
    EMBRACE: { name: "Apertura", description: "Acoger la novedad, la ambigüedad y lo impredecible.", poles: { low: "Prefiere la certeza", high: "Abraza la novedad" }, highDescriptor: "estimulado/a por la incertidumbre y lo desconocido", lowDescriptor: "prefiriendo la previsibilidad y la certeza" },
  },
  items: {
    S1: "Busco activamente nuevas experiencias e información.", S2: "Me encanta explorar temas de los que sé poco.", S3: "Soy de los que salen a buscar novedad.", S4: "Vaya donde vaya, estoy atento/a a cosas nuevas que aprender.", S5: "Aprender sobre temas desconocidos me da energía.", S6: "Busco a propósito desafíos que me exijan.",
    E1: "Disfruto de la incertidumbre y lo impredecible.", E2: "Me siento cómodo/a sin saber cómo saldrán las cosas.", E3: "Las situaciones desconocidas me emocionan más que me inquietan.", E4: "Doy la bienvenida a las sorpresas y la ambigüedad.", E5: "Prefiero enfrentarme a algo nuevo que quedarme con lo conocido.", E6: "Las personas e ideas impredecibles me intrigan.",
  },
};

const CURIOSITY_FR: InstrumentTranslation = {
  name: "Curiosité et exploration",
  shortName: "Curiosité",
  tagline: "Avec quelle force vous cherchez le nouveau — et quelle aisance vous accueillez l'inconnu.",
  description:
    "La curiosité comme trait a deux faces : l'ÉLAN EXPLORATOIRE — l'appétit pour de nouvelles connaissances, compétences " +
    "et expériences — et l'OUVERTURE — la disposition à se pencher vers la nouveauté, l'incertitude et l'imprévisible. " +
    "Ensemble, elles nourrissent l'apprentissage, la créativité et un sens plus riche. Ce profil montre la force de chacune en vous et où votre curiosité pourrait grandir.",
  scales: {
    STRETCH: { name: "Élan exploratoire", description: "Recherche active de nouvelles connaissances et expériences.", poles: { low: "Posé(e)", high: "Chercheur(se)" }, highDescriptor: "avide de nouvelles connaissances, compétences et expériences", lowDescriptor: "à l'aise avec le familier et le connu" },
    EMBRACE: { name: "Ouverture", description: "Accueillir la nouveauté, l'ambiguïté et l'imprévisible.", poles: { low: "Préfère la certitude", high: "Accueille la nouveauté" }, highDescriptor: "stimulé(e) par l'incertitude et l'inconnu", lowDescriptor: "préférant la prévisibilité et la certitude" },
  },
  items: {
    S1: "Je recherche activement de nouvelles expériences et informations.", S2: "J'adore explorer des sujets que je connais peu.", S3: "Je suis du genre à partir en quête de nouveauté.", S4: "Où que j'aille, je guette de nouvelles choses à apprendre.", S5: "Apprendre sur des sujets inconnus me dynamise.", S6: "Je recherche exprès des défis qui me poussent.",
    E1: "J'aime l'incertitude et l'imprévisible.", E2: "Je suis à l'aise sans savoir comment les choses vont tourner.", E3: "Les situations inconnues m'enthousiasment plus qu'elles ne m'inquiètent.", E4: "J'accueille les surprises et l'ambiguïté.", E5: "Je préfère affronter du nouveau que rester dans le familier.", E6: "Les personnes et idées imprévisibles m'intriguent.",
  },
};

const PROCRAST_ES: InstrumentTranslation = {
  name: "Procrastinación", shortName: "Procrastinación",
  tagline: "Cuánto aplazas lo que importa, y lo que te cuesta.",
  description: "La procrastinación no es pereza; es una ruptura entre la intención y la acción, casi siempre guiada por cómo nos hace sentir una tarea ahora mismo. Es uno de los predictores más fiables de metas incumplidas y estrés añadido y, por suerte, de los más modificables con las tácticas adecuadas. Esto te da una lectura honesta de tu tendencia a aplazar como punto de partida.",
  scales: { PROC: { name: "Procrastinación", description: "Tendencia a aplazar de forma voluntaria la acción prevista aunque se espere salir perjudicado.", poles: { low: "Puntual", high: "Postergador/a" }, highDescriptor: "propenso/a a aplazar tareas y decisiones, a menudo con un coste", lowDescriptor: "rápido/a y fiable para empezar y terminar" } },
  items: {
    P1: "Aplazo las tareas hasta justo antes de la fecha límite.",
    P2: "«Lo haré mañana» es una frase que uso mucho.",
    P3: "Pospongo empezar las cosas aunque sé que no debería.",
    P4: "Pierdo el tiempo en cosas triviales cuando tengo algo importante que hacer.",
    P5: "A menudo acabo apurado porque dejé las cosas para demasiado tarde.",
    P6: "Cuando planeo empezar, suelo empezar a tiempo.",
    P7: "Termino las tareas bastante antes de su fecha.",
    P8: "Incluso las tareas desagradables las abordo sin mucha demora.",
    P9: "Me digo que empezaré pronto, y luego sigo sin empezar.",
    P10: "Mis demoras acaban costándome tiempo, dinero o estrés.",
    P11: "Se me da bien cumplir lo que programo.",
    P12: "Sigo posponiendo decisiones que podría tomar ahora.",
  },
};
const PROCRAST_FR: InstrumentTranslation = {
  name: "Procrastination", shortName: "Procrastination",
  tagline: "À quel point vous remettez ce qui compte — et ce que cela coûte.",
  description: "La procrastination n'est pas de la paresse ; c'est une rupture entre l'intention et l'action, le plus souvent dictée par ce qu'une tâche nous fait ressentir sur le moment. C'est l'un des prédicteurs les plus fiables d'objectifs manqués et de stress supplémentaire — et, heureusement, l'un des plus modifiables avec les bonnes tactiques. Voici une lecture honnête de votre tendance à remettre, comme point de départ.",
  scales: { PROC: { name: "Procrastination", description: "Tendance à différer volontairement l'action prévue alors qu'on s'attend à y perdre.", poles: { low: "Ponctuel(le)", high: "Procrastinateur(trice)" }, highDescriptor: "enclin(e) à remettre tâches et décisions, souvent à un coût", lowDescriptor: "prompt(e) et fiable pour commencer et finir" } },
  items: {
    P1: "Je remets les tâches à juste avant l'échéance.",
    P2: "« Je le ferai demain » est une phrase que j'emploie souvent.",
    P3: "Je repousse le démarrage même quand je sais que je ne devrais pas.",
    P4: "Je perds du temps sur des broutilles quand j'ai quelque chose d'important à faire.",
    P5: "Je me retrouve souvent à courir parce que je m'y suis pris trop tard.",
    P6: "Quand je prévois de commencer, je commence généralement à l'heure.",
    P7: "Je termine mes tâches bien avant l'échéance.",
    P8: "Même les tâches désagréables, je les attaque sans trop tarder.",
    P9: "Je me dis que je vais bientôt commencer, puis je continue à ne pas le faire.",
    P10: "Mes retards finissent par me coûter du temps, de l'argent ou du stress.",
    P11: "Je suis doué(e) pour mener à bien ce que je planifie.",
    P12: "Je continue de reporter des décisions que je pourrais prendre maintenant.",
  },
};

const PERFECT_ES: InstrumentTranslation = {
  name: "Perfeccionismo", shortName: "Perfeccionismo",
  tagline: "Estándares altos que te impulsan, o miedo a fallar que te pesa.",
  description: "El perfeccionismo son dos cosas con un mismo nombre. Buscar estándares personales altos puede alimentar la maestría y el orgullo; pero la preocupación corrosiva por los errores —autocrítica dura, miedo a no dar la talla— predice ansiedad, agotamiento y procrastinación. Este perfilador mide ambas para que conserves el motor y aflojes el freno.",
  scales: {
    STAND: { name: "Altos estándares", description: "Esfuerzo por alcanzar estándares personales exigentes y la excelencia.", poles: { low: "Relajado/a", high: "Exigente" }, highDescriptor: "movido/a por estándares exigentes y una atracción por la excelencia", lowDescriptor: "relajado/a con los estándares, conforme con lo «suficientemente bueno»" },
    CONC: { name: "Preocupación por los errores", description: "Inquietud autocrítica por los errores y el juicio ajeno.", poles: { low: "Autocompasivo/a", high: "Autocrítico/a" }, highDescriptor: "autocrítico/a, reacio/a al error y abrumado/a por el miedo a no dar la talla", lowDescriptor: "indulgente con tus errores y despreocupado/a por la imperfección" },
  },
  items: {
    S1: "Me fijo estándares muy altos a mí mismo/a.",
    S2: "No quedo satisfecho/a con un trabajo a menos que sea excelente.",
    S3: "Aspiro a lo mejor en casi todo lo que hago.",
    S4: "Tengo un fuerte impulso por seguir mejorando.",
    S5: "Hacer algo bien me importa muchísimo.",
    C1: "Mis errores me persiguen mucho después de cometerlos.",
    C2: "Si no llego a la perfección, me siento un/a fracasado/a.",
    C3: "Me preocupa mucho que los demás juzguen mis defectos.",
    C4: "Los pequeños errores me hacen dudar de todo mi esfuerzo.",
    C5: "Rara vez quedo satisfecho/a, por bien que lo haya hecho.",
    C6: "El miedo a no ser suficiente me frena.",
  },
};
const PERFECT_FR: InstrumentTranslation = {
  name: "Perfectionnisme", shortName: "Perfectionnisme",
  tagline: "Des exigences élevées qui vous portent — ou la peur d'échouer qui vous pèse.",
  description: "Le perfectionnisme, c'est deux choses sous un même nom. Viser des exigences personnelles élevées peut nourrir la maîtrise et la fierté ; mais l'inquiétude corrosive face aux erreurs — autocritique sévère, peur de ne pas être à la hauteur — prédit l'anxiété, l'épuisement et la procrastination. Ce profileur mesure les deux pour que vous gardiez le moteur et relâchiez le frein.",
  scales: {
    STAND: { name: "Exigences élevées", description: "Tendre vers des standards personnels exigeants et l'excellence.", poles: { low: "Décontracté(e)", high: "Exigeant(e)" }, highDescriptor: "porté(e) par des standards exigeants et un attrait pour l'excellence", lowDescriptor: "détendu(e) sur les standards, à l'aise avec « assez bien »" },
    CONC: { name: "Peur de l'erreur", description: "Inquiétude autocritique face aux erreurs et au jugement d'autrui.", poles: { low: "Bienveillant(e) envers soi", high: "Autocritique" }, highDescriptor: "autocritique, allergique à l'erreur et accablé(e) par la peur de ne pas être à la hauteur", lowDescriptor: "indulgent(e) envers vos erreurs et serein(e) face à l'imperfection" },
  },
  items: {
    S1: "Je me fixe des exigences très élevées.",
    S2: "Je ne suis pas satisfait(e) d'un travail s'il n'est pas excellent.",
    S3: "Je vise le meilleur dans presque tout ce que je fais.",
    S4: "J'ai une forte envie de continuer à m'améliorer.",
    S5: "Bien faire les choses compte énormément pour moi.",
    C1: "Mes erreurs me hantent longtemps après coup.",
    C2: "Si je n'atteins pas la perfection, je me sens en échec.",
    C3: "Je m'inquiète beaucoup du jugement des autres sur mes défauts.",
    C4: "De petites erreurs me font douter de tout mon effort.",
    C5: "Je suis rarement satisfait(e), même quand j'ai bien fait.",
    C6: "La peur de ne pas être à la hauteur me retient.",
  },
};

const GRATITUDE_ES: InstrumentTranslation = {
  name: "Gratitud", shortName: "Gratitud",
  tagline: "Con qué facilidad notas y agradeces lo bueno.",
  description: "La gratitud es el hábito de notar lo bueno y sentirse agradecido por ello, y es uno de los ingredientes más fiables y entrenables de una vida feliz. Quien tiene más gratitud reporta más emoción positiva, vínculos más fuertes y mayor resiliencia. Esta es una mirada cálida a tu disposición agradecida y una base desde la que crecer.",
  scales: { GRAT: { name: "Gratitud", description: "Disposición a notar, apreciar y agradecer lo bueno de la vida.", poles: { low: "Reservado/a", high: "Agradecido/a" }, highDescriptor: "rápido/a en notar lo bueno y sentir gratitud genuina", lowDescriptor: "menos inclinado/a a detenerte en lo que agradeces" } },
  items: {
    G1: "Tengo mucho que agradecer en la vida.",
    G2: "Si enumerara todo lo que agradezco, sería una lista muy larga.",
    G3: "Estoy agradecido/a a una gran variedad de personas.",
    G4: "A medida que crezco, aprecio más a las personas y las cosas de mi vida.",
    G5: "A menudo noto y saboreo los pequeños buenos momentos.",
    G6: "Pasan largas temporadas sin que sienta gratitud por nada.",
    G7: "Me cuesta sentirme agradecido/a por lo que tengo.",
  },
};
const GRATITUDE_FR: InstrumentTranslation = {
  name: "Gratitude", shortName: "Gratitude",
  tagline: "Avec quelle facilité vous remarquez et appréciez le bon.",
  description: "La gratitude est l'habitude de remarquer ce qui est bon et de s'en sentir reconnaissant — et c'est l'un des ingrédients les plus fiables et les plus exerçables d'une vie heureuse. Les personnes plus reconnaissantes rapportent plus d'émotions positives, des liens plus forts et une plus grande résilience. Voici un aperçu chaleureux de votre disposition à la gratitude, et une base à faire grandir.",
  scales: { GRAT: { name: "Gratitude", description: "Disposition à remarquer, apprécier et être reconnaissant du bon dans la vie.", poles: { low: "Réservé(e)", high: "Reconnaissant(e)" }, highDescriptor: "prompt(e) à remarquer le bon et à ressentir une vraie reconnaissance", lowDescriptor: "moins enclin(e) à vous attarder sur ce dont vous êtes reconnaissant(e)" } },
  items: {
    G1: "J'ai tellement de raisons d'être reconnaissant(e) dans la vie.",
    G2: "Si je listais tout ce dont je suis reconnaissant(e), ce serait une longue liste.",
    G3: "Je suis reconnaissant(e) envers une grande diversité de personnes.",
    G4: "En vieillissant, j'apprécie davantage les personnes et les choses de ma vie.",
    G5: "Je remarque et savoure souvent les petits bons moments.",
    G6: "De longues périodes passent sans que je ressente de gratitude pour quoi que ce soit.",
    G7: "J'ai du mal à me sentir reconnaissant(e) pour ce que j'ai.",
  },
};

const SELFEFF_ES: InstrumentTranslation = {
  name: "Autoeficacia", shortName: "Autoeficacia",
  tagline: "Tu creencia central de que puedes con lo que venga.",
  description: "La autoeficacia es la confianza en que podrás movilizar el esfuerzo y las estrategias para afrontar un reto, y décadas de investigación la convierten en uno de los predictores más potentes de la persistencia, la resiliencia y lo que la gente realmente logra. Es una lectura clara de tu sentido general de agencia y, como la eficacia se construye con experiencias de logro, también sirve de base para crecer.",
  scales: { GSE: { name: "Autoeficacia general", description: "Creencia en tu capacidad de afrontar retos y alcanzar metas.", poles: { low: "Insegura", high: "Segura" }, highDescriptor: "seguro/a, con sentido de agencia y sin amilanarte ante nuevos retos", lowDescriptor: "propenso/a a dudar de tu capacidad para afrontar lo que viene" } },
  items: {
    E1: "Suelo resolver problemas difíciles si me esfuerzo lo suficiente.",
    E2: "Cuando topo con un obstáculo, encuentro la manera de conseguir lo que necesito.",
    E3: "Me resulta fácil mantener mis propósitos y cumplir mis metas.",
    E4: "Confío en que sabría manejar con eficacia los imprevistos.",
    E5: "Gracias a mi ingenio, sé manejar situaciones inesperadas.",
    E6: "Puedo resolver la mayoría de los problemas si invierto el esfuerzo necesario.",
    E7: "Puedo mantener la calma ante las dificultades porque confío en mi capacidad de afrontarlas.",
    E8: "Cuando surge un problema, suelo encontrar varias formas de abordarlo.",
    E9: "Si estoy en apuros, normalmente se me ocurre una salida.",
    E10: "Venga lo que venga, suelo ser capaz de manejarlo.",
  },
};
const SELFEFF_FR: InstrumentTranslation = {
  name: "Sentiment d'efficacité", shortName: "Efficacité",
  tagline: "Votre conviction profonde de pouvoir gérer ce qui vient.",
  description: "Le sentiment d'efficacité personnelle, c'est la confiance de pouvoir mobiliser l'effort et les stratégies pour relever un défi — et des décennies de recherche en font l'un des plus forts prédicteurs de la persévérance, de la résilience et de ce que les gens accomplissent vraiment. Voici une lecture nette de votre sens de l'action ; et comme l'efficacité se bâtit par les expériences de maîtrise, c'est aussi une base à faire grandir.",
  scales: { GSE: { name: "Efficacité personnelle générale", description: "Croyance en votre capacité à relever les défis et atteindre vos objectifs.", poles: { low: "Hésitant(e)", high: "Assuré(e)" }, highDescriptor: "confiant(e), acteur(trice) de votre vie et non décontenancé(e) par les nouveaux défis", lowDescriptor: "enclin(e) à douter de votre capacité à gérer ce qui vient" } },
  items: {
    E1: "J'arrive en général à résoudre les problèmes difficiles si je m'y emploie.",
    E2: "Quand je heurte un obstacle, je trouve le moyen d'obtenir ce qu'il me faut.",
    E3: "Il m'est facile de tenir mes intentions et de mener mes objectifs à terme.",
    E4: "Je suis confiant(e) de pouvoir gérer efficacement les imprévus.",
    E5: "Grâce à ma débrouillardise, je sais gérer les situations imprévues.",
    E6: "Je peux résoudre la plupart des problèmes si j'investis l'effort nécessaire.",
    E7: "Je peux rester calme face aux difficultés car je me fie à ma capacité d'y faire face.",
    E8: "Quand un problème surgit, je trouve souvent plusieurs façons de l'aborder.",
    E9: "Si je suis en difficulté, je trouve généralement une issue.",
    E10: "Quoi qu'il arrive, je suis généralement capable de le gérer.",
  },
};

const EMOREG_ES: InstrumentTranslation = {
  name: "Regulación emocional", shortName: "Reg. emocional",
  tagline: "Cómo manejas las emociones: reencuadrándolas o conteniéndolas.",
  description: "Dos personas pueden sentir la misma emoción y vivirla de forma muy distinta según cómo la manejen. Este perfilador mapea dos estrategias del influyente modelo de James Gross: la reevaluación cognitiva (cambiar cómo piensas una situación para cambiar cómo se siente) y la supresión expresiva (ocultar las señales externas). La reevaluación suele favorecer el bienestar; la supresión tiene costes ocultos, pero ambas son habilidades que puedes reequilibrar con práctica.",
  scales: {
    REAP: { name: "Reevaluación cognitiva", description: "Reencuadrar una situación para cambiar su impacto emocional.", poles: { low: "Rara vez reencuadra", high: "Reencuadra con facilidad" }, highDescriptor: "hábil para reencuadrar situaciones y guiar tus propias emociones", lowDescriptor: "menos inclinado/a a reencuadrar para atravesar las emociones" },
    SUPP: { name: "Supresión expresiva", description: "Inhibir la expresión externa de la emoción.", poles: { low: "Expresivo/a", high: "Se lo guarda" }, highDescriptor: "inclinado/a a guardarte lo que sientes en vez de mostrarlo", lowDescriptor: "expresivo/a y abierto/a con lo que sientes" },
  },
  items: {
    R1: "Cuando quiero sentirme menos alterado/a, replanteo cómo estoy viendo la situación.",
    R2: "Controlo mis emociones cambiando mi forma de pensar lo que ocurre.",
    R3: "Cuando quiero sentirme más positivo/a, reencuadro la situación a propósito.",
    R4: "Cuando estoy estresado/a, intento pensarlo de un modo que me mantenga en calma.",
    R5: "Encuentro nuevos ángulos en una situación difícil para cambiar cómo me hace sentir.",
    R6: "Cuando quiero sentirme menos negativo/a, cambio lo que el suceso significa para mí.",
    S1: "Me guardo mis emociones en vez de mostrarlas.",
    S2: "Cuando siento algo con fuerza, procuro que no se note.",
    S3: "Controlo mis emociones no expresándolas.",
    S4: "Aun molesto/a, mantengo una cara neutra para que nadie lo note.",
  },
};
const EMOREG_FR: InstrumentTranslation = {
  name: "Régulation émotionnelle", shortName: "Régul. émo.",
  tagline: "Comment vous pilotez vos émotions : en les recadrant, ou en les contenant.",
  description: "Deux personnes peuvent ressentir la même émotion et la vivre très différemment selon la façon dont elles la gèrent. Ce profileur cartographie deux stratégies du modèle influent de James Gross : la réévaluation cognitive (changer sa façon de penser une situation pour en changer le ressenti) et la suppression expressive (cacher les signes extérieurs). La réévaluation favorise plutôt le bien-être ; la suppression a des coûts cachés — mais les deux sont des compétences que l'on peut rééquilibrer.",
  scales: {
    REAP: { name: "Réévaluation cognitive", description: "Recadrer une situation pour changer son impact émotionnel.", poles: { low: "Recadre rarement", high: "Recadre aisément" }, highDescriptor: "habile à recadrer les situations pour orienter vos propres émotions", lowDescriptor: "moins enclin(e) à recadrer pour traverser vos émotions" },
    SUPP: { name: "Suppression expressive", description: "Inhiber l'expression extérieure de l'émotion.", poles: { low: "Expressif(ve)", high: "Garde pour soi" }, highDescriptor: "enclin(e) à garder vos émotions plutôt qu'à les montrer", lowDescriptor: "expressif(ve) et ouvert(e) sur ce que vous ressentez" },
  },
  items: {
    R1: "Quand je veux être moins contrarié(e), je repense ma façon de voir la situation.",
    R2: "Je contrôle mes émotions en changeant ma façon de penser ce qui arrive.",
    R3: "Quand je veux me sentir plus positif(ve), je recadre la situation exprès.",
    R4: "Quand je suis stressé(e), j'essaie d'y penser d'une manière qui me garde calme.",
    R5: "Je trouve de nouveaux angles à une situation difficile pour changer ce qu'elle me fait ressentir.",
    R6: "Quand je veux être moins négatif(ve), je change ce que l'événement signifie pour moi.",
    S1: "Je garde mes émotions pour moi plutôt que de les montrer.",
    S2: "Quand je ressens quelque chose fortement, je veille à ne pas le laisser paraître.",
    S3: "Je contrôle mes émotions en ne les exprimant pas.",
    S4: "Même contrarié(e), je garde un visage neutre pour que personne ne le devine.",
  },
};

const SELFCTRL_ES: InstrumentTranslation = {
  name: "Autocontrol", shortName: "Autocontrol",
  tagline: "Resistir el tirón del momento y cumplir con lo que importa.",
  description: "El autocontrol —la capacidad de anular un impulso y dirigir tu conducta hacia lo que de verdad importa— predice las notas, la salud, el ahorro y la calidad de las relaciones mejor que casi cualquier otro rasgo. Esta escala breve y muy validada lo mide en dos caras: frenar los impulsos y mantener el rumbo. Y es entrenable: en gran parte es estructura y hábitos, no pura fuerza de voluntad.",
  scales: {
    RESTRAINT: { name: "Control de impulsos", description: "Capacidad de resistir la tentación y frenar el impulso.", poles: { low: "Impulsivo/a", high: "Contenido/a" }, highDescriptor: "capaz de resistir la tentación y pensar antes de actuar", lowDescriptor: "espontáneo/a y propenso/a a actuar por impulso" },
    DISCIPLINE: { name: "Autodisciplina", description: "Constancia, seguimiento y rumbo hacia las metas.", poles: { low: "Laxo/a", high: "Disciplinado/a" }, highDescriptor: "constante, fiable y capaz de terminar lo que empieza", lowDescriptor: "le cuesta seguir rutinas y llevar las tareas hasta el final" },
  },
  items: {
    R1: "Se me da bien resistir la tentación.",
    R2: "Cuando me tienta algo que no debería, suelo poder decir que no.",
    R3: "Mantengo mis impulsos bien controlados.",
    R4: "A menudo actúo por impulso sin pensarlo bien.",
    R5: "Me cuesta romper los malos hábitos.",
    R6: "Hago cosas de las que luego me arrepiento porque no pude contenerme.",
    R7: "El placer y la diversión a veces me impiden sacar el trabajo adelante.",
    D1: "Me quedo con las tareas hasta terminarlas.",
    D2: "Sigo trabajando hacia mis metas incluso cuando es tedioso.",
    D3: "Soy fiable con mis rutinas y compromisos.",
    D4: "Puedo obligarme a hacer cosas que no me apetecen.",
    D5: "A menudo empiezo cosas pero no las termino.",
    D6: "Aplazo las tareas que me resultan aburridas o difíciles.",
    D7: "Ojalá tuviera más autodisciplina.",
  },
};
const SELFCTRL_FR: InstrumentTranslation = {
  name: "Maîtrise de soi", shortName: "Maîtrise de soi",
  tagline: "Résister à l'attrait de l'instant — et tenir bon sur ce qui compte.",
  description: "La maîtrise de soi — la capacité d'inhiber une impulsion et d'orienter sa conduite vers ce qui compte vraiment — prédit les résultats scolaires, la santé, l'épargne et la qualité des relations mieux que presque tout autre trait. Cette échelle brève et solidement validée la mesure sur deux faces : freiner l'impulsion et garder le cap. Et elle se travaille : c'est en grande partie de la structure et des habitudes, pas de la seule volonté.",
  scales: {
    RESTRAINT: { name: "Contrôle des impulsions", description: "Capacité de résister à la tentation et de freiner l'impulsion.", poles: { low: "Impulsif(ve)", high: "Maîtrisé(e)" }, highDescriptor: "capable de résister à la tentation et de réfléchir avant d'agir", lowDescriptor: "spontané(e) et enclin(e) à agir sur l'impulsion" },
    DISCIPLINE: { name: "Autodiscipline", description: "Constance, suivi et cap maintenu vers les objectifs.", poles: { low: "Souple", high: "Discipliné(e)" }, highDescriptor: "constant(e), fiable et capable de finir ce que vous commencez", lowDescriptor: "en peine de tenir des routines et de mener les tâches à terme" },
  },
  items: {
    R1: "Je suis doué(e) pour résister à la tentation.",
    R2: "Quand quelque chose que je ne devrais pas me tente, j'arrive en général à dire non.",
    R3: "Je tiens mes impulsions bien en main.",
    R4: "J'agis souvent sur l'impulsion sans bien y réfléchir.",
    R5: "J'ai du mal à rompre les mauvaises habitudes.",
    R6: "Je fais des choses que je regrette ensuite parce que je n'ai pas pu m'en empêcher.",
    R7: "Le plaisir et l'amusement m'empêchent parfois d'avancer dans mon travail.",
    D1: "Je reste sur mes tâches jusqu'à ce qu'elles soient finies.",
    D2: "Je continue vers mes objectifs même quand c'est fastidieux.",
    D3: "Je suis fiable dans mes routines et mes engagements.",
    D4: "Je peux me forcer à faire des choses dont je n'ai pas envie.",
    D5: "Je commence souvent des choses sans les finir.",
    D6: "Je remets les tâches que je trouve ennuyeuses ou difficiles.",
    D7: "J'aimerais avoir plus d'autodiscipline.",
  },
};

const GRIT_ES: InstrumentTranslation = {
  name: "Determinación (Grit)", shortName: "Determinación",
  tagline: "Pasión y perseverancia por metas a largo plazo, y cómo cultivarla.",
  description: "La determinación es la combinación de perseverancia y pasión sostenida que predice quién alcanza metas a largo plazo, a menudo más que el talento puro. Este perfilador mide sus dos facetas —Perseverancia del esfuerzo y Consistencia del interés— y, como la determinación es maleable, te señala la faceta donde el crecimiento llega más rápido.",
  scales: {
    PERS: { name: "Perseverancia del esfuerzo", description: "Trabajar duro y recuperarse de los reveses.", poles: { low: "Se frena fácil", high: "Perseverante" }, highDescriptor: "trabajador/a, resiliente y capaz de empujar a través de la dificultad", lowDescriptor: "más fácilmente frenado/a por los obstáculos y el cansancio" },
    CONS: { name: "Consistencia del interés", description: "Mantener las mismas metas con el tiempo.", poles: { low: "Cambiante", high: "Constante" }, highDescriptor: "estable y centrado/a en metas a largo plazo", lowDescriptor: "atraído/a por nuevos intereses, con un foco que cambia con el tiempo" },
  },
  items: {
    PE1: "Termino todo lo que empiezo.", PE2: "Los reveses no me desaniman por mucho tiempo; me recupero y sigo.", PE3: "Soy muy trabajador/a.", PE4: "Sigo trabajando con diligencia aunque el avance sea lento.",
    CI1: "Me mantengo enfocado/a en las mismas metas durante años.", CI2: "Mis intereses se mantienen bastante estables de un año a otro.", CI3: "Rara vez abandono un proyecto una vez que me he comprometido de verdad.", CI4: "Las ideas y proyectos nuevos no me apartan fácilmente de los actuales.",
  },
};
const GRIT_FR: InstrumentTranslation = {
  name: "Cran (Grit)", shortName: "Cran",
  tagline: "Passion et persévérance pour des objectifs de long terme — et comment le cultiver.",
  description: "Le cran, c'est la combinaison de persévérance et de passion durable qui prédit qui atteint ses objectifs de long terme, souvent plus que le talent brut. Ce profileur en mesure les deux facettes — Persévérance de l'effort et Constance de l'intérêt — et, comme le cran est malléable, vous indique la facette où la progression vient le plus vite.",
  scales: {
    PERS: { name: "Persévérance de l'effort", description: "Travailler dur et rebondir après les revers.", poles: { low: "Vite ralenti(e)", high: "Persévérant(e)" }, highDescriptor: "travailleur(se), résilient(e) et capable de pousser à travers la difficulté", lowDescriptor: "plus facilement ralenti(e) par les obstacles et la fatigue" },
    CONS: { name: "Constance de l'intérêt", description: "Tenir les mêmes objectifs dans le temps.", poles: { low: "Changeant(e)", high: "Constant(e)" }, highDescriptor: "stable et concentré(e) sur des objectifs de long terme", lowDescriptor: "attiré(e) par de nouveaux intérêts, avec un focus qui change avec le temps" },
  },
  items: {
    PE1: "Je termine tout ce que je commence.", PE2: "Les revers ne me découragent pas longtemps ; je rebondis et je continue.", PE3: "Je suis travailleur(se).", PE4: "Je continue à travailler avec application même quand les progrès sont lents.",
    CI1: "Je reste concentré(e) sur les mêmes objectifs pendant des années.", CI2: "Mes centres d'intérêt restent assez stables d'une année à l'autre.", CI3: "J'abandonne rarement un projet une fois vraiment engagé(e).", CI4: "Les idées et projets nouveaux ne me détournent pas facilement des miens.",
  },
};

const NFC_ES: InstrumentTranslation = {
  name: "Necesidad de cognición", shortName: "Nec. de cognición",
  tagline: "Cuánto disfrutas el trabajo de pensar.",
  description: "La necesidad de cognición es el grado en que buscas y disfrutas el pensamiento que exige esfuerzo. Quien la tiene alta saborea los problemas complejos y sopesa los argumentos con cuidado; quien la tiene baja prefiere atajos cognitivos y tareas concretas. No es inteligencia, es apetito, pero moldea cómo aprendes, decides y resistes (o caes en) la persuasión.",
  scales: { NFC: { name: "Necesidad de cognición", description: "Tendencia a disfrutar y dedicarse al pensamiento esforzado.", poles: { low: "Piensa lo justo", high: "Le encanta pensar" }, highDescriptor: "saboreas la complejidad y el pensamiento profundo", lowDescriptor: "prefieres lo simple, lo concreto y lo eficiente" } },
  items: {
    N1: "Disfruto de verdad abordando problemas complejos y pensándolos a fondo.", N2: "Encuentro verdadera satisfacción en un esfuerzo mental largo y difícil.", N3: "Aprender nuevas formas de pensar me entusiasma.", N4: "Prefiero que mi vida esté llena de enigmas que tenga que resolver.",
    N5: "Pensar mucho no es mi idea de diversión.", N6: "Solo pienso lo justo y necesario.", N7: "Prefiero hacer algo que requiera poco pensamiento que algo desafiante.", N8: "Intento evitar situaciones en las que tenga que pensar en profundidad.",
  },
};
const NFC_FR: InstrumentTranslation = {
  name: "Besoin de cognition", shortName: "Besoin de cognition",
  tagline: "À quel point vous aimez le travail de penser.",
  description: "Le besoin de cognition, c'est le degré auquel vous recherchez et appréciez la pensée qui demande de l'effort. Ceux qui l'ont élevé savourent les problèmes complexes et pèsent soigneusement les arguments ; ceux qui l'ont plus bas préfèrent les raccourcis cognitifs et les tâches concrètes. Ce n'est pas l'intelligence, c'est l'appétit — mais cela façonne votre façon d'apprendre, de décider et de résister (ou non) à la persuasion.",
  scales: { NFC: { name: "Besoin de cognition", description: "Tendance à apprécier et à s'engager dans la pensée exigeante.", poles: { low: "Réfléchit au besoin", high: "Aime réfléchir" }, highDescriptor: "vous savourez la complexité et la pensée profonde", lowDescriptor: "vous préférez le simple, le concret et l'efficace" } },
  items: {
    N1: "J'aime sincèrement m'attaquer aux problèmes complexes et les penser à fond.", N2: "Je trouve une vraie satisfaction dans un effort mental long et exigeant.", N3: "Apprendre de nouvelles façons de penser m'enthousiasme.", N4: "Je préfère que ma vie soit pleine d'énigmes à résoudre.",
    N5: "Réfléchir intensément n'est pas mon idée du plaisir.", N6: "Je ne réfléchis qu'autant qu'il le faut.", N7: "Je préfère faire quelque chose qui demande peu de réflexion plutôt qu'un défi.", N8: "J'essaie d'éviter les situations où je dois réfléchir en profondeur.",
  },
};

const MINDSET_ES: InstrumentTranslation = {
  name: "Mentalidad (Dweck)", shortName: "Mentalidad",
  tagline: "¿Crees que tus capacidades están talladas en piedra, o que crecen?",
  description: "La investigación de Carol Dweck sobre la «mentalidad» plantea una pregunta engañosamente simple: ¿crees que cualidades centrales como la inteligencia y el talento son fijas, o que pueden crecer con esfuerzo, estrategia y ayuda? Una mentalidad de crecimiento se asocia con la resiliencia tras el fracaso y el gusto por el reto. Esta foto muestra hacia dónde te inclinas, y la mentalidad misma es una de las cosas más cambiables de ti.",
  scales: { MIND: { name: "Mentalidad de crecimiento", description: "Creencia de que las capacidades y cualidades pueden desarrollarse.", poles: { low: "Fija", high: "De crecimiento" }, highDescriptor: "ves la capacidad como algo que crece con el esfuerzo y el aprendizaje", lowDescriptor: "ves la capacidad como algo en gran parte fijo e innato" } },
  items: {
    M1: "Las personas pueden cambiar de forma sustancial cuán inteligentes son.", M2: "Seas quien seas, puedes mejorar mucho tus capacidades.", M3: "El talento es solo un punto de partida; el esfuerzo y el aprendizaje lo hacen crecer.", M4: "Puedo cambiar incluso cosas básicas del tipo de persona que soy.",
    M5: "Tu inteligencia es algo muy básico que no puedes cambiar mucho.", M6: "Las personas tienen cierta cantidad de talento y poco pueden hacer para cambiarlo.", M7: "O se te da bien algo o no.", M8: "Las personas no pueden cambiar realmente su carácter esencial.",
  },
};
const MINDSET_FR: InstrumentTranslation = {
  name: "État d'esprit (Dweck)", shortName: "État d'esprit",
  tagline: "Croyez-vous vos capacités gravées dans le marbre — ou cultivables ?",
  description: "Les travaux de Carol Dweck sur l'« état d'esprit » posent une question trompeusement simple : croyez-vous que des qualités centrales comme l'intelligence et le talent sont figées, ou qu'elles peuvent grandir avec l'effort, la stratégie et l'aide ? Un état d'esprit de développement est lié à la résilience après l'échec et au goût du défi. Cet aperçu montre votre penchant — et l'état d'esprit lui-même est l'une des choses les plus modifiables chez vous.",
  scales: { MIND: { name: "État d'esprit de développement", description: "Croyance que les capacités et qualités peuvent se développer.", poles: { low: "Figé", high: "De développement" }, highDescriptor: "vous voyez la capacité comme se cultivant par l'effort et l'apprentissage", lowDescriptor: "vous voyez la capacité comme largement figée et innée" } },
  items: {
    M1: "On peut changer sensiblement son niveau d'intelligence.", M2: "Qui que vous soyez, vous pouvez nettement améliorer vos capacités.", M3: "Le talent n'est qu'un point de départ ; l'effort et l'apprentissage le font grandir.", M4: "Je peux changer même des choses fondamentales de la personne que je suis.",
    M5: "Votre intelligence est quelque chose de très fondamental que l'on ne peut guère changer.", M6: "On a une certaine dose de talent et on ne peut pas y faire grand-chose.", M7: "Soit on est doué pour quelque chose, soit on ne l'est pas.", M8: "On ne peut pas vraiment changer son caractère profond.",
  },
};

const EQ_ES: InstrumentTranslation = {
  name: "Inteligencia emocional", shortName: "Intel. emocional",
  tagline: "El predictor más entrenable de relaciones, liderazgo y bienestar.",
  description: "La inteligencia emocional es la capacidad de reconocer, comprender y manejar las emociones —las tuyas y las de los demás—. Este perfilador estima cinco dominios: Autoconciencia, Autorregulación, Motivación, Empatía y Habilidades sociales. A diferencia del CI, la inteligencia emocional se aprende mucho, así que cada dominio es también una meta de crecimiento.",
  scales: {
    SA: { name: "Autoconciencia", description: "Reconocer tus propias emociones y sus efectos.", poles: { low: "Inconsciente", high: "Consciente de sí" }, highDescriptor: "en sintonía con tus emociones y con cómo te impulsan", lowDescriptor: "menos reflexivo/a sobre tus estados emocionales internos" },
    SR: { name: "Autorregulación", description: "Manejar los impulsos y recuperarse de emociones difíciles.", poles: { low: "Reactivo/a", high: "Sereno/a" }, highDescriptor: "sereno/a, con autocontrol y capaz de recomponerte bajo estrés", lowDescriptor: "más reactivo/a e impulsivo/a cuando las emociones se intensifican" },
    MO: { name: "Motivación", description: "Impulso, optimismo y resiliencia hacia las metas.", poles: { low: "Se desanima fácil", high: "Motivado/a" }, highDescriptor: "motivado/a, optimista y rápido/a para recuperarte", lowDescriptor: "más fácilmente desanimado/a cuando baja la motivación" },
    EM: { name: "Empatía", description: "Percibir y comprender lo que sienten los demás.", poles: { low: "Distante", high: "Empático/a" }, highDescriptor: "perceptivo/a y sintonizado/a con lo que sienten los demás", lowDescriptor: "menos sintonizado/a de forma natural con las emociones ajenas" },
    SS: { name: "Habilidades sociales", description: "Gestionar relaciones, influencia y conflicto.", poles: { low: "Torpe", high: "Hábil" }, highDescriptor: "socialmente hábil, persuasivo/a y bueno/a con el conflicto", lowDescriptor: "menos cómodo/a navegando las dinámicas sociales" },
  },
  items: {
    SA1: "Suelo poder nombrar exactamente qué siento, y por qué.", SA2: "Soy consciente de cómo mis estados de ánimo moldean mi conducta.", SA3: "A menudo me pillan por sorpresa mis propias reacciones emocionales.", SA4: "Conozco bien mis fortalezas emocionales y mis detonantes.",
    SR1: "Puedo mantener la calma y la compostura bajo presión.", SR2: "Cuando me altero, sé calmarme y volver a enfocarme.", SR3: "A menudo digo o hago cosas en el calor del momento de las que luego me arrepiento.", SR4: "Puedo posponer la gratificación para alcanzar una meta mayor.",
    MO1: "Sigo motivado/a hacia mis metas incluso sin recompensas externas.", MO2: "Me recupero rápido de los reveses.", MO3: "Pierdo la motivación en cuanto las cosas se ponen difíciles.", MO4: "Soy optimista en que el esfuerzo acabará dando frutos.",
    EM1: "Puedo percibir cómo se sienten los demás, aunque no lo digan.", EM2: "Sintonizo de verdad con las perspectivas de otras personas.", EM3: "Me cuesta entender por qué la gente se siente como se siente.", EM4: "Capto señales sutiles en el tono y el lenguaje corporal.",
    SS1: "Manejo bien los conflictos y las conversaciones difíciles.", SS2: "Puedo conectar con casi cualquier persona.", SS3: "Se me da bien influir e inspirar a la gente.", SS4: "Las situaciones sociales me resultan incómodas y difíciles de manejar.",
  },
};
const EQ_FR: InstrumentTranslation = {
  name: "Intelligence émotionnelle", shortName: "Intel. émotionnelle",
  tagline: "Le prédicteur le plus exerçable des relations, du leadership et du bien-être.",
  description: "L'intelligence émotionnelle, c'est la capacité de reconnaître, comprendre et gérer les émotions — les vôtres et celles des autres. Ce profileur estime cinq domaines : Conscience de soi, Autorégulation, Motivation, Empathie et Compétences sociales. Contrairement au QI, l'intelligence émotionnelle s'apprend beaucoup, alors chaque domaine est aussi un axe de progrès.",
  scales: {
    SA: { name: "Conscience de soi", description: "Reconnaître ses propres émotions et leurs effets.", poles: { low: "Peu conscient(e)", high: "Conscient(e) de soi" }, highDescriptor: "à l'écoute de vos émotions et de la façon dont elles vous animent", lowDescriptor: "moins réfléchi(e) sur vos états émotionnels intérieurs" },
    SR: { name: "Autorégulation", description: "Gérer ses impulsions et se remettre d'émotions difficiles.", poles: { low: "Réactif(ve)", high: "Posé(e)" }, highDescriptor: "posé(e), maître de vous et capable de vous reprendre sous stress", lowDescriptor: "plus réactif(ve) et impulsif(ve) quand les émotions montent" },
    MO: { name: "Motivation", description: "Élan, optimisme et résilience vers les objectifs.", poles: { low: "Vite découragé(e)", high: "Motivé(e)" }, highDescriptor: "motivé(e), optimiste et prompt(e) à rebondir", lowDescriptor: "plus facilement découragé(e) quand la motivation baisse" },
    EM: { name: "Empathie", description: "Percevoir et comprendre ce que ressentent les autres.", poles: { low: "Distant(e)", high: "Empathique" }, highDescriptor: "perceptif(ve) et accordé(e) à ce que ressentent les autres", lowDescriptor: "moins naturellement accordé(e) aux émotions d'autrui" },
    SS: { name: "Compétences sociales", description: "Gérer les relations, l'influence et le conflit.", poles: { low: "Maladroit(e)", high: "Habile" }, highDescriptor: "socialement habile, persuasif(ve) et à l'aise avec le conflit", lowDescriptor: "moins à l'aise dans les dynamiques sociales" },
  },
  items: {
    SA1: "J'arrive en général à nommer exactement ce que je ressens, et pourquoi.", SA2: "Je suis conscient(e) de la façon dont mes humeurs façonnent mon comportement.", SA3: "Je suis souvent pris(e) au dépourvu par mes propres réactions émotionnelles.", SA4: "Je connais bien mes forces émotionnelles et mes déclencheurs.",
    SR1: "Je sais rester calme et posé(e) sous pression.", SR2: "Quand je suis contrarié(e), je sais m'apaiser et me recentrer.", SR3: "Je dis ou fais souvent des choses sur le coup que je regrette ensuite.", SR4: "Je peux différer une gratification pour atteindre un objectif plus grand.",
    MO1: "Je reste motivé(e) vers mes objectifs même sans récompense extérieure.", MO2: "Je rebondis vite après les revers.", MO3: "Je perds ma motivation dès que les choses se compliquent.", MO4: "Je suis optimiste : l'effort finira par payer.",
    EM1: "Je sens ce que ressentent les autres, même quand ils ne le disent pas.", EM2: "Je me mets vraiment à la place des autres.", EM3: "J'ai du mal à comprendre pourquoi les gens ressentent ce qu'ils ressentent.", EM4: "Je capte les signaux subtils du ton et du langage corporel.",
    SS1: "Je gère bien les conflits et les conversations difficiles.", SS2: "Je peux créer un lien avec presque n'importe qui.", SS3: "Je suis doué(e) pour influencer et inspirer les gens.", SS4: "Les situations sociales me semblent gênantes et difficiles à gérer.",
  },
};

const RIASEC_ES: InstrumentTranslation = {
  name: "Intereses profesionales (RIASEC)", shortName: "RIASEC",
  tagline: "Tu código Holland, y las carreras que encajan con él.",
  description: "El modelo RIASEC de Holland es la columna vertebral de la orientación profesional moderna. Mapea seis temas de interés —Realista, Investigador, Artístico, Social, Emprendedor y Convencional— y tus tres principales forman tu «código Holland». Este perfilador encuentra el tuyo y lo traduce en campos profesionales concretos que vale la pena explorar.",
  scales: {
    R: { name: "Realista", description: "Trabajo práctico, manual, físico y técnico.", highDescriptor: "práctico, manos a la obra y con inclinación técnica", lowDescriptor: "menos atraído/a por el trabajo técnico y manual" },
    I: { name: "Investigador", description: "Trabajo analítico, científico y guiado por ideas.", highDescriptor: "analítico/a, curioso/a y con mente investigadora", lowDescriptor: "menos atraído/a por el análisis y la investigación" },
    A: { name: "Artístico", description: "Trabajo creativo, expresivo y poco estructurado.", highDescriptor: "creativo/a, expresivo/a y original", lowDescriptor: "menos atraído/a por el trabajo artístico y abierto" },
    S: { name: "Social", description: "Ayudar, enseñar y cuidar a las personas.", highDescriptor: "centrado/a en las personas, servicial y afectuoso/a", lowDescriptor: "menos atraído/a por roles de ayuda a las personas" },
    E: { name: "Emprendedor", description: "Liderar, persuadir y trabajo orientado a los negocios.", highDescriptor: "ambicioso/a, persuasivo/a y orientado/a al liderazgo", lowDescriptor: "menos atraído/a por liderar y vender" },
    C: { name: "Convencional", description: "Trabajo organizado, detallado y estructurado.", highDescriptor: "organizado/a, detallista y sistemático/a", lowDescriptor: "menos atraído/a por el trabajo estructurado y de procedimientos" },
  },
  items: {
    R1: "Trabajar con las manos, herramientas, máquinas o al aire libre.", R2: "Construir, reparar o manejar cosas con resultados tangibles.", R3: "Tareas prácticas, manuales y físicas antes que el trabajo de escritorio.",
    I1: "Analizar problemas, datos y cómo funcionan las cosas.", I2: "Investigación, ciencia y resolver cosas desde sus principios.", I3: "Sumergirme en ideas, teorías y una comprensión profunda.",
    A1: "Expresarme a través del arte, la escritura, la música o el diseño.", A2: "Trabajo creativo y original, con margen para improvisar.", A3: "Proyectos estéticos, imaginativos y sin estructura.",
    S1: "Ayudar, enseñar, orientar o cuidar a las personas.", S2: "Trabajar de cerca con otros y apoyarlos.", S3: "Trabajo que mejora visiblemente la vida de las personas.",
    E1: "Liderar, persuadir, presentar y vender ideas.", E2: "Negocios, ambición, acuerdos e influencia.", E3: "Tomar el mando e impulsar metas y crecimiento.",
    C1: "Trabajo organizado y detallado con procedimientos claros.", C2: "Gestionar datos, registros, horarios y sistemas.", C3: "Reglas claras y procesos ordenados antes que la ambigüedad.",
  },
};
const RIASEC_FR: InstrumentTranslation = {
  name: "Intérêts professionnels (RIASEC)", shortName: "RIASEC",
  tagline: "Votre code Holland — et les métiers qui lui correspondent.",
  description: "Le modèle RIASEC de Holland est la colonne vertébrale de l'orientation professionnelle moderne. Il cartographie six thèmes d'intérêt — Réaliste, Investigateur, Artistique, Social, Entreprenant et Conventionnel — et vos trois principaux forment votre « code Holland ». Ce profileur trouve le vôtre et le traduit en domaines de carrière concrets à explorer.",
  scales: {
    R: { name: "Réaliste", description: "Travail concret, pratique, physique et technique.", highDescriptor: "pratique, concret(ète) et porté(e) vers la technique", lowDescriptor: "moins attiré(e) par le travail technique et manuel" },
    I: { name: "Investigateur", description: "Travail analytique, scientifique et porté par les idées.", highDescriptor: "analytique, curieux(se) et porté(e) sur la recherche", lowDescriptor: "moins attiré(e) par l'analyse et la recherche" },
    A: { name: "Artistique", description: "Travail créatif, expressif et peu structuré.", highDescriptor: "créatif(ve), expressif(ve) et original(e)", lowDescriptor: "moins attiré(e) par le travail artistique et ouvert" },
    S: { name: "Social", description: "Aider, enseigner et prendre soin des gens.", highDescriptor: "tourné(e) vers les autres, serviable et bienveillant(e)", lowDescriptor: "moins attiré(e) par les rôles d'aide aux autres" },
    E: { name: "Entreprenant", description: "Diriger, persuader et travail orienté affaires.", highDescriptor: "ambitieux(se), persuasif(ve) et porté(e) sur le leadership", lowDescriptor: "moins attiré(e) par diriger et vendre" },
    C: { name: "Conventionnel", description: "Travail organisé, minutieux et structuré.", highDescriptor: "organisé(e), minutieux(se) et méthodique", lowDescriptor: "moins attiré(e) par le travail structuré et procédural" },
  },
  items: {
    R1: "Travailler de mes mains, avec des outils, des machines ou en plein air.", R2: "Construire, réparer ou faire fonctionner des choses aux résultats tangibles.", R3: "Des tâches pratiques, manuelles et physiques plutôt qu'un travail de bureau.",
    I1: "Analyser des problèmes, des données et le fonctionnement des choses.", I2: "La recherche, la science et comprendre à partir des principes.", I3: "Plonger dans les idées, les théories et la compréhension profonde.",
    A1: "M'exprimer par l'art, l'écriture, la musique ou le design.", A2: "Un travail créatif et original, avec de la place pour improviser.", A3: "Des projets esthétiques, imaginatifs et sans structure.",
    S1: "Aider, enseigner, accompagner ou prendre soin des gens.", S2: "Travailler étroitement avec les autres et les soutenir.", S3: "Un travail qui améliore visiblement la vie des gens.",
    E1: "Diriger, persuader, présenter et vendre des idées.", E2: "Les affaires, l'ambition, les accords et l'influence.", E3: "Prendre les rênes et viser objectifs et croissance.",
    C1: "Un travail organisé et minutieux avec des procédures claires.", C2: "Gérer données, dossiers, plannings et systèmes.", C3: "Des règles claires et des processus ordonnés plutôt que l'ambiguïté.",
  },
};

const EMPATHY_ES: InstrumentTranslation = {
  name: "Empatía (IRI)", shortName: "Empatía",
  tagline: "Cuatro caras de la empatía: pensar, sentir, imaginar y abrumarse.",
  description: "La empatía es en realidad varias capacidades. El Índice de Reactividad Interpersonal de Davis mapea cuatro: Toma de perspectiva (ver el punto de vista del otro), Preocupación empática (afecto cálido por los demás), Fantasía (absorberse en personajes e historias) y Malestar personal (tu propia ansiedad ante el sufrimiento ajeno). Juntas dibujan cómo —y con qué facilidad— sientes con los demás.",
  scales: {
    PT: { name: "Toma de perspectiva", description: "Adoptar cognitivamente el punto de vista de otro.", poles: { low: "Anclado en sí", high: "Toma perspectiva" }, highDescriptor: "rápido/a para ver los puntos de vista de los demás", lowDescriptor: "más anclado/a en tu propia perspectiva" },
    EC: { name: "Preocupación empática", description: "Sentimientos cálidos de compasión hacia los demás.", poles: { low: "Distante", high: "Compasivo/a" }, highDescriptor: "cálido/a, cariñoso/a y compasivo/a", lowDescriptor: "más frío/a y distante ante los sentimientos ajenos" },
    FS: { name: "Fantasía", description: "Entrar imaginativamente en las experiencias de personajes ficticios.", poles: { low: "Literal", high: "Imaginativo/a" }, highDescriptor: "absorbido/a imaginativamente en historias y personajes", lowDescriptor: "anclado/a en lo literal y lo real" },
    PD: { name: "Malestar personal", description: "Ansiedad centrada en uno mismo ante el sufrimiento ajeno.", poles: { low: "Sereno/a", high: "Se abruma" }, highDescriptor: "fácilmente abrumado/a por el malestar de los demás", lowDescriptor: "capaz de mantener la calma ante el malestar ajeno" },
  },
  items: {
    PT1: "Intento ver las cosas desde el punto de vista del otro antes de juzgar.", PT2: "Cuando me enfado con alguien, intento imaginar cómo se ven las cosas desde su lado.", PT3: "Creo que la mayoría de los asuntos tienen dos caras e intento ver ambas.",
    EC1: "A menudo siento una preocupación cálida y tierna por quienes tienen menos suerte que yo.", EC2: "Las desgracias de los demás me conmueven de verdad.", EC3: "Me describiría como una persona bastante tierna de corazón.",
    FS1: "Me absorben profundamente los sentimientos de los personajes de historias o películas.", FS2: "Imagino de verdad lo que viven los personajes de una novela.", FS3: "Sueño despierto/a con viveza y me imagino en situaciones inventadas.",
    PD1: "En las emergencias me siento ansioso/a, tenso/a y un poco desbordado/a.", PD2: "Estar en una situación emocionalmente cargada me asusta.", PD3: "Cuando veo a alguien gravemente herido, tiendo a descomponerme un poco.",
  },
};
const EMPATHY_FR: InstrumentTranslation = {
  name: "Empathie (IRI)", shortName: "Empathie",
  tagline: "Quatre facettes de l'empathie : penser, ressentir, imaginer et être submergé.",
  description: "L'empathie est en réalité plusieurs capacités. L'Indice de Réactivité Interpersonnelle de Davis en cartographie quatre : la Prise de perspective (voir le point de vue de l'autre), la Préoccupation empathique (un souci chaleureux des autres), la Fantaisie (l'absorption dans les personnages et les histoires) et la Détresse personnelle (votre propre anxiété face à la souffrance d'autrui). Ensemble, elles dessinent comment — et avec quelle facilité — vous ressentez avec les autres.",
  scales: {
    PT: { name: "Prise de perspective", description: "Adopter cognitivement le point de vue d'autrui.", poles: { low: "Ancré(e) sur soi", high: "Prend du recul" }, highDescriptor: "prompt(e) à voir le point de vue des autres", lowDescriptor: "plus ancré(e) dans votre propre perspective" },
    EC: { name: "Préoccupation empathique", description: "Des sentiments chaleureux de compassion tournés vers les autres.", poles: { low: "Distant(e)", high: "Compatissant(e)" }, highDescriptor: "chaleureux(se), attentionné(e) et compatissant(e)", lowDescriptor: "plus froid(e) et détaché(e) face aux sentiments d'autrui" },
    FS: { name: "Fantaisie", description: "Entrer par l'imagination dans le vécu de personnages fictifs.", poles: { low: "Littéral(e)", high: "Imaginatif(ve)" }, highDescriptor: "absorbé(e) par l'imagination dans les histoires et les personnages", lowDescriptor: "ancré(e) dans le littéral et le réel" },
    PD: { name: "Détresse personnelle", description: "Anxiété centrée sur soi face à la souffrance d'autrui.", poles: { low: "Posé(e)", high: "Submergé(e)" }, highDescriptor: "facilement submergé(e) par la détresse des autres", lowDescriptor: "capable de rester calme face à la détresse d'autrui" },
  },
  items: {
    PT1: "J'essaie de voir les choses du point de vue de l'autre avant de juger.", PT2: "Quand je suis fâché(e) contre quelqu'un, j'essaie d'imaginer comment les choses lui apparaissent.", PT3: "Je pense que la plupart des questions ont deux faces et j'essaie de voir les deux.",
    EC1: "Je ressens souvent une tendresse chaleureuse pour les personnes moins chanceuses que moi.", EC2: "Les malheurs des autres me touchent vraiment.", EC3: "Je me décrirais comme une personne plutôt au cœur tendre.",
    FS1: "Je me laisse profondément absorber par les sentiments des personnages des histoires ou des films.", FS2: "J'imagine vraiment ce que vivent les personnages d'un roman.", FS3: "Je rêve éveillé(e) de façon vive et m'imagine dans des situations inventées.",
    PD1: "En cas d'urgence, je me sens anxieux(se), tendu(e) et un peu débordé(e).", PD2: "Être dans une situation émotionnellement chargée me fait peur.", PD3: "Quand je vois quelqu'un gravement blessé, j'ai tendance à un peu m'effondrer.",
  },
};
const EYSENCK_ES: InstrumentTranslation = {
  name: "Perfil PEN de Eysenck", shortName: "PEN",
  tagline: "Tres grandes dimensiones: extraversión, neuroticismo y dureza de carácter.",
  description: "Hans Eysenck sostenía que la personalidad se reduce a unas pocas dimensiones amplias y de base biológica. Este perfilador mapea las tres clásicas: Extraversión, Neuroticismo (reactividad emocional) y Psicoticismo (una etiqueta histórica para las tendencias de carácter firme, inconformistas e impulsivas, no la psicosis). Es un complemento útil a los Cinco Grandes, recorriendo el mismo terreno desde la influyente mirada de Eysenck.",
  scales: {
    EXT: { name: "Extraversión", description: "Sociabilidad, actividad y búsqueda de estimulación.", poles: { low: "Introvertido", high: "Extravertido" }, highDescriptor: "extrovertido/a, enérgico/a y atraído/a por la emoción", lowDescriptor: "reservado/a, tranquilo/a y a gusto con la calma" },
    NEU: { name: "Neuroticismo", description: "Reactividad emocional y propensión al estrés.", poles: { low: "Estable", high: "Reactivo" }, highDescriptor: "emocionalmente reactivo/a, sensible al estrés y propenso/a a preocuparse", lowDescriptor: "tranquilo/a, sereno/a y difícil de alterar" },
    PSY: { name: "Dureza de carácter", description: "Inconformismo, falta de sentimentalismo y franqueza (el 'Psicoticismo' de Eysenck).", poles: { low: "Tierno / conformista", high: "Duro / inconformista" }, highDescriptor: "independiente, de carácter firme y poco convencional", lowDescriptor: "cálido/a, afable y convencional" },
  },
  items: {
    E1: "Hago amigos con facilidad y disfruto de las reuniones sociales animadas.", E2: "Me consideraría más el alma de la fiesta que alguien que pasa desapercibido.", E3: "Me gusta tener mucha emoción y actividad a mi alrededor.", E4: "A menudo actúo por impulso del momento.", E5: "Prefiero una velada tranquila a solas a un gran evento social.", E6: "Tiendo a mantenerme en segundo plano en los eventos sociales.",
    N1: "Mi estado de ánimo puede cambiar rápidamente sin gran motivo.", N2: "Sigo dándole vueltas a las cosas mucho después de que han pasado.", N3: "A menudo me siento tenso/a o nervioso/a.", N4: "Con frecuencia me siento ansioso/a sin saber muy bien por qué.", N5: "Me mantengo tranquilo/a y firme bajo presión.", N6: "Los pequeños contratiempos rara vez alteran mi compostura.",
    P1: "Cuestiono las reglas y convenciones en vez de seguirlas sin más.", P2: "Soy bastante poco sentimental y práctico/a con casi todo.", P3: "Prefiero seguir mi propio camino, aunque otros lo desaprueben.", P4: "Puedo ser franco/a y de carácter firme cuando la situación lo exige.", P5: "Soy muy considerado/a con los sentimientos de los demás.", P6: "Me gusta encajar y seguir las normas sociales aceptadas.",
  },
};
const EYSENCK_FR: InstrumentTranslation = {
  name: "Profil PEN d'Eysenck", shortName: "PEN",
  tagline: "Trois grandes dimensions : extraversion, névrosisme et fermeté d'esprit.",
  description: "Hans Eysenck soutenait que la personnalité se résume à quelques dimensions larges et d'origine biologique. Ce profileur cartographie les trois classiques : l'Extraversion, le Névrosisme (réactivité émotionnelle) et le Psychoticisme (une étiquette historique pour les tendances au caractère ferme, non-conformistes et impulsives — pas la psychose). C'est un complément utile aux Big Five, parcourant le même terrain depuis le regard influent d'Eysenck.",
  scales: {
    EXT: { name: "Extraversion", description: "Sociabilité, activité et recherche de stimulation.", poles: { low: "Introverti", high: "Extraverti" }, highDescriptor: "sociable, énergique et attiré(e) par l'excitation", lowDescriptor: "réservé(e), calme et à l'aise dans le calme" },
    NEU: { name: "Névrosisme", description: "Réactivité émotionnelle et propension au stress.", poles: { low: "Stable", high: "Réactif" }, highDescriptor: "émotionnellement réactif(ve), sensible au stress et prompt(e) à s'inquiéter", lowDescriptor: "calme, posé(e) et difficile à ébranler" },
    PSY: { name: "Fermeté d'esprit", description: "Non-conformisme, absence de sentimentalité et franchise (le « Psychoticisme » d'Eysenck).", poles: { low: "Tendre / conformiste", high: "Dur / non-conformiste" }, highDescriptor: "indépendant(e), au caractère ferme et peu conventionnel(le)", lowDescriptor: "chaleureux(se), accommodant(e) et conventionnel(le)" },
  },
  items: {
    E1: "Je me fais des amis facilement et j'aime les réunions sociales animées.", E2: "Je me décrirais plutôt comme l'âme de la fête que comme quelqu'un d'effacé.", E3: "J'aime avoir beaucoup d'animation et d'activité autour de moi.", E4: "J'agis souvent sur un coup de tête.", E5: "Je préfère une soirée tranquille seul(e) à un grand événement social.", E6: "J'ai tendance à rester en retrait lors des événements sociaux.",
    N1: "Mon humeur peut changer rapidement sans grande raison.", N2: "Je continue de ressasser les choses longtemps après qu'elles sont finies.", N3: "Je me sens souvent tendu(e) ou à cran.", N4: "Je me sens fréquemment anxieux(se) sans trop savoir pourquoi.", N5: "Je reste calme et posé(e) sous la pression.", N6: "Les petits contretemps ébranlent rarement mon sang-froid.",
    P1: "Je remets en question les règles et les conventions plutôt que de simplement les suivre.", P2: "Je suis assez peu sentimental(e) et terre-à-terre sur la plupart des choses.", P3: "Je préfère suivre ma propre voie, même si d'autres le désapprouvent.", P4: "Je peux être direct(e) et ferme quand la situation l'exige.", P5: "Je suis très attentif(ve) aux sentiments des autres.", P6: "J'aime m'intégrer et suivre les normes sociales admises.",
  },
};
const PSS_ES: InstrumentTranslation = {
  name: "Estrés percibido", shortName: "Estrés",
  tagline: "Qué tan desbordada, impredecible y fuera de control se ha sentido la vida últimamente.",
  description: "El estrés no consiste solo en lo que te ocurre, sino en cuánto sientes que puedes manejarlo. La Escala de Estrés Percibido, la más utilizada del campo, capta esa valoración: qué tan impredecible, incontrolable y desbordante ha sido el último mes. Es una instantánea de un período de tiempo, y cambia a medida que cambian tus circunstancias y tu forma de afrontarlas.",
  scales: {
    STRESS: { name: "Estrés percibido", description: "Estrés evaluado durante el último mes.", poles: { low: "Con control", high: "Desbordado/a" }, highDescriptor: "con sensación de sobrecarga y poco control", lowDescriptor: "con sensación de estabilidad y control" },
  },
  items: {
    S1: "En el último mes, ¿con qué frecuencia te has alterado por algo que ocurrió inesperadamente?", S2: "¿Con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?", S3: "¿Con qué frecuencia te has sentido nervioso/a y estresado/a?", S4: "¿Con qué frecuencia te has visto incapaz de afrontar todo lo que tenías que hacer?", S5: "¿Con qué frecuencia te han enfadado cosas que estaban fuera de tu control?",
    S6: "¿Con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?", S7: "¿Con qué frecuencia te has sentido seguro/a de tu capacidad para manejar tus problemas personales?", S8: "¿Con qué frecuencia has sentido que las cosas te iban bien?", S9: "¿Con qué frecuencia has sido capaz de controlar las irritaciones de tu vida?", S10: "¿Con qué frecuencia has sentido que tenías todo bajo control?",
  },
};
const PSS_FR: InstrumentTranslation = {
  name: "Stress perçu", shortName: "Stress",
  tagline: "À quel point la vie a semblé surchargée, imprévisible et hors de contrôle ces derniers temps.",
  description: "Le stress ne tient pas seulement à ce qui vous arrive, mais à votre sentiment de pouvoir y faire face. L'Échelle de Stress Perçu, la plus utilisée du domaine, saisit cette évaluation : à quel point le mois écoulé a semblé imprévisible, incontrôlable et surchargeant. C'est un instantané d'une période, et il évolue au fil de vos circonstances et de votre manière d'y faire face.",
  scales: {
    STRESS: { name: "Stress perçu", description: "Stress évalué au cours du dernier mois.", poles: { low: "Maîtrisé", high: "Débordé(e)" }, highDescriptor: "avec un sentiment de surcharge et de perte de contrôle", lowDescriptor: "avec un sentiment de stabilité et de maîtrise" },
  },
  items: {
    S1: "Au cours du dernier mois, à quelle fréquence avez-vous été contrarié(e) par un événement inattendu ?", S2: "À quelle fréquence avez-vous eu le sentiment de ne pas pouvoir contrôler les choses importantes de votre vie ?", S3: "À quelle fréquence vous êtes-vous senti(e) nerveux(se) et stressé(e) ?", S4: "À quelle fréquence avez-vous trouvé que vous ne pouviez pas faire face à tout ce que vous aviez à faire ?", S5: "À quelle fréquence avez-vous été irrité(e) par des choses hors de votre contrôle ?",
    S6: "À quelle fréquence avez-vous senti les difficultés s'accumuler au point de ne pas pouvoir les surmonter ?", S7: "À quelle fréquence vous êtes-vous senti(e) confiant(e) dans votre capacité à gérer vos problèmes personnels ?", S8: "À quelle fréquence avez-vous eu le sentiment que les choses allaient comme vous le vouliez ?", S9: "À quelle fréquence avez-vous été capable de maîtriser les irritations de votre vie ?", S10: "À quelle fréquence avez-vous eu le sentiment de maîtriser la situation ?",
  },
};
const WORRY_ES: InstrumentTranslation = {
  name: "Chequeo de preocupación", shortName: "Preocupación",
  tagline: "Una instantánea amable de dos semanas sobre preocupación y calma: apoyo, no diagnóstico.",
  description: "Un breve y cuidadoso chequeo sobre la preocupación y la tensión de las últimas dos semanas, en el espíritu de los cribados habituales de ansiedad, pero planteado en torno a la calma y la estabilidad en lugar de los síntomas. Las puntuaciones más altas indican más bienestar. Es un estímulo para el autoconocimiento y el autocuidado, nunca un diagnóstico.",
  scales: {
    CALM: { name: "Calma y bienestar", description: "Ausencia de preocupación ansiosa.", poles: { low: "Ansioso/a", high: "En calma" }, highDescriptor: "tranquilo/a, a gusto y capaz de relajarse", lowDescriptor: "ansioso/a, en tensión y preocupado/a" },
    STDY: { name: "Estabilidad", description: "Estabilidad interior y ausencia de inquietud.", poles: { low: "Inquieto/a", high: "Estable" }, highDescriptor: "asentado/a, sereno/a y estable", lowDescriptor: "inquieto/a, irritable o aprensivo/a" },
  },
  items: {
    C1: "En las últimas dos semanas, me he sentido nervioso/a, ansioso/a o con los nervios de punta.", C2: "No he podido dejar de preocuparme ni controlar la preocupación.", C3: "Me he sentido tranquilo/a y a gusto.", C4: "He podido relajarme cuando he querido.",
    S1: "Me he sentido relajado/a en lugar de tenso/a.", S2: "He estado inquieto/a o me ha costado quedarme quieto/a.", S3: "Me he sentido fácilmente molesto/a o irritable.", S4: "He sentido miedo de que pudiera pasar algo terrible.",
  },
};
const WORRY_FR: InstrumentTranslation = {
  name: "Point sur l'inquiétude", shortName: "Inquiétude",
  tagline: "Un aperçu bienveillant sur deux semaines de l'inquiétude et du calme — un soutien, pas un diagnostic.",
  description: "Un bref point attentionné sur l'inquiétude et la tension des deux dernières semaines, dans l'esprit des dépistages courants de l'anxiété — mais articulé autour du calme et de la stabilité plutôt que des symptômes. Des scores plus élevés signifient plus de sérénité. C'est une invitation à mieux se connaître et à prendre soin de soi, jamais un diagnostic.",
  scales: {
    CALM: { name: "Calme et sérénité", description: "Absence d'inquiétude anxieuse.", poles: { low: "Anxieux", high: "Calme" }, highDescriptor: "calme, à l'aise et capable de se détendre", lowDescriptor: "anxieux(se), à cran et inquiet(ète)" },
    STDY: { name: "Stabilité", description: "Stabilité intérieure et absence d'agitation.", poles: { low: "Agité", high: "Stable" }, highDescriptor: "posé(e), égal(e) et stable", lowDescriptor: "agité(e), irritable ou inquiet(ète)" },
  },
  items: {
    C1: "Au cours des deux dernières semaines, je me suis senti(e) nerveux(se), anxieux(se) ou à cran.", C2: "Je n'ai pas pu arrêter de m'inquiéter ni contrôler mon inquiétude.", C3: "Je me suis senti(e) calme et à l'aise.", C4: "J'ai pu me détendre quand je le voulais.",
    S1: "Je me suis senti(e) détendu(e) plutôt que crispé(e).", S2: "J'ai été agité(e) ou j'ai eu du mal à rester en place.", S3: "Je me suis senti(e) facilement contrarié(e) ou irritable.", S4: "J'ai eu peur qu'il puisse arriver quelque chose d'affreux.",
  },
};
const ZKPQ_ES: InstrumentTranslation = {
  name: "Los Cinco Alternativos (ZKPQ)", shortName: "Alt-Cinco",
  tagline: "El rival de base biológica de los Cinco Grandes, de Zuckerman.",
  description: "Marvin Zuckerman sostenía que los Cinco Grandes no recortaban del todo la naturaleza por sus articulaciones, y propuso unos 'Cinco Alternativos' arraigados en rasgos con bases biológicas y evolutivas más claras: búsqueda impulsiva de sensaciones, neuroticismo-ansiedad, agresión-hostilidad, actividad y sociabilidad. Una fascinante segunda opinión sobre la estructura de la personalidad.",
  scales: {
    IMPSS: { name: "Búsqueda impulsiva de sensaciones", description: "Impulsividad junto al ansia de emoción y novedad.", poles: { low: "Deliberado", high: "Impulsivo" }, highDescriptor: "impulsivo/a y ávido/a de emociones nuevas", lowDescriptor: "previsor/a y reacio/a al riesgo" },
    NANX: { name: "Neuroticismo-Ansiedad", description: "Tensión, preocupación y malestar emocional.", poles: { low: "Tranquilo", high: "Ansioso" }, highDescriptor: "tenso/a, preocupado/a y fácilmente alterado/a", lowDescriptor: "tranquilo/a y emocionalmente estable" },
    AGGH: { name: "Agresión-Hostilidad", description: "Disposición a la ira, la discusión y la hostilidad.", poles: { low: "Apacible", high: "Hostil" }, highDescriptor: "irascible, directo/a y combativo/a", lowDescriptor: "paciente, suave y lento/a para enfadarse" },
    ACT: { name: "Actividad", description: "Energía, ajetreo y necesidad de acción.", poles: { low: "Relajado", high: "Activo" }, highDescriptor: "enérgico/a, inquieto/a y siempre en marcha", lowDescriptor: "relajado/a y a gusto con un ritmo pausado" },
    SY: { name: "Sociabilidad", description: "Disfrute de la gente, las fiestas y la actividad social.", poles: { low: "Solitario", high: "Sociable" }, highDescriptor: "extrovertido/a y con energía entre la gente", lowDescriptor: "más a gusto en soledad o en grupos pequeños" },
  },
  items: {
    IS1: "Actúo por impulso y ansío experiencias nuevas y emocionantes.", IS2: "Me gusta hacer cosas solo por la emoción que producen.", IS3: "Planifico con cuidado y me mantengo alejado/a de los riesgos.",
    NA1: "A menudo me siento tenso/a, preocupado/a o alterado/a.", NA2: "Las pequeñas cosas me desaniman o me ponen ansioso/a con facilidad.", NA3: "Soy una persona tranquila y rara vez me altero.",
    AH1: "Puedo tener la lengua afilada o enfadarme rápido cuando me provocan.", AH2: "Discuto sin problema y defiendo mi postura, incluso de forma brusca.", AH3: "Soy paciente y tardo en enfadarme.",
    AC1: "Siempre estoy en movimiento y me gusta mantenerme ocupado/a.", AC2: "Prefiero una vida activa y de ritmo rápido a una relajada.", AC3: "Estoy más a gusto a un ritmo lento y tranquilo.",
    SY1: "Me encanta estar rodeado/a de mucha gente y actividad social.", SY2: "Prefiero estar en una fiesta animada que en casa a solas.", SY3: "Prefiero la soledad o los grupos pequeños a las grandes multitudes.",
  },
};
const ZKPQ_FR: InstrumentTranslation = {
  name: "Les Cinq Alternatifs (ZKPQ)", shortName: "Alt-Cinq",
  tagline: "Le rival d'origine biologique des Big Five, selon Zuckerman.",
  description: "Marvin Zuckerman estimait que les Big Five ne découpaient pas la nature selon ses véritables articulations, et proposa des « Cinq Alternatifs » ancrés dans des traits aux bases biologiques et évolutives plus nettes : recherche impulsive de sensations, névrosisme-anxiété, agression-hostilité, activité et sociabilité. Un second avis fascinant sur la structure de la personnalité.",
  scales: {
    IMPSS: { name: "Recherche impulsive de sensations", description: "Impulsivité doublée d'une soif de sensations fortes et de nouveauté.", poles: { low: "Réfléchi", high: "Impulsif" }, highDescriptor: "impulsif(ve) et avide de sensations nouvelles", lowDescriptor: "prévoyant(e) et réfractaire au risque" },
    NANX: { name: "Névrosisme-Anxiété", description: "Tension, inquiétude et trouble émotionnel.", poles: { low: "Calme", high: "Anxieux" }, highDescriptor: "tendu(e), inquiet(ète) et facilement perturbé(e)", lowDescriptor: "calme et émotionnellement stable" },
    AGGH: { name: "Agression-Hostilité", description: "Propension à la colère, à la dispute et à l'hostilité.", poles: { low: "Accommodant", high: "Hostile" }, highDescriptor: "soupe au lait, direct(e) et combatif(ve)", lowDescriptor: "patient(e), doux(ce) et lent(e) à la colère" },
    ACT: { name: "Activité", description: "Énergie, agitation et besoin d'action.", poles: { low: "Détendu", high: "Actif" }, highDescriptor: "énergique, agité(e) et toujours en mouvement", lowDescriptor: "détendu(e) et à l'aise dans un rythme posé" },
    SY: { name: "Sociabilité", description: "Goût des gens, des fêtes et de l'activité sociale.", poles: { low: "Solitaire", high: "Sociable" }, highDescriptor: "sociable et stimulé(e) par la foule", lowDescriptor: "plus à l'aise dans la solitude ou les petits groupes" },
  },
  items: {
    IS1: "J'agis sur un coup de tête et je recherche des expériences nouvelles et excitantes.", IS2: "J'aime faire des choses juste pour le frisson.", IS3: "Je planifie soigneusement et j'évite les risques.",
    NA1: "Je me sens souvent tendu(e), inquiet(ète) ou contrarié(e).", NA2: "Un rien me déprime ou me rend anxieux(se).", NA3: "Je suis calme et rarement ébranlé(e).",
    AH1: "Je peux avoir la langue acérée ou m'emporter vite quand on me provoque.", AH2: "Je discute volontiers et je tiens ma position, même brutalement.", AH3: "Je suis patient(e) et lent(e) à me mettre en colère.",
    AC1: "Je suis toujours en mouvement et j'aime rester occupé(e).", AC2: "Je préfère une vie active et trépidante à une vie tranquille.", AC3: "Je suis plus heureux(se) à un rythme lent et tranquille.",
    SY1: "J'adore être entouré(e) de beaucoup de monde et d'activité sociale.", SY2: "Je préfère une fête animée à rester seul(e) à la maison.", SY3: "Je préfère la solitude ou les petits groupes aux grandes foules.",
  },
};
const TCI_ES: InstrumentTranslation = {
  name: "Temperamento y Carácter", shortName: "TCI",
  tagline: "El modelo de Cloninger: lo que heredaste y lo que has cultivado.",
  description: "El modelo psicobiológico de Cloninger establece una distinción llamativa: cuatro dimensiones de TEMPERAMENTO, en gran parte heredadas y automáticas (búsqueda de novedad, evitación del daño, dependencia de la recompensa, persistencia), y tres dimensiones de CARÁCTER que maduran a lo largo de la vida (autodirección, cooperación, autotrascendencia). Juntas separan la naturaleza con la que empiezas del yo que has construido.",
  scales: {
    NS: { name: "Búsqueda de novedad", description: "Temperamento: entusiasmo exploratorio e impulsividad.", poles: { low: "Constante", high: "Busca novedad" }, highDescriptor: "explorador/a, impulsivo/a y excitable", lowDescriptor: "reservado/a, deliberado/a y ordenado/a" },
    HA: { name: "Evitación del daño", description: "Temperamento: preocupación, cautela y miedo al daño.", poles: { low: "Audaz", high: "Cauto" }, highDescriptor: "cauteloso/a, propenso/a a la preocupación y fácil de fatigar", lowDescriptor: "seguro/a, relajado/a y tolerante al riesgo" },
    RD: { name: "Dependencia de la recompensa", description: "Temperamento: calidez y sensibilidad a la aprobación social.", poles: { low: "Distante", high: "Cálido" }, highDescriptor: "cálido/a, sentimental y sensible a la aprobación", lowDescriptor: "distante, práctico/a e independiente de la aprobación" },
    PS: { name: "Persistencia", description: "Temperamento: perseverancia pese a la frustración.", poles: { low: "Cede", high: "Persevera" }, highDescriptor: "trabajador/a, decidido/a y perseverante", lowDescriptor: "fácil de desanimar cuando la recompensa se desvanece" },
    SD: { name: "Autodirección", description: "Carácter: responsabilidad, propósito e ingenio.", poles: { low: "A la deriva", high: "Autodirigido" }, highDescriptor: "con propósito, responsable y autónomo/a", lowDescriptor: "inseguro/a de su rumbo y propenso/a a culpar a otros" },
    CO: { name: "Cooperación", description: "Carácter: tolerancia, empatía y disposición a ayudar.", poles: { low: "Centrado en sí", high: "Cooperativo" }, highDescriptor: "tolerante, empático/a y cooperador/a", lowDescriptor: "centrado/a en sí mismo/a e intolerante con lo distinto" },
    ST: { name: "Autotrascendencia", description: "Carácter: espiritualidad y conexión con un todo mayor.", poles: { low: "Material", high: "Trascendente" }, highDescriptor: "idealista y en sintonía con algo más grande", lowDescriptor: "concreto/a, material y autosuficiente" },
  },
  items: {
    NS1: "Siempre busco experiencias nuevas y emocionantes.", NS2: "Prefiero las rutinas familiares a la novedad y la sorpresa.",
    HA1: "Me preocupo por lo que podría salir mal, aunque otros no lo hagan.", HA2: "Me mantengo relajado/a y seguro/a en situaciones desconocidas o arriesgadas.",
    RD1: "Soy cálido/a y sentimental, y me importa la aprobación de los demás.", RD2: "Me mantengo emocionalmente distante e indiferente a los elogios o las críticas.",
    PS1: "Sigo esforzándome por una meta incluso cuando otros abandonarían.", PS2: "Pierdo la motivación en cuanto una tarea deja de ser gratificante.",
    SD1: "Asumo la responsabilidad de mi vida y actúo según mis propios propósitos.", SD2: "Me cuesta fijarme metas y seguir mi propia dirección.",
    CO1: "Soy tolerante y servicial, e intento entender otros puntos de vista.", CO2: "Tengo poca paciencia con las personas que son diferentes a mí.",
    ST1: "A veces siento una conexión profunda con algo más grande que yo.", ST2: "Me centro en lo concreto y material, no en lo espiritual o trascendente.",
  },
};
const TCI_FR: InstrumentTranslation = {
  name: "Tempérament et Caractère", shortName: "TCI",
  tagline: "Le modèle de Cloninger — ce dont vous avez hérité, et ce que vous avez cultivé.",
  description: "Le modèle psychobiologique de Cloninger établit une distinction frappante : quatre dimensions de TEMPÉRAMENT, en grande partie héritées et automatiques (recherche de nouveauté, évitement du danger, dépendance à la récompense, persistance), et trois dimensions de CARACTÈRE qui mûrissent au fil de la vie (autodétermination, coopération, autotranscendance). Ensemble, elles séparent la nature de départ du soi que vous avez construit.",
  scales: {
    NS: { name: "Recherche de nouveauté", description: "Tempérament : enthousiasme exploratoire et impulsivité.", poles: { low: "Constant", high: "Cherche la nouveauté" }, highDescriptor: "exploratoire, impulsif(ve) et excitable", lowDescriptor: "réservé(e), réfléchi(e) et ordonné(e)" },
    HA: { name: "Évitement du danger", description: "Tempérament : inquiétude, prudence et crainte du danger.", poles: { low: "Audacieux", high: "Prudent" }, highDescriptor: "prudent(e), enclin(e) à l'inquiétude et vite fatigué(e)", lowDescriptor: "confiant(e), détendu(e) et tolérant(e) au risque" },
    RD: { name: "Dépendance à la récompense", description: "Tempérament : chaleur et sensibilité à l'approbation sociale.", poles: { low: "Détaché", high: "Chaleureux" }, highDescriptor: "chaleureux(se), sentimental(e) et sensible à l'approbation", lowDescriptor: "détaché(e), pragmatique et indépendant(e) de l'approbation" },
    PS: { name: "Persistance", description: "Tempérament : persévérance malgré la frustration.", poles: { low: "Cède", high: "Persévère" }, highDescriptor: "travailleur(se), déterminé(e) et persévérant(e)", lowDescriptor: "vite découragé(e) quand la récompense s'estompe" },
    SD: { name: "Autodétermination", description: "Caractère : responsabilité, sens et débrouillardise.", poles: { low: "À la dérive", high: "Autodéterminé" }, highDescriptor: "déterminé(e), responsable et maître de soi", lowDescriptor: "incertain(e) de sa direction et prompt(e) à rejeter la faute" },
    CO: { name: "Coopération", description: "Caractère : tolérance, empathie et serviabilité.", poles: { low: "Centré sur soi", high: "Coopératif" }, highDescriptor: "tolérant(e), empathique et coopératif(ve)", lowDescriptor: "centré(e) sur soi et intolérant(e) à la différence" },
    ST: { name: "Autotranscendance", description: "Caractère : spiritualité et lien avec un tout plus vaste.", poles: { low: "Matériel", high: "Transcendant" }, highDescriptor: "idéaliste et à l'écoute de quelque chose de plus grand", lowDescriptor: "concret(ète), matériel(le) et autosuffisant(e)" },
  },
  items: {
    NS1: "Je suis toujours à la recherche d'expériences nouvelles et excitantes.", NS2: "Je préfère les routines familières à la nouveauté et à la surprise.",
    HA1: "Je m'inquiète de ce qui pourrait mal tourner, même quand les autres ne le font pas.", HA2: "Je reste détendu(e) et confiant(e) dans les situations inconnues ou risquées.",
    RD1: "Je suis chaleureux(se) et sentimental(e), et l'approbation des autres compte pour moi.", RD2: "Je reste détaché(e) émotionnellement et indifférent(e) aux éloges comme aux critiques.",
    PS1: "Je continue de viser un objectif même quand d'autres abandonneraient.", PS2: "Je perds ma motivation dès qu'une tâche cesse d'être gratifiante.",
    SD1: "Je prends la responsabilité de ma vie et j'agis selon mes propres buts.", SD2: "J'ai du mal à me fixer des objectifs et à suivre ma propre direction.",
    CO1: "Je suis tolérant(e) et serviable, et j'essaie de comprendre d'autres points de vue.", CO2: "J'ai peu de patience avec les gens qui sont différents de moi.",
    ST1: "Je ressens parfois un lien profond avec quelque chose de plus grand que moi.", ST2: "Je me concentre sur le concret et le matériel, pas sur le spirituel ou le transcendant.",
  },
};
const SENSATION_ES: InstrumentTranslation = {
  name: "Búsqueda de sensaciones", shortName: "Sensaciones",
  tagline: "Tu apetito por la novedad, la intensidad y un poco de riesgo.",
  description: "La búsqueda de sensaciones, cartografiada por Marvin Zuckerman, es el impulso hacia la experiencia variada, novedosa e intensa, y la disposición a asumir riesgos físicos o sociales para conseguirla. Aquí aparece en dos sabores: el gusto por la emoción física y la aventura, y la atracción por la experiencia novedosa y desinhibida. Alta o baja, moldea la vida que construyes.",
  scales: {
    TAS: { name: "Búsqueda de emoción y aventura", description: "Deseo de emoción física, velocidad y aventura.", poles: { low: "Cauto", high: "Busca emociones" }, highDescriptor: "atraído/a por la adrenalina, la velocidad y el riesgo físico", lowDescriptor: "más a gusto con actividades tranquilas y de bajo riesgo" },
    DIS: { name: "Experiencia y desinhibición", description: "Deseo de experiencia novedosa, intensa y poco convencional.", poles: { low: "Estable", high: "Busca novedad" }, highDescriptor: "atraído/a por la novedad, la intensidad y la espontaneidad", lowDescriptor: "a gusto con lo familiar y predecible" },
  },
  items: {
    T1: "Me encantaría probar actividades como el paracaidismo, surfear olas grandes o la escalada.", T2: "Me atraen las emociones físicas y un toque de peligro.", T3: "La velocidad, las alturas y el movimiento rápido me emocionan más de lo que me asustan.", T4: "Busco activamente experiencias aventureras y llenas de adrenalina.",
    D1: "Disfruto de experiencias salvajes, espontáneas y desinhibidas.", D2: "Me atrae lo novedoso, lo intenso o lo poco convencional.", D3: "Me inquieto y me aburro cuando la vida se vuelve demasiado familiar.", D4: "Pruebo algo solo por ver cómo es, aunque sea un poco arriesgado.",
  },
};
const SENSATION_FR: InstrumentTranslation = {
  name: "Recherche de sensations", shortName: "Sensations",
  tagline: "Votre appétit pour la nouveauté, l'intensité et un brin de risque.",
  description: "La recherche de sensations, cartographiée par Marvin Zuckerman, est la quête d'expériences variées, nouvelles et intenses — et la volonté de prendre des risques physiques ou sociaux pour les vivre. Elle apparaît ici sous deux formes : le goût du frisson physique et de l'aventure, et l'attrait pour l'expérience nouvelle et désinhibée. Élevée ou faible, elle façonne la vie que vous bâtissez.",
  scales: {
    TAS: { name: "Recherche de frisson et d'aventure", description: "Désir de frisson physique, de vitesse et d'aventure.", poles: { low: "Prudent", high: "Cherche le frisson" }, highDescriptor: "attiré(e) par l'adrénaline, la vitesse et le risque physique", lowDescriptor: "plus à l'aise dans des activités calmes et peu risquées" },
    DIS: { name: "Expérience et désinhibition", description: "Désir d'expérience nouvelle, intense et non conventionnelle.", poles: { low: "Stable", high: "Cherche la nouveauté" }, highDescriptor: "attiré(e) par la nouveauté, l'intensité et la spontanéité", lowDescriptor: "satisfait(e) du familier et du prévisible" },
  },
  items: {
    T1: "J'adorerais essayer des activités comme le parachutisme, le surf de grosses vagues ou l'escalade.", T2: "Je suis attiré(e) par les sensations physiques et une pointe de danger.", T3: "La vitesse, les hauteurs et le mouvement rapide m'excitent plus qu'ils ne m'effraient.", T4: "Je recherche activement des expériences aventureuses et pleines d'adrénaline.",
    D1: "J'aime les expériences débridées, spontanées et désinhibées.", D2: "Je suis attiré(e) par ce qui est nouveau, intense ou non conventionnel.", D3: "Je deviens agité(e) et je m'ennuie quand la vie devient trop familière.", D4: "J'essaie quelque chose juste pour voir ce que ça fait, même si c'est un peu risqué.",
  },
};
const PANAS_ES: InstrumentTranslation = {
  name: "Afecto positivo y negativo", shortName: "PANAS",
  tagline: "Dos estados de ánimo independientes: cuánto afecto positivo y negativo llevas.",
  description: "El estado de ánimo no es un único dial de malo a bueno. El PANAS trata el afecto positivo (entusiasmo, viveza, energía) y el afecto negativo (malestar, irritabilidad, miedo) como dos dimensiones en gran medida independientes: puedes estar alto o bajo en cada una. Valora cuánto te has sentido de cada modo últimamente para ver el equilibrio que llevas.",
  scales: {
    PA: { name: "Afecto positivo", description: "Energía, entusiasmo y placer comprometido.", poles: { low: "Poca energía", high: "Mucha energía" }, highDescriptor: "con energía, entusiasta y comprometido/a", lowDescriptor: "apático/a, con poca energía y desconectado/a" },
    NA: { name: "Afecto negativo", description: "Malestar, irritabilidad y activación desagradable.", poles: { low: "Sereno", high: "Angustiado" }, highDescriptor: "tenso/a, angustiado/a y fácilmente alterado/a", lowDescriptor: "tranquilo/a y prácticamente sin malestar" },
  },
  items: {
    P1: "Interesado/a", P2: "Entusiasmado/a", P3: "Orgulloso/a", P4: "Alerta", P5: "Inspirado/a", P6: "Decidido/a", P7: "Atento/a", P8: "Activo/a",
    N1: "Angustiado/a", N2: "Disgustado/a", N3: "Culpable", N4: "Asustado/a", N5: "Hostil", N6: "Irritable", N7: "Nervioso/a", N8: "Temeroso/a",
  },
};
const PANAS_FR: InstrumentTranslation = {
  name: "Affect positif et négatif", shortName: "PANAS",
  tagline: "Deux humeurs indépendantes : la dose d'affect positif et négatif que vous portez.",
  description: "L'humeur n'est pas un simple curseur du mauvais au bon. Le PANAS traite l'affect positif (enthousiasme, vivacité, énergie) et l'affect négatif (détresse, irritabilité, peur) comme deux dimensions largement indépendantes — vous pouvez être élevé(e) ou faible sur chacune. Évaluez combien vous vous êtes senti(e) ainsi récemment pour voir l'équilibre que vous portez.",
  scales: {
    PA: { name: "Affect positif", description: "Énergie, enthousiasme et plaisir engagé.", poles: { low: "Peu d'énergie", high: "Beaucoup d'énergie" }, highDescriptor: "plein(e) d'énergie, enthousiaste et engagé(e)", lowDescriptor: "éteint(e), peu énergique et désengagé(e)" },
    NA: { name: "Affect négatif", description: "Détresse, irritabilité et activation désagréable.", poles: { low: "Serein", high: "En détresse" }, highDescriptor: "tendu(e), en détresse et facilement contrarié(e)", lowDescriptor: "calme et largement exempt(e) de détresse" },
  },
  items: {
    P1: "Intéressé(e)", P2: "Enthousiaste", P3: "Fier(ère)", P4: "En alerte", P5: "Inspiré(e)", P6: "Déterminé(e)", P7: "Attentif(ve)", P8: "Actif(ve)",
    N1: "En détresse", N2: "Contrarié(e)", N3: "Coupable", N4: "Effrayé(e)", N5: "Hostile", N6: "Irritable", N7: "Nerveux(se)", N8: "Apeuré(e)",
  },
};
const RYFF_ES: InstrumentTranslation = {
  name: "Bienestar psicológico", shortName: "Bienestar",
  tagline: "Seis pilares de una vida bien vivida, más allá de sentirse bien.",
  description: "Carol Ryff sostenía que el bienestar es más que sentimientos agradables: es florecer. Su modelo mapea seis dimensiones: autonomía, dominio del entorno, crecimiento personal, relaciones positivas, propósito en la vida y autoaceptación. Juntas trazan una imagen más rica y eudaimónica de cuán plenamente vives, y qué pilar más valdría la pena atender.",
  scales: {
    AUT: { name: "Autonomía", description: "Autodirección e independencia de la presión social.", poles: { low: "Dirigido por otros", high: "Autodirigido" }, highDescriptor: "autónomo/a y fiel a tus propios criterios", lowDescriptor: "muy guiado/a por las expectativas ajenas" },
    MAS: { name: "Dominio del entorno", description: "Manejar la vida y dar forma a tu entorno.", poles: { low: "Desbordado", high: "Con el control" }, highDescriptor: "al frente de las exigencias de la vida y dueño/a de tu contexto", lowDescriptor: "a menudo desbordado/a por las exigencias cotidianas" },
    GRO: { name: "Crecimiento personal", description: "Desarrollo continuo y apertura al desafío.", poles: { low: "Estancado", high: "En crecimiento" }, highDescriptor: "creciendo, aprendiendo y expandiéndote", lowDescriptor: "con sensación de estancamiento" },
    REL: { name: "Relaciones positivas", description: "Relaciones cálidas, de confianza y generosas.", poles: { low: "Reservado", high: "Conectado" }, highDescriptor: "cálida y profundamente conectado/a con los demás", lowDescriptor: "más aislado/a o reservado/a en las relaciones" },
    PUR: { name: "Propósito en la vida", description: "Dirección, sentido y metas.", poles: { low: "A la deriva", high: "Con propósito" }, highDescriptor: "anclado/a en un propósito y un sentido claros", lowDescriptor: "en busca de dirección" },
    ACC: { name: "Autoaceptación", description: "Una mirada positiva y serena hacia ti y tu pasado.", poles: { low: "Autocrítico", high: "Se acepta" }, highDescriptor: "aceptándote y en paz con quien eres", lowDescriptor: "autocrítico/a o inquieto/a con tu vida" },
  },
  items: {
    AU1: "No me da miedo expresar mis opiniones, aunque difieran de las de la mayoría.", AU2: "Me juzgo por mis propios criterios, no por lo que piensen los demás.", AU3: "Me dejo influir fácilmente por las opiniones de quienes me rodean.",
    MA1: "Manejo bien las exigencias de la vida diaria.", MA2: "He construido una vida y un entorno que me convienen.", MA3: "Las exigencias de la vida cotidiana a menudo me superan.",
    GR1: "Me veo creciendo y desarrollándome como persona.", GR2: "Busco experiencias nuevas que desafíen cómo me veo a mí mismo/a.", GR3: "Siento que he dejado de crecer o de mejorar.",
    RE1: "Tengo relaciones cálidas y de confianza con las que puedo contar.", RE2: "La gente me describiría como una persona generosa.", RE3: "Me cuesta abrirme de verdad con los demás.",
    PU1: "Tengo un sentido claro de dirección y propósito en la vida.", PU2: "Mis metas dan sentido a mi vida.", PU3: "A veces siento que mi vida carece de un propósito real.",
    AC1: "Me gustan la mayoría de los aspectos de quien soy.", AC2: "Estoy en gran medida en paz con cómo ha resultado mi vida.", AC3: "Estoy decepcionado/a por muchas cosas de mi vida.",
  },
};
const RYFF_FR: InstrumentTranslation = {
  name: "Bien-être psychologique", shortName: "Bien-être",
  tagline: "Six piliers d'une vie bien vécue, au-delà du simple bien-être ressenti.",
  description: "Carol Ryff soutenait que le bien-être est plus que des sentiments agréables : c'est l'épanouissement. Son modèle cartographie six dimensions : autonomie, maîtrise de l'environnement, croissance personnelle, relations positives, sens de la vie et acceptation de soi. Ensemble, elles esquissent une image plus riche et eudémonique de la plénitude avec laquelle vous vivez — et du pilier qui mériterait le plus d'attention.",
  scales: {
    AUT: { name: "Autonomie", description: "Autodétermination et indépendance face à la pression sociale.", poles: { low: "Dirigé par autrui", high: "Autodéterminé" }, highDescriptor: "maître de vous et fidèle à vos propres critères", lowDescriptor: "fortement guidé(e) par les attentes des autres" },
    MAS: { name: "Maîtrise de l'environnement", description: "Gérer sa vie et façonner son entourage.", poles: { low: "Débordé", high: "Aux commandes" }, highDescriptor: "à la hauteur des exigences de la vie et maître de votre contexte", lowDescriptor: "souvent débordé(e) par les exigences du quotidien" },
    GRO: { name: "Croissance personnelle", description: "Développement continu et ouverture au défi.", poles: { low: "Statique", high: "En croissance" }, highDescriptor: "en train de grandir, d'apprendre et de vous étendre", lowDescriptor: "avec un sentiment de stagnation" },
    REL: { name: "Relations positives", description: "Des relations chaleureuses, de confiance et généreuses.", poles: { low: "Sur la réserve", high: "Connecté" }, highDescriptor: "chaleureusement et profondément lié(e) aux autres", lowDescriptor: "plus isolé(e) ou sur la réserve dans les relations" },
    PUR: { name: "Sens de la vie", description: "Direction, sens et objectifs.", poles: { low: "À la dérive", high: "Habité par un but" }, highDescriptor: "ancré(e) dans un but et un sens clairs", lowDescriptor: "en quête de direction" },
    ACC: { name: "Acceptation de soi", description: "Un regard positif et apaisé sur vous-même et votre passé.", poles: { low: "Critique envers soi", high: "S'accepte" }, highDescriptor: "vous acceptant et en paix avec qui vous êtes", lowDescriptor: "critique envers vous-même ou troublé(e) par votre vie" },
  },
  items: {
    AU1: "Je n'ai pas peur d'exprimer mes opinions, même quand elles diffèrent de celles de la foule.", AU2: "Je me juge selon mes propres critères, pas selon ce que pensent les autres.", AU3: "Je me laisse facilement influencer par les opinions de mon entourage.",
    MA1: "Je gère bien les exigences de la vie quotidienne.", MA2: "J'ai bâti une vie et un environnement qui me conviennent.", MA3: "Les exigences du quotidien me submergent souvent.",
    GR1: "Je me vois grandir et me développer en tant que personne.", GR2: "Je recherche des expériences nouvelles qui remettent en question l'image que j'ai de moi.", GR3: "J'ai l'impression d'avoir cessé de grandir ou de m'améliorer.",
    RE1: "J'ai des relations chaleureuses et de confiance sur lesquelles je peux compter.", RE2: "On me décrirait comme une personne généreuse.", RE3: "J'ai du mal à m'ouvrir vraiment aux autres.",
    PU1: "J'ai un sens clair de direction et de but dans la vie.", PU2: "Mes objectifs donnent un sens à ma vie.", PU3: "Il m'arrive de sentir que ma vie manque de but réel.",
    AC1: "J'aime la plupart des aspects de qui je suis.", AC2: "Je suis largement en paix avec la façon dont ma vie a tourné.", AC3: "Je suis déçu(e) par beaucoup de choses dans ma vie.",
  },
};
const BURNOUT_ES: InstrumentTranslation = {
  name: "Chequeo de burnout", shortName: "Burnout",
  tagline: "Agotamiento, cinismo y eficacia: las tres caras del burnout.",
  description: "El burnout, tal como lo mapeó Christina Maslach, no es solo cansancio: es un síndrome con tres partes: agotamiento emocional, cinismo/distanciamiento y una sensación de logro que mengua. Este chequeo refleja las tres para que veas no solo cuán agotado/a te sientes, sino dónde se está produciendo la erosión, y dónde tu sensación de eficacia aún se mantiene.",
  scales: {
    EE: { name: "Agotamiento emocional", description: "Sentirse vaciado/a y exhausto/a por las exigencias.", poles: { low: "Con recursos", high: "Agotado" }, highDescriptor: "funcionando en vacío y emocionalmente exhausto/a", lowDescriptor: "con energía y recursos emocionales" },
    CY: { name: "Cinismo", description: "Distanciamiento y desencanto con el trabajo.", poles: { low: "Implicado", high: "Cínico" }, highDescriptor: "distante, cínico/a y desconectado/a", lowDescriptor: "implicado/a y conectado/a con tu trabajo" },
    PA: { name: "Eficacia profesional", description: "Sensación de logro y competencia.", poles: { low: "Mermada", high: "Eficaz" }, highDescriptor: "eficaz y logrando cosas que valen la pena", lowDescriptor: "dudando de tu impacto y tu competencia" },
  },
  items: {
    EE1: "Me siento emocionalmente agotado/a por mi trabajo y las exigencias diarias.", EE2: "Me siento exprimido/a al final del día.", EE3: "Solo llegar al final del día me supone un esfuerzo.", EE4: "Me siento quemado/a por mis responsabilidades.",
    CY1: "Me he vuelto más cínico/a sobre si mi trabajo importa de verdad.", CY2: "Me he distanciado más de las personas con las que o para las que trabajo.", CY3: "Solo quiero hacer mis tareas y que me dejen en paz.", CY4: "Cada vez dudo más del valor de lo que hago.",
    PA1: "Siento que estoy logrando cosas que valen la pena.", PA2: "Afronto los problemas con eficacia.", PA3: "Me siento con energía cuando hago bien mi trabajo.", PA4: "Tengo un impacto positivo en los demás a través de lo que hago.",
  },
};
const BURNOUT_FR: InstrumentTranslation = {
  name: "Bilan d'épuisement", shortName: "Épuisement",
  tagline: "Épuisement, cynisme et efficacité — les trois visages du burnout.",
  description: "Le burnout, tel que Christina Maslach l'a cartographié, n'est pas qu'une fatigue : c'est un syndrome à trois composantes — l'épuisement émotionnel, le cynisme/détachement, et un sentiment d'accomplissement qui s'amenuise. Ce bilan reflète les trois afin que vous voyiez non seulement à quel point vous vous sentez vidé(e), mais où l'érosion se produit — et où votre sentiment d'efficacité tient encore.",
  scales: {
    EE: { name: "Épuisement émotionnel", description: "Se sentir vidé(e) et épuisé(e) par les exigences.", poles: { low: "Ressourcé", high: "Épuisé" }, highDescriptor: "à court de tout et émotionnellement vidé(e)", lowDescriptor: "plein(e) d'énergie et de ressources émotionnelles" },
    CY: { name: "Cynisme", description: "Détachement et désillusion vis-à-vis du travail.", poles: { low: "Engagé", high: "Cynique" }, highDescriptor: "détaché(e), cynique et désengagé(e)", lowDescriptor: "engagé(e) et connecté(e) à votre travail" },
    PA: { name: "Efficacité professionnelle", description: "Sentiment d'accomplissement et de compétence.", poles: { low: "Diminuée", high: "Efficace" }, highDescriptor: "efficace et accomplissant des choses qui en valent la peine", lowDescriptor: "doutant de votre impact et de votre compétence" },
  },
  items: {
    EE1: "Je me sens émotionnellement vidé(e) par mon travail et les exigences quotidiennes.", EE2: "Je me sens épuisé(e) à la fin de la journée.", EE3: "Rien que traverser la journée me demande un effort.", EE4: "Je me sens épuisé(e) par mes responsabilités.",
    CY1: "Je suis devenu(e) plus cynique quant à savoir si mon travail compte vraiment.", CY2: "Je me suis détaché(e) des personnes avec qui ou pour qui je travaille.", CY3: "Je veux juste faire mes tâches et qu'on me laisse tranquille.", CY4: "Je doute de plus en plus de la valeur de ce que je fais.",
    PA1: "J'ai le sentiment d'accomplir des choses qui en valent la peine.", PA2: "Je gère les problèmes efficacement.", PA3: "Je me sens plein(e) d'énergie quand je fais bien mon travail.", PA4: "J'ai un impact positif sur les autres par ce que je fais.",
  },
};
const LOCUS_ES: InstrumentTranslation = {
  name: "Locus de control", shortName: "Locus",
  tagline: "¿Diriges tu vida o la vida te sucede?",
  description: "El locus de control es uno de los constructos más perdurables de la psicología: el grado en que crees que los resultados provienen de tus propias acciones (un locus interno) frente a la suerte, el destino y los demás poderosos (un locus externo). Un locus más interno predice mejor afrontamiento, logro y salud, pero la postura más sana es realista: hacerte cargo de lo que puedes mientras aceptas lo que no.",
  scales: {
    LOC: { name: "Locus interno", description: "Creencia de que tus propias acciones determinan tus resultados.", poles: { low: "Externo", high: "Interno" }, highDescriptor: "con sentido de agencia: sientes que llevas el timón", lowDescriptor: "externo/a: sientes que los resultados se te escapan de las manos" },
  },
  items: {
    L1: "Lo que me ocurre es sobre todo el resultado de mis propias acciones.", L2: "Puedo dar forma a mi futuro mediante las decisiones que tomo.", L3: "Cuando me esfuerzo, normalmente obtengo los resultados que quiero.", L4: "Si me preparo bien, puedo afrontar lo que venga.",
    L5: "Buena parte de lo que me ocurre es cuestión de suerte o destino.", L6: "Por más que lo intente, fuerzas fuera de mi control deciden el resultado.", L7: "Tiene poco sentido planificar: la vida es sobre todo azar.", L8: "Otras personas poderosas determinan en gran medida lo que puedo lograr.",
  },
};
const LOCUS_FR: InstrumentTranslation = {
  name: "Lieu de contrôle", shortName: "Locus",
  tagline: "Dirigez-vous votre vie, ou la vie vous arrive-t-elle ?",
  description: "Le lieu de contrôle est l'un des concepts les plus durables de la psychologie : la mesure dans laquelle vous croyez que les résultats découlent de vos propres actions (un lieu interne) plutôt que de la chance, du destin et des autres puissants (un lieu externe). Un lieu plus interne prédit un meilleur ajustement, de meilleures réussites et une meilleure santé — mais la posture la plus saine est réaliste : assumer ce que vous pouvez tout en acceptant ce que vous ne pouvez pas.",
  scales: {
    LOC: { name: "Lieu interne", description: "Conviction que vos propres actions déterminent vos résultats.", poles: { low: "Externe", high: "Interne" }, highDescriptor: "doté(e) d'un sentiment d'agir : vous tenez le volant", lowDescriptor: "externe : vous sentez que les résultats vous échappent" },
  },
  items: {
    L1: "Ce qui m'arrive résulte surtout de mes propres actions.", L2: "Je peux façonner mon avenir par les choix que je fais.", L3: "Quand je travaille dur, j'obtiens généralement les résultats que je veux.", L4: "Si je me prépare bien, je peux faire face à tout ce qui se présente.",
    L5: "Une grande partie de ce qui m'arrive est une question de chance ou de destin.", L6: "Quels que soient mes efforts, des forces hors de mon contrôle décident du résultat.", L7: "Il ne sert à rien de planifier — la vie est surtout affaire de hasard.", L8: "D'autres personnes puissantes déterminent en grande partie ce que je peux accomplir.",
  },
};
const SELFMON_ES: InstrumentTranslation = {
  name: "Automonitoreo", shortName: "Automonitoreo",
  tagline: "¿Camaleón social o el mismo en cada sala?",
  description: "El automonitoreo, un constructo clásico de la psicología social de Mark Snyder, capta cuánto observas y ajustas tu autopresentación para encajar en el momento. Quienes puntúan alto leen las situaciones y se adaptan a ellas; quienes puntúan bajo se mantienen fieles a su estado interior en cualquier contexto. Cada estilo tiene ventajas sociales reales, y también costes.",
  scales: {
    SM: { name: "Automonitoreo", description: "Tendencia a observar y ajustar la autopresentación a la situación.", poles: { low: "Consistente", high: "Adaptable" }, highDescriptor: "adaptable y atento/a a la situación (un camaleón social)", lowDescriptor: "consistente y fiel a sí mismo/a en cualquier contexto" },
  },
  items: {
    M1: "En situaciones sociales, ajusto mi comportamiento a quienquiera con quien esté.", M2: "Se me da bien leer el ambiente y actuar en consecuencia.", M3: "Puedo presentarme de formas bastante distintas según la situación.", M4: "Puedo mirar a alguien a los ojos y soltar una mentira piadosa sin inmutarme.",
    M5: "Probablemente sería un actor decente.", M6: "Mi comportamiento suele ser una expresión honesta de cómo me siento de verdad, sea cual sea el contexto.", M7: "Me cuesta cambiar mi comportamiento para adaptarme a distintas personas y situaciones.", M8: "Rara vez finjo para impresionar o agradar a la gente.",
  },
};
const SELFMON_FR: InstrumentTranslation = {
  name: "Monitorage de soi", shortName: "Monitorage",
  tagline: "Caméléon social ou le même dans chaque pièce ?",
  description: "Le monitorage de soi, un concept classique de la psychologie sociale dû à Mark Snyder, mesure à quel point vous observez et ajustez votre présentation de vous-même pour coller au moment. Les hauts monitoreurs lisent les situations et s'y adaptent ; les bas monitoreurs restent fidèles à leur état intérieur en toute circonstance. Chaque style a de réels avantages sociaux — et des coûts.",
  scales: {
    SM: { name: "Monitorage de soi", description: "Tendance à observer et ajuster sa présentation de soi à la situation.", poles: { low: "Constant", high: "Adaptable" }, highDescriptor: "adaptable et à l'écoute de la situation (un caméléon social)", lowDescriptor: "constant(e) et fidèle à soi en toute circonstance" },
  },
  items: {
    M1: "Dans les situations sociales, j'ajuste mon comportement à la personne avec qui je suis.", M2: "Je sais lire une assemblée et agir en conséquence.", M3: "Je peux me présenter très différemment selon la situation.", M4: "Je peux regarder quelqu'un dans les yeux et dire un pieux mensonge sans broncher.",
    M5: "Je ferais sans doute un acteur correct.", M6: "Mon comportement est généralement une expression honnête de ce que je ressens vraiment, quel que soit le contexte.", M7: "J'ai du mal à changer mon comportement pour m'adapter à différentes personnes et situations.", M8: "Je fais rarement semblant pour impressionner ou plaire aux gens.",
  },
};
const MORAL_ES: InstrumentTranslation = {
  name: "Fundamentos morales", shortName: "Fund. morales",
  tagline: "Las intuiciones bajo tu sentido del bien y el mal.",
  description: "La Teoría de los Fundamentos Morales sostiene que nuestros juicios morales se apoyan en un puñado de fundamentos intuitivos: cuidado, equidad, lealtad, autoridad y santidad. Cuáles pesan más en ti moldea tus valores, tu política y dónde chocas con los demás. Este perfilador muestra tu huella moral: ningún fundamento es correcto o incorrecto.",
  scales: {
    CARE: { name: "Cuidado / Daño", description: "Sensibilidad al sufrimiento y compasión.", highDescriptor: "compasivo/a y protector/a de los vulnerables", lowDescriptor: "menos guiado/a por evitar el daño en tus juicios morales" },
    FAIR: { name: "Equidad / Trampa", description: "Preocupación por la justicia, los derechos y la proporcionalidad.", highDescriptor: "con sentido de la justicia y atento/a a la equidad y los derechos", lowDescriptor: "menos centrado/a en la equidad en tus juicios morales" },
    LOYAL: { name: "Lealtad / Traición", description: "Valorar la solidaridad y la fidelidad al grupo.", highDescriptor: "leal, con sentido de grupo y entregado/a a los tuyos", lowDescriptor: "más individualista que fiel al grupo" },
    AUTH: { name: "Autoridad / Subversión", description: "Respeto por la autoridad legítima y la tradición.", highDescriptor: "respetuoso/a del orden, la jerarquía y la tradición", lowDescriptor: "más escéptico/a ante la autoridad y la tradición" },
    SANCT: { name: "Santidad / Degradación", description: "Preocupación por la pureza, la decencia y lo sagrado.", highDescriptor: "atento/a a la santidad, la decencia y lo sagrado", lowDescriptor: "menos movido/a por preocupaciones de pureza o santidad" },
  },
  items: {
    CARE1: "Que alguien haya sufrido o no es central en cómo juzgo una acción.", CARE2: "La compasión por quienes sufren es una de las virtudes más importantes.", CARE3: "Está profundamente mal dañar a una criatura vulnerable o indefensa.",
    FAIR1: "La justicia y tratar a las personas por igual es una de mis máximas prioridades.", FAIR2: "Me molesta profundamente que se le nieguen a alguien sus derechos.", FAIR3: "Las personas deberían ser recompensadas en proporción a lo que aportan.",
    LOYAL1: "La lealtad a mi grupo, mi familia o mi país me importa muchísimo.", LOYAL2: "Las personas deberían apoyar a su comunidad, aun a costa personal.", LOYAL3: "Traicionar a tu grupo es una de las peores cosas que se pueden hacer.",
    AUTH1: "Valoro el respeto por la autoridad legítima y la tradición.", AUTH2: "La sociedad funciona mejor cuando la gente sigue a líderes y normas legítimos.", AUTH3: "Se debería enseñar a los niños a respetar a sus mayores.",
    SANCT1: "Algunas cosas son sagradas y nunca deberían profanarse.", SANCT2: "Me importa si las acciones son decentes y puras frente a degradantes.", SANCT3: "Las personas deberían mantener ciertos estándares de decencia y autodisciplina.",
  },
};
const MORAL_FR: InstrumentTranslation = {
  name: "Fondements moraux", shortName: "Fond. moraux",
  tagline: "Les intuitions sous votre sens du bien et du mal.",
  description: "La théorie des fondements moraux montre que nos jugements moraux reposent sur une poignée de fondements intuitifs : bienveillance, équité, loyauté, autorité et sainteté. Ceux qui pèsent le plus pour vous façonnent vos valeurs, votre politique et vos points de friction avec autrui. Ce profileur révèle votre empreinte morale — aucun fondement n'est juste ou faux.",
  scales: {
    CARE: { name: "Bienveillance / Préjudice", description: "Sensibilité à la souffrance et compassion.", highDescriptor: "compatissant(e) et protecteur(trice) des plus vulnérables", lowDescriptor: "moins guidé(e) par l'évitement du préjudice dans vos jugements moraux" },
    FAIR: { name: "Équité / Tricherie", description: "Souci de la justice, des droits et de la proportionnalité.", highDescriptor: "soucieux(se) de justice et attentif(ve) à l'équité et aux droits", lowDescriptor: "moins centré(e) sur l'équité dans vos jugements moraux" },
    LOYAL: { name: "Loyauté / Trahison", description: "Valoriser la solidarité et la fidélité au groupe.", highDescriptor: "loyal(e), attaché(e) au groupe et dévoué(e) aux vôtres", lowDescriptor: "plus individualiste que loyal(e) au groupe" },
    AUTH: { name: "Autorité / Subversion", description: "Respect de l'autorité légitime et de la tradition.", highDescriptor: "respectueux(se) de l'ordre, de la hiérarchie et de la tradition", lowDescriptor: "plus sceptique envers l'autorité et la tradition" },
    SANCT: { name: "Sainteté / Dégradation", description: "Souci de la pureté, de la décence et du sacré.", highDescriptor: "attentif(ve) à la sainteté, à la décence et au sacré", lowDescriptor: "moins touché(e) par les préoccupations de pureté ou de sainteté" },
  },
  items: {
    CARE1: "Le fait que quelqu'un ait souffert ou non est central dans ma façon de juger une action.", CARE2: "La compassion pour ceux qui souffrent est l'une des vertus les plus importantes.", CARE3: "Il est profondément mal de nuire à une créature vulnérable ou sans défense.",
    FAIR1: "La justice et le traitement égal des personnes comptent parmi mes plus hautes priorités.", FAIR2: "Cela me dérange profondément qu'on prive quelqu'un de ses droits.", FAIR3: "Les gens devraient être récompensés en proportion de ce qu'ils apportent.",
    LOYAL1: "La loyauté envers mon groupe, ma famille ou mon pays compte énormément pour moi.", LOYAL2: "On devrait soutenir sa communauté, même à titre personnel coûteux.", LOYAL3: "Trahir son groupe est l'une des pires choses qu'une personne puisse faire.",
    AUTH1: "Je tiens au respect de l'autorité légitime et de la tradition.", AUTH2: "La société fonctionne mieux quand les gens suivent des dirigeants et des règles légitimes.", AUTH3: "On devrait apprendre aux enfants à respecter leurs aînés.",
    SANCT1: "Certaines choses sont sacrées et ne devraient jamais être violées.", SANCT2: "Je me soucie de savoir si les actions sont décentes et pures plutôt que dégradantes.", SANCT3: "Les gens devraient maintenir certaines normes de décence et d'autodiscipline.",
  },
};
const BFAS_ES: InstrumentTranslation = {
  name: "Aspectos de los Cinco Grandes", shortName: "BFAS",
  tagline: "Diez aspectos: la capa de detalle entre los Cinco Grandes y sus facetas.",
  description: "Cada dominio de los Cinco Grandes contiene en realidad dos 'aspectos' distintos; por ejemplo, la responsabilidad se divide en laboriosidad y orden, y el neuroticismo en volatilidad y retraimiento. Este perfilador mide los diez, dándote una lectura más nítida y accionable que los cinco dominios amplios por sí solos, y mostrando dónde dos caras del mismo rasgo tiran en direcciones distintas.",
  scales: {
    INT: { name: "Intelecto", description: "Implicación con las ideas y el razonamiento (aspecto de la apertura).", poles: { low: "Concreto", high: "Intelectual" }, highDescriptor: "movido/a por las ideas y ágil con lo abstracto", lowDescriptor: "práctico/a y poco interesado/a en la abstracción" },
    AES: { name: "Apertura", description: "Sensibilidad estética e imaginación (aspecto de la apertura).", poles: { low: "Convencional", high: "Imaginativo" }, highDescriptor: "imaginativo/a y conmovido/a por la belleza", lowDescriptor: "con los pies en la tierra y literal" },
    IND: { name: "Laboriosidad", description: "Impulso por trabajar y lograr (aspecto de la responsabilidad).", poles: { low: "Despreocupado", high: "Tenaz" }, highDescriptor: "trabajador/a y persistente", lowDescriptor: "relajado/a y fácil de distraer" },
    ORD: { name: "Orden", description: "Necesidad de orden y rutina (aspecto de la responsabilidad).", poles: { low: "Flexible", high: "Ordenado" }, highDescriptor: "ordenado/a, planificado/a y estructurado/a", lowDescriptor: "suelto/a, espontáneo/a y desordenado/a" },
    ENT: { name: "Entusiasmo", description: "Sociabilidad y emoción positiva (aspecto de la extraversión).", poles: { low: "Reservado", high: "Entusiasta" }, highDescriptor: "cálido/a, extrovertido/a y alegre", lowDescriptor: "callado/a y emocionalmente contenido/a" },
    ASR: { name: "Asertividad", description: "Impulso por liderar e influir (aspecto de la extraversión).", poles: { low: "Deferente", high: "Asertivo" }, highDescriptor: "enérgico/a, con iniciativa y visible", lowDescriptor: "modesto/a y entre bastidores" },
    COM: { name: "Compasión", description: "Preocupación emocional por los demás (aspecto de la amabilidad).", poles: { low: "Distante", high: "Compasivo" }, highDescriptor: "empático/a y afectuoso/a", lowDescriptor: "frío/a y emocionalmente al margen" },
    POL: { name: "Cortesía", description: "Respeto por los demás y contención (aspecto de la amabilidad).", poles: { low: "Confrontador", high: "Cortés" }, highDescriptor: "deferente y poco confrontador/a", lowDescriptor: "directo/a, retador/a e insistente" },
    VOL: { name: "Volatilidad", description: "Irritabilidad y vaivenes emocionales (aspecto del neuroticismo).", poles: { low: "Sereno", high: "Volátil" }, highDescriptor: "fácil de alterar y rápido/a para enfadarse", lowDescriptor: "tranquilo/a y lento/a para enfadarse" },
    WTH: { name: "Retraimiento", description: "Ansiedad y ánimo bajo (aspecto del neuroticismo).", poles: { low: "Resiliente", high: "Retraído" }, highDescriptor: "propenso/a a la preocupación y al ánimo bajo", lowDescriptor: "estable, esperanzado/a y difícil de desanimar" },
  },
  items: {
    INT1: "Capto rápidamente ideas abstractas o complejas.", INT2: "Evito las discusiones difíciles o filosóficas.",
    AES1: "Me conmueven profundamente el arte, la música o la belleza natural.", AES2: "Rara vez me pierdo en la imaginación o la fantasía.",
    IND1: "Me exijo para sacar las cosas adelante y terminar lo que empiezo.", IND2: "A menudo aplazo tareas y me cuesta llevarlas a cabo.",
    ORD1: "Me gusta mantener las cosas ordenadas, planificadas y organizadas.", ORD2: "Tiendo a dejar mis cosas hechas un desastre.",
    ENT1: "Soy alegre y hago amigos con facilidad.", ENT2: "Rara vez me siento efusivo/a o emocionado/a.",
    ASR1: "Tomo la iniciativa y alzo la voz en los grupos.", ASR2: "Me contengo a la hora de liderar o hacerme valer.",
    COM1: "Siento las emociones de los demás y me importa su bienestar.", COM2: "Los problemas de los demás no me afectan demasiado.",
    POL1: "Evito pasar por encima de los demás y respeto sus deseos.", POL2: "Puedo ser confrontador/a o insistente.",
    VOL1: "Me irrito o me altero con facilidad.", VOL2: "Mantengo la calma incluso cuando me provocan.",
    WTH1: "A menudo me siento ansioso/a, decaído/a o desanimado/a.", WTH2: "Rara vez me siento triste o desbordado/a.",
  },
};
const BFAS_FR: InstrumentTranslation = {
  name: "Aspects des Big Five", shortName: "BFAS",
  tagline: "Dix aspects — le niveau de détail entre les Big Five et leurs facettes.",
  description: "Chaque domaine des Big Five contient en réalité deux « aspects » distincts — par exemple, la conscience se divise en assiduité et ordre, et le névrosisme en volatilité et retrait. Ce profileur mesure les dix, offrant une lecture plus nette et plus actionnable que les cinq grands domaines seuls — et montrant où les deux faces d'un même trait tirent dans des directions opposées.",
  scales: {
    INT: { name: "Intellect", description: "Rapport aux idées et au raisonnement (aspect de l'ouverture).", poles: { low: "Concret", high: "Intellectuel" }, highDescriptor: "porté(e) par les idées et vif(ve) avec l'abstrait", lowDescriptor: "pratique et peu intéressé(e) par l'abstraction" },
    AES: { name: "Ouverture", description: "Sensibilité esthétique et imagination (aspect de l'ouverture).", poles: { low: "Conventionnel", high: "Imaginatif" }, highDescriptor: "imaginatif(ve) et touché(e) par la beauté", lowDescriptor: "terre-à-terre et littéral(e)" },
    IND: { name: "Assiduité", description: "Élan au travail et à la réussite (aspect de la conscience).", poles: { low: "Décontracté", high: "Acharné" }, highDescriptor: "travailleur(se) et persévérant(e)", lowDescriptor: "détendu(e) et facilement distrait(e)" },
    ORD: { name: "Ordre", description: "Besoin d'ordre et de routine (aspect de la conscience).", poles: { low: "Flexible", high: "Ordonné" }, highDescriptor: "ordonné(e), planifié(e) et structuré(e)", lowDescriptor: "relâché(e), spontané(e) et désordonné(e)" },
    ENT: { name: "Enthousiasme", description: "Sociabilité et émotion positive (aspect de l'extraversion).", poles: { low: "Réservé", high: "Enthousiaste" }, highDescriptor: "chaleureux(se), sociable et enjoué(e)", lowDescriptor: "discret(ète) et émotionnellement contenu(e)" },
    ASR: { name: "Assertivité", description: "Élan à diriger et à influencer (aspect de l'extraversion).", poles: { low: "Effacé", high: "Affirmé" }, highDescriptor: "énergique, prenant les devants et visible", lowDescriptor: "modeste et en coulisses" },
    COM: { name: "Compassion", description: "Souci émotionnel d'autrui (aspect de l'agréabilité).", poles: { low: "Détaché", high: "Compatissant" }, highDescriptor: "empathique et attentionné(e)", lowDescriptor: "froid(e) et émotionnellement à l'écart" },
    POL: { name: "Politesse", description: "Respect d'autrui et retenue (aspect de l'agréabilité).", poles: { low: "Frondeur", high: "Poli" }, highDescriptor: "déférent(e) et peu conflictuel(le)", lowDescriptor: "direct(e), provocateur(trice) et insistant(e)" },
    VOL: { name: "Volatilité", description: "Irritabilité et sautes d'humeur (aspect du névrosisme).", poles: { low: "Posé", high: "Volatil" }, highDescriptor: "facilement contrarié(e) et prompt(e) à la colère", lowDescriptor: "calme et lent(e) à la colère" },
    WTH: { name: "Retrait", description: "Anxiété et humeur basse (aspect du névrosisme).", poles: { low: "Résilient", high: "En retrait" }, highDescriptor: "enclin(e) à l'inquiétude et à l'humeur basse", lowDescriptor: "stable, optimiste et difficile à décourager" },
  },
  items: {
    INT1: "Je saisis rapidement les idées abstraites ou complexes.", INT2: "J'évite les discussions difficiles ou philosophiques.",
    AES1: "Je suis profondément ému(e) par l'art, la musique ou la beauté de la nature.", AES2: "Je me perds rarement dans l'imagination ou la fantaisie.",
    IND1: "Je me pousse à avancer et à terminer ce que je commence.", IND2: "Je remets souvent les tâches à plus tard et j'ai du mal à les mener à bien.",
    ORD1: "J'aime garder les choses rangées, planifiées et organisées.", ORD2: "J'ai tendance à laisser mes affaires en désordre.",
    ENT1: "Je suis enjoué(e) et je me fais des amis facilement.", ENT2: "Je me sens rarement pétillant(e) ou excité(e).",
    ASR1: "Je prends les choses en main et je m'exprime dans les groupes.", ASR2: "Je me retiens de diriger ou de m'imposer.",
    COM1: "Je ressens les émotions des autres et je me soucie de leur bien-être.", COM2: "Les problèmes des autres ne m'affectent pas beaucoup.",
    POL1: "J'évite de marcher sur les autres et je respecte leurs souhaits.", POL2: "Je peux être conflictuel(le) ou insistant(e).",
    VOL1: "Je m'irrite ou me contrarie facilement.", VOL2: "Je garde mon calme même quand on me provoque.",
    WTH1: "Je me sens souvent anxieux(se), abattu(e) ou découragé(e).", WTH2: "Je me sens rarement triste ou débordé(e).",
  },
};
const DERAIL_ES: InstrumentTranslation = {
  name: "Descarriladores profesionales", shortName: "Descarriladores",
  tagline: "Las fortalezas que te sabotean en silencio bajo presión.",
  description: "La mayoría de los reveses profesionales no se deben a la falta de habilidades, sino a fortalezas sobreutilizadas. La tradición de los 'descarriladores' (iniciada por el Hogan Development Survey) mapea las tendencias que te sirven casi todos los días pero te perjudican bajo estrés: volatilidad, suspicacia, cautela, exceso de confianza, transgresión de normas, perfeccionismo y excesiva deferencia. Conocer los tuyos es cómo evitas que tomen el mando en los peores momentos.",
  scales: {
    VOL: { name: "Volátil", description: "Cambios de humor y arrebatos bajo presión (pasión sobreutilizada).", poles: { low: "Sereno", high: "Volátil" }, highDescriptor: "intenso/a y fácil de detonar cuando hay estrés", lowDescriptor: "estable y difícil de alterar" },
    SKE: { name: "Escéptico", description: "Desconfianza y cinismo (perspicacia sobreutilizada).", poles: { low: "Confiado", high: "Escéptico" }, highDescriptor: "vigilante, desconfiado/a y rápido/a para sospechar", lowDescriptor: "confiado/a y abierto/a" },
    CAU: { name: "Cauto", description: "Aversión al riesgo e indecisión (prudencia sobreutilizada).", poles: { low: "Decidido", high: "Cauto" }, highDescriptor: "dubitativo/a y con miedo a equivocarse", lowDescriptor: "decidido/a y dispuesto/a a actuar" },
    BOL: { name: "Audaz", description: "Exceso de confianza y sensación de merecimiento (autoconfianza sobreutilizada).", poles: { low: "Modesto", high: "Audaz" }, highDescriptor: "tan seguro/a de ti que te sobreestimas", lowDescriptor: "modesto/a y autocrítico/a" },
    MIS: { name: "Travieso", description: "Asunción de riesgos y transgresión de normas (encanto sobreutilizado).", poles: { low: "Prudente", high: "Travieso" }, highDescriptor: "que tantea los límites y dobla las reglas", lowDescriptor: "cuidadoso/a y respetuoso/a de las normas" },
    PER: { name: "Perfeccionista", description: "Exceso de control y microgestión (diligencia sobreutilizada).", poles: { low: "Flexible", high: "Perfeccionista" }, highDescriptor: "exigente, controlador/a y reacio/a a delegar", lowDescriptor: "flexible y que confía en los demás" },
    DUT: { name: "Cumplidor", description: "Excesiva deferencia y complacencia (lealtad sobreutilizada).", poles: { low: "Independiente", high: "Cumplidor" }, highDescriptor: "que evita el conflicto y ansía complacer a la autoridad", lowDescriptor: "independiente y dispuesto/a a cuestionar" },
  },
  items: {
    VOL1: "Bajo estrés puedo estallar, saltar o perder los nervios.", VOL2: "Mantengo el temple incluso cuando las cosas van mal.",
    SKE1: "Sospecho rápido de las intenciones de los demás.", SKE2: "Concedo con facilidad a la gente el beneficio de la duda.",
    CAU1: "El miedo a equivocarme me hace dudar antes de actuar o decidir.", CAU2: "Tomo decisiones con facilidad, sin darle demasiadas vueltas.",
    BOL1: "Tengo mucha confianza en mis capacidades, quizá más de la que debería.", BOL2: "Admito sin problema cuando me equivoco o algo me supera.",
    MIS1: "Disfruto poniendo a prueba los límites y asumiendo riesgos que otros evitarían.", MIS2: "Voy a lo seguro y me ciño a las reglas.",
    PER1: "Mis estándares son tan altos que me cuesta delegar o soltar las cosas.", PER2: "Me conformo con lo 'suficientemente bueno' y confío en que otros cumplan.",
    DUT1: "Evito hacer ruido y cedo ante quienes están por encima de mí.", DUT2: "Planto cara a la autoridad cuando de verdad no estoy de acuerdo.",
  },
};
const DERAIL_FR: InstrumentTranslation = {
  name: "Dérailleurs de carrière", shortName: "Dérailleurs",
  tagline: "Les forces qui vous sabotent en silence sous la pression.",
  description: "La plupart des revers de carrière ne viennent pas d'un manque de compétences, mais de forces surutilisées. La tradition des « dérailleurs » (initiée par le Hogan Development Survey) cartographie les tendances qui vous servent presque tous les jours mais vous desservent sous la pression : volatilité, méfiance, prudence, excès de confiance, transgression des règles, perfectionnisme et déférence excessive. Connaître les vôtres, c'est les empêcher de prendre le volant aux pires moments.",
  scales: {
    VOL: { name: "Volatil", description: "Sautes d'humeur et emportements sous pression (passion surutilisée).", poles: { low: "Posé", high: "Volatil" }, highDescriptor: "intense et vite déclenché(e) sous le stress", lowDescriptor: "stable et difficile à ébranler" },
    SKE: { name: "Sceptique", description: "Méfiance et cynisme (perspicacité surutilisée).", poles: { low: "Confiant", high: "Sceptique" }, highDescriptor: "sur ses gardes, méfiant(e) et prompt(e) à soupçonner", lowDescriptor: "confiant(e) et ouvert(e)" },
    CAU: { name: "Prudent", description: "Aversion au risque et indécision (prudence surutilisée).", poles: { low: "Décidé", high: "Prudent" }, highDescriptor: "hésitant(e) et craignant l'erreur", lowDescriptor: "décidé(e) et prêt(e) à agir" },
    BOL: { name: "Audacieux", description: "Excès de confiance et sentiment de dû (confiance en soi surutilisée).", poles: { low: "Modeste", high: "Audacieux" }, highDescriptor: "sûr(e) de vous au point de vous surestimer", lowDescriptor: "modeste et porté(e) à vous remettre en question" },
    MIS: { name: "Espiègle", description: "Prise de risque et transgression des règles (charme surutilisé).", poles: { low: "Prudent", high: "Espiègle" }, highDescriptor: "qui teste les limites et contourne les règles", lowDescriptor: "prudent(e) et respectueux(se) des règles" },
    PER: { name: "Perfectionniste", description: "Excès de contrôle et microgestion (diligence surutilisée).", poles: { low: "Flexible", high: "Perfectionniste" }, highDescriptor: "exigeant(e), contrôlant(e) et réticent(e) à déléguer", lowDescriptor: "flexible et confiant(e) envers les autres" },
    DUT: { name: "Dévoué", description: "Déférence excessive et désir de plaire (loyauté surutilisée).", poles: { low: "Indépendant", high: "Dévoué" }, highDescriptor: "évitant le conflit et soucieux(se) de plaire à l'autorité", lowDescriptor: "indépendant(e) et prêt(e) à contester" },
  },
  items: {
    VOL1: "Sous le stress, je peux exploser, m'emporter ou perdre mon calme.", VOL2: "Je garde mon sang-froid même quand les choses tournent mal.",
    SKE1: "Je suis prompt(e) à soupçonner les motivations des autres.", SKE2: "J'accorde volontiers aux gens le bénéfice du doute.",
    CAU1: "La peur de me tromper me fait hésiter à agir ou à décider.", CAU2: "Je prends des décisions facilement, sans trop m'inquiéter.",
    BOL1: "J'ai une grande confiance en mes capacités — peut-être plus que je ne le devrais.", BOL2: "J'admets volontiers quand j'ai tort ou que je suis dépassé(e).",
    MIS1: "J'aime tester les limites et prendre des risques que d'autres éviteraient.", MIS2: "Je joue la sécurité et je m'en tiens aux règles.",
    PER1: "Mes exigences sont si élevées que j'ai du mal à déléguer ou à lâcher prise.", PER2: "Je me contente du « assez bien » et je fais confiance aux autres pour livrer.",
    DUT1: "J'évite de faire des vagues et je m'incline devant mes supérieurs.", DUT2: "Je tiens tête à l'autorité quand je suis vraiment en désaccord.",
  },
};
const PID5_ES: InstrumentTranslation = {
  name: "Dominios de rasgos desadaptativos", shortName: "Dominios",
  tagline: "Los cinco dominios de rasgos del DSM-5: el reflejo 'difícil' de los Cinco Grandes.",
  description: "La psiquiatría moderna describe la dificultad de la personalidad no como casillas, sino como dimensiones: cinco amplios dominios de rasgos que son esencialmente el extremo desadaptativo de los Cinco Grandes: afectividad negativa, desapego, antagonismo, desinhibición y psicoticismo. Este cribado educativo mapea dónde te sitúas en cada uno, como estímulo para el autoconocimiento, nunca como diagnóstico.",
  scales: {
    NEGA: { name: "Afectividad negativa", description: "Emoción negativa frecuente e intensa (el polo desadaptativo del neuroticismo alto).", poles: { low: "Estable", high: "Volátil" }, highDescriptor: "emocionalmente intenso/a, ansioso/a y fácil de desbordar", lowDescriptor: "emocionalmente estable y lento/a para angustiarse" },
    DETA: { name: "Desapego", description: "Retraimiento y menor placer (el polo desadaptativo de la extraversión baja).", poles: { low: "Implicado", high: "Desapegado" }, highDescriptor: "retraído/a, apagado/a y evitando la intimidad", lowDescriptor: "implicado/a, cálido/a y emocionalmente presente" },
    ANTA: { name: "Antagonismo", description: "Manipulación y grandiosidad (el polo desadaptativo de la amabilidad baja).", poles: { low: "Amable", high: "Antagonista" }, highDescriptor: "interesado/a, manipulador/a y con sensación de merecimiento", lowDescriptor: "honesto/a, considerado/a y cooperador/a" },
    DISI: { name: "Desinhibición", description: "Impulsividad e irresponsabilidad (el polo desadaptativo de la responsabilidad baja).", poles: { low: "Controlado", high: "Desinhibido" }, highDescriptor: "impulsivo/a, distraíble y poco fiable", lowDescriptor: "controlado/a, fiable y previsor/a" },
    PSYO: { name: "Psicoticismo", description: "Experiencias inusuales y pensamiento excéntrico (el polo desadaptativo de la apertura alta).", poles: { low: "Convencional", high: "Excéntrico" }, highDescriptor: "poco convencional, con percepciones inusuales y pensamiento disperso", lowDescriptor: "convencional y de pensamiento claro" },
  },
  items: {
    NA1: "Mis emociones oscilan con intensidad y pueden cambiar rápido.", NA2: "Me preocupo por muchísimas cosas distintas.", NA3: "Me pongo muy ansioso/a cuando personas importantes para mí podrían alejarse.", NA4: "Pequeños estreses pueden dejarme con sensación de desbordamiento.",
    DE1: "Mantengo las distancias con la gente, incluso con quienes están cerca de mí.", DE2: "Rara vez obtengo mucho placer o entusiasmo de la vida.", DE3: "Por lo general prefiero estar solo/a a estar con otros.", DE4: "No muestro mucha emoción a los demás.",
    AN1: "Uso el encanto o la adulación para conseguir lo que quiero.", AN2: "Siento que merezco un trato especial.", AN3: "Distorsiono la verdad cuando me conviene.", AN4: "No me importa anteponer mis intereses a los de los demás.",
    DI1: "Actúo por impulso sin pensar en las consecuencias.", DI2: "A menudo no cumplo con mis obligaciones.", DI3: "Me distraigo con facilidad y dejo cosas sin terminar.", DI4: "Asumo riesgos que podrían causarme verdaderos problemas.",
    PS1: "Tengo experiencias que a otros les costaría creer.", PS2: "Mis pensamientos a menudo se sienten dispersos o difíciles de seguir.", PS3: "La gente me dice que mis ideas o mi comportamiento son inusuales o excéntricos.", PS4: "A veces tengo percepciones o corazonadas que cuesta explicar.",
  },
};
const PID5_FR: InstrumentTranslation = {
  name: "Domaines de traits inadaptés", shortName: "Domaines",
  tagline: "Les cinq domaines de traits du DSM-5 — le miroir « difficile » des Big Five.",
  description: "La psychiatrie moderne décrit la difficulté de la personnalité non par des cases, mais par des dimensions : cinq grands domaines de traits qui sont essentiellement l'extrémité inadaptée des Big Five — affectivité négative, détachement, antagonisme, désinhibition et psychoticisme. Ce dépistage éducatif situe où vous vous trouvez sur chacun, comme invitation à mieux se comprendre — jamais un diagnostic.",
  scales: {
    NEGA: { name: "Affectivité négative", description: "Émotion négative fréquente et intense (le pôle inadapté du névrosisme élevé).", poles: { low: "Stable", high: "Volatil" }, highDescriptor: "émotionnellement intense, anxieux(se) et facilement débordé(e)", lowDescriptor: "émotionnellement stable et lent(e) à la détresse" },
    DETA: { name: "Détachement", description: "Retrait et moindre plaisir (le pôle inadapté de l'extraversion basse).", poles: { low: "Engagé", high: "Détaché" }, highDescriptor: "en retrait, éteint(e) et évitant l'intimité", lowDescriptor: "engagé(e), chaleureux(se) et présent(e) émotionnellement" },
    ANTA: { name: "Antagonisme", description: "Manipulation et grandiosité (le pôle inadapté de l'agréabilité basse).", poles: { low: "Agréable", high: "Antagoniste" }, highDescriptor: "intéressé(e), trompeur(se) et avec un sentiment de dû", lowDescriptor: "honnête, prévenant(e) et coopératif(ve)" },
    DISI: { name: "Désinhibition", description: "Impulsivité et irresponsabilité (le pôle inadapté de la conscience basse).", poles: { low: "Contrôlé", high: "Désinhibé" }, highDescriptor: "impulsif(ve), distrait(e) et peu fiable", lowDescriptor: "contrôlé(e), fiable et prévoyant(e)" },
    PSYO: { name: "Psychoticisme", description: "Expériences inhabituelles et pensée excentrique (le pôle inadapté de l'ouverture élevée).", poles: { low: "Conventionnel", high: "Excentrique" }, highDescriptor: "peu conventionnel(le), avec des perceptions inhabituelles et une pensée éparse", lowDescriptor: "conventionnel(le) et à la pensée claire" },
  },
  items: {
    NA1: "Mes émotions oscillent intensément et peuvent changer vite.", NA2: "Je m'inquiète d'un très grand nombre de choses.", NA3: "Je deviens très anxieux(se) quand des personnes importantes pour moi pourraient s'éloigner.", NA4: "De petits stress peuvent me laisser un sentiment de débordement.",
    DE1: "Je garde mes distances avec les gens, même les proches.", DE2: "Je tire rarement beaucoup de plaisir ou d'enthousiasme de la vie.", DE3: "Je préfère généralement être seul(e) qu'avec les autres.", DE4: "Je ne montre pas beaucoup d'émotion aux autres.",
    AN1: "J'use de charme ou de flatterie pour obtenir ce que je veux.", AN2: "J'ai le sentiment de mériter un traitement spécial.", AN3: "Je déforme la vérité quand cela m'arrange.", AN4: "Cela ne me dérange pas de faire passer mes intérêts bien avant ceux des autres.",
    DI1: "J'agis sur un coup de tête sans penser aux conséquences.", DI2: "Je ne tiens souvent pas mes obligations.", DI3: "Je me laisse facilement distraire et je laisse des choses inachevées.", DI4: "Je prends des risques qui pourraient me causer de vrais problèmes.",
    PS1: "J'ai des expériences que d'autres auraient du mal à croire.", PS2: "Mes pensées semblent souvent éparses ou difficiles à suivre.", PS3: "On me dit que mes idées ou mon comportement sont inhabituels ou excentriques.", PS4: "J'ai parfois des perceptions ou des intuitions difficiles à expliquer.",
  },
};
const ROKEACH_ES: InstrumentTranslation = {
  name: "Valores de Rokeach", shortName: "Rokeach",
  tagline: "Metas finales frente a formas de actuar: el mapa clásico de cuatro vías de lo que valoras.",
  description: "Milton Rokeach dividió los valores humanos de dos maneras: valores terminales (los estados finales por los que vivimos) frente a valores instrumentales (las formas de comportarse que apreciamos), y fines personales frente a sociales. El cruce da cuatro orientaciones, un complemento esclarecedor al círculo de Schwartz, que muestra si tu brújula apunta a fines personales o compartidos, y a una conducta moral o basada en la competencia.",
  scales: {
    TERMP: { name: "Terminal · personal", description: "Estados finales deseados para ti (una buena vida, paz interior, logro).", poles: { low: "Menos central", high: "Central" }, highDescriptor: "centrado/a en la realización personal y una buena vida", lowDescriptor: "menos orientado/a a metas finales personales" },
    TERMS: { name: "Terminal · social", description: "Estados finales deseados para el mundo (paz, igualdad, libertad).", poles: { low: "Menos central", high: "Central" }, highDescriptor: "movido/a por la justicia y el bien común", lowDescriptor: "menos orientado/a a metas finales sociales" },
    INSTM: { name: "Instrumental · moral", description: "Formas de actuar valoradas hacia los demás (honesto, servicial, indulgente).", poles: { low: "Menos central", high: "Central" }, highDescriptor: "guiado/a por la honestidad, la amabilidad y la integridad", lowDescriptor: "menos guiado/a por valores de conducta moral" },
    INSTC: { name: "Instrumental · competencia", description: "Formas de actuar valoradas respecto a la capacidad (capaz, ambicioso, lógico).", poles: { low: "Menos central", high: "Central" }, highDescriptor: "guiado/a por la competencia, la ambición y la eficacia", lowDescriptor: "menos guiado/a por valores de competencia" },
  },
  items: {
    TP1: "Una vida cómoda y placentera para mí es una prioridad absoluta.", TP2: "La armonía interior, la felicidad y el respeto por mí mismo/a guían mis decisiones.", TP3: "Una sensación de logro personal me importa profundamente.",
    TS1: "Un mundo de paz, justicia e igualdad me importa profundamente.", TS2: "Me preocupan la libertad y el bienestar de todas las personas, no solo los míos.", TS3: "Renunciaría a mi comodidad personal por el bien social mayor.",
    IM1: "Ser honesto/a y ético/a me importa más que ganar.", IM2: "Valoro ser servicial, indulgente y amable en mi forma de actuar.", IM3: "Prefiero hacer lo correcto antes que lo ventajoso.",
    IC1: "Valoro ser capaz, lógico/a y eficaz por encima de todo.", IC2: "La ambición y el logro son centrales para quien quiero ser.", IC3: "Admiro la competencia y la inteligencia tanto como la calidez.",
  },
};
const ROKEACH_FR: InstrumentTranslation = {
  name: "Valeurs de Rokeach", shortName: "Rokeach",
  tagline: "Buts finaux ou manières d'agir — la carte classique en quatre volets de ce que vous prisez.",
  description: "Milton Rokeach a divisé les valeurs humaines de deux façons : les valeurs terminales (les états finaux pour lesquels nous vivons) face aux valeurs instrumentales (les manières d'agir que nous prisons), et les buts personnels face aux buts sociaux. Le croisement donne quatre orientations — un complément éclairant au cercle de Schwartz, montrant si votre boussole pointe vers des fins personnelles ou partagées, et vers une conduite morale ou fondée sur la compétence.",
  scales: {
    TERMP: { name: "Terminale · personnelle", description: "États finaux désirés pour vous (une bonne vie, la paix intérieure, l'accomplissement).", poles: { low: "Moins centrale", high: "Centrale" }, highDescriptor: "centré(e) sur l'épanouissement personnel et une bonne vie", lowDescriptor: "moins orienté(e) vers des buts finaux personnels" },
    TERMS: { name: "Terminale · sociale", description: "États finaux désirés pour le monde (paix, égalité, liberté).", poles: { low: "Moins centrale", high: "Centrale" }, highDescriptor: "animé(e) par la justice et le bien commun", lowDescriptor: "moins orienté(e) vers des buts finaux sociaux" },
    INSTM: { name: "Instrumentale · morale", description: "Manières d'agir prisées envers autrui (honnête, serviable, indulgent).", poles: { low: "Moins centrale", high: "Centrale" }, highDescriptor: "guidé(e) par l'honnêteté, la gentillesse et l'intégrité", lowDescriptor: "moins guidé(e) par des valeurs de conduite morale" },
    INSTC: { name: "Instrumentale · compétence", description: "Manières d'agir prisées quant à la capacité (capable, ambitieux, logique).", poles: { low: "Moins centrale", high: "Centrale" }, highDescriptor: "guidé(e) par la compétence, l'ambition et l'efficacité", lowDescriptor: "moins guidé(e) par des valeurs de compétence" },
  },
  items: {
    TP1: "Une vie confortable et agréable pour moi est une priorité absolue.", TP2: "L'harmonie intérieure, le bonheur et le respect de moi-même guident mes choix.", TP3: "Un sentiment d'accomplissement personnel compte profondément pour moi.",
    TS1: "Un monde de paix, de justice et d'égalité compte profondément pour moi.", TS2: "Je me soucie de la liberté et du bien-être de tous, pas seulement des miens.", TS3: "Je renoncerais à mon confort personnel pour le bien social plus grand.",
    IM1: "Être honnête et éthique compte plus pour moi que gagner.", IM2: "Je valorise le fait d'être serviable, indulgent(e) et bienveillant(e) dans mes actes.", IM3: "Je préfère faire ce qui est juste plutôt que ce qui est avantageux.",
    IC1: "Je valorise par-dessus tout le fait d'être capable, logique et efficace.", IC2: "L'ambition et la réussite sont centrales pour la personne que je veux être.", IC3: "J'admire la compétence et l'intelligence autant que la chaleur humaine.",
  },
};
const SCHWARTZ_ES: InstrumentTranslation = {
  name: "Valores personales (Schwartz)", shortName: "Valores",
  tagline: "Lo que de verdad te importa: la brújula tras tus decisiones.",
  description: "La teoría de Schwartz mapea diez valores humanos básicos que guían nuestras decisiones en todas las culturas, desde la autodirección y el logro hasta la benevolencia y el universalismo. Este perfilador muestra qué valores ocupan los primeros puestos para ti, para que puedas alinear tu tiempo, tu trabajo y tus relaciones con lo que de verdad te importa.",
  scales: {
    SD: { name: "Autodirección", description: "Independencia de pensamiento y acción; libertad y creatividad.", highDescriptor: "que valora la libertad, la autonomía y la expresión creativa", lowDescriptor: "a gusto siendo guiado/a en vez de dirigirte por ti mismo/a" },
    ST: { name: "Estimulación", description: "Emoción, novedad y desafío.", highDescriptor: "atraído/a por la aventura, la variedad y las experiencias nuevas", lowDescriptor: "que prefiere la calma y lo familiar a las emociones fuertes" },
    HE: { name: "Hedonismo", description: "Placer y disfrute de la vida.", highDescriptor: "que valora el placer, la diversión y disfrutar el momento", lowDescriptor: "más centrado/a en el deber o las metas que en el placer" },
    AC: { name: "Logro", description: "Éxito personal demostrando competencia.", highDescriptor: "impulsado/a a triunfar, destacar y ser reconocido/a", lowDescriptor: "menos centrado/a en el estatus o el logro externo" },
    PO: { name: "Poder", description: "Estatus, prestigio y control sobre personas o recursos.", highDescriptor: "que valora la influencia, la autoridad y el liderazgo", lowDescriptor: "poco interesado/a en el dominio o el estatus" },
    SE: { name: "Seguridad", description: "Seguridad, armonía y estabilidad.", highDescriptor: "que valora la seguridad, el orden y la estabilidad", lowDescriptor: "a gusto con el riesgo y la incertidumbre" },
    CO: { name: "Conformidad", description: "Contención de acciones que puedan molestar a otros o violar normas.", highDescriptor: "que valora la cortesía, las normas y cumplir lo esperado", lowDescriptor: "dispuesto/a a romper normas y seguir tu propio camino" },
    TR: { name: "Tradición", description: "Respeto y compromiso con las costumbres y las ideas.", highDescriptor: "que valora la tradición, la humildad y la continuidad", lowDescriptor: "que prefiere lo nuevo y progresista a lo tradicional" },
    BE: { name: "Benevolencia", description: "Preservar y mejorar el bienestar de los cercanos.", highDescriptor: "entregado/a al bienestar de quienes te rodean", lowDescriptor: "más centrado/a en ti que en cuidar a otros" },
    UN: { name: "Universalismo", description: "Comprensión, tolerancia y protección de todas las personas y la naturaleza.", highDescriptor: "que se preocupa por la justicia, la igualdad y el planeta", lowDescriptor: "más centrado/a en tu propio círculo que en el mundo más amplio" },
  },
  items: {
    SD1: "Tomar mis propias decisiones y ser libre para dirigir mi vida.", SD2: "Ser creativo/a y explorar mis propias ideas y curiosidad.",
    ST1: "Emoción, novedad y aventura.", ST2: "Una vida variada y sorprendente antes que una predecible.",
    HE1: "Disfrutar de los placeres de la vida y darme caprichos.", HE2: "Buscar la diversión y las cosas que simplemente sientan bien.",
    AC1: "Tener éxito y demostrar mi competencia.", AC2: "Lograr mucho y ser reconocido/a por ello.",
    PO1: "Tener influencia, estatus o control sobre los recursos.", PO2: "Estar en una posición de autoridad y liderazgo.",
    SE1: "Seguridad, estabilidad y orden en mi vida y en la sociedad.", SE2: "Un entorno seguro y predecible para mí y mi familia.",
    CO1: "Seguir las normas y no molestar ni ofender a los demás.", CO2: "Ser cortés y hacer lo que se espera de mí.",
    TR1: "Honrar la tradición y las costumbres que me han transmitido.", TR2: "Ser humilde y respetar las creencias arraigadas.",
    BE1: "Cuidar del bienestar de las personas cercanas a mí.", BE2: "Ser leal, entregado/a y servicial con amigos y familia.",
    UN1: "La justicia, la igualdad y el bienestar de todas las personas.", UN2: "Proteger la naturaleza y el medio ambiente.",
  },
};
const SCHWARTZ_FR: InstrumentTranslation = {
  name: "Valeurs personnelles (Schwartz)", shortName: "Valeurs",
  tagline: "Ce qui compte vraiment pour vous — la boussole derrière vos choix.",
  description: "La théorie de Schwartz cartographie dix valeurs humaines fondamentales qui guident nos décisions à travers les cultures, de l'autonomie et la réussite à la bienveillance et l'universalisme. Ce profileur montre quelles valeurs arrivent en tête chez vous, afin d'aligner votre temps, votre travail et vos relations sur ce qui compte vraiment pour vous.",
  scales: {
    SD: { name: "Autonomie", description: "Indépendance de pensée et d'action ; liberté et créativité.", highDescriptor: "valorisant la liberté, l'autonomie et l'expression créative", lowDescriptor: "à l'aise d'être guidé(e) plutôt que de vous diriger vous-même" },
    ST: { name: "Stimulation", description: "Excitation, nouveauté et défi.", highDescriptor: "attiré(e) par l'aventure, la variété et les expériences nouvelles", lowDescriptor: "préférant le calme et le familier aux sensations fortes" },
    HE: { name: "Hédonisme", description: "Plaisir et jouissance de la vie.", highDescriptor: "valorisant le plaisir, l'amusement et l'instant présent", lowDescriptor: "plus porté(e) sur le devoir ou les objectifs que sur le plaisir" },
    AC: { name: "Réussite", description: "Succès personnel par la démonstration de la compétence.", highDescriptor: "animé(e) par l'envie de réussir, d'exceller et d'être reconnu(e)", lowDescriptor: "moins centré(e) sur le statut ou la réussite externe" },
    PO: { name: "Pouvoir", description: "Statut, prestige et contrôle sur les personnes ou les ressources.", highDescriptor: "valorisant l'influence, l'autorité et le leadership", lowDescriptor: "peu intéressé(e) par la domination ou le statut" },
    SE: { name: "Sécurité", description: "Sûreté, harmonie et stabilité.", highDescriptor: "valorisant la sécurité, l'ordre et la stabilité", lowDescriptor: "à l'aise avec le risque et l'incertitude" },
    CO: { name: "Conformité", description: "Retenue des actes susceptibles de contrarier autrui ou d'enfreindre les normes.", highDescriptor: "valorisant la politesse, les règles et le respect des attentes", lowDescriptor: "prêt(e) à enfreindre les normes et à suivre votre voie" },
    TR: { name: "Tradition", description: "Respect et attachement aux coutumes et aux idées.", highDescriptor: "valorisant la tradition, l'humilité et la continuité", lowDescriptor: "préférant le nouveau et le progressiste au traditionnel" },
    BE: { name: "Bienveillance", description: "Préserver et améliorer le bien-être des proches.", highDescriptor: "dévoué(e) au bien-être de vos proches", lowDescriptor: "plus centré(e) sur vous que tourné(e) vers le soin d'autrui" },
    UN: { name: "Universalisme", description: "Compréhension, tolérance et protection de tous et de la nature.", highDescriptor: "soucieux(se) de justice, d'égalité et de la planète", lowDescriptor: "plus centré(e) sur votre cercle que sur le monde au sens large" },
  },
  items: {
    SD1: "Faire mes propres choix et être libre de diriger ma vie.", SD2: "Être créatif(ve) et explorer mes propres idées et ma curiosité.",
    ST1: "L'excitation, la nouveauté et l'aventure.", ST2: "Une vie variée et surprenante plutôt que prévisible.",
    HE1: "Profiter des plaisirs de la vie et me faire plaisir.", HE2: "Rechercher l'amusement et ce qui fait simplement du bien.",
    AC1: "Réussir et démontrer ma compétence.", AC2: "Accomplir beaucoup et être reconnu(e) pour cela.",
    PO1: "Avoir de l'influence, du statut ou le contrôle des ressources.", PO2: "Être en position d'autorité et de leadership.",
    SE1: "La sécurité, la stabilité et l'ordre dans ma vie et la société.", SE2: "Un environnement sûr et prévisible pour moi et ma famille.",
    CO1: "Suivre les règles et ne pas contrarier ni offenser les autres.", CO2: "Être poli(e) et faire ce qu'on attend de moi.",
    TR1: "Honorer la tradition et les coutumes qui m'ont été transmises.", TR2: "Être humble et respecter les croyances anciennes.",
    BE1: "Prendre soin du bien-être de mes proches.", BE2: "Être loyal(e), dévoué(e) et serviable envers amis et famille.",
    UN1: "La justice, l'égalité et le bien-être de tous.", UN2: "Protéger la nature et l'environnement.",
  },
};
const SIXTEENPF_ES: InstrumentTranslation = {
  name: "16 Factores de Personalidad", shortName: "16PF",
  tagline: "Los dieciséis rasgos primarios de Cattell: el mapa más granular de la personalidad normal.",
  description: "Raymond Cattell empleó el análisis factorial para destilar la personalidad en dieciséis 'rasgos fuente' primarios. Este perfilador los mide todos —de la calidez y la dominancia a la vigilancia, la reserva y la tensión—, ofreciendo un retrato excepcionalmente detallado que los Cinco Grandes agrupan. Una lectura rica y minuciosa para quien busca matices.",
  scales: {
    A: { name: "Calidez", description: "Cercanía emocional y calidez hacia las personas.", poles: { low: "Reservado", high: "Cálido" }, highDescriptor: "cálido", lowDescriptor: "reservado" },
    B: { name: "Razonamiento", description: "Agilidad autovalorada con las ideas abstractas.", poles: { low: "Concreto", high: "Abstracto" }, highDescriptor: "abstracto", lowDescriptor: "concreto" },
    C: { name: "Estabilidad emocional", description: "Calma y resiliencia bajo estrés.", poles: { low: "Reactivo", high: "Estable" }, highDescriptor: "estable", lowDescriptor: "reactivo" },
    E: { name: "Dominancia", description: "Asertividad e impulso por liderar.", poles: { low: "Deferente", high: "Asertivo" }, highDescriptor: "asertivo", lowDescriptor: "deferente" },
    F: { name: "Vivacidad", description: "Espontaneidad, energía y entusiasmo.", poles: { low: "Serio", high: "Vivaz" }, highDescriptor: "vivaz", lowDescriptor: "serio" },
    G: { name: "Conciencia de las normas", description: "Respeto por el deber, las normas y la corrección.", poles: { low: "Pragmático", high: "Cumplidor" }, highDescriptor: "cumplidor", lowDescriptor: "pragmático" },
    H: { name: "Audacia social", description: "Audacia y soltura en las situaciones sociales.", poles: { low: "Tímido", high: "Audaz" }, highDescriptor: "audaz", lowDescriptor: "tímido" },
    I: { name: "Sensibilidad", description: "Sensibilidad y apreciación estética.", poles: { low: "Utilitario", high: "Sensible" }, highDescriptor: "sensible", lowDescriptor: "utilitario" },
    L: { name: "Vigilancia", description: "Cautela y recelo hacia los demás.", poles: { low: "Confiado", high: "Vigilante" }, highDescriptor: "vigilante", lowDescriptor: "confiado" },
    M: { name: "Abstracción", description: "Absorción en las ideas frente al enfoque práctico.", poles: { low: "Práctico", high: "Imaginativo" }, highDescriptor: "imaginativo", lowDescriptor: "práctico" },
    N: { name: "Reserva", description: "Reserva sobre la propia vida interior.", poles: { low: "Franco", high: "Reservado" }, highDescriptor: "reservado", lowDescriptor: "franco" },
    O: { name: "Aprensión", description: "Dudas sobre uno mismo, preocupación y tendencia a la culpa.", poles: { low: "Seguro de sí", high: "Aprensivo" }, highDescriptor: "aprensivo", lowDescriptor: "seguro de sí" },
    Q1: { name: "Apertura al cambio", description: "Apetito por la novedad y el cuestionamiento.", poles: { low: "Tradicional", high: "Abierto" }, highDescriptor: "abierto", lowDescriptor: "tradicional" },
    Q2: { name: "Autosuficiencia", description: "Preferencia por la soledad y la autonomía.", poles: { low: "Orientado al grupo", high: "Autosuficiente" }, highDescriptor: "autosuficiente", lowDescriptor: "orientado al grupo" },
    Q3: { name: "Perfeccionismo", description: "Necesidad de orden, planificación y estándares.", poles: { low: "Flexible", high: "Organizado" }, highDescriptor: "organizado", lowDescriptor: "flexible" },
    Q4: { name: "Tensión", description: "Inquietud y tensión nerviosa.", poles: { low: "Relajado", high: "Tenso" }, highDescriptor: "tenso", lowDescriptor: "relajado" },
  },
  items: {
    A1: "Conecto rápido con la gente y disfruto de la cercanía con los demás.", A2: "Tiendo a mantener una distancia emocional con la gente.",
    B1: "Capto rápido ideas nuevas y abstractas.", B2: "Me cuesta seguir razonamientos complejos o abstractos.",
    C1: "Me mantengo emocionalmente estable incluso cuando la vida se pone difícil.", C2: "Mis sentimientos se alteran fácilmente con los problemas cotidianos.",
    E1: "Me hago valer y empujo por lo que quiero.", E2: "Suelo ceder ante los demás en lugar de tomar el mando.",
    F1: "Soy espontáneo/a, animado/a y entusiasta.", F2: "Soy bastante serio/a y contenido/a.",
    G1: "Me tomo en serio el deber, las normas y hacer lo correcto.", G2: "Doblo las reglas cuando se interponen en mi camino.",
    H1: "Soy socialmente audaz y me lanzo con facilidad a grupos nuevos.", H2: "Me siento tímido/a y dubitativo/a en situaciones sociales desconocidas.",
    I1: "Soy de sensibilidad tierna y me conmueven la belleza y los sentimientos.", I2: "Me apoyo en la lógica mucho más que en el sentimiento al decidir.",
    L1: "Me mantengo alerta porque no siempre se puede confiar en la gente.", L2: "Por lo general supongo que la gente tiene buenas intenciones.",
    M1: "Me absorben las ideas y la imaginación y pierdo de vista lo práctico.", M2: "Mantengo la atención firmemente en lo práctico y lo del momento.",
    N1: "Guardo mis pensamientos privados para mí.", N2: "Soy abierto/a y franco/a sobre mí con casi cualquiera.",
    O1: "A menudo me preocupa haber hecho algo mal.", O2: "Me siento seguro/a y rara vez dudo de mí.",
    Q11: "Me gusta probar nuevos enfoques y cuestionar lo establecido.", Q12: "Prefiero las formas familiares y tradicionales de hacer las cosas.",
    Q21: "Prefiero tomar mis propias decisiones y contar conmigo mismo/a.", Q22: "Prefiero hacer las cosas en grupo antes que solo/a.",
    Q31: "Me gusta tener las cosas organizadas, planificadas y a un alto nivel.", Q32: "Me siento cómodo/a dejando las cosas sueltas y sin estructura.",
    Q41: "A menudo me siento tenso/a, inquieto/a o crispado/a.", Q42: "Me siento relajado/a y tranquilo/a la mayor parte del tiempo.",
  },
};
const SIXTEENPF_FR: InstrumentTranslation = {
  name: "16 Facteurs de Personnalité", shortName: "16PF",
  tagline: "Les seize traits primaires de Cattell — la carte la plus fine de la personnalité normale.",
  description: "Raymond Cattell a utilisé l'analyse factorielle pour distiller la personnalité en seize « traits sources » primaires. Ce profileur les mesure tous — de la chaleur et la dominance à la vigilance, la discrétion et la tension — offrant un portrait d'une finesse inhabituelle que les Big Five regroupent. Une lecture riche et détaillée pour qui veut de la nuance.",
  scales: {
    A: { name: "Chaleur", description: "Proximité émotionnelle et chaleur envers les gens.", poles: { low: "Réservé", high: "Chaleureux" }, highDescriptor: "chaleureux", lowDescriptor: "réservé" },
    B: { name: "Raisonnement", description: "Aisance autoévaluée avec les idées abstraites.", poles: { low: "Concret", high: "Abstrait" }, highDescriptor: "abstrait", lowDescriptor: "concret" },
    C: { name: "Stabilité émotionnelle", description: "Calme et résilience sous le stress.", poles: { low: "Réactif", high: "Stable" }, highDescriptor: "stable", lowDescriptor: "réactif" },
    E: { name: "Dominance", description: "Assertivité et élan à diriger.", poles: { low: "Déférent", high: "Affirmé" }, highDescriptor: "affirmé", lowDescriptor: "déférent" },
    F: { name: "Vivacité", description: "Spontanéité, énergie et enthousiasme.", poles: { low: "Sérieux", high: "Vif" }, highDescriptor: "vif", lowDescriptor: "sérieux" },
    G: { name: "Conscience des règles", description: "Respect du devoir, des règles et de la bienséance.", poles: { low: "Accommodant", high: "Consciencieux" }, highDescriptor: "consciencieux", lowDescriptor: "accommodant" },
    H: { name: "Audace sociale", description: "Audace et aisance dans les situations sociales.", poles: { low: "Timide", high: "Audacieux" }, highDescriptor: "audacieux", lowDescriptor: "timide" },
    I: { name: "Sensibilité", description: "Délicatesse et sensibilité esthétique.", poles: { low: "Utilitaire", high: "Sensible" }, highDescriptor: "sensible", lowDescriptor: "utilitaire" },
    L: { name: "Vigilance", description: "Méfiance et circonspection envers autrui.", poles: { low: "Confiant", high: "Vigilant" }, highDescriptor: "vigilant", lowDescriptor: "confiant" },
    M: { name: "Abstraction", description: "Absorption dans les idées vs. focalisation pratique.", poles: { low: "Pragmatique", high: "Imaginatif" }, highDescriptor: "imaginatif", lowDescriptor: "pragmatique" },
    N: { name: "Discrétion", description: "Réserve quant à sa vie intérieure.", poles: { low: "Direct", high: "Réservé" }, highDescriptor: "réservé", lowDescriptor: "direct" },
    O: { name: "Appréhension", description: "Doute de soi, inquiétude et tendance à la culpabilité.", poles: { low: "Assuré", high: "Inquiet" }, highDescriptor: "inquiet", lowDescriptor: "assuré" },
    Q1: { name: "Ouverture au changement", description: "Goût de la nouveauté et de la remise en question.", poles: { low: "Traditionnel", high: "Ouvert" }, highDescriptor: "ouvert", lowDescriptor: "traditionnel" },
    Q2: { name: "Autonomie", description: "Préférence pour la solitude et l'autonomie.", poles: { low: "Grégaire", high: "Autonome" }, highDescriptor: "autonome", lowDescriptor: "grégaire" },
    Q3: { name: "Perfectionnisme", description: "Besoin d'ordre, de planification et de standards.", poles: { low: "Flexible", high: "Organisé" }, highDescriptor: "organisé", lowDescriptor: "flexible" },
    Q4: { name: "Tension", description: "Agitation et tension nerveuse.", poles: { low: "Détendu", high: "Tendu" }, highDescriptor: "tendu", lowDescriptor: "détendu" },
  },
  items: {
    A1: "Je me lie vite aux gens et j'aime la proximité avec les autres.", A2: "J'ai tendance à garder une distance émotionnelle avec les gens.",
    B1: "Je saisis vite les idées nouvelles et abstraites.", B2: "J'ai du mal à suivre un raisonnement complexe ou abstrait.",
    C1: "Je reste émotionnellement stable même quand la vie devient dure.", C2: "Mes émotions sont facilement perturbées par les problèmes du quotidien.",
    E1: "Je m'affirme et je pousse pour ce que je veux.", E2: "Je m'en remets généralement aux autres plutôt que de prendre les commandes.",
    F1: "Je suis spontané(e), enjoué(e) et enthousiaste.", F2: "Je suis plutôt sérieux(se) et réservé(e).",
    G1: "Je prends au sérieux le devoir, les règles et le fait de bien agir.", G2: "Je contourne les règles quand elles me gênent.",
    H1: "Je suis socialement audacieux(se) et j'aborde facilement de nouveaux groupes.", H2: "Je me sens timide et hésitant(e) dans les situations sociales inconnues.",
    I1: "Je suis sensible et touché(e) par la beauté et les émotions.", I2: "Je m'appuie bien plus sur la logique que sur le sentiment pour décider.",
    L1: "Je reste sur mes gardes car on ne peut pas toujours faire confiance aux gens.", L2: "Je suppose généralement que les gens ont de bonnes intentions.",
    M1: "Je me laisse absorber par les idées et l'imagination et perds de vue le concret.", M2: "Je garde mon attention fermement sur les questions pratiques et immédiates.",
    N1: "Je garde mes pensées intimes pour moi.", N2: "Je suis ouvert(e) et franc(he) sur moi-même avec presque tout le monde.",
    O1: "Je crains souvent d'avoir fait quelque chose de mal.", O2: "Je me sens en sécurité et je doute rarement de moi.",
    Q11: "J'aime essayer de nouvelles approches et remettre en question l'usage établi.", Q12: "Je préfère les façons de faire familières et traditionnelles.",
    Q21: "Je préfère prendre mes propres décisions et compter sur moi-même.", Q22: "Je préfère faire les choses en groupe plutôt que seul(e).",
    Q31: "J'aime que les choses soient organisées, planifiées et faites à un haut niveau.", Q32: "Je suis à l'aise de laisser les choses souples et sans structure.",
    Q41: "Je me sens souvent tendu(e), agité(e) ou crispé(e).", Q42: "Je me sens détendu(e) et tranquille la plupart du temps.",
  },
};
const ATTACH_ES: InstrumentTranslation = {
  name: "Estilo de apego en las relaciones", shortName: "Estilo de apego",
  tagline: "Cómo te vinculas: dos dimensiones, cuatro estilos de relación.",
  description: "El apego adulto moldea cómo buscamos la cercanía y manejamos la distancia en las relaciones. Este perfilador estima tu ansiedad y tu evitación del apego y te sitúa entre cuatro estilos —seguro, ansioso-preocupado, evitativo-rechazante y temeroso-evitativo—, con el crecimiento planteado como un movimiento hacia la seguridad.",
  scales: {
    ANX: { name: "Ansiedad del apego", description: "Miedo al abandono y necesidad de reafirmación en las relaciones cercanas.", poles: { low: "Seguro", high: "Ansioso" }, highDescriptor: "que ansía la cercanía, sensible a la disponibilidad de la pareja y rápido/a para temer el rechazo", lowDescriptor: "seguro/a de ser amado/a y sin preocuparte por el abandono" },
    AV: { name: "Evitación del apego", description: "Incomodidad con la cercanía y preferencia por la autosuficiencia.", poles: { low: "Conectado", high: "Evitativo" }, highDescriptor: "que valora la independencia, reservado/a con los sentimientos e incómodo/a con demasiada cercanía", lowDescriptor: "a gusto con la intimidad, con depender de otros y con abrirte" },
  },
  items: {
    ANX1: "Me preocupa que las personas a las que quiero no me quieran tanto como yo a ellas.", ANX2: "Necesito mucha reafirmación de que se me quiere.", ANX3: "A menudo temo que las personas cercanas me abandonen.", ANX4: "Me disgusta cuando alguien cercano no está disponible cuando lo necesito.",
    ANX5: "Rara vez me preocupa que me dejen o me rechacen.", ANX6: "Cuando estoy cerca de alguien, a menudo temo que la relación se rompa.", ANX7: "Ansío la cercanía, a veces más de lo que la otra persona parece querer.", ANX8: "Me siento seguro/a de que las personas a las que quiero no me dejarán.",
    AV1: "Prefiero no depender de los demás, ni que dependan de mí.", AV2: "Me cuesta abrirme del todo a las personas cercanas.", AV3: "Me incomoda cuando alguien quiere una cercanía emocional muy estrecha.", AV4: "Me siento a gusto apoyándome en personas cercanas cuando necesito apoyo.",
    AV5: "Prefiero guardarme mis sentimientos antes que compartirlos.", AV6: "Cuando alguien se acerca demasiado, tiendo a apartarme.", AV7: "Me resulta fácil tener intimidad emocional con las personas a las que quiero.", AV8: "Valoro mi independencia más que la cercanía.",
  },
};
const ATTACH_FR: InstrumentTranslation = {
  name: "Style d'attachement dans les relations", shortName: "Style d'attachement",
  tagline: "Comment vous créez des liens : deux dimensions, quatre styles relationnels.",
  description: "L'attachement adulte façonne notre manière de chercher la proximité et de gérer la distance dans les relations. Ce profileur estime votre anxiété et votre évitement d'attachement et vous situe parmi quatre styles — sécure, anxieux-préoccupé, détaché-évitant et craintif-évitant — la croissance étant pensée comme un mouvement vers la sécurité.",
  scales: {
    ANX: { name: "Anxiété d'attachement", description: "Peur de l'abandon et besoin de réassurance dans les relations proches.", poles: { low: "Sécure", high: "Anxieux" }, highDescriptor: "avide de proximité, sensible à la disponibilité du partenaire et prompt(e) à craindre le rejet", lowDescriptor: "assuré(e) d'être aimé(e) et sans préoccupation d'abandon" },
    AV: { name: "Évitement d'attachement", description: "Inconfort avec la proximité et préférence pour l'autonomie.", poles: { low: "Connecté", high: "Évitant" }, highDescriptor: "valorisant l'indépendance, sur la réserve avec ses sentiments et mal à l'aise avec trop de proximité", lowDescriptor: "à l'aise avec l'intimité, le fait de dépendre des autres et de s'ouvrir" },
  },
  items: {
    ANX1: "Je crains que les personnes que j'aime ne tiennent pas autant à moi que moi à elles.", ANX2: "J'ai besoin de beaucoup de réassurance sur le fait d'être aimé(e).", ANX3: "J'ai souvent peur d'être abandonné(e) par mes proches.", ANX4: "Je suis contrarié(e) quand un proche n'est pas disponible quand j'ai besoin de lui.",
    ANX5: "Je m'inquiète rarement d'être quitté(e) ou rejeté(e).", ANX6: "Quand je suis proche de quelqu'un, je crains souvent que la relation s'effondre.", ANX7: "J'aspire à la proximité, parfois plus que l'autre ne semble le vouloir.", ANX8: "Je me sens sûr(e) que les personnes que j'aime ne me quitteront pas.",
    AV1: "Je préfère ne pas dépendre des autres, ni qu'ils dépendent de moi.", AV2: "J'ai du mal à m'ouvrir entièrement à mes proches.", AV3: "Je suis mal à l'aise quand quelqu'un veut une grande proximité émotionnelle.", AV4: "Je suis à l'aise de m'appuyer sur mes proches pour du soutien.",
    AV5: "Je préfère garder mes sentiments pour moi plutôt que de les partager.", AV6: "Quand quelqu'un devient trop proche, j'ai tendance à m'éloigner.", AV7: "Il m'est facile d'avoir une intimité émotionnelle avec les personnes que j'aime.", AV8: "Je valorise mon indépendance plus que la proximité.",
  },
};
const LOVELANG_ES: InstrumentTranslation = {
  name: "Lenguajes del amor", shortName: "Lenguajes del amor",
  tagline: "Cómo das y recibes amor con más profundidad.",
  description: "Los cinco lenguajes del amor describen las distintas formas en que las personas se sienten amadas: mediante palabras, tiempo, servicio, regalos o contacto. Conocer tu lenguaje principal (y el de tu pareja) es una forma sencilla y poderosa de hacer que el amor cale. Este perfilador clasifica los cinco y resalta tus dos principales.",
  scales: {
    WORDS: { name: "Palabras de afirmación", description: "Sentirse amado/a a través del aprecio y el ánimo.", highDescriptor: "que se llena de energía con palabras amables y afirmativas", lowDescriptor: "menos dependiente de la afirmación verbal" },
    TIME: { name: "Tiempo de calidad", description: "Sentirse amado/a a través de la unión enfocada.", highDescriptor: "que se llena con la atención plena y la presencia", lowDescriptor: "menos dependiente del tiempo dedicado juntos" },
    SERVICE: { name: "Actos de servicio", description: "Sentirse amado/a cuando los demás ayudan y hacen.", highDescriptor: "conmovido/a por las acciones útiles y la carga compartida", lowDescriptor: "menos centrado/a en la ayuda práctica como amor" },
    GIFTS: { name: "Recibir regalos", description: "Sentirse amado/a a través de detalles pensados.", highDescriptor: "conmovido/a por regalos y gestos significativos", lowDescriptor: "menos orientado/a a los regalos como señal de amor" },
    TOUCH: { name: "Contacto físico", description: "Sentirse amado/a a través de la cercanía afectuosa.", highDescriptor: "conectado/a mediante abrazos, contacto y cercanía", lowDescriptor: "menos dependiente del contacto físico" },
  },
  items: {
    LL1: "Tras una semana dura, ¿qué de un ser querido significaría más para ti?",
    LL2: "Te sientes más amado/a en una relación cuando tu pareja…",
    LL3: "Un amigo quiere demostrar que le importas. Te conmovería más que…",
    LL4: "¿Qué te dolería más no recibir de alguien cercano?",
    LL5: "En tu cumpleaños, el gesto que más cala es…",
    LL6: "Instintivamente, muestras amor a los demás…",
    LL7: "¿Qué cumplido sobre tu relación te agradaría más?",
    LL8: "Tras una discusión, ¿qué te ayuda a sentirte reconectado/a más rápido?",
    LL9: "Cuando echas de menos a alguien, lo que más desearías es poder…",
    LL10: "La frase que más resuena contigo es…",
  },
  options: {
    LL1: ["oír 'estoy orgulloso/a de ti, tú puedes'", "una velada con su atención plena y sin distracciones", "que se ocupe en silencio de una tarea que te daba pavor", "una pequeña sorpresa que diga que pensaba en ti", "un abrazo largo y sentarse muy juntos"],
    LL2: ["te dice a menudo lo que aprecia de ti", "reserva tiempo real y enfocado solo para los dos", "echa una mano y te aligera la carga sin que se lo pidas", "te trae pequeños detalles que muestran que recordó", "es cálidamente cariñosa: abrazos, tomarse de la mano, cercanía"],
    LL3: ["te escribiera un mensaje sentido", "despejara su día para pasarlo contigo", "se presentara a ayudarte a mudarte o a arreglar algo", "te trajera un pequeño regalo que te encajara a la perfección", "te recibiera con un abrazo grande y cálido"],
    LL4: ["cualquier palabra de aprecio o ánimo", "tiempo de verdad, sin distracciones, juntos", "cualquier ayuda o apoyo práctico", "cualquier señal de que piensa en ti cuando estáis lejos", "cercanía física afectuosa"],
    LL5: ["una nota sincera sobre lo que significas para ellos", "un día sin prisas dedicado por entero a ti", "que te quiten todo de encima ese día", "un regalo significativo y bien elegido", "mucho calor y afecto físico"],
    LL6: ["diciéndoles lo que admiras de ellos", "dándoles tu presencia plena", "haciendo cosas útiles por ellos", "eligiendo regalos pensados", "abrazándolos y siendo físicamente cariñoso/a"],
    LL7: ["'Siempre me hace sentir valorado/a.'", "'De verdad nos hacemos tiempo el uno para el otro.'", "'Siempre está ahí para ayudarme.'", "'Hace los regalos más pensados.'", "'Se nota lo cariñoso/a que es.'"],
    LL8: ["una charla sincera y tranquilizadora", "volver a pasar un rato tranquilo juntos", "que haga algo amable para compensarlo", "una pequeña ofrenda de paz que muestre que le importa", "un abrazo y cercanía física"],
    LL9: ["oírle decir algo cálido", "simplemente estar presentes juntos", "que te ayude con lo que tienes encima", "encontrar un pequeño algo que te recuerde a él/ella", "abrazarle, o que te abracen"],
    LL10: ["'Dime que me quieres.'", "'Pasa tiempo conmigo.'", "'Déjame ayudarte.'", "'Te traje algo.'", "'Abrázame.'"],
  },
};
const LOVELANG_FR: InstrumentTranslation = {
  name: "Langages de l'amour", shortName: "Langages de l'amour",
  tagline: "Comment vous donnez et recevez l'amour le plus profondément.",
  description: "Les cinq langages de l'amour décrivent les différentes façons dont les gens se sentent aimés — par les mots, le temps, les services, les cadeaux ou le contact. Connaître votre langage principal (et celui de votre partenaire) est un moyen simple et puissant de faire que l'amour touche juste. Ce profileur classe les cinq et met en avant vos deux principaux.",
  scales: {
    WORDS: { name: "Paroles valorisantes", description: "Se sentir aimé(e) par l'appréciation et l'encouragement.", highDescriptor: "stimulé(e) par des paroles gentilles et valorisantes", lowDescriptor: "moins tributaire de l'affirmation verbale" },
    TIME: { name: "Moments de qualité", description: "Se sentir aimé(e) par une présence partagée et attentive.", highDescriptor: "comblé(e) par l'attention pleine et la présence", lowDescriptor: "moins dépendant(e) du temps dédié ensemble" },
    SERVICE: { name: "Services rendus", description: "Se sentir aimé(e) quand les autres aident et agissent.", highDescriptor: "touché(e) par les actions utiles et la charge partagée", lowDescriptor: "moins porté(e) sur l'aide pratique comme amour" },
    GIFTS: { name: "Cadeaux reçus", description: "Se sentir aimé(e) par des attentions réfléchies.", highDescriptor: "touché(e) par des cadeaux et gestes significatifs", lowDescriptor: "moins orienté(e) vers les cadeaux comme signe d'amour" },
    TOUCH: { name: "Contact physique", description: "Se sentir aimé(e) par une proximité affectueuse.", highDescriptor: "connecté(e) par les câlins, le contact et la proximité", lowDescriptor: "moins tributaire du contact physique" },
  },
  items: {
    LL1: "Après une semaine difficile, qu'est-ce qui, venant d'un être cher, compterait le plus ?",
    LL2: "Vous vous sentez le plus aimé(e) dans une relation quand votre partenaire…",
    LL3: "Un ami veut montrer qu'il tient à vous. Vous seriez le plus touché(e) s'il…",
    LL4: "Qu'est-ce qui vous manquerait le plus, venant d'un proche ?",
    LL5: "Pour votre anniversaire, le geste qui touche le plus est…",
    LL6: "Vous montrez instinctivement de l'amour aux autres…",
    LL7: "Quel compliment sur votre relation vous ferait le plus plaisir ?",
    LL8: "Après un désaccord, qu'est-ce qui vous aide à vous reconnecter le plus vite ?",
    LL9: "Quand quelqu'un vous manque, vous souhaiteriez surtout pouvoir…",
    LL10: "La phrase qui résonne le plus en vous est…",
  },
  options: {
    LL1: ["entendre « je suis fier(ère) de toi — tu vas y arriver »", "une soirée avec son attention pleine et entière", "qu'il/elle s'occupe discrètement d'une corvée que vous redoutiez", "une petite surprise qui dit qu'il/elle pensait à vous", "un long câlin et rester blottis l'un contre l'autre"],
    LL2: ["vous dit souvent ce qu'il/elle apprécie chez vous", "réserve un vrai temps rien que pour vous deux", "donne un coup de main et allège votre charge sans qu'on le demande", "vous apporte de petites attentions qui montrent qu'il/elle s'est souvenu(e)", "est chaleureusement affectueux(se) — câlins, main dans la main, proximité"],
    LL3: ["vous écrivait un message touchant", "libérait sa journée pour la passer avec vous", "venait vous aider à déménager ou à réparer quelque chose", "vous apportait un petit cadeau qui vous correspondait parfaitement", "vous accueillait avec un grand câlin chaleureux"],
    LL4: ["la moindre parole d'appréciation ou d'encouragement", "un vrai temps ensemble, sans distraction", "la moindre aide ou soutien pratique", "le moindre signe qu'il/elle pense à vous quand vous êtes loin", "une proximité physique affectueuse"],
    LL5: ["un mot sincère sur ce que vous représentez pour eux", "une journée sans hâte passée entièrement avec vous", "qu'on vous décharge de tout ce jour-là", "un cadeau significatif et bien choisi", "beaucoup de chaleur et d'affection physique"],
    LL6: ["en leur disant ce que vous admirez chez eux", "en leur offrant votre présence pleine", "en faisant des choses utiles pour eux", "en choisissant des cadeaux réfléchis", "en les câlinant et en étant physiquement affectueux(se)"],
    LL7: ["« Il/Elle me fait toujours me sentir apprécié(e). »", "« On se réserve vraiment du temps l'un pour l'autre. »", "« Il/Elle est toujours là pour m'aider. »", "« Il/Elle fait les cadeaux les plus réfléchis. »", "« On voit comme il/elle est affectueux(se). »"],
    LL8: ["une discussion sincère et rassurante", "repasser un moment calme ensemble", "qu'il/elle fasse quelque chose de gentil pour se faire pardonner", "un petit gage de paix qui montre qu'il/elle tient à vous", "un câlin et une proximité physique"],
    LL9: ["l'entendre dire quelque chose de chaleureux", "simplement être présents ensemble", "qu'il/elle vous aide avec ce que vous avez à gérer", "trouver un petit quelque chose qui vous rappelle lui/elle", "le/la serrer, ou être serré(e)"],
    LL10: ["« Dis-moi que tu m'aimes. »", "« Passe du temps avec moi. »", "« Laisse-moi t'aider. »", "« Je t'ai pris quelque chose. »", "« Serre-moi dans tes bras. »"],
  },
};
const CONFLICT_ES: InstrumentTranslation = {
  name: "Estilo de conflicto (Thomas-Kilmann)", shortName: "Estilo de conflicto",
  tagline: "Cómo manejas el desacuerdo: tu modo por defecto y tu reserva.",
  description: "El modelo de Thomas-Kilmann mapea cinco formas de manejar el conflicto en dos ejes: cuán firme eres y cuán cooperativo. No hay un modo 'mejor'; la habilidad está en usar el adecuado para cada situación. Este perfilador encuentra tus estilos principal y de reserva, y señala el modo que vale la pena practicar.",
  scales: {
    COMPETE: { name: "Competir", description: "Firme, poco cooperativo: persigues tus propios intereses.", poles: { low: "Conciliador", high: "Contundente" }, highDescriptor: "firme, directo/a y dispuesto/a a mantenerse en sus trece", lowDescriptor: "rara vez contundente en el conflicto" },
    COLLAB: { name: "Colaborar", description: "Firme y cooperativo: resolver para todos.", poles: { low: "Superficial", high: "Resolutivo" }, highDescriptor: "implicado/a, abierto/a y buscador/a de soluciones", lowDescriptor: "menos inclinado/a a profundizar en soluciones compartidas" },
    COMPROMISE: { name: "Comprometer", description: "Toma y daca moderado.", poles: { low: "Todo o nada", high: "Punto medio" }, highDescriptor: "pragmático/a y buscador/a de equidad", lowDescriptor: "menos inclinado/a a partir la diferencia" },
    AVOID: { name: "Evitar", description: "Poco firme, poco cooperativo: esquivar.", poles: { low: "Confrontador", high: "Evasivo" }, highDescriptor: "tranquilo/a, reacio/a al conflicto y desescalador/a", lowDescriptor: "inclinado/a a implicarse en lugar de retirarse" },
    ACCOMM: { name: "Ceder", description: "Poco firme, cooperativo: ceder por armonía.", poles: { low: "Se afirma", high: "Cede" }, highDescriptor: "generoso/a, buscador/a de armonía y abnegado/a", lowDescriptor: "menos inclinado/a a ceder por la paz" },
  },
  items: {
    CS1: "Un colega impulsa un plan que crees equivocado. Lo más probable es que…", CS2: "La tensión sube en un desacuerdo. Tu instinto es…", CS3: "Tú y un amigo queréis cosas distintas para un plan compartido. Tú…", CS4: "Alguien te desafía en una reunión. Tiendes a…", CS5: "Cuando un conflicto simplemente no se resuelve, lo más probable es que…",
    CS6: "En la mayoría de los desacuerdos, tu máxima prioridad es…", CS7: "Un familiar quiere algo que tú no. Normalmente…", CS8: "Bajo presión en una disputa, por defecto eres…", CS9: "Mirando atrás a los conflictos que has tenido, lo más frecuente es que…", CS10: "La trampa a la que más propenso/a eres en un conflicto es…",
  },
  options: {
    CS1: ["defender tu postura con firmeza y empujar por tu enfoque", "indagar juntos en el problema real para hallar la mejor respuesta", "buscar un punto medio con el que ambos podáis vivir", "dejarlo pasar por ahora y retomarlo después si importa", "seguirle el plan para mantener la fluidez"],
    CS2: ["mantenerte firme y seguir defendiendo tu punto", "ir más despacio y trabajar lo que de verdad ocurre", "proponer un reparto rápido y justo para que ambos sigáis adelante", "dar un paso atrás y dejar que las cosas se enfríen", "ceder para mantener la paz"],
    CS3: ["abogar con fuerza por lo que quieres", "buscar una opción que os dé a ambos lo que más importa", "ceder un poco cada uno y encontraros en el medio", "seguir la corriente y evitar hacer de ello un problema", "ceder a lo que prefiera"],
    CS4: ["replicar y defender tu posición", "invitar su punto de vista y construir hacia una solución", "encontrar un compromiso que satisfaga lo suficiente a ambos", "desviar y hacer avanzar la conversación", "ceder para evitar la fricción"],
    CS5: ["presionar hasta que se resuelva a tu manera", "seguir trabajándolo hasta cubrir las necesidades de todos", "negociar un trato en el que todos cedan algo", "aparcarlo y apartarte por ahora", "ceder para que se acabe"],
    CS6: ["lograr el resultado correcto, tal como lo ves", "resolver del todo el problema de fondo", "alcanzar rápido una resolución justa y viable", "mantener la calma y el bajo dramatismo", "proteger la relación y la armonía"],
    CS7: ["mantenerte firme en lo que necesitas", "hablarlo hasta el final hacia una solución real", "encontrar un punto intermedio", "dejarlo correr para evitar una pelea", "darle la razón para mantener la paz"],
    CS8: ["decidido/a y contundente", "abierto/a y centrado/a en la solución", "práctico/a y ecuánime", "discreto/a y distante", "amable y dispuesto/a a ceder"],
    CS9: ["luchaste por tu posición", "trabajaste hacia un beneficio mutuo", "partiste la diferencia", "te apartaste de ello", "dejaste que la otra persona se saliera con la suya"],
    CS10: ["ganar el punto pero tensar la relación", "invertir demasiado tiempo en disputas pequeñas", "conformarte con menos de lo posible", "dejar sin abordar los problemas reales", "enterrar tus propias necesidades"],
  },
};
const CONFLICT_FR: InstrumentTranslation = {
  name: "Style de conflit (Thomas-Kilmann)", shortName: "Style de conflit",
  tagline: "Comment vous gérez le désaccord — votre mode par défaut et votre mode de secours.",
  description: "Le modèle de Thomas-Kilmann cartographie cinq façons de gérer le conflit selon deux axes : votre degré d'affirmation et de coopération. Il n'y a pas de « meilleur » mode ; l'art est d'utiliser le bon selon la situation. Ce profileur identifie vos styles principal et de secours, et désigne le mode qui mérite d'être travaillé.",
  scales: {
    COMPETE: { name: "Rivaliser", description: "Affirmé, peu coopératif : poursuivre ses propres intérêts.", poles: { low: "Conciliant", high: "Énergique" }, highDescriptor: "affirmé(e), direct(e) et prêt(e) à tenir bon", lowDescriptor: "rarement énergique en cas de conflit" },
    COLLAB: { name: "Collaborer", description: "Affirmé et coopératif : résoudre pour tous.", poles: { low: "Superficiel", high: "Résolutif" }, highDescriptor: "impliqué(e), ouvert(e) et en quête de solutions", lowDescriptor: "moins enclin(e) à creuser des solutions partagées" },
    COMPROMISE: { name: "Compromis", description: "Donnant-donnant modéré.", poles: { low: "Tout ou rien", high: "Juste milieu" }, highDescriptor: "pragmatique et soucieux(se) d'équité", lowDescriptor: "moins enclin(e) à couper la poire en deux" },
    AVOID: { name: "Éviter", description: "Peu affirmé, peu coopératif : esquiver.", poles: { low: "Confrontant", high: "Fuyant" }, highDescriptor: "calme, réfractaire au conflit et apaisant(e)", lowDescriptor: "enclin(e) à s'impliquer plutôt qu'à se retirer" },
    ACCOMM: { name: "Accommoder", description: "Peu affirmé, coopératif : céder pour l'harmonie.", poles: { low: "S'affirme", high: "Cède" }, highDescriptor: "généreux(se), en quête d'harmonie et prêt(e) à se sacrifier", lowDescriptor: "moins enclin(e) à céder pour la paix" },
  },
  items: {
    CS1: "Un collègue défend un plan que vous jugez mauvais. Vous allez très probablement…", CS2: "La tension monte dans un désaccord. Votre instinct est de…", CS3: "Vous et un ami voulez des choses différentes pour un projet commun. Vous…", CS4: "Quelqu'un vous met au défi en réunion. Vous avez tendance à…", CS5: "Quand un conflit ne se résout tout simplement pas, vous allez surtout…",
    CS6: "Dans la plupart des désaccords, votre priorité absolue est de…", CS7: "Un membre de la famille veut quelque chose que vous ne voulez pas. Vous…", CS8: "Sous pression dans un différend, vous êtes par défaut…", CS9: "En repensant aux conflits que vous avez eus, le plus souvent vous…", CS10: "Le piège auquel vous êtes le plus enclin(e) en cas de conflit est…",
  },
  options: {
    CS1: ["défendre votre point fermement et pousser votre approche", "creuser ensemble le vrai problème pour trouver la meilleure réponse", "chercher un terrain d'entente acceptable pour vous deux", "laisser tomber pour l'instant et y revenir plus tard si ça compte", "vous rallier à son plan pour que tout reste fluide"],
    CS2: ["tenir bon et continuer à défendre votre point", "ralentir et démêler ce qui se passe vraiment", "proposer un partage rapide et équitable pour avancer tous les deux", "prendre du recul et laisser les choses se calmer", "céder pour préserver la paix"],
    CS3: ["plaider fort pour ce que vous voulez", "chercher une option qui donne à chacun l'essentiel", "que chacun cède un peu et se rejoindre au milieu", "suivre le mouvement et éviter d'en faire une affaire", "vous ranger à sa préférence"],
    CS4: ["répliquer et défendre votre position", "inviter son point de vue et construire vers une solution", "trouver un compromis qui satisfasse assez les deux", "détourner et faire avancer la discussion", "concéder pour éviter les frictions"],
    CS5: ["insister jusqu'à ce que ce soit réglé à votre façon", "continuer à y travailler jusqu'à satisfaire les besoins de chacun", "négocier un accord où chacun donne quelque chose", "le mettre de côté et vous retirer pour l'instant", "céder pour que ce soit fini"],
    CS6: ["obtenir le bon résultat, tel que vous le voyez", "résoudre pleinement le problème de fond", "parvenir vite à une résolution juste et réalisable", "garder le calme et éviter le drame", "protéger la relation et l'harmonie"],
    CS7: ["tenir bon sur ce dont vous avez besoin", "en parler jusqu'au bout vers une vraie solution", "trouver un compromis à mi-chemin", "laisser couler pour éviter une dispute", "lui donner raison pour préserver la paix"],
    CS8: ["décidé(e) et énergique", "ouvert(e) et axé(e) sur la solution", "pratique et impartial(e)", "discret(ète) et en retrait", "aimable et conciliant(e)"],
    CS9: ["vous êtes battu(e) pour votre position", "avez œuvré vers un gagnant-gagnant", "avez coupé la poire en deux", "vous en êtes éloigné(e)", "avez laissé l'autre avoir gain de cause"],
    CS10: ["gagner le point mais tendre la relation", "investir trop de temps dans de petites disputes", "vous contenter de moins que le possible", "laisser de vrais problèmes sans réponse", "enterrer vos propres besoins"],
  },
};
const KOLB_ES: InstrumentTranslation = {
  name: "Estilo de aprendizaje de Kolb", shortName: "Kolb",
  tagline: "Divergente, asimilador, convergente, acomodador: tu estilo de aprendizaje.",
  description: "El modelo de aprendizaje experiencial de David Kolb mapea cómo aprendes en dos ejes: cómo recibes la experiencia (sintiendo de forma concreta o pensando de forma abstracta) y cómo actúas sobre ella (observando de forma reflexiva o haciendo de forma activa). El cruce da cuatro estilos —divergente, asimilador, convergente y acomodador—, cada uno con su propia forma de convertir la experiencia en comprensión.",
  scales: {
    GRASP: { name: "Captar", description: "Cómo recibes la experiencia.", poles: { low: "Concreto (sentir)", high: "Abstracto (pensar)" }, highDescriptor: "abstracto: mediante el análisis y los conceptos", lowDescriptor: "concreto: mediante el sentir y la experiencia directa" },
    TRANS: { name: "Transformar", description: "Cómo actúas sobre la experiencia.", poles: { low: "Reflexivo (observar)", high: "Activo (hacer)" }, highDescriptor: "activo: experimentando y haciendo", lowDescriptor: "reflexivo: observando y meditando" },
  },
  items: {
    KG1: "Le encuentras sentido a algo nuevo sobre todo…", KG2: "Confías más en…", KG3: "Preferirías aprender de…", KG4: "Tu instinto es…",
    KT1: "Aprendes mejor…", KT2: "Ante algo nuevo, preferirías…", KT3: "Le encuentras sentido a las cosas…", KT4: "Por defecto sueles…",
  },
  options: {
    KG1: ["analizando las ideas y razonándolo", "guiándote por la experiencia concreta y lo que sientes"],
    KG2: ["las teorías, los conceptos y el análisis lógico", "la experiencia directa, práctica y personal"],
    KG3: ["modelos y principios abstractos", "los detalles concretos del momento"],
    KG4: ["dar un paso atrás hacia la idea de fondo", "quedarte con los detalles tangibles"],
    KT1: ["haciendo y probando cosas", "observando y reflexionando primero"],
    KT2: ["lanzarte y experimentar", "observar desde varios ángulos antes de actuar"],
    KT3: ["actuando sobre ellas", "pensándolas con calma"],
    KT4: ["ponerte manos a la obra enseguida", "formarte primero una opinión meditada"],
  },
};
const KOLB_FR: InstrumentTranslation = {
  name: "Style d'apprentissage de Kolb", shortName: "Kolb",
  tagline: "Divergent, assimilateur, convergent, accommodateur — votre style d'apprentissage.",
  description: "Le modèle d'apprentissage expérientiel de David Kolb cartographie votre façon d'apprendre sur deux axes : comment vous recevez l'expérience (par le ressenti concret ou la pensée abstraite) et comment vous agissez dessus (par l'observation réflexive ou l'action active). Le croisement donne quatre styles — divergent, assimilateur, convergent et accommodateur — chacun avec sa propre manière de transformer l'expérience en compréhension.",
  scales: {
    GRASP: { name: "Saisir", description: "Comment vous recevez l'expérience.", poles: { low: "Concret (ressentir)", high: "Abstrait (penser)" }, highDescriptor: "abstrait : par l'analyse et les concepts", lowDescriptor: "concret : par le ressenti et l'expérience directe" },
    TRANS: { name: "Transformer", description: "Comment vous agissez sur l'expérience.", poles: { low: "Réflexif (observer)", high: "Actif (faire)" }, highDescriptor: "actif : en expérimentant et en faisant", lowDescriptor: "réflexif : en observant et en méditant" },
  },
  items: {
    KG1: "Vous donnez du sens à quelque chose de nouveau surtout…", KG2: "Vous faites davantage confiance…", KG3: "Vous préféreriez apprendre…", KG4: "Votre instinct est de…",
    KT1: "Vous apprenez le mieux…", KT2: "Face à du nouveau, vous préféreriez…", KT3: "Vous donnez du sens aux choses…", KT4: "Par défaut, vous avez tendance à…",
  },
  options: {
    KG1: ["en analysant les idées et en y réfléchissant", "en vous laissant guider par l'expérience concrète et le ressenti"],
    KG2: ["aux théories, aux concepts et à l'analyse logique", "à l'expérience directe, pratique et personnelle"],
    KG3: ["des modèles et des principes abstraits", "des détails concrets de l'instant"],
    KG4: ["prendre du recul vers l'idée sous-jacente", "rester avec les détails tangibles"],
    KT1: ["en faisant et en essayant les choses", "en observant et en réfléchissant d'abord"],
    KT2: ["vous lancer et expérimenter", "observer sous plusieurs angles avant d'agir"],
    KT3: ["en agissant dessus", "en y réfléchissant tranquillement"],
    KT4: ["mettre la main à la pâte tout de suite", "vous forger d'abord un avis réfléchi"],
  },
};
const VARK_ES: InstrumentTranslation = {
  name: "Preferencias de aprendizaje VARK", shortName: "VARK",
  tagline: "Visual, auditivo, lectura/escritura, kinestésico: tus preferencias de estudio (con un matiz).",
  description: "VARK describe cuatro canales sensoriales que la gente suele preferir al estudiar: visual, auditivo, lectura/escritura y kinestésico. Es uno de los modelos de aprendizaje más populares del mundo. Lo incluimos por eso, pero con honestidad: la idea de que adaptar las clases a tu 'estilo' mejora el aprendizaje se ha probado una y otra vez y no se ha sostenido. Toma tu resultado como una preferencia que conviene conocer, nunca como un techo de lo que puedes aprender.",
  scales: {
    VIS: { name: "Visual", description: "Aprender mediante imágenes, diagramas y disposición espacial.", poles: { low: "Menos preferido", high: "Preferido" }, highDescriptor: "atraído/a por diagramas, gráficos y ver", lowDescriptor: "menos dependiente del material visual" },
    AUR: { name: "Auditivo", description: "Aprender mediante escuchar y hablar.", poles: { low: "Menos preferido", high: "Preferido" }, highDescriptor: "atraído/a por escuchar y conversar", lowDescriptor: "menos dependiente de la palabra hablada" },
    RDW: { name: "Lectura/Escritura", description: "Aprender mediante el texto: leer y escribir.", poles: { low: "Menos preferido", high: "Preferido" }, highDescriptor: "atraído/a por leer y escribir", lowDescriptor: "menos dependiente del texto" },
    KIN: { name: "Kinestésico", description: "Aprender mediante el hacer y la experiencia física.", poles: { low: "Menos preferido", high: "Preferido" }, highDescriptor: "atraído/a por la práctica manual", lowDescriptor: "menos dependiente de la práctica física" },
  },
  items: {
    Q1: "Estás aprendiendo a usar una app nueva. Preferirías…", Q2: "Alguien te pregunta cómo llegar a tu casa. Tú…", Q3: "Para fijar el nombre de alguien nuevo, lo que más ayuda es…", Q4: "Al elegir cómo seguir una receta, prefieres una que…",
    Q5: "Estudiando algo importante, lo más probable es que…", Q6: "Un aparato nuevo no funciona. Primero…", Q7: "Los profesores de los que mejor aprendes suelen…", Q8: "Para explicarle una idea nueva a un amigo, tú…",
    Q9: "Con una tarde libre para aprender algo, tú…", Q10: "Al recordar un gran viaje, lo primero que vuelve es…", Q11: "Con un juego de mesa nuevo, preferirías…", Q12: "Preparando una presentación, lo haces mejor…",
  },
  options: {
    Q1: ["explorar las pantallas y los iconos hasta que te cuadre", "que alguien te lo explique en voz alta", "leer primero la guía de ayuda", "toquetear y descubrirlo haciendo"],
    Q2: ["le dibujas o le envías un pequeño mapa", "le dices los giros en voz alta", "le escribes las indicaciones", "te ofreces a llevarle hasta allí"],
    Q3: ["imaginar su cara junto al nombre", "decirlo en voz alta unas cuantas veces", "verlo escrito o anotarlo", "ligarlo a un apretón de manos o un gesto"],
    Q4: ["muestre una foto de cada paso", "puedas seguir con un vídeo narrado", "liste instrucciones escritas claras", "te deje probar y ajustar sobre la marcha"],
    Q5: ["hagas diagramas, gráficos y notas con colores", "lo comentes en voz alta o repases grabaciones", "reescribas y releas tus notas", "uses tarjetas, modelos o problemas de práctica"],
    Q6: ["miras los diagramas del manual", "llamas a soporte y lo hablas", "lees la sección de resolución de problemas", "lo manipulas hasta que funcione"],
    Q7: ["usar diapositivas, diagramas y elementos visuales", "explicar y comentar las cosas en voz alta", "dar apuntes y lecturas", "hacer demostraciones y actividades prácticas"],
    Q8: ["se la dibujas", "se la cuentas", "se la escribes o le mandas un mensaje", "se la muestras con un ejemplo real"],
    Q9: ["verías un documental visual", "escucharías un pódcast o una charla", "leerías un libro o artículos", "harías un taller práctico"],
    Q10: ["cómo se veían los lugares", "los sonidos y las conversaciones", "lo que leíste o escribiste sobre él", "lo que hiciste y cómo te sentiste"],
    Q11: ["estudiar el tablero y las piezas para captarlo", "que alguien te explique las reglas", "leer el reglamento", "empezar una ronda de práctica y aprender sobre la marcha"],
    Q12: ["diseñando buenas diapositivas visuales", "ensayándola en voz alta", "escribiendo un guion completo", "practicando de pie con accesorios"],
  },
};
const VARK_FR: InstrumentTranslation = {
  name: "Préférences d'apprentissage VARK", shortName: "VARK",
  tagline: "Visuel, auditif, lecture/écriture, kinesthésique — vos préférences d'étude (avec une réserve).",
  description: "VARK décrit quatre canaux sensoriels que les gens préfèrent souvent pour étudier — visuel, auditif, lecture/écriture et kinesthésique. C'est l'un des modèles d'apprentissage les plus populaires au monde. Nous l'incluons pour cette raison, mais en toute honnêteté : l'idée qu'adapter les cours à votre « style » améliore l'apprentissage a été testée à maintes reprises sans se confirmer. Prenez votre résultat comme une préférence utile à connaître, jamais comme un plafond de ce que vous pouvez apprendre.",
  scales: {
    VIS: { name: "Visuel", description: "Apprendre par les images, les schémas et la disposition spatiale.", poles: { low: "Moins préféré", high: "Préféré" }, highDescriptor: "attiré(e) par les schémas, les graphiques et le visuel", lowDescriptor: "moins tributaire du matériel visuel" },
    AUR: { name: "Auditif", description: "Apprendre par l'écoute et la parole.", poles: { low: "Moins préféré", high: "Préféré" }, highDescriptor: "attiré(e) par l'écoute et la discussion", lowDescriptor: "moins tributaire de la parole" },
    RDW: { name: "Lecture/Écriture", description: "Apprendre par le texte — lire et écrire.", poles: { low: "Moins préféré", high: "Préféré" }, highDescriptor: "attiré(e) par la lecture et l'écriture", lowDescriptor: "moins tributaire du texte" },
    KIN: { name: "Kinesthésique", description: "Apprendre par l'action et l'expérience physique.", poles: { low: "Moins préféré", high: "Préféré" }, highDescriptor: "attiré(e) par la pratique manuelle", lowDescriptor: "moins tributaire de la pratique physique" },
  },
  items: {
    Q1: "Vous apprenez à utiliser une nouvelle appli. Vous préféreriez…", Q2: "Quelqu'un demande comment venir chez vous. Vous…", Q3: "Pour retenir le nom d'une nouvelle personne, ce qui aide le plus, c'est…", Q4: "Pour suivre une recette, vous préférez une qui…",
    Q5: "Pour réviser quelque chose d'important, vous allez surtout…", Q6: "Un appareil neuf ne marche pas. Vous allez d'abord…", Q7: "Les enseignants dont vous apprenez le mieux ont tendance à…", Q8: "Pour expliquer une nouvelle idée à un ami, vous…",
    Q9: "Avec un après-midi libre pour apprendre quelque chose, vous…", Q10: "En vous remémorant un beau voyage, ce qui revient en premier, c'est…", Q11: "Avec un nouveau jeu de société, vous préféreriez…", Q12: "En préparant une présentation, vous êtes au mieux en…",
  },
  options: {
    Q1: ["explorer les écrans et les icônes jusqu'à ce que ça fasse tilt", "qu'on vous guide à voix haute", "lire d'abord le guide d'aide", "tâtonner et comprendre en faisant"],
    Q2: ["lui dessiner ou envoyer un petit plan", "lui dire les tournants à voix haute", "écrire les indications", "proposer de l'y conduire"],
    Q3: ["imaginer son visage à côté du nom", "le dire à voix haute plusieurs fois", "le voir écrit ou le noter", "l'associer à une poignée de main ou un geste"],
    Q4: ["montre une photo de chaque étape", "se suit avec une vidéo commentée", "liste des instructions écrites claires", "vous laisse goûter et ajuster au fur et à mesure"],
    Q5: ["faire des schémas, des graphiques et des notes en couleurs", "en discuter à voix haute ou réécouter des enregistrements", "réécrire et relire vos notes", "utiliser des cartes, des modèles ou des exercices"],
    Q6: ["regarder les schémas du manuel", "appeler le support et en parler", "lire la section dépannage", "le manipuler jusqu'à ce qu'il marche"],
    Q7: ["utiliser diapositives, schémas et visuels", "expliquer et discuter les choses à voix haute", "donner des polycopiés et des lectures", "faire des démonstrations et des activités pratiques"],
    Q8: ["la lui dessiner", "la lui expliquer", "la lui écrire ou lui envoyer un message", "la lui montrer avec un exemple concret"],
    Q9: ["regarderiez un documentaire visuel", "écouteriez un podcast ou une conférence", "liriez un livre ou des articles", "feriez un atelier pratique"],
    Q10: ["à quoi ressemblaient les lieux", "les sons et les conversations", "ce que vous avez lu ou écrit dessus", "ce que vous avez fait et ressenti"],
    Q11: ["étudier le plateau et les pièces pour le saisir", "qu'on vous explique les règles", "lire le livret de règles", "lancer une manche d'essai et apprendre en jouant"],
    Q12: ["concevant de bonnes diapositives visuelles", "la répétant à voix haute", "rédigeant un script complet", "vous entraînant debout avec des accessoires"],
  },
};
const CHRONO_ES: InstrumentTranslation = {
  name: "Cronotipo (alondra o búho)", shortName: "Cronotipo",
  tagline: "El reloj natural de tu cuerpo: cuándo estás de verdad en tu mejor momento.",
  description: "Tu cronotipo es tu tendencia biológica hacia la matutinidad o la vespertinidad: marca cuándo estás alerta, cuándo te concentras mejor y cuándo deberías dormir. La mayoría lo combate; alinearte con él es una forma sencilla y respaldada por la investigación de sentirte más agudo/a y descansar mejor.",
  scales: {
    MORN: { name: "Matutinidad–Vespertinidad", description: "Dónde caen tu energía y tus horarios de sueño naturales.", poles: { low: "Búho nocturno", high: "Madrugador" }, highDescriptor: "madrugador/a, alerta y concentrado/a por la mañana", lowDescriptor: "persona vespertina, en tu mejor momento al caer la noche" },
  },
  items: {
    M1: "Me despierto temprano de forma natural y me siento despejado/a poco después.", M2: "Mi pensamiento más agudo lo tengo en la primera mitad del día.", M3: "Empiezo a decaer y me entra sueño bastante pronto por la noche.", M4: "Si pudiera elegir libremente, me acostaría temprano y me levantaría temprano.",
    M5: "Alcanzo mi mejor momento por la tarde y por la noche.", M6: "Preferiría con mucho quedarme despierto/a hasta tarde que tener que madrugar.", M7: "Las mañanas se me hacen difíciles: necesito horas para sentirme plenamente persona.", M8: "Mi energía y mi creatividad alcanzan su punto máximo al anochecer.",
  },
};
const CHRONO_FR: InstrumentTranslation = {
  name: "Chronotype (alouette ou hibou)", shortName: "Chronotype",
  tagline: "L'horloge naturelle de votre corps — quand vous êtes vraiment au meilleur de vous-même.",
  description: "Votre chronotype est votre tendance biologique vers le matin ou le soir : il détermine quand vous êtes alerte, quand vous vous concentrez le mieux et quand vous devriez dormir. La plupart des gens le combattent ; s'aligner sur lui est un moyen simple et étayé par la recherche de se sentir plus vif et de mieux récupérer.",
  scales: {
    MORN: { name: "Matinalité–Vespéralité", description: "Où se situent votre énergie et vos horaires de sommeil naturels.", poles: { low: "Couche-tard", high: "Lève-tôt" }, highDescriptor: "lève-tôt, alerte et concentré(e) le matin", lowDescriptor: "personne du soir, au meilleur de vous-même après la tombée de la nuit" },
  },
  items: {
    M1: "Je me réveille tôt naturellement et je me sens alerte peu après.", M2: "Je réfléchis le plus finement dans la première moitié de la journée.", M3: "Je commence à fatiguer et à avoir sommeil assez tôt le soir.", M4: "Si je pouvais choisir librement, je me coucherais tôt et me lèverais tôt.",
    M5: "J'atteins mon rythme le soir et la nuit.", M6: "Je préférerais de loin veiller tard plutôt que devoir me lever tôt.", M7: "Les matins sont durs pour moi — il me faut des heures pour me sentir pleinement humain(e).", M8: "Mon énergie et ma créativité culminent après la tombée de la nuit.",
  },
};
const FOURTEMP_ES: InstrumentTranslation = {
  name: "Los Cuatro Temperamentos", shortName: "Temperamentos",
  tagline: "El mapa clásico: sanguíneo, colérico, melancólico, flemático.",
  description: "Uno de los modelos más antiguos de la personalidad, los cuatro temperamentos —sanguíneo (vivaz), colérico (decidido), melancólico (profundo) y flemático (tranquilo)— siguen siendo una forma vívida e intuitiva de entenderte. Este perfilador encuentra tu temperamento principal y el secundario que lo matiza.",
  scales: {
    SANG: { name: "Sanguíneo", description: "Sociable, entusiasta, vivaz, espontáneo.", poles: { low: "Reservado", high: "Vivaz" }, highDescriptor: "extrovertido/a, entusiasta y amante de la diversión", lowDescriptor: "más reservado/a que sociable" },
    CHOL: { name: "Colérico", description: "Decidido, resolutivo, ambicioso, fogoso.", poles: { low: "Apacible", high: "Decidido" }, highDescriptor: "ambicioso/a, resolutivo/a y audaz", lowDescriptor: "menos inclinado/a a liderar y empujar" },
    MEL: { name: "Melancólico", description: "Analítico, profundo, sensible, perfeccionista.", poles: { low: "Ligero", high: "Profundo" }, highDescriptor: "reflexivo/a, de sentir profundo y preciso/a", lowDescriptor: "menos inclinado/a al análisis profundo y la intensidad" },
    PHLEG: { name: "Flemático", description: "Tranquilo, apacible, leal, pacífico.", poles: { low: "Inquieto", high: "Tranquilo" }, highDescriptor: "tranquilo/a, paciente y estable", lowDescriptor: "menos plácido/a, más inquieto/a" },
  },
  items: {
    SA1: "Soy extrovertido/a, hablador/a y me encanta estar rodeado/a de gente.", SA2: "Soy entusiasta y aporto energía y diversión allá donde voy.", SA3: "Actúo por impulso y persigo lo que me emociona en el momento.", SA4: "Hago amigos con facilidad y rara vez me topo con un extraño.",
    CH1: "Soy decidido/a, resolutivo/a y me gusta estar al mando.", CH2: "Me fijo grandes metas y me esfuerzo mucho por lograrlas.", CH3: "Soy directo/a y no temo la confrontación.", CH4: "Me impaciento cuando las cosas o las personas van demasiado lento.",
    ME1: "Soy analítico/a y pienso a fondo antes de actuar.", ME2: "Mantengo estándares altos y noto cada fallo y detalle.", ME3: "Siento las cosas con intensidad y puedo emocionarme con fuerza.", ME4: "Prefiero la planificación cuidadosa y el orden a la espontaneidad.",
    PH1: "Soy tranquilo/a, estable y difícil de alterar.", PH2: "Soy de trato fácil y me amoldo para mantener la paz.", PH3: "Soy paciente, leal y de fiar.", PH4: "Prefiero una vida tranquila y predecible al drama y el cambio.",
  },
};
const FOURTEMP_FR: InstrumentTranslation = {
  name: "Les Quatre Tempéraments", shortName: "Tempéraments",
  tagline: "La carte classique : sanguin, colérique, mélancolique, flegmatique.",
  description: "L'un des plus anciens modèles de la personnalité, les quatre tempéraments — sanguin (vif), colérique (déterminé), mélancolique (profond) et flegmatique (calme) — restent une façon vivante et intuitive de se comprendre. Ce profileur trouve votre tempérament dominant et le secondaire qui le nuance.",
  scales: {
    SANG: { name: "Sanguin", description: "Sociable, enthousiaste, vif, spontané.", poles: { low: "Réservé", high: "Vif" }, highDescriptor: "sociable, enthousiaste et amateur(trice) de plaisir", lowDescriptor: "plus réservé(e) que sociable" },
    CHOL: { name: "Colérique", description: "Déterminé, décidé, ambitieux, fougueux.", poles: { low: "Accommodant", high: "Déterminé" }, highDescriptor: "ambitieux(se), décidé(e) et audacieux(se)", lowDescriptor: "moins porté(e) à diriger et à pousser" },
    MEL: { name: "Mélancolique", description: "Analytique, profond, sensible, perfectionniste.", poles: { low: "Léger", high: "Profond" }, highDescriptor: "réfléchi(e), au ressenti profond et précis(e)", lowDescriptor: "moins porté(e) à l'analyse profonde et à l'intensité" },
    PHLEG: { name: "Flegmatique", description: "Calme, accommodant, loyal, paisible.", poles: { low: "Agité", high: "Calme" }, highDescriptor: "calme, patient(e) et stable", lowDescriptor: "moins placide, plus agité(e)" },
  },
  items: {
    SA1: "Je suis sociable, bavard(e) et j'adore être entouré(e).", SA2: "Je suis enthousiaste et j'apporte énergie et plaisir partout où je vais.", SA3: "J'agis sur un coup de tête et je poursuis ce qui m'excite sur le moment.", SA4: "Je me fais des amis facilement et je ne rencontre presque jamais d'inconnu.",
    CH1: "Je suis déterminé(e), décidé(e) et j'aime être aux commandes.", CH2: "Je me fixe de grands objectifs et je travaille dur pour les atteindre.", CH3: "Je suis direct(e) et je ne crains pas la confrontation.", CH4: "Je m'impatiente quand les choses ou les gens vont trop lentement.",
    ME1: "Je suis analytique et je réfléchis à fond avant d'agir.", ME2: "Je tiens des standards élevés et je remarque chaque défaut et détail.", ME3: "Je ressens les choses profondément et je peux être saisi(e) d'une forte émotion.", ME4: "Je préfère la planification soignée et l'ordre à la spontanéité.",
    PH1: "Je suis calme, stable et difficile à ébranler.", PH2: "Je suis accommodant(e) et je m'adapte pour préserver la paix.", PH3: "Je suis patient(e), loyal(e) et fiable.", PH4: "Je préfère une vie tranquille et prévisible au drame et au changement.",
  },
};
const COLOR_ES: InstrumentTranslation = {
  name: "Cuatro estilos de color", shortName: "Colores",
  tagline: "Dorado, azul, verde, naranja: tu color al trabajar y relacionarte.",
  description: "Una instantánea amable y codificada por colores de cómo trabajas y te relacionas, en la tradición de True Colors e Insights Discovery. El Dorado organiza, el Azul conecta, el Verde analiza y el Naranja se aventura. La mayoría es una mezcla liderada por un color brillante: un lenguaje rápido y memorable para equipos, familias y autoconocimiento.",
  scales: {
    GOLD: { name: "Dorado — Estructura", description: "Responsabilidad, orden y deber.", poles: { low: "Flexible", high: "Estructurado" }, highDescriptor: "organizado/a, fiable y cumplidor/a", lowDescriptor: "suelto/a y sin estructura" },
    BLUE: { name: "Azul — Conexión", description: "Empatía, armonía y sentido.", poles: { low: "Distante", high: "Cariñoso" }, highDescriptor: "cálido/a, empático/a y buscador/a de armonía", lowDescriptor: "distante y práctico/a" },
    GREEN: { name: "Verde — Análisis", description: "Lógica, curiosidad y competencia.", poles: { low: "Intuitivo", high: "Analítico" }, highDescriptor: "analítico/a, de cabeza fría y curioso/a", lowDescriptor: "guiado/a por el sentir y menos analítico/a" },
    ORANGE: { name: "Naranja — Acción", description: "Espontaneidad, energía y audacia.", poles: { low: "Estable", high: "Espontáneo" }, highDescriptor: "espontáneo/a, enérgico/a y audaz", lowDescriptor: "estable y amante de la rutina" },
  },
  items: {
    G1: "Me gustan los planes claros, los horarios y hacer las cosas como es debido.", G2: "Soy fiable, organizado/a y termino lo que me comprometo a hacer.", G3: "Valoro la tradición, el deber y ser responsable.", G4: "Me siento incómodo/a cuando las cosas están desorganizadas o se dejan para el último momento.",
    B1: "Me importan profundamente los sentimientos de la gente y la armonía.", B2: "Busco el sentido, la autenticidad y la conexión.", B3: "Soy cálido/a, empático/a y buen/a oyente.", B4: "Ayudar a los demás a crecer es una de mis mayores alegrías.",
    N1: "Pienso las cosas con lógica y valoro la competencia.", N2: "Soy curioso/a y me encanta entender cómo funcionan las cosas.", N3: "Me mantengo sereno/a y analítico/a cuando otros se emocionan.", N4: "Cuestiono las suposiciones y quiero pruebas antes de convencerme.",
    O1: "Soy espontáneo/a y me encantan la acción, la variedad y la diversión.", O2: "Actúo rápido y me adapto con facilidad en el momento.", O3: "Me inquietan demasiadas reglas o rutinas.", O4: "Soy audaz, juguetón/a y me gusta algo de riesgo.",
  },
};
const COLOR_FR: InstrumentTranslation = {
  name: "Quatre styles de couleur", shortName: "Couleurs",
  tagline: "Or, bleu, vert, orange — votre couleur au travail et dans les relations.",
  description: "Un aperçu convivial et codé par couleurs de votre façon de travailler et de vous relier, dans la tradition de True Colors et d'Insights Discovery. L'Or organise, le Bleu relie, le Vert analyse et l'Orange se lance à l'aventure. La plupart des gens sont un mélange mené par une couleur vive : un langage rapide et mémorable pour les équipes, les familles et la connaissance de soi.",
  scales: {
    GOLD: { name: "Or — Structure", description: "Responsabilité, ordre et devoir.", poles: { low: "Flexible", high: "Structuré" }, highDescriptor: "organisé(e), fiable et consciencieux(se)", lowDescriptor: "relâché(e) et sans structure" },
    BLUE: { name: "Bleu — Connexion", description: "Empathie, harmonie et sens.", poles: { low: "Détaché", high: "Attentionné" }, highDescriptor: "chaleureux(se), empathique et en quête d'harmonie", lowDescriptor: "détaché(e) et terre-à-terre" },
    GREEN: { name: "Vert — Analyse", description: "Logique, curiosité et compétence.", poles: { low: "Intuitif", high: "Analytique" }, highDescriptor: "analytique, de sang-froid et curieux(se)", lowDescriptor: "guidé(e) par le ressenti et moins analytique" },
    ORANGE: { name: "Orange — Action", description: "Spontanéité, énergie et audace.", poles: { low: "Stable", high: "Spontané" }, highDescriptor: "spontané(e), énergique et audacieux(se)", lowDescriptor: "stable et amateur(trice) de routine" },
  },
  items: {
    G1: "J'aime les plans clairs, les emplois du temps et faire les choses correctement.", G2: "Je suis fiable, organisé(e) et je termine ce que je m'engage à faire.", G3: "Je valorise la tradition, le devoir et le fait d'être responsable.", G4: "Je suis mal à l'aise quand les choses sont désorganisées ou faites à la dernière minute.",
    B1: "Je me soucie profondément des sentiments des gens et de l'harmonie.", B2: "Je recherche le sens, l'authenticité et la connexion.", B3: "Je suis chaleureux(se), empathique et bon(ne) auditeur(trice).", B4: "Aider les autres à grandir est l'une de mes plus grandes joies.",
    N1: "Je réfléchis logiquement et je valorise la compétence.", N2: "Je suis curieux(se) et j'adore comprendre comment les choses fonctionnent.", N3: "Je reste calme et analytique quand les autres s'emportent.", N4: "Je remets en question les suppositions et je veux des preuves avant d'être convaincu(e).",
    O1: "Je suis spontané(e) et j'adore l'action, la variété et le plaisir.", O2: "J'agis vite et je m'adapte facilement sur le moment.", O3: "Trop de règles ou de routines me rendent agité(e).", O4: "Je suis audacieux(se), joueur(se) et j'aime un peu de risque.",
  },
};
const KEIRSEY_ES: InstrumentTranslation = {
  name: "Temperamentos de Keirsey", shortName: "Keirsey",
  tagline: "Cuatro temperamentos: guardián, artesano, idealista, racional.",
  description: "David Keirsey reorganizó los dieciséis tipos junguianos en cuatro temperamentos construidos sobre dos preguntas: ¿te comunicas en términos concretos o abstractos, y actúas de forma cooperativa o haces lo que sea eficaz? El cruce de esos dos ejes da el guardián, el artesano, el idealista y el racional: una mirada memorable y centrada en la conducta sobre el tipo.",
  scales: {
    COMM: { name: "Comunicación", description: "Enfoque concreto/observador frente a abstracto/introspectivo.", poles: { low: "Concreta", high: "Abstracta" }, highDescriptor: "abstracto/a, orientado/a al futuro y a las posibilidades", lowDescriptor: "concreto/a, factual y centrado/a en el presente" },
    ACT: { name: "Acción", description: "Enfoque cooperativo (correcto) frente a utilitario (eficaz).", poles: { low: "Cooperativa", high: "Utilitaria" }, highDescriptor: "utilitario/a: hace lo que funciona", lowDescriptor: "cooperativo/a: hace lo que es correcto" },
  },
  items: {
    KC1: "Cuando hablas y piensas, te atraen más…", KC2: "Preferirías que una buena conversación fuera…", KC3: "Tu atención va naturalmente hacia…", KC4: "Confías más en…", KC5: "Tu mente tiende a derivar hacia…",
    KA1: "Para alcanzar una meta, preferirías…", KA2: "¿Qué te guía más?", KA3: "Cuando el método oficial es ineficiente, tú…", KA4: "Te sientes mejor cuando…", KA5: "Te describirías como más…",
  },
  options: {
    KC1: ["las teorías, los patrones y lo que las cosas podrían significar", "los hechos concretos y lo que tienes delante"],
    KC2: ["imaginativa, simbólica o filosófica", "práctica, literal y con los pies en la tierra"],
    KC3: ["las posibilidades futuras y lo que podría ser", "las realidades del presente y lo que de hecho es"],
    KC4: ["la teoría y los patrones que infieres", "la experiencia directa y lo tangible"],
    KC5: ["las abstracciones y el sentido de conjunto", "los detalles, las especificidades y lo concreto"],
    KA1: ["hacer lo que funcione, aunque sea poco convencional", "hacerlo de la forma correcta y debida"],
    KA2: ["la eficacia y los resultados", "las reglas y el procedimiento aceptado"],
    KA3: ["improvisas el tuyo, que funciona", "lo sigues igualmente, por corrección"],
    KA4: ["consigues el resultado por cualquier medio sensato", "actúas de formas socialmente aprobadas"],
    KA5: ["pragmático/a y utilitario/a", "cooperativo/a y correcto/a"],
  },
};
const KEIRSEY_FR: InstrumentTranslation = {
  name: "Tempéraments de Keirsey", shortName: "Keirsey",
  tagline: "Quatre tempéraments — gardien, artisan, idéaliste, rationnel.",
  description: "David Keirsey a réorganisé les seize types jungiens en quatre tempéraments fondés sur deux questions : communiquez-vous en termes concrets ou abstraits, et agissez-vous de façon coopérative ou faites-vous ce qui est efficace ? Le croisement de ces deux axes donne le gardien, l'artisan, l'idéaliste et le rationnel — un regard mémorable et centré sur le comportement.",
  scales: {
    COMM: { name: "Communication", description: "Focalisation concrète/observatrice vs. abstraite/introspective.", poles: { low: "Concrète", high: "Abstraite" }, highDescriptor: "abstrait(e), tourné(e) vers l'avenir et les possibilités", lowDescriptor: "concret(ète), factuel(le) et centré(e) sur le présent" },
    ACT: { name: "Action", description: "Approche coopérative (correcte) vs. utilitaire (efficace).", poles: { low: "Coopérative", high: "Utilitaire" }, highDescriptor: "utilitaire : fait ce qui marche", lowDescriptor: "coopératif(ve) : fait ce qui est correct" },
  },
  items: {
    KC1: "Quand vous parlez et pensez, vous êtes plus attiré(e) par…", KC2: "Vous préféreriez qu'une bonne conversation soit…", KC3: "Votre attention va naturellement vers…", KC4: "Vous faites davantage confiance…", KC5: "Votre esprit a tendance à dériver vers…",
    KA1: "Pour atteindre un but, vous préféreriez…", KA2: "Qu'est-ce qui vous guide le plus ?", KA3: "Quand la méthode officielle est inefficace, vous…", KA4: "Vous vous sentez mieux quand vous…", KA5: "Vous vous décririez comme plutôt…",
  },
  options: {
    KC1: ["les théories, les motifs et ce que les choses pourraient signifier", "les faits concrets et ce qui est devant vous"],
    KC2: ["imaginative, symbolique ou philosophique", "pratique, littérale et terre-à-terre"],
    KC3: ["les possibilités futures et ce qui pourrait être", "les réalités présentes et ce qui est réellement"],
    KC4: ["la théorie et les motifs que vous déduisez", "l'expérience directe et le tangible"],
    KC5: ["les abstractions et le sens d'ensemble", "les détails, les spécificités et le concret"],
    KA1: ["faire ce qui marche, même si c'est peu conventionnel", "le faire de la bonne et juste manière"],
    KA2: ["l'efficacité et les résultats", "les règles et la procédure admise"],
    KA3: ["improvisez la vôtre, qui marche", "la suivez quand même, par correction"],
    KA4: ["obtenez le résultat par tout moyen sensé", "agissez de façons socialement approuvées"],
    KA5: ["pragmatique et utilitaire", "coopératif(ve) et correct(e)"],
  },
};

export const TRANSLATIONS: Record<string, Record<string, InstrumentTranslation>> = {
  es: {
    "big-five-ipip50": BIG_FIVE_ES, "disc-4": DISC_ES, "enneagram-9": ENNEAGRAM_ES,
    "perma-flourishing": PERMA_ES, "life-satisfaction-swls": SWLS_ES, "brief-resilience": RESILIENCE_ES,
    "self-esteem-rses": SELFESTEEM_ES, "mood-checkin": MOOD_ES, "hexaco-24": HEXACO_ES, "dark-triad-18": DARKTRIAD_ES,
    "jung-16-types": JUNG_ES, "optimism-lotr": OPTIMISM_ES, "hope-scale": HOPE_ES, "curiosity-cei": CURIOSITY_ES,
    "procrastination-pps": PROCRAST_ES, "perfectionism-2f": PERFECT_ES, "gratitude-gq6": GRATITUDE_ES,
    "self-efficacy-gse": SELFEFF_ES, "emotion-regulation-erq": EMOREG_ES, "self-control-bscs": SELFCTRL_ES,
    "grit-resilience": GRIT_ES, "need-for-cognition": NFC_ES, "mindset-dweck": MINDSET_ES, "emotional-intelligence": EQ_ES, "riasec-careers": RIASEC_ES, "empathy-iri": EMPATHY_ES,
    "eysenck-pen": EYSENCK_ES, "perceived-stress": PSS_ES, "worry-checkin": WORRY_ES,
    "zkpq-alt5": ZKPQ_ES, "tci-cloninger": TCI_ES, "sensation-seeking": SENSATION_ES,
    "panas-affect": PANAS_ES, "ryff-wellbeing": RYFF_ES, "burnout-mbi": BURNOUT_ES,
    "locus-of-control": LOCUS_ES, "self-monitoring": SELFMON_ES, "moral-foundations": MORAL_ES,
    "big-five-aspects": BFAS_ES, "career-derailers": DERAIL_ES, "pid5-maladaptive": PID5_ES, "rokeach-values": ROKEACH_ES,
    "schwartz-values": SCHWARTZ_ES, "sixteen-pf": SIXTEENPF_ES, "attachment-styles": ATTACH_ES, "love-languages": LOVELANG_ES, "conflict-style": CONFLICT_ES,
    "kolb-learning": KOLB_ES, "vark-learning": VARK_ES, "chronotype": CHRONO_ES, "four-temperaments": FOURTEMP_ES, "color-styles": COLOR_ES, "keirsey-temperaments": KEIRSEY_ES,
  },
  fr: {
    "big-five-ipip50": BIG_FIVE_FR, "disc-4": DISC_FR, "enneagram-9": ENNEAGRAM_FR,
    "perma-flourishing": PERMA_FR, "life-satisfaction-swls": SWLS_FR, "brief-resilience": RESILIENCE_FR,
    "self-esteem-rses": SELFESTEEM_FR, "mood-checkin": MOOD_FR, "hexaco-24": HEXACO_FR, "dark-triad-18": DARKTRIAD_FR,
    "jung-16-types": JUNG_FR, "optimism-lotr": OPTIMISM_FR, "hope-scale": HOPE_FR, "curiosity-cei": CURIOSITY_FR,
    "procrastination-pps": PROCRAST_FR, "perfectionism-2f": PERFECT_FR, "gratitude-gq6": GRATITUDE_FR,
    "self-efficacy-gse": SELFEFF_FR, "emotion-regulation-erq": EMOREG_FR, "self-control-bscs": SELFCTRL_FR,
    "grit-resilience": GRIT_FR, "need-for-cognition": NFC_FR, "mindset-dweck": MINDSET_FR, "emotional-intelligence": EQ_FR, "riasec-careers": RIASEC_FR, "empathy-iri": EMPATHY_FR,
    "eysenck-pen": EYSENCK_FR, "perceived-stress": PSS_FR, "worry-checkin": WORRY_FR,
    "zkpq-alt5": ZKPQ_FR, "tci-cloninger": TCI_FR, "sensation-seeking": SENSATION_FR,
    "panas-affect": PANAS_FR, "ryff-wellbeing": RYFF_FR, "burnout-mbi": BURNOUT_FR,
    "locus-of-control": LOCUS_FR, "self-monitoring": SELFMON_FR, "moral-foundations": MORAL_FR,
    "big-five-aspects": BFAS_FR, "career-derailers": DERAIL_FR, "pid5-maladaptive": PID5_FR, "rokeach-values": ROKEACH_FR,
    "schwartz-values": SCHWARTZ_FR, "sixteen-pf": SIXTEENPF_FR, "attachment-styles": ATTACH_FR, "love-languages": LOVELANG_FR, "conflict-style": CONFLICT_FR,
    "kolb-learning": KOLB_FR, "vark-learning": VARK_FR, "chronotype": CHRONO_FR, "four-temperaments": FOURTEMP_FR, "color-styles": COLOR_FR, "keirsey-temperaments": KEIRSEY_FR,
  },
};

/* ── Typological result-card translations (DISC + Enneagram) ──
   resolveType bakes its strings into the output, so we give those two instruments a
   locale-keyed string bundle. The English default lives in each instrument file
   (so this module stays cycle-free); these provide es/fr, or undefined to fall back. */

export interface DiscTypeBundle {
  meta: Record<string, { name: string; title: string; desc: string; summary: string }>;
  labels: { primary: string; secondary: string; pattern: string; fullOrder: string };
  blend: string; // "{a}/{b} blend"
  clear: string; // "Clear {a}"
  blendDetail: string;
  clearDetail: string;
}

const DISC_TYPE_ES: DiscTypeBundle = {
  meta: {
    D: { name: "Dominancia", title: "El Impulsor", desc: "directo, decidido, orientado a resultados", summary: "Directo y decidido, te mueves por resultados y no temes tomar el mando." },
    I: { name: "Influencia", title: "El Inspirador", desc: "extrovertido, entusiasta, persuasivo", summary: "Extrovertido y entusiasta, conectas con la gente y la inspiras a actuar." },
    S: { name: "Estabilidad", title: "El Apoyo", desc: "paciente, fiable, cooperativo", summary: "Paciente y fiable, aportas calma, lealtad y estabilidad al equipo." },
    C: { name: "Cumplimiento", title: "El Analista", desc: "preciso, analítico, centrado en la calidad", summary: "Preciso y analítico, valoras la exactitud, la estructura y hacer las cosas bien." },
  },
  labels: { primary: "Estilo principal", secondary: "Estilo secundario", pattern: "Patrón", fullOrder: "Orden completo" },
  blend: "mezcla {a}/{b}", clear: "{a} claro",
  blendDetail: "dos estilos van muy parejos", clearDetail: "un estilo destaca con claridad",
};

const DISC_TYPE_FR: DiscTypeBundle = {
  meta: {
    D: { name: "Dominance", title: "Le Meneur", desc: "direct, décidé, orienté résultats", summary: "Direct et décidé, vous visez les résultats et n'avez pas peur de prendre les commandes." },
    I: { name: "Influence", title: "L'Inspirateur", desc: "sociable, enthousiaste, persuasif", summary: "Sociable et enthousiaste, vous reliez les gens et les incitez à agir." },
    S: { name: "Stabilité", title: "Le Soutien", desc: "patient, fiable, coopératif", summary: "Patient et fiable, vous apportez calme, loyauté et stabilité à l'équipe." },
    C: { name: "Conformité", title: "L'Analyste", desc: "précis, analytique, axé sur la qualité", summary: "Précis et analytique, vous valorisez l'exactitude, la structure et le travail bien fait." },
  },
  labels: { primary: "Style principal", secondary: "Style secondaire", pattern: "Profil", fullOrder: "Ordre complet" },
  blend: "mélange {a}/{b}", clear: "{a} net",
  blendDetail: "deux styles sont au coude à coude", clearDetail: "un style se détache nettement",
};

export function discTypeStrings(locale?: string): DiscTypeBundle | undefined {
  return locale === "es" ? DISC_TYPE_ES : locale === "fr" ? DISC_TYPE_FR : undefined;
}

export interface EnneaTypeBundle {
  typeWord: string;
  meta: Record<number, { name: string; short: string; title: string; desire: string; fear: string; passion: string; virtue: string; summary: string }>;
  center: { Body: string; Heart: string; Head: string };
  centerDetail: { Body: string; Heart: string; Head: string };
  labels: { core: string; wing: string; center: string; desire: string; fear: string; passionVirtue: string; resonances: string };
  flavored: string; // "flavored by Type {w} ({name})"
}

const ENNEA_TYPE_ES: EnneaTypeBundle = {
  typeWord: "Tipo",
  meta: {
    1: { name: "El Reformador", short: "Reformador", title: "Íntegro, con propósito, autocontrolado", desire: "ser bueno, correcto y equilibrado", fear: "ser corrupto, defectuoso o estar equivocado", passion: "ira (contenida como resentimiento)", virtue: "serenidad", summary: "Un idealista concienzudo impulsado a mejorarse a sí mismo y al mundo." },
    2: { name: "El Ayudador", short: "Ayudador", title: "Cariñoso, generoso, complaciente", desire: "sentirse amado y necesitado", fear: "no ser querido o no merecer amor", passion: "orgullo", virtue: "humildad", summary: "Una presencia cálida y entregada, atenta a las necesidades de los demás." },
    3: { name: "El Triunfador", short: "Triunfador", title: "Adaptable, ambicioso, consciente de su imagen", desire: "sentirse valioso y digno", fear: "no valer nada o ser un fracaso", passion: "engaño (de la autoimagen)", virtue: "autenticidad", summary: "Un ejecutor ambicioso y eficiente centrado en el éxito y el reconocimiento." },
    4: { name: "El Individualista", short: "Individualista", title: "Sensible, expresivo, introspectivo", desire: "ser uno mismo y encontrar su identidad", fear: "no tener significado ni identidad", passion: "envidia", virtue: "ecuanimidad", summary: "Un buscador emocionalmente honesto de profundidad, sentido y autenticidad." },
    5: { name: "El Investigador", short: "Investigador", title: "Perceptivo, cerebral, autosuficiente", desire: "ser capaz y competente", fear: "ser inútil, incapaz o verse desbordado", passion: "avaricia (de energía)", virtue: "desapego", summary: "Un pensador reservado y perspicaz que domina el conocimiento para sentirse seguro." },
    6: { name: "El Leal", short: "Leal", title: "Comprometido, vigilante, en busca de seguridad", desire: "tener seguridad y apoyo", fear: "quedarse sin guía ni apoyo", passion: "miedo (ansiedad)", virtue: "coraje", summary: "Un aliado fiable y alerta que se prepara para lo que podría salir mal." },
    7: { name: "El Entusiasta", short: "Entusiasta", title: "Espontáneo, versátil, optimista", desire: "estar satisfecho y contento", fear: "verse privado, atrapado o con dolor", passion: "gula (de experiencias)", virtue: "sobriedad", summary: "Un aventurero ágil y animado que persigue posibilidades y estímulos." },
    8: { name: "El Desafiador", short: "Desafiador", title: "Decidido, poderoso, protector", desire: "protegerse y mantener el control de su vida", fear: "ser dañado, controlado o violado", passion: "lujuria (intensidad)", virtue: "inocencia", summary: "Un protector fuerte y firme que afronta la vida de frente." },
    9: { name: "El Pacificador", short: "Pacificador", title: "Receptivo, tranquilizador, apacible", desire: "tener paz interior y exterior", fear: "la pérdida, la separación y el conflicto", passion: "pereza (olvido de sí)", virtue: "acción correcta", summary: "Una presencia serena y acogedora que aporta calma y busca la armonía." },
  },
  center: { Body: "Cuerpo", Heart: "Corazón", Head: "Cabeza" },
  centerDetail: { Body: "el centro visceral/instintivo (ira)", Heart: "el centro del corazón/sentimiento (vergüenza)", Head: "el centro mental/del pensamiento (miedo)" },
  labels: { core: "Tipo principal", wing: "Ala", center: "Centro de inteligencia", desire: "Deseo básico", fear: "Miedo básico", passionVirtue: "Pasión → Virtud", resonances: "Mayores resonancias" },
  flavored: "matizado por el Tipo {w} ({name})",
};

const ENNEA_TYPE_FR: EnneaTypeBundle = {
  typeWord: "Type",
  meta: {
    1: { name: "Le Réformateur", short: "Réformateur", title: "Intègre, déterminé, maître de soi", desire: "être bon, juste et équilibré", fear: "d'être corrompu, défectueux ou dans l'erreur", passion: "la colère (retenue en ressentiment)", virtue: "la sérénité", summary: "Un idéaliste consciencieux poussé à s'améliorer et à améliorer le monde." },
    2: { name: "L'Altruiste", short: "Altruiste", title: "Attentionné, généreux, désireux de plaire", desire: "se sentir aimé et nécessaire", fear: "d'être indésirable ou indigne d'amour", passion: "l'orgueil", virtue: "l'humilité", summary: "Une présence chaleureuse et généreuse, attentive aux besoins des autres." },
    3: { name: "Le Battant", short: "Battant", title: "Adaptable, ambitieux, soucieux de son image", desire: "se sentir précieux et utile", fear: "de ne rien valoir ou d'échouer", passion: "la tromperie (de l'image de soi)", virtue: "l'authenticité", summary: "Un performeur ambitieux et efficace, centré sur la réussite et la reconnaissance." },
    4: { name: "L'Individualiste", short: "Individualiste", title: "Sensible, expressif, introspectif", desire: "être pleinement soi-même et trouver son identité", fear: "de n'avoir ni importance ni identité", passion: "l'envie", virtue: "l'équanimité", summary: "Un chercheur émotionnellement honnête de profondeur, de sens et d'authenticité." },
    5: { name: "L'Investigateur", short: "Investigateur", title: "Perspicace, cérébral, autonome", desire: "être capable et compétent", fear: "d'être inutile, incapable ou dépassé", passion: "l'avarice (de son énergie)", virtue: "le détachement", summary: "Un penseur discret et perspicace qui maîtrise le savoir pour se sentir en sécurité." },
    6: { name: "Le Loyaliste", short: "Loyaliste", title: "Engagé, vigilant, en quête de sécurité", desire: "avoir de la sécurité et du soutien", fear: "de se retrouver sans repère ni soutien", passion: "la peur (l'anxiété)", virtue: "le courage", summary: "Un allié fiable et vigilant qui se prépare à ce qui pourrait mal tourner." },
    7: { name: "L'Épicurien", short: "Épicurien", title: "Spontané, polyvalent, optimiste", desire: "être satisfait et comblé", fear: "d'être privé, piégé ou dans la souffrance", passion: "la gourmandise (d'expériences)", virtue: "la sobriété", summary: "Un aventurier vif et enjoué à la poursuite des possibles et des stimulations." },
    8: { name: "Le Meneur", short: "Meneur", title: "Décidé, puissant, protecteur", desire: "se protéger et garder la maîtrise de sa vie", fear: "d'être blessé, contrôlé ou violé", passion: "l'excès (l'intensité)", virtue: "l'innocence", summary: "Un protecteur fort et affirmé qui affronte la vie de face." },
    9: { name: "Le Médiateur", short: "Médiateur", title: "Réceptif, rassurant, accommodant", desire: "avoir la paix intérieure et extérieure", fear: "de la perte, de la séparation et du conflit", passion: "la paresse (l'oubli de soi)", virtue: "l'action juste", summary: "Une présence sereine et accueillante qui apporte le calme et recherche l'harmonie." },
  },
  center: { Body: "Corps", Heart: "Cœur", Head: "Tête" },
  centerDetail: { Body: "le centre instinctif/viscéral (colère)", Heart: "le centre du cœur/du ressenti (honte)", Head: "le centre mental/de la pensée (peur)" },
  labels: { core: "Type principal", wing: "Aile", center: "Centre d'intelligence", desire: "Désir fondamental", fear: "Peur fondamentale", passionVirtue: "Passion → Vertu", resonances: "Plus fortes résonances" },
  flavored: "teinté par le Type {w} ({name})",
};

export function enneaTypeStrings(locale?: string): EnneaTypeBundle | undefined {
  return locale === "es" ? ENNEA_TYPE_ES : locale === "fr" ? ENNEA_TYPE_FR : undefined;
}

export interface JungTypeBundle {
  types: Record<string, { title: string; summary: string }>;
  functions: Record<string, string>;
  clarity: { veryClear: string; clear: string; moderate: string; slight: string };
  axisValues: Record<string, string>; // E,I,N,S,F,T,J,P → display
  labels: { energy: string; information: string; decisions: string; structure: string; stack: string };
  stackPos: [string, string, string, string];
  pref: string; // "{c} preference"
}

const JUNG_TYPE_ES: JungTypeBundle = {
  types: {
    ISTJ: { title: "El Inspector", summary: "Fiable, metódico/a y leal a sus compromisos y estándares." },
    ISFJ: { title: "El Protector", summary: "Cálido/a, concienzudo/a y discretamente entregado/a a cuidar de los demás." },
    INFJ: { title: "El Consejero", summary: "Perspicaz y con principios, guiado/a por una visión privada de lo que podría ser." },
    INTJ: { title: "El Arquitecto", summary: "Estratégico/a e independiente, construye sistemas de largo alcance hacia una meta." },
    ISTP: { title: "El Artesano", summary: "Solucionador/a práctico/a que domina cómo funcionan realmente las cosas." },
    ISFP: { title: "El Compositor", summary: "Amable, centrado/a en el presente y guiado/a por valores personales muy arraigados." },
    INFP: { title: "El Mediador", summary: "Idealista e imaginativo/a, anclado/a a una fuerte brújula moral interior." },
    INTP: { title: "El Lógico", summary: "Analítico/a e inventivo/a, movido/a a comprender la lógica que subyace a las cosas." },
    ESTP: { title: "El Dinamizador", summary: "Audaz y pragmático/a, prospera con la acción y la resolución en tiempo real." },
    ESFP: { title: "El Animador", summary: "Espontáneo/a y cálido/a, aporta energía y deleite al momento presente." },
    ENFP: { title: "El Inspirador", summary: "Entusiasta e imaginativo/a, ve posibilidad y potencial en las personas." },
    ENTP: { title: "El Visionario", summary: "Ágil e inventivo/a debatiendo, le encanta generar y poner a prueba ideas nuevas." },
    ESTJ: { title: "El Supervisor", summary: "Organizado/a y decidido/a, moviliza personas y recursos para lograr resultados." },
    ESFJ: { title: "El Proveedor", summary: "Sociable y cumplidor/a, atento/a a las necesidades de los demás y a la armonía del grupo." },
    ENFJ: { title: "El Maestro", summary: "Carismático/a y empático/a, saca lo mejor de quienes le rodean." },
    ENTJ: { title: "El Comandante", summary: "Líder estratégico/a que organiza el mundo hacia una visión ambiciosa." },
  },
  functions: {
    Ni: "Intuición introvertida", Ne: "Intuición extravertida", Si: "Sensación introvertida", Se: "Sensación extravertida",
    Ti: "Pensamiento introvertido", Te: "Pensamiento extravertido", Fi: "Sentimiento introvertido", Fe: "Sentimiento extravertido",
  },
  clarity: { veryClear: "muy clara", clear: "clara", moderate: "moderada", slight: "leve" },
  axisValues: { E: "Extraversión", I: "Introversión", N: "Intuición", S: "Sensación", F: "Sentimiento", T: "Pensamiento", J: "Juicio", P: "Percepción" },
  labels: { energy: "Energía", information: "Información", decisions: "Decisiones", structure: "Estructura", stack: "Pila de funciones cognitivas" },
  stackPos: ["dominante", "auxiliar", "terciaria", "inferior"],
  pref: "preferencia {c}",
};

const JUNG_TYPE_FR: JungTypeBundle = {
  types: {
    ISTJ: { title: "L'Inspecteur", summary: "Fiable, méthodique et loyal(e) envers ses engagements et ses standards." },
    ISFJ: { title: "Le Protecteur", summary: "Chaleureux(se), consciencieux(se) et discrètement dévoué(e) à prendre soin des autres." },
    INFJ: { title: "Le Conseiller", summary: "Perspicace et intègre, guidé(e) par une vision intime de ce qui pourrait être." },
    INTJ: { title: "L'Architecte", summary: "Stratège et indépendant(e), bâtit des systèmes à long terme vers un objectif." },
    ISTP: { title: "L'Artisan", summary: "Résolveur(se) pragmatique qui maîtrise le fonctionnement réel des choses." },
    ISFP: { title: "Le Compositeur", summary: "Doux(ce), ancré(e) dans le présent et guidé(e) par des valeurs personnelles profondes." },
    INFP: { title: "Le Médiateur", summary: "Idéaliste et imaginatif(ve), ancré(e) à une forte boussole morale intérieure." },
    INTP: { title: "Le Logicien", summary: "Analytique et inventif(ve), poussé(e) à comprendre la logique sous-jacente des choses." },
    ESTP: { title: "Le Fonceur", summary: "Audacieux(se) et pragmatique, s'épanouit dans l'action et la résolution en temps réel." },
    ESFP: { title: "L'Amuseur", summary: "Spontané(e) et chaleureux(se), apporte énergie et plaisir à l'instant présent." },
    ENFP: { title: "L'Inspirateur", summary: "Enthousiaste et imaginatif(ve), voit la possibilité et le potentiel chez les gens." },
    ENTP: { title: "Le Visionnaire", summary: "Vif(ve) et inventif(ve) dans le débat, adore générer et tester des idées nouvelles." },
    ESTJ: { title: "Le Superviseur", summary: "Organisé(e) et décidé(e), mobilise gens et ressources pour obtenir des résultats." },
    ESFJ: { title: "Le Pourvoyeur", summary: "Sociable et dévoué(e), attentif(ve) aux besoins des autres et à l'harmonie du groupe." },
    ENFJ: { title: "Le Mentor", summary: "Charismatique et empathique, révèle le meilleur de son entourage." },
    ENTJ: { title: "Le Commandant", summary: "Leader stratège qui organise le monde vers une vision ambitieuse." },
  },
  functions: {
    Ni: "Intuition introvertie", Ne: "Intuition extravertie", Si: "Sensation introvertie", Se: "Sensation extravertie",
    Ti: "Pensée introvertie", Te: "Pensée extravertie", Fi: "Sentiment introverti", Fe: "Sentiment extraverti",
  },
  clarity: { veryClear: "très nette", clear: "nette", moderate: "modérée", slight: "légère" },
  axisValues: { E: "Extraversion", I: "Introversion", N: "Intuition", S: "Sensation", F: "Sentiment", T: "Pensée", J: "Jugement", P: "Perception" },
  labels: { energy: "Énergie", information: "Information", decisions: "Décisions", structure: "Structure", stack: "Pile de fonctions cognitives" },
  stackPos: ["dominante", "auxiliaire", "tertiaire", "inférieure"],
  pref: "préférence {c}",
};

export function jungTypeStrings(locale?: string): JungTypeBundle | undefined {
  return locale === "es" ? JUNG_TYPE_ES : locale === "fr" ? JUNG_TYPE_FR : undefined;
}

/* ── Attachment styles (typological; type card localized separately) ── */
export interface AttachmentTypeBundle {
  meta: Record<string, { title: string; summary: string }>;
  labels: { anxiety: string; avoidance: string; style: string; security: string };
  higher: string;
  lower: string;
  band: { high: string; moderate: string; low: string };
  securityValue: string;
  securityHint: string;
}
const ATTACH_TYPE_ES: AttachmentTypeBundle = {
  meta: {
    secure: { title: "Apego seguro", summary: "Te sientes a gusto tanto con la intimidad como con la independencia: en general confiado/a y poco alterado/a por la cercanía o la distancia." },
    anxious: { title: "Ansioso-preocupado", summary: "Valoras profundamente la cercanía y puedes preocuparte por el amor y la disponibilidad de tu pareja, ansiando reafirmación." },
    avoidant: { title: "Evitativo-rechazante", summary: "Valoras la independencia y la autosuficiencia, y tiendes a mantener cierta distancia emocional incluso en la cercanía." },
    fearful: { title: "Temeroso-evitativo", summary: "Anhelas la cercanía pero también la temes: dividido/a entre querer conexión y protegerte." },
  },
  labels: { anxiety: "Ansiedad del apego", avoidance: "Evitación del apego", style: "Estilo", security: "Hacia la seguridad" },
  higher: "Más alta", lower: "Más baja",
  band: { high: "alta", moderate: "moderada", low: "baja" },
  securityValue: "menos ansiedad + menos evitación", securityHint: "hacia donde suele encaminarse el crecimiento",
};
const ATTACH_TYPE_FR: AttachmentTypeBundle = {
  meta: {
    secure: { title: "Attachement sécure", summary: "Vous êtes à l'aise avec l'intimité comme avec l'indépendance — globalement confiant(e), peu déstabilisé(e) par la proximité ou la distance." },
    anxious: { title: "Anxieux-préoccupé", summary: "Vous valorisez profondément la proximité et pouvez vous inquiéter de l'amour et de la disponibilité de votre partenaire, en quête de réassurance." },
    avoidant: { title: "Détaché-évitant", summary: "Vous prisez l'indépendance et l'autonomie, et tendez à garder une certaine distance émotionnelle même dans la proximité." },
    fearful: { title: "Craintif-évitant", summary: "Vous aspirez à la proximité tout en la craignant — tiraillé(e) entre le désir de lien et la protection de soi." },
  },
  labels: { anxiety: "Anxiété d'attachement", avoidance: "Évitement d'attachement", style: "Style", security: "Vers la sécurité" },
  higher: "Élevé(e)", lower: "Faible",
  band: { high: "élevé(e)", moderate: "modéré(e)", low: "faible" },
  securityValue: "moins d'anxiété + moins d'évitement", securityHint: "là où la croissance tend à se diriger",
};
export function attachmentTypeStrings(locale?: string): AttachmentTypeBundle | undefined {
  return locale === "es" ? ATTACH_TYPE_ES : locale === "fr" ? ATTACH_TYPE_FR : undefined;
}

/* ── Love Languages (typological; type card localized separately) ── */
export interface LoveLangTypeBundle {
  meta: Record<string, { name: string; summary: string }>;
  primary: string;
  secondary: string;
  ranking: string;
  tipLabel: string;
  primaryPrefix: string;
  tip: (name: string) => string;
}
const LOVE_TYPE_ES: LoveLangTypeBundle = {
  meta: {
    WORDS: { name: "Palabras de afirmación", summary: "Te sientes más amado/a a través del aprecio hablado y escrito: cumplidos, ánimo y 'te quiero'." },
    TIME: { name: "Tiempo de calidad", summary: "Te sientes más amado/a a través de la atención plena y sin distracciones y la presencia compartida." },
    SERVICE: { name: "Actos de servicio", summary: "Te sientes más amado/a cuando los demás hacen cosas útiles por ti: hechos más que palabras." },
    GIFTS: { name: "Recibir regalos", summary: "Te sientes más amado/a a través de regalos pensados y significativos que dicen 'pensaba en ti'." },
    TOUCH: { name: "Contacto físico", summary: "Te sientes más amado/a a través de la cercanía física afectuosa: abrazos, tomarse de la mano y calidez." },
  },
  primary: "Lenguaje principal", secondary: "Lenguaje secundario", ranking: "Clasificación completa", tipLabel: "Consejo",
  primaryPrefix: "Principal: ",
  tip: (name) => `Pide a tus seres queridos más ${name}, y aprende a 'hablar' el suyo también.`,
};
const LOVE_TYPE_FR: LoveLangTypeBundle = {
  meta: {
    WORDS: { name: "Paroles valorisantes", summary: "Vous vous sentez le plus aimé(e) par l'appréciation dite et écrite — compliments, encouragements et « je t'aime »." },
    TIME: { name: "Moments de qualité", summary: "Vous vous sentez le plus aimé(e) par une attention pleine et entière et une présence partagée." },
    SERVICE: { name: "Services rendus", summary: "Vous vous sentez le plus aimé(e) quand les autres font des choses utiles pour vous — les actes plutôt que les mots." },
    GIFTS: { name: "Cadeaux reçus", summary: "Vous vous sentez le plus aimé(e) par des cadeaux réfléchis et significatifs qui disent « je pensais à toi »." },
    TOUCH: { name: "Contact physique", summary: "Vous vous sentez le plus aimé(e) par une proximité physique affectueuse — câlins, main dans la main et chaleur." },
  },
  primary: "Langage principal", secondary: "Langage secondaire", ranking: "Classement complet", tipLabel: "Conseil",
  primaryPrefix: "Principal : ",
  tip: (name) => `Demandez à vos proches davantage de ${name}, et apprenez à « parler » le leur aussi.`,
};
export function loveLangTypeStrings(locale?: string): LoveLangTypeBundle | undefined {
  return locale === "es" ? LOVE_TYPE_ES : locale === "fr" ? LOVE_TYPE_FR : undefined;
}

/* ── Conflict Style / Thomas–Kilmann (typological; type card localized separately) ── */
export interface ConflictTypeBundle {
  meta: Record<string, { name: string; title: string; desc: string; summary: string }>;
  labels: { primary: string; backup: string; order: string; grow: string };
  growTip: string;
}
const CONFLICT_TYPE_ES: ConflictTypeBundle = {
  meta: {
    COMPETE: { name: "Competir", title: "El Director", desc: "firme y orientado a objetivos", summary: "Persigues lo que crees correcto: decidido/a y dispuesto/a a mantenerte firme. Genial en una crisis; cuida no ganar batallas y perder relaciones." },
    COLLAB: { name: "Colaborar", title: "El Solucionador", desc: "firme y cooperativo", summary: "Trabajas para satisfacer las necesidades reales de todos y resolver el problema de fondo. El modo más rico; solo ten en cuenta que no todo conflicto merece el tiempo que requiere." },
    COMPROMISE: { name: "Comprometer", title: "El Negociador", desc: "toma y daca equilibrado", summary: "Encuentras rápido un punto medio justo. Pragmático/a y eficiente; solo asegúrate de no conformarte cuando había una solución más completa." },
    AVOID: { name: "Evitar", title: "El Esquivador", desc: "discreto y reacio al conflicto", summary: "Esquivas o aplazas el conflicto para mantener la calma. Útil en momentos triviales o acalorados; costoso cuando quedan problemas reales sin abordar." },
    ACCOMM: { name: "Ceder", title: "El Armonizador", desc: "generoso y buscador de armonía", summary: "Cedes para preservar la relación. Generoso/a y amable; cuida que ceder de forma crónica no entierre tus propias necesidades." },
  },
  labels: { primary: "Estilo principal", backup: "Estilo de reserva", order: "Orden completo", grow: "Crecer" },
  growTip: "El modo que menos usas suele ser el que vale la pena practicar para las situaciones difíciles.",
};
const CONFLICT_TYPE_FR: ConflictTypeBundle = {
  meta: {
    COMPETE: { name: "Rivaliser", title: "Le Directeur", desc: "affirmé et orienté objectifs", summary: "Vous poursuivez ce que vous croyez juste — décidé(e) et prêt(e) à tenir bon. Excellent en cas de crise ; veillez à ne pas gagner des batailles en perdant des relations." },
    COLLAB: { name: "Collaborer", title: "Le Résolveur", desc: "affirmé et coopératif", summary: "Vous cherchez à satisfaire les vrais besoins de chacun et à résoudre le problème de fond. Le mode le plus riche — gardez en tête que tout conflit ne vaut pas le temps qu'il prend." },
    COMPROMISE: { name: "Compromis", title: "Le Négociateur", desc: "donnant-donnant équilibré", summary: "Vous trouvez vite un juste milieu. Pragmatique et efficace ; assurez-vous seulement de ne pas vous contenter de peu alors qu'une solution plus complète existait." },
    AVOID: { name: "Éviter", title: "L'Esquiveur", desc: "discret et réfractaire au conflit", summary: "Vous esquivez ou différez le conflit pour garder le calme. Utile pour les moments anodins ou houleux ; coûteux quand de vrais problèmes restent sans réponse." },
    ACCOMM: { name: "Accommoder", title: "L'Harmonisateur", desc: "généreux et en quête d'harmonie", summary: "Vous cédez pour préserver la relation. Généreux(se) et gracieux(se) ; veillez à ce que céder sans cesse n'enterre pas vos propres besoins." },
  },
  labels: { primary: "Style principal", backup: "Style de secours", order: "Ordre complet", grow: "Grandir" },
  growTip: "Le mode que vous utilisez le moins est souvent celui qu'il vaut la peine de travailler pour les situations difficiles.",
};
export function conflictTypeStrings(locale?: string): ConflictTypeBundle | undefined {
  return locale === "es" ? CONFLICT_TYPE_ES : locale === "fr" ? CONFLICT_TYPE_FR : undefined;
}

/* ── Kolb Learning Style (typological; type card localized separately) ── */
export interface KolbTypeBundle {
  meta: Record<string, { name: string; title: string; desc: string; summary: string }>;
  labels: { style: string; grasping: string; transforming: string; clarity: string };
  abstract: { value: string; detail: string };
  concrete: { value: string; detail: string };
  active: { value: string; detail: string };
  reflective: { value: string; detail: string };
  clarityDetail: string;
}
const KOLB_TYPE_ES: KolbTypeBundle = {
  meta: {
    Diverging: { name: "Divergente", title: "El Divergente", desc: "sentir + observar", summary: "Aprendes sintiendo y reflexionando: imaginativo/a y atento/a a las personas, ves las situaciones desde muchos ángulos y brillas generando ideas." },
    Assimilating: { name: "Asimilador", title: "El Asimilador", desc: "pensar + observar", summary: "Aprendes pensando y reflexionando: lógico/a y conciso/a, das lo mejor con conceptos, modelos e ideas bien organizadas." },
    Converging: { name: "Convergente", title: "El Convergente", desc: "pensar + hacer", summary: "Aprendes pensando y haciendo: solucionador/a práctico/a, destacas aplicando ideas a retos reales y técnicos." },
    Accommodating: { name: "Acomodador", title: "El Acomodador", desc: "sentir + hacer", summary: "Aprendes sintiendo y haciendo: práctico/a e intuitivo/a, te crece la energía con experiencias nuevas y te adaptas rápido sobre la marcha." },
  },
  labels: { style: "Estilo", grasping: "Captar", transforming: "Transformar", clarity: "Claridad" },
  abstract: { value: "Abstracto (pensar)", detail: "ideas y análisis" },
  concrete: { value: "Concreto (sentir)", detail: "experiencia directa" },
  active: { value: "Activo (hacer)", detail: "experimentar y actuar" },
  reflective: { value: "Reflexivo (observar)", detail: "observar y reflexionar" },
  clarityDetail: "con qué decisión se inclinaron ambos ejes",
};
const KOLB_TYPE_FR: KolbTypeBundle = {
  meta: {
    Diverging: { name: "Divergent", title: "Le Divergent", desc: "ressentir + observer", summary: "Vous apprenez en ressentant et en réfléchissant : imaginatif(ve) et attentif(ve) aux autres, vous voyez les situations sous de multiples angles et excellez à générer des idées." },
    Assimilating: { name: "Assimilateur", title: "L'Assimilateur", desc: "penser + observer", summary: "Vous apprenez en pensant et en réfléchissant : logique et concis(e), vous êtes au mieux avec les concepts, les modèles et les idées bien organisées." },
    Converging: { name: "Convergent", title: "Le Convergent", desc: "penser + faire", summary: "Vous apprenez en pensant et en faisant : résolveur(se) pratique, vous excellez à appliquer les idées à des défis réels et techniques." },
    Accommodating: { name: "Accommodateur", title: "L'Accommodateur", desc: "ressentir + faire", summary: "Vous apprenez en ressentant et en faisant : concret(ète) et intuitif(ve), vous vous épanouissez dans les expériences nouvelles et vous adaptez vite sur le moment." },
  },
  labels: { style: "Style", grasping: "Saisir", transforming: "Transformer", clarity: "Clarté" },
  abstract: { value: "Abstrait (penser)", detail: "idées et analyse" },
  concrete: { value: "Concret (ressentir)", detail: "expérience directe" },
  active: { value: "Actif (faire)", detail: "expérimenter et agir" },
  reflective: { value: "Réflexif (observer)", detail: "observer et réfléchir" },
  clarityDetail: "avec quelle netteté les deux axes ont penché",
};
export function kolbTypeStrings(locale?: string): KolbTypeBundle | undefined {
  return locale === "es" ? KOLB_TYPE_ES : locale === "fr" ? KOLB_TYPE_FR : undefined;
}

/* ── VARK Learning Preferences (typological; type card localized separately) ── */
export interface VarkTypeBundle {
  meta: Record<string, { name: string; title: string; desc: string; summary: string }>;
  multimodalTitle: string;
  multimodalSummary: string;
  labels: { lead: string; support: string; order: string; pattern: string };
  orderHint: string;
  multimodalBlend: string;
  clear: (name: string) => string;
  multimodalDetail: string;
  clearDetail: string;
}
const VARK_TYPE_ES: VarkTypeBundle = {
  meta: {
    VIS: { name: "Visual", title: "El Visualizador", desc: "diagramas, gráficos y ver", summary: "Te inclinas a lo Visual: diagramas, mapas y ver cómo encajan las cosas te ayudan más. (Una preferencia, no un límite.)" },
    AUR: { name: "Auditivo", title: "El Oyente", desc: "escuchar y conversar", summary: "Te inclinas a lo Auditivo: escuchar, hablar y conversar te ayudan más. (Una preferencia, no un límite.)" },
    RDW: { name: "Lectura/Escritura", title: "El Escritor", desc: "leer y escribir", summary: "Te inclinas a Lectura/Escritura: el texto, las notas y escribir las cosas te ayudan más. (Una preferencia, no un límite.)" },
    KIN: { name: "Kinestésico", title: "El Hacedor", desc: "práctica manual", summary: "Te inclinas a lo Kinestésico: la práctica directa y los ejemplos reales te ayudan más. (Una preferencia, no un límite.)" },
  },
  multimodalTitle: "El Aprendiz Multimodal",
  multimodalSummary: "Tus preferencias están bastante repartidas: eres multimodal, cómodo/a recibiendo la información de más de una forma.",
  labels: { lead: "Preferencia principal", support: "Preferencia de apoyo", order: "Orden", pattern: "Patrón" },
  orderHint: "tus canales, del más fuerte al más débil",
  multimodalBlend: "Mezcla multimodal",
  clear: (name) => `${name} claro`,
  multimodalDetail: "ningún canal domina",
  clearDetail: "un canal destaca",
};
const VARK_TYPE_FR: VarkTypeBundle = {
  meta: {
    VIS: { name: "Visuel", title: "Le Visualiseur", desc: "schémas, graphiques et voir", summary: "Vous penchez vers le Visuel : schémas, cartes et voir comment les choses s'agencent vous aident le plus. (Une préférence, pas une limite.)" },
    AUR: { name: "Auditif", title: "L'Auditeur", desc: "écouter et discuter", summary: "Vous penchez vers l'Auditif : écouter, parler et discuter vous aident le plus. (Une préférence, pas une limite.)" },
    RDW: { name: "Lecture/Écriture", title: "Le Rédacteur", desc: "lire et écrire", summary: "Vous penchez vers Lecture/Écriture : le texte, les notes et écrire les choses vous aident le plus. (Une préférence, pas une limite.)" },
    KIN: { name: "Kinesthésique", title: "Le Praticien", desc: "pratique manuelle", summary: "Vous penchez vers le Kinesthésique : la pratique directe et les exemples concrets vous aident le plus. (Une préférence, pas une limite.)" },
  },
  multimodalTitle: "L'Apprenant Multimodal",
  multimodalSummary: "Vos préférences sont assez réparties : vous êtes multimodal(e), à l'aise pour recevoir l'information de plusieurs façons.",
  labels: { lead: "Préférence principale", support: "Préférence d'appoint", order: "Ordre", pattern: "Profil" },
  orderHint: "vos canaux, du plus fort au plus faible",
  multimodalBlend: "Mélange multimodal",
  clear: (name) => `${name} net`,
  multimodalDetail: "aucun canal ne domine",
  clearDetail: "un canal se détache",
};
export function varkTypeStrings(locale?: string): VarkTypeBundle | undefined {
  return locale === "es" ? VARK_TYPE_ES : locale === "fr" ? VARK_TYPE_FR : undefined;
}

/* ── Chronotype (typological; type card localized separately) ── */
export interface ChronotypeTypeBundle {
  meta: Record<string, { title: string; summary: string; peak: string; best: string }>;
  labels: { chronotype: string; peak: string; best: string; watch: string };
  watch: string;
}
const CHRONO_TYPE_ES: ChronotypeTypeBundle = {
  meta: {
    Lark: { title: "El Madrugador (Alondra)", summary: "Estás hecho/a para la mañana: despierto/a temprano, más agudo/a antes del mediodía y listo/a para desconectar por la noche.", peak: "la mañana (aprox. 8–12 h)", best: "Protege tus mañanas para tu trabajo más difícil e importante." },
    Owl: { title: "El Búho Nocturno", summary: "Estás hecho/a para la noche: arrancas despacio, pero te concentras y te vuelves creativo/a cuando el día decae.", peak: "de la tarde a la noche", best: "Defiende tu concentración de última hora; evita programar trabajo exigente a las 9 de la mañana si puedes." },
    Hummingbird: { title: "El Colibrí (Intermedio)", summary: "Eres flexible: ni marcadamente matutino/a ni nocturno/a, capaz de adaptar tu pico a tu horario.", peak: "el mediodía, y adaptable", best: "Observa tu curva de energía diaria y coloca el trabajo profundo en tu pico real." },
  },
  labels: { chronotype: "Cronotipo", peak: "Tus horas pico", best: "Mejor jugada", watch: "Ojo" },
  watch: "Pelear contra tu cronotipo a base de estimulantes y fuerza de voluntad funciona un tiempo, y luego pasa factura al sueño, el ánimo y la salud.",
};
const CHRONO_TYPE_FR: ChronotypeTypeBundle = {
  meta: {
    Lark: { title: "Le Lève-tôt (Alouette)", summary: "Vous êtes câblé(e) pour le matin : alerte tôt, le plus vif(ve) avant midi, et prêt(e) à lever le pied le soir.", peak: "le matin (environ 8 h–midi)", best: "Protégez vos matinées pour votre travail le plus difficile et le plus important." },
    Owl: { title: "Le Couche-tard", summary: "Vous êtes câblé(e) pour le soir : lent(e) à démarrer, mais concentré(e) et créatif(ve) une fois la journée déclinante.", peak: "de la fin d'après-midi à la nuit", best: "Défendez votre concentration de fin de journée ; évitez de planifier un travail exigeant à 9 h si possible." },
    Hummingbird: { title: "Le Colibri (Intermédiaire)", summary: "Vous êtes flexible : ni franchement du matin ni du soir, capable d'adapter votre pic à votre emploi du temps.", peak: "le milieu de journée, et adaptable", best: "Observez votre courbe d'énergie quotidienne et placez le travail de fond à votre vrai pic." },
  },
  labels: { chronotype: "Chronotype", peak: "Vos heures de pointe", best: "Meilleur choix", watch: "Attention" },
  watch: "Lutter contre son chronotype à coups de stimulants et de volonté marche un temps, puis pèse sur le sommeil, l'humeur et la santé.",
};
export function chronotypeTypeStrings(locale?: string): ChronotypeTypeBundle | undefined {
  return locale === "es" ? CHRONO_TYPE_ES : locale === "fr" ? CHRONO_TYPE_FR : undefined;
}

/* ── Four Temperaments (typological; type card localized separately) ── */
export interface FourTempTypeBundle {
  meta: Record<string, { name: string; title: string; desc: string; summary: string }>;
  labels: { primary: string; secondary: string; blend: string; order: string };
  strong: (name: string) => string;
  blendSummary: (summary: string, a: string, b: string) => string;
}
const FOURTEMP_TYPE_ES: FourTempTypeBundle = {
  meta: {
    SANG: { name: "Sanguíneo", title: "La Chispa", desc: "sociable, vivaz, optimista", summary: "Cálido/a, entusiasta y amante de la gente: aportas energía y diversión, y vives el momento." },
    CHOL: { name: "Colérico", title: "El Impulsor", desc: "ambicioso, decidido, audaz", summary: "Decidido/a, resolutivo/a y líder por naturaleza: te fijas grandes metas y vas a por ellas." },
    MEL: { name: "Melancólico", title: "El Pensador Profundo", desc: "analítico, sensible, preciso", summary: "Reflexivo/a, profundo/a y atento/a al detalle: sientes con intensidad y mantienes estándares altos." },
    PHLEG: { name: "Flemático", title: "El Estable", desc: "tranquilo, leal, pacífico", summary: "Tranquilo/a, paciente y fiable: mantienes la paz y aportas una estabilidad serena." },
  },
  labels: { primary: "Temperamento principal", secondary: "Temperamento secundario", blend: "Mezcla", order: "Orden completo" },
  strong: (name) => `${name} marcado`,
  blendSummary: (summary, a, b) => `${summary} Eres una clara mezcla ${a}–${b}.`,
};
const FOURTEMP_TYPE_FR: FourTempTypeBundle = {
  meta: {
    SANG: { name: "Sanguin", title: "L'Étincelle", desc: "sociable, vif, optimiste", summary: "Chaleureux(se), enthousiaste et tourné(e) vers les autres : vous apportez énergie et plaisir, et vivez l'instant." },
    CHOL: { name: "Colérique", title: "Le Meneur", desc: "ambitieux, décidé, audacieux", summary: "Déterminé(e), décidé(e) et meneur(se) né(e) : vous visez grand et foncez." },
    MEL: { name: "Mélancolique", title: "Le Penseur Profond", desc: "analytique, sensible, précis", summary: "Réfléchi(e), profond(e) et attentif(ve) au détail : vous ressentez intensément et tenez des standards élevés." },
    PHLEG: { name: "Flegmatique", title: "Le Stable", desc: "calme, loyal, paisible", summary: "Calme, patient(e) et fiable : vous préservez la paix et offrez une stabilité tranquille." },
  },
  labels: { primary: "Tempérament principal", secondary: "Tempérament secondaire", blend: "Mélange", order: "Ordre complet" },
  strong: (name) => `${name} marqué`,
  blendSummary: (summary, a, b) => `${summary} Vous êtes un mélange ${a}–${b} net.`,
};
export function fourTempTypeStrings(locale?: string): FourTempTypeBundle | undefined {
  return locale === "es" ? FOURTEMP_TYPE_ES : locale === "fr" ? FOURTEMP_TYPE_FR : undefined;
}

/* ── Four Color Styles (typological; type card localized separately) ── */
export interface ColorTypeBundle {
  meta: Record<string, { name: string; title: string; desc: string; summary: string }>;
  labels: { lead: string; support: string; spectrum: string; pattern: string };
  spectrumHint: string;
  blend: string;
  clear: (name: string) => string;
  blendDetail: string;
  clearDetail: string;
}
const COLOR_TYPE_ES: ColorTypeBundle = {
  meta: {
    GOLD: { name: "Dorado", title: "El Organizador", desc: "responsable, estructurado, fiable", summary: "El Dorado lidera en ti: responsable, organizado/a y leal. Construyes la estructura y el cumplimiento en los que otros confían." },
    BLUE: { name: "Azul", title: "El Conector", desc: "cálido, empático, en busca de sentido", summary: "El Azul lidera en ti: cálido/a, auténtico/a y centrado/a en las personas. Cultivas la armonía, el sentido y el crecimiento de quienes te rodean." },
    GREEN: { name: "Verde", title: "El Pensador", desc: "analítico, curioso, movido por la competencia", summary: "El Verde lidera en ti: lógico/a, curioso/a y de cabeza fría. Dominas ideas y sistemas y valoras la competencia." },
    ORANGE: { name: "Naranja", title: "El Aventurero", desc: "espontáneo, enérgico, audaz", summary: "El Naranja lidera en ti: espontáneo/a, amante de la acción y adaptable. Aportas energía, valentía y un sentido del juego." },
  },
  labels: { lead: "Color principal", support: "Color de apoyo", spectrum: "Espectro", pattern: "Patrón" },
  spectrumHint: "tus colores, del más brillante al más tenue",
  blend: "Una mezcla de dos colores",
  clear: (name) => `${name} claro`,
  blendDetail: "dos colores van muy parejos",
  clearDetail: "un color destaca con claridad",
};
const COLOR_TYPE_FR: ColorTypeBundle = {
  meta: {
    GOLD: { name: "Or", title: "L'Organisateur", desc: "responsable, structuré, fiable", summary: "L'Or domine chez vous : responsable, organisé(e) et loyal(e). Vous bâtissez la structure et le suivi sur lesquels les autres comptent." },
    BLUE: { name: "Bleu", title: "Le Connecteur", desc: "chaleureux, empathique, en quête de sens", summary: "Le Bleu domine chez vous : chaleureux(se), authentique et tourné(e) vers les gens. Vous cultivez l'harmonie, le sens et la croissance de votre entourage." },
    GREEN: { name: "Vert", title: "Le Penseur", desc: "analytique, curieux, porté sur la compétence", summary: "Le Vert domine chez vous : logique, curieux(se) et de sang-froid. Vous maîtrisez les idées et les systèmes et prisez la compétence." },
    ORANGE: { name: "Orange", title: "L'Aventurier", desc: "spontané, énergique, audacieux", summary: "L'Orange domine chez vous : spontané(e), amateur(trice) d'action et adaptable. Vous apportez énergie, courage et sens du jeu." },
  },
  labels: { lead: "Couleur principale", support: "Couleur d'appoint", spectrum: "Spectre", pattern: "Profil" },
  spectrumHint: "vos couleurs, de la plus vive à la plus pâle",
  blend: "Un mélange de deux couleurs",
  clear: (name) => `${name} net`,
  blendDetail: "deux couleurs sont au coude à coude",
  clearDetail: "une couleur se détache nettement",
};
export function colorTypeStrings(locale?: string): ColorTypeBundle | undefined {
  return locale === "es" ? COLOR_TYPE_ES : locale === "fr" ? COLOR_TYPE_FR : undefined;
}

/* ── Keirsey Temperaments (typological; type card localized separately) ── */
export interface KeirseyTypeBundle {
  meta: Record<string, { name: string; title: string; family: string; summary: string }>;
  labels: { temperament: string; communication: string; action: string; clarity: string };
  abstract: { value: string; detail: string };
  concrete: { value: string; detail: string };
  utilitarian: { value: string; detail: string };
  cooperative: { value: string; detail: string };
  clarityDetail: string;
}
const KEIRSEY_TYPE_ES: KeirseyTypeBundle = {
  meta: {
    Guardian: { name: "Guardián", title: "El Guardián", family: "Sensación–Juicio (SJ)", summary: "Fiable, cumplidor/a y con los pies en la tierra: mantienes a las personas, los planes y las instituciones estables y bien cuidados." },
    Artisan: { name: "Artesano", title: "El Artesano", family: "Sensación–Percepción (SP)", summary: "Adaptable, práctico/a y audaz: lees el momento y haces que las cosas funcionen, a menudo con estilo y soltura." },
    Idealist: { name: "Idealista", title: "El Idealista", family: "Intuición–Sentimiento (NF)", summary: "Empático/a, en busca de sentido y auténtico/a: cultivas el crecimiento, la armonía y el potencial de las personas." },
    Rational: { name: "Racional", title: "El Racional", family: "Intuición–Pensamiento (NT)", summary: "Estratégico/a, inventivo/a y movido/a por la competencia: dominas sistemas, ideas y problemas de largo alcance." },
  },
  labels: { temperament: "Temperamento", communication: "Comunicación", action: "Acción", clarity: "Claridad" },
  abstract: { value: "Abstracta", detail: "ideas, patrones, posibilidades" },
  concrete: { value: "Concreta", detail: "hechos, el aquí y ahora tangible" },
  utilitarian: { value: "Utilitaria", detail: "hacer lo que funciona" },
  cooperative: { value: "Cooperativa", detail: "hacer lo que es correcto" },
  clarityDetail: "con qué decisión se inclinaron ambos ejes",
};
const KEIRSEY_TYPE_FR: KeirseyTypeBundle = {
  meta: {
    Guardian: { name: "Gardien", title: "Le Gardien", family: "Sensation–Jugement (SJ)", summary: "Fiable, consciencieux(se) et les pieds sur terre : vous maintenez les gens, les plans et les institutions stables et bien encadrés." },
    Artisan: { name: "Artisan", title: "L'Artisan", family: "Sensation–Perception (SP)", summary: "Adaptable, concret(ète) et audacieux(se) : vous lisez l'instant et faites en sorte que les choses marchent, souvent avec style et aisance." },
    Idealist: { name: "Idéaliste", title: "L'Idéaliste", family: "Intuition–Sentiment (NF)", summary: "Empathique, en quête de sens et authentique : vous cultivez la croissance, l'harmonie et le potentiel des gens." },
    Rational: { name: "Rationnel", title: "Le Rationnel", family: "Intuition–Pensée (NT)", summary: "Stratège, inventif(ve) et porté(e) sur la compétence : vous maîtrisez les systèmes, les idées et les problèmes de longue haleine." },
  },
  labels: { temperament: "Tempérament", communication: "Communication", action: "Action", clarity: "Clarté" },
  abstract: { value: "Abstraite", detail: "idées, motifs, possibilités" },
  concrete: { value: "Concrète", detail: "faits, l'ici et maintenant tangible" },
  utilitarian: { value: "Utilitaire", detail: "faire ce qui marche" },
  cooperative: { value: "Coopérative", detail: "faire ce qui est correct" },
  clarityDetail: "avec quelle netteté les deux axes ont penché",
};
export function keirseyTypeStrings(locale?: string): KeirseyTypeBundle | undefined {
  return locale === "es" ? KEIRSEY_TYPE_ES : locale === "fr" ? KEIRSEY_TYPE_FR : undefined;
}

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
      return st
        ? {
            ...s,
            name: st.name ?? s.name,
            description: st.description ?? s.description,
            poles: st.poles ?? s.poles,
            highDescriptor: st.highDescriptor ?? s.highDescriptor,
            lowDescriptor: st.lowDescriptor ?? s.lowDescriptor,
          }
        : s;
    }),
    items: tr.items || tr.options ? inst.items.map((i) => {
      const text = tr.items?.[i.id] ?? i.text;
      const optTexts = tr.options?.[i.id];
      const options = optTexts && i.options ? i.options.map((o, idx) => ({ ...o, text: optTexts[idx] ?? o.text })) : i.options;
      return text !== i.text || options !== i.options ? { ...i, text, options } : i;
    }) : inst.items,
    // Bind the locale into resolveType so the resolved type card (title/summary/components)
    // is localized too. Instruments that don't translate their type ignore the locale.
    resolveType: inst.resolveType ? (scales) => inst.resolveType!(scales, locale) : undefined,
  };
}

/** True if any translation exists for this instrument in the locale. */
export function hasTranslation(instrumentId: string, locale: string): boolean {
  return !!TRANSLATIONS[locale]?.[instrumentId];
}
