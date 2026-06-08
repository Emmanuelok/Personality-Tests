import { useState, useEffect } from "react";
import type { AssessmentResult, Instrument, ScaleDef } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { buildReportKnowledge } from "@core/companion";
import { RadarChart, ScaleBar, Gauge } from "./charts";
import { InstrumentGlyph, Crest, Flourish, TraitIcon } from "./art";
import { ImprovementPlanner } from "./ImprovementPlanner";
import { Companion } from "./Companion";
import { downloadJSON, downloadMarkdown } from "./exports";
import { downloadShareCard } from "./shareCard";
import { fetchNorms, communityPercentile } from "../calibration";
import { hasPoster } from "../store";

function shortLabel(name: string): string {
  if (name.includes("·")) return name.split("·")[1].trim();
  if (name.includes("–")) return name.split("–")[0].trim();
  return name.split(" ")[0];
}

export function Report({
  instrument,
  result,
  report,
  onRegenerate,
  onRestart,
  onCompatibility,
  name,
}: {
  instrument: Instrument;
  result: AssessmentResult;
  report: PersonalityReport;
  onRegenerate: () => void;
  onRestart: () => void;
  onCompatibility: () => void;
  name?: string;
}) {
  const scaleById = new Map<string, ScaleDef>(instrument.scales.map((s) => [s.id, s]));
  const radarData = report.traits.map((t) => ({ label: shortLabel(t.name), value: t.normalized }));
  const [pdfBusy, setPdfBusy] = useState(false);

  const withPdf = async (fn: "downloadReportPdf" | "downloadPosterPdf") => {
    setPdfBusy(true);
    try {
      const m = await import("./pdf");
      await m[fn](instrument, result, report);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="container view-enter">
      <div className="report-head">
        <span className={`report-seal cat-${instrument.category}`} aria-hidden="true">
          <InstrumentGlyph id={instrument.id} category={instrument.category} />
        </span>
        <div className="supertitle">{instrument.name} · Personal Report</div>
        <h1>{report.title}</h1>
        <div className="subtitle">{report.subtitle}</div>
        <div className="uniqueness" title="No two generated reports are ever identical.">
          ✓ Unlocked · 🧬 Unique report <code>{report.reportId}</code> · seed <code>{report.seedHex}</code>
        </div>
      </div>

      <div className="row-actions no-print">
        <button className="btn primary" disabled={pdfBusy} onClick={() => withPdf("downloadReportPdf")}>
          {pdfBusy ? "Preparing…" : "⤓ Designed PDF"}
        </button>
        {hasPoster(result.responseFingerprint) && (
          <button className="btn" disabled={pdfBusy} onClick={() => withPdf("downloadPosterPdf")}>🖼 Poster PDF</button>
        )}
        <button className="btn" onClick={() => downloadShareCard(instrument, result, report, name)}>📣 Share card</button>
        <button className="btn" onClick={() => downloadMarkdown(instrument, report)}>⤓ Markdown</button>
        <button className="btn" onClick={() => downloadJSON(instrument, result, report)}>⤓ Data (JSON)</button>
        <button className="btn" onClick={() => window.print()}>🖨 Print</button>
        <button className="btn" onClick={onRegenerate} title="Compose a fresh, never-identical version from the same answers">
          ↻ Regenerate
        </button>
        <button className="btn" onClick={onCompatibility}>💞 Compatibility</button>
        <button className="btn ghost" onClick={onRestart}>↩ Take another</button>
      </div>

      <div className="report-grid stagger">
        {/* Overview */}
        <section className="panel">
          {report.overview.map((p, i) => (
            <p className={`lead-para${i === 0 ? " drop" : ""}`} key={i}>{p}</p>
          ))}
        </section>

        {/* Ask Atlas */}
        <section className="panel">
          <Companion knowledge={buildReportKnowledge(instrument, result, report, name)} />
        </section>

        {/* Type card */}
        {report.type && (
          <section className="panel type-card">
            <div>
              <Crest className={`type-crest cat-${instrument.category}`}>
                <InstrumentGlyph id={instrument.id} category={instrument.category} />
              </Crest>
              <div className="code">{report.type.code}</div>
              <div className="ttitle">{report.type.title}</div>
              <p className="summary">{report.type.summary}</p>
              <div className="clarity">
                <Gauge value={Math.round(report.type.confidence * 100)} size={104} />
                <div className="clarity-note">
                  <span className="clarity-label">Typing clarity</span>
                  {report.type.secondary ? <>runner-up: <b>{report.type.secondary}</b></> : "a decisive, well-separated result"}
                </div>
              </div>
            </div>
            <div className="kv">
              {report.type.components.map((c, i) => (
                <div className="row" key={i}>
                  <div className="k">{c.label}</div>
                  <div className="v">{c.value}{c.detail ? <> <small>· {c.detail}</small></> : null}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Radar */}
        <section className="panel">
          <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 22, margin: "0 0 6px" }}>Your Profile at a Glance</h3>
          <div className="radar-wrap">
            <RadarChart data={radarData} />
          </div>
        </section>

        <CommunityCalibration instrumentId={instrument.id} traits={report.traits.map((t) => ({ scaleId: t.scaleId, name: t.name, normalized: t.normalized }))} />

        {/* Trait deep dive */}
        <section className="panel">
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, marginTop: 0 }}>
            {instrument.kind === "typological" ? "Dimension by Dimension" : "Trait by Trait"}
          </h3>
          {report.traits.map((t) => {
            const sd = scaleById.get(t.scaleId);
            return (
              <div className="trait" key={t.scaleId}>
                <div className="thead">
                  <h4><TraitIcon seed={t.scaleId} />{t.name}</h4>
                  <span className="level">{t.level} · {t.poleLabel}</span>
                </div>
                <ScaleBar value={t.normalized} leftLabel={sd?.poles?.low} rightLabel={sd?.poles?.high} />
                <div className="pct">{ordinalPct(t.percentile)} percentile</div>
                <p className="narr">{t.narrative}</p>
                <div className="sw">
                  <div className="col good">
                    <h5>Strengths</h5>
                    <ul>{t.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                  <div className="col watch">
                    <h5>Watch-outs</h5>
                    <ul>{t.watchouts.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Dynamics */}
        {report.dynamics.length > 0 && (
          <section className="panel sec">
            <h3>How Your Traits Interact</h3>
            <ul className="clean dynamics">
              {report.dynamics.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </section>
        )}

        {/* Narrative sections */}
        {report.sections.map((s) => (
          <section className="panel sec" key={s.id}>
            <h3>{s.heading}</h3>
            {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            {s.bullets && s.bullets.length > 0 && (
              <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            )}
          </section>
        ))}

        {/* Signature responses */}
        {report.signatureResponses.length > 0 && (
          <section className="panel sec">
            <h3>What Makes This Profile Uniquely Yours</h3>
            <p>These are the specific answers that pulled to the extremes — the fingerprints a summary would smooth over.</p>
            <ul className="clean sigs">
              {report.signatureResponses.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>
        )}

        {/* Improvement */}
        <section className="panel">
          <ImprovementPlanner instrument={instrument} result={result} />
        </section>

        {/* Caveats + citations */}
        <section className="panel">
          {instrument.caveats && (
            <>
              <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read responsibly</h3>
              <ul className="caveats">{instrument.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </>
          )}
          <details style={{ marginTop: 14 }}>
            <summary style={{ cursor: "pointer", color: "var(--text-faint)", fontSize: 13 }}>
              Scientific basis &amp; item provenance
            </summary>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 10 }}>{instrument.itemProvenance}</p>
            <ul className="cites">
              {instrument.citations.map((c, i) => (
                <li key={i}>{c.ref}{c.note ? ` — ${c.note}` : ""}</li>
              ))}
            </ul>
          </details>
        </section>
      </div>

      <Flourish />

      <div className="footer">
        Report engine: <b>{report.engine}</b>. Generated {new Date(report.generatedAt).toLocaleString()}.
        <br /> This report was composed from your full response pattern plus a unique seed — regenerate it and the prose will change, by design.
      </div>
    </div>
  );
}

/** Live community percentiles (only renders when the opt-in backend has enough data). */
function CommunityCalibration({ instrumentId, traits }: { instrumentId: string; traits: { scaleId: string; name: string; normalized: number }[] }) {
  const [norms, setNorms] = useState<Record<string, number[]> | null>(null);
  useEffect(() => {
    let on = true;
    fetchNorms(instrumentId).then((n) => { if (on) setNorms(n); });
    return () => { on = false; };
  }, [instrumentId]);

  if (!norms) return null;
  const rows = traits
    .map((t) => ({ name: t.name, p: communityPercentile(norms[t.scaleId], t.normalized) }))
    .filter((r): r is { name: string; p: number } => r.p != null);
  if (!rows.length) return null;

  return (
    <section className="panel sec">
      <h3>How you compare to the community</h3>
      <p>Live percentiles from people who opted in to anonymous calibration — these sharpen as more take it.</p>
      {rows.map((r, i) => (
        <div className="cdim" key={i}>
          <div className="top"><b>{r.name}</b><span className="vals">{ordinalPct(r.p)} percentile</span></div>
        </div>
      ))}
    </section>
  );
}

function ordinalPct(n: number): string {
  const r = Math.round(n);
  const s = ["th", "st", "nd", "rd"];
  const v = r % 100;
  return r + (s[(v - 20) % 10] || s[v] || s[0]);
}
