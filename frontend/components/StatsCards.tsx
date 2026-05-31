'use client';

import * as m from 'framer-motion/m';

export function StatsCards({
  totalHolders,
  legendaries,
  rank,
  loading = false,
}: {
  totalHolders: number;
  legendaries: number;
  rank: number | null;
  loading?: boolean;
}) {
  const cards = [
    { label: 'Total Holders', value: loading ? '...' : totalHolders.toLocaleString() },
    { label: 'Legendaries Minted', value: loading ? '...' : legendaries.toLocaleString() },
    { label: 'Your Rank', value: loading ? '...' : rank ? `#${rank}` : '-' },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <m.div
          key={card.label}
          className="glass-panel rounded-lg p-4 sm:p-5"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
        >
          <div className="text-xs uppercase text-foreground/42">{card.label}</div>
          <div className="mt-3 font-display text-2xl text-foreground sm:text-3xl">{card.value}</div>
        </m.div>
      ))}
    </section>
  );
}
