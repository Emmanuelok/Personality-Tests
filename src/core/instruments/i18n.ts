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

export const TRANSLATIONS: Record<string, Record<string, InstrumentTranslation>> = {
  es: {
    "big-five-ipip50": BIG_FIVE_ES, "disc-4": DISC_ES, "enneagram-9": ENNEAGRAM_ES,
    "perma-flourishing": PERMA_ES, "life-satisfaction-swls": SWLS_ES, "brief-resilience": RESILIENCE_ES,
    "self-esteem-rses": SELFESTEEM_ES, "mood-checkin": MOOD_ES, "hexaco-24": HEXACO_ES, "dark-triad-18": DARKTRIAD_ES,
    "jung-16-types": JUNG_ES, "optimism-lotr": OPTIMISM_ES, "hope-scale": HOPE_ES, "curiosity-cei": CURIOSITY_ES,
  },
  fr: {
    "big-five-ipip50": BIG_FIVE_FR, "disc-4": DISC_FR, "enneagram-9": ENNEAGRAM_FR,
    "perma-flourishing": PERMA_FR, "life-satisfaction-swls": SWLS_FR, "brief-resilience": RESILIENCE_FR,
    "self-esteem-rses": SELFESTEEM_FR, "mood-checkin": MOOD_FR, "hexaco-24": HEXACO_FR, "dark-triad-18": DARKTRIAD_FR,
    "jung-16-types": JUNG_FR, "optimism-lotr": OPTIMISM_FR, "hope-scale": HOPE_FR, "curiosity-cei": CURIOSITY_FR,
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
    items: tr.items ? inst.items.map((i) => (tr.items![i.id] ? { ...i, text: tr.items![i.id] } : i)) : inst.items,
    // Bind the locale into resolveType so the resolved type card (title/summary/components)
    // is localized too. Instruments that don't translate their type ignore the locale.
    resolveType: inst.resolveType ? (scales) => inst.resolveType!(scales, locale) : undefined,
  };
}

/** True if any translation exists for this instrument in the locale. */
export function hasTranslation(instrumentId: string, locale: string): boolean {
  return !!TRANSLATIONS[locale]?.[instrumentId];
}
