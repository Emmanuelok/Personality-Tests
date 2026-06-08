import { Document, Page, Text, View, StyleSheet, Svg, G, Circle, Line, Polygon, pdf } from "@react-pdf/renderer";
import type { AssessmentResult, Instrument, ScaleDef } from "@core/types";
import type { PersonalityReport } from "@core/report";
import { buildGrowthPlan, suggestTargets, type GrowthPlan } from "@core/improvement/plan";

const C = {
  ink: "#2b2418",
  body: "#3a3120",
  sub: "#6c5d44",
  faint: "#8a7a5e",
  accent: "#9a7b2e",   // gold
  accent2: "#27776f",  // teal
  line: "#d9c9a6",
  band: "#efe4cb",     // light parchment header panel
  chip: "#f1e7cf",
  paper: "#f3ead6",
  card: "#fbf6ea",
};

/** A celestial astrolabe seal, drawn natively with react-pdf SVG primitives. */
function CoverSeal({ size = 132 }: { size?: number }) {
  const c = 60;
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2 - Math.PI / 2;
    const long = i % 3 === 0;
    const r2 = long ? 47 : 50;
    return {
      x1: c + 54 * Math.cos(a), y1: c + 54 * Math.sin(a),
      x2: c + r2 * Math.cos(a), y2: c + r2 * Math.sin(a),
      w: long ? 1.1 : 0.6,
    };
  });
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return { x1: c + 15 * Math.cos(a), y1: c + 15 * Math.sin(a), x2: c + (i % 2 ? 23 : 20) * Math.cos(a), y2: c + (i % 2 ? 23 : 20) * Math.sin(a) };
  });
  const star = (x: number, y: number, r: number) =>
    `${x},${y - r} ${x + r * 0.32},${y - r * 0.32} ${x + r},${y} ${x + r * 0.32},${y + r * 0.32} ${x},${y + r} ${x - r * 0.32},${y + r * 0.32} ${x - r},${y} ${x - r * 0.32},${y - r * 0.32}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx={c} cy={c} r={56} stroke={C.accent} strokeWidth={1.2} fill="none" />
      <Circle cx={c} cy={c} r={44} stroke={C.line} strokeWidth={1} fill="none" />
      {ticks.map((t, i) => (
        <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={C.ink} strokeWidth={t.w} />
      ))}
      <G>
        {rays.map((r, i) => (
          <Line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={C.accent} strokeWidth={1.1} />
        ))}
      </G>
      <Polygon points="60,28 64,60 60,64 56,60" fill={C.accent} />
      <Polygon points="60,92 64,60 60,56 56,60" fill={C.sub} />
      <Circle cx={c} cy={c} r={13} fill={C.card} stroke={C.ink} strokeWidth={1.2} />
      <Circle cx={c} cy={c} r={4} fill={C.accent} />
      <Polygon points={star(60, 4, 4)} fill={C.accent} />
      <Polygon points={star(60, 116, 3)} fill={C.accent} />
      <Polygon points={star(4, 60, 3)} fill={C.accent} />
      <Polygon points={star(116, 60, 3)} fill={C.accent} />
    </Svg>
  );
}

const s = StyleSheet.create({
  page: { paddingTop: 54, paddingBottom: 64, paddingHorizontal: 52, fontFamily: "Helvetica", fontSize: 10.5, color: C.body, lineHeight: 1.5, backgroundColor: C.paper },
  cover: { paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0, fontFamily: "Helvetica", color: C.body, backgroundColor: C.paper },
  band: { alignItems: "center", paddingTop: 64, paddingBottom: 26, paddingHorizontal: 52 },
  brand: { fontSize: 11, letterSpacing: 3, color: C.accent, fontFamily: "Helvetica-Bold" },
  coverTitle: { fontFamily: "Times-Bold", fontSize: 38, color: C.ink, marginTop: 16, lineHeight: 1.05, textAlign: "center" },
  coverSub: { fontSize: 13, color: C.sub, marginTop: 10, textAlign: "center" },
  coverMeta: { fontSize: 9.5, color: C.faint, marginTop: 18, textAlign: "center" },
  coverBody: { paddingHorizontal: 60, paddingTop: 22 },
  accentRule: { height: 3, width: 70, backgroundColor: C.accent, marginTop: 20, borderRadius: 2 },

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
          <CoverSeal size={128} />
          <Text style={[s.brand, { marginTop: 16 }]}>PSYCHE ATLAS</Text>
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
        <View style={{ backgroundColor: C.paper, flex: 1, padding: 64, justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, paddingRight: 24 }}>
              <Text style={[s.brand, { fontSize: 14 }]}>PSYCHE ATLAS</Text>
              <Text style={{ fontFamily: "Times-Bold", fontSize: 62, color: C.ink, marginTop: 22, lineHeight: 1.04 }}>{report.title}</Text>
              <Text style={{ fontSize: 18, color: C.sub, marginTop: 12 }}>{report.subtitle}</Text>
              <View style={{ height: 3, width: 90, backgroundColor: C.accent, marginTop: 20, borderRadius: 2 }} />
            </View>
            <CoverSeal size={150} />
          </View>
          <View>
            {report.traits.map((t) => (
              <View key={t.scaleId} style={{ marginBottom: 14 }}>
                <View style={s.rowBetween}>
                  <Text style={{ color: C.ink, fontFamily: "Helvetica-Bold", fontSize: 13 }}>{t.name}</Text>
                  <Text style={{ color: C.faint, fontSize: 11 }}>{Math.round(t.percentile)}th</Text>
                </View>
                <View style={{ height: 9, backgroundColor: C.chip, borderRadius: 5, marginTop: 6 }}>
                  <View style={{ height: 9, width: `${t.normalized}%`, backgroundColor: C.accent, borderRadius: 5 }} />
                </View>
              </View>
            ))}
          </View>
          <Text style={{ color: C.faint, fontSize: 10 }}>
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

/** Build the designed report document element (exposed for rendering/tests). */
export function makeReportDoc(instrument: Instrument, result: AssessmentResult, report: PersonalityReport) {
  const plan = buildGrowthPlan(instrument, result, suggestTargets(instrument, result), { seed: 101 });
  return <ReportDoc instrument={instrument} report={report} plan={plan} />;
}

/** Build the poster document element (exposed for rendering/tests). */
export function makePosterDoc(instrument: Instrument, report: PersonalityReport) {
  return <PosterDoc instrument={instrument} report={report} />;
}

export async function downloadReportPdf(instrument: Instrument, result: AssessmentResult, report: PersonalityReport) {
  const blob = await pdf(makeReportDoc(instrument, result, report)).toBlob();
  triggerDownload(blob, `psyche-atlas-${report.reportId}.pdf`);
}

export async function downloadPosterPdf(instrument: Instrument, _result: AssessmentResult, report: PersonalityReport) {
  const blob = await pdf(makePosterDoc(instrument, report)).toBlob();
  triggerDownload(blob, `psyche-atlas-poster-${report.reportId}.pdf`);
}
