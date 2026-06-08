import { useState } from "react";
import type { AbilityTest, AbilityResult as AR } from "@core/ability";
import { PRODUCTS, formatPrice } from "@core/commerce";
import { RadarChart, ScaleBar } from "../charts";
import { CategoryEmblem } from "../art";
import { downloadCognitiveShareCard } from "../shareCard";
import { Figure } from "./Figure";

const COG = PRODUCTS.find((p) => p.id === "cognitive")!;
const ALL = PRODUCTS.find((p) => p.id === "allaccess")!;

export function AbilityResult({
  test,
  result,
  name,
  unlocked,
  busy,
  error,
  onPurchase,
  onRestart,
  onExit,
}: {
  test: AbilityTest;
  result: AR;
  name?: string;
  unlocked: boolean;
  busy: boolean;
  error: string | null;
  onPurchase: (productId: string) => void;
  onRestart: () => void;
  onExit: () => void;
}) {
  const radar = result.perDomain.map((d) => ({ label: d.name.split(" ")[0], value: d.percentile }));
  const [pdfBusy, setPdfBusy] = useState(false);

  const exportPdf = async () => {
    setPdfBusy(true);
    try {
      const m = await import("../pdf");
      await m.downloadCognitivePdf(test, result);
    } catch (e) {
      console.error("Cognitive PDF failed", e);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="container view-enter">
      <div className="report-head">
        <span className="report-seal cat-cognition" aria-hidden="true">
          <CategoryEmblem id="cognition" />
        </span>
        <div className="supertitle">{test.name} · {unlocked ? "Full Profile" : "Free Snapshot"}</div>
        <h1>{name ? `${name}, here's` : "Here's"} your reasoning profile</h1>
        <div className="subtitle">You answered {result.correct} of {result.total} correctly across {result.perDomain.length} domains.</div>
      </div>

      <div className="report-grid stagger">
        {/* Headline estimate (free) */}
        <section className="panel iq-card">
          <div className="iq-figure">
            <div className="iq-band">Estimated range</div>
            <div className="iq-range">{result.iqLow}<span>–</span>{result.iqHigh}</div>
            <div className="iq-sub">{result.band} · about the {ordinal(result.percentile)} percentile</div>
          </div>
          <div className="iq-note">
            <p style={{ marginTop: 0 }}>
              On a scale where 100 is average (and roughly two-thirds of people fall between 85 and 115), your answers
              put you in the <b>{result.band.toLowerCase()}</b>. We show a <b>range</b>, not a single number, on purpose.
            </p>
            <p className="note" style={{ margin: 0 }}>
              An <b>educational estimate</b> from a short, self-administered test — <b>not</b> a clinical IQ score.
            </p>
          </div>
        </section>

        {/* Domain profile (free) */}
        <section className="panel">
          <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 22, margin: "0 0 6px" }}>Your profile across domains</h3>
          <div className="radar-wrap"><RadarChart data={radar} /></div>
          <div style={{ marginTop: 10 }}>
            {result.perDomain.map((d) => (
              <div className="trait" key={d.domain} style={{ marginBottom: 10 }}>
                <div className="thead">
                  <h4>{d.name}</h4>
                  <span className="level">{d.correct}/{d.total} · {ordinal(d.percentile)} pct</span>
                </div>
                <ScaleBar value={d.percentile} leftLabel="Lower" rightLabel="Higher" />
              </div>
            ))}
          </div>
          <div className="row-actions no-print" style={{ justifyContent: "flex-start", marginTop: 14 }}>
            <button className="btn" onClick={() => downloadCognitiveShareCard(test, result, name)}>📣 Share card</button>
          </div>
        </section>

        {unlocked ? (
          <>
            {/* Per-question review (unlocked) */}
            <section className="panel sec">
              <div className="row-actions no-print" style={{ justifyContent: "flex-start", marginTop: 0, marginBottom: 12 }}>
                <button className="btn primary" disabled={pdfBusy} onClick={exportPdf}>{pdfBusy ? "Preparing…" : "⤓ Cognitive report PDF"}</button>
                <button className="btn" onClick={() => window.print()}>🖨 Print</button>
              </div>
              <h3>Review every question</h3>
              <p>See exactly what you got right, what you missed, and why — the fastest way to actually learn from this.</p>
              {test.items.map((it, qi) => {
                const chosen = result.responses[it.id];
                const correct = chosen === it.answer;
                return (
                  <div className="qreview" key={it.id}>
                    <div className="qr-head">
                      <span className={`qr-badge ${correct ? "ok" : "no"}`}>{correct ? "✓" : "✗"}</span>
                      <b>Q{qi + 1}.</b> <span className="qr-prompt">{it.prompt}</span>
                    </div>
                    {it.figure && <Figure svg={it.figure} className="qr-fig" />}
                    <div className="qr-opts">
                      {it.options.map((opt, oi) => {
                        const cls = oi === it.answer ? "ans" : oi === chosen ? "chosen" : "";
                        return (
                          <span className={`qr-opt ${cls}`} key={oi}>
                            {it.optionFigures ? <Figure svg={it.optionFigures[oi]} /> : opt}
                            {oi === it.answer && <i> ✓</i>}
                            {oi === chosen && oi !== it.answer && <i> ✗ you</i>}
                          </span>
                        );
                      })}
                    </div>
                    <p className="qr-explain">{it.explain}</p>
                  </div>
                );
              })}
            </section>
          </>
        ) : (
          /* Paywall (locked) */
          <section className="panel paywall">
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "0 0 4px" }}>Unlock your full cognitive report</h2>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>
              You've seen your band and domain profile. Go deeper: every question reviewed and explained, a domain-by-domain
              read, and a designed PDF to keep.
            </p>
            <div className="prod-grid">
              <div className="prod primary">
                <span className="prod-badge">Best for this test</span>
                <div className="prod-name">{COG.name}</div>
                <div className="prod-price">{formatPrice(COG.priceCents, COG.currency)}</div>
                <div className="prod-blurb">{COG.blurb}</div>
                <ul className="prod-includes">{COG.includes.map((inc, i) => <li key={i}>{inc}</li>)}</ul>
                <button className="btn primary" disabled={busy} onClick={() => onPurchase("cognitive")}>
                  {busy ? "…" : `Unlock — ${formatPrice(COG.priceCents, COG.currency)}`}
                </button>
              </div>
              <div className="prod">
                {ALL.badge && <span className="prod-badge">{ALL.badge}</span>}
                <div className="prod-name">{ALL.name}</div>
                <div className="prod-price">{formatPrice(ALL.priceCents, ALL.currency)}</div>
                <div className="prod-blurb">{ALL.blurb}</div>
                <ul className="prod-includes">{ALL.includes.map((inc, i) => <li key={i}>{inc}</li>)}</ul>
                <button className="btn" disabled={busy} onClick={() => onPurchase("allaccess")}>
                  {busy ? "…" : `Unlock everything — ${formatPrice(ALL.priceCents, ALL.currency)}`}
                </button>
              </div>
            </div>
            {error && <p className="note" style={{ borderLeftColor: "var(--danger)", marginTop: 14 }}>{error}</p>}
            <p className="trust">🔒 No account needed. Secure one-time purchase via Stripe. Your answers stay on your device.</p>
          </section>
        )}

        {/* Caveats (free) */}
        <section className="panel">
          <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
          <ul className="caveats">{test.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer", color: "var(--text-faint)", fontSize: 13 }}>Scientific basis &amp; provenance</summary>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 10 }}>{test.itemProvenance}</p>
            <ul className="cites">{test.citations.map((c, i) => <li key={i}>{c.ref}{c.note ? ` — ${c.note}` : ""}</li>)}</ul>
          </details>
        </section>

        <div className="row-actions no-print">
          <button className="btn" onClick={onRestart}>↻ Retake</button>
          <button className="btn ghost" onClick={onExit}>↩ All assessments</button>
        </div>
      </div>

      <div className="footer">An estimate for curiosity and growth — never a verdict on your worth or potential.</div>
    </div>
  );
}

function ordinal(n: number): string {
  const v = n % 100;
  const s = ["th", "st", "nd", "rd"];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
