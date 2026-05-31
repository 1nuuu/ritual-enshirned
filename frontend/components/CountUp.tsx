'use client';

import { useEffect, useState } from 'react';

export function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    function tick(now: number) {
      const pct = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      setDisplay(Math.round(value * eased));
      if (pct < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, value]);

  return <span>{display.toLocaleString()}</span>;
}
