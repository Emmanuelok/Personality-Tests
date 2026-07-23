import { useMemo, useState } from "react";
import { getInstrument } from "@core/instruments";
import { scoreAssessment } from "@core/scoring";
import { compareTakes, changeNarrative, type RetakeComparison } from "@core/growth";
import { computeMilestones } from "@core/milestones";
import type { SynthEntry } from "@core/synthesis";
import { InstrumentGlyph } from "./art";
import { localizeInstrument } from "@core/instruments/i18n";
import { calibConsent, setCalibConsent } from "../calibration";
import { exportEncryptedProfileCode, importEncryptedProfileCode, latestResult, completedInstrumentIds, type Profile, type SavedResult } from "../profile";
import { useI18n } from "../i18n";

export function Growth({ profile, onBrowse, onBack, onBattery, onImport, onOpenResult, onOpenCognitive }: { profile: Profile; onBrowse: () => void; onBack: () => void; onBattery?: () => void; onImport?: (p: Profile) => void; onOpenResult?: (resultId: string) => void; onOpenCognitive?: (resultId: string) => void }) {
  const { t, locale } = useI18n();
  const timeline = useMemo(() => {
    const rows: { at: string; name: string; type?: string; id: string; category: string; resultId: string }[] = [];
    for (const h of profile.history) {
      const inst = getInstrument(h.instrumentId);
      if (!inst) continue;
      const res = scoreAssessment(inst, h.responses, { resultId: h.resultId });
      rows.push({ at: h.takenAt, name: localizeInstrument(inst, locale).name, type: res.type?.code, id: inst.id, category: inst.category, resultId: h.resultId });
    }
    return rows;
  }, [profile, locale]);

  const entries = useMemo<SynthEntry[]>(() => {
    const out: SynthEntry[] = [];
    for (const id of completedInstrumentIds(profile)) {
      const inst = getInstrument(id);
      const saved = latestResult(profile, id);
      if (inst && saved) out.push({ instrument: inst, result: scoreAssessment(inst, saved.responses, { resultId: saved.resultId }) });
    }
    return out;
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
          scoreAssessment(inst, earliest.responses, { resultId: earliest.resultId }),
          latest.takenAt,
          scoreAssessment(inst, latest.responses, { resultId: latest.resultId }),
          takes.length,
        ),
      );
    }
    return out;
  }, [profile]);

  const ms = computeMilestones(entries, { streakDays: profile.streak.days, cognitiveCount: profile.cognitiveHistory?.length ?? 0, locale });

  const [code, setCode] = useState("");
  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState("");
  const [consent, setConsent] = useState(calibConsent());
  const [backupPassphrase, setBackupPassphrase] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);

  return (
    <div className="container view-enter">
      <div className="iep-hero">
        <div className="sub" style={{ textTransform: "uppercase", fontSize: 12.5, letterSpacing: 2 }}>{t("jr.eyebrow")}</div>
        <h1>{t("jr.title")}</h1>
        <div className="subtitle" style={{ color: "var(--text-dim)" }}>{t("jr.sub")}</div>
      </div>

      <div className="report-grid stagger">
        <section className="panel">
          <div className="ms-panel-head" style={{ marginBottom: 4 }}>
            <h3 style={{ marginTop: 0, marginBottom: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{t("home.milestones")}</h3>
            <span className="ms-count">{ms.achievedCount} / {ms.total}</span>
          </div>
          <div className="ms-grid">
            {ms.all.map((m) => (
              <div className={`ms ${m.achieved ? "on" : ""}`} key={m.id} title={m.blurb}>
                <span className="ms-ic">{m.achieved ? m.icon : "🔒"}</span>
                <span>{m.title}</span>
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
                {localizeInstrument(getInstrument(c.instrumentId)!, locale).name} — {t("jr.howChanged")}
              </h3>
              <p style={{ color: "var(--text-faint)", marginTop: 0, fontSize: 13 }}>
                {t("jr.takes").replace("{n}", String(c.takes))} · {new Date(c.firstAt).toLocaleDateString(locale)} → {new Date(c.latestAt).toLocaleDateString(locale)}
                {c.typeFirst && c.typeLatest && c.typeFirst !== c.typeLatest ? ` · ${c.typeFirst} → ${c.typeLatest}` : ""}
              </p>
              <p className="lead-para" style={{ fontSize: 15 }}>{changeNarrative(c, locale)}</p>
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
            <h3 style={{ marginTop: 0 }}>{t("jr.trackTitle")}</h3>
            <p style={{ color: "var(--text-dim)" }}>{t("jr.trackBody")}</p>
            <button className="btn primary" onClick={onBrowse}>{t("jr.retakeCta")}</button>
          </section>
        )}

        {(profile.cognitiveHistory?.length ?? 0) > 0 && (
          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{t("jr.cognitive")}</h3>
              {onBattery && <button className="btn sm" onClick={onBattery}>{t("jr.viewBattery")}</button>}
            </div>
            <div className="journey" style={{ marginTop: 14 }}>
              {profile.cognitiveHistory!.map((ct, i) => (
                <div className="jcard" key={i} style={{ cursor: "default" }}>
                  <span className="jicon cat-cognition"><span className="tl-ico"><InstrumentGlyph id={ct.id} category="cognition" /></span></span>
                  <div className="jbody">
                    <div className="jname">{ct.name}</div>
                    <div className="jmeta">{new Date(ct.takenAt).toLocaleDateString(locale)}{ct.practiceIndex == null ? "" : ` · ${ct.practiceIndex}/100 practice index`}</div>
                  </div>
                  <span className="jtype">{ct.headline}</span>
                  {ct.resultId && ct.stored && onOpenCognitive && (
                    <button className="btn sm ghost" onClick={() => onOpenCognitive(ct.resultId!)}>Open</button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="panel">
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{t("jr.timeline")}</h3>
          {timeline.length === 0 && <p style={{ color: "var(--text-dim)" }}>{t("jr.timelineEmpty")}</p>}
          {timeline.map((row, i) => (
            <div className="tl-row" key={i}>
              <span className={`tl-ico cat-${row.category}`} aria-hidden="true"><InstrumentGlyph id={row.id} category={row.category} /></span>
              <span className="tl-date">{new Date(row.at).toLocaleDateString(locale)}</span>
              <span className="tl-name">{row.name}</span>
              {row.type && <span className="jtype">{row.type}</span>}
              {onOpenResult && <button className="btn sm ghost" onClick={() => onOpenResult(row.resultId)}>Open</button>}
            </div>
          ))}
        </section>

        <section className="panel">
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{t("jr.backupTitle")}</h3>
          <p style={{ color: "var(--text-dim)", marginTop: 0, fontSize: 14.5 }}>{t("jr.backupBody")}</p>
          <p className="trust">
            This encrypted backup contains your display name, goals, raw assessment answers, journal entries, and local result snapshots.
            Anyone with both the code and passphrase can read it. Send them separately and only to someone you choose.
          </p>
          <label className="onb-step-label" htmlFor="backup-passphrase">Backup passphrase (10+ characters)</label>
          <input
            id="backup-passphrase"
            className="name-input"
            type="password"
            autoComplete="new-password"
            value={backupPassphrase}
            onChange={(event) => setBackupPassphrase(event.target.value)}
          />
          <div className="row-actions" style={{ justifyContent: "flex-start" }}>
            <button className="btn sm" disabled={backupPassphrase.trim().length < 10 || backupBusy} onClick={async () => {
              setBackupBusy(true);
              setStatus("");
              try {
                setCode(await exportEncryptedProfileCode(profile, backupPassphrase));
              } catch {
                setStatus("Encrypted backup could not be created in this browser.");
              } finally {
                setBackupBusy(false);
              }
            }}>{backupBusy ? "…" : t("jr.genCode")}</button>
            {code && <button className="btn sm ghost" onClick={() => { navigator.clipboard?.writeText(code); setStatus(t("jr.copied")); }}>{t("jr.copy")}</button>}
          </div>
          {code && <textarea className="code-input" readOnly value={code} style={{ marginTop: 10 }} onFocus={(e) => e.currentTarget.select()} />}
          <div style={{ marginTop: 16 }}>
            <textarea className="code-input" placeholder={t("jr.pastePh")} value={importText} onChange={(e) => setImportText(e.target.value)} />
            <div className="row-actions" style={{ justifyContent: "flex-start", marginTop: 8 }}>
              <button className="btn sm" disabled={!importText.trim() || backupPassphrase.trim().length < 10 || backupBusy} onClick={async () => {
                setBackupBusy(true);
                const p = await importEncryptedProfileCode(importText, backupPassphrase);
                if (p && onImport) { onImport(p); setStatus(t("jr.restored")); setImportText(""); }
                else setStatus(t("jr.invalidCode"));
                setBackupBusy(false);
              }}>{t("jr.restore")}</button>
            </div>
          </div>
          {status && <p className="note" style={{ marginTop: 12 }}>{status}</p>}
          <label className="calib-opt" style={{ marginTop: 16 }}>
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setCalibConsent(e.target.checked); }} />
            <span>{t("jr.calib")}</span>
          </label>
        </section>

        <div className="row-actions">
          <button className="btn primary" onClick={onBrowse}>{t("jr.takeRetake")}</button>
          <button className="btn ghost" onClick={onBack}>← {t("common.back")}</button>
        </div>
      </div>
    </div>
  );
}
