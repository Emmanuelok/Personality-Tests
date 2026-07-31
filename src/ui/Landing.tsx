import { useEffect, useRef, useState } from "react";
import { INSTRUMENTS } from "@core/instruments";
import { LanguageSwitcher, useI18n } from "../i18n";
import {
  getLandingScrollProgress,
  getLandingVideoTime,
  LANDING_VIDEO_FPS,
  shouldLoadLandingVideo,
} from "./landingMedia";
import { ThemeToggle } from "./theme";
import { toLoc, type Loc } from "./goals";

interface LandingCopy {
  nav: {
    experiences: string;
    method: string;
    privacy: string;
    enter: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    body: string;
    begin: string;
    browse: string;
    imageAlt: string;
    scroll: string;
    motionPlay: string;
    motionPause: string;
  };
  stats: Array<{ value: string; label: string }>;
  thesis: {
    eyebrow: string;
    title: string;
    body: string;
  };
  chapters: Array<{
    number: string;
    eyebrow: string;
    title: string;
    body: string;
    imageAlt: string;
  }>;
  experiences: {
    eyebrow: string;
    title: string;
    body: string;
    cards: Array<{
      number: string;
      title: string;
      body: string;
      imageAlt: string;
    }>;
  };
  connection: {
    eyebrow: string;
    title: string;
    body: string;
    action: string;
    imageAlt: string;
  };
  trust: {
    eyebrow: string;
    title: string;
    body: string;
    points: Array<{ title: string; body: string }>;
  };
  closing: {
    eyebrow: string;
    title: string;
    body: string;
    begin: string;
    browse: string;
  };
  footer: string;
}

