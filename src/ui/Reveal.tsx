import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal — a tiny, dependency-free scroll-reveal. Children fade and rise gently
 * as they enter the viewport, giving the long catalog a premium, alive feel.
 * Falls back to visible (and honors reduced-motion via CSS). One-shot per element.
 */
export function Reveal({ children, className = "", as = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setShown(true); io.disconnect(); }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  const cls = `reveal ${shown ? "in" : ""} ${className}`.trim();
  const Tag = as as "div";
  return <Tag ref={ref as React.Ref<HTMLDivElement>} className={cls}>{children}</Tag>;
}
