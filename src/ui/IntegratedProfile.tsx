import type { IntegratedProfile as IP } from "@core/synthesis";
import { buildIntegratedKnowledge } from "@core/companion";
import { getInstrument } from "@core/instruments";
import { Companion } from "./Companion";
import { CountUp } from "./CountUp";
import { InstrumentGlyph } from "./art";
import { ScaleBar } from "./charts";
import type { CognitiveTake } from "../profile";

/** A short cross-link pairing a cognitive result with the integrated portrait. */
function reasoningLink(t: CognitiveTake, anchor: string): string {
  if (t.percentile >= 70)
    return `Strong reasoning here is a multiplier for ${anchor} — lean on it when you take on something genuinely new or complex, and let it carry the heavy analytical lifting.`;
  if (t.percentile >= 40)
    return `Dependable reasoning gives you a solid tool; paired with ${anchor}, your edge is less about raw horsepower and more about how deliberately you apply it.`;
  return `Reasoning tests capture just one slice of a mind, and the skills are trainable — your real leverage likely sits in ${anchor}, with reasoning as the supporting act.`;
}

export function IntegratedProfile({ ip, onBack, onBrowse, cognitive }: { ip: IP; onBack: () => void; onBrowse: () => void; cognitive?: CognitiveTake[] }) {
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
        <div className="iep-constellation" aria-hidden="true">
          {ip.instrumentsUsed.map((u) => {
            const cat = getInstrument(u.id)?.category ?? "core";
            return (
              <span className={`tl-ico cat-${cat}`} key={u.id} title={u.name}>
                <InstrumentGlyph id={u.id} category={cat} />
              </span>
            );
          })}
        </div>
        {cognitive && cognitive.length > 0 && (
          <div className="pillars" style={{ marginTop: 16 }}>
            {cognitive.slice(0, 4).map((t, i) => (
              <span className="pill" key={i}><b>{t.name}:</b> {t.headline}</span>
            ))}
          </div>
        )}
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

        {cognitive && cognitive.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>Mind &amp; reasoning</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>
              How your measured reasoning fits the rest of your portrait — a tool in service of who you are, never a verdict on it.
            </p>
            {cognitive.map((t, i) => (
              <div className="cdim" key={i}>
                <div className="top">
                  <b>{t.name}</b>
                  <span className="vals">{t.headline} · {Math.round(t.percentile)}th pct</span>
                </div>
                <ScaleBar value={t.percentile} leftLabel="Lower" rightLabel="Higher" />
                <div className="note" style={{ marginTop: 6 }}>
                  {reasoningLink(t, ip.themes[0]?.name ? `your "${ip.themes[0].name}" thread` : ip.strengths[0] ? "your standout strengths" : "the rest of your strengths")}
                </div>
              </div>
            ))}
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
