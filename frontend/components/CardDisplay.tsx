'use client';

import * as m from 'framer-motion/m';
import type { Address } from 'viem';
import type { RarityKey } from '@/lib/tiers';
import { rarityByKey } from '@/lib/tiers';
import { truncateAddress } from '@/lib/utils';

export interface DisplayCard {
  rarity: RarityKey;
  name: string;
  serial: bigint | number;
  image?: string;
  owner?: Address;
}

function borderStyle(rarity: RarityKey) {
  if (rarity === 0) return { borderColor: '#9aa8bc', boxShadow: '0 0 18px rgba(154,168,188,0.25)' };
  if (rarity === 1) return { borderColor: '#3b82f6', boxShadow: '0 0 28px rgba(59,130,246,0.38)' };
  if (rarity === 2) return { borderColor: '#8b5cf6', boxShadow: '0 0 30px rgba(139,92,246,0.5), 0 0 42px rgba(139,92,246,0.25)' };
  return { borderColor: '#f0c060', boxShadow: 'var(--glow-gold)' };
}

export function CardDisplay({ card, size = 'sm' }: { card: DisplayCard; size?: 'sm' | 'md' | 'lg' }) {
  const rarity = rarityByKey(card.rarity);
  const serial = typeof card.serial === 'bigint' ? Number(card.serial) : card.serial;
  const image = card.image?.trim() ?? '';
  const hasImage = Boolean(image && image.startsWith('http') && !image.startsWith('[PROVIDE_IPFS_LINK_'));

  const widthClass = size === 'lg' ? 'w-full max-w-[16rem]' : 'w-full';
  const wrapperClass = size === 'lg' ? `${widthClass} max-h-[80vh]` : widthClass;

  return (
    <m.div
      whileHover={size !== 'lg' ? { y: -6 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={wrapperClass}
    >
      <div
        className="relative flex flex-col overflow-hidden rounded-xl border bg-[rgba(10,10,15,0.75)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={borderStyle(card.rarity)}
      >
        {card.rarity === 2 && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: 'var(--gradient-mystic)' }}
          />
        )}
        {card.rarity === 3 && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: 'var(--gradient-gold)' }}
          />
        )}

        <div className="relative z-10 flex items-center justify-between px-3 pb-2 pt-3 text-[10px] uppercase text-foreground/75">
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
            style={{ background: `${rarity.color}30`, color: rarity.color, border: `1px solid ${rarity.color}60` }}
          >
            {rarity.name.toUpperCase()}
          </span>
          <span className="font-mono text-foreground/50">#{String(serial || 0).padStart(4, '0')}</span>
        </div>

        <div className="relative mx-3 overflow-hidden rounded-lg" style={{ paddingBottom: '133%', height: 0 }}>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: rarity.gradient ?? 'rgba(139,92,246,0.3)' }}
          >
            <span className="text-4xl opacity-30">✦</span>
          </div>
          {hasImage && (
            <img
              src={image}
              alt={card.name}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ zIndex: 1 }}
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between px-3 py-2.5 text-[10px] uppercase text-foreground/45">
          <span className="font-semibold tracking-wider">Ritual</span>
          <span className="font-mono">{card.owner ? truncateAddress(card.owner, 3) : rarity.name}</span>
        </div>
      </div>
    </m.div>
  );
}
