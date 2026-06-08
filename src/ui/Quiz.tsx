import { useEffect, useState, useCallback } from "react";
import type { Instrument, ResponseMap } from "@core/types";

export function Quiz({
  instrument,
  onComplete,
  onCancel,
}: {
  instrument: Instrument;
  onComplete: (responses: ResponseMap) => void;
  onCancel: () => void;
}) {
  const items = instrument.items;
  const { min, max, labels } = instrument.responseFormat;
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});

  const item = items[index];
  const answered = Object.keys(responses).length;
  const progress = Math.round((answered / items.length) * 100);

  const choose = useCallback(
    (value: number) => {
      const next = { ...responses, [item.id]: value };
      setResponses(next);
      if (index + 1 >= items.length) {
        // Small beat so the selection registers visually before transitioning.
        setTimeout(() => onComplete(next), 160);
      } else {
        setTimeout(() => setIndex((i) => Math.min(i + 1, items.length - 1)), 140);
      }
    },
    [responses, item, index, items.length, onComplete],
  );

  const goBack = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const span = max - min;
      const k = Number(e.key);
      if (!Number.isNaN(k) && k >= 1 && k <= span + 1) {
        choose(min + (k - 1));
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        goBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, goBack, min, max]);

  // Values from min..max, rendered with the instrument's anchor labels.
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const current = responses[item.id];

  return (
    <div className="container quiz-wrap">
      <div className="quiz-meta">
        <button className="btn ghost sm" onClick={onCancel}>← Exit</button>
        <span>{instrument.name}</span>
      </div>
      <div className="progress"><i style={{ width: `${progress}%` }} /></div>
      <div className="quiz-meta">
        <span>{answered} of {items.length} answered</span>
        <span>{progress}%</span>
      </div>

      <div className="qcard" key={item.id}>
        <div className="qnum">Question {index + 1} of {items.length}</div>
        <div className="stmt">{item.text}</div>
        <div className="likert">
          {values.map((v, i) => (
            <button
              key={v}
              className={current === v ? "active" : ""}
              onClick={() => choose(v)}
              aria-pressed={current === v}
            >
              <span className="dot">{i + 1}</span>
              <span>{labels[i] ?? `Level ${v}`}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-actions">
        <button className="btn ghost" onClick={goBack} disabled={index === 0}>← Back</button>
        <span className="hint">Tip: press {1}–{max - min + 1} on your keyboard to answer fast</span>
        <span style={{ width: 70 }} />
      </div>
    </div>
  );
}
