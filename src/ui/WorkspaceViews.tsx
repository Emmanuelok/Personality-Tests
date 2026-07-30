import type { SynthEntry } from "@core/synthesis";
import { useI18n } from "../i18n";
import { toLoc, type Loc } from "./goals";

interface WorkspaceCopy {
  atlasEyebrow: string;
  atlasTitle: string;
  atlasBody: string;
  evidence: string;
  evidenceEmpty: string;
  evidenceCount: string;
  evidenceCognitive: string;
  focus: string;
  focusEmpty: string;
  portraitTitle: string;
  portraitBody: string;
  portraitAction: string;
  journeyTitle: string;
  journeyBody: string;
  journeyAction: string;
  batteryTitle: string;
  batteryBody: string;
  batteryAction: string;
  exploreAction: string;
  groupsEyebrow: string;
  groupsTitle: string;
  groupsBody: string;
  studyTitle: string;
  studyBody: string;
  studyAction: string;
  mapTitle: string;
  mapBody: string;
  mapAction: string;
  mapNote: string;
}

const COPY: Record<Loc, WorkspaceCopy> = {
  en: {
    atlasEyebrow: "Your evidence, in one place",
    atlasTitle: "My Atlas",
    atlasBody: "See what your completed activities support, where the picture is still light, and which journey to open next.",
    evidence: "Evidence state",
    evidenceEmpty: "No completed activities yet",
    evidenceCount: "{n} reflection assessments",
    evidenceCognitive: "{n} learning activities",
    focus: "Current goals",
    focusEmpty: "Choose goals from Today to shape your path.",
    portraitTitle: "Integrated portrait",
    portraitBody: "Connect themes across your completed reflection assessments, with source evidence kept visible.",
    portraitAction: "Open portrait",
    journeyTitle: "Growth journey",
    journeyBody: "Review your timeline, practices, and changes across repeat activities.",
    journeyAction: "Open journey",
    batteryTitle: "Learning profile",
    batteryBody: "Compare practice dimensions across completed cognitive activities. It is descriptive, not a fixed ability label.",
    batteryAction: "Open learning profile",
    exploreAction: "Explore an activity",
    groupsEyebrow: "Learn with other people",
    groupsTitle: "Groups",
    groupsBody: "Start a shared study path or compare two profiles dimension by dimension. These tools support conversation; they do not judge people.",
    studyTitle: "Study together",
    studyBody: "Create a shared room, choose a topic, and follow progress as a group.",
    studyAction: "Open group study",
    mapTitle: "Connection Map",
    mapBody: "Compare how two people answered the same activity, one dimension at a time—without a compatibility score.",
    mapAction: "Open Connection Map",
    mapNote: "Shared codes are encoded for portability, not encrypted. Anyone with a code can read the score summary it contains.",
  },
  es: {
    atlasEyebrow: "Tu evidencia, en un solo lugar",
    atlasTitle: "Mi Atlas",
    atlasBody: "Mira qué respaldan tus actividades, dónde falta evidencia y qué recorrido abrir después.",
    evidence: "Estado de evidencia",
    evidenceEmpty: "Aún no hay actividades terminadas",
    evidenceCount: "{n} evaluaciones de reflexión",
    evidenceCognitive: "{n} actividades de aprendizaje",
    focus: "Metas actuales",
    focusEmpty: "Elige metas en Hoy para dar forma a tu camino.",
    portraitTitle: "Retrato integrado",
    portraitBody: "Conecta temas entre tus evaluaciones terminadas y mantén visibles las fuentes.",
    portraitAction: "Abrir retrato",
    journeyTitle: "Camino de crecimiento",
    journeyBody: "Revisa tu cronología, prácticas y cambios entre repeticiones.",
    journeyAction: "Abrir camino",
    batteryTitle: "Perfil de aprendizaje",
    batteryBody: "Compara dimensiones de práctica entre actividades cognitivas. Es descriptivo, no una etiqueta fija.",
    batteryAction: "Abrir perfil",
    exploreAction: "Explorar una actividad",
    groupsEyebrow: "Aprende con otras personas",
    groupsTitle: "Grupos",
    groupsBody: "Inicia un estudio compartido o compara dos perfiles dimensión por dimensión. Son apoyos para conversar, no juicios.",
    studyTitle: "Estudiar juntos",
    studyBody: "Crea una sala, elige un tema y sigue el progreso del grupo.",
    studyAction: "Abrir estudio grupal",
    mapTitle: "Mapa de conexión",
    mapBody: "Compara cómo respondieron dos personas a la misma actividad, dimensión por dimensión y sin puntuación de compatibilidad.",
    mapAction: "Abrir mapa de conexión",
    mapNote: "Los códigos están codificados para poder compartirlos, no cifrados. Quien tenga el código puede leer el resumen de puntuaciones.",
  },
  fr: {
    atlasEyebrow: "Vos indices, au même endroit",
    atlasTitle: "Mon Atlas",
    atlasBody: "Voyez ce que vos activités étayent, où les indices restent limités et quel parcours ouvrir ensuite.",
    evidence: "État des indices",
    evidenceEmpty: "Aucune activité terminée",
    evidenceCount: "{n} évaluations de réflexion",
    evidenceCognitive: "{n} activités d’apprentissage",
    focus: "Objectifs actuels",
    focusEmpty: "Choisissez des objectifs dans Aujourd’hui pour orienter votre parcours.",
    portraitTitle: "Portrait intégré",
    portraitBody: "Reliez les thèmes de vos évaluations terminées en gardant les sources visibles.",
    portraitAction: "Ouvrir le portrait",
    journeyTitle: "Parcours de progression",
    journeyBody: "Revoyez votre chronologie, vos pratiques et les changements entre plusieurs passations.",
    journeyAction: "Ouvrir le parcours",
    batteryTitle: "Profil d’apprentissage",
    batteryBody: "Comparez les dimensions de pratique de vos activités cognitives. C’est descriptif, pas une étiquette fixe.",
    batteryAction: "Ouvrir le profil",
    exploreAction: "Explorer une activité",
    groupsEyebrow: "Apprendre avec d’autres",
    groupsTitle: "Groupes",
    groupsBody: "Lancez une étude partagée ou comparez deux profils dimension par dimension. Ces outils ouvrent le dialogue, ils ne jugent pas.",
    studyTitle: "Étudier ensemble",
    studyBody: "Créez une salle, choisissez un thème et suivez la progression du groupe.",
    studyAction: "Ouvrir l’étude en groupe",
    mapTitle: "Carte de connexion",
    mapBody: "Comparez les réponses de deux personnes à la même activité, dimension par dimension et sans score de compatibilité.",
    mapAction: "Ouvrir la carte",
    mapNote: "Les codes sont encodés pour être transportables, pas chiffrés. Toute personne qui possède le code peut lire le résumé des scores.",
  },
};

