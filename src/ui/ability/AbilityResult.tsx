import type { AbilityTest, AbilityResult as AR } from "@core/ability";
import { RadarChart, ScaleBar } from "../charts";
import { CategoryEmblem } from "../art";
import { Figure } from "./Figure";

export function AbilityResult({
  test,
  result,
  name,
  onRestart,
  onExit,
}: {
  test: AbilityTest;
  result: AR;
  name?: string;
  onRestart: () => void;
  onExit: () => void;
}) {
  const radar = result.perDomain.map((d) => ({ label: d.name.split(" ")[0], value: d.percentile }));

  return (
    <div className="container view-enter">
      <div className="report-head">
        <span className="report-seal cat-cognition" aria-hidden="true">
          <CategoryEmblem id="cognition" />
        </span>
        <div className="supertitle">{test.name} · Estimated Profile</div>
        <h1>{name ? `${name}, here's` : "Here's"} your reasoning profile</h1>
        <div className="subtitle">You answered {result.correct} of {result.total} correctly across four reasoning domains.</div>
      </div>

      <div className="report-grid stagger">
        {/* Headline estimate */}
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
              This is an <b>educational estimate</b> from a short, self-administered test — <b>not</b> a clinical IQ score.
              A real assessment is given one-to-one by a trained psychologist. Treat this as a fun, rough snapshot.
            </p>
          </div>
        </section>

        {/* Domain radar + bars */}
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
        </section>

        {/* Per-question review */}
        <section className="panel sec">
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
                        {oi === chosen && oi !== it.answer && <i> ✗ your answer</i>}
                      </span>
                    );
                  })}
                </div>
                <p className="qr-explain">{it.explain}</p>
              </div>
            );
          })}
        </section>

        {/* Caveats */}
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
          <button className="btn" onClick={() => window.print()}>🖨 Print / Save PDF</button>
          <button className="btn" onClick={onRestart}>↻ Retake</button>
          <button className="btn ghost" onClick={onExit}>↩ All assessments</button>
        </div>
      </div>

      <div className="footer">
        An estimate for curiosity and growth — never a verdict on your worth or potential.
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const v = n % 100;
  const s = ["th", "st", "nd", "rd"];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
