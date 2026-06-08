import { useEffect, useRef, useState } from "react";

/** Animated number that eases from 0 up to `value` on mount/change. */
export function CountUp({ value, duration = 900, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <>
      {n}
      {suffix}
    </>
  );
}
