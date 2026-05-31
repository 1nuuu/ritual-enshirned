import { motion } from "framer-motion";
import { Users, Crown, Trophy } from "lucide-react";
import { CountUp } from "@/components/CountUp";

interface Stat {
  label: string;
  value: number;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const STATS: Stat[] = [
  {
    label: "Total Holders",
    value: 128,
    icon: <Users className="h-5 w-5" />,
    color: "oklch(0.78 0.02 260)",
    glow: "glow-silver",
  },
  {
    label: "Legendaries Minted",
    value: 7,
    icon: <Crown className="h-5 w-5" />,
    color: "oklch(0.82 0.16 90)",
    glow: "glow-gold",
  },
  {
    label: "Your Rank",
    value: 42,
    prefix: "#",
    icon: <Trophy className="h-5 w-5" />,
    color: "oklch(0.65 0.17 155)",
    glow: "glow-emerald",
  },
];

export function StatsCards() {
  return (
    <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className={`relative overflow-hidden rounded-2xl border bg-card/30 p-5 backdrop-blur-xl ${s.glow}`}
          style={{ borderColor: `${s.color}55` }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: `radial-gradient(circle at top right, ${s.color}, transparent 60%)` }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="text-[0.7rem] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground">{s.label}</div>
              <div className="mt-2 font-display text-[1.75rem] sm:text-4xl text-glow">
                {s.prefix}
                <CountUp value={s.value} />
              </div>
            </div>

            <div
              className="rounded-full p-2"
              style={{ background: `${s.color}22`, color: s.color }}
            >
              {s.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
