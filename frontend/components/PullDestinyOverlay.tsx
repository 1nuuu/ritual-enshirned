'use client';

import * as m from 'framer-motion/m';
import type { TierKey } from '@/lib/tiers';
import { tierByKey } from '@/lib/tiers';

interface PullDestinyOverlayProps {
  tier: TierKey;
  onPull: () => void;
  onDismiss: () => void;
}

export function PullDestinyOverlay({ tier, onPull, onDismiss }: PullDestinyOverlayProps) {
  const info = tierByKey(tier);

  return (
    <m.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 px-6 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${info.accent}18 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center gap-6 text-center">
        <m.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
          className="relative"
        >
          <img
            src={info.image}
            alt={info.name}
            className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40"
            style={{ boxShadow: info.glow }}
          />
          <m.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: info.accent }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </m.div>

        <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-2xl text-gold-glow sm:text-3xl md:text-4xl">{info.name} Badge Claimed!</h2>
          <p className="mt-2 text-sm text-foreground/55 sm:text-base">Your ritual has been recorded on-chain.</p>
        </m.div>

        <m.div
          className="h-px w-32 sm:w-48"
          style={{ background: `linear-gradient(to right, transparent, ${info.accent}, transparent)` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        />

        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col items-center gap-3"
        >
          <p className="text-xs uppercase tracking-widest text-foreground/40">Your reward awaits</p>
          <m.button
            className="rounded-full gradient-mystic px-10 py-4 text-base font-semibold text-foreground shadow-mystic sm:px-12 sm:py-5 sm:text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPull}
          >
            ✨ Pull Your Destiny
          </m.button>

          <button className="mt-1 text-xs text-foreground/30 transition-colors hover:text-foreground/55" onClick={onDismiss}>
            Maybe later
          </button>
        </m.div>
      </div>
    </m.div>
  );
}
