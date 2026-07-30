import { useMemo, useState } from "react";
import type { Instrument } from "@core/types";
import { getCategory } from "@core/categories";
import { localizeCategory } from "@core/categories.i18n";
import { relevanceNote } from "@core/recommend";
import type { SynthEntry } from "@core/synthesis";
import { InstrumentGlyph } from "./art";
import { useI18n } from "../i18n";

const CATEGORY_SCENES: Record<string, string> = {
  core: "/images/psyche-reflection.webp",
  types: "/images/psyche-explore.webp",
  relationships: "/images/psyche-connection.webp",
  communication: "/images/psyche-connection.webp",
  strengths: "/images/psyche-growth.webp",
  career: "/images/psyche-direction.webp",
  emotional: "/images/psyche-growth.webp",
  wellbeing: "/images/psyche-growth.webp",
  learning: "/images/psyche-cognition.webp",
  mind: "/images/psyche-cognition.webp",
  focused: "/images/psyche-reflection.webp",
  shadow: "/images/psyche-direction.webp",
};

export function Intro({
  instrument,
  initialName,
  entries = [],
  onBegin,
  onBack,
}: {
  instrument: Instrument;
  initialName?: string;
  entries?: SynthEntry[];
  onBegin: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initialName ?? "");
  const cat = getCategory(instrument.category);
  const { t, locale } = useI18n();
  const meta = t("intro.meta").replace("{m}", String(instrument.estMinutes)).replace("{n}", String(instrument.items.length));
  const relevance = useMemo(() => relevanceNote(instrument, entries, { locale }), [instrument, entries, locale]);
  const categoryName = cat ? localizeCategory(cat, locale).name : t("intro.assessment");

  return (
    <div className="container cinematic-intro-shell">
      <div className="cinematic-intro view-enter">
        <div className="cinematic-intro-media" aria-hidden="true">
          <img
            src={CATEGORY_SCENES[instrument.category] ?? "/images/psyche-reflection.webp"}
            width="1536"
            height="1024"
            loading="eager"
            decoding="async"
            alt=""
          />
          <div className="cinematic-intro-shade" />
          <span className={`cinematic-intro-orbit cat-${instrument.category}`}>
            <InstrumentGlyph id={instrument.id} category={instrument.category} />
          </span>
          <span className="cinematic-intro-index">{String(instrument.estMinutes).padStart(2, "0")}</span>
        </div>
        <div className="intro cinematic-intro-copy">
        <span className={`intro-emblem cat-${instrument.category}`} aria-hidden="true">
          <InstrumentGlyph id={instrument.id} category={instrument.category} />
        </span>
        <p className="eyebrow">{categoryName}</p>
        <h1>{instrument.name}</h1>
        <p className="lede">{instrument.description}</p>

        {relevance && (
          <div className="intro-relevance">
            <span className="intro-relevance-mark" aria-hidden="true">✦</span>
            <div>
              <span className="intro-relevance-label">{t("intro.forYou")}</span>
              <p>{relevance}</p>
            </div>
          </div>
        )}

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
    </div>
  );
}
