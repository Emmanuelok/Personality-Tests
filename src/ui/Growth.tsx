import { useMemo } from "react";
import { getInstrument } from "@core/instruments";
import { scoreAssessment } from "@core/scoring";
import { compareTakes, milestones, type RetakeComparison } from "@core/growth";
import { InstrumentGlyph } from "./art";
import type { Profile, SavedResult } from "../profile";

export function Growth({ profile, onBrowse, onBack, onBattery }: { profile: Profile; onBrowse: () => void; onBack: () => void; onBattery?: () => void }) {
  const timeline = useMemo(() => {
    const rows: { at: string; name: string; type?: string; id: string; category: string }[] = [];
    for (const h of profile.history) {
      const inst = getInstrument(h.instrumentId);
      if (!inst) continue;
      const res = scoreAssessment(inst, h.responses);
      rows.push({ at: h.takenAt, name: inst.name, type: res.type?.code, id: inst.id, category: inst.category });
    }
    return rows;
  }, [profile]);

  const comparisons = useMemo<RetakeComparison[]>(() => {
    const groups: Record<string, SavedResult[]> = {};
    for (const h of profile.history) (groups[h.instrumentId] ??= []).push(h);
    const out: RetakeComparison[] = [];
    for (const [id, takes] of Object.entries(groups)) {
      if (takes.length < 2) continue;
      const inst = getInstrument(id);
      if (!inst) continue;
      const sorted = [...takes].sort((a, b) => +new Date(a.takenAt) - +new Date(b.takenAt));
      const earliest = sorted[0];
      const latest = sorted[sorted.length - 1];
      out.push(
        compareTakes(
          inst,
          earliest.takenAt,
          scoreAssessment(inst, earliest.responses),
          latest.takenAt,
          scoreAssessment(inst, latest.responses),
          takes.length,
        ),
      );
    }
    return out;
  }, [profile]);

  const distinct = new Set(profile.history.map((h) => h.instrumentId)).size;
  const ms = milestones(distinct, profile.history.length, profile.streak.days);

  return (
    <div className="container view-enter">
      <div className="iep-hero">
        <div className="sub" style={{ textTransform: "uppercase", fontSize: 12.5, letterSpacing: 2 }}>Your Journey</div>
        <h1>Growth over time</h1>
        <div className="subtitle" style={{ color: "var(--text-dim)" }}>
          Personality is changeable. Retake any assessment later to see how far you've moved.
        </div>
      </div>

      <div className="report-grid stagger">
        <section className="panel">
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>Milestones</h3>
          <div className="ms-grid">
            {ms.map((m, i) => (
              <div className={`ms ${m.reached ? "on" : ""}`} key={i}>
                <span className="ms-ic">{m.reached ? m.icon : "🔒"}</span>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {comparisons.length > 0 ? (
          comparisons.map((c) => (
            <section className="panel" key={c.instrumentId}>
              <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`tl-ico cat-${getInstrument(c.instrumentId)?.category ?? "core"}`} aria-hidden="true" style={{ width: 26, height: 26 }}>
                  <InstrumentGlyph id={c.instrumentId} category={getInstrument(c.instrumentId)?.category ?? "core"} />
                </span>
                {c.instrumentName} — how you've changed
              </h3>
              <p style={{ color: "var(--text-faint)", marginTop: 0, fontSize: 13 }}>
                {c.takes} takes · {new Date(c.firstAt).toLocaleDateString()} → {new Date(c.latestAt).toLocaleDateString()}
                {c.typeFirst && c.typeLatest && c.typeFirst !== c.typeLatest ? ` · ${c.typeFirst} → ${c.typeLatest}` : ""}
              </p>
              {[...c.deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 6).map((d) => (
                <div className="delta-row" key={d.scaleId}>
                  <span className="dl-name">{d.name}</span>
                  <span className="dl-track">
                    <span className="dl-first" style={{ left: `${d.first}%` }} title={`was ${d.first}`} />
                    <span className="dl-latest" style={{ left: `${d.latest}%` }} title={`now ${d.latest}`} />
                    <span className="dl-line" style={{ left: `${Math.min(d.first, d.latest)}%`, width: `${Math.abs(d.delta)}%` }} />
                  </span>
                  <span className={`dl-delta ${d.delta > 0 ? "up" : d.delta < 0 ? "down" : ""}`}>
                    {d.delta > 0 ? "▲" : d.delta < 0 ? "▼" : "="} {d.delta > 0 ? "+" : ""}{d.delta}
                  </span>
                </div>
              ))}
            </section>
          ))
        ) : (
          <section className="panel">
            <h3 style={{ marginTop: 0 }}>Track real change</h3>
            <p style={{ color: "var(--text-dim)" }}>
              You haven't retaken any assessment yet. Come back in a few weeks and retake one — this is where you'll see
              exactly which traits moved, and by how much, against your growth plan.
            </p>
            <button className="btn primary" onClick={onBrowse}>Retake or take an assessment →</button>
          </section>
        )}

        {(profile.cognitiveHistory?.length ?? 0) > 0 && (
          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 22 }}>Cognitive tests</h3>
              {onBattery && <button className="btn sm" onClick={onBattery}>View full battery →</button>}
            </div>
            <div className="journey" style={{ marginTop: 14 }}>
              {profile.cognitiveHistory!.map((t, i) => (
                <div className="jcard" key={i} style={{ cursor: "default" }}>
                  <span className="jicon cat-cognition"><span className="tl-ico"><InstrumentGlyph id={t.id} category="cognition" /></span></span>
                  <div className="jbody">
                    <div className="jname">{t.name}</div>
                    <div className="jmeta">{new Date(t.takenAt).toLocaleDateString()} · ~{Math.round(t.percentile)}th percentile</div>
                  </div>
                  <span className="jtype">{t.headline}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="panel">
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>Timeline</h3>
          {timeline.length === 0 && <p style={{ color: "var(--text-dim)" }}>Your assessment history will appear here.</p>}
          {timeline.map((t, i) => (
            <div className="tl-row" key={i}>
              <span className={`tl-ico cat-${t.category}`} aria-hidden="true"><InstrumentGlyph id={t.id} category={t.category} /></span>
              <span className="tl-date">{new Date(t.at).toLocaleDateString()}</span>
              <span className="tl-name">{t.name}</span>
              {t.type && <span className="jtype">{t.type}</span>}
            </div>
          ))}
        </section>

        <div className="row-actions">
          <button className="btn primary" onClick={onBrowse}>＋ Take or retake an assessment</button>
          <button className="btn ghost" onClick={onBack}>← Back</button>
        </div>
      </div>
    </div>
  );
}
