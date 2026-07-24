import { useEffect, useState, useCallback, useRef } from "react";
import type { Instrument, ResponseMap } from "@core/types";
import { useI18n } from "../i18n";

/** How the Likert response options are presented (purely cosmetic — scoring is identical). */
type AnswerStyle = "sentences" | "scale";
const STYLE_KEY = "psyche.answerStyle";
const loadStyle = (): AnswerStyle => {
  try {
    return localStorage.getItem(STYLE_KEY) === "scale" ? "scale" : "sentences";
  } catch {
    return "sentences";
  }
};

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
  const [style, setStyle] = useState<AnswerStyle>(loadStyle);
  const [advancing, setAdvancing] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const advancingRef = useRef(false);
  const completedRef = useRef(false);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const i18 = useI18n();

  const item = items[index];
  const answered = Object.keys(responses).length;
  const progress = Math.round((answered / items.length) * 100);

  const setAnswerStyle = (s: AnswerStyle) => {
    setStyle(s);
    try {
      localStorage.setItem(STYLE_KEY, s);
    } catch {
      /* ignore */
    }
  };

  const choose = useCallback(
    (value: number) => {
      if (advancingRef.current || completedRef.current) return;
      const next = { ...responses, [item.id]: value };
      setResponses(next);
      advancingRef.current = true;
      setAdvancing(true);
      setAnnouncement(i18.t("take.answerSaved"));

      const allAnswered = items.every((candidate) =>
        Object.prototype.hasOwnProperty.call(next, candidate.id),
      );
      if (index + 1 >= items.length && allAnswered) {
        setAnnouncement(i18.t("take.completing"));
        // Small beat so the selection registers visually before transitioning.
        window.setTimeout(() => {
          if (completedRef.current) return;
          completedRef.current = true;
          onComplete(next);
        }, 160);
      } else {
        const nextIndex = index + 1 < items.length
          ? index + 1
          : items.findIndex((candidate) => !Object.prototype.hasOwnProperty.call(next, candidate.id));
        window.setTimeout(() => setIndex(Math.max(0, nextIndex)), 140);
      }
    },
    [responses, item, index, items, onComplete, i18],
  );

  const goBack = useCallback(() => {
    if (advancingRef.current || completedRef.current) return;
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const requestExit = () => {
    if (!answered || window.confirm(i18.t("take.exitConfirm"))) onCancel();
  };

  useEffect(() => {
    advancingRef.current = false;
    setAdvancing(false);
    setAnnouncement(
      i18.t("take.questionAnnounce")
        .replace("{i}", String(index + 1))
        .replace("{n}", String(items.length)),
    );
    const frame = window.requestAnimationFrame(() => questionRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [index, items.length, i18]);

  useEffect(() => {
    if (!answered || completedRef.current) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [answered]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || advancingRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      const k = Number(e.key);
      const opts = item.options;
      if (opts && opts.length) {
        // Multiple-choice: number keys map to the option index.
        if (!Number.isNaN(k) && k >= 1 && k <= opts.length) {
          e.preventDefault();
          choose(k - 1);
        } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
          e.preventDefault();
          goBack();
        }
        return;
      }
      const span = max - min;
      if (!Number.isNaN(k) && k >= 1 && k <= span + 1) {
        e.preventDefault();
        choose(min + (k - 1));
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, goBack, min, max]);

  // Values from min..max, rendered with the instrument's anchor labels.
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const current = responses[item.id];
  // Multiple-choice items carry their own options; the response value is the chosen index.
  const choiceOptions = item.options && item.options.length ? item.options : null;

  return (
    <div className="container quiz-wrap">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <div className="quiz-meta">
        <button className="btn ghost sm" onClick={requestExit}>← {i18.t("take.exit")}</button>
        <span>{instrument.name}</span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label={i18.t("take.progress")}
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={answered}
        aria-valuetext={i18.t("take.answered").replace("{a}", String(answered)).replace("{n}", String(items.length))}
      >
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="quiz-meta">
        <span>{i18.t("take.answered").replace("{a}", String(answered)).replace("{n}", String(items.length))}</span>
        <span>{progress}%</span>
      </div>

      <div className="qcard" key={item.id} aria-busy={advancing}>
        <div className="qcard-top">
          <div className="qnum">{i18.t("ability.qOf").replace("{i}", String(index + 1)).replace("{n}", String(items.length))}</div>
          {!choiceOptions && (
            <div className="answer-style" role="group" aria-label={i18.t("answer.style")}>
              <button className={`as-seg ${style === "sentences" ? "on" : ""}`} onClick={() => setAnswerStyle("sentences")} aria-pressed={style === "sentences"}>
                {i18.t("answer.sentences")}
              </button>
              <button className={`as-seg ${style === "scale" ? "on" : ""}`} onClick={() => setAnswerStyle("scale")} aria-pressed={style === "scale"}>
                {i18.t("answer.scale")}
              </button>
            </div>
          )}
        </div>
        <h1 className="stmt" ref={questionRef} tabIndex={-1}>{item.text}</h1>

        {choiceOptions ? (
          <div className="likert">
            {choiceOptions.map((opt, oi) => (
              <button
                key={oi}
                className={current === oi ? "active" : ""}
                onClick={() => choose(oi)}
                aria-pressed={current === oi}
                disabled={advancing}
              >
                <span className="dot">{String.fromCharCode(65 + oi)}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
        ) : style === "sentences" ? (
          <div className="likert">
            {values.map((v, i) => (
              <button
                key={v}
                className={current === v ? "active" : ""}
                onClick={() => choose(v)}
                aria-pressed={current === v}
                disabled={advancing}
              >
                <span className="dot">{i + 1}</span>
                <span>{labels[i] ?? `Level ${v}`}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="likert-scale">
            <div className="ls-row">
              {values.map((v, i) => (
                <button
                  key={v}
                  className={`ls-dot ${current === v ? "active" : ""}`}
                  onClick={() => choose(v)}
                  aria-pressed={current === v}
                  disabled={advancing}
                  title={labels[i] ?? `Level ${v}`}
                  aria-label={labels[i] ?? `Level ${v}`}
                >
                  <span>{i + 1}</span>
                </button>
              ))}
            </div>
            <div className="ls-anchors"><span>{labels[0]}</span><span>{labels[labels.length - 1]}</span></div>
            <div className="ls-current">{current != null ? labels[current - min] ?? "" : " "}</div>
          </div>
        )}
      </div>

      <div className="quiz-actions">
        <button className="btn ghost" onClick={goBack} disabled={index === 0 || advancing}>← {i18.t("common.back")}</button>
        <span className="hint">{i18.t("take.tip").replace("{a}", "1").replace("{b}", String(choiceOptions ? choiceOptions.length : max - min + 1))}</span>
        <span style={{ width: 70 }} />
      </div>
    </div>
  );
}
