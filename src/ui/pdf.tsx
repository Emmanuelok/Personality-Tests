import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { AssessmentResult, Instrument, ScaleDef } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { buildGrowthPlan, suggestTargets, type GrowthPlan } from "@core/improvement/plan";

const C = {
  ink: "#14162b",
  body: "#2b2f4a",
  sub: "#5b6080",
  faint: "#8a90b0",
  accent: "#6a5cff",
  accent2: "#13b3a3",
  line: "#e6e7f2",
  band: "#1b1e3a",
  chip: "#f1f1fb",
};

const s = StyleSheet.create({
  page: { paddingTop: 54, paddingBottom: 64, paddingHorizontal: 52, fontFamily: "Helvetica", fontSize: 10.5, color: C.body, lineHeight: 1.5 },
  cover: { paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0, fontFamily: "Helvetica", color: C.body },
  band: { backgroundColor: C.band, color: "#fff", paddingTop: 84, paddingBottom: 54, paddingHorizontal: 52 },
  brand: { fontSize: 11, letterSpacing: 3, color: "#9fa6d8", fontFamily: "Helvetica-Bold" },
  coverTitle: { fontFamily: "Times-Bold", fontSize: 40, color: "#ffffff", marginTop: 18, lineHeight: 1.05 },
  coverSub: { fontSize: 13, color: "#c7cbf0", marginTop: 10 },
  coverMeta: { fontSize: 9.5, color: "#8e95cf", marginTop: 22 },
  coverBody: { paddingHorizontal: 52, paddingTop: 30 },
  accentRule: { height: 4, width: 64, backgroundColor: C.accent2, marginTop: 22, borderRadius: 2 },

  h2: { fontFamily: "Times-Bold", fontSize: 17, color: C.ink, marginTop: 18, marginBottom: 7 },
  h3: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: C.ink, marginTop: 11, marginBottom: 3 },
  p: { marginBottom: 7, color: C.body },
  lead: { fontFamily: "Times-Roman", fontSize: 12.5, lineHeight: 1.6, color: "#23263f", marginBottom: 8 },
  small: { fontSize: 8.5, color: C.faint },

  card: { borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 14, marginBottom: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  chip: { backgroundColor: C.chip, color: C.sub, fontSize: 8.5, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 8 },

  barTrack: { height: 7, backgroundColor: C.line, borderRadius: 4, marginTop: 5, marginBottom: 2 },
  barFill: { height: 7, backgroundColor: C.accent, borderRadius: 4 },
  ends: { flexDirection: "row", justifyContent: "space-between" },

  kvRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 3 },
  kvK: { width: 130, color: C.faint, fontSize: 9.5 },
  kvV: { flex: 1, color: C.ink, fontSize: 9.5 },

  bullet: { flexDirection: "row", marginBottom: 3 },
  dot: { width: 10, color: C.accent },
  twoCol: { flexDirection: "row", marginTop: 6 },
  col: { flex: 1, paddingRight: 10 },
  colLabelGood: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#0f8a5f", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  colLabelWatch: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#b9742f", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },

  step: { borderLeftWidth: 2, borderLeftColor: C.accent, paddingLeft: 9, marginBottom: 8 },
  stepTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: C.ink },
  stepMeta: { fontSize: 8.5, color: C.faint, marginTop: 2 },

  badge: { fontSize: 8, fontFamily: "Helvetica-Bold", paddingVertical: 2, paddingHorizontal: 7, borderRadius: 8 },
  footer: { position: "absolute", bottom: 28, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", color: C.faint, fontSize: 8 },
  posterWrap: { flex: 1, padding: 0 },
});

