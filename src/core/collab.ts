import { nonce } from "./prng";

/**
 * Study Together — link-shared, privacy-first collaboration.
 *
 * No accounts, no server: a "room" (a shared topic + a curriculum of assessments)
 * is encoded into a shareable link. A friend opens it, joins on their own device,
 * and works the same plan. Members compare progress by exchanging short progress
 * codes — the same client-side, nothing-leaves-your-device model the compatibility
 * feature already uses. Built for students learning a topic together across the world.
 *
 * Pure and framework-agnostic; storage lives in the UI layer (src/collabStore.ts).
 */

export interface StudyRoom {
  id: string;
  title: string;
  /** Canonical origin of the plan: a goal key, category id, instrument id, or "custom". */
  topic: string;
  /** Ordered instrument ids that form the shared curriculum. */
  plan: string[];
  host: string;
  createdAt: string;
}

export interface MemberProgress {
  name: string;
  /** Instrument ids the member has completed. */
  done: string[];
  at: string;
}

const VER = 1;

function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function createRoom(opts: { title: string; plan: string[]; host: string; topic?: string }): StudyRoom {
  return {
    id: nonce(6),
    title: opts.title.trim().slice(0, 70) || "Study room",
    topic: opts.topic ?? "custom",
    plan: [...new Set(opts.plan)].slice(0, 12),
    host: opts.host.trim().slice(0, 40) || "A friend",
    createdAt: new Date().toISOString(),
  };
}

export function encodeRoom(r: StudyRoom): string {
  return b64urlEncode(JSON.stringify({ v: VER, id: r.id, t: r.title, k: r.topic, p: r.plan, h: r.host, c: r.createdAt }));
}

export function decodeRoom(code: string): StudyRoom | null {
  try {
    const o = JSON.parse(b64urlDecode(code.trim().replace(/^.*[?&]study=/, "").split(/[&#]/)[0]));
    if (!o || !Array.isArray(o.p)) return null;
    return {
      id: String(o.id || nonce(6)),
      title: String(o.t || "Study room").slice(0, 70),
      topic: String(o.k || "custom"),
      plan: o.p.filter((x: unknown) => typeof x === "string").slice(0, 12),
      host: String(o.h || "A friend").slice(0, 40),
      createdAt: String(o.c || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

/** A shareable invite link. `origin` is e.g. window.location.origin + pathname. */
export function roomLink(r: StudyRoom, origin: string): string {
  const base = origin.replace(/[?#].*$/, "").replace(/\/$/, "");
  return `${base}/?study=${encodeRoom(r)}`;
}

export function encodeProgress(p: MemberProgress): string {
  return b64urlEncode(JSON.stringify({ n: p.name, d: p.done, a: p.at }));
}

export function decodeProgress(code: string): MemberProgress | null {
  try {
    const o = JSON.parse(b64urlDecode(code.trim()));
    if (!o || !Array.isArray(o.d)) return null;
    return {
      name: String(o.n || "A friend").slice(0, 40),
      done: o.d.filter((x: unknown) => typeof x === "string"),
      at: String(o.a || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export interface RoomStanding {
  name: string;
  done: number;
  total: number;
  pct: number;
  /** Instrument ids in the plan this member has finished. */
  doneIds: string[];
}

/** Leaderboard-style standings for a room, given each member's progress. */
export function roomStandings(room: StudyRoom, members: MemberProgress[]): RoomStanding[] {
  const total = room.plan.length;
  const planSet = new Set(room.plan);
  return members
    .map((m) => {
      const doneIds = m.done.filter((id) => planSet.has(id));
      return { name: m.name, done: doneIds.length, total, pct: total ? Math.round((doneIds.length / total) * 100) : 0, doneIds };
    })
    .sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name));
}

/** Per-step completion across all members — "who's done what" on the shared plan. */
export function planCoverage(room: StudyRoom, members: MemberProgress[]): { instrumentId: string; doneBy: string[] }[] {
  return room.plan.map((id) => ({ instrumentId: id, doneBy: members.filter((m) => m.done.includes(id)).map((m) => m.name) }));
}
