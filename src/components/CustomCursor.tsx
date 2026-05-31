import { useEffect, useRef, useState } from "react";
import { useApp, tierForTxCount, type TierKey } from "@/lib/store";

const TIER_COLOR: Record<TierKey | "none", string> = {
  none: "oklch(0.62 0.18 295)",
  initiate: "oklch(0.62 0.12 55)",
  ascendant: "oklch(0.78 0.02 260)",
  ritualist: "oklch(0.65 0.17 155)",
  radiant: "oklch(0.82 0.16 90)",
};

interface TrailDot {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const { txCount, address } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const idRef = useRef(0);

  const tier = address ? tierForTxCount(txCount) : null;
  const color = TIER_COLOR[tier?.key ?? "none"];

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    document.documentElement.style.cursor = "none";
    return () => {
      document.documentElement.style.cursor = "";
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    let raf = 0;
    let last = 0;
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const now = performance.now();
      if (now - last > 30) {
        last = now;
        const id = ++idRef.current;
        setTrail((t) => [...t.slice(-12), { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setTrail((t) => t.filter((d) => d.id !== id)), 600);
      }
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest("button, a, [role='button']");
      setHovering(interactive);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("button, a, [role='button']")) return;
      const burst = Array.from({ length: 6 }).map(() => ({
        id: ++idRef.current,
        x: e.clientX + (Math.random() - 0.5) * 30,
        y: e.clientY + (Math.random() - 0.5) * 30,
      }));
      setSparkles((s) => [...s, ...burst]);
      setTimeout(() => {
        setSparkles((s) => s.filter((sp) => !burst.find((b) => b.id === sp.id)));
      }, 700);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {/* Trail */}
      {trail.map((d, i) => (
        <div
          key={d.id}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: d.x - 4,
            top: d.y - 4,
            background: color,
            opacity: (i + 1) / trail.length * 0.5,
            boxShadow: `0 0 8px ${color}`,
            transition: "opacity 0.4s ease",
          }}
        />
      ))}

      {/* Main cursor: star */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        className="absolute"
        style={{
          left: pos.x - 14,
          top: pos.y - 14,
          transform: `scale(${hovering ? 1.4 : 1})`,
          transition: "transform 0.15s ease",
          filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})`,
        }}
      >
        <path
          d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z"
          fill={color}
          stroke={color}
          strokeWidth="0.5"
        />
      </svg>

      {/* Click sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute h-1.5 w-1.5 rounded-full animate-ping"
          style={{
            left: s.x,
            top: s.y,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
    </div>
  );
}
