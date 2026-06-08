import { useState } from "react";

const FOCI = [
  "Understand myself",
  "Grow & improve",
  "Better relationships",
  "Career & work",
  "Emotional wellbeing",
  "Just curious",
];

export function Onboarding({ onDone }: { onDone: (name: string, focus: string[]) => void }) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState<string[]>([]);

  const toggle = (f: string) => setFocus((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));
  const go = () => {
    if (name.trim()) onDone(name.trim(), focus);
  };

  return (
    <div className="container">
      <div className="onb view-enter">
        <div className="onb-step-label">Welcome to Psyche Atlas</div>
        <h1>
          Let's make this <span className="grad">about you</span>.
        </h1>
        <p className="sub">
          Your reports will speak to you by name, remember your journey, and grow more personal and more
          intelligent with every assessment you take. First — what should we call you?
        </p>
        <input
          className="name-input"
          autoFocus
          placeholder="Your first name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go();
          }}
        />
        <div style={{ marginTop: 28 }}>
          <div className="onb-step-label">What brings you here? <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></div>
          <div className="chips">
            {FOCI.map((f) => (
              <button key={f} className={`chip-toggle ${focus.includes(f) ? "on" : ""}`} onClick={() => toggle(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <button className="btn primary" style={{ fontSize: 16, padding: "14px 30px" }} disabled={!name.trim()} onClick={go}>
          Create my space →
        </button>
        <p className="trust" style={{ marginTop: 18 }}>🔒 Everything stays on your device. No account, no email, no tracking.</p>
      </div>
    </div>
  );
}
