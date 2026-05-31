import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SESSION_KEY = "enshrined-intro-shown";

export function IntroScreen() {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(true);
    const t1 = setTimeout(() => setHide(true), 2400);
    const t2 = setTimeout(() => setShow(false), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: hide ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      style={{ pointerEvents: hide ? "none" : "auto" }}
    >
      <div className="relative flex h-[420px] w-[420px] items-center justify-center">
        {/* Spinning particle ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        >
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i / 32) * Math.PI * 2;
            const r = 170;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.02, duration: 0.4 }}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  background: "oklch(0.85 0.16 85)",
                  boxShadow: "0 0 8px oklch(0.85 0.16 85 / 0.9), 0 0 16px oklch(0.85 0.16 85 / 0.6)",
                }}
              />
            );
          })}
        </motion.div>

        {/* Inner soft glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-12 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.82 0.16 85 / 0.35) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="relative font-display text-6xl font-semibold md:text-7xl"
          style={{
            color: "oklch(0.95 0.05 90)",
            textShadow:
              "0 0 24px oklch(0.85 0.16 85 / 0.9), 0 0 48px oklch(0.82 0.16 90 / 0.6), 0 0 80px oklch(0.82 0.16 90 / 0.4)",
          }}
        >
          Enshrined
        </motion.h1>
      </div>
    </motion.div>
  );
}
