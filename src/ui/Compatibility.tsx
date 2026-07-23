import { useMemo, useState, type CSSProperties } from "react";
import type { AssessmentResult, Instrument } from "@core/types";
import { INSTRUMENTS } from "@core/instruments";
import {
  computeCompatibility,
  decodeSummary,
  encodeSummary,
  toSummary,
  type CompatibilityReport,
} from "@core/compatibility";
import { useI18n } from "../i18n";
import { toLoc, type Loc } from "./goals";

interface ConnectionCopy {
  eyebrow: string;
  title: string;
  intro: string;
  noResult: string;
  choose: string;
  take: string;
  back: string;
  yourCode: string;
  codeBody: string;
  disclosure: string;
  copy: string;
  copied: string;
  theirCode: string;
  paste: string;
  compare: string;
  invalid: string;
  different: string;
  dimensions: string;
  you: string;
  them: string;
  close: string;
  some: string;
  wide: string;
  common: string;
  differences: string;
  prompts: string;
  guardrails: string;
  responsibility: string;
}

const COPY: Record<Loc, ConnectionCopy> = {
  en: {
    eyebrow: "Connection Map",
    title: "See two perspectives, dimension by dimension",
    intro: "Compare two results from the same activity. There is no compatibility score: alignment and difference can both be useful depending on the situation.",
    noResult: "Complete a reflection activity first. Then exchange codes with another person who completed the same one.",
    choose: "Good activities for a shared conversation",
    take: "Take",
    back: "Back to Groups",
    yourCode: "1 · Share your result code",
    codeBody: "The code contains the activity ID and your dimension scores—not your item-by-item answers.",
    disclosure: "Encoded, not encrypted: the code is made portable, not secret. Anyone who receives it can decode the score summary. Share it only with someone you trust.",
    copy: "Copy code",
    copied: "Copied",
    theirCode: "2 · Add the other person’s code",
    paste: "Paste their complete code",
    compare: "Build Connection Map",
    invalid: "That code could not be read. Check that the complete code was pasted.",
    different: "That code is from a different activity. Both people need results from {name}.",
    dimensions: "Dimension-by-dimension observations",
    you: "You",
    them: "Other person",
    close: "Closer positions",
    some: "Some difference",
    wide: "Wider difference",
    common: "Shared ground to discuss",
    differences: "Differences to stay curious about",
    prompts: "Conversation starters",
    guardrails: "How to read this responsibly",
    responsibility: "This is a non-diagnostic conversation aid, not a judgment about a relationship, team, or either person. Context, consent, culture, and changing circumstances matter.",
  },
  es: {
    eyebrow: "Mapa de conexión",
    title: "Mira dos perspectivas, dimensión por dimensión",
    intro: "Compara dos resultados de la misma actividad. No hay puntuación de compatibilidad: la coincidencia y la diferencia pueden ser útiles según la situación.",
    noResult: "Completa primero una actividad de reflexión. Después intercambia códigos con otra persona que haya hecho la misma.",
    choose: "Buenas actividades para conversar",
    take: "Hacer",
    back: "Volver a Grupos",
    yourCode: "1 · Comparte tu código de resultado",
    codeBody: "El código contiene el ID de la actividad y tus puntuaciones por dimensión, no tus respuestas ítem por ítem.",
    disclosure: "Codificado, no cifrado: el código es portátil, no secreto. Quien lo reciba puede decodificar el resumen. Compártelo solo con alguien de confianza.",
    copy: "Copiar código",
    copied: "Copiado",
    theirCode: "2 · Añade el código de la otra persona",
    paste: "Pega su código completo",
    compare: "Crear mapa de conexión",
    invalid: "No se pudo leer el código. Comprueba que esté completo.",
    different: "Ese código pertenece a otra actividad. Ambas personas necesitan resultados de {name}.",
    dimensions: "Observaciones dimensión por dimensión",
    you: "Tú",
    them: "Otra persona",
    close: "Posiciones cercanas",
    some: "Alguna diferencia",
    wide: "Diferencia más amplia",
    common: "Puntos en común para conversar",
    differences: "Diferencias para explorar con curiosidad",
    prompts: "Preguntas para conversar",
    guardrails: "Cómo leerlo con responsabilidad",
    responsibility: "Es una ayuda no diagnóstica para conversar, no un juicio sobre una relación, un equipo o una persona. Importan el contexto, el consentimiento, la cultura y los cambios.",
  },
  fr: {
    eyebrow: "Carte de connexion",
    title: "Deux perspectives, dimension par dimension",
    intro: "Comparez deux résultats de la même activité. Il n’y a pas de score de compatibilité : proximité et différence peuvent être utiles selon le contexte.",
    noResult: "Terminez d’abord une activité de réflexion, puis échangez un code avec une personne ayant fait la même activité.",
    choose: "Des activités propices au dialogue",
    take: "Faire",
    back: "Retour aux Groupes",
    yourCode: "1 · Partagez votre code de résultat",
    codeBody: "Le code contient l’identifiant de l’activité et vos scores par dimension, pas vos réponses item par item.",
    disclosure: "Encodé, pas chiffré : le code est transportable, pas secret. Toute personne qui le reçoit peut décoder le résumé. Ne le partagez qu’avec une personne de confiance.",
    copy: "Copier le code",
    copied: "Copié",
    theirCode: "2 · Ajoutez le code de l’autre personne",
    paste: "Collez son code complet",
    compare: "Créer la carte",
    invalid: "Ce code n’a pas pu être lu. Vérifiez qu’il est complet.",
    different: "Ce code vient d’une autre activité. Les deux personnes doivent avoir un résultat de {name}.",
    dimensions: "Observations dimension par dimension",
    you: "Vous",
    them: "Autre personne",
    close: "Positions proches",
    some: "Une certaine différence",
    wide: "Différence plus large",
    common: "Points communs à discuter",
    differences: "Différences à explorer avec curiosité",
    prompts: "Amorces de conversation",
    guardrails: "Lire cette carte avec recul",
    responsibility: "C’est un support de conversation non diagnostique, pas un jugement sur une relation, une équipe ou une personne. Le contexte, le consentement, la culture et l’évolution de la situation comptent.",
  },
};

