import { useMemo, useState } from "react";
import type { Instrument } from "@core/types";
import { getInstrument } from "@core/instruments";
import { localizeInstrument } from "@core/instruments/i18n";
import { buildRoadmap } from "@core/roadmap";
import {
  createRoom, roomLink, encodeProgress, decodeProgress, roomStandings, planCoverage, groupPortrait, groupInsights,
  groupRoles, groupResonance, roleLine, pairingNotes, groupNextStep, teamStandings, teamCount,
  type StudyRoom, type MemberProgress,
} from "@core/collab";
import type { SynthEntry } from "@core/synthesis";
import { ScaleBar } from "./charts";
import { loadRooms, saveRoom, getRoom, removeRoom, loadMembers, saveMember, loadOrg, saveOrg } from "../collabStore";
import { GOALS, labelsFor, toLoc, type Loc } from "./goals";
import { CategoryEmblem } from "./art";
import { downloadICS, googleCalUrl, outlookCalUrl, nextEveningSlot, type CalEvent } from "./calendar";
import { useI18n } from "../i18n";

const S: Record<Loc, Record<string, string>> = {
  en: {
    title: "Study Together", sub: "Learn a topic with friends, classmates, or teammates anywhere — privately, no account. Create a room, share the link, and track your progress side by side.",
    create: "＋ Create a study room", newRoom: "New study room", focus: "What will you study together?", roomName: "Room name", roomNamePh: "e.g., Psych 101 — Big Five week", make: "Create room & get link", cancel: "Cancel",
    myRooms: "Your rooms", none: "No rooms yet. Create one and invite a friend with the link.", members: "members", open: "Open",
    joinedYou: "you", host: "Host",
    invited: "invited you to study together", joinAs: "Join as", join: "Join the room", yourName: "Your first name",
    invite: "Invite link", copy: "Copy link", copied: "Copied!", share: "Share invite", addCal: "📅 .ics", gcal: "Google", outlook: "Outlook", plan: "Shared plan", autopilot: "✨ Run this plan on Autopilot", begin: "Begin", retake: "Done ✓",
    groupNext: "Up next for the group", stillToGo: "Still to go", gnStart: "No one's started this yet — a great one to take on together.", gnRally: "Some teammates are already here — catch up and compare notes.", allDone: "🎉 Your group has finished the whole plan together.",
    teams: "By team", teamsSub: "Members from different teams or organizations, and how far each has carried the shared plan.", yourTeam: "Your team / organization", teamPh: "e.g., Lincoln High · Class 2B", independent: "Independent", teamCovered: "{c}/{t} covered",
    group: "Group portrait", groupSub: "When teammates share results, here\u2019s your collective profile \u2014 where you align, and where you differ most.", groupShared: "{n} shared",
    dynamics: "Who brings what", dynamicsSub: "Each teammate\u2019s signature strength, and the pairs who click \u2014 or stretch each other.", standings: "Progress", shareMine: "Share my progress", yourCode: "Your progress code — send it to your group:", addMate: "Add a teammate's progress", paste: "Paste a progress code…", add: "Add", added: "Added!", bad: "That code didn't look right.",
    leave: "Leave room", leaveQ: "Leave and delete this room from this device?", back: "← Back", of: "{d}/{t}", done: "done",
  },
  es: {
    title: "Estudiar juntos", sub: "Aprende un tema con amigos, compañeros o tu equipo en cualquier lugar, en privado y sin cuenta. Crea una sala, comparte el enlace y sigan su progreso a la par.",
    create: "＋ Crear una sala de estudio", newRoom: "Nueva sala de estudio", focus: "¿Qué van a estudiar juntos?", roomName: "Nombre de la sala", roomNamePh: "p. ej., Psico 101 — semana de los Cinco Grandes", make: "Crear sala y obtener enlace", cancel: "Cancelar",
    myRooms: "Tus salas", none: "Aún no hay salas. Crea una e invita a alguien con el enlace.", members: "miembros", open: "Abrir",
    joinedYou: "tú", host: "Anfitrión",
    invited: "te invitó a estudiar juntos", joinAs: "Únete como", join: "Unirte a la sala", yourName: "Tu nombre",
    invite: "Enlace de invitación", copy: "Copiar enlace", copied: "¡Copiado!", share: "Compartir invitación", addCal: "📅 .ics", gcal: "Google", outlook: "Outlook", plan: "Plan compartido", autopilot: "✨ Ejecutar este plan en piloto automático", begin: "Empezar", retake: "Hecho ✓",
    groupNext: "A continuación para el grupo", stillToGo: "Aún les falta", gnStart: "Nadie lo ha empezado aún: ideal para hacerlo juntos.", gnRally: "Algunos compañeros ya van por aquí: ponte al día y comparen notas.", allDone: "🎉 Tu grupo ha terminado todo el plan en conjunto.",
    teams: "Por equipo", teamsSub: "Miembros de distintos equipos u organizaciones, y cuánto ha avanzado cada uno en el plan compartido.", yourTeam: "Tu equipo u organización", teamPh: "p. ej., Instituto Lincoln · Clase 2B", independent: "Independiente", teamCovered: "{c}/{t} cubiertas",
    group: "Retrato del grupo", groupSub: "Cuando los compañeros comparten resultados, este es su perfil colectivo: dónde coinciden y dónde más difieren.", groupShared: "{n} compartidos",
    dynamics: "Quién aporta qué", dynamicsSub: "La fortaleza distintiva de cada compañero, y las parejas que encajan… o que se complementan.", standings: "Progreso", shareMine: "Compartir mi progreso", yourCode: "Tu código de progreso, envíalo a tu grupo:", addMate: "Añadir el progreso de un compañero", paste: "Pega un código de progreso…", add: "Añadir", added: "¡Añadido!", bad: "Ese código no parece válido.",
    leave: "Salir de la sala", leaveQ: "¿Salir y borrar esta sala de este dispositivo?", back: "← Atrás", of: "{d}/{t}", done: "hechas",
  },
  fr: {
    title: "Étudier ensemble", sub: "Apprenez un sujet avec des amis, des camarades ou une équipe, où qu'ils soient — en privé, sans compte. Créez une salle, partagez le lien et suivez votre progression côte à côte.",
    create: "＋ Créer une salle d'étude", newRoom: "Nouvelle salle d'étude", focus: "Qu'allez-vous étudier ensemble ?", roomName: "Nom de la salle", roomNamePh: "ex. : Psycho 101 — semaine Big Five", make: "Créer la salle et obtenir le lien", cancel: "Annuler",
    myRooms: "Vos salles", none: "Aucune salle. Créez-en une et invitez un ami avec le lien.", members: "membres", open: "Ouvrir",
    joinedYou: "vous", host: "Hôte",
    invited: "vous a invité à étudier ensemble", joinAs: "Rejoindre en tant que", join: "Rejoindre la salle", yourName: "Votre prénom",
    invite: "Lien d'invitation", copy: "Copier le lien", copied: "Copié !", share: "Partager l'invitation", addCal: "📅 .ics", gcal: "Google", outlook: "Outlook", plan: "Plan partagé", autopilot: "✨ Lancer ce plan en pilote automatique", begin: "Commencer", retake: "Fait ✓",
    groupNext: "La suite pour le groupe", stillToGo: "Encore à faire", gnStart: "Personne ne l'a encore commencé — parfait à faire ensemble.", gnRally: "Des coéquipiers sont déjà là — rattrapez et comparez vos notes.", allDone: "🎉 Votre groupe a terminé tout le plan ensemble.",
    teams: "Par équipe", teamsSub: "Des membres de différentes équipes ou organisations, et jusqu'où chacune a mené le plan partagé.", yourTeam: "Votre équipe / organisation", teamPh: "ex. : Lycée Lincoln · Classe 2B", independent: "Indépendant", teamCovered: "{c}/{t} couvertes",
    group: "Portrait du groupe", groupSub: "Quand les coéquipiers partagent leurs résultats, voici votre profil collectif \u2014 où vous vous rejoignez, et où vous différez le plus.", groupShared: "{n} partagés",
    dynamics: "Qui apporte quoi", dynamicsSub: "La force distinctive de chaque coéquipier, et les binômes qui s'accordent — ou se complètent.", standings: "Progression", shareMine: "Partager ma progression", yourCode: "Votre code de progression — envoyez-le à votre groupe :", addMate: "Ajouter la progression d'un coéquipier", paste: "Collez un code de progression…", add: "Ajouter", added: "Ajouté !", bad: "Ce code semble invalide.",
    leave: "Quitter la salle", leaveQ: "Quitter et supprimer cette salle de cet appareil ?", back: "← Retour", of: "{d}/{t}", done: "faites",
  },
};

