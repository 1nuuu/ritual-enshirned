'use client';

import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { BadgeShield } from '@/components/BadgeShield';
import { ConnectButton } from '@/components/ConnectButton';
import { CountUp } from '@/components/CountUp';
import { useClaimBadge, useClaimedTiers, useTxCount } from '@/hooks/useBadgeContract';
import { useOwnedCardCount, usePendingPull } from '@/hooks/useGachaContract';
import { useUIStore } from '@/lib/store';
import type { TierKey } from '@/lib/tiers';
import { TIERS, nextTier, tierByKey, tierForTxCount } from '@/lib/tiers';
import { truncateAddress } from '@/lib/utils';

const GachaOverlay = dynamic(() => import('@/components/GachaOverlay').then((mod) => ({ default: mod.GachaOverlay })), {
  ssr: false,
});
const BadgeCeremony = dynamic(
  () => import('@/components/BadgeCeremony').then((mod) => ({ default: mod.BadgeCeremony })),
  { ssr: false },
);
const ParticleBackground = dynamic(
  () => import('@/components/ParticleBackground').then((mod) => ({ default: mod.ParticleBackground })),
  { ssr: false },
);
const PullDestinyOverlay = dynamic(
  () => import('@/components/PullDestinyOverlay').then((mod) => ({ default: mod.PullDestinyOverlay })),
  { ssr: false },
);
const StatsCardsLoader = dynamic(
  () => import('@/components/StatsCardsLoader').then((mod) => ({ default: mod.StatsCardsLoader })),
  {
    ssr: false,
    loading: () => (
          <section className="grid gap-4 sm:grid-cols-3">
        {['Total Holders', 'Legendaries Minted', 'Your Rank'].map((label) => (
          <div key={label} className="glass-panel rounded-lg p-5">
            <div className="text-xs uppercase text-foreground/42">{label}</div>
            <div className="mt-3 font-display text-3xl text-foreground">...</div>
          </div>
        ))}
      </section>
    ),
  },
);

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const txCountQuery = useTxCount(address);
  const claimedQuery = useClaimedTiers(address);
  const pendingPullQuery = usePendingPull(address);
  const ownedCardCountQuery = useOwnedCardCount(address);
  const claimBadge = useClaimBadge();
  const pendingPullTier = useUIStore((state) => state.pendingPullTier);
  const setPendingPullTier = useUIStore((state) => state.setPendingPullTier);
  const [ceremonyTier, setCeremonyTier] = useState<TierKey | null>(null);
  const [justClaimedTier, setJustClaimedTier] = useState<TierKey | null>(null);
  const [pullReady, setPullReady] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [claimingTier, setClaimingTier] = useState<TierKey | null>(null);

  useEffect(() => {
    router.prefetch('/collection');
    router.prefetch('/hall-of-fame');
  }, [router]);

  const txCount = txCountQuery.data ?? 0;
  const claimed = claimedQuery.data ?? [];
  const activeTier = claimed.length ? claimed[claimed.length - 1] : tierForTxCount(txCount);
  const activeInfo = activeTier === null ? null : tierByKey(activeTier);
  const hasRecoverablePull = Boolean(pendingPullQuery.data?.hasPendingPull);
  const ownedCardCount = ownedCardCountQuery.data;
  const hasUnmintedBadgePull = !hasRecoverablePull && claimed.length > 0 && ownedCardCount !== undefined && claimed.length > ownedCardCount;
  const recoveredClaimTier = claimed.length ? claimed[claimed.length - 1] : null;
  const gachaTier = justClaimedTier ?? pendingPullTier ?? recoveredClaimTier ?? activeTier ?? 0;
  const upcoming = nextTier(txCount);
  const progressMax = upcoming?.threshold ?? TIERS[TIERS.length - 1].threshold;
  const progressPct = Math.min(100, Math.round((txCount / progressMax) * 100));

  const copiedAddress = useMemo(() => address ?? '0x0000000000000000000000000000000000000000', [address]);

  async function claim(tier: TierKey) {
    setClaimingTier(tier);
    try {
      await claimBadge.claim(tier);
      setJustClaimedTier(tier);
      setCeremonyTier(tier);
    } catch {
      // useClaimBadge already maps the failure to a toast.
    } finally {
      setClaimingTier(null);
    }
  }

  return (
    <main
      className="aurora relative min-h-screen overflow-hidden px-4 pb-10 pt-24 sm:px-6 lg:px-8"
      style={{ '--aurora-start': activeInfo?.aurora ?? '#1a0a2e' } as React.CSSProperties}
    >
      <ParticleBackground density={20} />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6">
        {!isConnected ? (
          <section className="glass-panel mx-auto mt-16 w-full max-w-md rounded-lg p-5 text-center sm:mt-20 sm:p-6">
            <h1 className="font-display text-2xl text-gold-glow sm:text-3xl">Enter Enshrined</h1>
            <p className="mt-3 text-sm text-foreground/58">Connect on Ritual Chain to reveal your badge tier.</p>
            <div className="mt-6 flex justify-center">
              <ConnectButton />
            </div>
          </section>
        ) : (
          <>
            <section className="glass-panel rounded-lg p-5 md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="text-xs uppercase text-foreground/42">Wallet</div>
                  <button
                    className="mt-2 inline-flex min-w-0 max-w-full items-center gap-2 font-mono text-sm text-foreground/82 hover:text-gold"
                    onClick={() => navigator.clipboard.writeText(copiedAddress)}
                  >
                    <span className="truncate">{truncateAddress(address, 6)}</span>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-xs uppercase text-foreground/42">Ritual TX Count</div>
                  <div className="font-display text-3xl text-foreground sm:text-4xl">
                    <CountUp value={txCount} />
                  </div>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <m.div
                  className="h-full rounded-full gradient-mystic"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, delay: 0.35 }}
                />
              </div>
              <div className="mt-2 text-xs text-foreground/52">
                {upcoming ? `${Math.max(0, upcoming.threshold - txCount)} more TX to reach ${upcoming.name}.` : 'Maximum tier reached.'}
              </div>
            </section>

            <StatsCardsLoader address={address} />

            <section>
              <h2 className="font-display text-2xl text-foreground md:text-3xl">The Four Tiers</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
                {TIERS.map((tier) => {
                  const isClaimed = claimed.includes(tier.key);
                  const eligible = txCount >= tier.threshold;
                  const locked = !eligible && !isClaimed;
                  return (
                    <div key={tier.key} className="flex flex-col">
                      <BadgeShield tier={tier.key} locked={locked} claimed={isClaimed} eligible={eligible} />
                      <m.button
                        className="mt-3 rounded-full px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-foreground/35"
                        style={{ background: eligible && !isClaimed ? tier.accent : undefined }}
                        whileHover={eligible && !isClaimed ? { scale: 1.04 } : undefined}
                        whileTap={eligible && !isClaimed ? { scale: 0.97 } : undefined}
                        disabled={!eligible || isClaimed || claimingTier !== null}
                        onClick={() => claim(tier.key)}
                      >
                        {isClaimed ? 'Claimed' : claimingTier === tier.key ? 'Claiming...' : 'Claim Badge (0.001 RITUAL)'}
                      </m.button>
                    </div>
                  );
                })}
              </div>
            </section>

            <AnimatePresence>
              {ceremonyTier !== null && (
                <BadgeCeremony
                  tier={ceremonyTier}
                  onClose={() => {
                    setCeremonyTier(null);
                    window.setTimeout(() => setPullReady(true), 1000);
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {pullReady && justClaimedTier !== null && !showGacha && (
                <PullDestinyOverlay
                  tier={justClaimedTier}
                  onPull={() => {
                    setPullReady(false);
                    setShowGacha(true);
                  }}
                  onDismiss={() => {
                    setPullReady(false);
                  }}
                />
              )}
            </AnimatePresence>

            {!pullReady && justClaimedTier !== null && !showGacha && (
              <m.div className="mt-4 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <m.button
                  className="rounded-full border border-mystic/40 bg-mystic/10 px-6 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-mystic/20 hover:text-foreground"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPullReady(true)}
                >
                  ✨ Pull Your Destiny
                </m.button>
              </m.div>
            )}

            {justClaimedTier === null && (hasRecoverablePull || hasUnmintedBadgePull) && !showGacha && (
              <m.div className="mt-4 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <m.button
                  className="rounded-full border border-mystic/40 bg-mystic/10 px-6 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-mystic/20 hover:text-foreground"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowGacha(true)}
                >
                  {hasRecoverablePull ? 'Resume Card Reveal' : '✨ Pull Your Destiny'}
                </m.button>
              </m.div>
            )}

            <AnimatePresence>
              {showGacha && (justClaimedTier !== null || pendingPullTier !== null || hasRecoverablePull || hasUnmintedBadgePull) && (
                <GachaOverlay
                  tier={gachaTier}
                  onClose={() => {
                    setShowGacha(false);
                    setPullReady(false);
                    setPendingPullTier(null);
                    setJustClaimedTier(null);
                  }}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
}
