/**
 * "How to strengthen this" guidance for the cognitive tests, per locale.
 *
 * Integrity first: cognitive abilities are far more stable and heritable than
 * personality traits, and the evidence on "brain training" is clear that practice
 * gains are mostly task-specific and rarely transfer (Melby-Lervåg & Hulme, 2013;
 * Simons et al., 2016). So this offers honest, evidence-backed levers — real
 * brain-health habits and task strategies — rather than promising to raise IQ.
 * English is the default; es/fr fall back to English if absent. Framework-agnostic.
 */

export interface AbilityTip {
  title: string;
  detail: string;
}

export interface AbilityGrowth {
  headline: string;
  tips: AbilityTip[];
  /** The honest limitation, always shown. */
  caveat: string;
  /** Paywall microcopy shown when the full report is locked. */
  teaser: string;
  unlockCta: string;
  unlockTrust: string;
}

interface Bundle {
  basics: AbilityTip[];
  caveat: string;
  teaser: string;
  unlockCta: string;
  unlockTrust: string;
  defaultHeadline: string;
  perTest: Record<string, { headline: string; tips: AbilityTip[] }>;
}

const EN: Bundle = {
  basics: [
    { title: "Protect your sleep", detail: "Memory, attention, and speed all run on sleep. Consistent, sufficient sleep is the single highest-leverage thing you can do for day-to-day mental performance." },
    { title: "Move your body", detail: "Regular aerobic exercise is one of the few interventions with solid evidence for supporting cognition and protecting it as you age." },
    { title: "Lower chronic stress", detail: "Sustained stress and anxiety quietly tax working memory and attention. Practices that downshift the nervous system free those resources back up." },
  ],
  caveat:
    "Be skeptical of “brain training”: practising a task makes you better at that task, but the gains rarely transfer to general intelligence or everyday life (Melby-Lervåg & Hulme, 2013; Simons et al., 2016). The habits here — sleep, exercise, and learning real things — have far better evidence than any app, and your score is an educational estimate, not a fixed ceiling.",
  teaser: "Your full cognitive report turns this score into a personalized, evidence-based plan to strengthen it — with the honest science on what actually helps.",
  unlockCta: "Unlock the full report",
  unlockTrust: "🔒 No account needed. Secure one-time purchase.",
  defaultHeadline: "Supporting your cognitive performance",
  perTest: {
    "memory-span": { headline: "Working memory is fairly stable — but you can work cleverly with it", tips: [
      { title: "Chunk information", detail: "Group items into meaningful clusters (a number as a few chunks, not ten loose digits). Chunking is how experts hold more in mind without a bigger “buffer.”" },
      { title: "Offload deliberately", detail: "Use notes, lists, and tools so working memory isn't your bottleneck. Reducing the load beats trying to expand the capacity." },
    ] },
    "corsi-blocks": { headline: "Spatial memory responds to strategy more than raw drilling", tips: [
      { title: "Turn space into a story", detail: "Convert a spatial sequence into a path or a little narrative; the “method of loci” borrows the spatial memory you already have." },
      { title: "Rehearse in your mind's eye", detail: "Deliberately re-walk the pattern visually before reproducing it — active visualization holds a sequence longer than passive looking." },
    ] },
    "processing-speed": { headline: "Speed is practice- and state-dependent", tips: [
      { title: "Practise the specific skill", detail: "Speed improves with practice on a given task — just know the gains are mostly specific to it, not a global speed-up." },
      { title: "Remove friction", detail: "Cut distractions and context-switching; a lot of what feels “slow” is interruption and divided attention, not raw processing speed." },
    ] },
    "adaptive-reasoning": { headline: "Fluid reasoning is stable; knowledge and strategy are your real levers", tips: [
      { title: "Learn the domain deeply", detail: "Reasoning rides on knowledge. Deep familiarity with a field lets you reason far better within it than raw “IQ” alone ever could." },
      { title: "Externalize the problem", detail: "Draw it, write the steps, break it into parts. Off-loading working memory frees capacity for the actual reasoning." },
    ] },
    "alternative-uses": { headline: "Divergent thinking genuinely improves with practice", tips: [
      { title: "Defer judgment", detail: "Generate first, evaluate later. The biggest creativity killer is critiquing ideas the moment they arrive." },
      { title: "Force remote connections", detail: "Combine unrelated things on purpose (“how is this like a river? a market? a song?”). Originality comes from distant associations." },
      { title: "Feed the well", detail: "Expose yourself to varied domains, people, and inputs — you can only recombine what you've taken in." },
    ] },
  },
};

