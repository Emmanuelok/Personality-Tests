import { downloadText } from "./exports";

/**
 * Calendar (.ics) integration — generate standard iCalendar events that open in
 * Google Calendar, Apple Calendar, Outlook, etc. Used by Study Together to
 * schedule a session to everyone's real calendar. Client-side, no backend.
 */

export interface CalEvent {
  title: string;
  description?: string;
  start: Date;
  durationMin?: number;
  url?: string;
}

function fmt(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function esc(s: string): string {
  return s.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
}
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}@psyche-atlas`;
}

export function buildICS(events: CalEvent[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Psyche Atlas//Study//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    const end = new Date(e.start.getTime() + (e.durationMin ?? 45) * 60000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid()}`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(e.start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${esc(e.title)}`,
    );
    const desc = [e.description, e.url].filter(Boolean).join("\n\n");
    if (desc) lines.push(`DESCRIPTION:${esc(desc)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(filename: string, events: CalEvent[]): void {
  downloadText(filename, buildICS(events), "text/calendar;charset=utf-8");
}

/** A sensible default session: the next occurrence of 18:00 local, tomorrow. */
export function nextEveningSlot(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  return d;
}
