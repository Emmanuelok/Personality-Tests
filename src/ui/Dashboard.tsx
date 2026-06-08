import { useMemo, useState } from "react";
import type { AssessmentResult, Instrument } from "@core/types";
import { INSTRUMENTS } from "@core/instruments";
import { dailyInsight, type SynthEntry } from "@core/synthesis";
import type { Profile } from "../profile";
import { CountUp } from "./CountUp";

function descriptor(inst: Instrument, result: AssessmentResult): string {
  if (result.type) return result.type.code;
  const top = inst.scales
    .map((s) => ({ s, n: result.scales[s.id]?.normalized ?? 50 }))
    .sort((a, b) => Math.abs(b.n - 50) - Math.abs(a.n - 50))[0];
  if (!top) return "View";
  const lvl = top.n >= 50 ? top.s.poles?.high ?? "high" : top.s.poles?.low ?? "low";
  return lvl;
}

export function Dashboard({
  profile,
  entries,
  onBrowse,
  onOpen,
  onStartInstrument,
  onIntegrated,
  onCompatibility,
  onJournal,
  onReset,
}: {
  profile: Profile;
  entries: SynthEntry[];
  onBrowse: () => void;
  onOpen: (instrumentId: string) => void;
  onStartInstrument: (inst: Instrument) => void;
  onIntegrated: () => void;
  onCompatibility: () => void;
  onJournal: (text: string) => void;
  onReset: () => void;
}) {
  const insight = useMemo(() => dailyInsight(entries, profile.name), [entries, profile.name]);
  const completedIds = entries.map((e) => e.instrument.id);
  const recommended = INSTRUMENTS.find((i) => !completedIds.includes(i.id)) ?? null;
  const depth = Math.min(100, Math.round((entries.length / 6) * 100));
  const [note, setNote] = useState("");

  const submitNote = () => {
    if (note.trim()) {
      onJournal(note.trim());
      setNote("");
    }
  };

  return (
    <div className="container view-enter">
      <div className="dash-hero">
        <div>
          <h1 className="dash-hello">
            {insight.greeting.replace(/\.$/, "")}<span className="grad">.</span>
          </h1>
          <p className="dash-sub">
            {entries.length === 0
              ? "Your space is ready. Take your first assessment to begin your portrait."
              : `${entries.length} ${entries.length === 1 ? "assessment" : "assessments"} in your atlas · your integrated self is ${depth}% complete.`}
          </p>
        </div>
        <div className="streak" title="Days in a row you've shown up">
          🔥 <b>{profile.streak.days}</b> day{profile.streak.days === 1 ? "" : "s"}
        </div>
      </div>

      <div className="dash-grid">
        {/* Left column */}
        <div className="stagger" style={{ display: "grid", gap: 18 }}>
          <section className="panel insight-card">
            <div className="eyebrow2">{insight.focus ? "Today's focus" : "Today's nudge"}</div>
            <h3>{insight.title}</h3>
            <p style={{ color: "var(--text-dim)", margin: 0 }}>{insight.insight}</p>
            <div className="practice">🎯 <b>Try today:</b> {insight.practice}</div>
          </section>

          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>Your journey</h3>
            {entries.length === 0 ? (
              <p style={{ color: "var(--text-dim)" }}>Nothing here yet — your completed assessments will live here, ready to revisit anytime.</p>
            ) : (
              <div className="journey">
                {entries.map(({ instrument, result }) => (
                  <div className="jcard" key={instrument.id} onClick={() => onOpen(instrument.id)}>
                    <div className="jicon">{instrument.kind === "typological" ? "🎭" : "📊"}</div>
                    <div className="jbody">
                      <div className="jname">{instrument.name}</div>
                      <div className="jmeta">{result.type ? result.type.title : instrument.tagline}</div>
                    </div>
                    <div className="jtype">{descriptor(instrument, result)}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="row-actions" style={{ justifyContent: "flex-start", marginTop: 14 }}>
              <button className="btn primary" onClick={onBrowse}>＋ {entries.length ? "Take another" : "Take your first"} assessment</button>
            </div>
          </section>

          {recommended && (
            <section className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div className="eyebrow2" style={{ color: "var(--accent-2)", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>Recommended next</div>
                <h3 style={{ margin: "6px 0 2px", fontSize: 19 }}>{recommended.name}</h3>
                <p style={{ color: "var(--text-dim)", margin: 0, fontSize: 14 }}>{recommended.tagline}</p>
              </div>
              <button className="btn" onClick={() => onStartInstrument(recommended)}>Begin →</button>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="stagger" style={{ display: "grid", gap: 18 }}>
          <section className="panel iep-cta">
            <div className="eyebrow2" style={{ color: "var(--accent-2)", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>The whole you</div>
            <h3 style={{ margin: "8px 0 6px", fontFamily: "var(--serif)", fontSize: 22 }}>Your Integrated Self</h3>
            <p style={{ color: "var(--text-dim)", margin: "0 0 6px", fontSize: 14 }}>
              One portrait woven from <b>every</b> test you take — the themes, strengths, tensions, and your personal operating manual.
            </p>
            <div className="depth-meter"><i style={{ width: `${depth}%` }} /></div>
            <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginBottom: 10 }}>
              <CountUp value={depth} suffix="%" /> complete · richer with each assessment
            </div>
            <button className="btn primary" style={{ width: "100%", justifyContent: "center" }} disabled={entries.length === 0} onClick={onIntegrated}>
              {entries.length === 0 ? "Take a test to unlock" : "View my integrated self →"}
            </button>
          </section>

          <section className="panel compat-cta" style={{ display: "block" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>💞 Compatibility</h3>
            <p style={{ color: "var(--text-dim)", margin: "0 0 12px", fontSize: 14 }}>
              Compare with a partner, friend, or teammate on any shared assessment.
            </p>
            <button className="btn" onClick={onCompatibility} style={{ width: "100%", justifyContent: "center" }}>Open compatibility →</button>
          </section>

          <section className="panel">
            <h3 style={{ marginTop: 0, fontSize: 18 }}>📓 Reflection</h3>
            <div className="journal-row">
              <input
                placeholder="A thought, a feeling, a win…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNote();
                }}
              />
              <button className="btn" onClick={submitNote} disabled={!note.trim()}>Save</button>
            </div>
            {profile.journal.slice(0, 3).map((j, i) => (
              <div className="jentry" key={i}>
                <div className="jat">{new Date(j.at).toLocaleDateString()}</div>
                {j.text}
              </div>
            ))}
          </section>

          <button className="btn ghost sm" style={{ justifySelf: "start" }} onClick={onReset}>Reset my space</button>
        </div>
      </div>
    </div>
  );
}
