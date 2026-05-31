import { motion } from "framer-motion";
import type { Tier } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  tier: Tier;
  locked?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-32 w-28",
  md: "h-56 w-48",
  lg: "h-80 w-72",
};

export function BadgeShield({ tier, locked = false, size = "lg" }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className={cn("relative", SIZES[size])}
    >
      <div
        className={cn(
          "absolute inset-0 transition-all",
          !locked && tier.glow,
        )}
        style={{
          clipPath:
            "polygon(50% 0%, 100% 18%, 100% 65%, 50% 100%, 0% 65%, 0% 18%)",
          background: locked
            ? "linear-gradient(135deg, oklch(0.25 0.02 280), oklch(0.18 0.02 280))"
            : undefined,
        }}
      >
        <div
          className={cn(
            "h-full w-full",
            !locked && tier.gradient,
            locked && "opacity-50",
          )}
          style={{
            clipPath:
              "polygon(50% 0%, 100% 18%, 100% 65%, 50% 100%, 0% 65%, 0% 18%)",
          }}
        >
          {!locked && <div className="h-full w-full shimmer" />}
        </div>
      </div>

      {/* Inner emblem */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <div className={cn("text-5xl drop-shadow-lg", locked && "grayscale opacity-50")}>
          {tier.emoji}
        </div>
        <div
          className={cn(
            "font-display text-xl font-semibold tracking-wide",
            locked ? "text-muted-foreground" : "text-foreground drop-shadow-md",
          )}
        >
          {tier.label}
        </div>
        <div
          className={cn(
            "text-[10px] uppercase tracking-[0.2em]",
            locked ? "text-muted-foreground/60" : "text-foreground/80",
          )}
        >
          {tier.motif}
        </div>
      </div>

      {locked && (
        <div className="absolute inset-x-0 bottom-2 text-center text-xs text-muted-foreground">
          Requires {tier.threshold} TX
        </div>
      )}
    </motion.div>
  );
}