function Bar({ value }: { value: number }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${Math.max(2, Math.min(100, value))}%` }]} />
    </View>
  );
}

function Bullets({ items, color }: { items: string[]; color?: string }) {
  return (
    <View>
      {items.map((it, i) => (
        <View style={s.bullet} key={i}>
          <Text style={[s.dot, color ? { color } : {}]}>•</Text>
          <Text style={{ flex: 1 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

function Footer({ report }: { report: PersonalityReport }) {
  return (
    <View style={s.footer} fixed>
      <Text>Psyche Atlas · uniquely composed for you</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      <Text>#{report.reportId}</Text>
    </View>
  );
}

function ReportDoc({
  instrument,
  report,
  plan,
}: {
  instrument: Instrument;
  report: PersonalityReport;
  plan: GrowthPlan;
}) {
  const scaleById = new Map<string, ScaleDef>(instrument.scales.map((sc) => [sc.id, sc]));
  const badgeColor = (d: string) =>
    d === "increase" ? { backgroundColor: "#e3f7ee", color: "#0f8a5f" } : d === "decrease" ? { backgroundColor: "#fdeede", color: "#b9742f" } : { backgroundColor: C.chip, color: C.sub };

  return (
    <Document title={`Psyche Atlas — ${report.title}`} author="Psyche Atlas">
      {/* Cover */}
      <Page size="A4" style={s.cover}>
        <View style={s.band}>
          <Text style={s.brand}>PSYCHE ATLAS</Text>
          <Text style={s.coverTitle}>{report.title}</Text>
          <Text style={s.coverSub}>{report.subtitle}</Text>
          <View style={s.accentRule} />
          <Text style={s.coverMeta}>
            {instrument.name}
            {report.type ? ` · ${report.type.code}` : ""} · {new Date(report.generatedAt).toLocaleDateString()} · report #{report.reportId}
          </Text>
        </View>
        <View style={s.coverBody}>
          {report.overview.map((p, i) => (
            <Text style={s.lead} key={i}>{p}</Text>
          ))}
          <Text style={[s.small, { marginTop: 16 }]}>
            This report was composed from your full response pattern plus a unique seed — no two reports are ever identical.
          </Text>
        </View>
        <Footer report={report} />
      </Page>

      {/* Body */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Your profile at a glance</Text>
        {report.traits.map((t) => {
          const sd = scaleById.get(t.scaleId);
          return (
            <View key={t.scaleId} style={{ marginBottom: 9 }}>
              <View style={s.rowBetween}>
                <Text style={{ fontFamily: "Helvetica-Bold", color: C.ink }}>{t.name}</Text>
                <Text style={s.small}>{t.level} · {Math.round(t.percentile)}th pct</Text>
              </View>
              <Bar value={t.normalized} />
              {sd?.poles && (
                <View style={s.ends}>
                  <Text style={s.small}>{sd.poles.low}</Text>
                  <Text style={s.small}>{sd.poles.high}</Text>
                </View>
              )}
            </View>
          );
        })}

        {report.type && (
          <View style={[s.card, { marginTop: 10 }]}>
            <View style={s.rowBetween}>
              <Text style={{ fontFamily: "Times-Bold", fontSize: 20, color: C.accent }}>{report.type.code}</Text>
              <Text style={{ fontFamily: "Times-Bold", fontSize: 13, color: C.ink }}>{report.type.title}</Text>
            </View>
            <Text style={{ marginTop: 4, marginBottom: 6 }}>{report.type.summary}</Text>
            {report.type.components.map((c, i) => (
              <View style={s.kvRow} key={i}>
                <Text style={s.kvK}>{c.label}</Text>
                <Text style={s.kvV}>{c.value}{c.detail ? ` · ${c.detail}` : ""}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.h2}>Trait by trait</Text>
        {report.traits.map((t) => (
          <View style={s.card} key={t.scaleId} wrap={false}>
            <View style={s.rowBetween}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, color: C.ink }}>{t.name}</Text>
              <Text style={s.chip}>{t.level} · {t.poleLabel}</Text>
            </View>
            <Text style={{ marginTop: 5 }}>{t.narrative}</Text>
            <View style={s.twoCol}>
              <View style={s.col}>
                <Text style={s.colLabelGood}>Strengths</Text>
                <Bullets items={t.strengths} color="#0f8a5f" />
              </View>
              <View style={s.col}>
                <Text style={s.colLabelWatch}>Watch-outs</Text>
                <Bullets items={t.watchouts} color="#b9742f" />
              </View>
            </View>
          </View>
        ))}

        {report.dynamics.length > 0 && (
          <View wrap={false}>
            <Text style={s.h2}>How your traits interact</Text>
            <Bullets items={report.dynamics} />
          </View>
        )}

        {report.sections.map((sec) => (
          <View key={sec.id} wrap={false}>
            <Text style={s.h3}>{sec.heading}</Text>
            {sec.paragraphs.map((p, i) => (
              <Text style={s.p} key={i}>{p}</Text>
            ))}
            {sec.bullets && sec.bullets.length > 0 && <Bullets items={sec.bullets} />}
          </View>
        ))}

        {report.signatureResponses.length > 0 && (
          <View wrap={false}>
            <Text style={s.h2}>What makes this uniquely yours</Text>
            <Bullets items={report.signatureResponses} color={C.accent2} />
          </View>
        )}

        {/* Growth plan */}
        <Text style={s.h2}>Your growth plan</Text>
        {plan.summary.map((p, i) => (
          <Text style={s.lead} key={i}>{p}</Text>
        ))}
        {plan.areas.map((a) => (
          <View style={s.card} key={a.scaleId} wrap={false}>
            <View style={s.rowBetween}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11.5, color: C.ink }}>{a.name}</Text>
              <Text style={[s.badge, badgeColor(a.direction)]}>
                {a.direction === "increase" ? "GROW" : a.direction === "decrease" ? "SOFTEN" : "MAINTAIN"} · {a.current}→{a.target}
              </Text>
            </View>
            <Text style={{ marginTop: 4, marginBottom: 6, color: C.sub }}>{a.rationale}</Text>
            {a.steps.map((st, i) => (
              <View style={s.step} key={i}>
                <Text style={s.stepTitle}>{st.title}</Text>
                <Text>{st.detail}</Text>
                <Text style={s.stepMeta}>
                  {st.cadence ? `Cadence: ${st.cadence}` : ""}{st.cadence && st.evidence ? "   ·   " : ""}{st.evidence ? `Evidence: ${st.evidence}` : ""}
                </Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={s.h3}>Principles that make change stick</Text>
        <Bullets items={plan.principles} />

        <Text style={[s.small, { marginTop: 16 }]}>{instrument.itemProvenance}</Text>
        {instrument.caveats && (
          <Text style={[s.small, { marginTop: 6 }]}>{instrument.caveats.join("  ·  ")}</Text>
        )}
        <Footer report={report} />
      </Page>
    </Document>
  );
}

function PosterDoc({ instrument, report }: { instrument: Instrument; report: PersonalityReport }) {
  return (
    <Document title={`Psyche Atlas — ${report.title} (poster)`}>
      <Page size="A3" style={s.posterWrap}>
        <View style={{ backgroundColor: C.band, flex: 1, padding: 64, justifyContent: "space-between" }}>
          <View>
            <Text style={[s.brand, { fontSize: 14 }]}>PSYCHE ATLAS</Text>
            <Text style={{ fontFamily: "Times-Bold", fontSize: 64, color: "#fff", marginTop: 24, lineHeight: 1.04 }}>{report.title}</Text>
            <Text style={{ fontSize: 18, color: "#c7cbf0", marginTop: 12 }}>{report.subtitle}</Text>
          </View>
          <View>
            {report.traits.map((t) => (
              <View key={t.scaleId} style={{ marginBottom: 14 }}>
                <View style={s.rowBetween}>
                  <Text style={{ color: "#eef0ff", fontFamily: "Helvetica-Bold", fontSize: 13 }}>{t.name}</Text>
                  <Text style={{ color: "#9fa6d8", fontSize: 11 }}>{Math.round(t.percentile)}th</Text>
                </View>
                <View style={{ height: 9, backgroundColor: "#2a2e55", borderRadius: 5, marginTop: 6 }}>
                  <View style={{ height: 9, width: `${t.normalized}%`, backgroundColor: C.accent2, borderRadius: 5 }} />
                </View>
              </View>
            ))}
          </View>
          <Text style={{ color: "#8e95cf", fontSize: 10 }}>
            {instrument.name}{report.type ? ` · ${report.type.code}` : ""} · #{report.reportId}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadReportPdf(instrument: Instrument, result: AssessmentResult, report: PersonalityReport) {
  const plan = buildGrowthPlan(instrument, result, suggestTargets(instrument, result), { seed: 101 });
  const blob = await pdf(<ReportDoc instrument={instrument} report={report} plan={plan} />).toBlob();
  triggerDownload(blob, `psyche-atlas-${report.reportId}.pdf`);
}

export async function downloadPosterPdf(instrument: Instrument, _result: AssessmentResult, report: PersonalityReport) {
  const blob = await pdf(<PosterDoc instrument={instrument} report={report} />).toBlob();
  triggerDownload(blob, `psyche-atlas-poster-${report.reportId}.pdf`);
}
