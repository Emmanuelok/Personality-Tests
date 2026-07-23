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
  /** Invite-visible host label: an alias by default, or a display name shared with explicit consent. */
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
  /** Required proof that score sharing was a separate, informed action. */
  scoreConsent?: {
    scope: "non-sensitive-scales";
    at: string;
  };
  /** True only when the sender deliberately included their display name/team. */
  identityShared?: boolean;
  /** Optional team / organization the member belongs to (for cross-org collaboration). */
  org?: string;
}

const VER = 1;
const PROGRESS_VER = 2;
export const MIN_GROUP_AGGREGATE = 4;
const MAX_PROGRESS_CODE_LENGTH = 24_000;

/** Direct aggregation callers must enforce the same informed score-sharing gate as serialization. */
export function hasScoreSharingConsent(member: MemberProgress): boolean {
  return member.scoreConsent?.scope === "non-sensitive-scales"
    && typeof member.scoreConsent.at === "string"
    && member.scoreConsent.at.trim().length > 0;
}

/** Return an organization only when the member explicitly chose to share identity details. */
export function sharedOrganization(member: MemberProgress): string | undefined {
  if (member.identityShared !== true) return undefined;
  const org = (member.org ?? "").trim();
  return org || undefined;
}

/**
 * Scores from these reflection activities are never eligible for group sharing.
 * Completion can still be shared, but the result itself remains local/private.
 */
export const SENSITIVE_STUDY_INSTRUMENTS = new Set([
  "adhd-traits",
  "autism-traits",
  "pid5-maladaptive",
  "mood-checkin",
  "worry-checkin",
  "perceived-stress",
  "burnout-mbi",
  "dark-triad-18",
  "dark-tetrad-18",
  "attachment-styles",
  "couple-communication",
  "self-esteem-rses",
]);

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

