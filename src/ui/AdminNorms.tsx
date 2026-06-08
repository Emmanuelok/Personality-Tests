import { useEffect, useState } from "react";
import { INSTRUMENTS } from "@core/instruments";
import { fetchNorms } from "../calibration";

/**
 * Operator view of the opt-in calibration data: per-instrument, per-scale 0–100
 * histograms with response counts. Reached via the ?admin URL param. Shows only
 * instruments that have accumulated data (empty without a configured KV backend).
 */
export function AdminNorms({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Record<string, Record<string, number[]>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    Promise.all(INSTRUMENTS.map(async (i) => [i.id, await fetchNorms(i.id)] as const)).then((pairs) => {
      if (!on) return;
      const out: Record<string, Record<string, number[]>> = {};
      for (const [id, norms] of pairs) if (norms) out[id] = norms;
      setData(out);
      setLoading(false);
    });
    return () => { on = false; };
  }, []);

  const withData = INSTRUMENTS.filter((i) => data[i.id]);
  const totalResponses = Object.values(data).reduce(
    (s, scales) => s + Object.values(scales).reduce((a, h) => a + h.reduce((x, y) => x + y, 0), 0),
    0,
  );

  return (
    <div className="container view-enter">
      <div className="report-head">
        <div className="supertitle">Operator · Calibration</div>
        <h1>Norms dashboard</h1>
        <div className="subtitle">
          {loading ? "Loading…" : withData.length ? `${withData.length} instruments with data · ${totalResponses.toLocaleString()} contributed scale scores` : "No calibration data yet."}
        </div>
      </div>

      <div className="report-grid stagger">
        {!loading && !withData.length && (
          <section className="panel">
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>
              Nothing has accumulated yet. Calibration data appears here once users opt in (in the Journey) and the
              serverless KV store is configured (set <code>KV_REST_API_URL</code> / <code>KV_URL</code>). Until then this
              is expected to be empty — the app falls back to its built-in model norms.
            </p>
            <button className="btn ghost" onClick={onBack}>↩ Back</button>
          </section>
        )}

        {withData.map((inst) => {
          const scales = data[inst.id];
          return (
            <section className="panel" key={inst.id}>
              <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 20 }}>{inst.name}</h3>
              {inst.scales.filter((s) => scales[s.id]).map((s) => {
                const hist = scales[s.id];
                const n = hist.reduce((a, b) => a + b, 0);
                const max = Math.max(1, ...hist);
                return (
                  <div key={s.id} style={{ marginBottom: 14 }}>
                    <div className="rowBetween" style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <b>{s.name}</b><span style={{ color: "var(--text-faint)" }}>n = {n}</span>
                    </div>
                    <div className="nh-bars">
                      {hist.map((c, i) => (
                        <div className="nh-bar" key={i} title={`${i * 10}–${i * 10 + 10}: ${c}`} style={{ height: `${(c / max) * 100}%` }} />
                      ))}
                    </div>
                    <div className="nh-axis"><span>0</span><span>50</span><span>100</span></div>
                  </div>
                );
              })}
            </section>
          );
        })}

        {!loading && withData.length > 0 && (
          <div className="row-actions"><button className="btn ghost" onClick={onBack}>↩ Back</button></div>
        )}
      </div>
    </div>
  );
}
