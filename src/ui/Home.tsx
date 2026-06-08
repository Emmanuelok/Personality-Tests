import type { ReactNode } from "react";
import type { Instrument } from "@core/types";
import { INSTRUMENTS, instrumentsByCategory } from "@core/instruments";
import { CATEGORIES } from "@core/categories";

export function Home({
  onStart,
  onCompatibility,
  onStartPack,
}: {
  onStart: (instrument: Instrument) => void;
  onCompatibility: () => void;
  onStartPack: () => void;
}) {
  return (
    <div className="container">
      <section className="hero">
        <span className="eyebrow">Know Yourself</span>
        <h1>
          Know yourself with <span className="grad">scientific depth</span>.
          <br /> Then choose who you become.
        </h1>
        <p className="lead">
          {INSTRUMENTS.length} science-backed assessments. One report that's <b>uniquely yours</b> — then a plan
          to actually grow.
        </p>
        <div className="pillars">
          <span className="pill">📚 Built on <b>original, authoritative</b> research</span>
          <span className="pill">🧬 <b>No two reports</b> are ever identical</span>
          <span className="pill">📈 A <b>growth engine</b>, not just a test</span>
          <span className="pill">🔒 <b>Private</b> — answers never leave your device</span>
        </div>
        <div className="row-actions" style={{ marginTop: 26 }}>
          <button className="btn" onClick={onStartPack}>✨&nbsp;Start a guided 3-test pack&nbsp;→</button>
          <button className="btn ghost" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>Browse all {INSTRUMENTS.length}</button>
        </div>
        <p style={{ color: "var(--text-faint)", marginTop: 20, fontSize: 14, fontStyle: "italic" }}>
          {INSTRUMENTS.length} assessments across {CATEGORIES.filter((c) => instrumentsByCategory(c.id).length).length} themes — each a mirror for self-reflection.
        </p>
      </section>

      <h2 className="section-title" id="catalog">Choose an assessment</h2>
      {CATEGORIES.map((cat) => {
        const list = instrumentsByCategory(cat.id);
        if (!list.length) return null;
        return (
          <div className="cat-block" key={cat.id}>
            <div className="cat-head">
              <span className="cat-icon">{cat.icon}</span>
              <div>
                <h3 className="cat-name">{cat.name}</h3>
                <p className="cat-blurb">{cat.blurb}</p>
              </div>
            </div>
            <div className="grid">
              {list.map((inst) => (
                <article className="card" key={inst.id}>
                  <span className="kind">{inst.kind === "typological" ? "Typology" : "Dimensional"}</span>
                  <h3>{inst.name}</h3>
                  <p className="tagline">{inst.tagline}</p>
                  <div className="facts">
                    <span>⏱ {inst.estMinutes} min</span>
                    <span>📝 {inst.items.length} items</span>
                    <span>📐 {inst.scales.length} {inst.kind === "typological" ? "axes" : "factors"}</span>
                  </div>
                  <p className="cite">
                    Grounded in {inst.citations.length} {inst.citations.length === 1 ? "source" : "sources"}, incl.{" "}
                    {inst.citations[0].ref.split("(")[0].trim()}.
                  </p>
                  <button className="btn primary" onClick={() => onStart(inst)}>Begin {inst.shortName} →</button>
                </article>
              ))}
            </div>
          </div>
        );
      })}

      <h2 className="section-title">Just for two</h2>
      <div className="panel compat-cta">
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>💞 Relationship Compatibility</h3>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>
            Take a relational assessment, share your private result code, and compare with a partner, friend, or
            teammate to get a tailored compatibility read — strengths, friction points, and how to bridge them.
          </p>
        </div>
        <button className="btn" onClick={onCompatibility}>Open compatibility →</button>
      </div>

      <h2 className="section-title">How it works</h2>
      <div className="panel">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <Step n="01" title="Answer honestly">Real science — no pop-quiz filler.</Step>
          <Step n="02" title="One-of-a-kind report">Never the same twice — even for your exact type.</Step>
          <Step n="03" title="See yourself clearly">Scores, strengths, blind spots — the real you.</Step>
          <Step n="04" title="Actually grow">An evidence-based plan to change, on purpose.</Step>
        </div>
      </div>

      <p className="note" style={{ marginTop: 24 }}>
        <b>An honest note.</b> These are tools for insight and growth, not clinical diagnoses — a mirror and a
        map, never a verdict.
      </p>

      <div className="footer">
        Psyche Atlas — an open, science-grounded personality platform.
        <br /> Big Five items are public-domain IPIP markers; the other instruments are original measures grounded in
        the cited research, and are not affiliated with the MBTI® or any trademark holder.
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ color: "var(--accent)", fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>{n}</div>
      <h4 style={{ margin: "6px 0 6px", fontSize: 16 }}>{title}</h4>
      <p style={{ color: "var(--text-dim)", fontSize: 14, margin: 0 }}>{children}</p>
    </div>
  );
}