export function createRoom(opts: {
  title: string;
  plan: string[];
  /** Profile display name; used only when shareHostIdentity is explicitly true. */
  host?: string;
  /** Explicit consent to serialize the profile display name into the invite. */
  shareHostIdentity?: boolean;
  /** Caller-provided random alias, primarily so the creator UI can disclose it before creation. */
  hostAlias?: string;
  topic?: string;
}): StudyRoom {
  const displayName = (opts.host ?? "").trim().slice(0, 40);
  const proposedAlias = (opts.hostAlias ?? "").trim().slice(0, 40);
  const fallbackAlias = /^Learner-[A-F0-9]{4,16}$/.test(proposedAlias)
    ? proposedAlias
    : `Learner-${nonce(2).toUpperCase()}`;
  return {
    id: nonce(6),
    title: opts.title.trim().slice(0, 70) || "Study room",
    topic: opts.topic ?? "custom",
    plan: [...new Set(opts.plan)].slice(0, 12),
    host: opts.shareHostIdentity === true && displayName ? displayName : fallbackAlias,
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

export function sanitizeSharedScores(
  scores: MemberProgress["scores"],
): Record<string, Record<string, number>> | undefined {
  if (!scores || typeof scores !== "object") return undefined;
  const output: Record<string, Record<string, number>> = {};
  for (const [instrumentId, row] of Object.entries(scores).slice(0, 12)) {
    if (SENSITIVE_STUDY_INSTRUMENTS.has(instrumentId)) continue;
    const instrument = getInstrument(instrumentId);
    if (!instrument || !row || typeof row !== "object") continue;
    const allowedScales = new Set(instrument.scales.map((scale) => scale.id));
    const clean: Record<string, number> = {};
    for (const [scaleId, value] of Object.entries(row).slice(0, 40)) {
      if (!allowedScales.has(scaleId) || !Number.isFinite(value) || value < 0 || value > 100) continue;
      clean[scaleId] = Math.round(value * 100) / 100;
    }
    if (Object.keys(clean).length) output[instrumentId] = clean;
  }
  return Object.keys(output).length ? output : undefined;
}

/** Consent-gated, policy-sanitized scores for direct aggregation APIs. */
export function consentedSharedScores(
  member: MemberProgress,
): Record<string, Record<string, number>> | undefined {
  return hasScoreSharingConsent(member)
    ? sanitizeSharedScores(member.scores)
    : undefined;
}

export function encodeProgress(p: MemberProgress): string {
  const rawScoreConsent = p.scoreConsent;
  const scoreConsent = rawScoreConsent && hasScoreSharingConsent(p)
    ? { scope: "non-sensitive-scales" as const, at: String(rawScoreConsent.at).slice(0, 40) }
    : undefined;
  const scores = scoreConsent ? sanitizeSharedScores(p.scores) : undefined;
  const identityShared = p.identityShared === true;
  return b64urlEncode(JSON.stringify({
    v: PROGRESS_VER,
    n: String(p.name || "Learner").slice(0, 40),
    d: [...new Set(p.done.filter((id) => !!getInstrument(id)))].slice(0, 12),
    a: String(p.at).slice(0, 40),
    s: scores,
    c: scoreConsent,
    i: identityShared,
    o: identityShared && p.org ? String(p.org).slice(0, 50) : undefined,
  }));
}

export function decodeProgress(code: string): MemberProgress | null {
  try {
    if (!code.trim() || code.length > MAX_PROGRESS_CODE_LENGTH) return null;
    const o = JSON.parse(b64urlDecode(code.trim()));
    if (!o || o.v !== PROGRESS_VER || !Array.isArray(o.d)) return null;
    const identityShared = o.i === true;
    const scoreConsent = o.c?.scope === "non-sensitive-scales" && typeof o.c?.at === "string"
      ? { scope: "non-sensitive-scales" as const, at: o.c.at.slice(0, 40) }
      : undefined;
    const done = [...new Set<string>(
      (o.d as unknown[]).filter((x: unknown): x is string => typeof x === "string" && !!getInstrument(x)),
    )].slice(0, 12);
    return {
      name: String(o.n || "Learner").slice(0, 40),
      done,
      at: String(o.a || new Date().toISOString()),
      scores: scoreConsent ? sanitizeSharedScores(o.s) : undefined,
      scoreConsent,
      identityShared,
      org: identityShared && o.o ? String(o.o).slice(0, 50) : undefined,
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
    const org = sharedOrganization(m) ?? fallback;
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
  return new Set(members.map(sharedOrganization).filter((org): org is string => Boolean(org))).size;
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
  /** Aggregate bounds; contributor identities are deliberately not retained. */
  min: number;
  max: number;
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

/** Aggregate score snapshots only after the minimum privacy cohort is met. */
export function groupPortrait(plan: string[], members: MemberProgress[], opts: { locale?: string } = {}): GroupInstrumentStat[] {
  const out: GroupInstrumentStat[] = [];
  for (const instId of plan) {
    const inst = getInstrument(instId);
    if (!inst) continue;
    const have = members
      .map((member) => consentedSharedScores(member))
      .filter((scores): scores is Record<string, Record<string, number>> =>
        Boolean(scores?.[instId])
      );
    if (have.length < MIN_GROUP_AGGREGATE) continue;
    const li = localizeInstrument(inst, opts.locale ?? "en");
    const scales: GroupScaleStat[] = [];
    for (const sc of li.scales) {
      const vals = have
        .map((scores) => scores[instId][sc.id])
        .filter((value): value is number => Number.isFinite(value));
      if (vals.length < MIN_GROUP_AGGREGATE) continue;
      const mean = Math.round(vals.reduce((sum, value) => sum + value, 0) / vals.length);
      const sorted = [...vals].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      scales.push({ id: sc.id, name: sc.name, low: sc.poles?.low, high: sc.poles?.high, mean, min, max, spread: max - min });
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
  differ: (scale: string, loV: number, hiV: number) => string;
}> = {
  en: {
    align: (inst, pole, scale, mean) => `On ${inst}, your group leans collectively toward ${pole} (${scale}, group avg ${mean}) — a shared trait to build on together.`,
    differ: (scale, loV, hiV) => `Your widest aggregate range is on ${scale} (${loV}–${hiV}). Individual contributors stay private.`,
  },
  es: {
    align: (inst, pole, scale, mean) => `En ${inst}, el grupo se inclina de forma colectiva hacia ${pole} (${scale}, media ${mean}): un rasgo compartido para construir juntos.`,
    differ: (scale, loV, hiV) => `El rango agregado más amplio está en ${scale} (${loV}–${hiV}). Las contribuciones individuales siguen siendo privadas.`,
  },
  fr: {
    align: (inst, pole, scale, mean) => `Sur ${inst}, votre groupe penche collectivement vers ${pole} (${scale}, moyenne ${mean}) — un trait partagé sur lequel bâtir ensemble.`,
    differ: (scale, loV, hiV) => `La plage agrégée la plus large concerne ${scale} (${loV}–${hiV}). Les contributions individuelles restent privées.`,
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
    out.push(s.differ(wide.name, wide.min, wide.max));
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
 *  uniquely bring." One signature per member, strongest deviation first. Requires
 *  a consented privacy cohort for every scale; only deviations of ≥6 points count. */
export function groupRoles(plan: string[], members: MemberProgress[], opts: { locale?: string } = {}): MemberRole[] {
  const have = members
    .map((member) => ({ member, scores: consentedSharedScores(member) }))
    .filter((entry): entry is { member: MemberProgress; scores: Record<string, Record<string, number>> } =>
      entry.member.identityShared === true && Boolean(entry.scores)
    );
  if (have.length < MIN_GROUP_AGGREGATE) return [];
  // Group means per instrument → scale.
  const means: Record<string, Record<string, { sum: number; n: number }>> = {};
  for (const instId of plan) {
    const acc: Record<string, { sum: number; n: number }> = {};
    for (const entry of have) {
      const row = entry.scores[instId];
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
  for (const { member, scores } of have) {
    let best: MemberRole | null = null;
    for (const instId of plan) {
      const row = scores[instId];
      if (!row) continue;
      const inst = getInstrument(instId);
      if (!inst) continue;
      const li = localizeInstrument(inst, opts.locale ?? "en");
      for (const sc of li.scales) {
        const v = row[sc.id];
        const agg = means[instId]?.[sc.id];
        if (typeof v !== "number" || !agg || agg.n < MIN_GROUP_AGGREGATE) continue;
        const mean = agg.sum / agg.n;
        const delta = v - mean;
        if (!best || Math.abs(delta) > Math.abs(best.delta)) {
          const pole = delta >= 0 ? (sc.poles?.high ?? sc.name) : (sc.poles?.low ?? sc.name);
          best = { name: member.name, instrumentId: instId, instrumentName: li.name, scaleId: sc.id, scaleName: sc.name, pole, value: Math.round(v), mean: Math.round(mean), delta: Math.round(delta) };
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
 *  per-scale gap. The analysis stays suppressed until a consented privacy cohort
 *  exists. */
export function groupResonance(plan: string[], members: MemberProgress[]): GroupResonance {
  const flat = (scores: Record<string, Record<string, number>>): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const instId of plan) {
      const row = scores[instId];
      if (!row) continue;
      for (const [k, v] of Object.entries(row)) if (typeof v === "number") out[`${instId}:${k}`] = v;
    }
    return out;
  };
  const withScores = members
    .map((member) => ({ member, scores: consentedSharedScores(member) }))
    .filter((entry): entry is { member: MemberProgress; scores: Record<string, Record<string, number>> } =>
      entry.member.identityShared === true && Boolean(entry.scores)
    );
  if (withScores.length < MIN_GROUP_AGGREGATE) return { pairs: [] };
  const vs = withScores.map(({ member, scores }) => ({ name: member.name, v: flat(scores) }));
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