export function Study({
  name, entries, onStart, onAutopilot, onBack, joinRoom,
}: {
  name?: string;
  entries: SynthEntry[];
  onStart: (inst: Instrument) => void;
  onAutopilot?: (plan: string[]) => void;
  onBack: () => void;
  joinRoom?: StudyRoom | null;
}) {
  const { locale } = useI18n();
  const L = toLoc(locale);
  const s = S[L];
  const done = useMemo(() => new Set(entries.map((e) => e.instrument.id)), [entries]);
  const scores = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const e of entries) {
      const o: Record<string, number> = {};
      for (const sc of Object.values(e.result.scales)) o[sc.scaleId] = Math.round(sc.normalized);
      m[e.instrument.id] = o;
    }
    return m;
  }, [entries]);
  const planScores = (plan: string[]) => Object.fromEntries(plan.filter((id) => scores[id]).map((id) => [id, scores[id]]));

  const [rooms, setRooms] = useState<StudyRoom[]>(() => loadRooms());
  const [selectedId, setSelectedId] = useState<string | null>(joinRoom ? joinRoom.id : (loadRooms()[0]?.id ?? null));
  const [creating, setCreating] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<StudyRoom | null>(joinRoom && !getRoom(joinRoom.id) ? joinRoom : null);

  const refresh = () => setRooms(loadRooms());
  const selected = selectedId ? rooms.find((r) => r.id === selectedId) ?? getRoom(selectedId) : null;

  /* ── join prompt (arrived via invite link) ─────────────────────────── */
  if (pendingJoin) {
    return <JoinPrompt s={s} room={pendingJoin} initialName={name} onJoin={(nm, org) => {
      saveRoom(pendingJoin);
      if (org) saveOrg(org);
      if (nm) saveMember(pendingJoin.id, { name: nm, done: pendingJoin.plan.filter((id) => done.has(id)), at: new Date().toISOString(), scores: planScores(pendingJoin.plan), org: org || undefined });
      refresh(); setSelectedId(pendingJoin.id); setPendingJoin(null);
    }} onSkip={() => setPendingJoin(null)} />;
  }

  /* ── create form ───────────────────────────────────────────────────── */
  if (creating) {
    return <CreateRoom s={s} L={L} locale={locale} host={name} onCancel={() => setCreating(false)} onCreate={(room) => {
      saveRoom(room); refresh(); setSelectedId(room.id); setCreating(false);
    }} />;
  }

  /* ── room detail ───────────────────────────────────────────────────── */
  if (selected) {
    return <RoomDetail s={s} L={L} room={selected} name={name} done={done} myScores={planScores(selected.plan)} onStart={onStart} onAutopilot={onAutopilot}
      onLeave={() => { removeRoom(selected.id); refresh(); setSelectedId(loadRooms()[0]?.id ?? null); }}
      onBack={() => setSelectedId(null)} />;
  }

  /* ── list ──────────────────────────────────────────────────────────── */
  return (
    <div className="container view-enter">
      <div className="iep-hero">
        <div className="sub" style={{ textTransform: "uppercase", fontSize: 12.5, letterSpacing: 2 }}>{s.title}</div>
        <h1>{s.title}</h1>
        <div className="subtitle" style={{ color: "var(--text-dim)", maxWidth: 640, margin: "8px auto 0" }}>{s.sub}</div>
      </div>
      <div className="row-actions" style={{ justifyContent: "center", margin: "8px 0 22px" }}>
        <button className="btn primary" onClick={() => setCreating(true)}>{s.create}</button>
      </div>
      <h2 className="section-title">{s.myRooms}</h2>
      {rooms.length === 0 ? (
        <p className="note">{s.none}</p>
      ) : (
        <div className="grid">
          {rooms.map((r) => {
            const members = loadMembers(r.id);
            return (
              <article className="card" key={r.id}>
                <span className="kind">{s.host}: {r.host}</span>
                <h3>{r.title}</h3>
                <div className="facts">
                  <span>📚 {r.plan.length} {s.done}</span>
                  <span>👥 {Math.max(1, members.length)} {s.members}</span>
                </div>
                <button className="btn primary" onClick={() => setSelectedId(r.id)}>{s.open} →</button>
              </article>
            );
          })}
        </div>
      )}
      <div className="row-actions" style={{ marginTop: 26 }}>
        <button className="btn ghost" onClick={onBack}>{s.back}</button>
      </div>
    </div>
  );
}

