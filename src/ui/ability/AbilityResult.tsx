import { useState } from "react";
import type { AbilityTest, AbilityResult as AR } from "@core/ability";
import { PRODUCTS, formatPrice } from "@core/commerce";
import { RadarChart, ScaleBar } from "../charts";
import { CategoryEmblem } from "../art";
import { downloadCognitiveShareCard } from "../shareCard";
import { Figure } from "./Figure";

const COG = PRODUCTS.find((p) => p.id === "cognitive")!;
const ALL = PRODUCTS.find((p) => p.id === "allaccess")!;
const FULL_REASONING_SET_INCLUDES = [
  "Every question reviewed — what you missed and why",
  "A domain-by-domain review of this sitting",
  "A designed, shareable practice report PDF",
] as const;

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
  const radar = result.perDomain.map((d) => ({ label: d.name.split(" ")[0], value: d.practiceIndex }));
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
        <h1>{name ? `${name}, here's` : "Here's"} your reasoning practice</h1>
        <div className="subtitle">You answered {result.correct} of {result.total} correctly across {result.perDomain.length} domains.</div>
      </div>

      <div className="report-grid stagger">
        {/* Session-specific practice observation (free) */}
        <section className="panel iq-card">
          <div className="iq-figure">
            <div className="iq-band">Practice index</div>
            <div className="iq-range">{result.practiceIndex}<span>/100</span></div>
            <div className="iq-sub">{result.observation}</div>
          </div>
          <div className="iq-note">
            <p style={{ marginTop: 0 }}>
              This index summarizes accuracy and item difficulty for <b>this exact practice set</b>. It helps you review
              this sitting and compare your own future attempts; it is not a population rank or a fixed ability label.
            </p>
            <p className="note" style={{ margin: 0 }}>
              An <b>educational practice observation</b> from a short, self-administered activity—not a clinical assessment.
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
                  <span className="level">{d.correct}/{d.total} · practice {d.practiceIndex}/100</span>
                </div>
                <ScaleBar value={d.practiceIndex} leftLabel="More to practice" rightLabel="More demonstrated" />
                <p className="narr" style={{ marginTop: 8 }}>{d.observation}</p>
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
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "0 0 4px" }}>Unlock the full reasoning-set review</h2>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>
              You've seen your session observation and domain pattern. Go deeper: every question reviewed and explained, a domain-by-domain
              read, and a designed PDF to keep.
            </p>
            <div className="prod-grid">
              <div className="prod primary">
                <span className="prod-badge">Best for this test</span>
                <div className="prod-name">{COG.name}</div>
                <div className="prod-price">{formatPrice(COG.priceCents, COG.currency)}</div>
                <div className="prod-blurb">For this full reasoning set: question review, domain detail, and a PDF.</div>
                <ul className="prod-includes">{FULL_REASONING_SET_INCLUDES.map((inc) => <li key={inc}>{inc}</li>)}</ul>
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

      <div className="footer">A session-specific practice observation for learning—not a verdict about you.</div>
    </div>
  );
}
