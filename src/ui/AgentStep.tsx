import type { AgentBrief } from "@core/autopilot";

/**
 * The face of Atlas Autopilot — the narrated interstitial the agent shows before
 * each step it has chosen for you. Presentational; all logic lives in App + the
 * autopilot engine.
 */
export function AgentStep({ brief, nextUpLabel, onContinue, onPause }: {
  brief: AgentBrief;
  nextUpLabel: string;
  onContinue: () => void;
  onPause: () => void;
}) {
  const pct = Math.round(((brief.step - 1) / brief.total) * 100);
  return (
    <div className="container view-enter">
      <section className="agent-stage">
        <div className="agent-aura" aria-hidden="true" />
        <span className="agent-eyebrow"><span className="cmp-dot" /> {brief.eyebrow}</span>
        <h1 className="agent-head">{brief.heading}</h1>

        <div className="agent-track" aria-hidden="true">
          {Array.from({ length: brief.total }).map((_, i) => (
            <span key={i} className={i < brief.step - 1 ? "done" : i === brief.step - 1 ? "on" : ""} />
          ))}
        </div>
        <div className="agent-prog" style={{ ["--p" as string]: `${pct}%` }} />

        {brief.insight && (
          <div className="agent-insight">
            <span aria-hidden="true">✦</span>
            <p>{brief.insight}</p>
          </div>
        )}

        <div className="agent-next">
          <span className="agent-next-label">{nextUpLabel}</span>
          <h3>{brief.nextName}</h3>
          <p>{brief.nextWhy}</p>
          <span className="agent-next-min">⏱ ~{brief.estMinutes} min</span>
        </div>

        <button className="glass-btn primary agent-go" onClick={onContinue}>{brief.begin}</button>
        <button className="linklike agent-pause" onClick={onPause}>{brief.pause}</button>
      </section>
    </div>
  );
}
