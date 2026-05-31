import { motion } from "framer-motion";
import { useApp, tierForTxCount, type TierKey } from "@/lib/store";

type Palette = { a: string; b: string; c: string };

const PALETTES: Record<TierKey | "none", Palette> = {
  none:      { a: "oklch(0.45 0.22 295)", b: "oklch(0.40 0.20 280)", c: "oklch(0.35 0.18 310)" },
  initiate:  { a: "oklch(0.55 0.16 55)",  b: "oklch(0.45 0.14 40)",  c: "oklch(0.38 0.12 30)"  },
  ascendant: { a: "oklch(0.75 0.06 240)", b: "oklch(0.65 0.08 220)", c: "oklch(0.78 0.04 260)" },
  ritualist: { a: "oklch(0.60 0.20 155)", b: "oklch(0.45 0.17 150)", c: "oklch(0.55 0.18 165)" },
  radiant:   { a: "oklch(0.82 0.16 90)",  b: "oklch(0.70 0.18 75)",  c: "oklch(0.78 0.14 60)"  },
};

export function AuroraBackground() {
  const { address, txCount } = useApp();
  const current = address ? tierForTxCount(txCount) : null;
  const key: TierKey | "none" = current?.key ?? "none";
  const p = PALETTES[key];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Three layered blurred blobs that drift slowly — transition between colors */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[80vmax] w-[80vmax] rounded-full opacity-60 mix-blend-screen"
        animate={{
          background: `radial-gradient(circle, ${p.a} 0%, transparent 60%)`,
          x: [0, 60, -40, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{
          background: { duration: 2.5, ease: "easeInOut" },
          x: { duration: 28, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 32, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ filter: "blur(80px)" }}
      />
      <motion.div
        className="absolute top-1/3 -right-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-55 mix-blend-screen"
        animate={{
          background: `radial-gradient(circle, ${p.b} 0%, transparent 60%)`,
          x: [0, -50, 30, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{
          background: { duration: 2.5, ease: "easeInOut" },
          x: { duration: 34, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 30, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ filter: "blur(90px)" }}
      />
      <motion.div
        className="absolute -bottom-1/4 left-1/4 h-[75vmax] w-[75vmax] rounded-full opacity-50 mix-blend-screen"
        animate={{
          background: `radial-gradient(circle, ${p.c} 0%, transparent 65%)`,
          x: [0, 40, -60, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          background: { duration: 2.5, ease: "easeInOut" },
          x: { duration: 36, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 28, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ filter: "blur(100px)" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.08_0.02_280/0.7)_100%)]" />
    </div>
  );
}
