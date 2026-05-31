'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

export function ParticleBackground({ density = 24 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const canvasEl = canvas;
    const context = ctx;

    let raf = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function spawn(): Particle {
      return {
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
        vx: (Math.random() - 0.5) * 0.12 * dpr,
        vy: (Math.random() - 0.62) * 0.12 * dpr,
        r: (0.5 + Math.random() * 1.4) * dpr,
        alpha: 0.12 + Math.random() * 0.38,
      };
    }

    function resize() {
      canvasEl.width = Math.max(1, canvasEl.clientWidth * dpr);
      canvasEl.height = Math.max(1, canvasEl.clientHeight * dpr);
      particles = Array.from({ length: density }, spawn);
    }

    function tick() {
      context.clearRect(0, 0, canvasEl.width, canvasEl.height);
      context.fillStyle = 'rgba(139, 92, 246, 1)';
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvasEl.width;
        if (p.x > canvasEl.width) p.x = 0;
        if (p.y < 0) p.y = canvasEl.height;
        if (p.y > canvasEl.height) p.y = 0;

        context.globalAlpha = p.alpha;
        context.beginPath();
        context.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden />;
}