const ES: Bundle = {
  basics: [
    { title: "Protege tu sueño", detail: "La memoria, la atención y la velocidad funcionan con sueño. Dormir de forma constante y suficiente es lo más eficaz que puedes hacer por tu rendimiento mental diario." },
    { title: "Mueve el cuerpo", detail: "El ejercicio aeróbico regular es una de las pocas intervenciones con evidencia sólida para apoyar la cognición y protegerla con la edad." },
    { title: "Reduce el estrés crónico", detail: "El estrés y la ansiedad sostenidos gravan en silencio la memoria de trabajo y la atención. Las prácticas que calman el sistema nervioso liberan esos recursos." },
  ],
  caveat:
    "Desconfía del «entrenamiento cerebral»: practicar una tarea te hace mejor en esa tarea, pero las mejoras rara vez se transfieren a la inteligencia general o a la vida diaria (Melby-Lervåg y Hulme, 2013; Simons et al., 2016). Los hábitos de aquí —dormir, hacer ejercicio y aprender cosas reales— tienen mucha mejor evidencia que cualquier app, y tu resultado es una estimación educativa, no un techo fijo.",
  teaser: "Tu informe cognitivo completo convierte esta puntuación en un plan personalizado y basado en la evidencia para reforzarla, con la ciencia honesta sobre lo que de verdad ayuda.",
  unlockCta: "Desbloquear el informe completo",
  unlockTrust: "🔒 Sin cuenta. Compra única y segura.",
  defaultHeadline: "Apoyar tu rendimiento cognitivo",
  perTest: {
    "memory-span": { headline: "La memoria de trabajo es bastante estable, pero puedes trabajar con astucia con ella", tips: [
      { title: "Agrupa la información", detail: "Reúne los elementos en bloques con sentido (un número en unos pocos bloques, no diez dígitos sueltos). Agrupar es como los expertos retienen más sin un «búfer» mayor." },
      { title: "Descarga a propósito", detail: "Usa notas, listas y herramientas para que la memoria de trabajo no sea tu cuello de botella. Reducir la carga supera a intentar ampliar la capacidad." },
    ] },
    "corsi-blocks": { headline: "La memoria espacial responde más a la estrategia que a la repetición", tips: [
      { title: "Convierte el espacio en una historia", detail: "Transforma una secuencia espacial en un recorrido o un pequeño relato; el «método de loci» toma prestada la memoria espacial que ya tienes." },
      { title: "Ensaya en tu mente", detail: "Vuelve a recorrer el patrón visualmente antes de reproducirlo: la visualización activa retiene una secuencia más tiempo que mirar de forma pasiva." },
    ] },
    "processing-speed": { headline: "La velocidad depende de la práctica y del estado", tips: [
      { title: "Practica la habilidad concreta", detail: "La velocidad mejora con la práctica en una tarea dada; solo ten en cuenta que las mejoras son sobre todo específicas de ella, no una aceleración global." },
      { title: "Elimina la fricción", detail: "Recorta distracciones y cambios de contexto; mucho de lo que parece «lento» es interrupción y atención dividida, no velocidad de procesamiento pura." },
    ] },
    "adaptive-reasoning": { headline: "El razonamiento fluido es estable; el conocimiento y la estrategia son tus verdaderas palancas", tips: [
      { title: "Aprende el dominio a fondo", detail: "El razonamiento se apoya en el conocimiento. Una familiaridad profunda con un campo te permite razonar mucho mejor dentro de él que el «CI» en bruto." },
      { title: "Externaliza el problema", detail: "Dibújalo, escribe los pasos, divídelo en partes. Descargar la memoria de trabajo libera capacidad para el razonamiento en sí." },
    ] },
    "alternative-uses": { headline: "El pensamiento divergente sí mejora con la práctica", tips: [
      { title: "Aplaza el juicio", detail: "Genera primero, evalúa después. El mayor enemigo de la creatividad es criticar las ideas en cuanto aparecen." },
      { title: "Fuerza conexiones lejanas", detail: "Combina cosas no relacionadas a propósito («¿en qué se parece esto a un río? ¿a un mercado? ¿a una canción?»). La originalidad nace de asociaciones distantes." },
      { title: "Alimenta el pozo", detail: "Exponte a dominios, personas e ideas variadas: solo puedes recombinar lo que has absorbido." },
    ] },
  },
};

