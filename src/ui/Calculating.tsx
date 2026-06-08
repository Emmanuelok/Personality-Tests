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
        <div className="spin" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <polygon points="16,3 29,16 16,29 3,16" />
            <polygon points="16,9 23,16 16,23 9,16" />
          </svg>
        </div>
        <p>{MESSAGES[mi]}</p>
      </div>
    </div>
  );
}
