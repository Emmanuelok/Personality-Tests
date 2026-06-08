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
