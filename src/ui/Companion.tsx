import { useEffect, useRef, useState } from "react";
import { askCompanion, suggestedQuestions, type CompanionKnowledge } from "@core/companion";
import { askAtlasRemote } from "../atlas";
import { useI18n } from "../i18n";

interface Msg {
  role: "user" | "atlas";
  text: string;
}

type CLoc = "en" | "es" | "fr";
const CMP: Record<CLoc, { ask: string; whole: string; result: string; about: string; introNamed: (n: string, a: string) => string; introAnon: (a: string) => string; placeholder: string; askBtn: string }> = {
  en: { ask: "Ask Atlas", whole: "the whole you", result: "this result", about: "· about ", introNamed: (n, a) => `Hi ${n} — I'm Atlas. Ask me anything about ${a}.`, introAnon: (a) => `I'm Atlas. Ask me anything about ${a}.`, placeholder: "Ask anything about yourself…", askBtn: "Ask" },
  es: { ask: "Pregunta a Atlas", whole: "todo tú", result: "este resultado", about: "· sobre ", introNamed: (n, a) => `Hola ${n}, soy Atlas. Pregúntame lo que quieras sobre ${a}.`, introAnon: (a) => `Soy Atlas. Pregúntame lo que quieras sobre ${a}.`, placeholder: "Pregunta lo que quieras sobre ti…", askBtn: "Preguntar" },
  fr: { ask: "Demandez à Atlas", whole: "tout vous", result: "ce résultat", about: "· à propos de ", introNamed: (n, a) => `Bonjour ${n}, je suis Atlas. Demandez-moi tout sur ${a}.`, introAnon: (a) => `Je suis Atlas. Demandez-moi tout sur ${a}.`, placeholder: "Demandez ce que vous voulez sur vous…", askBtn: "Demander" },
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
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

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
    const remote = await askAtlasRemote(knowledge, q); // null unless an LLM key is configured
    setMsgs((m) => [...m, { role: "atlas", text: remote ?? det.text }]);
    setChips(det.followups);
    setThinking(false);
  };

  return (
    <div className="companion">
      <div className="cmp-head">
        <span className="cmp-dot" /> {s.ask}
        <span className="cmp-sub">{s.about}{about}</span>
      </div>
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