const COPY: Record<Loc, LandingCopy> = {
  en: {
    nav: {
      experiences: "Experiences",
      method: "How it works",
      privacy: "Privacy",
      enter: "Begin your Atlas",
    },
    hero: {
      eyebrow: "Private · evidence-aware · built around you",
      title: "There is more to you than",
      accent: "a type.",
      body: "Psyche Atlas brings reflection, learning, relationships, and growth into one living portrait—so every insight can lead somewhere useful.",
      begin: "Begin your Atlas",
      browse: "Explore every experience",
      imageAlt: "A woman moving through a gallery of reflective portrait planes.",
      scroll: "Scroll to enter",
      motionPlay: "Play motion",
      motionPause: "Pause motion",
    },
    stats: [
      { value: "{n}+", label: "guided experiences" },
      { value: "8", label: "bounded learner agents" },
      { value: "3", label: "visible evidence tiers" },
    ],
    thesis: {
      eyebrow: "A different kind of self-knowledge",
      title: "Not a label. A landscape.",
      body: "Most tests end with a score. Psyche Atlas keeps the evidence visible, connects themes carefully, and turns reflection into a path you can revisit.",
    },
    chapters: [
      {
        number: "01",
        eyebrow: "Signal",
        title: "Start with a question that matters.",
        body: "Explore personality, values, communication, wellbeing, learning, and more. Every activity states what it can—and cannot—tell you.",
        imageAlt: "A woman choosing a route inside a colorful gallery.",
      },
      {
        number: "02",
        eyebrow: "Portrait",
        title: "See patterns without flattening the person.",
        body: "Your completed reflections form an integrated portrait with source evidence, uncertainty, and context kept in view.",
        imageAlt: "A man examining layered glass portraits in a design gallery.",
      },
      {
        number: "03",
        eyebrow: "Direction",
        title: "Turn insight into a next move.",
        body: "Shape a personal roadmap, practise a skill, revisit a result, or learn with others. Your Atlas grows with your choices.",
        imageAlt: "A man arranging priorities on a creative studio wall.",
      },
    ],
    experiences: {
      eyebrow: "One Atlas · many ways in",
      title: "Built for the questions real life asks.",
      body: "Move between private reflection, skill practice, growth planning, and shared learning without losing the thread.",
      cards: [
        {
          number: "A",
          title: "Understand yourself",
          body: "Bring separate reflection results into one evidence-aware portrait.",
          imageAlt: "A man studying a layered glass self-portrait.",
        },
        {
          number: "B",
          title: "Strengthen how you learn",
          body: "Explore memory, reasoning, attention, and creativity as practice—not fixed potential.",
          imageAlt: "A woman working with spatial reasoning blocks.",
        },
        {
          number: "C",
          title: "Grow with intention",
          body: "Turn chosen goals into a practical journey you can tune over time.",
          imageAlt: "A woman reflecting in a notebook beside a garden path.",
        },
        {
          number: "D",
          title: "Learn together",
          body: "Study as a group or compare patterns one dimension at a time, without verdicts.",
          imageAlt: "Four adults learning together around a round table.",
        },
      ],
    },
    connection: {
      eyebrow: "Connection Map",
      title: "Better conversations begin with nuance.",
      body: "Compare two perspectives dimension by dimension. No compatibility percentage. No verdict about people. Just a clearer place to begin the conversation.",
      action: "Explore relationships",
      imageAlt: "Two adults in a thoughtful face-to-face conversation.",
    },
    trust: {
      eyebrow: "Private by architecture",
      title: "Your inner life is not an advertising profile.",
      body: "The core workspace begins on your device. Sensitive context stays separate from bounded recommendations, and external AI is an explicit choice.",
      points: [
        {
          title: "Local first",
          body: "Your profile, answers, reflections, and most generated outputs remain in your browser.",
        },
        {
          title: "Evidence before automation",
          body: "Recommendations show why they appeared and which evidence they used.",
        },
        {
          title: "Limits stay visible",
          body: "Activities support reflection and learning; they do not diagnose or decide your future.",
        },
      ],
    },
    closing: {
      eyebrow: "Your Atlas begins with one honest question",
      title: "See yourself in higher resolution.",
      body: "No account. No email. Start privately, choose what matters, and build the path from there.",
      begin: "Create my path",
      browse: "Browse first",
    },
    footer: "Psyche Atlas · private reflection, deliberate practice, meaningful progress.",
  },
  es: {
    nav: {
      experiences: "Experiencias",
      method: "Cómo funciona",
      privacy: "Privacidad",
      enter: "Comenzar mi Atlas",
    },
    hero: {
      eyebrow: "Privado · basado en evidencia · hecho para ti",
      title: "Eres mucho más que",
      accent: "un tipo.",
      body: "Psyche Atlas reúne reflexión, aprendizaje, relaciones y crecimiento en un retrato vivo, para que cada hallazgo pueda llevarte a algo útil.",
      begin: "Comenzar mi Atlas",
      browse: "Explorar las experiencias",
      imageAlt: "Una mujer recorre una galería de retratos reflectantes.",
      scroll: "Desliza para entrar",
      motionPlay: "Reproducir movimiento",
      motionPause: "Pausar movimiento",
    },
    stats: [
      { value: "{n}+", label: "experiencias guiadas" },
      { value: "8", label: "agentes de aprendizaje limitados" },
      { value: "3", label: "niveles de evidencia visibles" },
    ],
    thesis: {
      eyebrow: "Otra forma de conocerte",
      title: "No una etiqueta. Un paisaje.",
      body: "La mayoría de los tests terminan en una puntuación. Psyche Atlas mantiene visible la evidencia, conecta temas con cuidado y convierte la reflexión en un camino que puedes retomar.",
    },
    chapters: [
      {
        number: "01",
        eyebrow: "Señal",
        title: "Empieza por una pregunta importante.",
        body: "Explora personalidad, valores, comunicación, bienestar, aprendizaje y más. Cada actividad explica qué puede —y qué no puede— decirte.",
        imageAlt: "Una mujer elige una ruta en una galería colorida.",
      },
      {
        number: "02",
        eyebrow: "Retrato",
        title: "Observa patrones sin reducir a la persona.",
        body: "Tus reflexiones forman un retrato integrado que mantiene a la vista las fuentes, la incertidumbre y el contexto.",
        imageAlt: "Un hombre observa retratos de vidrio superpuestos.",
      },
      {
        number: "03",
        eyebrow: "Dirección",
        title: "Convierte el hallazgo en un siguiente paso.",
        body: "Crea una hoja de ruta, practica una habilidad, revisa un resultado o aprende con otras personas. Tu Atlas crece con tus decisiones.",
        imageAlt: "Un hombre organiza prioridades en la pared de un estudio.",
      },
    ],
    experiences: {
      eyebrow: "Un Atlas · muchas entradas",
      title: "Creado para las preguntas de la vida real.",
      body: "Pasa de la reflexión privada a la práctica, el crecimiento y el aprendizaje compartido sin perder el hilo.",
      cards: [
        {
          number: "A",
          title: "Compréndete",
          body: "Reúne resultados separados en un retrato integrado y basado en evidencia.",
          imageAlt: "Un hombre estudia un autorretrato de vidrio por capas.",
        },
        {
          number: "B",
          title: "Fortalece tu aprendizaje",
          body: "Explora memoria, razonamiento, atención y creatividad como práctica, no como potencial fijo.",
          imageAlt: "Una mujer trabaja con bloques de razonamiento espacial.",
        },
        {
          number: "C",
          title: "Crece con intención",
          body: "Convierte tus metas elegidas en un camino práctico que puedes ajustar.",
          imageAlt: "Una mujer escribe una reflexión junto a un jardín.",
        },
        {
          number: "D",
          title: "Aprended juntos",
          body: "Estudia en grupo o compara patrones dimensión por dimensión, sin veredictos.",
          imageAlt: "Cuatro personas adultas aprenden alrededor de una mesa.",
        },
      ],
    },
    connection: {
      eyebrow: "Mapa de conexión",
      title: "Las mejores conversaciones empiezan con matices.",
      body: "Compara dos perspectivas dimensión por dimensión. Sin porcentaje de compatibilidad. Sin veredictos sobre personas. Solo un punto de partida más claro.",
      action: "Explorar relaciones",
      imageAlt: "Dos personas adultas mantienen una conversación atenta.",
    },
    trust: {
      eyebrow: "Privado por arquitectura",
      title: "Tu vida interior no es un perfil publicitario.",
      body: "El espacio central comienza en tu dispositivo. El contexto sensible se separa de las recomendaciones y la IA externa siempre es una decisión explícita.",
      points: [
        {
          title: "Primero, local",
          body: "Tu perfil, respuestas, reflexiones y la mayoría de los resultados permanecen en el navegador.",
        },
        {
          title: "Evidencia antes que automatización",
          body: "Las recomendaciones muestran por qué aparecieron y qué evidencia utilizaron.",
        },
        {
          title: "Límites visibles",
          body: "Las actividades apoyan la reflexión y el aprendizaje; no diagnostican ni deciden tu futuro.",
        },
      ],
    },
    closing: {
      eyebrow: "Tu Atlas empieza con una pregunta sincera",
      title: "Mírate con mayor resolución.",
      body: "Sin cuenta. Sin correo. Empieza en privado, elige lo que importa y construye tu camino.",
      begin: "Crear mi camino",
      browse: "Explorar primero",
    },
    footer: "Psyche Atlas · reflexión privada, práctica deliberada, progreso con sentido.",
  },
  fr: {
    nav: {
      experiences: "Expériences",
      method: "Comment ça marche",
      privacy: "Confidentialité",
      enter: "Commencer mon Atlas",
    },
    hero: {
      eyebrow: "Privé · fondé sur des indices · conçu autour de vous",
      title: "Vous êtes bien plus",
      accent: "qu’un type.",
      body: "Psyche Atlas réunit réflexion, apprentissage, relations et progression dans un portrait vivant, afin que chaque découverte mène à une action utile.",
      begin: "Commencer mon Atlas",
      browse: "Explorer les expériences",
      imageAlt: "Une femme traverse une galerie de portraits réfléchissants.",
      scroll: "Faites défiler pour entrer",
      motionPlay: "Relancer l’animation",
      motionPause: "Mettre en pause",
    },
    stats: [
      { value: "{n}+", label: "expériences guidées" },
      { value: "8", label: "agents d’apprentissage bornés" },
      { value: "3", label: "niveaux d’indices visibles" },
    ],
    thesis: {
      eyebrow: "Une autre façon de se connaître",
      title: "Pas une étiquette. Un paysage.",
      body: "La plupart des tests s’arrêtent à un score. Psyche Atlas garde les indices visibles, relie les thèmes avec prudence et transforme la réflexion en parcours revisitable.",
    },
    chapters: [
      {
        number: "01",
        eyebrow: "Signal",
        title: "Partez d’une question qui compte.",
        body: "Explorez personnalité, valeurs, communication, bien-être, apprentissage et plus encore. Chaque activité précise ce qu’elle peut — ou ne peut pas — indiquer.",
        imageAlt: "Une femme choisit un chemin dans une galerie colorée.",
      },
      {
        number: "02",
        eyebrow: "Portrait",
        title: "Voyez les tendances sans réduire la personne.",
        body: "Vos réflexions terminées forment un portrait intégré qui garde visibles les sources, l’incertitude et le contexte.",
        imageAlt: "Un homme examine des portraits superposés sur du verre.",
      },
      {
        number: "03",
        eyebrow: "Direction",
        title: "Transformez une découverte en prochaine étape.",
        body: "Créez une feuille de route, exercez une compétence, revisitez un résultat ou apprenez avec d’autres. Votre Atlas grandit avec vos choix.",
        imageAlt: "Un homme organise ses priorités sur le mur d’un studio.",
      },
    ],
    experiences: {
      eyebrow: "Un Atlas · plusieurs entrées",
      title: "Conçu pour les questions de la vie réelle.",
      body: "Passez de la réflexion privée à la pratique, à la progression et à l’apprentissage partagé sans perdre le fil.",
      cards: [
        {
          number: "A",
          title: "Mieux vous comprendre",
          body: "Réunissez des résultats séparés dans un portrait intégré et fondé sur des indices.",
          imageAlt: "Un homme observe un autoportrait de verre en plusieurs couches.",
        },
        {
          number: "B",
          title: "Renforcer votre apprentissage",
          body: "Explorez mémoire, raisonnement, attention et créativité comme pratiques, jamais comme potentiel figé.",
          imageAlt: "Une femme travaille avec des blocs de raisonnement spatial.",
        },
        {
          number: "C",
          title: "Progresser avec intention",
          body: "Transformez vos objectifs choisis en parcours pratique que vous pouvez ajuster.",
          imageAlt: "Une femme écrit une réflexion près d’un jardin.",
        },
        {
          number: "D",
          title: "Apprendre ensemble",
          body: "Étudiez en groupe ou comparez les tendances dimension par dimension, sans verdict.",
          imageAlt: "Quatre adultes apprennent autour d’une table.",
        },
      ],
    },
    connection: {
      eyebrow: "Carte de connexion",
      title: "Les meilleures conversations commencent par la nuance.",
      body: "Comparez deux perspectives dimension par dimension. Aucun pourcentage de compatibilité. Aucun verdict sur les personnes. Un point de départ plus clair.",
      action: "Explorer les relations",
      imageAlt: "Deux adultes échangent dans une conversation attentive.",
    },
    trust: {
      eyebrow: "Privé par architecture",
      title: "Votre vie intérieure n’est pas un profil publicitaire.",
      body: "L’espace principal commence sur votre appareil. Le contexte sensible reste séparé des recommandations, et l’IA externe demeure un choix explicite.",
      points: [
        {
          title: "Local d’abord",
          body: "Votre profil, vos réponses, vos réflexions et la plupart des résultats restent dans votre navigateur.",
        },
        {
          title: "Les indices avant l’automatisation",
          body: "Les recommandations indiquent pourquoi elles apparaissent et quels indices elles utilisent.",
        },
        {
          title: "Des limites visibles",
          body: "Les activités soutiennent la réflexion et l’apprentissage; elles ne diagnostiquent pas et ne décident pas de votre avenir.",
        },
      ],
    },
    closing: {
      eyebrow: "Votre Atlas commence par une question sincère",
      title: "Voyez-vous en haute résolution.",
      body: "Aucun compte. Aucun e-mail. Commencez en privé, choisissez ce qui compte et construisez votre parcours.",
      begin: "Créer mon parcours",
      browse: "Explorer d’abord",
    },
    footer: "Psyche Atlas · réflexion privée, pratique délibérée, progression porteuse de sens.",
  },
};

