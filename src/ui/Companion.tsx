import { useEffect, useId, useRef, useState } from "react";
import { askCompanion, suggestedQuestions, type CompanionKnowledge } from "@core/companion";
import { askAtlasRemote } from "../atlas";
import { useI18n } from "../i18n";

interface Msg {
  role: "user" | "atlas";
  text: string;
}

type CLoc = "en" | "es" | "fr";
interface CompanionStrings {
  ask: string;
  whole: string;
  result: string;
  about: string;
  introNamed: (n: string, a: string) => string;
  introAnon: (a: string) => string;
  placeholder: string;
  askBtn: string;
  localMode: string;
  externalMode: string;
  localPrivacy: string;
  externalPrivacy: string;
  localStatus: string;
  sendingStatus: string;
  externalStatus: string;
  fallbackStatus: string;
}

const CMP: Record<CLoc, CompanionStrings> = {
  en: {
    ask: "Ask Atlas", whole: "the whole you", result: "this result", about: "· about ",
    introNamed: (n, a) => `Hi ${n} — I'm Atlas. Ask me anything about ${a}.`,
    introAnon: (a) => `I'm Atlas. Ask me anything about ${a}.`,
    placeholder: "Ask anything about yourself…", askBtn: "Ask",
    localMode: "On-device", externalMode: "External AI (optional)",
    localPrivacy: "Default: a deterministic answer is created on this device. Nothing is sent.",
    externalPrivacy: "If you ask in External AI mode, only the question you typed is sent to the configured AI service. Your profile, results, and item answers stay on this device.",
    localStatus: "Answered on this device.", sendingStatus: "Sending only after your request…",
    externalStatus: "Answered by the external AI service.", fallbackStatus: "External AI was unavailable. Atlas used the on-device answer instead.",
  },
  es: {
    ask: "Pregunta a Atlas", whole: "todo tú", result: "este resultado", about: "· sobre ",
    introNamed: (n, a) => `Hola ${n}, soy Atlas. Pregúntame lo que quieras sobre ${a}.`,
    introAnon: (a) => `Soy Atlas. Pregúntame lo que quieras sobre ${a}.`,
    placeholder: "Pregunta lo que quieras sobre ti…", askBtn: "Preguntar",
    localMode: "En este dispositivo", externalMode: "IA externa (opcional)",
    localPrivacy: "Predeterminado: se crea una respuesta determinista en este dispositivo. No se envía nada.",
    externalPrivacy: "Si preguntas en modo IA externa, solo se envía al servicio configurado la pregunta que escribiste. Tu perfil, resultados y respuestas permanecen en este dispositivo.",
    localStatus: "Respondido en este dispositivo.", sendingStatus: "Enviando solo tras tu solicitud…",
    externalStatus: "Respondido por el servicio de IA externa.", fallbackStatus: "La IA externa no estaba disponible. Atlas usó la respuesta del dispositivo.",
  },
  fr: {
    ask: "Demandez à Atlas", whole: "tout vous", result: "ce résultat", about: "· à propos de ",
    introNamed: (n, a) => `Bonjour ${n}, je suis Atlas. Demandez-moi tout sur ${a}.`,
    introAnon: (a) => `Je suis Atlas. Demandez-moi tout sur ${a}.`,
    placeholder: "Demandez ce que vous voulez sur vous…", askBtn: "Demander",
    localMode: "Sur cet appareil", externalMode: "IA externe (facultative)",
    localPrivacy: "Par défaut, une réponse déterministe est créée sur cet appareil. Rien n'est envoyé.",
    externalPrivacy: "En mode IA externe, seule la question que vous avez saisie est envoyée au service configuré. Votre profil, vos résultats et vos réponses restent sur cet appareil.",
    localStatus: "Réponse créée sur cet appareil.", sendingStatus: "Envoi uniquement après votre demande…",
    externalStatus: "Réponse du service d'IA externe.", fallbackStatus: "L'IA externe était indisponible. Atlas a utilisé la réponse locale.",
  },
};

export function Companion({ knowledge }: { knowledge: CompanionKnowledge }) {
  const { locale } = useI18n();
  const L: CLoc = locale === "es" || locale === "fr" ? locale : "en";
  const s = CMP[L];
  const about = knowledge.kind === "integrated" ? s.whole : s.result;
  const intro = knowledge.name ? s.introNamed(knowledge.name, about) : s.introAnon(about);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "atlas", text: intro }]);
  const [input, setInput] = useState("");
  const [chips, setChips] = useState<string[]>(() => suggestedQuestions(knowledge, locale));
  const [thinking, setThinking] = useState(false);
  const [externalEnabled, setExternalEnabled] = useState(false);
  const [status, setStatus] = useState(s.localStatus);
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const privacyId = useId();

  useEffect(() => {
    if (started.current) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    started.current = true;
  }, [msgs, thinking]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setThinking(true);
    const det = askCompanion(knowledge, q, undefined, locale);
    setStatus(externalEnabled ? s.sendingStatus : s.localStatus);
    // External AI is never contacted unless the person explicitly selected it.
    const remote = externalEnabled
      ? await askAtlasRemote(knowledge, q, {
          consented: true,
          locale: L,
        })
      : null;
    setMsgs((m) => [...m, { role: "atlas", text: remote ?? det.text }]);
    setChips(det.followups);
    setStatus(externalEnabled ? (remote ? s.externalStatus : s.fallbackStatus) : s.localStatus);
    setThinking(false);
  };

  return (
    <div className="companion">
      <div className="cmp-head">
        <span className="cmp-dot" /> {s.ask}
        <span className="cmp-sub">{s.about}{about}</span>
      </div>
      <fieldset className="cmp-mode" aria-describedby={privacyId}>
        <legend className="sr-only">{s.ask}</legend>
        <label>
          <input
            type="radio"
            name={`atlas-mode-${privacyId}`}
            checked={!externalEnabled}
            onChange={() => { setExternalEnabled(false); setStatus(s.localStatus); }}
          />
          <span>{s.localMode}</span>
        </label>
        <label>
          <input
            type="radio"
            name={`atlas-mode-${privacyId}`}
            checked={externalEnabled}
            onChange={() => setExternalEnabled(true)}
          />
          <span>{s.externalMode}</span>
        </label>
      </fieldset>
      <p className={`cmp-privacy${externalEnabled ? " external" : ""}`} id={privacyId}>
        {externalEnabled ? s.externalPrivacy : s.localPrivacy}
      </p>
      <div className="cmp-thread">
        {msgs.map((m, i) => (
          <div key={i} className={`cmp-msg ${m.role}`}>
            {m.text.split("\n").map((line, j) =>
              line.trim() ? (
                <p key={j} style={{ margin: line.trim().startsWith("•") ? "3px 0" : "0 0 5px" }}>{line}</p>
              ) : null,
            )}
          </div>
        ))}
        {thinking && (
          <div className="cmp-msg atlas typing">
            <span /><span /><span />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <p className="cmp-status" role="status" aria-live="polite">{status}</p>
      {chips.length > 0 && !thinking && (
        <div className="cmp-chips">
          {chips.map((c, i) => (
            <button key={i} onClick={() => send(c)}>{c}</button>
          ))}
        </div>
      )}
      <div className="cmp-input">
        <input
          placeholder={s.placeholder}
          value={input}
          disabled={thinking}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
        />
        <button className="btn primary" onClick={() => send(input)} disabled={!input.trim() || thinking}>{s.askBtn}</button>
      </div>
    </div>
  );
}
