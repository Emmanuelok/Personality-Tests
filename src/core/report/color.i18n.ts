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

export const BIG_FIVE_COLOR_FR: Record<string, TraitColor> = {
  O: {
    high: {
      strengths: ["repérer des liens que d'autres manquent", "générer des idées originales", "à l'aise avec l'ambiguïté et la nuance", "ampleur esthétique et intellectuelle"],
      watchouts: ["courir après la nouveauté au lieu de finir ce que vous commencez", "compliquer à l'excès des problèmes simples", "l'ennui face à la routine nécessaire"],
      behavior: ["Vous collectionnez idées, livres et « et si… » comme d'autres collectionnent des souvenirs.", "Les problèmes abstraits qui ennuient les autres sont précisément ceux qui vous animent.", "Vous remettez vite en question la façon dont les choses ont « toujours été faites »."],
      relationships: ["Vous êtes attiré(e) par les gens qui échangent des idées et vous surprennent.", "Vous aurez peut-être besoin d'un(e) partenaire qui tolère votre besoin d'explorer et de vous réinventer."],
      work: ["Vous prospérez là où l'invention, la stratégie et les problèmes ouverts sont récompensés.", "Les postes très répétitifs vous épuiseront ; intégrez de la variété à votre semaine."],
      stress: ["Sous stress, vous pouvez vous éparpiller entre trop de possibilités à la fois ; en retenir une seule est l'antidote."],
    },
    low: {
      strengths: ["sens pratique et bon sens", "rester ancré(e) dans ce qui marche", "constance et prévisibilité", "attention au concret et à l'éprouvé"],
      watchouts: ["écarter trop vite des idées nouvelles utiles", "inconfort quand les plans changent", "préférer le familier au-delà de son utilité"],
      behavior: ["Vous faites confiance à l'éprouvé plutôt qu'à la dernière théorie.", "Vous préférez peaufiner une méthode connue que la réinventer.", "Les tâches concrètes et manuelles vous conviennent mieux que la spéculation abstraite."],
      relationships: ["Vous offrez à vos partenaires de la stabilité et une fiabilité sans détour.", "Vous pouvez vous heurter à ceux qui veulent une nouveauté ou une réinvention constantes."],
      work: ["Vous excellez dans les rôles qui récompensent l'exécution, les standards et une livraison fiable.", "Vous ramenez en douceur sur terre les grandes idées des autres."],
      stress: ["Le changement soudain est votre principal facteur de stress ; un préavis et un plan clair vous apaisent."],
    },
    mid: ["Vous pouvez passer de visionnaire à pragmatique, ce qui fait de vous un pont utile entre les rêveurs et les exécutants."],
  },
  C: {
    high: {
      strengths: ["constance et fiabilité", "organisation et planification", "autodiscipline face à la tentation", "exigences personnelles élevées"],
      watchouts: ["perfectionnisme et difficulté à déléguer", "rigidité quand les plans doivent changer", "être dur(e) envers vous-même pour de petits manquements"],
      behavior: ["Vous faites un plan et vous l'exécutez.", "Les choses en suspens vous dérangent vraiment jusqu'à ce qu'elles soient réglées.", "Les gens apprennent que si vous avez dit que vous le feriez, c'est fait."],
      relationships: ["Vous êtes la personne fiable sur qui les autres s'appuient.", "Vous devrez peut-être adoucir vos attentes envers des partenaires moins organisés."],
      work: ["On vous confie des responsabilités et des objectifs complexes à long terme.", "Attention à trop en prendre parce que vous ne supportez pas de laisser filer les standards."],
      stress: ["En surcharge, vous redoublez de contrôle ; baisser volontairement la barre d'un cran vous protège de l'épuisement."],
    },
    low: {
      strengths: ["flexibilité et spontanéité", "aisance avec l'imprévu", "peu de rigidité et des virages rapides", "détendu(e) face à l'imperfection"],
      watchouts: ["procrastination et délais manqués", "perdre le fil des détails", "commencer plus que vous ne finissez"],
      behavior: ["Vous préférez garder les choses ouvertes plutôt que verrouillées à un planning.", "Vous travaillez par bouffées d'énergie plutôt que par incréments réguliers.", "La structure vous semble plus une cage qu'un réconfort."],
      relationships: ["Vous apportez légèreté et adaptabilité aux relations.", "Des partenaires fiables peuvent avoir besoin que vous consolidiez le suivi des engagements communs."],
      work: ["Vous brillez dans des environnements rapides, improvisés et peu bureaucratiques.", "Une structure externe — délais, responsabilité, listes — transforme votre énergie en résultats."],
      stress: ["Sous pression, les tâches s'accumulent ; une seule « prochaine action » débloque l'embouteillage mieux qu'un grand plan."],
    },
    mid: ["Vous pouvez être organisé(e) quand cela compte et souple quand ça ne compte pas — utile, à condition de choisir à dessein plutôt que par défaut."],
  },
  E: {
    high: {
      strengths: ["dynamiser une pièce", "initier et relier", "assertivité et chaleur visible", "à l'aise sous les regards"],
      watchouts: ["parler par-dessus les plus discrets", "avoir besoin de stimulation jusqu'à l'agitation", "penser à voix haute avant d'avoir mûri votre idée"],
      behavior: ["Vous vous rechargez entouré(e) et vous flétrissez dans trop de solitude.", "Vous parlez souvent pour penser, pas seulement pour livrer une idée achevée.", "Vous gravitez vers le centre de l'action."],
      relationships: ["Vous apportez énergie, initiative et ciment social.", "Des partenaires plus discrets peuvent avoir besoin que vous laissiez de l'espace et écoutiez plus longtemps."],
      work: ["Vous réussissez là où le réseautage, la persuasion et le leadership visible comptent.", "De longues plages de travail solitaire et concentré vous videront — prévoyez de l'interaction."],
      stress: ["Stressé(e), vous pouvez chercher de la compagnie de façon compulsive ; une conversation sincère vaut mieux que beaucoup de superficielles."],
    },
    low: {
      strengths: ["la profondeur plutôt que l'ampleur", "une présence calme et réfléchie", "à l'aise avec la solitude et la concentration", "écouter plus que diffuser"],
      watchouts: ["passer inaperçu(e) faute de vous mettre en avant", "vous épuiser vite dans les grands événements", "retenir des idées qui méritent d'être partagées"],
      behavior: ["Vous vous rechargez seul(e) et payez un impôt d'énergie pour socialiser.", "Vous pensez d'abord et parlez une fois l'idée formée.", "Vous préférez quelques conversations profondes à une pièce bondée."],
      relationships: ["Vous offrez stabilité, attention profonde et loyauté à un cercle restreint.", "Rendez votre monde intérieur visible : les partenaires ne peuvent pas lire la profondeur que vous n'exprimez pas."],
      work: ["Vous excellez dans le travail concentré, indépendant et profond, et dans l'influence en tête-à-tête.", "Défendez vos contributions ; l'excellence discrète peut passer inaperçue."],
      stress: ["Trop socialiser est en soi un facteur de stress ; une solitude protégée est votre réinitialisation la plus fiable."],
    },
    mid: ["Vous pouvez animer une pièce puis disparaître avec plaisir pour vous recharger — l'amplitude d'un(e) ambivert(e) qui vous permet de rejoindre les gens là où ils sont."],
  },
  A: {
    high: {
      strengths: ["empathie et chaleur", "bâtir la confiance et la coopération", "générosité et tact", "lire les sentiments des autres"],
      watchouts: ["difficulté à dire non", "éviter le conflit nécessaire", "vous faire exploiter", "réprimer vos propres besoins"],
      behavior: ["Vous cherchez d'instinct la voie coopérative gagnant-gagnant.", "La détresse d'autrui vous atteint vite et physiquement.", "Vous préférez aplanir les choses plutôt que d'avoir le dernier mot."],
      relationships: ["Vous êtes un(e) partenaire et ami(e) profondément soutenant(e) et attentionné(e).", "Entraînez-vous à exprimer vos besoins aussi clairement que vous honorez ceux des autres."],
      work: ["Vous bâtissez des équipes soudées et désamorcez les frictions.", "En négociation, gardez-vous de trop concéder au nom de l'harmonie."],
      stress: ["Vous absorbez le stress des autres comme le vôtre ; une limite n'est pas une trahison, c'est de l'entretien."],
    },
    low: {
      strengths: ["franchise et honnêteté", "à l'aise avec le conflit et la compétition", "objectivité sous pression émotionnelle", "prêt(e) à être la voix dissidente"],
      watchouts: ["paraître brusque ou froid(e)", "un scepticisme qui tourne au cynisme", "gagner les disputes au prix des relations"],
      behavior: ["Vous dites la vérité difficile que les autres contournent sur la pointe des pieds.", "Vous pesez les affirmations avec scepticisme avant d'accorder votre confiance.", "Vous êtes à l'aise pour rivaliser et tenir une position impopulaire."],
      relationships: ["Vous offrez à vos partenaires de l'honnêteté et une fermeté sur laquelle compter.", "Ajoutez de la chaleur à votre franchise : avoir raison et être bienveillant ne s'opposent pas."],
      work: ["Vous prenez les décisions difficiles et donnez le retour direct que d'autres évitent.", "Le tact est une compétence à cultiver à dessein, pas une trahison de l'honnêteté."],
      stress: ["Sous stress, les angles s'aiguisent ; nommer l'objectif que vous partagez avec l'autre fait baisser la température."],
    },
    mid: ["Vous pouvez être chaleureux(se) et ferme, ce qui vous permet de coopérer sans être un paillasson — à condition de choisir le registre à dessein."],
  },
  N: {
    high: {
      strengths: ["sensibilité émotionnelle et conscience de soi", "vigilance au risque et aux problèmes", "profondeur et sérieux du ressenti", "empathie née d'un ressenti intense"],
      watchouts: ["rumination et inquiétude", "le stress qui déborde sur l'humeur", "prendre les revers personnellement", "autocritique sévère"],
      behavior: ["Vous ressentez les choses en haute résolution — le bon comme le difficile.", "Votre esprit scrute à l'avance ce qui pourrait mal tourner.", "Les revers peuvent résonner plus longtemps chez vous que chez d'autres."],
      relationships: ["Votre sensibilité vous rend accordé(e) et attentionné(e) quand elle est tournée vers l'extérieur.", "Partagez tôt ce que vous ressentez : les partenaires ne peuvent apaiser une tempête qu'ils ne voient pas."],
      work: ["Votre radar du risque repère des problèmes que d'autres manquent.", "Mettez en place des rituels de récupération ; sans eux, la pression s'accumule jusqu'au débordement."],
      stress: ["Votre système nerveux réagit fort et récupère lentement ; nommer l'émotion et ralentir la respiration ne sont pas des clichés pour vous : ça marche."],
    },
    low: {
      strengths: ["calme sous pression", "résilience émotionnelle", "humeur égale et stable", "ne pas être ébranlé(e) par les revers"],
      watchouts: ["sous-estimer les risques réels", "manquer les signaux émotionnels des autres", "paraître indifférent(e) quand d'autres ont besoin que vous vous souciiez"],
      behavior: ["Vous restez posé(e) quand les choses se tendent.", "Les revers glissent sur vous plus vite que sur la plupart.", "Vous êtes rarement emporté(e) par vos propres humeurs."],
      relationships: ["Vous êtes une présence stabilisante et rassurante dans la tempête.", "Veillez à ce que votre calme ne se lise pas comme de l'indifférence face à quelqu'un qui souffre."],
      work: ["Vous êtes la main sûre en cas de crise et dans les décisions à fort enjeu.", "Appuyez-vous sur le radar du risque de collègues plus anxieux ; le calme peut négliger un danger réel."],
      stress: ["Vous gérez bien le stress — si bien que votre angle mort est d'ignorer les signaux précoces jusqu'à ce qu'ils deviennent grands."],
    },
    mid: ["Vous ressentez les choses sans en être gouverné(e) : assez sensible pour être accordé(e), assez stable pour fonctionner sous charge."],
  },
};

