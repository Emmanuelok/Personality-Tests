import { useMemo, useState, type CSSProperties } from "react";
import type { AssessmentResult, Instrument } from "@core/types";
import { INSTRUMENTS } from "@core/instruments";
import {
  computeCompatibility,
  decodeSummary,
  encodeSummary,
  toSummary,
  type CompatibilityReport,
} from "@core/compatibility";
import { useI18n } from "../i18n";

export function Compatibility({
  instrument,
  result,
  onStart,
  onBack,
}: {
  instrument: Instrument | null;
  result: AssessmentResult | null;
  onStart: (inst: Instrument) => void;
  onBack: () => void;
}) {
  const { locale } = useI18n();
  const myCode = useMemo(
    () => (instrument && result ? encodeSummary(toSummary(instrument, result)) : ""),
    [instrument, result],
  );
  const [partner, setPartner] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(myCode).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  };

  const compare = () => {
    setError(null);
    setReport(null);
    if (!instrument || !result) return;
    const them = decodeSummary(partner);
    if (!them) {
      setError("That code didn't look right. Paste the full code your partner shared.");
      return;
    }
    if (them.instrumentId !== instrument.id) {
      setError(`That code is for a different assessment. You both need to share codes from the same test (${instrument.name}).`);
      return;
    }
    setReport(computeCompatibility(instrument, toSummary(instrument, result), them, { locale }));
  };

  // No result yet — invite the user to take a relational assessment first.
  if (!instrument || !result) {
    const suggested = INSTRUMENTS.filter((i) => ["relationships", "communication", "core", "emotional"].includes(i.category));
    return (
      <div className="container">
        <div className="report-head">
          <div className="supertitle">Relationship Compatibility</div>
          <h1>💞 Compare two people</h1>
          <div className="subtitle">Take an assessment first — then share your code to compare.</div>
        </div>
        <div className="panel">
          <p style={{ color: "var(--text-dim)" }}>
            Compatibility works by comparing two completed results on the <b>same</b> assessment. Pick one to take —
            attachment and love languages are the most relationship-focused, but any of these work well.
          </p>
          <div className="grid">
            {suggested.map((inst) => (
              <article className="card" key={inst.id}>
                <span className="kind">{inst.kind === "typological" ? "Typology" : "Dimensional"}</span>
                <h3>{inst.name}</h3>
                <p className="tagline">{inst.tagline}</p>
                <button className="btn primary" onClick={() => onStart(inst)}>Take {inst.shortName} →</button>
              </article>
            ))}
          </div>
          <div className="row-actions"><button className="btn ghost" onClick={onBack}>← Back</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="report-head">
        <div className="supertitle">{instrument.name} · Compatibility</div>
        <h1>💞 Compare two people</h1>
        <div className="subtitle">Share your code, paste theirs, and see how you fit.</div>
      </div>

      <div className="report-grid">
        <section className="panel">
          <h3 style={{ marginTop: 0 }}>1 · Share your private code</h3>
          <p style={{ color: "var(--text-dim)" }}>
            This code contains only your scores (never your answers). Send it to the person you want to compare with.
          </p>
          <div className="code-box">
            <code>{myCode}</code>
            <button className="btn" onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>

          <h3 style={{ marginTop: 18 }}>2 · Paste their code</h3>
          <textarea
            className="code-input"
            placeholder="Paste your partner's code here…"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
          />
          <div className="row-actions" style={{ justifyContent: "flex-start", marginTop: 10 }}>
            <button className="btn primary" disabled={!partner.trim()} onClick={compare}>Check compatibility →</button>
            <button className="btn ghost" onClick={onBack}>← Back</button>
          </div>
          {error && <p className="note" style={{ borderLeftColor: "var(--danger)", marginTop: 12 }}>{error}</p>}
        </section>

        {report && (
          <>
            <section className="panel">
              <div className="compat-score">
                <div className="ring" style={{ "--v": report.overall } as unknown as CSSProperties}>
                  <div className="inner"><span className="pct">{report.overall}%</span></div>
                </div>
                <div>
                  <h2 style={{ margin: "0 0 6px", fontFamily: "var(--serif)", fontSize: 26 }}>{report.band}</h2>
                  {report.summary.map((p, i) => <p key={i} style={{ color: "var(--text-dim)", margin: "0 0 8px" }}>{p}</p>)}
                </div>
              </div>
            </section>

            <section className="panel">
              <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>Dimension by dimension</h3>
              {report.dimensions.map((d) => (
                <div className="cdim" key={d.id}>
                  <div className="top">
                    <b>{d.name}</b>
                    <span className="vals">
                      you {d.you} · them {d.them}{" "}
                      <span className={`gap-badge ${d.gap <= 15 ? "aligned" : d.gap >= 40 ? "wide" : ""}`}>
                        {d.gap <= 15 ? "aligned" : d.gap >= 40 ? "wide gap" : `Δ${d.gap}`}
                      </span>
                    </span>
                  </div>
                  <div className="note">{d.note}</div>
                </div>
              ))}
            </section>

            {(report.strengths.length > 0 || report.frictions.length > 0) && (
              <section className="panel">
                <div className="sw">
                  <div className="col good">
                    <h5>What's working for you</h5>
                    <ul>{report.strengths.map((sn, i) => <li key={i}>{sn}</li>)}</ul>
                  </div>
                  <div className="col watch">
                    <h5>Where to be intentional</h5>
                    <ul>{report.frictions.map((fr, i) => <li key={i}>{fr}</li>)}</ul>
                  </div>
                </div>
              </section>
            )}

            <section className="panel sec">
              <h3>Tips to bridge the gap</h3>
              <ul>{report.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
              <p className="trust" style={{ marginTop: 10 }}>
                Compatibility is a conversation starter, not a verdict. Share this with your partner and talk it through.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
