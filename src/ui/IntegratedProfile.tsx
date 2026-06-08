import type { IntegratedProfile as IP } from "@core/synthesis";
import { buildIntegratedKnowledge } from "@core/companion";
import { Companion } from "./Companion";
import { CountUp } from "./CountUp";

export function IntegratedProfile({ ip, onBack, onBrowse }: { ip: IP; onBack: () => void; onBrowse: () => void }) {
  return (
    <div className="container view-enter">
      <div className="iep-hero">
        <div className="sub" style={{ textTransform: "uppercase", fontSize: 12.5, letterSpacing: 2 }}>
          {ip.name ? `${ip.name}'s` : "Your"} Integrated Self
        </div>
        <h1>{ip.headline}</h1>
        <div className="subtitle" style={{ color: "var(--text-dim)" }}>{ip.subhead}</div>
        <div style={{ maxWidth: 320, margin: "16px auto 0" }}>
          <div className="depth-meter"><i style={{ width: `${ip.depth}%` }} /></div>
          <div style={{ fontSize: 12, color: "var(--text-faint)" }}>
            Portrait depth: <CountUp value={ip.depth} suffix="%" /> · {ip.instrumentsUsed.length} {ip.instrumentsUsed.length === 1 ? "assessment" : "assessments"} woven together
          </div>
        </div>
      </div>

      <div className="report-grid stagger">
        <section className="panel">
          {ip.overview.map((p, i) => (
            <p className="lead-para" key={i}>{p}</p>
          ))}
        </section>

        <section className="panel">
          <Companion knowledge={buildIntegratedKnowledge(ip)} />
        </section>

        {ip.themes.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>The threads that define you</h3>
            {ip.themes.map((t) => (
              <div className="theme-card" key={t.id}>
                <h4>{t.name}</h4>
                <p style={{ color: "var(--text-dim)", margin: "0 0 4px" }}>{t.narrative}</p>
                <div className="ev">
                  {t.evidence.map((e, i) => (
                    <span key={i}>{e}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="panel">
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>Your operating manual</h3>
          <p style={{ color: "var(--text-dim)", marginTop: 0 }}>How you, specifically, tend to think, decide, work, connect, and cope — synthesized across everything you've taken.</p>
          <div className="om-grid">
            {ip.operatingManual.map((o, i) => (
              <div className="om-item" key={i}>
                <div className="om-label">{o.label}</div>
                <div style={{ color: "var(--text-dim)", fontSize: 14.5 }}>{o.text}</div>
              </div>
            ))}
          </div>
        </section>

        {(ip.strengths.length > 0 || ip.growthEdges.length > 0) && (
          <section className="panel">
            <div className="sw">
              <div className="col good">
                <h5>Your standout strengths</h5>
                <ul>{ip.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="col watch">
                <h5>Your growth frontier</h5>
                <ul>{ip.growthEdges.length ? ip.growthEdges.map((s, i) => <li key={i}>{s}</li>) : <li>No clear low points yet — take a few more tests to sharpen this.</li>}</ul>
              </div>
            </div>
          </section>
        )}

        {ip.tensions.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>Creative tensions</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>The places where different parts of you pull in different directions. Handled with awareness, these are your most interesting edges — not flaws.</p>
            {ip.tensions.map((t, i) => (
              <div className="tension" key={i}>
                <b>{t.title}</b>
                <span style={{ color: "var(--text-dim)" }}>{t.detail}</span>
              </div>
            ))}
          </section>
        )}

        <div className="row-actions">
          <button className="btn primary" onClick={onBrowse}>＋ Deepen it — take another assessment</button>
          <button className="btn ghost" onClick={onBack}>← Back to dashboard</button>
        </div>
      </div>
    </div>
  );
}
