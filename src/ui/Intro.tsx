import { useState } from "react";
import type { Instrument } from "@core/types";
import { getCategory } from "@core/categories";
import { InstrumentGlyph } from "./art";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
  const meta = t("intro.meta").replace("{m}", String(instrument.estMinutes)).replace("{n}", String(instrument.items.length));

  return (
    <div className="container">
      <div className="intro view-enter">
        <span className={`intro-emblem cat-${instrument.category}`} aria-hidden="true">
          <InstrumentGlyph id={instrument.id} category={instrument.category} />
        </span>
        <p className="eyebrow">{cat ? cat.name : "Assessment"}</p>
        <h1>{instrument.name}</h1>
        <p className="lede">{instrument.description}</p>

        <div className="name-field">
          <input
            type="text"
            placeholder={t("intro.namePlaceholder")}
            value={name}
            maxLength={40}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onBegin(name.trim());
            }}
          />
        </div>

        <button className="btn" onClick={() => onBegin(name.trim())}>{t("intro.begin")}</button>
        <p className="meta">{meta}</p>

        {instrument.caveats && instrument.caveats.length > 0 && (
          <div className="aside" style={{ textAlign: "left", marginTop: 42 }}>
            <span className="label">{t("intro.before")}</span>
            {t("intro.honest")} {instrument.caveats[0]}
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <button className="btn ghost" onClick={onBack}>←&nbsp;{t("common.allAssessments")}</button>
        </div>
      </div>
    </div>
  );
}
