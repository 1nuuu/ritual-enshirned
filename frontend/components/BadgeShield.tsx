'use client';

import * as m from 'framer-motion/m';
import type { TierKey } from '@/lib/tiers';
import { tierByKey } from '@/lib/tiers';

interface BadgeShieldProps {
  tier: TierKey;
  locked?: boolean;
  claimed?: boolean;
  eligible?: boolean;
}

export function BadgeShield({ tier, locked = false, claimed = false, eligible = false }: BadgeShieldProps) {
  const info = tierByKey(tier);

  return (
    <m.div
      animate={eligible && !claimed && !locked ? { scale: [1, 1.03, 1] } : undefined}
      transition={eligible && !claimed && !locked ? { repeat: Infinity, duration: 2 } : undefined}
      className="glass-panel relative h-full overflow-hidden rounded-lg p-3"
      style={{ boxShadow: eligible && !claimed && !locked ? info.glow : undefined, borderColor: eligible ? info.accent : undefined }}
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-black/30">
        <img
          src={info.image}
          alt={`${info.name} badge`}
          className="h-full w-full object-cover"
          style={{ filter: locked ? 'grayscale(1)' : undefined, opacity: locked ? 0.3 : 1 }}
        />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/22 text-foreground/80" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
        )}
        {claimed && (
          <div className="absolute right-2 top-2 rounded-full bg-emerald px-2.5 py-1 text-[11px] font-semibold text-black">
            ✓ Claimed
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="font-display text-lg" style={{ color: info.accent }}>
          {info.name}
        </div>
        <p className="mt-1 min-h-12 text-xs italic leading-relaxed text-foreground/62" style={{ filter: locked ? 'blur(2px)' : undefined }}>
          {info.lore}
        </p>
      </div>
    </m.div>
  );
}
