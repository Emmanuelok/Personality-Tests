import { useState } from "react";
import type { Instrument } from "@core/types";
import { getCategory } from "@core/categories";
import { CategoryEmblem } from "./art";

export function Intro({
  instrument,
  initialName,
  onBegin,
  onBack,
}: {
  instrument: Instrument;
  initialName?: string;
  onBegin: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initialName ?? "");
  const cat = getCategory(instrument.category);

  return (
    <div className="container">
      <div className="intro view-enter">
        <span className={`intro-emblem cat-${instrument.category}`} aria-hidden="true">
          <CategoryEmblem id={instrument.category} />
        </span>
        <p className="eyebrow">{cat ? cat.name : "Assessment"}</p>
        <h1>{instrument.name}</h1>
        <p className="lede">{instrument.description}</p>

        <div className="name-field">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            maxLength={40}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onBegin(name.trim());
            }}
          />
        </div>

        <button className="btn" onClick={() => onBegin(name.trim())}>Begin the assessment&nbsp;→</button>
        <p className="meta">
          About {instrument.estMinutes} min · {instrument.items.length} questions · no sign-up, nothing leaves your device
        </p>

        {instrument.caveats && instrument.caveats.length > 0 && (
          <div className="aside" style={{ textAlign: "left", marginTop: 42 }}>
            <span className="label">Before you start</span>
            Choose the answer that feels <b>most like the real you</b> — not who you wish you were. There are no right
            answers, just your honest instinct. {instrument.caveats[0]}
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <button className="btn ghost" onClick={onBack}>←&nbsp;All assessments</button>
        </div>
      </div>
    </div>
  );
}