export function Compatibility({
  instrument,
  result,
  onStart,
  onBack,
}: {
  instrument: Instrument | null;
  result: AssessmentResult | null;
  onStart: (inst: Instrument) => void;
  onBack: () => void;
}) {
  const { locale } = useI18n();
  const s = COPY[toLoc(locale)];
  const myCode = useMemo(
    () => (instrument && result ? encodeSummary(toSummary(instrument, result)) : ""),
    [instrument, result],
  );
  const [partner, setPartner] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(myCode).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  };

  const compare = () => {
    setError(null);
    setReport(null);
    if (!instrument || !result) return;
    const them = decodeSummary(partner.trim());
    if (!them) {
      setError(s.invalid);
      return;
    }
    if (them.instrumentId !== instrument.id) {
      setError(s.different.replace("{name}", instrument.name));
      return;
    }
    setReport(computeCompatibility(instrument, toSummary(instrument, result), them, { locale }));
  };

  if (!instrument || !result) {
    const suggested = INSTRUMENTS.filter((candidate) =>
      ["relationships", "communication", "core", "emotional"].includes(candidate.category),
    );
    return (
      <div className="container workspace-page view-enter">
        <header className="workspace-page-head connection-head">
          <span className="eyebrow2">{s.eyebrow}</span>
          <h1>{s.title}</h1>
          <p>{s.intro}</p>
        </header>
        <section className="panel">
          <p className="connection-empty">{s.noResult}</p>
          <h2 className="section-title">{s.choose}</h2>
          <div className="workspace-card-row connection-suggestions">
            {suggested.slice(0, 6).map((candidate) => (
              <article className="workspace-journey-card" key={candidate.id}>
                <span className="kind">{candidate.kind === "typological" ? "Typology" : "Dimensional"}</span>
                <h3>{candidate.name}</h3>
                <p>{candidate.tagline}</p>
                <button className="btn primary sm" onClick={() => onStart(candidate)}>{s.take} {candidate.shortName}</button>
              </article>
            ))}
          </div>
          <div className="row-actions"><button className="btn ghost" onClick={onBack}>← {s.back}</button></div>
        </section>
      </div>
    );
  }

  return (
    <div className="container workspace-page view-enter">
      <header className="workspace-page-head connection-head">
        <span className="eyebrow2">{instrument.name} · {s.eyebrow}</span>
        <h1>{s.title}</h1>
        <p>{s.intro}</p>
      </header>

      <div className="connection-layout">
        <section className="panel connection-share" aria-labelledby="connection-share-title">
          <h2 id="connection-share-title">{s.yourCode}</h2>
          <p>{s.codeBody}</p>
          <p className="workspace-disclosure"><strong>{s.disclosure}</strong></p>
          <div className="code-box">
            <code>{myCode}</code>
            <button className="btn sm" onClick={copy}>{copied ? `✓ ${s.copied}` : s.copy}</button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">{copied ? s.copied : ""}</p>

          <label className="set-label" htmlFor="connection-partner-code">{s.theirCode}</label>
          <textarea
            id="connection-partner-code"
            className="code-input"
            placeholder={s.paste}
            value={partner}
            onChange={(event) => setPartner(event.target.value)}
            aria-describedby={error ? "connection-code-error" : undefined}
          />
          <div className="row-actions connection-actions">
            <button className="btn primary" disabled={!partner.trim()} onClick={compare}>{s.compare}</button>
            <button className="btn ghost" onClick={onBack}>← {s.back}</button>
          </div>
          {error && <p className="note" id="connection-code-error" role="alert">{error}</p>}
        </section>

        {report && (
          <div className="connection-report" aria-live="polite">
            <section className="panel connection-summary">
              <span className="eyebrow2">{s.eyebrow}</span>
              <h2>{report.headline}</h2>
              {report.summary.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>

            <section className="panel">
              <h2>{s.dimensions}</h2>
              <div className="connection-dimensions">
                {report.dimensions.map((dimension) => {
                  const label = dimension.comparison === "closely-aligned"
                    ? s.close
                    : dimension.comparison === "wide-difference"
                      ? s.wide
                      : s.some;
                  return (
                    <article className="connection-dimension" key={dimension.id}>
                      <div className="connection-dimension-head">
                        <h3>{dimension.name}</h3>
                        <span className={`connection-comparison ${dimension.comparison}`}>{label}</span>
                      </div>
                      <div
                        className="connection-track"
                        style={{
                          "--you": `${dimension.you}%`,
                          "--them": `${dimension.them}%`,
                        } as CSSProperties}
                        aria-label={`${s.you}: ${dimension.you}; ${s.them}: ${dimension.them}`}
                      >
                        <span className="connection-marker you"><i />{s.you}</span>
                        <span className="connection-marker them"><i />{s.them}</span>
                      </div>
                      <p>{dimension.note}</p>
                      {dimension.guardrail && <p className="connection-guardrail">{dimension.guardrail}</p>}
                    </article>
                  );
                })}
              </div>
            </section>

            <ConnectionList title={s.common} items={report.sharedGround} tone="good" />
            <ConnectionList title={s.differences} items={report.differences} tone="curious" />
            <ConnectionList title={s.prompts} items={report.conversationStarters} tone="prompt" />
            <ConnectionList title={s.guardrails} items={[...report.guardrails, s.responsibility]} tone="guardrail" />
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "curious" | "prompt" | "guardrail";
}) {
  if (!items.length) return null;
  return (
    <section className={`panel connection-list ${tone}`}>
      <h2>{title}</h2>
      <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </section>
  );
}
