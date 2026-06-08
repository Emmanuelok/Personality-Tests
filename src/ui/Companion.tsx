import { useEffect, useRef, useState } from "react";
import { askCompanion, suggestedQuestions, type CompanionKnowledge } from "@core/companion";
import { askAtlasRemote } from "../atlas";

interface Msg {
  role: "user" | "atlas";
  text: string;
}

export function Companion({ knowledge }: { knowledge: CompanionKnowledge }) {
  const intro = knowledge.name
    ? `Hi ${knowledge.name} — I'm Atlas. Ask me anything about ${knowledge.kind === "integrated" ? "the whole you" : "this result"}.`
    : `I'm Atlas. Ask me anything about ${knowledge.kind === "integrated" ? "the whole you" : "this result"}.`;
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "atlas", text: intro }]);
  const [input, setInput] = useState("");
  const [chips, setChips] = useState<string[]>(() => suggestedQuestions(knowledge));
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
    const det = askCompanion(knowledge, q);
    const remote = await askAtlasRemote(knowledge, q); // null unless an LLM key is configured
    setMsgs((m) => [...m, { role: "atlas", text: remote ?? det.text }]);
    setChips(det.followups);
    setThinking(false);
  };

  return (
    <div className="companion">
      <div className="cmp-head">
        <span className="cmp-dot" /> Ask Atlas
        <span className="cmp-sub">· about {knowledge.kind === "integrated" ? "the whole you" : "this result"}</span>
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
          placeholder="Ask anything about yourself…"
          value={input}
          disabled={thinking}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
        />
        <button className="btn primary" onClick={() => send(input)} disabled={!input.trim() || thinking}>Ask</button>
      </div>
    </div>
  );
}
