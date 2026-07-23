import { useState } from "react";
import type { Battery } from "@core/ability/chc";
import type { CognitiveTake } from "../../profile";
import { RadarChart, ScaleBar } from "../charts";
import { CategoryEmblem } from "../art";
import { downloadBatteryShareCard } from "../shareCard";

const CAVEATS = [
  "This view combines separate self-administered practice activities, often completed on different days and under different conditions.",
  "Each broad ability is estimated from whatever tests you've completed; the more tests you take, the fuller and steadier the picture.",
  "The combined practice index is a simple average of the measured factors, not a population rank or fixed personal label.",
  "Use the dimension pattern to plan practice and reflection; context and repeat attempts can change it.",
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
  const radar = battery.factors.map((f) => ({ label: f.id, value: f.practiceIndex }));
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
        <div className="supertitle">Learning Practice Overview</div>
        <h1>{name ? `${name}'s` : "Your"} learning practice profile</h1>
        <div className="subtitle">Combined from {battery.tests} {battery.tests === 1 ? "activity" : "activities"} across {battery.factors.length} practice dimensions.</div>
      </div>

      <div className="report-grid stagger">
        <section className="panel iq-card">
          <div className="iq-figure">
            <div className="iq-band">Combined practice index</div>
            <div className="iq-range">{battery.practiceIndex}<span>/100</span></div>
            <div className="iq-sub">{battery.observation}</div>
          </div>
          <div className="iq-note">
            <p style={{ marginTop: 0 }}>
              This combined index averages the task-specific practice observations currently available.
              The shape below—where the activities showed more or less mastery in this sitting—is more useful than the average alone.
            </p>
            <p className="note" style={{ margin: 0 }}>A learning snapshot, not a diagnosis, population rank, or fixed ability statement.</p>
          </div>
        </section>

        <section className="panel">
          <h3 className="sec" style={{ fontFamily: "var(--serif)", fontSize: 22, margin: "0 0 6px" }}>Your practice pattern by dimension</h3>
          <div className="radar-wrap"><RadarChart data={radar} /></div>
          <div style={{ marginTop: 10 }}>
            {battery.factors.map((f) => (
              <div className="trait" key={f.id} style={{ marginBottom: 10 }}>
                <div className="thead">
                  <h4>{f.name} <small style={{ color: "var(--text-faint)", fontWeight: 400 }}>· {f.id}</small></h4>
                  <span className="level">{f.practiceIndex}/100{f.n > 1 ? ` · ${f.n} activities` : ""}</span>
                </div>
                <ScaleBar value={f.practiceIndex} leftLabel="More to practice" rightLabel="More demonstrated" />
                <p className="narr" style={{ marginTop: 8 }}>{f.blurb}</p>
              </div>
            ))}
          </div>
          <div className="row-actions no-print" style={{ justifyContent: "flex-start", marginTop: 14 }}>
            <button className="btn primary" disabled={pdfBusy} onClick={exportPdf}>{pdfBusy ? "Preparing…" : "⤓ Battery report PDF"}</button>
            <button className="btn" onClick={() => downloadBatteryShareCard(battery, name)}>📣 Share card</button>
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
      <div className="footer">A changing, session-specific learning snapshot—not a verdict about you.</div>
    </div>
  );
}
