import type { StudyRoom, MemberProgress } from "@core/collab";

/** Local persistence for Study Together rooms and imported teammate progress. */

const ROOMS = "psyche-rooms";
const memKey = (id: string) => `psyche-room-mem-${id}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadRooms(): StudyRoom[] {
  return read<StudyRoom[]>(ROOMS, []);
}
export function saveRoom(r: StudyRoom): void {
  const rest = loadRooms().filter((x) => x.id !== r.id);
  write(ROOMS, [r, ...rest].slice(0, 30));
}
export function getRoom(id: string): StudyRoom | undefined {
  return loadRooms().find((r) => r.id === id);
}
export function removeRoom(id: string): void {
  write(ROOMS, loadRooms().filter((r) => r.id !== id));
  try {
    localStorage.removeItem(memKey(id));
  } catch {
    /* ignore */
  }
}

export function loadMembers(roomId: string): MemberProgress[] {
  return read<MemberProgress[]>(memKey(roomId), []);
}
export function saveMember(roomId: string, m: MemberProgress): void {
  const rest = loadMembers(roomId).filter((x) => x.name.toLowerCase() !== m.name.toLowerCase());
  write(memKey(roomId), [m, ...rest].slice(0, 20));
}
