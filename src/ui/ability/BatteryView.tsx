import { useState } from "react";
import type { Battery } from "@core/ability/chc";
import type { CognitiveTake } from "../../profile";
import { RadarChart, ScaleBar } from "../charts";
import { CategoryEmblem } from "../art";

const CAVEATS = [
  "This battery is an aggregate of separate self-administered tests, often taken on different days and under different conditions — treat it as a rough composite, not a clinical IQ.",
  "Each broad ability is estimated from whatever tests you've completed; the more tests you take, the fuller and steadier the picture.",
  "The overall figure is a simple average of the measured factors, shown as a band — real 'g' estimation is far more involved.",
  "Cognitive ability is one slice of a person. This says nothing about your worth, creativity, character, or potential.",
];

export function BatteryView({
  battery,
  takes,
  name,
  onExit,
}: {
  battery: Battery;
  takes: CognitiveTake[];
  name?: string;
  onExit: () => void;
}) {
  const radar = battery.factors.map((f) => ({ label: f.id, value: f.percentile }));
  const [pdfBusy, setPdfBusy] = useState(false);
  const withChc = takes.filter((t) => t.chc && Object.keys(t.chc).length);

  const exportPdf = async () => {
    setPdfBusy(true);
    try {
      const m = await import("../pdf");
      await m.downloadBatteryPdf(battery);
    } catch (e) {
      console.error("Battery PDF failed", e);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="container view-enter">
      <div className="report-head">
        <span className="report-seal cat-cognition" aria-hidden="true"><CategoryEmblem id="cognition" /></span>
        <div className="supertitle">Full Cognitive Battery</div>
        <h1>{name ? `${name}'s` : "Your"} cognitive profile</h1>
        <div className="subtitle">Woven from {battery.tests} {battery.tests === 1 ? "test" : "tests"} across {battery.factors.length} broad abilities.</div>
      </div>

      <div className="report-grid stagger">
        <section className="panel iq-card">
          <div className="iq-figure">
            <div className="iq-band">Overall estimate</div>
            <div className="iq-range">{battery.iqLow}<span>–</span>{battery.iqHigh}</div>
            <div className="iq-sub">{battery.band} · about the {ordinal(battery.overall)} percentile</div>
          </div>
          <div className="iq-note">
            <p style={{ marginTop: 0 }}>
              Averaged across the abilities you've measured, your composite lands in the <b>{battery.band.toLowerCase()}</b>.
              The shape below — where you peak and dip — usually says more than the single number.
            </p>
            <p className="note" style={{ margin: 0 }}>A rough cross-test composite, not a clinical IQ.</p>
          </div>
        </section>

        <section className="panel">
          <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 22, margin: "0 0 6px" }}>Your CHC broad-ability profile</h3>
          <div className="radar-wrap"><RadarChart data={radar} /></div>
          <div style={{ marginTop: 10 }}>
            {battery.factors.map((f) => (
              <div className="trait" key={f.id} style={{ marginBottom: 10 }}>
                <div className="thead">
                  <h4>{f.name} <small style={{ color: "var(--text-faint)", fontWeight: 400 }}>· {f.id}</small></h4>
                  <span className="level">{ordinal(f.percentile)} pct{f.n > 1 ? ` · ${f.n} tests` : ""}</span>
                </div>
                <ScaleBar value={f.percentile} leftLabel="Lower" rightLabel="Higher" />
                <p className="narr" style={{ marginTop: 8 }}>{f.blurb}</p>
              </div>
            ))}
          </div>
          <div className="row-actions no-print" style={{ justifyContent: "flex-start", marginTop: 14 }}>
            <button className="btn primary" disabled={pdfBusy} onClick={exportPdf}>{pdfBusy ? "Preparing…" : "⤓ Battery report PDF"}</button>
            <button className="btn" onClick={() => window.print()}>🖨 Print</button>
          </div>
        </section>

        <section className="panel sec">
          <h3>Tests in this battery</h3>
          <div className="journey">
            {withChc.map((t, i) => (
              <div className="jcard" key={i} style={{ cursor: "default" }}>
                <div className="jbody">
                  <div className="jname">{t.name}</div>
                  <div className="jmeta">{new Date(t.takenAt).toLocaleDateString()} · contributes {Object.keys(t.chc!).join(", ")}</div>
                </div>
                <span className="jtype">{t.headline}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>Read this honestly</h3>
          <ul className="caveats">{CAVEATS.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </section>

        <div className="row-actions no-print">
          <button className="btn ghost" onClick={onExit}>↩ Back</button>
        </div>
      </div>
      <div className="footer">A composite for curiosity and growth — never a verdict on your worth or potential.</div>
    </div>
  );
}

function ordinal(n: number): string {
  const v = n % 100;
  const s = ["th", "st", "nd", "rd"];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
