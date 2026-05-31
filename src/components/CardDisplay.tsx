import { motion } from "framer-motion";
import type { CardItem, Rarity } from "@/lib/store";
import { cn } from "@/lib/utils";

const RARITY_STYLES: Record<Rarity, { gradient: string; glow: string; label: string; ring: string }> = {
  common:    { gradient: "bg-gradient-bronze",  glow: "shadow-[0_0_24px_oklch(0.78_0.02_260/0.35)]", label: "Common",    ring: "ring-bronze/40" },
  rare:      { gradient: "bg-gradient-silver",  glow: "shadow-[0_0_30px_oklch(0.65_0.18_240/0.55)]", label: "Rare",      ring: "ring-silver/60" },
  epic:      { gradient: "bg-gradient-emerald", glow: "glow-emerald",                                  label: "Epic",      ring: "ring-emerald/70" },
  legendary: { gradient: "bg-gradient-gold",    glow: "glow-gold",                                     label: "Legendary", ring: "ring-gold/80" },
};

export function rarityStyle(r: Rarity) {
  return RARITY_STYLES[r];
}

interface Props {
  card: CardItem;
  size?: "sm" | "lg";
  flat?: boolean;
}

export function CardDisplay({ card, size = "sm", flat = false }: Props) {
  const s = RARITY_STYLES[card.rarity];
  const dim = size === "lg" ? "w-[min(85vw,18rem)] aspect-[3/4]" : "w-full aspect-[3/4]";

  return (
    <motion.div
      initial={flat ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: "0 18px 40px -12px oklch(0.62 0.18 295 / 0.55)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "relative rounded-2xl ring-1 overflow-hidden",
        dim,
        s.gradient,
        s.glow,
        s.ring,
      )}
    >
      <div className="absolute inset-0 shimmer opacity-60" />
      {card.rarity === "legendary" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.5),transparent_50%)] mix-blend-overlay" />
      )}
      <div className="relative flex h-full flex-col justify-between p-4 text-foreground">
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-widest backdrop-blur">
            {s.label}
          </span>
          <span className="font-mono text-[10px] text-foreground/80">#{String(card.serial).padStart(4, "0")}</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="text-7xl drop-shadow-2xl">
            {card.rarity === "common" && "🐾"}
            {card.rarity === "rare" && "🦁"}
            {card.rarity === "epic" && "🔮"}
            {card.rarity === "legendary" && "⚡"}
          </div>
        </div>

        <div>
          <div className="font-display text-xl font-semibold leading-tight drop-shadow">{card.name}</div>
          <div className="mt-1 font-mono text-[10px] text-foreground/70 truncate">{card.owner.slice(0, 10)}…{card.owner.slice(-6)}</div>
        </div>
      </div>
    </motion.div>
  );
}
