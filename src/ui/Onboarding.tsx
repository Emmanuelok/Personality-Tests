import { useMemo, useState } from "react";
import { buildRoadmap } from "@core/roadmap";
import { GOALS, toLoc, type Loc } from "./goals";
import { useI18n } from "../i18n";

/**
 * Goal-based onboarding wizard.
 *
 * Three quick steps — name, goals, and a live preview of the personalized
 * roadmap those goals generate — so a new visitor's very first moment already
 * feels built around them. Localized in place (en/es/fr).
 */

const lc = toLoc;

const S: Record<Loc, Record<string, string>> = {
  en: {
    welcome: "Welcome to Psyche Atlas", t1: "Let's make this", t1g: "about you", sub: "Reports that speak to you by name. A space that remembers your journey.",
    nameLabel: "First — what should we call you?", namePh: "Your first name", next: "Next →", back: "← Back",
    goalsLabel: "What brings you here?", goalsHint: "Pick any that fit — we'll tailor your path.", seePath: "See my path →",
    pathTitle: "here's your roadmap", pathTitleNoName: "Here's your roadmap",
    pathSub: "A personalized path from your goals. Start anywhere — progress saves as you go.",
    startHere: "Start here", enter: "Enter Psyche Atlas →", skip: "Skip — just let me browse",
    privacy: "🔒 Everything stays on your device. No account, no email, no tracking.", step: "Step {i} of 3", min: "min",
  },
  es: {
    welcome: "Bienvenido a Psyche Atlas", t1: "Hagamos que esto sea", t1g: "sobre ti", sub: "Informes que te hablan por tu nombre. Un espacio que recuerda tu camino.",
    nameLabel: "Primero, ¿cómo te llamamos?", namePh: "Tu nombre", next: "Siguiente →", back: "← Atrás",
    goalsLabel: "¿Qué te trae aquí?", goalsHint: "Elige las que encajen: adaptaremos tu camino.", seePath: "Ver mi camino →",
    pathTitle: "este es tu itinerario", pathTitleNoName: "Este es tu itinerario",
    pathSub: "Un camino personalizado según tus metas. Empieza por donde quieras: el progreso se guarda.",
    startHere: "Empieza aquí", enter: "Entrar en Psyche Atlas →", skip: "Saltar — solo quiero explorar",
    privacy: "🔒 Todo se queda en tu dispositivo. Sin cuenta, sin correo, sin rastreo.", step: "Paso {i} de 3", min: "min",
  },
  fr: {
    welcome: "Bienvenue sur Psyche Atlas", t1: "Faisons en sorte que ce soit", t1g: "à propos de vous", sub: "Des rapports qui vous appellent par votre nom. Un espace qui se souvient de votre parcours.",
    nameLabel: "D'abord — comment vous appelle-t-on ?", namePh: "Votre prénom", next: "Suivant →", back: "← Retour",
    goalsLabel: "Qu'est-ce qui vous amène ?", goalsHint: "Choisissez ce qui vous parle — on adaptera votre parcours.", seePath: "Voir mon parcours →",
    pathTitle: "voici votre feuille de route", pathTitleNoName: "Voici votre feuille de route",
    pathSub: "Un parcours personnalisé selon vos objectifs. Commencez où vous voulez — la progression est sauvegardée.",
    startHere: "Commencez ici", enter: "Entrer dans Psyche Atlas →", skip: "Passer — je veux juste explorer",
    privacy: "🔒 Tout reste sur votre appareil. Aucun compte, aucun e-mail, aucun suivi.", step: "Étape {i} sur 3", min: "min",
  },
};

export function Onboarding({ onDone, onSkip }: { onDone: (name: string, focus: string[]) => void; onSkip?: () => void }) {
  const { locale } = useI18n();
  const L = lc(locale);
  const s = S[L];
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [focus, setFocus] = useState<string[]>([]);

  const labels = useMemo(() => focus.map((k) => GOALS.find((g) => g.key === k)?.label[L] ?? k), [focus, L]);
  const roadmap = useMemo(() => buildRoadmap([], labels, { locale, length: 6 }), [labels, locale]);

  const toggle = (k: string) => setFocus((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));
  const finish = () => onDone(name.trim() || "", labels);

  return (
    <div className="container">
      <div className="onb view-enter">
        <div className="onb-progress" aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} className={i <= step ? "on" : ""} />)}
        </div>
        <div className="onb-step-label">{s.step.replace("{i}", String(step + 1))}</div>

        {step === 0 && (
          <>
            <div className="onb-step-label">{s.welcome}</div>
            <h1>{s.t1} <span className="grad">{s.t1g}</span>.</h1>
            <p className="sub">{s.sub}</p>
            <label className="onb-step-label" style={{ display: "block", marginTop: 10 }}>{s.nameLabel}</label>
            <input
              className="name-input"
              autoFocus
              placeholder={s.namePh}
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep(1); }}
            />
            <button className="btn primary" style={{ fontSize: 16, padding: "14px 30px" }} disabled={!name.trim()} onClick={() => setStep(1)}>
              {s.next}
            </button>
            {onSkip && <p style={{ marginTop: 16 }}><button className="linklike" onClick={onSkip}>{s.skip}</button></p>}
          </>
        )}

        {step === 1 && (
          <>
            <h1>{s.goalsLabel}</h1>
            <p className="sub">{s.goalsHint}</p>
            <div className="chips onb-goals">
              {GOALS.map((g) => (
                <button key={g.key} className={`chip-toggle ${focus.includes(g.key) ? "on" : ""}`} onClick={() => toggle(g.key)}>
                  <span aria-hidden="true" style={{ marginRight: 7 }}>{g.icon}</span>{g.label[L]}
                </button>
              ))}
            </div>
            <div className="row-actions" style={{ justifyContent: "center", marginTop: 26 }}>
              <button className="btn ghost" onClick={() => setStep(0)}>{s.back}</button>
              <button className="btn primary" onClick={() => setStep(2)}>{s.seePath}</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="onb-step-label">{s.welcome}</div>
            <h1>{name.trim() ? <>{name.trim()}, <span className="grad">{s.pathTitle}</span></> : s.pathTitleNoName}</h1>
            <p className="sub">{s.pathSub}</p>
            <ol className="roadmap onb-roadmap">
              {roadmap.steps.map((st, i) => (
                <li key={st.instrumentId} className={`rm-step${i === 0 ? " current" : ""}`}>
                  <span className="rm-node">{i + 1}</span>
                  <div className="rm-body">
                    <div className="rm-name">{st.name} {i === 0 && <span className="rm-badge">{s.startHere}</span>}</div>
                    <div className="rm-reason">{st.reason}</div>
                  </div>
                  <span className="rm-min">{st.estMinutes} {s.min}</span>
                </li>
              ))}
            </ol>
            <div className="row-actions" style={{ justifyContent: "center", marginTop: 8 }}>
              <button className="btn ghost" onClick={() => setStep(1)}>{s.back}</button>
              <button className="btn primary" style={{ fontSize: 16, padding: "14px 30px" }} onClick={finish}>{s.enter}</button>
            </div>
          </>
        )}

        <p className="trust" style={{ marginTop: 18 }}>{s.privacy}</p>
      </div>
    </div>
  );
}