/* ── sub-components ───────────────────────────────────────────────────── */

function JoinPrompt({ s, room, initialName, onJoin, onSkip }: { s: Record<string, string>; room: StudyRoom; initialName?: string; onJoin: (name: string, org: string) => void; onSkip: () => void }) {
  const [nm, setNm] = useState(initialName ?? "");
  const [org, setOrg] = useState(() => loadOrg());
  return (
    <div className="container view-enter">
      <div className="onb-screen">
        <div className="onb-aura" aria-hidden="true" />
        <div className="onb view-enter">
          <div className="onb-mark" aria-hidden="true">👥</div>
          <h1><span className="grad">{room.host}</span> {s.invited}</h1>
          <p className="sub">{room.title} · {room.plan.length} {s.done}</p>
          <label className="onb-step-label" style={{ display: "block" }}>{s.joinAs}</label>
          <input className="name-input" autoFocus placeholder={s.yourName} value={nm} maxLength={40} onChange={(e) => setNm(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onJoin(nm.trim(), org.trim()); }} />
          <label className="onb-step-label" style={{ display: "block", marginTop: 14 }}>{s.yourTeam}</label>
          <input className="name-input" style={{ fontSize: 15 }} placeholder={s.teamPh} value={org} maxLength={50} onChange={(e) => setOrg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onJoin(nm.trim(), org.trim()); }} />
          <div className="row-actions" style={{ justifyContent: "center" }}>
            <button className="btn ghost" onClick={onSkip}>{s.cancel}</button>
            <button className="btn primary" onClick={() => onJoin(nm.trim(), org.trim())}>{s.join} →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateRoom({ s, L, locale, host, onCancel, onCreate }: { s: Record<string, string>; L: Loc; locale: string; host?: string; onCancel: () => void; onCreate: (r: StudyRoom) => void }) {
  const [goal, setGoal] = useState<string>("self");
  const [title, setTitle] = useState("");
  const plan = useMemo(() => buildRoadmap([], labelsFor([goal], locale), { locale, length: 5 }).steps.map((st) => st.instrumentId), [goal, locale]);
  const suggested = GOALS.find((g) => g.key === goal)?.label[L] ?? "";
  const make = () => onCreate(createRoom({ title: (title.trim() || suggested), plan, host: host ?? "", topic: goal }));
  return (
    <div className="container view-enter">
      <div className="panel" style={{ maxWidth: 620, margin: "30px auto" }}>
        <h2 style={{ fontFamily: "var(--serif)", marginTop: 0 }}>{s.newRoom}</h2>
        <label className="onb-step-label" style={{ display: "block", marginBottom: 10 }}>{s.focus}</label>
        <div className="chips">
          {GOALS.map((g) => (
            <button key={g.key} className={`chip-toggle ${goal === g.key ? "on" : ""}`} onClick={() => setGoal(g.key)}>
              <span aria-hidden="true" style={{ marginRight: 6 }}>{g.icon}</span>{g.label[L]}
            </button>
          ))}
        </div>
        <div className="rm-goals" style={{ marginTop: 14 }}>
          <ol className="roadmap">
            {plan.map((id, i) => {
              const inst = getInstrument(id);
              if (!inst) return null;
              const li = localizeInstrument(inst, locale);
              return (
                <li className="rm-step" key={id}>
                  <span className="rm-node">{i + 1}</span>
                  <div className="rm-body"><div className="rm-name">{li.name}</div></div>
                  <span className="rm-min">{inst.estMinutes} min</span>
                </li>
              );
            })}
          </ol>
        </div>
        <label className="onb-step-label" style={{ display: "block", margin: "16px 0 8px" }}>{s.roomName}</label>
        <input className="name-input" style={{ fontSize: 17, textAlign: "left" }} placeholder={s.roomNamePh} value={title} maxLength={70} onChange={(e) => setTitle(e.target.value)} />
        <div className="row-actions" style={{ marginTop: 18 }}>
          <button className="btn ghost" onClick={onCancel}>{s.cancel}</button>
          <button className="btn primary" onClick={make}>{s.make}</button>
        </div>
      </div>
    </div>
  );
}

function RoomDetail({ s, L, room, name, done, myScores, onStart, onAutopilot, onLeave, onBack }: { s: Record<string, string>; L: Loc; room: StudyRoom; name?: string; done: Set<string>; myScores: Record<string, Record<string, number>>; onStart: (inst: Instrument) => void; onAutopilot?: (plan: string[]) => void; onLeave: () => void; onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [myCode, setMyCode] = useState("");
  const [org, setOrg] = useState(() => loadOrg());

  const meName = name || s.joinedYou;
  const myDone = room.plan.filter((id) => done.has(id));
  const imported = useMemo(() => loadMembers(room.id).filter((m) => m.name.toLowerCase() !== meName.toLowerCase()), [room.id, tick, meName]);
  const me: MemberProgress = { name: meName, done: myDone, at: new Date().toISOString(), scores: myScores, org: org.trim() || undefined };
  const allMembers = [me, ...imported];
  const standings = roomStandings(room, allMembers);
  const coverage = planCoverage(room, allMembers);
  const portrait = groupPortrait(room.plan, allMembers, { locale: L });
  const gInsights = groupInsights(portrait, { locale: L });
  const roles = groupRoles(room.plan, allMembers, { locale: L });
  const pairing = pairingNotes(groupResonance(room.plan, allMembers), { locale: L });
  const groupNext = groupNextStep(room.plan, allMembers, { locale: L });
  const orgOf = new Map(allMembers.map((m) => [m.name, (m.org ?? "").trim()]));
  const teams = teamStandings(room, allMembers, { ungrouped: s.independent });
  const showTeams = teamCount(allMembers) >= 2;
  const origin = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  const link = roomLink(room, origin);
  const nextId = room.plan.find((id) => !done.has(id));
  const calEvent: CalEvent = {
    title: `${s.title}: ${room.title}`,
    description: `${room.title}\n${room.plan.map((id) => getInstrument(id)).filter((x): x is Instrument => !!x).map((inst) => localizeInstrument(inst, L).name).join(" · ")}`,
    start: nextEveningSlot(), durationMin: 45, url: link,
  };

  const copy = (text: string, msg: string) => { try { navigator.clipboard?.writeText(text); setStatus(msg); setTimeout(() => setStatus(""), 1600); } catch { /* ignore */ } };
  const share = async () => {
    const data = { title: room.title, text: `${room.host}: ${room.title}`, url: link };
    try { if (navigator.share) await navigator.share(data); else copy(link, s.copied); } catch { /* cancelled */ }
  };
  const addMate = () => {
    const p = decodeProgress(code);
    if (!p) { setStatus(s.bad); return; }
    saveMember(room.id, p); setCode(""); setStatus(s.added); setTick((t) => t + 1); setTimeout(() => setStatus(""), 1600);
  };

  return (
    <div className="container view-enter">
      <div className="iep-hero">
        <div className="sub" style={{ textTransform: "uppercase", fontSize: 12.5, letterSpacing: 2 }}>{s.title} · {s.host}: {room.host}</div>
        <h1>{room.title}</h1>
      </div>

      <div className="report-grid stagger">
        <section className="panel compat-cta">
          <span className="compat-emblem cat-relationships" aria-hidden="true"><CategoryEmblem id="relationships" /></span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{s.invite}</h3>
            <input className="code-input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} style={{ fontSize: 12.5 }} />
          </div>
          <div className="row-actions" style={{ justifyContent: "flex-start" }}>
            <button className="btn sm" onClick={() => copy(link, s.copied)}>{s.copy}</button>
            <button className="btn sm ghost" onClick={share}>{s.share}</button>
            <button className="btn sm ghost" onClick={() => downloadICS(`study-${room.id}.ics`, [calEvent])}>{s.addCal}</button>
            <a className="btn sm ghost" href={googleCalUrl(calEvent)} target="_blank" rel="noopener noreferrer">{s.gcal}</a>
            <a className="btn sm ghost" href={outlookCalUrl(calEvent)} target="_blank" rel="noopener noreferrer">{s.outlook}</a>
          </div>
        </section>

        <section className="panel">
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{s.plan}</h3>
          {groupNext ? (
            <div className="gp-next">
              <span className="gp-next-eye">🎯 {s.groupNext}</span>
              <b className="gp-next-name">{groupNext.instrumentName}</b>
              <p className="gp-next-why">{groupNext.started ? s.gnRally : s.gnStart}</p>
              {groupNext.pending.length > 0 && <span className="gp-next-pending">{s.stillToGo}: {groupNext.pending.join(", ")}</span>}
            </div>
          ) : (
            <p className="note" style={{ marginTop: 0 }}>{s.allDone}</p>
          )}
          <ol className="roadmap">
            {room.plan.map((id, i) => {
              const inst = getInstrument(id);
              if (!inst) return null;
              const li = localizeInstrument(inst, L);
              const isDone = done.has(id);
              const doneBy = coverage.find((c) => c.instrumentId === id)?.doneBy ?? [];
              const isNext = id === nextId;
              return (
                <li className={`rm-step${isNext ? " current" : ""}${isDone ? " done" : ""}`} key={id}>
                  <span className="rm-node">{isDone ? "✓" : i + 1}</span>
                  <div className="rm-body">
                    <div className="rm-name">{li.name}</div>
                    {doneBy.length > 0 && <div className="rm-reason">✓ {doneBy.join(", ")}</div>}
                  </div>
                  {isNext
                    ? <button className="btn primary rm-go" onClick={() => onStart(inst)}>{s.begin} →</button>
                    : <span className="rm-min">{isDone ? s.retake : `${inst.estMinutes} min`}</span>}
                </li>
              );
            })}
          </ol>
          {onAutopilot && room.plan.some((id) => !done.has(id)) && (
            <button className="btn autopilot-cta" style={{ marginTop: 14 }} onClick={() => onAutopilot(room.plan)}>{s.autopilot}</button>
          )}
        </section>

        <section className="panel">
          <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{s.standings}</h3>
          {standings.map((st, i) => {
            const stOrg = orgOf.get(st.name);
            return (
              <div className="standing" key={st.name + i}>
                <span className="st-rank">{i + 1}</span>
                <div className="st-body">
                  <div className="st-top"><b>{st.name}{i === 0 ? " 👑" : ""}{stOrg ? <span className="st-org">{stOrg}</span> : null}</b><span>{s.of.replace("{d}", String(st.done)).replace("{t}", String(st.total))}</span></div>
                  <div className="ms-bar"><i style={{ width: `${st.pct}%` }} /></div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16 }}>
            <label className="onb-step-label" style={{ display: "block", marginBottom: 8 }}>{s.yourTeam}</label>
            <input className="name-input" style={{ fontSize: 15, textAlign: "left" }} placeholder={s.teamPh} value={org} maxLength={50}
              onChange={(e) => setOrg(e.target.value)} onBlur={() => saveOrg(org)} />
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn sm" onClick={() => { saveOrg(org); const c = encodeProgress({ ...me, org: org.trim() || undefined }); setMyCode(c); copy(c, s.copied); }}>{s.shareMine}</button>
            {myCode && <><p className="rm-reason" style={{ margin: "10px 0 4px" }}>{s.yourCode}</p><input className="code-input" readOnly value={myCode} onFocus={(e) => e.currentTarget.select()} /></>}
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="onb-step-label" style={{ display: "block", marginBottom: 8 }}>{s.addMate}</label>
            <div className="cmp-input">
              <input value={code} placeholder={s.paste} onChange={(e) => setCode(e.target.value)} />
              <button className="btn primary" disabled={!code.trim()} onClick={addMate}>{s.add}</button>
            </div>
          </div>
          {status && <p className="note" style={{ marginTop: 12 }}>{status}</p>}
        </section>

        {showTeams && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{s.teams}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{s.teamsSub}</p>
            {teams.map((t, i) => (
              <div className="standing" key={t.org + i}>
                <span className="st-rank">{i + 1}</span>
                <div className="st-body">
                  <div className="st-top"><b>{t.org}</b><span>{s.teamCovered.replace("{c}", String(t.covered)).replace("{t}", String(t.total))}</span></div>
                  <div className="ms-bar"><i style={{ width: `${t.pct}%` }} /></div>
                  <div className="rm-reason" style={{ marginTop: 4 }}>👥 {t.names.join(", ")}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        {portrait.length > 0 && (
          <section className="panel">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{s.group}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{s.groupSub}</p>
            {gInsights.map((gi, i) => (
              <div className="gp-insight" key={i}><span aria-hidden="true">✦</span><p>{gi}</p></div>
            ))}
            {portrait.map((gi) => (
              <div className="gp-inst" key={gi.instrumentId}>
                <div className="gp-inst-head"><b>{gi.instrumentName}</b><span>{s.groupShared.replace("{n}", String(gi.n))}</span></div>
                {gi.scales.map((sc) => (
                  <div className={`gp-scale${sc.id === gi.widestScaleId ? " wide" : ""}`} key={sc.id}>
                    <div className="gp-scale-top">
                      <span className="gp-scale-name">{sc.name}{sc.id === gi.widestScaleId ? " ⚡" : ""}</span>
                      <span className="gp-range">{sc.lo.name} {sc.lo.val} → {sc.hi.name} {sc.hi.val}</span>
                    </div>
                    <ScaleBar value={sc.mean} leftLabel={sc.low} rightLabel={sc.high} />
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {roles.length > 0 && (
          <section className="panel gp-dynamics">
            <h3 style={{ marginTop: 0, fontFamily: "var(--serif)", fontSize: 22 }}>{s.dynamics}</h3>
            <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{s.dynamicsSub}</p>
            <ul className="gp-roles">
              {roles.map((r) => (
                <li className="gp-role" key={r.name + r.instrumentId + r.scaleId}>
                  <span className="gp-role-tag">{r.value}</span>
                  <p>{roleLine(r, { locale: L })}</p>
                </li>
              ))}
            </ul>
            {pairing.map((p, i) => (
              <div className="gp-insight" key={i}><span aria-hidden="true">⇄</span><p>{p}</p></div>
            ))}
          </section>
        )}

        <div className="row-actions">
          <button className="btn ghost" onClick={onBack}>{s.back}</button>
          <button className="btn ghost" onClick={() => { if (confirm(s.leaveQ)) onLeave(); }} style={{ color: "var(--danger)" }}>{s.leave}</button>
        </div>
      </div>
    </div>
  );
}