const FR: Bundle = {
  basics: [
    { title: "Protégez votre sommeil", detail: "La mémoire, l'attention et la vitesse fonctionnent au sommeil. Dormir suffisamment et régulièrement est ce que vous pouvez faire de plus efficace pour vos performances mentales au quotidien." },
    { title: "Bougez", detail: "L'exercice aérobie régulier est l'une des rares interventions à l'appui solide pour soutenir la cognition et la protéger avec l'âge." },
    { title: "Réduisez le stress chronique", detail: "Le stress et l'anxiété durables grèvent en silence la mémoire de travail et l'attention. Les pratiques qui apaisent le système nerveux libèrent ces ressources." },
  ],
  caveat:
    "Méfiez-vous de l'« entraînement cérébral » : s'exercer à une tâche vous y rend meilleur, mais les gains se transfèrent rarement à l'intelligence générale ou à la vie quotidienne (Melby-Lervåg & Hulme, 2013 ; Simons et al., 2016). Les habitudes ici — sommeil, exercice et apprendre de vraies choses — ont bien plus de preuves que n'importe quelle appli, et votre score est une estimation éducative, pas un plafond figé.",
  teaser: "Votre rapport cognitif complet transforme ce score en un plan personnalisé et fondé sur des preuves pour le renforcer — avec la science honnête de ce qui aide vraiment.",
  unlockCta: "Débloquer le rapport complet",
  unlockTrust: "🔒 Sans compte. Achat unique et sécurisé.",
  defaultHeadline: "Soutenir vos performances cognitives",
  perTest: {
    "memory-span": { headline: "La mémoire de travail est assez stable — mais vous pouvez ruser avec elle", tips: [
      { title: "Regroupez l'information", detail: "Rassemblez les éléments en blocs porteurs de sens (un nombre en quelques blocs, pas dix chiffres épars). Le regroupement est la façon dont les experts retiennent plus sans « tampon » plus grand." },
      { title: "Déchargez à dessein", detail: "Utilisez notes, listes et outils pour que la mémoire de travail ne soit pas votre goulot. Réduire la charge vaut mieux que tenter d'élargir la capacité." },
    ] },
    "corsi-blocks": { headline: "La mémoire spatiale répond plus à la stratégie qu'au bachotage", tips: [
      { title: "Transformez l'espace en récit", detail: "Convertissez une séquence spatiale en un parcours ou une petite histoire ; la « méthode des loci » emprunte la mémoire spatiale que vous avez déjà." },
      { title: "Répétez dans votre tête", detail: "Reparcourez délibérément le motif visuellement avant de le reproduire — la visualisation active retient une séquence plus longtemps que le regard passif." },
    ] },
    "processing-speed": { headline: "La vitesse dépend de la pratique et de l'état", tips: [
      { title: "Entraînez la compétence précise", detail: "La vitesse s'améliore avec la pratique d'une tâche donnée ; sachez seulement que les gains sont surtout spécifiques à elle, pas une accélération globale." },
      { title: "Supprimez les frictions", detail: "Coupez les distractions et les changements de contexte ; beaucoup de ce qui semble « lent » est de l'interruption et de l'attention partagée, pas la vitesse brute." },
    ] },
    "adaptive-reasoning": { headline: "Le raisonnement fluide est stable ; le savoir et la stratégie sont vos vrais leviers", tips: [
      { title: "Apprenez le domaine en profondeur", detail: "Le raisonnement s'appuie sur le savoir. Une connaissance approfondie d'un domaine vous permet d'y raisonner bien mieux que le « QI » brut." },
      { title: "Externalisez le problème", detail: "Dessinez-le, écrivez les étapes, découpez-le. Décharger la mémoire de travail libère de la capacité pour le raisonnement lui-même." },
    ] },
    "alternative-uses": { headline: "La pensée divergente s'améliore vraiment avec la pratique", tips: [
      { title: "Suspendez le jugement", detail: "Générez d'abord, évaluez ensuite. Le pire ennemi de la créativité est de critiquer les idées dès qu'elles arrivent." },
      { title: "Forcez les connexions lointaines", detail: "Combinez exprès des choses sans rapport (« en quoi est-ce comme une rivière ? un marché ? une chanson ? »). L'originalité naît d'associations distantes." },
      { title: "Nourrissez le puits", detail: "Exposez-vous à des domaines, des gens et des idées variés — vous ne pouvez recombiner que ce que vous avez absorbé." },
    ] },
  },
};

const BUNDLES: Record<string, Bundle> = { en: EN, es: ES, fr: FR };

/** Honest, evidence-based ways to support performance on a cognitive test, localized. */
export function abilityGrowth(testId: string, locale?: string): AbilityGrowth {
  const b = (locale && BUNDLES[locale]) || EN;
  const t = b.perTest[testId];
  return {
    headline: t?.headline ?? b.defaultHeadline,
    tips: [...(t?.tips ?? []), ...b.basics],
    caveat: b.caveat,
    teaser: b.teaser,
    unlockCta: b.unlockCta,
    unlockTrust: b.unlockTrust,
  };
}
