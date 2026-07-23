import { useMemo } from "react";
import type { IntegratedProfile as IP, SynthEntry } from "@core/synthesis";
import { buildIntegratedKnowledge } from "@core/companion";
import { reasoningLink, reasoningAnchor, synthLoc } from "@core/synthesis.i18n";
import { buildWellbeingProgram } from "@core/wellbeingagent";
import { downloadIntegratedMarkdown } from "./exports";
import { downloadICS, nextEveningSlot, eveningSeries, type CalEvent } from "./calendar";
import { getInstrument } from "@core/instruments";
import { Companion } from "./Companion";
import { CountUp } from "./CountUp";
import { InstrumentGlyph } from "./art";
import { ScaleBar, RadarChart } from "./charts";
import { useI18n } from "../i18n";
import type { CognitiveTake } from "../profile";

export function IntegratedProfile({ ip, entries = [], onBack, onBrowse, cognitive }: { ip: IP; entries?: SynthEntry[]; onBack: () => void; onBrowse: () => void; cognitive?: CognitiveTake[] }) {
  const { t, locale } = useI18n();
  const loc = synthLoc(locale);
  const anchor = reasoningAnchor(ip.themes[0]?.name, ip.strengths.length > 0, loc);
  // Wellbeing Coach — an auto-built, focused plan for the portrait's growth edge.
  const coach = useMemo(() => buildWellbeingProgram(entries, { locale }), [entries, locale]);
  const scheduleCoach = () => {
    const slots = eveningSeries(nextEveningSlot(), coach.practices.length, 2);
    const events: CalEvent[] = coach.practices.map((p, i) => ({
      title: `${t("iep.coach")}: ${p.title}`,
      description: `${coach.focusDimensionName ?? ""}${p.cadence ? ` · ${p.cadence}` : ""}${p.evidence ? `\n${p.evidence}` : ""}`,
      start: slots[i] ?? nextEveningSlot(),
      durationMin: 20,
    }));
    if (events.length) downloadICS("wellbeing-coach.ics", events);
  };
  return (
    <div className="container view-enter">
      <div className="iep-hero">
        <div className="sub" style={{ textTransform: "uppercase", fontSize: 12.5, letterSpacing: 2 }}>
          {ip.name ? t("iep.titleNamed").replace("{name}", ip.name) : t("iep.titleYours")}
        </div>
        <h1>{ip.headline}</h1>
        <div className="subtitle" style={{ color: "var(--text-dim)" }}>{ip.subhead}</div>
        <div style={{ maxWidth: 320, margin: "16px auto 0" }}>
          <div className="depth-meter"><i style={{ width: `${ip.depth}%` }} /></div>
          <div style={{ fontSize: 12, color: "var(--text-faint)" }}>
            {t("iep.depth")}: <CountUp value={ip.depth} suffix="%" /> · {t("iep.woven").replace("{n}", String(ip.instrumentsUsed.length))}
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
          <Companion knowledge={buildIntegratedKnowledge(ip, coach.state === "ready" && coach.practices.length ? { focus: coach.focusDimensionName, band: coach.focusBand, practices: coach.practices.map((p) => ({ title: p.title, cadence: p.cadence })) } : undefined)} />
        </section>

        {ip.themes.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>{t("iep.threads")}</h3>
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
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>{t("iep.manual")}</h3>
          <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{t("iep.manualSub")}</p>
          <div className="om-grid">
            {ip.operatingManual.map((o, i) => (
              <div className="om-item" key={i}>
                <div className="om-label">{o.label}</div>
                <div style={{ color: "var(--text-dim)", fontSize: 14.5 }}>{o.text}</div>
              </div>
            ))}
          </div>
        </section>

        {ip.convergence.readings.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>{t("iep.crosscheck")}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{t("iep.crosscheckSub")}</p>
            {ip.convergence.readings.map((r) => (
              <div className="xcheck" key={r.id}>
                <div className="xc-top">
                  <h4>{r.name} <span className="xc-band">· {r.band}</span></h4>
                  <span className={`xc-badge ${r.convergent ? "agree" : r.divergent ? "diverge" : "mixed"}`}>
                    {r.convergent ? "✓ " : r.divergent ? "⚠ " : "≈ "}{t(r.convergent ? "iep.agreeBadge" : r.divergent ? "iep.divergeBadge" : "iep.mixedBadge")}
                  </span>
                </div>
                <ScaleBar value={r.position} leftLabel={r.lowLabel} rightLabel={r.highLabel} />
                <p className="xc-insight">{r.insight}</p>
                <div className="xc-sources">
                  {r.sources.map((s) => (
                    <span className="xc-src" key={s.instrumentId} title={`${s.scaleName} · ${s.position}`}>{s.instrumentName}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {ip.communication && ip.communication.themes.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>{t("iep.comm")}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{t("iep.commSub")}</p>
            {ip.communication.themes.length >= 3 && (
              <div className="radar-wrap" style={{ margin: "4px 0 8px" }}>
                <RadarChart data={ip.communication.themes.map((th) => ({ label: th.highLabel, value: th.score }))} size={300} />
              </div>
            )}
            {ip.communication.themes.map((th) => (
              <div className="xcheck" key={th.id}>
                <div className="xc-top">
                  <h4>{th.name} <span className="xc-band">· {th.band}</span></h4>
                </div>
                <ScaleBar value={th.score} leftLabel={th.lowLabel} rightLabel={th.highLabel} />
                <div className="xc-sources">
                  {th.sources.map((s) => (
                    <span className="xc-src" key={s.instrumentId}>{s.instrumentName}</span>
                  ))}
                </div>
              </div>
            ))}
            <p className="xc-insight">{ip.communication.insight}</p>
          </section>
        )}

        {ip.wellbeing && ip.wellbeing.themes.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>{t("iep.well")}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{t("iep.wellSub")}</p>
            {ip.wellbeing.themes.length >= 3 && (
              <div className="radar-wrap" style={{ margin: "4px 0 8px" }}>
                <RadarChart data={ip.wellbeing.themes.map((th) => ({ label: th.highLabel, value: th.score }))} size={300} />
              </div>
            )}
            {ip.wellbeing.themes.map((th) => (
              <div className="xcheck" key={th.id}>
                <div className="xc-top">
                  <h4>{th.name} <span className="xc-band">· {th.band}</span></h4>
                </div>
                <ScaleBar value={th.score} leftLabel={th.lowLabel} rightLabel={th.highLabel} />
                <div className="xc-sources">
                  {th.sources.map((s) => (
                    <span className="xc-src" key={s.instrumentId}>{s.instrumentName}</span>
                  ))}
                </div>
              </div>
            ))}
            <p className="xc-insight">{ip.wellbeing.insight}</p>
          </section>
        )}

        {coach.state === "ready" && coach.practices.length > 0 && (
          <section className="panel coach-panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 24 }}>{t("iep.coach")}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{t("iep.coachSub")}</p>
            {coach.focusDimensionName && (
              <div className="coach-edge">
                <span className="coach-edge-tag">{t("iep.coachEdge")}</span>
                <span>{coach.focusDimensionName}{coach.focusBand ? ` · ${coach.focusBand}` : ""}</span>
              </div>
            )}
            {coach.narrative.map((line, i) => (
              <p className="coach-line" key={i}>{line}</p>
            ))}
            <ul className="coach-steps">
              {coach.practices.map((p, i) => (
                <li key={i}>
                  <b>{p.title}</b>{p.cadence ? <span className="coach-cadence"> · {p.cadence}</span> : null}
                  {p.evidence ? <span className="coach-ev">{p.evidence}</span> : null}
                </li>
              ))}
            </ul>
            <div className="row-actions">
              <button className="btn" onClick={scheduleCoach}>{t("iep.coachSchedule")}</button>
            </div>
          </section>
        )}

        {ip.responseStyle.summary && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{t("iep.readstyle")}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{ip.responseStyle.summary}</p>
            {ip.responseStyle.flags.map((f) => (
              <div className="rs-flag" key={f.id}>
                <b>{f.label}</b>
                <span>{f.note}</span>
              </div>
            ))}
          </section>
        )}

        {(ip.strengths.length > 0 || ip.growthEdges.length > 0) && (
          <section className="panel">
            <div className="sw">
              <div className="col good">
                <h5>{t("iep.strengths")}</h5>
                <ul>{ip.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="col watch">
                <h5>{t("iep.growth")}</h5>
                <ul>{ip.growthEdges.length ? ip.growthEdges.map((s, i) => <li key={i}>{s}</li>) : <li>{t("iep.noGrowth")}</li>}</ul>
              </div>
            </div>
          </section>
        )}

        {cognitive && cognitive.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{t("iep.mind")}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{t("iep.mindSub")}</p>
            {cognitive.map((ct, i) => (
              <div className="cdim" key={i}>
                <div className="top">
                  <b>{ct.name}</b>
                  <span className="vals">{ct.headline}{ct.practiceIndex == null ? "" : ` · ${ct.practiceIndex}/100 practice index`}</span>
                </div>
                {ct.practiceIndex != null && (
                  <>
                    <ScaleBar value={ct.practiceIndex} leftLabel="More to practice" rightLabel="More demonstrated" />
                    <div className="note" style={{ marginTop: 6 }}>
                      {reasoningLink(ct.practiceIndex, anchor, loc)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </section>
        )}

        {ip.tensions.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{t("iep.tensions")}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{t("iep.tensionsSub")}</p>
            {ip.tensions.map((t, i) => (
              <div className="tension" key={i}>
                <b>{t.title}</b>
                <span style={{ color: "var(--text-dim)" }}>{t.detail}</span>
              </div>
            ))}
          </section>
        )}

        <div className="row-actions">
          <button className="btn primary" onClick={onBrowse}>{t("iep.deepen")}</button>
          <button className="btn" onClick={() => downloadIntegratedMarkdown(ip, {
            title: t("iep.titleYours"), threads: t("iep.threads"), manual: t("iep.manual"),
            crosscheck: t("iep.crosscheck"), readstyle: t("iep.readstyle"), strengths: t("iep.strengths"),
            growth: t("iep.growth"), tensions: t("iep.tensions"), comm: t("iep.comm"), well: t("iep.well"),
            from: t("iep.exportFrom"), generated: t("iep.exportGen"),
          })}>{t("iep.exportMd")}</button>
          <button className="btn ghost" onClick={onBack}>{t("iep.backDash")}</button>
        </div>
      </div>
    </div>
  );
}
