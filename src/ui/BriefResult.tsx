import type { AssessmentResult, Instrument } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { PRODUCTS, formatPrice } from "@core/commerce";
import { RadarChart } from "./charts";
import { InstrumentGlyph, Crest, TraitIcon } from "./art";
import { useI18n } from "../i18n";

function shortLabel(name: string): string {
  if (name.includes("·")) return name.split("·")[1].trim();
  if (name.includes("–")) return name.split("–")[0].trim();
  return name.split(" ")[0];
}

export function BriefResult({
  instrument,
  report,
  onPurchase,
  onRestart,
  busy,
  error,
}: {
  instrument: Instrument;
  result: AssessmentResult;
  report: PersonalityReport;
  onPurchase: (productId: string) => void;
  onRestart: () => void;
  busy: boolean;
  error: string | null;
}) {
  const radarData = report.traits.map((tr) => ({ label: shortLabel(tr.name), value: tr.normalized }));
  const top = [...report.traits].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50)).slice(0, 3);
  const i18 = useI18n();

  return (
    <div className="container view-enter">
      <div className="report-head">
        <span className={`report-seal cat-${instrument.category}`} aria-hidden="true">
          <InstrumentGlyph id={instrument.id} category={instrument.category} />
        </span>
        <div className="supertitle">{instrument.name} · {i18.t("report.snapshot")}</div>
        <h1>{report.title}</h1>
        <div className="subtitle">{report.subtitle}</div>
      </div>

      <div className="report-grid stagger">
        <section className="panel">
          {report.type && (
            <div className="type-card" style={{ marginBottom: 18 }}>
              <div>
                <Crest className={`type-crest cat-${instrument.category}`}>
                  <InstrumentGlyph id={instrument.id} category={instrument.category} />
                </Crest>
                <div className="code">{report.type.code}</div>
                <div className="ttitle">{report.type.title}</div>
                <p className="summary">{report.type.summary}</p>
              </div>
              <div className="radar-wrap"><RadarChart data={radarData} size={300} /></div>
            </div>
          )}
          {!report.type && (
            <div className="radar-wrap" style={{ marginBottom: 12 }}><RadarChart data={radarData} /></div>
          )}
          <p className="lead-para drop">{report.overview[0]}</p>
          <div style={{ marginTop: 14 }}>
            {top.map((t) => (
              <div className="trait" key={t.scaleId} style={{ marginBottom: 10 }}>
                <div className="thead">
                  <h4><TraitIcon seed={t.scaleId} />{t.name}</h4>
                  <span className="level">{t.level} · {Math.round(t.percentile)}th pct</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Paywall */}
        <section className="panel paywall">
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "0 0 4px" }}>{i18.t("paywall.unlock")}</h2>
          <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{i18.t("paywall.lede")}</p>

          <div className="prod-grid">
            {PRODUCTS.map((p) => (
              <div className={`prod ${p.id === "report" ? "primary" : ""}`} key={p.id}>
                {p.badge && <span className="prod-badge">{p.badge}</span>}
                <div className="prod-name">{p.name}</div>
                <div className="prod-price">{formatPrice(p.priceCents, p.currency)}</div>
                <div className="prod-blurb">{p.blurb}</div>
                <ul className="prod-includes">
                  {p.includes.map((inc, i) => <li key={i}>{inc}</li>)}
                </ul>
                <button className={`btn ${p.id === "report" ? "primary" : ""}`} disabled={busy} onClick={() => onPurchase(p.id)}>
                  {busy ? "…" : i18.t("paywall.unlockPrice").replace("{price}", formatPrice(p.priceCents, p.currency))}
                </button>
              </div>
            ))}
          </div>

          {error && <p className="note" style={{ borderLeftColor: "var(--danger)", marginTop: 14 }}>{error}</p>}

          <p className="trust">{i18.t("paywall.trust")}</p>
        </section>

        <div className="row-actions">
          <button className="btn ghost" onClick={onRestart}>↩ {i18.t("paywall.takeDifferent")}</button>
        </div>
      </div>
    </div>
  );
}