const CHAPTER_IMAGES = [
  "/images/psyche-explore.webp",
  "/images/psyche-reflection.webp",
  "/images/psyche-direction.webp",
] as const;

const EXPERIENCE_IMAGES = [
  "/images/psyche-reflection.webp",
  "/images/psyche-cognition.webp",
  "/images/psyche-growth.webp",
  "/images/psyche-study.webp",
] as const;

function AtlasField({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0 };
    let animationFrame = 0;
    let width = 1;
    let height = 1;
    let pageVisible = !document.hidden;
    let inViewport = true;

    const nodes = Array.from({ length: 32 }, (_, index) => ({
      ring: 0.42 + (index % 5) * 0.115,
      angle: index * 2.399963,
      lift: Math.sin(index * 1.73) * 0.34,
      speed: 0.045 + (index % 4) * 0.011,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const cx = width * (0.72 + pointer.x * 0.018);
      const cy = height * (0.45 + pointer.y * 0.018);
      const radius = Math.min(width, height) * 0.34;
      const projected: Array<{ x: number; y: number; z: number }> = [];

      context.save();
      context.globalCompositeOperation = "screen";
      for (let ring = 0; ring < 4; ring += 1) {
        context.beginPath();
        context.ellipse(
          cx,
          cy,
          radius * (0.62 + ring * 0.17),
          radius * (0.16 + ring * 0.025),
          -0.32 + pointer.x * 0.08,
          0,
          Math.PI * 2,
        );
        context.strokeStyle = `rgba(118, 230, 255, ${0.09 - ring * 0.012})`;
        context.lineWidth = 1;
        context.stroke();
      }

      for (const node of nodes) {
        const angle = node.angle + (reducedMotion ? 0 : time * 0.0001 * node.speed * 10);
        const x3 = Math.cos(angle) * node.ring;
        const z3 = Math.sin(angle) * node.ring;
        const scale = 0.68 + (z3 + 0.7) * 0.32;
        projected.push({
          x: cx + x3 * radius * 1.5 + pointer.x * z3 * 32,
          y: cy + (node.lift * 0.68 + z3 * 0.16) * radius + pointer.y * z3 * 22,
          z: scale,
        });
      }

      projected.forEach((point, index) => {
        for (let next = index + 1; next < projected.length; next += 1) {
          const other = projected[next];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance > radius * 0.44) continue;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(103, 203, 255, ${Math.max(0, 0.11 - distance / (radius * 4.5))})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      });

      for (const point of projected) {
        const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, 9 * point.z);
        glow.addColorStop(0, "rgba(235, 250, 255, 0.95)");
        glow.addColorStop(0.2, "rgba(103, 213, 255, 0.65)");
        glow.addColorStop(1, "rgba(103, 213, 255, 0)");
        context.beginPath();
        context.arc(point.x, point.y, 9 * point.z, 0, Math.PI * 2);
        context.fillStyle = glow;
        context.fill();
      }
      context.restore();

      if (!reducedMotion && !paused && pageVisible && inViewport) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const syncAnimation = () => {
      window.cancelAnimationFrame(animationFrame);
      if (!reducedMotion && !paused && pageVisible && inViewport) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      syncAnimation();
    };
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
        inViewport = entry?.isIntersecting ?? true;
        syncAnimation();
      }, { threshold: 0.01 })
      : null;

    resize();
    draw(0);
    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="landing-atlas-field" aria-hidden="true" />;
}

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: EventListener) => void;
  removeEventListener?: (type: "change", listener: EventListener) => void;
}

