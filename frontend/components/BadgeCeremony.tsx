'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TierKey } from '@/lib/tiers';
import { tierByKey } from '@/lib/tiers';

export function BadgeCeremony({ tier, onClose }: { tier: TierKey; onClose: () => void }) {
  const info = tierByKey(tier);
  const [portalReady, setPortalReady] = useState(false);
  const [showLore, setShowLore] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => ({
        id: index,
        x: (Math.random() - 0.5) * 900,
        y: (Math.random() - 0.5) * 700,
        rotate: Math.random() * 360,
        delay: 0.25 + Math.random() * 0.25,
      })),
    [], 
  );

  useEffect(() => {
    setPortalReady(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const loreTimer = window.setTimeout(() => setShowLore(true), 650);
    const continueTimer = window.setTimeout(() => setShowContinue(true), 1500);
    return () => {
      window.clearTimeout(loreTimer);
      window.clearTimeout(continueTimer);
    };
  }, []);

  if (!portalReady) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[300] overflow-y-auto overscroll-contain bg-black px-4 py-5 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${info.name} badge claimed`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col items-center justify-center gap-5 py-4 text-center sm:gap-6">
        <div className="relative flex h-[clamp(13rem,62vw,18rem)] w-[clamp(13rem,62vw,18rem)] items-center justify-center sm:h-[clamp(17rem,30vw,20rem)] sm:w-[clamp(17rem,30vw,20rem)]">
          <motion.div
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${info.accent}, transparent 58%)`,
              filter: 'blur(18px)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-[9%] rounded-full border"
            style={{ borderColor: info.accent, boxShadow: info.glow }}
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <motion.img
            src={info.image}
            alt={`${info.name} badge`}
            className="relative h-[62%] w-[62%] rounded-lg object-cover shadow-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.2 }}
          />
        </div>

        <div className="w-full">
          <motion.h2
            className="font-display text-[clamp(2rem,8vw,3.35rem)] leading-none sm:text-[clamp(2.25rem,5vw,3.5rem)]"
            style={{ color: info.accent, textShadow: info.glow }}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.35 }}
          >
            {info.name}
          </motion.h2>
          {showLore && (
            <motion.p
              className="mx-auto mt-4 max-w-[34rem] px-1 text-sm italic leading-relaxed text-foreground/72 sm:text-base md:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {info.lore}
            </motion.p>
          )}
        </div>

        {showContinue && (
          <motion.button
            className="min-h-11 rounded-full px-8 py-3 text-sm font-semibold text-black"
            style={{ background: info.accent, boxShadow: info.glow }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClose}
          >
            Continue
          </motion.button>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute h-2 w-2 rounded-sm"
              style={{ background: info.accent }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
              animate={{ x: particle.x, y: particle.y, opacity: 0, scale: 1.4, rotate: particle.rotate }}
              transition={{ duration: 1.7, delay: particle.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
