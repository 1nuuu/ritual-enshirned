import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeShield } from "./BadgeShield";
import type { Tier } from "@/lib/store";

interface Props {
  tier: Tier;
  onClose: () => void;
}

const CONFETTI_COLORS: Record<string, string> = {
  initiate: "oklch(0.65 0.12 60)",     // bronze
  ascendant: "oklch(0.85 0.02 260)",    // silver
  ritualist: "oklch(0.65 0.17 155)",    // green
  radiant: "oklch(0.82 0.16 90)",       // gold
};

export function BadgeCeremony({ tier, onClose }: Props) {
  const [typedName, setTypedName] = useState("");
  const [showLore, setShowLore] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const color = CONFETTI_COLORS[tier.key] ?? "oklch(0.82 0.16 90)";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedName(tier.label.slice(0, i));
      if (i >= tier.label.length) {
        clearInterval(interval);
        setTimeout(() => setShowLore(true), 250);
      }
    }, 80);
    const tContinue = setTimeout(() => setShowContinue(true), 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(tContinue);
    };
  }, [tier.label]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-6 overflow-hidden"
    >
      {/* Rotating ring of light */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute h-[420px] w-[420px] rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${color}, transparent 60%)`,
            filter: "blur(20px)",
            opacity: 0.7,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute h-[340px] w-[340px] rounded-full border pointer-events-none"
          style={{ borderColor: color, boxShadow: `0 0 60px ${color}` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
        >
          <BadgeShield tier={tier} size="lg" />
        </motion.div>
      </div>

      {/* Typewriter name */}
      <div className="mt-12 text-center">
        <h2
          className="font-display text-5xl tracking-wide"
          style={{ color, textShadow: `0 0 24px ${color}` }}
        >
          {typedName}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-[2px] h-10 ml-1 align-middle"
            style={{ background: color }}
          />
        </h2>

        {showLore && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="mt-6 max-w-xl italic font-serif text-lg text-foreground/80 px-6"
          >
            “{tier.lore}”
          </motion.p>
        )}
      </div>

      {/* Confetti burst in tier color */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{
              x: (Math.random() - 0.5) * 900,
              y: (Math.random() - 0.5) * 700,
              opacity: 0,
              scale: 1.4,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.6 + Math.random() * 0.6, ease: "easeOut", delay: 0.3 }}
            className="absolute h-2 w-2 rounded-sm"
            style={{ background: color }}
          />
        ))}
      </div>

      {showContinue && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClose}
          className="btn-premium mt-12 rounded-full px-8 py-3 text-sm font-medium ring-1"
          style={{
            background: `linear-gradient(135deg, ${color}, transparent)`,
            borderColor: color,
            color: "white",
            boxShadow: `0 0 24px ${color}`,
          }}
        >
          Continue
        </motion.button>
      )}
    </motion.div>
  );
}