function CinematicHeroMedia({
  sequenceRef,
  onScrubAvailabilityChange,
}: {
  sequenceRef: { current: HTMLDivElement | null };
  onScrubAvailabilityChange: (available: boolean) => void;
}) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const latestTargetRef = useRef(0);
  const videoVisibleRef = useRef(false);
  const [eligible, setEligible] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [sourceFailed, setSourceFailed] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dataQuery = window.matchMedia("(prefers-reduced-data: reduce)");
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    const syncEligibility = () => {
      const nextEligible = shouldLoadLandingVideo({
        reducedMotion: motionQuery.matches,
        reducedData: dataQuery.matches,
        saveData: connection?.saveData ?? false,
        effectiveType: connection?.effectiveType,
      });
      setEligible(nextEligible);
      onScrubAvailabilityChange(nextEligible);
      if (!nextEligible) {
        setMediaReady(false);
        setVideoVisible(false);
        videoVisibleRef.current = false;
      }
    };
    const onChange = syncEligibility as EventListener;
    const addQueryListener = (query: MediaQueryList) => {
      const legacyQuery = query as MediaQueryList & {
        addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      };
      if (typeof legacyQuery.addEventListener === "function") {
        legacyQuery.addEventListener("change", syncEligibility);
      } else {
        legacyQuery.addListener?.(syncEligibility);
      }
    };
    const removeQueryListener = (query: MediaQueryList) => {
      const legacyQuery = query as MediaQueryList & {
        removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      };
      if (typeof legacyQuery.removeEventListener === "function") {
        legacyQuery.removeEventListener("change", syncEligibility);
      } else {
        legacyQuery.removeListener?.(syncEligibility);
      }
    };

    syncEligibility();
    addQueryListener(motionQuery);
    addQueryListener(dataQuery);
    connection?.addEventListener?.("change", onChange);
    return () => {
      removeQueryListener(motionQuery);
      removeQueryListener(dataQuery);
      connection?.removeEventListener?.("change", onChange);
    };
  }, [onScrubAvailabilityChange]);

  useEffect(() => {
    const video = videoRef.current;
    const sequence = sequenceRef.current;
    const stage = sequence?.querySelector<HTMLElement>(".landing-hero");
    const resetStage = () => {
      stage?.style.removeProperty("--hero-progress");
      stage?.style.removeProperty("--hero-media-x");
      stage?.style.removeProperty("--hero-plane-shift");
      stage?.style.removeProperty("--hero-plane-shift-reverse");
      stage?.style.removeProperty("--hero-plane-shift-soft");
      stage?.style.removeProperty("--hero-copy-lift");
      stage?.style.removeProperty("--hero-copy-opacity");
      stage?.style.removeProperty("--hero-media-shift");
    };
    if (!sequence || !stage) {
      resetStage();
      onScrubAvailabilityChange(false);
      return;
    }
    if (!eligible) {
      resetStage();
      return;
    }
    if (sourceFailed) {
      resetStage();
      const rect = sequence.getBoundingClientRect();
      const sequenceTop = rect.top + window.scrollY;
      const preserveEnteredRunway = window.scrollY > sequenceTop + 1 && rect.bottom > 0;
      onScrubAvailabilityChange(preserveEnteredRunway);
      if (!preserveEnteredRunway) return;

      let releaseFrame = 0;
      let released = false;
      const releaseRunway = () => {
        releaseFrame = 0;
        if (released) return;

        const currentRect = sequence.getBoundingClientRect();
        const currentTop = currentRect.top + window.scrollY;
        const exitedAbove = window.scrollY <= currentTop + 1;
        const exitedBelow = currentRect.bottom <= 0;
        if (!exitedAbove && !exitedBelow) return;

        released = true;
        const nextSection = exitedBelow
          ? sequence.nextElementSibling as HTMLElement | null
          : null;
        const nextSectionTop = nextSection?.getBoundingClientRect().top;
        const scrollYAtCollapse = window.scrollY;
        onScrubAvailabilityChange(false);

        if (nextSection && nextSectionTop !== undefined) {
          window.requestAnimationFrame(() => {
            if (!nextSection.isConnected) return;
            if (Math.abs(window.scrollY - scrollYAtCollapse) > 1) return;
            const layoutShift = nextSection.getBoundingClientRect().top - nextSectionTop;
            if (Math.abs(layoutShift) > 0.5) {
              window.scrollBy({ top: layoutShift, left: 0, behavior: "auto" });
            }
          });
        }
      };
      const scheduleRelease = () => {
        if (releaseFrame || released) return;
        releaseFrame = window.requestAnimationFrame(releaseRunway);
      };

      window.addEventListener("scroll", scheduleRelease, { passive: true });
      window.addEventListener("resize", scheduleRelease);
      window.addEventListener("orientationchange", scheduleRelease);
      window.addEventListener("pageshow", scheduleRelease);
      scheduleRelease();

      return () => {
        window.cancelAnimationFrame(releaseFrame);
        window.removeEventListener("scroll", scheduleRelease);
        window.removeEventListener("resize", scheduleRelease);
        window.removeEventListener("orientationchange", scheduleRelease);
        window.removeEventListener("pageshow", scheduleRelease);
      };
    }
    onScrubAvailabilityChange(true);
    if (!video) {
      resetStage();
      return;
    }
    if (!mediaReady) return;

    video.pause();

    let frame = 0;
    let sequenceTop = 0;
    let sequenceHeight = 0;
    let stageHeight = 0;
    let waitingForFrame = false;
    let videoFrameCallback = 0;
    let fallbackRevealFrame = 0;
    let inViewport = true;
    let lastProgress = Number.NaN;
    const renderAwareVideo = video as HTMLVideoElement & {
      cancelVideoFrameCallback?: (handle: number) => void;
      requestVideoFrameCallback?: (callback: () => void) => number;
    };

    const revealRenderedFrame = () => {
      if (waitingForFrame) return;
      waitingForFrame = true;
      const reveal = () => {
        videoFrameCallback = 0;
        fallbackRevealFrame = 0;
        waitingForFrame = false;
        videoVisibleRef.current = true;
        setVideoVisible(true);
      };
      if (typeof renderAwareVideo.requestVideoFrameCallback === "function") {
        videoFrameCallback = renderAwareVideo.requestVideoFrameCallback(reveal);
      } else {
        fallbackRevealFrame = window.requestAnimationFrame(reveal);
      }
    };

    const refreshGeometry = () => {
      const rect = sequence.getBoundingClientRect();
      sequenceTop = rect.top + window.scrollY;
      sequenceHeight = sequence.offsetHeight;
      stageHeight = stage.offsetHeight;
      lastProgress = Number.NaN;
    };

    const applyScrollFrame = () => {
      frame = 0;
      if (document.hidden || !inViewport) return;

      const progress = getLandingScrollProgress({
        scrollY: window.scrollY,
        sequenceTop,
        sequenceHeight,
        viewportHeight: stageHeight,
      });
      const targetTime = getLandingVideoTime(progress, video.duration);
      latestTargetRef.current = targetTime;
      const seekEpsilon = 1 / (LANDING_VIDEO_FPS * 2);
      const progressUnchanged = Number.isFinite(lastProgress)
        && Math.abs(progress - lastProgress) < 0.0001;
      if (
        progressUnchanged
        && !video.seeking
        && Math.abs(video.currentTime - targetTime) < seekEpsilon
      ) {
        return;
      }
      lastProgress = progress;

      const mobileMediaX = 88 - progress * 46;
      stage.style.setProperty("--hero-progress", progress.toFixed(4));
      stage.style.setProperty("--hero-media-x", `${window.innerWidth <= 800 ? mobileMediaX : 50}%`);
      stage.style.setProperty(
        "--hero-media-shift",
        `${window.innerWidth <= 800 ? 0 : 260 - progress * 150}px`,
      );
      stage.style.setProperty("--hero-plane-shift", `${(progress - 0.5) * 18}px`);
      stage.style.setProperty("--hero-plane-shift-reverse", `${(0.5 - progress) * 12.6}px`);
      stage.style.setProperty("--hero-plane-shift-soft", `${(progress - 0.5) * 9.9}px`);
      stage.style.setProperty("--hero-copy-lift", `${progress * -24}px`);
      stage.style.setProperty("--hero-copy-opacity", String(Math.max(0.72, 1 - progress * 0.28)));

      if (video.seeking) return;
      if (Math.abs(video.currentTime - targetTime) >= seekEpsilon) {
        video.currentTime = targetTime;
      } else if (!videoVisibleRef.current) {
        revealRenderedFrame();
      }
    };

    const scheduleScrollFrame = () => {
      if (frame || document.hidden || !inViewport) return;
      frame = window.requestAnimationFrame(applyScrollFrame);
    };

    const syncGeometry = () => {
      refreshGeometry();
      scheduleScrollFrame();
    };

    const onSeeked = () => {
      const seekEpsilon = 1 / (LANDING_VIDEO_FPS * 2);
      if (Math.abs(video.currentTime - latestTargetRef.current) >= seekEpsilon) {
        scheduleScrollFrame();
      } else if (!videoVisibleRef.current) {
        revealRenderedFrame();
      }
    };

    const onVisibility = () => {
      if (!document.hidden) syncGeometry();
    };

    const resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(syncGeometry)
      : null;
    const intersectionObserver = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
        inViewport = entry?.isIntersecting ?? true;
        if (inViewport) syncGeometry();
      }, { threshold: 0 })
      : null;

    refreshGeometry();
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("scroll", scheduleScrollFrame, { passive: true });
    window.addEventListener("resize", syncGeometry);
    window.addEventListener("orientationchange", syncGeometry);
    window.addEventListener("pageshow", syncGeometry);
    document.addEventListener("visibilitychange", onVisibility);
    resizeObserver?.observe(sequence);
    intersectionObserver?.observe(sequence);
    scheduleScrollFrame();

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(fallbackRevealFrame);
      if (videoFrameCallback && typeof renderAwareVideo.cancelVideoFrameCallback === "function") {
        renderAwareVideo.cancelVideoFrameCallback(videoFrameCallback);
      }
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("scroll", scheduleScrollFrame);
      window.removeEventListener("resize", syncGeometry);
      window.removeEventListener("orientationchange", syncGeometry);
      window.removeEventListener("pageshow", syncGeometry);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [
    eligible,
    mediaReady,
    onScrubAvailabilityChange,
    sequenceRef,
    sourceFailed,
  ]);

  const poster = "/images/psyche-hero-cinematic-v2.webp";
  const loadVideo = eligible && !sourceFailed;

  return (
    <>
      <div
        className={videoVisible ? "landing-hero-photo has-motion" : "landing-hero-photo"}
        ref={mediaRef}
        aria-hidden="true"
      >
        <img
          className={videoVisible ? "landing-hero-poster is-obscured" : "landing-hero-poster"}
          src={poster}
          width="1920"
          height="1080"
          loading="eager"
          decoding="async"
          alt=""
        />
        {loadVideo ? (
          <video
            ref={videoRef}
            className={videoVisible ? "landing-hero-video is-visible" : "landing-hero-video"}
            muted
            playsInline
            preload="auto"
            poster={poster}
            disablePictureInPicture
            tabIndex={-1}
            aria-hidden="true"
            onLoadedMetadata={() => {
              videoRef.current?.pause();
              setMediaReady(true);
            }}
            onError={() => {
              setSourceFailed(true);
              setMediaReady(false);
              setVideoVisible(false);
              videoVisibleRef.current = false;
            }}
          >
            <source src="/video/psyche-atlas-personalities-v2.webm" type="video/webm" />
            <source src="/video/psyche-atlas-personalities-v2.mp4" type="video/mp4" />
          </video>
        ) : null}
        <span className="landing-glass-plane plane-one" />
        <span className="landing-glass-plane plane-two" />
        <span className="landing-glass-plane plane-three" />
      </div>
    </>
  );
}

