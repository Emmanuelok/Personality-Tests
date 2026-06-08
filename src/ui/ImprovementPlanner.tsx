import { useMemo, useState } from "react";
import type { AssessmentResult, Instrument } from "@core/types";
import { buildGrowthPlan, type GrowthPlan, type GrowthTarget } from "@core/improvement/plan";

export function ImprovementPlanner({ instrument, result }: { instrument: Instrument; result: AssessmentResult }) {
  // For many-scale typologies (Enneagram), focus on the most resonant scales.
  const scales = useMemo(() => {
    const list = instrument.scales.filter((s) => result.scales[s.id]);
    if (list.length > 6) {
      return [...list].sort((a, b) => result.scales[b.id].normalized - result.scales[a.id].normalized).slice(0, 6);
    }
    return list;
  }, [instrument, result]);

  const [targets, setTargets] = useState<Record<string, number>>(() => {
    const t: Record<string, number> = {};
    for (const s of scales) t[s.id] = Math.round(result.scales[s.id].normalized);
    return t;
  });
  const [plan, setPlan] = useState<GrowthPlan | null>(null);

  const generate = () => {
    const list: GrowthTarget[] = scales.map((s) => ({ scaleId: s.id, target: targets[s.id] }));
    setPlan(buildGrowthPlan(instrument, result, list));
  };

  return (
    <div className="planner">
      <div className="sec">
        <h3>Your Growth Plan</h3>
        <p>
          This is where the test becomes a tool. Drag each trait to where you'd <em>like</em> to be. The planner
          builds a personalized, evidence-based route from your current standing toward your target — grounded in
          the research that traits are changeable with deliberate practice.
        </p>
      </div>

      <div className="targets no-print">
        {scales.map((s) => {
          const cur = Math.round(result.scales[s.id].normalized);
          return (
            <div className="target-row" key={s.id}>
              <div className="tlabel">
                {s.name}
                <small>Now: {cur} {s.poles ? `· ${cur >= 50 ? s.poles.high : s.poles.low}` : ""}</small>
              </div>
              <div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={targets[s.id]}
                  onChange={(e) => setTargets({ ...targets, [s.id]: Number(e.target.value) })}
                />
                <div className="slider-meta">
                  <span>{s.poles?.low ?? "lower"}</span>
                  <span>{s.poles?.high ?? "higher"}</span>
                </div>
              </div>
              <div className="tval">{targets[s.id]}</div>
            </div>
          );
        })}
      </div>

      <div className="row-actions no-print">
        <button className="btn primary" onClick={generate}>
          {plan ? "↻ Regenerate plan" : "Generate my growth plan"}
        </button>
      </div>

      {plan && (
        <div style={{ marginTop: 22 }}>
          {plan.summary.map((p, i) => (
            <p className="lead-para" key={i}>{p}</p>
          ))}

          <div style={{ marginTop: 18 }}>
            {plan.areas.map((a) => (
              <div className="area" key={a.scaleId}>
                <div className="ahead">
                  <h4>{a.name}</h4>
                  <span className={`badge ${a.direction}`}>
                    {a.direction === "increase" ? "Grow ↑" : a.direction === "decrease" ? "Soften ↓" : "Maintain ◆"}
                  </span>
                  <span className="delta">now {a.current} → target {a.target} ({a.gap > 0 ? "+" : ""}{a.gap})</span>
                </div>
                <p className="rationale">{a.rationale}</p>
                {a.steps.map((st, i) => (
                  <div className="step" key={i}>
                    <div className="stitle">{st.title}</div>
                    <div className="sdetail">{st.detail}</div>
                    <div className="smeta">
                      {st.cadence && <span><b>Cadence:</b> {st.cadence}</span>}
                      {st.evidence && <span><b>Evidence:</b> {st.evidence}</span>}
                    </div>
                  </div>
                ))}
                {a.steps.length === 0 && (
                  <p className="rationale" style={{ margin: 0 }}>
                    No change needed here — protect this as a strength.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="sec" style={{ marginTop: 22 }}>
            <h3>Principles that make change stick</h3>
            <ul>
              {plan.principles.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer", color: "var(--text-faint)", fontSize: 13 }}>
              Evidence base ({plan.citations.length} sources)
            </summary>
            <ul className="cites" style={{ marginTop: 10 }}>
              {plan.citations.map((c, i) => (
                <li key={i}>{c.ref}{c.note ? ` — ${c.note}` : ""}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
