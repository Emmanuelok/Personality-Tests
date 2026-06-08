import { useEffect, useState } from "react";

const MESSAGES = ["Reading your responses…", "Weighing the patterns…", "Composing your report…"];

/** A brief, calm "calculating" beat between finishing a quiz and the reveal. */
export function Calculating({ onDone }: { onDone: () => void }) {
  const [mi, setMi] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setMi((m) => Math.min(m + 1, MESSAGES.length - 1)), 480);
    const t = setTimeout(onDone, 1500);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [onDone]);

  return (
    <div className="container">
      <div className="calc">
        <div className="orrery" aria-hidden="true">
          <svg viewBox="0 0 120 120" fill="none" stroke="currentColor">
            <circle className="orrery-ring" cx="60" cy="60" r="54" strokeWidth="1" />
            <g className="orrery-spin">
              <circle cx="60" cy="60" r="42" strokeWidth="1.2" strokeDasharray="2 8" opacity="0.6" />
              <ellipse cx="60" cy="60" rx="54" ry="20" strokeWidth="1.1" opacity="0.7" />
              <ellipse cx="60" cy="60" rx="20" ry="54" strokeWidth="1.1" opacity="0.5" />
              <circle className="orrery-planet" cx="114" cy="60" r="5" />
            </g>
            <g className="orrery-core">
              <circle cx="60" cy="60" r="13" className="orrery-sun" strokeWidth="1.6" />
              <circle cx="60" cy="60" r="4" className="orrery-dot" />
            </g>
          </svg>
        </div>
        <p>{MESSAGES[mi]}</p>
      </div>
    </div>
  );
}
