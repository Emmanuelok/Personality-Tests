/**
 * Editorial SVG artwork — hand-drawn, dependency-free line illustrations in the
 * parchment "Know Thyself" aesthetic. Everything here is inline SVG so it ships
 * offline (PWA-safe), needs no licensing, and recolors itself from the theme via
 * `currentColor` (ink) plus a `.gold` class for the classical accent.
 */

import type { ReactNode } from "react";

const TAU = Math.PI * 2;
const pol = (cx: number, cy: number, r: number, a: number) =>
  [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;

/* ------------------------------------------------------------------ */
/*  Hero — a celestial astrolabe: navigating the map of the self.      */
/* ------------------------------------------------------------------ */

export function HeroArt({ className = "" }: { className?: string }) {
  const cx = 240;
  const cy = 240;

  // Degree ring ticks around the rim.
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * TAU - Math.PI / 2;
    const long = i % 6 === 0;
    const [x1, y1] = pol(cx, cy, 206, a);
    const [x2, y2] = pol(cx, cy, long ? 192 : 199, a);
    return { x1, y1, x2, y2, long };
  });

  // Sun rays.
  const rays = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * TAU;
    const [x1, y1] = pol(cx, cy, 40, a);
    const [x2, y2] = pol(cx, cy, i % 2 ? 56 : 50, a);
    return { x1, y1, x2, y2 };
  });

  // Scattered fixed stars.
  const stars = [
    [120, 96, 3.4], [360, 120, 2.6], [398, 300, 3], [96, 330, 2.4],
    [300, 408, 2.8], [150, 392, 2], [410, 200, 2.2], [78, 200, 2.6],
  ] as const;

  // A small planet riding the tilted orbit.
  const [px, py] = pol(cx, cy, 150, -0.7);

  return (
    <svg className={`hero-art ${className}`} viewBox="0 0 480 480" role="img"
         aria-label="An astrolabe charting the map of the self" fill="none">
      {/* faint outer halo */}
      <circle className="ink-faint" cx={cx} cy={cy} r="224" strokeWidth="1" opacity="0.5" stroke="currentColor" />

      {/* degree ring + ticks */}
      <circle className="ink" cx={cx} cy={cy} r="208" strokeWidth="1.4" stroke="currentColor" />
      <circle className="ink-faint" cx={cx} cy={cy} r="190" strokeWidth="1" stroke="currentColor" />
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="currentColor" strokeWidth={t.long ? 1.4 : 0.8}
              opacity={t.long ? 0.85 : 0.5} />
      ))}

      {/* tilted orbital ellipses */}
      <g className="ink-soft" stroke="currentColor" strokeWidth="1.2" opacity="0.75">
        <ellipse cx={cx} cy={cy} rx="170" ry="64" transform={`rotate(-24 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx="150" ry="150" strokeDasharray="2 7" opacity="0.6" />
        <ellipse cx={cx} cy={cy} rx="64" ry="170" transform={`rotate(-24 ${cx} ${cy})`} opacity="0.5" />
      </g>

      {/* compass needle */}
      <g>
        <polygon className="gold" points="240,120 250,240 240,250 230,240" opacity="0.92" />
        <polygon className="ink-soft" points="240,360 250,240 240,230 230,240" fill="currentColor" opacity="0.5" />
      </g>

      {/* central sun */}
      <g>
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                className="gold" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        ))}
        <circle cx={cx} cy={cy} r="34" className="paper-fill" />
        <circle cx={cx} cy={cy} r="34" className="ink" stroke="currentColor" strokeWidth="1.6" />
        <circle cx={cx} cy={cy} r="22" className="gold" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
        <circle cx={cx} cy={cy} r="6" className="gold gold-fill" />
      </g>

      {/* orbiting planet + crescent moon */}
      <circle cx={px} cy={py} r="8" className="paper-fill" />
      <circle cx={px} cy={py} r="8" className="ink" stroke="currentColor" strokeWidth="1.4" />
      <g transform="translate(372 372)">
        <path d="M0,-15 A15,15 0 1 0 0,15 A11,11 0 1 1 0,-15 Z" className="gold gold-fill" opacity="0.9" />
      </g>

      {/* stars */}
      {stars.map(([x, y, r], i) => (
        <Sparkle key={i} x={x} y={y} r={r} />
      ))}
    </svg>
  );
}

function Sparkle({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <path
      className="gold gold-fill"
      d={`M${x},${y - r * 2.4} C${x + r * 0.4},${y - r * 0.5} ${x + r * 0.5},${y - r * 0.4} ${x + r * 2.4},${y}
          C${x + r * 0.5},${y + r * 0.4} ${x + r * 0.4},${y + r * 0.5} ${x},${y + r * 2.4}
          C${x - r * 0.4},${y + r * 0.5} ${x - r * 0.5},${y + r * 0.4} ${x - r * 2.4},${y}
          C${x - r * 0.5},${y - r * 0.4} ${x - r * 0.4},${y - r * 0.5} ${x},${y - r * 2.4} Z`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Category emblems — one distinct line-art seal per construct.        */
/* ------------------------------------------------------------------ */

type EmblemFn = () => JSX.Element;

const EMBLEMS: Record<string, EmblemFn> = {
  // Core Personality — a five-fold rosette (wholeness / the Big Five).
  core: () => (
    <>
      <circle cx="24" cy="24" r="19" />
      <polygon points="24,8 39.2,19 33.4,37 14.6,37 8.8,19" />
      <polygon className="gold" points="24,14 33,20.5 29.6,31 18.4,31 15,20.5" />
      <circle className="gold gold-fill" cx="24" cy="24" r="3" />
    </>
  ),
  // Types & Styles — a quartered typology wheel.
  types: () => (
    <>
      <circle cx="24" cy="24" r="19" />
      <line x1="24" y1="6" x2="24" y2="42" />
      <line x1="6" y1="24" x2="42" y2="24" />
      <circle className="gold" cx="24" cy="24" r="8" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2.6" />
      <circle className="gold gold-fill" cx="24" cy="9" r="1.8" />
      <circle className="gold gold-fill" cx="39" cy="24" r="1.8" />
      <circle className="gold gold-fill" cx="24" cy="39" r="1.8" />
      <circle className="gold gold-fill" cx="9" cy="24" r="1.8" />
    </>
  ),
  // Relationships & Love — two interlinked rings.
  relationships: () => (
    <>
      <circle cx="18" cy="24" r="12" />
      <circle cx="30" cy="24" r="12" />
      <path className="gold gold-fill"
        d="M24,21 C23,18.5 19.5,18.7 19.5,21.6 C19.5,24 24,27 24,27 C24,27 28.5,24 28.5,21.6 C28.5,18.7 25,18.5 24,21 Z" />
    </>
  ),
  // Communication & Conflict — two speech bubbles in dialogue.
  communication: () => (
    <>
      <rect x="7" y="9" width="25" height="15" rx="4" />
      <path d="M13,24 L13,30 L20,24" />
      <rect className="gold" x="20" y="20" width="21" height="14" rx="4" />
      <path className="gold" d="M35,34 L35,39 L29,34" />
      <circle className="gold gold-fill" cx="26.5" cy="27" r="1.3" />
      <circle className="gold gold-fill" cx="30.5" cy="27" r="1.3" />
      <circle className="gold gold-fill" cx="34.5" cy="27" r="1.3" />
    </>
  ),
  // Strengths, Values & Growth — a rising sprout.
  strengths: () => (
    <>
      <path d="M24,42 L24,20" />
      <path d="M24,30 C16,30 12.5,22 15.5,17 C22,19 24.5,25 24,30 Z" />
      <path d="M24,26 C32,26 35.5,18 32.5,13 C26,15 23.5,21 24,26 Z" />
      <circle className="gold gold-fill" cx="24" cy="12" r="3.4" />
      <line x1="15" y1="43" x2="33" y2="43" />
    </>
  ),
  // Career & Calling — a compass star within a ring.
  career: () => (
    <>
      <circle cx="24" cy="24" r="19" />
      <polygon className="gold gold-fill" points="24,9 27,21 39,24 27,27 24,39 21,27 9,24 21,21" />
      <circle cx="24" cy="24" r="2.4" className="paper-fill" />
    </>
  ),
  // Emotional Intelligence & Wellbeing — a heart above a calm ripple.
  emotional: () => (
    <>
      <path d="M24,31 C13,23 15,14.5 21,16.5 C23,17.2 24,19 24,19 C24,19 25,17.2 27,16.5 C33,14.5 35,23 24,31 Z" />
      <path className="gold" d="M9,37 Q14,33 19,37 T29,37 T39,37" />
    </>
  ),
  // Mind & Neurodivergence — a small neural constellation.
  mind: () => (
    <>
      <path d="M14,15 L24,24 L34,13 M24,24 L17,35 M24,24 L34,33 M17,35 L34,33" />
      <circle className="paper-fill" cx="14" cy="15" r="3.2" />
      <circle cx="14" cy="15" r="3.2" />
      <circle className="paper-fill" cx="34" cy="13" r="3.2" />
      <circle cx="34" cy="13" r="3.2" />
      <circle className="paper-fill" cx="17" cy="35" r="3.2" />
      <circle cx="17" cy="35" r="3.2" />
      <circle className="paper-fill" cx="34" cy="33" r="3.2" />
      <circle cx="34" cy="33" r="3.2" />
      <circle className="gold gold-fill" cx="24" cy="24" r="4" />
    </>
  ),
  // Shadow & Risk — an eclipse with a single attendant star.
  shadow: () => (
    <>
      <circle cx="22" cy="24" r="15" />
      <path className="ink-fill" fill="currentColor"
        d="M27,11 A15,15 0 1 0 27,37 A11.5,11.5 0 1 1 27,11 Z" />
      <Sparkle x={39} y={12} r={2} />
    </>
  ),
  // Learning & Thinking — an open book with a spark of insight.
  learning: () => (
    <>
      <path d="M24,15 C20,12 13,12 8,14 L8,35 C13,33 20,33 24,36 Z" />
      <path d="M24,15 C28,12 35,12 40,14 L40,35 C35,33 28,33 24,36 Z" />
      <line x1="24" y1="15" x2="24" y2="36" />
      <Sparkle x={24} y={9} r={2.1} />
    </>
  ),
  // Focused Scales — a target with crosshairs (one construct, precisely).
  focused: () => (
    <>
      <circle cx="24" cy="24" r="16" />
      <circle cx="24" cy="24" r="9" />
      <circle className="gold gold-fill" cx="24" cy="24" r="3" />
      <line x1="24" y1="3" x2="24" y2="9" />
      <line x1="24" y1="39" x2="24" y2="45" />
      <line x1="3" y1="24" x2="9" y2="24" />
      <line x1="39" y1="24" x2="45" y2="24" />
    </>
  ),
  // Stress & Wellbeing — a calm, growing leaf.
  wellbeing: () => (
    <>
      <path d="M24,41 C24,28 13,22 9,11 C22,10 34,18 31,31 C30,37 27,41 24,41 Z" />
      <path className="gold" d="M24,41 C24,31 20,22 15,16" />
    </>
  ),
  // Cognitive Ability — a thinking head with a turning gear of reasoning.
  cognition: () => (
    <>
      <path d="M16,41 L16,25 C16,13 25,8 32,11 C38,13.6 39,20 35,24 C39,26 38,31 33,31 L31,31 L31,41" />
      <circle className="gold" cx="26" cy="21" r="4.5" />
      <g className="gold">
        <line x1="26" y1="14.5" x2="26" y2="16.5" />
        <line x1="26" y1="25.5" x2="26" y2="27.5" />
        <line x1="19.5" y1="21" x2="21.5" y2="21" />
        <line x1="30.5" y1="21" x2="32.5" y2="21" />
      </g>
      <circle className="gold gold-fill" cx="26" cy="21" r="1.6" />
    </>
  ),
};

export function CategoryEmblem({ id, className = "" }: { id: string; className?: string }) {
  const draw = EMBLEMS[id] ?? EMBLEMS.core;
  return (
    <svg className={`emblem ${className}`} viewBox="0 0 48 48" role="img" aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      {draw()}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Per-instrument glyphs — a distinct symbol for every assessment.     */
/* ------------------------------------------------------------------ */

// A small alchemical element mark, used inside the four-temperaments glyph.
function el(kind: Element, cx: number, cy: number) {
  if (kind === "fire") return <polygon points={`${cx},${cy - 6} ${cx + 6},${cy + 5} ${cx - 6},${cy + 5}`} />;
  if (kind === "water") return <polygon points={`${cx - 6},${cy - 5} ${cx + 6},${cy - 5} ${cx},${cy + 6}`} />;
  if (kind === "air")
    return (
      <>
        <polygon points={`${cx},${cy - 6} ${cx + 6},${cy + 5} ${cx - 6},${cy + 5}`} />
        <line x1={cx - 3.5} y1={cy + 1} x2={cx + 3.5} y2={cy + 1} />
      </>
    );
  return (
    <>
      <polygon points={`${cx - 6},${cy - 5} ${cx + 6},${cy - 5} ${cx},${cy + 6}`} />
      <line x1={cx - 3.5} y1={cy - 1} x2={cx + 3.5} y2={cy - 1} />
    </>
  );
}

const GLYPHS: Record<string, EmblemFn> = {
  // Big Five — five trait-stars in a constellation.
  "big-five-ipip50": () => (
    <>
      <polyline className="ink-soft" points="9,29 18,17 24,27 31,14 39,28" />
      <circle cx="9" cy="29" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
      <circle cx="24" cy="27" r="2.2" />
      <circle className="gold gold-fill" cx="31" cy="14" r="2.8" />
      <circle cx="39" cy="28" r="2.2" />
    </>
  ),
  // HEXACO — a six-pointed hexagram (its six factors).
  "hexaco-24": () => (
    <>
      <circle className="ink-faint" cx="24" cy="24" r="18" />
      <polygon points="24,8 37.9,32 10.1,32" />
      <polygon points="24,40 10.1,16 37.9,16" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2.6" />
    </>
  ),
  // Jungian types — the duality of attitudes (a yin/yang divide).
  "jung-16-types": () => (
    <>
      <circle cx="24" cy="24" r="17" />
      <path d="M24,7 A8.5,8.5 0 0 1 24,24 A8.5,8.5 0 0 0 24,41" />
      <circle className="ink-fill" cx="24" cy="15.5" r="2.4" />
      <circle className="gold gold-fill" cx="24" cy="32.5" r="2.4" />
    </>
  ),
  // Enneagram — the authentic nine-pointed figure (triangle + hexad).
  "enneagram-9": () => (
    <>
      <circle cx="24" cy="24" r="17" />
      <polygon className="gold" points="24,7 38.7,32.5 9.3,32.5" />
      <polygon points="34.9,11 29.8,40 40.7,21.1 13.1,11 18.2,40 7.3,21.1" />
      <circle className="gold gold-fill" cx="24" cy="7" r="1.7" />
    </>
  ),
  // DISC — four behavioural quadrants.
  "disc-4": () => (
    <>
      <rect className="gold gold-fill" x="10" y="10" width="12" height="12" rx="3" />
      <rect x="26" y="10" width="12" height="12" rx="3" />
      <rect x="10" y="26" width="12" height="12" rx="3" />
      <rect x="26" y="26" width="12" height="12" rx="3" />
    </>
  ),
  // Four Temperaments — the classical elements, one per quadrant.
  "four-temperaments": () => (
    <g className="gold">
      {el("fire", 15, 16)}
      {el("air", 33, 16)}
      {el("water", 15, 33)}
      {el("earth", 33, 33)}
    </g>
  ),
  // Attachment — an anchor (security and the bonds that hold).
  "attachment-styles": () => (
    <>
      <circle className="gold" cx="24" cy="11" r="3.4" />
      <line x1="24" y1="14.4" x2="24" y2="37" />
      <line x1="17" y1="19" x2="31" y2="19" />
      <path d="M13,29 A12,12 0 0 0 35,29" />
      <path d="M13,29 L11,24" />
      <path d="M35,29 L37,24" />
    </>
  ),
  // Love Languages — a sealed letter with a heart.
  "love-languages": () => (
    <>
      <rect x="9" y="17" width="30" height="20" rx="2.5" />
      <path d="M9,18 L24,29 L39,18" />
      <path className="gold gold-fill" d="M24,16 C23,13.6 19.6,13.8 19.6,16.6 C19.6,18.8 24,21.5 24,21.5 C24,21.5 28.4,18.8 28.4,16.6 C28.4,13.8 25,13.6 24,16 Z" />
    </>
  ),
  // Conflict Style — two forces meeting at a point of negotiation.
  "conflict-style": () => (
    <>
      <path d="M8,24 L19,24 M19,24 L15,21 M19,24 L15,27" />
      <path d="M40,24 L29,24 M29,24 L33,21 M29,24 L33,27" />
      <polygon className="gold gold-fill" points="24,19.5 27.5,24 24,28.5 20.5,24" />
    </>
  ),
  // Couple Communication — two speech bubbles cradling a heart.
  "couple-communication": () => (
    <>
      <rect x="6" y="11" width="15" height="12" rx="3.5" />
      <rect x="27" y="11" width="15" height="12" rx="3.5" />
      <path d="M11,23 L11,28 L16,23" />
      <path d="M37,23 L37,28 L32,23" />
      <path className="gold gold-fill" d="M24,40 C24,40 17,35 17,31 C17,28.4 19.6,27.5 21.3,28.7 C22.4,29.5 24,31.2 24,31.2 C24,31.2 25.6,29.5 26.7,28.7 C28.4,27.5 31,28.4 31,31 C31,35 24,40 24,40 Z" />
    </>
  ),
  // Team Communication — three members linked around a shared hub.
  "team-communication": () => (
    <>
      <circle cx="24" cy="11" r="5" />
      <circle cx="11" cy="35" r="5" />
      <circle cx="37" cy="35" r="5" />
      <path d="M22,15.5 L14,30.5 M26,15.5 L34,30.5 M16,35 L32,35" />
      <circle className="gold gold-fill" cx="24" cy="27" r="3" />
    </>
  ),
  // Communication Style — a speech bubble radiating, heard clearly.
  "communication-style": () => (
    <>
      <rect x="8" y="11" width="22" height="16" rx="4" />
      <path d="M15,27 L15,33 L22,27" />
      <circle className="gold gold-fill" cx="15.5" cy="19" r="1.3" />
      <circle className="gold gold-fill" cx="19.5" cy="19" r="1.3" />
      <circle className="gold gold-fill" cx="23.5" cy="19" r="1.3" />
      <path className="gold" d="M34,15 C37.5,18.5 37.5,28.5 34,32 M38,12 C42.5,17 42.5,30 38,35" />
    </>
  ),
  // Money Scripts — a coin marked with a dollar sign.
  "money-scripts": () => (
    <>
      <circle cx="24" cy="24" r="17" />
      <circle className="gold" cx="24" cy="24" r="11" />
      <line className="gold" x1="24" y1="14.5" x2="24" y2="33.5" />
      <path className="gold" d="M28,18.5 C28,16.6 26.2,15.5 24,15.5 C21.8,15.5 20,16.6 20,18.8 C20,23 28,21.5 28,25.4 C28,27.5 26.2,28.5 24,28.5 C21.8,28.5 20,27.4 20,25.5" />
    </>
  ),
  // Self-Compassion — a heart cradled in two cupped hands.
  "self-compassion-scs": () => (
    <>
      <path className="gold gold-fill" d="M24,28 C24,28 15,22 15,17.5 C15,14.8 17,13.2 19.3,13.2 C21.2,13.2 22.8,14.4 24,16.2 C25.2,14.4 26.8,13.2 28.7,13.2 C31,13.2 33,14.8 33,17.5 C33,22 24,28 24,28 Z" />
      <path d="M13,30 C15,37 19,40 24,40 C29,40 33,37 35,30" />
      <path d="M13,30 L16,28 M35,30 L32,28" />
    </>
  ),
  // Time Perspective — an hourglass: past above, future below, the present mid-fall.
  "time-perspective-ztpi": () => (
    <>
      <line x1="14" y1="9" x2="34" y2="9" />
      <line x1="14" y1="39" x2="34" y2="39" />
      <path d="M16,9 C16,18 32,18 32,9" />
      <path d="M16,39 C16,30 32,30 32,39" />
      <path className="gold gold-fill" d="M19,12.5 C19,16.5 29,16.5 29,12.5 Z" />
      <path className="gold gold-fill" d="M21.5,39 C21.5,35 26.5,35 26.5,39 Z" />
      <line className="gold" x1="24" y1="22" x2="24" y2="27" />
    </>
  ),
  // Meaning in Life — a guiding north star.
  "meaning-mlq": () => (
    <>
      <path className="gold gold-fill" d="M24,7 L26.6,21.4 L41,24 L26.6,26.6 L24,41 L21.4,26.6 L7,24 L21.4,21.4 Z" />
      <circle cx="24" cy="24" r="2.1" />
      <circle className="gold" cx="13.5" cy="13.5" r="0.9" />
      <circle className="gold" cx="35" cy="14" r="0.9" />
    </>
  ),
  // VIA character strengths — a medal of virtue.
  "via-24": () => (
    <>
      <path d="M17,28 L14,41 L20,37 L24,42 L28,37 L34,41 L31,28" />
      <circle cx="24" cy="19" r="11" />
      <polygon className="gold gold-fill" points="24,12.5 25.5,16.9 30.2,17 26.5,19.8 27.8,24.3 24,21.6 20.2,24.3 21.5,19.8 17.8,17 22.5,16.9" />
    </>
  ),
  // Schwartz values — a balance of priorities.
  "schwartz-values": () => (
    <>
      <line x1="24" y1="11" x2="24" y2="34" />
      <path d="M18,38 L30,38 M24,34 L20,38 M24,34 L28,38" />
      <line x1="11" y1="16" x2="37" y2="16" />
      <path d="M11,16 L7,24 M11,16 L15,24 M7,24 A4,4 0 0 0 15,24" />
      <path d="M37,16 L33,24 M37,16 L41,24 M33,24 A4,4 0 0 0 41,24" />
      <circle className="gold gold-fill" cx="24" cy="11" r="2.4" />
    </>
  ),
  // Grit — a summit reached and crowned.
  "grit-resilience": () => (
    <>
      <path d="M6,38 L18,17 L26,29 L32,21 L42,38 Z" />
      <path className="ink-soft" d="M14,24 L18,17 L22,24" />
      <Sparkle x={18} y={11} r={2.1} />
    </>
  ),
  // Moral Foundations — a classical temple of principles.
  "moral-foundations": () => (
    <>
      <path d="M9,15 L24,7 L39,15 Z" />
      <line x1="11" y1="18" x2="37" y2="18" />
      <line x1="15" y1="18" x2="15" y2="35" />
      <line x1="24" y1="18" x2="24" y2="35" />
      <line x1="33" y1="18" x2="33" y2="35" />
      <line x1="11" y1="35" x2="37" y2="35" />
      <line x1="9" y1="39" x2="39" y2="39" />
      <circle className="gold gold-fill" cx="24" cy="12" r="2" />
    </>
  ),
  // RIASEC — Holland's career hexagon.
  "riasec-careers": () => (
    <>
      <polygon points="24,7 38.7,15.5 38.7,32.5 24,41 9.3,32.5 9.3,15.5" />
      <g className="ink-faint">
        <line x1="24" y1="24" x2="24" y2="7" />
        <line x1="24" y1="24" x2="38.7" y2="15.5" />
        <line x1="24" y1="24" x2="38.7" y2="32.5" />
        <line x1="24" y1="24" x2="24" y2="41" />
        <line x1="24" y1="24" x2="9.3" y2="32.5" />
        <line x1="24" y1="24" x2="9.3" y2="15.5" />
      </g>
      <circle className="gold gold-fill" cx="24" cy="24" r="3" />
    </>
  ),
  // Emotional Intelligence — a heart held within the mind.
  "emotional-intelligence": () => (
    <>
      <path d="M30,37 L30,30 C34,28 36,23 36,19 C36,12 30,7 23,7 C15,7 10,13 10,20 C10,25 13,29 17,31 L17,37" />
      <path className="gold gold-fill" d="M23,27 C16,22 18,15 22.4,17 C23.6,17.5 23,18.6 23,18.6 C23,18.6 23.4,17.5 24.6,17 C29,15 31,22 23,27 Z" transform="translate(0 -1)" />
    </>
  ),
  // Chronotype — sun and moon across the horizon.
  "chronotype": () => (
    <>
      <line x1="6" y1="31" x2="42" y2="31" />
      <path className="gold" d="M9,31 A7,7 0 0 1 23,31" />
      <g className="gold">
        <line x1="16" y1="20" x2="16" y2="17" />
        <line x1="9.5" y1="23.5" x2="7.5" y2="21.5" />
        <line x1="22.5" y1="23.5" x2="24.5" y2="21.5" />
      </g>
      <path className="gold gold-fill" d="M37,14 A8,8 0 1 0 37,28 A6,6 0 1 1 37,14 Z" />
      <Sparkle x={28} y={14} r={1.5} />
    </>
  ),
  // ADHD (educational) — a bolt of energy.
  "adhd-traits": () => (
    <>
      <polygon className="gold gold-fill" points="27,7 14,27 22,27 20,41 34,20 26,20" />
    </>
  ),
  // Autism (educational) — the neurodiversity infinity.
  "autism-traits": () => (
    <path className="gold" strokeWidth="2.2"
      d="M24,24 C20,18 12,18 12,24 C12,30 20,30 24,24 C28,18 36,18 36,24 C36,30 28,30 24,24 Z" />
  ),
  // Dark Triad — three interlocked rings.
  "dark-triad-18": () => (
    <>
      <circle cx="24" cy="17" r="9" />
      <circle cx="17" cy="29" r="9" />
      <circle className="gold" cx="31" cy="29" r="9" />
    </>
  ),
};

// --- additional glyphs for the second wave of instruments ---
Object.assign(GLYPHS, {
  // Eysenck PEN — three dimensions as ascending bars.
  "eysenck-pen": () => (
    <>
      <line x1="13" y1="34" x2="13" y2="26" />
      <line x1="24" y1="34" x2="24" y2="18" />
      <line className="gold" x1="35" y1="34" x2="35" y2="22" />
      <line x1="8" y1="34" x2="40" y2="34" />
      <circle className="gold gold-fill" cx="24" cy="18" r="2.4" />
      <circle cx="13" cy="26" r="2" />
      <circle cx="35" cy="22" r="2" />
    </>
  ),
  // 16PF — sixteen primary factors as a 4×4 lattice.
  "sixteen-pf": () => (
    <>
      {[12, 20, 28, 36].map((y) =>
        [12, 20, 28, 36].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2"
            className={x === 28 && y === 20 ? "gold gold-fill" : undefined} />
        )),
      )}
    </>
  ),
  // Keirsey temperaments — a four-lobed quatrefoil.
  "keirsey-temperaments": () => (
    <>
      <path d="M24,24 C24,16 16,16 16,21 C12,18 8,24 14,26 C8,28 12,34 16,31 C16,36 24,34 24,24 Z" />
      <path d="M24,24 C24,16 32,16 32,21 C36,18 40,24 34,26 C40,28 36,34 32,31 C32,36 24,34 24,24 Z" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2.6" />
    </>
  ),
  // Dark Tetrad — four interlocked rings.
  "dark-tetrad-18": () => (
    <>
      <circle cx="18" cy="18" r="8.5" />
      <circle cx="30" cy="18" r="8.5" />
      <circle cx="18" cy="30" r="8.5" />
      <circle className="gold" cx="30" cy="30" r="8.5" />
    </>
  ),
  // PID-5 — five maladaptive domains, a pentagon with a fault line.
  "pid5-maladaptive": () => (
    <>
      <polygon points="24,8 38,18.5 32.5,35 15.5,35 10,18.5" />
      <path className="gold" d="M16,13 L26,24 L21,29 L33,33" />
    </>
  ),
});

// --- glyphs for the depth / type / workplace / values / wellbeing wave ---
Object.assign(GLYPHS, {
  // Big Five Aspects — ten aspects as nested pentagons.
  "big-five-aspects": () => (
    <>
      <polygon points="24,8 39.2,19.1 33.4,37 14.6,37 8.8,19.1" />
      <polygon className="gold" points="28.7,17.5 31.6,26.5 24,32 16.4,26.5 19.3,17.5" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2.4" />
    </>
  ),
  // Four Color Styles — four distinct shapes for four styles.
  "color-styles": () => (
    <>
      <rect x="10" y="10" width="12" height="12" rx="2.5" />
      <circle cx="32" cy="16" r="6" />
      <polygon points="16,28 10,38 22,38" />
      <polygon className="gold gold-fill" points="32,26 38,32 32,38 26,32" />
    </>
  ),
  // Socionics — an eight-function ring.
  "socionics-16": () => (
    <>
      <circle cx="24" cy="24" r="17" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
        const a = (d * Math.PI) / 180;
        return <circle key={d} cx={24 + 12 * Math.cos(a)} cy={24 + 12 * Math.sin(a)} r="1.7" />;
      })}
      <circle className="gold gold-fill" cx="24" cy="24" r="3" />
    </>
  ),
  // Career Derailers — a climb that overshoots and crashes.
  "career-derailers": () => (
    <>
      <polyline points="8,32 16,18 24,26 31,11" />
      <path className="gold" d="M31,11 L40,40" />
      <circle className="gold gold-fill" cx="31" cy="11" r="2.4" />
    </>
  ),
  // Rokeach Values — a ladder of priorities.
  "rokeach-values": () => (
    <>
      <line x1="17" y1="8" x2="17" y2="42" />
      <line x1="31" y1="8" x2="31" y2="42" />
      <line className="gold" x1="17" y1="14" x2="31" y2="14" />
      <line x1="17" y1="22" x2="31" y2="22" />
      <line x1="17" y1="30" x2="31" y2="30" />
      <line x1="17" y1="38" x2="31" y2="38" />
    </>
  ),
  // PERMA Flourishing — a five-petal blossom.
  "perma-flourishing": () => (
    <>
      {[-90, -18, 54, 126, 198].map((d) => {
        const a = (d * Math.PI) / 180;
        return <circle key={d} cx={24 + 10 * Math.cos(a)} cy={24 + 10 * Math.sin(a)} r="5" />;
      })}
      <circle className="gold gold-fill" cx="24" cy="24" r="3.4" />
    </>
  ),
  // VARK — four input channels converging.
  "vark-learning": () => (
    <>
      <path d="M24,9 L24,18 M21,15 L24,18 L27,15" />
      <path d="M39,24 L30,24 M33,21 L30,24 L33,27" />
      <path d="M24,39 L24,30 M21,33 L24,30 L27,33" />
      <path d="M9,24 L18,24 M15,21 L18,24 L15,27" />
      <circle className="gold gold-fill" cx="24" cy="24" r="3" />
    </>
  ),
  // Kolb — the experiential learning cycle.
  "kolb-learning": () => (
    <>
      <circle cx="24" cy="24" r="15" />
      <polygon className="gold gold-fill" points="21,4 30,9 21,14" />
      <circle cx="39" cy="24" r="2" />
      <circle cx="24" cy="39" r="2" />
      <circle cx="9" cy="24" r="2" />
    </>
  ),
  // Mood Check-in — a rising dawn.
  "mood-checkin": () => (
    <>
      <line x1="8" y1="32" x2="40" y2="32" />
      <path className="gold" d="M15,32 A9,9 0 0 1 33,32" />
      <g className="gold">
        <line x1="24" y1="14" x2="24" y2="10" />
        <line x1="13" y1="19" x2="10" y2="16" />
        <line x1="35" y1="19" x2="38" y2="16" />
      </g>
    </>
  ),
  // Worry Check-in — calm, settling ripples.
  "worry-checkin": () => (
    <>
      <circle className="ink-faint" cx="24" cy="24" r="17" />
      <circle className="ink-soft" cx="24" cy="24" r="11" />
      <circle cx="24" cy="24" r="5.5" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2.4" />
    </>
  ),
  // Burnout — a dwindling flame.
  "burnout-mbi": () => (
    <path className="gold gold-fill" d="M24,7 C28,15 33,18 33,26 A9,9 0 0 1 15,26 C15,21 19,20 21,15 C22,18.5 24,18 24,21 C26.5,19 25,12.5 24,7 Z" />
  ),
  // Perceived Stress — a pressure gauge near the top.
  "perceived-stress": () => (
    <>
      <path d="M9,32 A15,15 0 0 1 39,32" />
      <line x1="9" y1="32" x2="39" y2="32" />
      <line className="gold" x1="24" y1="32" x2="34" y2="22" />
      <circle className="gold gold-fill" cx="24" cy="32" r="2.6" />
    </>
  ),
  // PANAS — two affects, plus and minus.
  "panas-affect": () => (
    <>
      <circle cx="24" cy="24" r="16" />
      <line x1="24" y1="8" x2="24" y2="40" />
      <g className="gold"><line x1="11" y1="24" x2="19" y2="24" /><line x1="15" y1="20" x2="15" y2="28" /></g>
      <line className="gold" x1="29" y1="24" x2="37" y2="24" />
    </>
  ),
  // Ryff Well-Being — a six-rayed flourishing.
  "ryff-wellbeing": () => (
    <>
      {[0, 60, 120, 180, 240, 300].map((d) => {
        const a = (d * Math.PI) / 180;
        return <line key={d} x1={24 + 5 * Math.cos(a)} y1={24 + 5 * Math.sin(a)} x2={24 + 16 * Math.cos(a)} y2={24 + 16 * Math.sin(a)} />;
      })}
      <circle className="gold gold-fill" cx="24" cy="24" r="4" />
    </>
  ),
  // Coping Styles — an umbrella sheltering from a drop.
  "coping-styles": () => (
    <>
      <path d="M8,25 A16,12 0 0 1 40,25 Z" />
      <line x1="24" y1="25" x2="24" y2="37" />
      <path d="M24,37 A3.5,3.5 0 0 0 31,37" />
      <path className="gold gold-fill" d="M24,6 C25.6,9 27,10.5 27,12.5 A3,3 0 0 1 21,12.5 C21,10.5 22.4,9 24,6 Z" />
    </>
  ),
});

// --- glyphs for the Focused Scales ---
Object.assign(GLYPHS, {
  // Self-Esteem — a figure standing tall.
  "self-esteem-rses": () => (
    <>
      <circle cx="24" cy="14" r="5" />
      <path d="M14,38 C14,28 34,28 34,38" />
      <line x1="9" y1="40" x2="39" y2="40" />
      <Sparkle x={36} y={12} r={1.8} />
    </>
  ),
  // Locus of Control — a dial with a pointer.
  "locus-of-control": () => (
    <>
      <circle cx="24" cy="24" r="16" />
      <line className="gold" x1="24" y1="24" x2="33" y2="15" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2.6" />
      <line x1="24" y1="8" x2="24" y2="11" />
      <line x1="40" y1="24" x2="37" y2="24" />
      <line x1="24" y1="40" x2="24" y2="37" />
      <line x1="8" y1="24" x2="11" y2="24" />
    </>
  ),
  // Mindset — a curve climbing into branches (growth).
  "mindset-dweck": () => (
    <>
      <path d="M10,40 C14,30 18,22 30,14" />
      <path className="gold" d="M30,14 L23,14 M30,14 L30,21" />
      <circle className="gold gold-fill" cx="30" cy="14" r="2.4" />
      <circle cx="10" cy="40" r="2" />
    </>
  ),
  // Self-Monitoring — an observing eye.
  "self-monitoring": () => (
    <>
      <path d="M6,24 C12,15 36,15 42,24 C36,33 12,33 6,24 Z" />
      <circle cx="24" cy="24" r="5" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2" />
    </>
  ),
  // Sensation Seeking — a die (chance and novelty).
  "sensation-seeking": () => (
    <>
      <rect x="9" y="9" width="30" height="30" rx="6" />
      <circle className="gold gold-fill" cx="17" cy="17" r="2.2" />
      <circle className="gold gold-fill" cx="24" cy="24" r="2.2" />
      <circle className="gold gold-fill" cx="31" cy="31" r="2.2" />
    </>
  ),
  // Need for Cognition — a lightbulb of thought.
  "need-for-cognition": () => (
    <>
      <path d="M24,7 C16,7 11,13 11,20 C11,25 14,28 16,31 L16,34 L32,34 L32,31 C34,28 37,25 37,20 C37,13 32,7 24,7 Z" />
      <line x1="18" y1="38" x2="30" y2="38" />
      <line x1="20" y1="42" x2="28" y2="42" />
      <path className="gold" d="M20,20 L24,24 L28,18" />
    </>
  ),
  // Empathy — two overlapping hearts.
  "empathy-iri": () => (
    <>
      <path d="M19,32 C9,25 11,15 17,17 C18.5,17.6 19,19 19,19 C19,19 19.5,17.6 21,17 C27,15 29,25 19,32 Z" />
      <path className="gold" d="M30,34 C22,28 23.6,20 28.4,21.6 C29.6,22 30,23 30,23 C30,23 30.4,22 31.6,21.6 C36.4,20 38,28 30,34 Z" />
    </>
  ),
  // Satisfaction With Life — a bright five-point star.
  "life-satisfaction-swls": () => (
    <polygon className="gold gold-fill" points="24,6 28.6,18.2 41.6,18.9 31.4,27 34.9,39.6 24,32.3 13.1,39.6 16.6,27 6.4,18.9 19.4,18.2" />
  ),
  // Resilience — a curve that dips and rebounds.
  "brief-resilience": () => (
    <>
      <path d="M8,16 C12,40 36,40 40,16" />
      <path d="M8,16 L6,21 M8,16 L12,19" />
      <path className="gold" d="M40,16 L36,19 M40,16 L42,21" />
    </>
  ),
});

// --- glyphs for the validated multi-trait / motivation wave ---
Object.assign(GLYPHS, {
  // TCI — a double helix (nature and nurture).
  "tci-cloninger": () => (
    <>
      <path d="M17,8 C31,15 31,17 17,24 C31,31 31,33 17,40" />
      <path d="M31,8 C17,15 17,17 31,24 C17,31 17,33 31,40" />
      <line x1="20.5" y1="12" x2="27.5" y2="12" />
      <line className="gold" x1="20" y1="24" x2="28" y2="24" />
      <line x1="20.5" y1="36" x2="27.5" y2="36" />
    </>
  ),
  // ZKPQ — the Alternative Five as five rays.
  "zkpq-alt5": () => (
    <>
      {[-90, -18, 54, 126, 198].map((d) => {
        const a = (d * Math.PI) / 180;
        return <line key={d} x1="24" y1="24" x2={24 + 16 * Math.cos(a)} y2={24 + 16 * Math.sin(a)} />;
      })}
      <circle className="gold gold-fill" cx="24" cy="24" r="3" />
    </>
  ),
  // Career Anchors — a briefcase.
  "career-anchors": () => (
    <>
      <rect x="8" y="16" width="32" height="22" rx="3" />
      <path d="M18,16 L18,12 C18,11 19,10 20,10 L28,10 C29,10 30,11 30,12 L30,16" />
      <line className="gold" x1="8" y1="25" x2="40" y2="25" />
      <rect className="gold gold-fill" x="21" y="23" width="6" height="4" rx="1" />
    </>
  ),
  // Leadership — a vision pennant rallying the group.
  "leadership-styles": () => (
    <>
      <line x1="14" y1="8" x2="14" y2="40" />
      <path className="gold gold-fill" d="M14,9 L34,15 L14,21 Z" />
      <circle className="gold gold-fill" cx="14" cy="8" r="2" />
      <circle cx="8" cy="40" r="2" />
      <circle cx="14" cy="40" r="2" />
      <circle cx="20" cy="40" r="2" />
    </>
  ),
  // McClelland — three motives.
  "mcclelland-needs": () => (
    <>
      <path d="M24,9 L37,33 L11,33 Z" />
      <circle className="gold gold-fill" cx="24" cy="9" r="3" />
      <circle className="paper-fill" cx="37" cy="33" r="3" />
      <circle cx="37" cy="33" r="3" />
      <circle className="paper-fill" cx="11" cy="33" r="3" />
      <circle cx="11" cy="33" r="3" />
    </>
  ),
  // Cognitive Ability — a matrix-reasoning grid (find the missing piece).
  "cognitive-ability": () => (
    <>
      {[12, 24, 36].map((y) =>
        [12, 24, 36].map((x) => (
          <rect key={`${x}-${y}`} x={x - 5} y={y - 5} width="10" height="10" rx="2"
            className={x === 36 && y === 36 ? "gold gold-fill" : undefined} />
        )),
      )}
    </>
  ),
  // Culture-Fair — a 2×2 of differing shapes with the missing piece.
  "culture-fair": () => (
    <>
      <circle cx="16" cy="16" r="6" />
      <rect x="27" y="10" width="12" height="12" rx="2" />
      <polygon points="16,28 22,40 10,40" />
      <polygon className="gold gold-fill" points="33,28 39,34 33,40 27,34" />
    </>
  ),
  // Verbal-Numerical Aptitude — a stopwatch (speeded test).
  "verbal-numerical": () => (
    <>
      <circle cx="24" cy="26" r="15" />
      <line x1="24" y1="6" x2="24" y2="11" />
      <line x1="19" y1="7" x2="29" y2="7" />
      <line className="gold" x1="24" y1="26" x2="24" y2="17" />
      <line className="gold" x1="24" y1="26" x2="31" y2="29" />
      <circle className="gold gold-fill" cx="24" cy="26" r="2" />
    </>
  ),
  // Creative Thinking — one seed branching into many ideas.
  "alternative-uses": () => (
    <>
      <path d="M16,24 L30,12 M16,24 L34,21 M16,24 L33,31 M16,24 L28,39" />
      <circle className="gold gold-fill" cx="16" cy="24" r="3.4" />
      <circle cx="30" cy="12" r="2.4" /><circle cx="34" cy="21" r="2.4" /><circle cx="33" cy="31" r="2.4" /><circle cx="28" cy="39" r="2.4" />
    </>
  ),
  // Situational Judgment — a signpost / decision fork.
  "situational-judgment": () => (
    <>
      <line x1="24" y1="42" x2="24" y2="22" />
      <path className="gold gold-fill" d="M24,10 L37,15 L24,20 Z" />
      <path d="M24,22 L12,28 M24,22 L36,28" />
      <circle cx="12" cy="29" r="2.4" /><circle className="gold gold-fill" cx="36" cy="29" r="2.4" />
    </>
  ),
  // Implicit Associations — two linked concepts with a fast spark.
  "iat-demo": () => (
    <>
      <circle cx="13" cy="24" r="6.5" />
      <circle className="gold" cx="35" cy="24" r="6.5" />
      <path className="gold gold-fill" d="M22,24 L26,18 L25,23 L28,23 L23,30 L24,25 L21,25 Z" />
    </>
  ),
  // Critical Thinking — scales weighing an argument.
  "critical-thinking": () => (
    <>
      <line x1="24" y1="9" x2="24" y2="34" />
      <line x1="12" y1="15" x2="36" y2="15" />
      <path d="M12,15 L8,24 M12,15 L16,24 M8,24 a4,4 0 0 0 8,0" />
      <path className="gold" d="M36,15 L32,24 M36,15 L40,24 M32,24 a4,4 0 0 0 8,0" />
      <path d="M18,38 L30,38 M24,34 L20,38 M24,34 L28,38" />
    </>
  ),
  // Mechanical Reasoning — a gear.
  "mechanical-reasoning": () => (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
        const a = (d * Math.PI) / 180;
        return <line key={d} x1={24 + 13 * Math.cos(a)} y1={24 + 13 * Math.sin(a)} x2={24 + 18 * Math.cos(a)} y2={24 + 18 * Math.sin(a)} />;
      })}
      <circle cx="24" cy="24" r="12" />
      <circle className="gold" cx="24" cy="24" r="5" />
    </>
  ),
  // Adaptive Reasoning — an ascending staircase.
  "adaptive-reasoning": () => (
    <>
      <path d="M8,40 L8,33 L18,33 L18,25 L28,25 L28,17 L38,17 L38,9" />
      <line x1="6" y1="40" x2="40" y2="40" />
      <circle className="gold gold-fill" cx="38" cy="9" r="3" />
    </>
  ),
  // Processing Speed — fast-forward chevrons.
  "processing-speed": () => (
    <>
      <path className="gold" d="M11,13 L21,24 L11,35" />
      <path d="M23,13 L33,24 L23,35" />
      <circle className="gold gold-fill" cx="39" cy="24" r="2.6" />
    </>
  ),
  // Corsi blocks — a path lit through a 3×3 board.
  "corsi-blocks": () => (
    <>
      {[12, 24, 36].map((y) => [12, 24, 36].map((x) => (
        <rect key={`${x}-${y}`} x={x - 5} y={y - 5} width="10" height="10" rx="2" />
      )))}
      <path className="gold" d="M12,12 L36,24 L12,36" />
      <circle className="gold gold-fill" cx="12" cy="12" r="2.6" />
    </>
  ),
  // Working Memory — a remembered sequence traced through four nodes.
  "memory-span": () => (
    <>
      <path className="gold" d="M15,15 L33,33 L33,15 L15,33" />
      <circle className="gold gold-fill" cx="15" cy="15" r="3" />
      <circle className="paper-fill" cx="33" cy="33" r="3.5" /><circle cx="33" cy="33" r="3.5" />
      <circle className="paper-fill" cx="33" cy="15" r="3.5" /><circle cx="33" cy="15" r="3.5" />
      <circle className="paper-fill" cx="15" cy="33" r="3.5" /><circle cx="15" cy="33" r="3.5" />
    </>
  ),
});

export function InstrumentGlyph({
  id,
  category,
  className = "",
}: {
  id: string;
  category: string;
  className?: string;
}) {
  const draw = GLYPHS[id];
  if (!draw) return <CategoryEmblem id={category} className={className} />;
  return (
    <svg className={`emblem ${className}`} viewBox="0 0 48 48" role="img" aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      {draw()}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Crest — an ornate medallion frame for a result "portrait".          */
/* ------------------------------------------------------------------ */

export function Crest({ children, className = "" }: { children: ReactNode; className?: string }) {
  const cx = 60;
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * TAU;
    const long = i % 3 === 0;
    const [x1, y1] = pol(cx, cx, 55, a);
    const [x2, y2] = pol(cx, cx, long ? 49 : 52, a);
    return { x1, y1, x2, y2, long };
  });
  const points = [0, 1, 2, 3].map((i) => pol(cx, cx, 55, (i / 4) * TAU - Math.PI / 2));
  return (
    <div className={`crest ${className}`}>
      <svg className="crest-frame" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <circle className="ink-faint" cx={cx} cy={cx} r="58" stroke="currentColor" strokeWidth="1" />
        <circle className="ink" cx={cx} cy={cx} r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" opacity="0.5" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="currentColor"
                strokeWidth={t.long ? 1.3 : 0.7} opacity={t.long ? 0.8 : 0.4} />
        ))}
        {points.map(([x, y], i) => (
          <Sparkle key={i} x={x} y={y} r={2.2} />
        ))}
      </svg>
      <span className="crest-glyph">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Alchemical element glyphs — the classical four (fire/air/water/earth). */
/* ------------------------------------------------------------------ */

export type Element = "fire" | "air" | "water" | "earth";

export function ElementGlyph({ element, className = "" }: { element: Element; className?: string }) {
  return (
    <svg className={`elglyph ${className}`} viewBox="0 0 24 24" role="img" aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      {element === "fire" && <polygon points="12,3 21,20 3,20" />}
      {element === "water" && <polygon points="3,4 21,4 12,21" />}
      {element === "air" && (
        <>
          <polygon points="12,3 21,20 3,20" />
          <line x1="7" y1="14" x2="17" y2="14" />
        </>
      )}
      {element === "earth" && (
        <>
          <polygon points="3,4 21,4 12,21" />
          <line x1="7" y1="11" x2="17" y2="11" />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Ornaments — an editorial divider and a corner flourish.            */
/* ------------------------------------------------------------------ */

export function Flourish({ className = "" }: { className?: string }) {
  return (
    <div className={`flourish ${className}`} aria-hidden="true">
      <span className="fl-line" />
      <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M2,12 H16" className="ink-faint" />
        <path d="M46,12 H32" className="ink-faint" />
        <path className="gold" d="M24,4 L27.5,12 L24,20 L20.5,12 Z" />
        <circle className="gold gold-fill" cx="24" cy="12" r="1.6" />
        <circle className="gold gold-fill" cx="17" cy="12" r="1.2" />
        <circle className="gold gold-fill" cx="31" cy="12" r="1.2" />
      </svg>
      <span className="fl-line" />
    </div>
  );
}

/** A small ✦ seal used inline in headings. */
export function Asterism({ className = "" }: { className?: string }) {
  return (
    <svg className={`asterism ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path className="gold gold-fill"
        d="M12,1 C12.7,7 17,11.3 23,12 C17,12.7 12.7,17 12,23 C11.3,17 7,12.7 1,12 C7,11.3 11.3,7 12,1 Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Trait mini-icons — a small editorial mark beside each scale row.    */
/* ------------------------------------------------------------------ */

const TRAIT_MARKS: EmblemFn[] = [
  () => (<><circle cx="12" cy="12" r="8" /><circle className="gold gold-fill" cx="12" cy="12" r="2.6" /></>),
  () => (<path className="gold gold-fill" d="M12,3 C15,8 17,10 17,14 A5,5 0 0 1 7,14 C7,11 9,10 10,7 C11,9 12,9 12,11 C13.5,10 13,6 12,3 Z" />),
  () => (<path d="M12,3 C16,10 17,13 17,16 A5,5 0 0 1 7,16 C7,13 8,10 12,3 Z" />),
  () => (<path d="M12,19 C5,15 6,7 12,6 C12,11 18,11 17,16 C16,19 14,19.5 12,19 Z" />),
  () => (<path d="M3,19 L10,7 L14,14 L17,9 L21,19 Z" />),
  () => (<path className="gold" d="M3,14 Q7,9 11,14 T19,14" />),
  () => (<path className="gold gold-fill" d="M12,2 C12.6,8 16,11.4 22,12 C16,12.6 12.6,16 12,22 C11.4,16 8,12.6 2,12 C8,11.4 11.4,8 12,2 Z" />),
  () => (<><polygon points="12,3 19,12 12,21 5,12" /><line x1="12" y1="3" x2="12" y2="21" /></>),
  () => (<path d="M16,12 A4,4 0 1 1 12,8 A6,6 0 1 1 18,14" />),
  () => (<><line x1="12" y1="20" x2="12" y2="5" /><path d="M6,11 L12,5 L18,11" /></>),
  () => (<path className="gold gold-fill" d="M19,13 A8,8 0 1 1 19,5 A6,6 0 1 0 19,13 Z" />),
  () => (<polygon className="gold gold-fill" points="13,3 6,13 11,13 9,21 18,10 12,10" />),
];

function pickMark(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  return h % TRAIT_MARKS.length;
}

/** A deterministic little symbol for a scale, stable across renders. */
export function TraitIcon({ seed, className = "" }: { seed: string; className?: string }) {
  const draw = TRAIT_MARKS[pickMark(seed)];
  return (
    <span className={`trait-icon ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinejoin="round" strokeLinecap="round">
        {draw()}
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero backdrop — a faint celestial contour map behind the landing.   */
/* ------------------------------------------------------------------ */

export function HeroBackdrop() {
  const rings = [60, 130, 200, 270, 340, 410];
  const stars = [
    [180, 120, 2.4], [520, 90, 1.8], [880, 160, 2.6], [1120, 110, 1.6],
    [120, 360, 1.8], [760, 300, 2], [1040, 380, 2.4], [300, 520, 1.6],
    [620, 560, 2.2], [980, 600, 1.8], [200, 700, 2], [1160, 720, 2.4],
  ] as const;
  return (
    <div className="page-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1280 820" preserveAspectRatio="xMidYMin slice" fill="none">
        <g className="bd-contour" stroke="currentColor" strokeWidth="1">
          {rings.map((r, i) => (
            <ellipse key={i} cx="1050" cy="120" rx={r} ry={r * 0.74} />
          ))}
        </g>
        <g className="bd-contour" stroke="currentColor" strokeWidth="1">
          {rings.slice(0, 4).map((r, i) => (
            <ellipse key={i} cx="160" cy="760" rx={r * 0.8} ry={r * 0.6} />
          ))}
        </g>
        {stars.map(([x, y, r], i) => (
          <Sparkle key={i} x={x} y={y} r={r} />
        ))}
      </svg>
    </div>
  );
}
