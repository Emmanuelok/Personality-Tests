import type { AssessmentResult, Instrument } from "@core/types";
import type { PersonalityReport } from "@core/report";

/** Render a beautiful 1200×630 share card to PNG and download it. Pure canvas. */
export function downloadShareCard(instrument: Instrument, _result: AssessmentResult, report: PersonalityReport, name?: string) {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b0d17");
  bg.addColorStop(1, "#161a30");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Accent glow
  const glow = ctx.createRadialGradient(W - 180, 120, 40, W - 180, 120, 460);
  glow.addColorStop(0, "rgba(106,92,255,0.5)");
  glow.addColorStop(1, "rgba(106,92,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  const glow2 = ctx.createRadialGradient(120, H - 60, 30, 120, H - 60, 420);
  glow2.addColorStop(0, "rgba(53,214,196,0.35)");
  glow2.addColorStop(1, "rgba(53,214,196,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  const PAD = 72;

  // Brand
  ctx.fillStyle = "#9fa6d8";
  ctx.font = "700 24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("🧭  PSYCHE ATLAS", PAD, 96);

  // Eyebrow
  ctx.fillStyle = "#35d6c4";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText((name ? `${name.toUpperCase()}'S ` : "") + instrument.name.toUpperCase(), PAD, 150);

  // Title (wrapped)
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 76px Georgia, 'Times New Roman', serif";
  let y = 232;
  for (const line of wrap(ctx, report.title, W - PAD * 2).slice(0, 2)) {
    ctx.fillText(line, PAD, y);
    y += 84;
  }

  // Subtitle / type
  ctx.fillStyle = "#c7cbf0";
  ctx.font = "400 26px system-ui, sans-serif";
  const sub = report.type ? `${report.type.code} · ${report.type.title}` : report.subtitle;
  for (const line of wrap(ctx, sub, W - PAD * 2).slice(0, 1)) ctx.fillText(line, PAD, y + 6);

  // Top trait bars
  const ranked = [...report.traits].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50)).slice(0, 4);
  let by = 430;
  for (const t of ranked) {
    ctx.fillStyle = "#aab0cf";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.fillText(shortLabel(t.name), PAD, by - 6);
    const barX = PAD;
    const barW = W - PAD * 2;
    ctx.fillStyle = "#242a45";
    roundRect(ctx, barX, by, barW, 12, 6);
    ctx.fill();
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, "#8b7bff");
    grad.addColorStop(1, "#35d6c4");
    ctx.fillStyle = grad;
    roundRect(ctx, barX, by, Math.max(14, (barW * t.normalized) / 100), 12, 6);
    ctx.fill();
    by += 46;
  }

  // Footer
  ctx.fillStyle = "#7a82a8";
  ctx.font = "400 22px system-ui, sans-serif";
  ctx.fillText("Discover yours — take the assessment free at Psyche Atlas", PAD, H - 44);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psyche-atlas-card-${report.reportId}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shortLabel(name: string): string {
  if (name.includes("·")) return name.split("·")[1].trim();
  if (name.includes("–")) return name.split("–")[0].trim();
  return name;
}
