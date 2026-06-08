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
  bg.addColorStop(0, "#fbf8ff");
  bg.addColorStop(1, "#f0eaff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Accent glow (soft, playful)
  const glow = ctx.createRadialGradient(W - 170, 130, 40, W - 170, 130, 480);
  glow.addColorStop(0, "rgba(124,92,255,0.22)");
  glow.addColorStop(1, "rgba(124,92,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  const glow2 = ctx.createRadialGradient(110, H - 50, 30, 110, H - 50, 440);
  glow2.addColorStop(0, "rgba(255,93,115,0.18)");
  glow2.addColorStop(1, "rgba(255,93,115,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  const PAD = 72;
  const DISPLAY = "'Baloo 2', system-ui, sans-serif";

  // Brand
  ctx.fillStyle = "#7c5cff";
  ctx.font = `800 26px ${DISPLAY}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("🧭  PSYCHE ATLAS", PAD, 98);

  // Eyebrow
  ctx.fillStyle = "#11a892";
  ctx.font = `700 22px ${DISPLAY}`;
  ctx.fillText((name ? `${name.toUpperCase()}'S ` : "") + instrument.name.toUpperCase(), PAD, 150);

  // Title (wrapped)
  ctx.fillStyle = "#241c52";
  ctx.font = `800 78px ${DISPLAY}`;
  let y = 240;
  for (const line of wrap(ctx, report.title, W - PAD * 2).slice(0, 2)) {
    ctx.fillText(line, PAD, y);
    y += 86;
  }

  // Subtitle / type
  ctx.fillStyle = "#5d5786";
  ctx.font = "600 26px 'Nunito', system-ui, sans-serif";
  const sub = report.type ? `${report.type.code} · ${report.type.title}` : report.subtitle;
  for (const line of wrap(ctx, sub, W - PAD * 2).slice(0, 1)) ctx.fillText(line, PAD, y + 8);

  // Top trait bars
  const ranked = [...report.traits].sort((a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50)).slice(0, 4);
  let by = 432;
  for (const t of ranked) {
    ctx.fillStyle = "#5d5786";
    ctx.font = `700 20px ${DISPLAY}`;
    ctx.fillText(shortLabel(t.name), PAD, by - 6);
    const barX = PAD;
    const barW = W - PAD * 2;
    ctx.fillStyle = "#ece7fb";
    roundRect(ctx, barX, by, barW, 14, 7);
    ctx.fill();
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, "#7c5cff");
    grad.addColorStop(1, "#ff5d73");
    ctx.fillStyle = grad;
    roundRect(ctx, barX, by, Math.max(16, (barW * t.normalized) / 100), 14, 7);
    ctx.fill();
    by += 48;
  }

  // Footer
  ctx.fillStyle = "#918cb4";
  ctx.font = "700 22px 'Nunito', system-ui, sans-serif";
  ctx.fillText("Discover yours — free at Psyche Atlas ✨", PAD, H - 44);

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
