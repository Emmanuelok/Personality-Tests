import { useCallback, useId, useMemo, useState } from "react";
import { buildIntegratedProfile, type SynthEntry } from "@core/synthesis";
import { buildIntegratedKnowledge } from "@core/companion";
import { Companion } from "./Companion";
import { useI18n } from "../i18n";
import { useDialogFocusTrap } from "./dialog";

/**
 * Always-on AI coach — a floating "Ask Atlas" that knows the user's whole
 * cross-test profile, available from anywhere in the app. Reuses the Companion
 * with integrated knowledge built from every assessment they've completed.
 */

const LABEL: Record<string, string> = { en: "Ask Atlas", es: "Pregunta a Atlas", fr: "Demandez à Atlas" };
const CLOSE: Record<string, string> = { en: "Close", es: "Cerrar", fr: "Fermer" };

export function CoachDock({ entries, name }: { entries: SynthEntry[]; name?: string }) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const titleId = useId();
  const dialogRef = useDialogFocusTrap<HTMLDivElement>(open, close);
  const knowledge = useMemo(
    () => buildIntegratedKnowledge(buildIntegratedProfile(entries, { name, locale })),
    [entries, name, locale],
  );

  // The coach has nothing to draw on until at least one assessment is done.
  if (!entries.length) return null;
  const L = locale === "es" || locale === "fr" ? locale : "en";

  return (
    <>
      {open && (
        <div
          className="coach-panel view-enter"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <div className="coach-panel-head">
            <span className="coach-panel-title" id={titleId}><span className="cmp-dot" /> {LABEL[L]}</span>
            <button className="coach-close" onClick={close} aria-label={CLOSE[L]}>✕</button>
          </div>
          <div className="coach-panel-body">
            <Companion knowledge={knowledge} />
          </div>
        </div>
      )}
      <button
        className={`coach-fab${open ? " open" : ""}`}
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={LABEL[L]}
      >
        {open ? "✕" : <><span className="coach-fab-spark" aria-hidden="true">✦</span> {LABEL[L]}</>}
      </button>
    </>
  );
}
