import type { PersonalityReport } from "@core/report";

export function PackStep({
  report,
  done,
  total,
  name,
  onContinue,
  onSkip,
}: {
  report: PersonalityReport;
  done: number;
  total: number;
  name?: string;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const isLast = done >= total;
  return (
    <div className="container view-enter">
      <div className="report-head">
        <div className="supertitle">Guided start · {done} of {total}</div>
        <h1>{report.title}</h1>
        <div className="subtitle">{report.type ? `${report.type.code} · ${report.type.title}` : report.subtitle}</div>
      </div>

      <div className="panel" style={{ textAlign: "center" }}>
        <div className="pack-dots">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < done ? "on" : ""} />
          ))}
        </div>
        <p className="lead-para" style={{ maxWidth: 640, margin: "16px auto" }}>{report.overview[1] ?? report.overview[0]}</p>
        <div className="row-actions" style={{ justifyContent: "center" }}>
          <button className="btn primary" onClick={onContinue} style={{ fontSize: 16, padding: "13px 26px" }}>
            {isLast ? `See ${name ? `${name}'s` : "your"} Integrated Self →` : "Continue →"}
          </button>
          <button className="btn ghost" onClick={onSkip}>Skip the rest</button>
        </div>
        <p className="trust" style={{ marginTop: 14 }}>
          {isLast
            ? "We'll now weave all three into one portrait of you."
            : "Your full report for this one is saved — open it anytime from your dashboard."}
        </p>
      </div>
    </div>
  );
}
