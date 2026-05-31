'use client';

import dynamic from 'next/dynamic';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { truncateAddress } from '@/lib/utils';
import { rarityByKey } from '@/lib/tiers';
import * as m from 'framer-motion/m';

const ParticleBackground = dynamic(
  () => import('@/components/ParticleBackground').then((mod) => ({ default: mod.ParticleBackground })),
  { ssr: false },
);

export default function HallOfFamePage() {
  const { data, isLoading } = useLeaderboard();

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <ParticleBackground density={16} />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 sm:gap-10">
        <div className="text-center">
          <h1 className="font-display text-3xl text-gold-glow sm:text-4xl md:text-5xl">Hall of Fame</h1>
          <p className="mt-3 text-sm text-foreground/52">The legends of Ritual, enshrined forever.</p>
        </div>

        <section className="glass-panel rounded-xl p-4 sm:p-6 md:p-8">
          <h2 className="mb-4 font-display text-xl text-gold-glow sm:text-2xl">👑 First Enshrined</h2>
          {isLoading ? (
            <div className="h-12 animate-pulse rounded-lg bg-white/8" />
          ) : data?.firstEnshrined ? (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
              <span className="font-mono text-lg text-foreground">{truncateAddress(data.firstEnshrined.address, 8)}</span>
              <span className="text-xs text-foreground/45">
                {new Date(data.firstEnshrined.timestamp * 1000).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <p className="text-sm text-foreground/45">No Radiant Ritualist yet. Will it be you?</p>
          )}
        </section>

        <section>
          <h2 className="mb-5 font-display text-xl text-gold-glow sm:text-2xl">⚡ Legendary Pulls</h2>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="glass-panel h-20 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !data?.legendaryPulls?.length ? (
            <div className="glass-panel rounded-xl p-6 text-center text-sm text-foreground/45">No legendary cards minted yet.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.legendaryPulls.map((pull, index) => (
                <m.div
                  key={index}
                  className="glass-panel flex items-center gap-4 rounded-xl p-4"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded-lg" style={{ background: rarityByKey(3).gradient }} />
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm text-gold-glow">{pull.name}</div>
                    <div className="text-xs text-foreground/45">
                      {truncateAddress(pull.owner, 5)} · {new Date(pull.timestamp * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 font-display text-xl text-gold-glow sm:text-2xl">🏆 Top Collectors</h2>
          <div className="glass-panel overflow-hidden rounded-xl">
            {isLoading ? (
              <div className="divide-y divide-white/8">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-14 animate-pulse bg-white/4" />
                ))}
              </div>
            ) : !data?.topCollectors?.length ? (
              <div className="p-6 text-center text-sm text-foreground/45">No collectors yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-left text-xs uppercase text-foreground/42">
                    <th className="w-12 px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Wallet</th>
                    <th className="px-4 py-3 text-right">Cards</th>
                    <th className="hidden px-4 py-3 text-right sm:table-cell">Top Rarity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {data.topCollectors.map((collector, index) => (
                    <tr key={index} className="transition-colors hover:bg-white/4">
                      <td
                        className="px-4 py-3 font-display text-base"
                        style={{ color: index === 0 ? '#f0c060' : index === 1 ? '#9aa8bc' : index === 2 ? '#a0714f' : undefined }}
                      >
                        #{index + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground/82">{truncateAddress(collector.address, 6)}</td>
                      <td className="px-4 py-3 text-right font-display text-foreground">{collector.count}</td>
                      <td className="hidden px-4 py-3 text-right text-foreground/62 sm:table-cell">
                        {rarityByKey(collector.highestRarity).name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
