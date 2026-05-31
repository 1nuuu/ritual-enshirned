'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const rawX = useMotionValue(-40);
  const rawY = useMotionValue(-40);
  const x = useSpring(rawX, { stiffness: 440, damping: 32, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 440, damping: 32, mass: 0.35 });
  const [hovering, setHovering] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSparkleTime = useRef(0);

  useEffect(() => {
    let id = 0;

    function move(event: PointerEvent) {
      rawX.set(event.clientX);
      rawY.set(event.clientY);
    }

    function over(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest('button,a,[role="button"]');
      setHovering(Boolean(interactive));
      if (interactive) {
        const now = Date.now();
        if (now - lastSparkleTime.current < 80) return;
        lastSparkleTime.current = now;
        id += 1;
        const sparkle = { id, x: event.clientX, y: event.clientY };
        setSparkles((current) => [...current.slice(-10), sparkle]);
        window.setTimeout(() => {
          setSparkles((current) => current.filter((item) => item.id !== sparkle.id));
        }, 620);
      }
    }

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerover', over);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
    };
  }, [rawX, rawY]);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[120] hidden h-3 w-3 rounded-full bg-gold mix-blend-screen shadow-[0_0_18px_rgba(240,192,96,0.85)] md:block"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: hovering ? 1.8 : 1 }}
      />
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="pointer-events-none fixed z-[119] hidden h-1.5 w-1.5 rounded-full bg-emerald shadow-[0_0_12px_rgba(74,222,128,0.75)] md:block"
          style={{ left: sparkle.x, top: sparkle.y }}
          initial={{ opacity: 0.9, scale: 0.6, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.6, x: (Math.random() - 0.5) * 44, y: (Math.random() - 0.5) * 44 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}
