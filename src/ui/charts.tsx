interface RadarDatum {
  label: string;
  value: number; // 0..100
}

/** A dependency-free SVG radar chart for visualizing a scale profile. */
export function RadarChart({ data, size = 340 }: { data: RadarDatum[]; size?: number }) {
  const n = data.length;
  if (n < 3) return null;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 56;
  const rings = [0.25, 0.5, 0.75, 1];

  const pointAt = (i: number, frac: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + R * frac * Math.cos(angle), cy + R * frac * Math.sin(angle)] as const;
  };

  const poly = data.map((d, i) => pointAt(i, Math.max(0, Math.min(1, d.value / 100)))).map((p) => p.join(",")).join(" ");

  return (
    <svg className="radar" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Scale profile radar chart">
      {rings.map((f, ri) => (
        <polygon
          key={ri}
          className="ring"
          points={data.map((_, i) => pointAt(i, f).join(",")).join(" ")}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = pointAt(i, 1);
        return <line key={i} className="axis" x1={cx} y1={cy} x2={x} y2={y} />;
      })}
      <g className="radar-anim">
        <polygon className="poly" points={poly} />
        {data.map((d, i) => {
          const [x, y] = pointAt(i, Math.max(0, Math.min(1, d.value / 100)));
          return <circle key={i} className="dot" cx={x} cy={y} r={3.5} />;
        })}
      </g>
      {data.map((d, i) => {
        const [x, y] = pointAt(i, 1.18);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

/** A horizontal bar showing a 0..100 position with a midpoint reference. */
export function ScaleBar({ value, leftLabel, rightLabel }: { value: number; leftLabel?: string; rightLabel?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="sbar">
      <div className="track">
        <div className="fill" style={{ width: `${v}%` }} />
        <div className="mid" />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="ends">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
