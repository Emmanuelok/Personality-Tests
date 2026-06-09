/**
 * Translated Big-Five color + dynamics banks for the report composer.
 *
 * These are the concrete, hand-written paragraphs the composer layers on top of
 * the generic templated openers for the Big Five specifically. The English
 * originals live in phrasebank.ts; this file supplies es/fr. Untranslated
 * languages fall back to English (wired in report/i18n.ts), so this is additive.
 */

import { BIG_FIVE_DYNAMICS, type TraitColor, type DynamicRule } from "./phrasebank";

export const BIG_FIVE_COLOR_ES: Record<string, TraitColor> = {
  O: {
    high: {
      strengths: ["detectar conexiones que otros pasan por alto", "generar ideas originales", "comodidad con la ambigüedad y el matiz", "amplitud estética e intelectual"],
      watchouts: ["perseguir la novedad en vez de terminar lo empezado", "complicar de más los problemas simples", "aburrimiento con la rutina necesaria"],
      behavior: ["Coleccionas ideas, libros y «y si…» como otros coleccionan recuerdos.", "Los problemas abstractos que aburren a los demás son justo los que te encienden.", "Cuestionas rápido cómo se han «hecho siempre» las cosas."],
      relationships: ["Te atraen las personas que pueden intercambiar ideas y sorprenderte.", "Puede que necesites una pareja que tolere tu necesidad de explorar y reinventarte."],
      work: ["Prosperas donde se premian la invención, la estrategia y los problemas abiertos.", "Los puestos muy repetitivos te agotarán; añade variedad a tu semana."],
      stress: ["Bajo estrés puedes dispersarte en demasiadas posibilidades a la vez; reducir a una es el antídoto."],
    },
    low: {
      strengths: ["practicidad y sentido común", "mantenerte anclado/a en lo que funciona", "consistencia y previsibilidad", "enfoque en lo concreto y probado"],
      watchouts: ["descartar demasiado rápido ideas nuevas útiles", "incomodidad cuando los planes cambian", "preferir lo familiar más allá de su utilidad"],
      behavior: ["Confías en lo probado antes que en la última teoría.", "Prefieres perfeccionar un método conocido que reinventarlo.", "Las tareas concretas y prácticas te van mejor que la especulación abstracta."],
      relationships: ["Ofreces a tu pareja estabilidad y una fiabilidad sin rodeos.", "Puedes chocar con quienes buscan novedad o reinvención constantes."],
      work: ["Destacas en puestos que premian la ejecución, los estándares y la entrega fiable.", "Bajas a tierra, con seguridad, las grandes ideas de los demás."],
      stress: ["El cambio repentino es tu principal estresor; el aviso previo y un plan claro te calman."],
    },
    mid: ["Puedes alternar entre visionario/a y pragmático/a, lo que te hace un puente útil entre soñadores y ejecutores."],
  },
  C: {
    high: {
      strengths: ["constancia y fiabilidad", "organización y planificación", "autodisciplina ante la tentación", "altos estándares personales"],
      watchouts: ["perfeccionismo y dificultad para delegar", "rigidez cuando los planes deben cambiar", "ser duro/a contigo por pequeños fallos"],
      behavior: ["Haces un plan y lo ejecutas.", "Los cabos sueltos te molestan de verdad hasta atarlos.", "La gente aprende que si dijiste que lo harías, está hecho."],
      relationships: ["Eres la persona fiable en la que otros se apoyan.", "Puede que debas suavizar lo que esperas de parejas menos organizadas."],
      work: ["Se te confían responsabilidades y metas complejas a largo plazo.", "Cuidado con asumir demasiado por no soportar que bajen los estándares."],
      stress: ["Cuando te sobrecargas, redoblas el control; bajar el listón un punto a propósito te protege del agotamiento."],
    },
    low: {
      strengths: ["flexibilidad y espontaneidad", "soltura con lo imprevisto", "poca rigidez y giros rápidos", "relajado/a ante la imperfección"],
      watchouts: ["procrastinación y plazos incumplidos", "perder de vista los detalles", "empezar más de lo que terminas"],
      behavior: ["Prefieres mantener las cosas abiertas a atarlas a un horario.", "Trabajas en ráfagas de energía más que en incrementos constantes.", "La estructura te parece más una jaula que un alivio."],
      relationships: ["Aportas ligereza y adaptabilidad a las relaciones.", "Las parejas fiables pueden necesitar que refuerces el cumplimiento de los compromisos compartidos."],
      work: ["Brillas en entornos rápidos, improvisados y con poca burocracia.", "La estructura externa —plazos, rendición de cuentas, listas— convierte tu energía en resultados."],
      stress: ["Bajo presión, las tareas se acumulan; una única «próxima acción» rompe el atasco mejor que un gran plan."],
    },
    mid: ["Puedes ser organizado/a cuando importa y relajado/a cuando no, útil siempre que lo elijas a propósito y no por defecto."],
  },
  E: {
    high: {
      strengths: ["dar energía a una sala", "iniciar y conectar", "asertividad y calidez visible", "comodidad al ser visto/a"],
      watchouts: ["hablar por encima de los más callados", "necesitar estímulo hasta la inquietud", "pensar en voz alta antes de haberlo pensado bien"],
      behavior: ["Te recargas rodeado/a de gente y te marchitas con demasiada soledad.", "A menudo hablas para pensar, no solo para comunicar una idea ya terminada.", "Gravitas hacia el centro de la acción."],
      relationships: ["Aportas energía, iniciativa y cohesión social.", "Las parejas más calladas pueden necesitar que dejes espacio y escuches más."],
      work: ["Te va bien donde importan el contacto, la persuasión y el liderazgo visible.", "Los tramos largos de trabajo solitario y concentrado te agotan; incluye interacción."],
      stress: ["Estresado/a, puedes buscar compañía de forma compulsiva; una conversación sincera vale más que muchas superficiales."],
    },
    low: {
      strengths: ["profundidad antes que amplitud", "una presencia calmada y reflexiva", "comodidad con la soledad y la concentración", "escuchar más que difundir"],
      watchouts: ["pasar desapercibido/a por no promocionarte", "agotarte rápido en eventos grandes", "guardarte ideas que vale la pena compartir"],
      behavior: ["Te recargas a solas y pagas un peaje de energía por socializar.", "Primero piensas y hablas una vez formada la idea.", "Prefieres unas pocas conversaciones profundas a una sala llena."],
      relationships: ["Ofreces estabilidad, atención profunda y lealtad a unos pocos cercanos.", "Haz visible tu mundo interior: las parejas no pueden leer la profundidad que no expresas."],
      work: ["Destacas en el trabajo concentrado, independiente y profundo, y en la influencia uno a uno.", "Reivindica tus aportes; la excelencia silenciosa puede pasar inadvertida."],
      stress: ["Socializar en exceso es en sí un estresor; la soledad protegida es tu reinicio más fiable."],
    },
    mid: ["Puedes animar una sala y luego desaparecer a gusto para recargar: el rango de un/a ambivertido/a que te permite encontrar a la gente donde está."],
  },
  A: {
    high: {
      strengths: ["empatía y calidez", "construir confianza y cooperación", "generosidad y tacto", "leer los sentimientos ajenos"],
      watchouts: ["dificultad para decir no", "evitar el conflicto necesario", "que se aprovechen de ti", "reprimir tus propias necesidades"],
      behavior: ["Buscas por instinto el camino cooperativo de mutuo beneficio.", "El malestar ajeno te llega rápido y físicamente.", "Prefieres limar asperezas a ganar la discusión."],
      relationships: ["Eres una pareja y amistad muy solidaria y considerada.", "Practica expresar tus necesidades con la misma claridad con que honras las de los demás."],
      work: ["Construyes equipos cohesionados y desactivas la fricción.", "Al negociar, evita ceder demasiado en aras de la armonía."],
      stress: ["Absorbes el estrés ajeno como propio; un límite no es una traición, es mantenimiento."],
    },
    low: {
      strengths: ["franqueza y honestidad", "comodidad con el conflicto y la competencia", "objetividad bajo presión emocional", "disposición a ser la voz discrepante"],
      watchouts: ["parecer brusco/a o frío/a", "un escepticismo que cuaja en cinismo", "ganar discusiones a costa de las relaciones"],
      behavior: ["Dices la verdad difícil que otros rodean de puntillas.", "Sopesas las afirmaciones con escepticismo antes de dar tu confianza.", "Te sientes cómodo/a compitiendo y sosteniendo una postura impopular."],
      relationships: ["Das a tu pareja honestidad y una firmeza en la que confiar.", "Suma calidez a tu franqueza: tener razón y ser amable no son opuestos."],
      work: ["Tomas decisiones difíciles y das la retroalimentación directa que otros evitan.", "El tacto es una habilidad que vale la pena practicar a propósito, no una traición a la honestidad."],
      stress: ["Bajo estrés, las aristas se afilan; nombrar la meta que compartes con la otra persona baja la temperatura."],
    },
    mid: ["Puedes ser cálido/a y puedes ser firme, lo que te permite cooperar sin ser un felpudo, siempre que elijas el registro a propósito."],
  },
  N: {
    high: {
      strengths: ["sensibilidad emocional y autoconciencia", "vigilancia ante el riesgo y los problemas", "profundidad y seriedad del sentir", "empatía nacida de sentir las cosas con intensidad"],
      watchouts: ["rumiación y preocupación", "que el estrés se derrame en el ánimo", "tomarte los reveses como algo personal", "autocrítica dura"],
      behavior: ["Sientes las cosas en alta resolución, lo bueno y lo difícil por igual.", "Tu mente explora por adelantado lo que podría salir mal.", "Los reveses pueden resonar en ti más tiempo que en otros."],
      relationships: ["Tu sensibilidad te hace sintonizado/a y atento/a cuando la diriges hacia fuera.", "Comparte lo que sientes pronto: las parejas no pueden calmar una tormenta que no ven."],
      work: ["Tu radar de riesgos detecta problemas que otros pasan por alto.", "Crea rituales de recuperación; sin ellos, la presión se acumula hasta desbordar."],
      stress: ["Tu sistema nervioso reacciona con fuerza y se recupera despacio; nombrar la emoción y frenar la respiración no son tópicos para ti: funcionan."],
    },
    low: {
      strengths: ["calma bajo presión", "resiliencia emocional", "ánimo parejo y estable", "no alterarte ante los reveses"],
      watchouts: ["subestimar riesgos reales", "pasar por alto señales emocionales en otros", "parecer indiferente cuando otros necesitan que te importe"],
      behavior: ["Te mantienes ecuánime cuando las cosas se tensan.", "Los reveses se te resbalan más rápido que a la mayoría.", "Rara vez te arrastran tus propios estados de ánimo."],
      relationships: ["Eres una presencia estabilizadora y tranquilizadora en plena tormenta.", "Asegúrate de que tu calma no se lea como indiferencia ante alguien que sufre."],
      work: ["Eres la mano firme en una crisis y en decisiones de alto riesgo.", "Apóyate en el radar de riesgos de colegas más ansiosos; la calma puede pasar por alto un peligro real."],
      stress: ["Manejas bien el estrés, tan bien que tu punto ciego es ignorar las señales tempranas hasta que se hacen grandes."],
    },
    mid: ["Sientes las cosas pero no te gobiernan: sensible para sintonizar, estable para funcionar bajo carga."],
  },
};