const DYN_FR: string[][] = [
  ["Une forte Ouverture associée à un fort caractère Consciencieux est la rare combinaison du « visionnaire qui exécute » : vous générez des idées originales et vous les menez vraiment à terme.", "Comme votre imagination et votre discipline sont élevées à la fois, vous pouvez concevoir un système puis le construire ; chez vous, les idées meurent rarement en chemin."],
  ["Vos idées dépassent votre suivi : l'Ouverture est forte mais le caractère Consciencieux est plus faible, donc votre goulot d'étranglement est de capter et de finir, pas de générer.", "Vous êtes riche en idées et léger(ère) en structure ; un échafaudage externe (délais, un collaborateur qui termine) transforme votre créativité en résultats."],
  ["Une forte Extraversion plus une forte Agréabilité font de vous un(e) connecteur(trice) naturel(le) : chaleureux(se), sociable et sincèrement apprécié(e).", "Vous combinez énergie sociale et chaleur, ce qui tend à faire de vous le ciment des groupes et la personne vers qui les autres gravitent."],
  ["Une Extraversion plus faible avec un Névrosisme plus élevé signifie que vous avez à la fois besoin de solitude et ressentez les choses intensément : un temps calme protégé n'est pas un luxe pour vous, c'est de l'entretien.", "Vous êtes tourné(e) vers l'intérieur et sensible à la fois ; une récupération calme et peu stimulante est ce qui vous garde régulé(e)."],
  ["Un fort caractère Consciencieux avec un faible Névrosisme est le profil de « l'opérateur imperturbable » : organisé(e) et calme, vous êtes la personne en qui les autres ont confiance en cas de crise.", "Vous combinez fiabilité et stabilité émotionnelle, ce qui fait de vous une force stabilisante sous pression."],
  ["Une faible Agréabilité avec un fort caractère Consciencieux vous rend exigeant(e) et franc(he) : vous tenez une barre haute et vous le dites sans détour.", "Vous alliez des standards élevés à la franchise ; excellent pour la qualité, à tempérer d'un peu de chaleur dans la forme."],
  ["Une forte Ouverture et une forte Extraversion font de vous un(e) diffuseur(se) expressif(ve) d'idées : vous pensez à voix haute et faites entrer les autres dans votre imagination.", "Votre curiosité est tournée vers l'extérieur et sociale ; les étincelles jaillissent avec les autres et vous transformez les conversations en découverte."],
  ["Une forte Agréabilité avec un Névrosisme plus élevé signifie que vous ressentez vivement la douleur d'autrui et pouvez l'absorber : la compassion est une force, mais les limites la rendent durable.", "Vous êtes profondément empathique et émotionnellement poreux(se) à la fois ; protéger vos réserves fait durer votre attention aux autres."],
  ["Un fort caractère Consciencieux avec une Ouverture plus faible fait de vous un(e) finisseur(se) fiable qui préfère les méthodes éprouvées aux expériences : excellent pour exécuter, à associer à quelqu'un d'idées.", "Vous apportez ordre et fiabilité et faites confiance à ce qui marche ; les approches nouvelles semblent risquées tant qu'elles n'ont pas fait leurs preuves."],
  ["Une forte Extraversion et un fort caractère Consciencieux forment un profil de leadership : vous mobilisez les gens et vous tenez vos engagements, alliant élan et exécution.", "Vous dynamisez les autres et vous exécutez à la fois, ce qui explique pourquoi cette combinaison finit si souvent aux commandes."],
];

/** French dynamics reuse the English predicates and ordering; only the prose differs. */
export const BIG_FIVE_DYNAMICS_FR: DynamicRule[] = BIG_FIVE_DYNAMICS.map((rule, i) => ({ ...rule, variants: DYN_FR[i] }));
