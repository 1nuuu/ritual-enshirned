'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const INTRO_KEY = 'intro_shown';

export function IntroScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(INTRO_KEY) !== '1';
  });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timeout = window.setTimeout(() => {
      sessionStorage.setItem(INTRO_KEY, '1');
      setExiting(true);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence onExitComplete={() => setVisible(false)}>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="absolute h-64 w-64 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(240,192,96,0.82), transparent 42%)',
              filter: 'blur(2px)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, ease: 'linear' }}
          />
          <motion.h1
            className="font-display text-5xl text-gold-glow md:text-7xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            Enshrined
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