export function AtlasOverview({
  entries,
  cognitiveCount,
  focus,
  hasBattery,
  onPortrait,
  onJourney,
  onBattery,
  onExplore,
}: {
  entries: SynthEntry[];
  cognitiveCount: number;
  focus: string[];
  hasBattery: boolean;
  onPortrait: () => void;
  onJourney: () => void;
  onBattery: () => void;
  onExplore: () => void;
}) {
  const { locale } = useI18n();
  const s = COPY[toLoc(locale)];
  const hasEvidence = entries.length > 0 || cognitiveCount > 0;

  return (
    <div className="container workspace-page view-enter">
      <section className="workspace-hero atlas-overview-hero">
        <div className="workspace-hero-copy">
          <span className="eyebrow2">{s.atlasEyebrow}</span>
          <h1>{s.atlasTitle}</h1>
          <p>{s.atlasBody}</p>
        </div>
        <img
          src="/images/psyche-reflection.webp"
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
          alt=""
          aria-hidden="true"
        />
      </section>

      <section className="workspace-evidence" aria-labelledby="atlas-evidence-title">
        <div>
          <span className="workspace-stat-label" id="atlas-evidence-title">{s.evidence}</span>
          <strong>{hasEvidence ? s.evidenceCount.replace("{n}", String(entries.length)) : s.evidenceEmpty}</strong>
          <span>{s.evidenceCognitive.replace("{n}", String(cognitiveCount))}</span>
        </div>
        <div>
          <span className="workspace-stat-label">{s.focus}</span>
          <strong>{focus.length ? focus.join(" · ") : s.focusEmpty}</strong>
        </div>
      </section>

      <div className="workspace-card-row" role="list">
        <article className="workspace-journey-card" role="listitem">
          <span className="workspace-card-icon" aria-hidden="true">◈</span>
          <h2>{s.portraitTitle}</h2>
          <p>{s.portraitBody}</p>
          <button className="btn primary sm" onClick={onPortrait} disabled={!entries.length}>{s.portraitAction}</button>
        </article>
        <article className="workspace-journey-card" role="listitem">
          <span className="workspace-card-icon" aria-hidden="true">↗</span>
          <h2>{s.journeyTitle}</h2>
          <p>{s.journeyBody}</p>
          <button className="btn sm" onClick={onJourney}>{s.journeyAction}</button>
        </article>
        <article className="workspace-journey-card" role="listitem">
          <span className="workspace-card-icon" aria-hidden="true">⌁</span>
          <h2>{s.batteryTitle}</h2>
          <p>{s.batteryBody}</p>
          <button className="btn sm" onClick={onBattery} disabled={!hasBattery}>{s.batteryAction}</button>
        </article>
      </div>

      {!hasEvidence && (
        <div className="workspace-empty-action">
          <button className="btn primary" onClick={onExplore}>{s.exploreAction}</button>
        </div>
      )}
    </div>
  );
}

export function GroupsHub({
  onStudy,
  onConnectionMap,
}: {
  onStudy: () => void;
  onConnectionMap: () => void;
}) {
  const { locale } = useI18n();
  const s = COPY[toLoc(locale)];

  return (
    <div className="container workspace-page view-enter">
      <header className="workspace-page-head">
        <span className="eyebrow2">{s.groupsEyebrow}</span>
        <h1>{s.groupsTitle}</h1>
        <p>{s.groupsBody}</p>
      </header>
      <div className="group-paths">
        <article className="group-path-card">
          <img src="/images/psyche-study.webp" width="1536" height="1024" loading="eager" decoding="async" alt="" aria-hidden="true" />
          <div>
            <h2>{s.studyTitle}</h2>
            <p>{s.studyBody}</p>
            <button className="btn primary" onClick={onStudy}>{s.studyAction}</button>
          </div>
        </article>
        <article className="group-path-card">
          <img src="/images/psyche-connection.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="" aria-hidden="true" />
          <div>
            <h2>{s.mapTitle}</h2>
            <p>{s.mapBody}</p>
            <p className="workspace-disclosure">{s.mapNote}</p>
            <button className="btn" onClick={onConnectionMap}>{s.mapAction}</button>
          </div>
        </article>
      </div>
    </div>
  );
}
