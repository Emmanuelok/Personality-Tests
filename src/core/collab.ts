import { nonce } from "./prng";
import { getInstrument } from "./instruments";
import { localizeInstrument } from "./instruments/i18n";

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
  /** Optional scale snapshots (instrumentId → scaleId → 0..100) for the group portrait. */
  scores?: Record<string, Record<string, number>>;
  /** Optional team / organization the member belongs to (for cross-org collaboration). */
  org?: string;
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
  return b64urlEncode(JSON.stringify({ n: p.name, d: p.done, a: p.at, s: p.scores, o: p.org }));
}

export function decodeProgress(code: string): MemberProgress | null {
  try {
    const o = JSON.parse(b64urlDecode(code.trim()));
    if (!o || !Array.isArray(o.d)) return null;
    return {
      name: String(o.n || "A friend").slice(0, 40),
      done: o.d.filter((x: unknown) => typeof x === "string"),
      at: String(o.a || new Date().toISOString()),
      scores: o.s && typeof o.s === "object" ? (o.s as Record<string, Record<string, number>>) : undefined,
      org: o.o ? String(o.o).slice(0, 50) : undefined,
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

/* ── teams & organizations — cross-org collaboration on one shared project ── */

export interface TeamStanding {
  /** Team / organization label. */
  org: string;
  members: number;
  names: string[];
  /** Distinct plan steps completed by at least one member of the team. */
  covered: number;
  total: number;
  /** Team coverage of the plan, as a percentage. */
  pct: number;
}

/** Group members by their org/team and report each team's collective coverage of the
 *  plan. Members without an org are grouped under `ungrouped`. Useful when people
 *  from different organizations work the same project together. */
export function teamStandings(room: StudyRoom, members: MemberProgress[], opts: { ungrouped?: string } = {}): TeamStanding[] {
  const planSet = new Set(room.plan);
  const total = room.plan.length;
  const fallback = opts.ungrouped ?? "Independent";
  const byOrg = new Map<string, MemberProgress[]>();
  for (const m of members) {
    const org = (m.org ?? "").trim() || fallback;
    const list = byOrg.get(org);
    if (list) list.push(m);
    else byOrg.set(org, [m]);
  }
  const out: TeamStanding[] = [];
  for (const [org, ms] of byOrg) {
    const covered = new Set<string>();
    for (const m of ms) for (const id of m.done) if (planSet.has(id)) covered.add(id);
    out.push({ org, members: ms.length, names: ms.map((m) => m.name), covered: covered.size, total, pct: total ? Math.round((covered.size / total) * 100) : 0 });
  }
  return out.sort((a, b) => b.pct - a.pct || b.members - a.members || a.org.localeCompare(b.org));
}

/** How many distinct teams/orgs are represented (named orgs only). */
export function teamCount(members: MemberProgress[]): number {
  return new Set(members.map((m) => (m.org ?? "").trim()).filter(Boolean)).size;
}

/* ── group portrait — the collective profile when teammates share results ── */

export interface GroupScaleStat {
  id: string;
  name: string;
  /** Pole labels, when the instrument is bipolar. */
  low?: string;
  high?: string;
  /** Group mean of normalized scores, 0..100. */
  mean: number;
  lo: { name: string; val: number };
  hi: { name: string; val: number };
  spread: number;
}
export interface GroupInstrumentStat {
  instrumentId: string;
  instrumentName: string;
  /** How many members contributed scores. */
  n: number;
  scales: GroupScaleStat[];
  /** Scale with the highest group mean (the group's collective lean). */
  topScaleId: string;
  /** Scale with the widest member-to-member spread (where the group differs most). */
  widestScaleId: string;
}

/** Aggregate members' shared scale snapshots into a per-instrument group portrait.
 *  Only instruments ≥2 members have shared are included. */
export function groupPortrait(plan: string[], members: MemberProgress[], opts: { locale?: string } = {}): GroupInstrumentStat[] {
  const out: GroupInstrumentStat[] = [];
  for (const instId of plan) {
    const inst = getInstrument(instId);
    if (!inst) continue;
    const have = members.filter((m) => m.scores?.[instId]);
    if (have.length < 2) continue;
    const li = localizeInstrument(inst, opts.locale ?? "en");
    const scales: GroupScaleStat[] = [];
    for (const sc of li.scales) {
      const vals = have
        .map((m) => ({ name: m.name, val: m.scores![instId][sc.id] }))
        .filter((v) => typeof v.val === "number");
      if (vals.length < 2) continue;
      const mean = Math.round(vals.reduce((a, v) => a + v.val, 0) / vals.length);
      const sorted = [...vals].sort((a, b) => a.val - b.val);
      const lo = sorted[0];
      const hi = sorted[sorted.length - 1];
      scales.push({ id: sc.id, name: sc.name, low: sc.poles?.low, high: sc.poles?.high, mean, lo, hi, spread: hi.val - lo.val });
    }
    if (!scales.length) continue;
    const topScaleId = [...scales].sort((a, b) => b.mean - a.mean)[0].id;
    const widestScaleId = [...scales].sort((a, b) => b.spread - a.spread)[0].id;
    out.push({ instrumentId: instId, instrumentName: li.name, n: have.length, scales, topScaleId, widestScaleId });
  }
  return out;
}

/* ── group narrative — warm, localized observations about the whole group ── */

type GLoc = "en" | "es" | "fr";
const gpLoc = (l?: string): GLoc => (l === "es" || l === "fr" ? l : "en");

const GP_STR: Record<GLoc, {
  align: (inst: string, pole: string, scale: string, mean: number) => string;
  differ: (scale: string, loN: string, loV: number, hiN: string, hiV: number) => string;
}> = {
  en: {
    align: (inst, pole, scale, mean) => `On ${inst}, your group leans collectively toward ${pole} (${scale}, group avg ${mean}) — a shared trait to build on together.`,
    differ: (scale, loN, loV, hiN, hiV) => `You differ most on ${scale} — from ${loN} (${loV}) to ${hiN} (${hiV}). That range is diverse perspective to learn from each other.`,
  },
  es: {
    align: (inst, pole, scale, mean) => `En ${inst}, el grupo se inclina de forma colectiva hacia ${pole} (${scale}, media ${mean}): un rasgo compartido para construir juntos.`,
    differ: (scale, loN, loV, hiN, hiV) => `Donde más difieren es en ${scale}: de ${loN} (${loV}) a ${hiN} (${hiV}). Ese rango es perspectiva diversa para aprender unos de otros.`,
  },
  fr: {
    align: (inst, pole, scale, mean) => `Sur ${inst}, votre groupe penche collectivement vers ${pole} (${scale}, moyenne ${mean}) — un trait partagé sur lequel bâtir ensemble.`,
    differ: (scale, loN, loV, hiN, hiV) => `C'est sur ${scale} que vous différez le plus — de ${loN} (${loV}) à ${hiN} (${hiV}). Cet écart est une diversité de perspectives pour apprendre les uns des autres.`,
  },
};

/** One or two warm, localized observations about the group, from its portrait. */
export function groupInsights(portrait: GroupInstrumentStat[], opts: { locale?: string } = {}): string[] {
  if (!portrait.length) return [];
  const loc = gpLoc(opts.locale);
  const s = GP_STR[loc];
  const gi = [...portrait].sort((a, b) => b.n - a.n || b.scales.length - a.scales.length)[0];
  const top = gi.scales.find((x) => x.id === gi.topScaleId);
  const wide = gi.scales.find((x) => x.id === gi.widestScaleId);
  const out: string[] = [];
  if (top) {
    const pole = top.mean >= 50 ? (top.high ?? top.name) : (top.low ?? top.name);
    out.push(s.align(gi.instrumentName, pole, top.name, top.mean));
  }
  if (wide && wide.id !== gi.topScaleId && wide.spread >= 18) {
    out.push(s.differ(wide.name, wide.lo.name, wide.lo.val, wide.hi.name, wide.hi.val));
  }
  return out;
}

/* ── group dynamics — what each member brings, and who clicks vs. stretches ──
   A team reading for students learning together: each member's signature
   strength (the scale they sit furthest from the group mean on), and the pairs
   who are most in sync — or most complementary. All pure, all localized. */

export interface MemberRole {
  name: string;
  instrumentId: string;
  instrumentName: string;
  scaleId: string;
  scaleName: string;
  /** Pole label in the direction this member leans (high pole if at/above the mean, else low). */
  pole?: string;
  value: number;
  mean: number;
  /** Signed distance from the group mean (positive = above the group). */
  delta: number;
}

/** Each member's single most distinctive scale across the shared plan — "what they
 *  uniquely bring." One signature per member, strongest deviation first. Needs 2+
 *  members with shared scores; only deviations of ≥6 points count as a signature. */
export function groupRoles(plan: string[], members: MemberProgress[], opts: { locale?: string } = {}): MemberRole[] {
  const have = members.filter((m) => m.scores);
  if (have.length < 2) return [];
  // Group means per instrument → scale.
  const means: Record<string, Record<string, { sum: number; n: number }>> = {};
  for (const instId of plan) {
    const acc: Record<string, { sum: number; n: number }> = {};
    for (const m of have) {
      const row = m.scores?.[instId];
      if (!row) continue;
      for (const [k, v] of Object.entries(row)) {
        if (typeof v !== "number") continue;
        (acc[k] ??= { sum: 0, n: 0 });
        acc[k].sum += v;
        acc[k].n += 1;
      }
    }
    means[instId] = acc;
  }
  const roles: MemberRole[] = [];
  for (const m of have) {
    let best: MemberRole | null = null;
    for (const instId of plan) {
      const row = m.scores?.[instId];
      if (!row) continue;
      const inst = getInstrument(instId);
      if (!inst) continue;
      const li = localizeInstrument(inst, opts.locale ?? "en");
      for (const sc of li.scales) {
        const v = row[sc.id];
        const agg = means[instId]?.[sc.id];
        if (typeof v !== "number" || !agg || agg.n < 2) continue;
        const mean = agg.sum / agg.n;
        const delta = v - mean;
        if (!best || Math.abs(delta) > Math.abs(best.delta)) {
          const pole = delta >= 0 ? (sc.poles?.high ?? sc.name) : (sc.poles?.low ?? sc.name);
          best = { name: m.name, instrumentId: instId, instrumentName: li.name, scaleId: sc.id, scaleName: sc.name, pole, value: Math.round(v), mean: Math.round(mean), delta: Math.round(delta) };
        }
      }
    }
    if (best && Math.abs(best.delta) >= 6) roles.push(best);
  }
  return roles.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

export interface MemberPair {
  a: string;
  b: string;
  /** 0..100; 100 = identical across every shared scale. */
  similarity: number;
  scalesCompared: number;
}
export interface GroupResonance {
  /** All comparable pairs, most aligned first. */
  pairs: MemberPair[];
  mostAligned?: MemberPair;
  /** Present only when a pair differs clearly more than the most-aligned pair. */
  mostComplementary?: MemberPair;
}

/** Pairwise resonance across the group's shared scale snapshots. Two members are
 *  "comparable" when they share ≥3 scales; similarity is 100 minus their mean
 *  per-scale gap. Surfaces the natural study pair and the perspective-stretching one. */
export function groupResonance(plan: string[], members: MemberProgress[]): GroupResonance {
  const flat = (m: MemberProgress): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const instId of plan) {
      const row = m.scores?.[instId];
      if (!row) continue;
      for (const [k, v] of Object.entries(row)) if (typeof v === "number") out[`${instId}:${k}`] = v;
    }
    return out;
  };
  const vs = members.filter((m) => m.scores).map((m) => ({ name: m.name, v: flat(m) }));
  const pairs: MemberPair[] = [];
  for (let i = 0; i < vs.length; i++) {
    for (let j = i + 1; j < vs.length; j++) {
      const keys = Object.keys(vs[i].v).filter((k) => k in vs[j].v);
      if (keys.length < 3) continue;
      const gap = keys.reduce((a, k) => a + Math.abs(vs[i].v[k] - vs[j].v[k]), 0) / keys.length;
      pairs.push({ a: vs[i].name, b: vs[j].name, similarity: Math.round(100 - gap), scalesCompared: keys.length });
    }
  }
  pairs.sort((a, b) => b.similarity - a.similarity);
  const mostAligned = pairs[0];
  const tail = pairs.length > 1 ? pairs[pairs.length - 1] : undefined;
  const mostComplementary = tail && mostAligned && tail.similarity <= mostAligned.similarity - 8 ? tail : undefined;
  return { pairs, mostAligned, mostComplementary };
}

const GD_STR: Record<GLoc, {
  role: (name: string, pole: string, scale: string) => string;
  aligned: (a: string, b: string, pct: number) => string;
  complement: (a: string, b: string) => string;
}> = {
  en: {
    role: (name, pole, scale) => `${name} stands out most on ${scale} — the group's most ${pole}.`,
    aligned: (a, b, pct) => `${a} and ${b} are the most in sync (${pct}% aligned) — a natural study pair.`,
    complement: (a, b) => `${a} and ${b} see things most differently — pairing them stretches both perspectives.`,
  },
  es: {
    role: (name, pole, scale) => `${name} es quien más destaca en ${scale} — lo más ${pole} del grupo.`,
    aligned: (a, b, pct) => `${a} y ${b} son los más sincronizados (${pct}% de afinidad): una pareja de estudio natural.`,
    complement: (a, b) => `${a} y ${b} son quienes más difieren: emparejarlos amplía la perspectiva de ambos.`,
  },
  fr: {
    role: (name, pole, scale) => `${name} se distingue surtout sur ${scale} — le profil le plus ${pole} du groupe.`,
    aligned: (a, b, pct) => `${a} et ${b} sont les plus en phase (${pct}% d'affinité) — un binôme d'étude naturel.`,
    complement: (a, b) => `${a} et ${b} voient les choses le plus différemment — les associer élargit la perspective des deux.`,
  },
};

/** A localized one-liner for a single member's signature role. */
export function roleLine(r: MemberRole, opts: { locale?: string } = {}): string {
  const s = GD_STR[gpLoc(opts.locale)];
  return s.role(r.name, r.pole ?? r.scaleName, r.scaleName);
}

/** Localized pairing suggestions (0–2): the natural study pair and the stretch pair. */
export function pairingNotes(resonance: GroupResonance, opts: { locale?: string } = {}): string[] {
  const s = GD_STR[gpLoc(opts.locale)];
  const out: string[] = [];
  if (resonance.mostAligned) out.push(s.aligned(resonance.mostAligned.a, resonance.mostAligned.b, resonance.mostAligned.similarity));
  if (resonance.mostComplementary) out.push(s.complement(resonance.mostComplementary.a, resonance.mostComplementary.b));
  return out;
}

export interface GroupNextStep {
  instrumentId: string;
  instrumentName: string;
  /** Members who haven't completed this step yet. */
  pending: string[];
  /** True when at least one member has already done it (a "catch up", not a fresh start). */
  started: boolean;
}

/** The group's collective next move: the earliest plan step the whole group hasn't
 *  yet converged on, plus who still has it to take. Null when everyone has finished
 *  the entire plan. Drives a "rally here next" nudge for students learning together. */
export function groupNextStep(plan: string[], members: MemberProgress[], opts: { locale?: string } = {}): GroupNextStep | null {
  if (!members.length) return null;
  for (const id of plan) {
    const inst = getInstrument(id);
    if (!inst) continue;
    const doneCount = members.filter((m) => m.done.includes(id)).length;
    if (doneCount < members.length) {
      return {
        instrumentId: id,
        instrumentName: localizeInstrument(inst, opts.locale ?? "en").name,
        pending: members.filter((m) => !m.done.includes(id)).map((m) => m.name),
        started: doneCount > 0,
      };
    }
  }
  return null;
}
