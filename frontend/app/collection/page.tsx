'use client';

import dynamic from 'next/dynamic';
import * as m from 'framer-motion/m';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CardDisplay } from '@/components/CardDisplay';
import { useOwnedCards } from '@/hooks/useCardNFT';
import type { RarityKey } from '@/lib/tiers';
import { RARITIES } from '@/lib/tiers';
import { explorerTxUrl, truncateAddress } from '@/lib/utils';

type Filter = 'all' | RarityKey;

const ParticleBackground = dynamic(
  () => import('@/components/ParticleBackground').then((mod) => ({ default: mod.ParticleBackground })),
  { ssr: false },
);

export default function CollectionPage() {
  const { address } = useAccount();
  const cardsQuery = useOwnedCards(address);
  const [filter, setFilter] = useState<Filter>('all');
  const cards = cardsQuery.data ?? [];
  const visible = filter === 'all' ? cards : cards.filter((card) => card.rarity === filter);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <ParticleBackground density={20} />
      <section className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-gold-glow sm:text-4xl">Collection</h1>
            <p className="mt-2 text-sm text-foreground/52">Cards minted from your Ritual pulls.</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <button className={`rounded-full px-3 py-1.5 text-xs ${filter === 'all' ? 'gradient-mystic' : 'bg-white/8'}`} onClick={() => setFilter('all')}>
              All
            </button>
            {RARITIES.map((rarity) => (
              <button
                key={rarity.key}
                className={`rounded-full px-3 py-1.5 text-xs ${filter === rarity.key ? 'gradient-mystic' : 'bg-white/8'}`}
                onClick={() => setFilter(rarity.key)}
              >
                {rarity.name}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="glass-panel mt-10 rounded-lg p-6 text-center sm:p-8">
            <div className="font-display text-xl text-foreground sm:text-2xl">🕯️ Your collection awaits. Claim a badge to begin.</div>
            <a className="mt-5 inline-flex rounded-full gradient-mystic px-5 py-3 text-sm font-semibold" href="/dashboard">
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((card) => (
              <m.div
                key={card.tokenId.toString()}
                className="flex flex-col"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <CardDisplay card={card} />
                {card.txHash && (
                  <a
                    className="mt-1 block text-center text-[10px] text-foreground/35 hover:text-gold/70"
                    href={explorerTxUrl(card.txHash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View TX ↗
                  </a>
                )}
              </m.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