export function Landing({
  onBegin,
  onBrowse,
  onRelationships,
}: {
  onBegin: () => void;
  onBrowse: () => void;
  onRelationships: () => void;
}) {
  const { locale } = useI18n();
  const copy = COPY[toLoc(locale)];
  const experienceCount = String(INSTRUMENTS.length);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [scrubAvailable, setScrubAvailable] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <button className="landing-brand" type="button" onClick={() => scrollTo("landing-top")} aria-label="Psyche Atlas">
          <span className="landing-brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Psyche <b>Atlas</b></span>
        </button>
        <nav className="landing-navlinks" aria-label={copy.nav.method}>
          <button type="button" onClick={() => scrollTo("landing-experiences")}>{copy.nav.experiences}</button>
          <button type="button" onClick={() => scrollTo("landing-method")}>{copy.nav.method}</button>
          <button type="button" onClick={() => scrollTo("landing-privacy")}>{copy.nav.privacy}</button>
        </nav>
        <div className="landing-navtools">
          <LanguageSwitcher />
          <ThemeToggle locale={locale} />
          <button className="landing-nav-cta" type="button" onClick={onBegin}>{copy.nav.enter}</button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <div
          className={scrubAvailable
            ? "landing-hero-sequence is-scrubbable"
            : "landing-hero-sequence is-static"}
          id="landing-top"
          ref={sequenceRef}
        >
          <section className="landing-hero">
            <CinematicHeroMedia
              sequenceRef={sequenceRef}
              onScrubAvailabilityChange={setScrubAvailable}
            />
            <AtlasField paused />
            <div className="landing-hero-vignette" aria-hidden="true" />
            <div className="landing-hero-copy">
              <span className="landing-kicker"><i />{copy.hero.eyebrow}</span>
              <h1>
                {copy.hero.title} <em>{copy.hero.accent}</em>
              </h1>
              <p>{copy.hero.body}</p>
              <div className="landing-actions">
                <button className="landing-button landing-button-primary" type="button" onClick={onBegin}>
                  <span>{copy.hero.begin}</span><i aria-hidden="true">↗</i>
                </button>
                <button className="landing-button landing-button-ghost" type="button" onClick={onBrowse}>
                  {copy.hero.browse}
                </button>
              </div>
              <dl className="landing-stats">
                {copy.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.value.replace("{n}", experienceCount)}</dt>
                    <dd>{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="landing-scroll-progress" aria-hidden="true">
              <span />
            </div>
            <button className="landing-scroll-cue" type="button" onClick={() => scrollTo("landing-method")}>
              <span>{copy.hero.scroll}</span><i aria-hidden="true" />
            </button>
          </section>
        </div>

        <section className="landing-thesis" id="landing-method">
          <div className="landing-section-intro">
            <span className="landing-kicker"><i />{copy.thesis.eyebrow}</span>
            <h2>{copy.thesis.title}</h2>
            <p>{copy.thesis.body}</p>
          </div>
          <div className="landing-chapters">
            {copy.chapters.map((chapter, index) => (
              <article className="landing-chapter" key={chapter.number}>
                <div className="landing-chapter-media">
                  <img
                    src={CHAPTER_IMAGES[index]}
                    width="1536"
                    height="1024"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    alt={chapter.imageAlt}
                  />
                  <span aria-hidden="true">{chapter.number}</span>
                </div>
                <div className="landing-chapter-copy">
                  <span>{chapter.eyebrow}</span>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-experiences" id="landing-experiences">
          <div className="landing-section-intro landing-section-intro-light">
            <span className="landing-kicker"><i />{copy.experiences.eyebrow}</span>
            <h2>{copy.experiences.title}</h2>
            <p>{copy.experiences.body}</p>
          </div>
          <div className="landing-experience-grid">
            {copy.experiences.cards.map((card, index) => (
              <article className={`landing-experience-card experience-${index + 1}`} key={card.number}>
                <img
                  src={EXPERIENCE_IMAGES[index]}
                  width="1536"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                  alt={card.imageAlt}
                />
                <div className="landing-experience-shade" aria-hidden="true" />
                <span className="landing-experience-number">{card.number}</span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-connection">
          <img
            src="/images/psyche-connection.webp"
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
            alt={copy.connection.imageAlt}
          />
          <div className="landing-connection-overlay" aria-hidden="true" />
          <div className="landing-connection-copy">
            <span className="landing-kicker"><i />{copy.connection.eyebrow}</span>
            <h2>{copy.connection.title}</h2>
            <p>{copy.connection.body}</p>
            <button className="landing-button landing-button-glass" type="button" onClick={onRelationships}>
              {copy.connection.action}<i aria-hidden="true">↗</i>
            </button>
          </div>
        </section>

        <section className="landing-trust" id="landing-privacy">
          <div className="landing-trust-head">
            <span className="landing-kicker"><i />{copy.trust.eyebrow}</span>
            <h2>{copy.trust.title}</h2>
            <p>{copy.trust.body}</p>
          </div>
          <div className="landing-trust-grid">
            {copy.trust.points.map((point, index) => (
              <article key={point.title}>
                <span aria-hidden="true">0{index + 1}</span>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-closing">
          <div className="landing-closing-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="landing-kicker"><i />{copy.closing.eyebrow}</span>
          <h2>{copy.closing.title}</h2>
          <p>{copy.closing.body}</p>
          <div className="landing-actions">
            <button className="landing-button landing-button-primary" type="button" onClick={onBegin}>
              <span>{copy.closing.begin}</span><i aria-hidden="true">↗</i>
            </button>
            <button className="landing-button landing-button-ghost" type="button" onClick={onBrowse}>
              {copy.closing.browse}
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-brand" aria-hidden="true">
          <span className="landing-brand-mark"><span /><span /><span /></span>
          <span>Psyche <b>Atlas</b></span>
        </div>
        <p>{copy.footer}</p>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
