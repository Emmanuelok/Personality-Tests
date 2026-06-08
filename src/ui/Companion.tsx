import { useEffect, useRef, useState } from "react";
import { askCompanion, suggestedQuestions, type CompanionKnowledge } from "@core/companion";

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
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    started.current = true;
  }, [msgs]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const ans = askCompanion(knowledge, q);
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "atlas", text: ans.text }]);
    setChips(ans.followups);
    setInput("");
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
        <div ref={endRef} />
      </div>
      {chips.length > 0 && (
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
        />
        <button className="btn primary" onClick={() => send(input)} disabled={!input.trim()}>Ask</button>
      </div>
    </div>
  );
}