const DYN_ES: string[][] = [
  ["La alta Apertura junto a la alta Responsabilidad es la rara combinación del «visionario que ejecuta»: generas ideas originales y de verdad las llevas a término.", "Como tu imaginación y tu disciplina son altas a la vez, puedes concebir un sistema y luego construirlo; contigo las ideas rara vez mueren en la rama."],
  ["Tus ideas superan a tu constancia: la Apertura es alta pero la Responsabilidad es menor, así que tu cuello de botella es capturar y terminar, no generar.", "Eres rico/a en ideas y ligero/a en estructura; un andamiaje externo (plazos, un colaborador que cierra) convierte tu creatividad en resultados."],
  ["La alta Extraversión más la alta Amabilidad te hacen un/a conector/a natural: cálido/a, extrovertido/a y genuinamente querido/a.", "Combinas energía social con calidez, lo que suele hacerte el pegamento de los grupos y la persona hacia la que otros gravitan."],
  ["La menor Extraversión junto a un mayor Neuroticismo significa que a la vez necesitas soledad y sientes las cosas con intensidad: el tiempo a solas protegido no es un lujo para ti, es mantenimiento.", "Eres introspectivo/a y sensible a la vez; la recuperación tranquila y de baja estimulación es lo que te mantiene regulado/a."],
  ["La alta Responsabilidad con bajo Neuroticismo es el patrón del «operador imperturbable»: organizado/a y tranquilo/a, eres la persona en quien otros confían en una crisis.", "Combinas fiabilidad con estabilidad emocional, lo que te convierte en una fuerza estabilizadora bajo presión."],
  ["La baja Amabilidad con alta Responsabilidad te hace exigente y franco/a: mantienes un listón alto y lo dices sin rodeos.", "Unes altos estándares con franqueza; excelente para la calidad, conviene templarlo con algo de calidez en la forma."],
  ["La alta Apertura y la alta Extraversión te hacen un/a difusor/a expresivo/a de ideas: piensas en voz alta y haces partícipes a otros de tu imaginación.", "Tu curiosidad es externa y social; saltan chispas con los demás y conviertes las conversaciones en descubrimiento."],
  ["La alta Amabilidad con un mayor Neuroticismo significa que sientes el dolor ajeno de forma aguda y puedes absorberlo: la compasión es una fortaleza, pero los límites la hacen sostenible.", "Eres muy empático/a y emocionalmente poroso/a a la vez; proteger tus reservas hace que tu cuidado dure."],
  ["La alta Responsabilidad con una menor Apertura te hace un/a finalizador/a fiable que prefiere métodos probados a los experimentos: excelente para ejecutar, conviene emparejarte con alguien de ideas.", "Aportas orden y fiabilidad y confías en lo que funciona; los enfoques nuevos te parecen arriesgados hasta que demuestran que entregan."],
  ["La alta Extraversión y la alta Responsabilidad son un patrón de liderazgo: movilizas a la gente y cumples, combinando empuje con entrega.", "A la vez das energía a otros y ejecutas, por lo que esta combinación tan a menudo acaba dirigiendo las cosas."],
];

/** Spanish dynamics reuse the English predicates and ordering; only the prose differs. */
export const BIG_FIVE_DYNAMICS_ES: DynamicRule[] = BIG_FIVE_DYNAMICS.map((rule, i) => ({ ...rule, variants: DYN_ES[i] }));
