'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { useMintCard } from '@/hooks/useCardNFT';
import { usePendingPull, useRequestPull } from '@/hooks/useGachaContract';
import type { RarityKey, TierKey } from '@/lib/tiers';
import { rarityByKey } from '@/lib/tiers';
import type { OwnedCard } from '@/lib/types';
import { truncateAddress } from '@/lib/utils';
import { CardDisplay } from './CardDisplay';

type Phase = 'shuffle' | 'choose' | 'rising' | 'reveal' | 'minted';

function shareText(card: OwnedCard) {
  const name = card.name;
  if (card.rarity === 0) return `Just pulled ${name} from Enshrined by @STAR KNIGHT! #Ritual #Enshrined`;
  if (card.rarity === 1) return `Just pulled a Rare ${name} on Enshrined by @STAR KNIGHT! #Ritual #Enshrined`;
  if (card.rarity === 2) return `EPIC PULL on Enshrined! ${name} is mine! @STAR KNIGHT #Ritual #Enshrined`;
  return `LEGENDARY! ${name} just dropped on Enshrined by @STAR KNIGHT! #Ritual #Enshrined #LFG`;
}

function StarIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.75 14.8 9.2l6.45 2.8-6.45 2.8L12 21.25 9.2 14.8 2.75 12 9.2 9.2 12 2.75Z" />
    </svg>
  );
}

export function GachaOverlay({ tier, onClose }: { tier: TierKey; onClose: () => void }) {
  const { address } = useAccount();
  const router = useRouter();
  const [portalReady, setPortalReady] = useState(false);
  const [phase, setPhase] = useState<Phase>('shuffle');
  const [rarity, setRarity] = useState<RarityKey | null>(null);
  const [pickedCard, setPickedCard] = useState<{ id: string; name: string; image: string } | null>(null);
  const [mintedCard, setMintedCard] = useState<OwnedCard | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingPull = usePendingPull(address);
  const requestPull = useRequestPull();
  const mintCard = useMintCard();
  const shakeControls = useAnimationControls();

  const revealParticles = useMemo(
    () =>
      Array.from({ length: 80 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        x: (Math.random() - 0.5) * 520,
        y: (Math.random() - 0.5) * 520,
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
    const timeout = window.setTimeout(() => {
      setPhase((current) => (current === 'shuffle' ? 'choose' : current));
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const pending = pendingPull.data;
    if (!pending?.hasPendingPull || pending.rarity === null || !pending.card) return;
    if (phase !== 'shuffle' && phase !== 'choose') return;
    setRarity(pending.rarity);
    setPickedCard(pending.card);
    setPhase('reveal');
  }, [pendingPull.data, phase]);

  async function chooseCard() {
    if (!address || busy || phase !== 'choose') return;
    setBusy(true);
    try {
      const pending = pendingPull.data ?? (await pendingPull.refetch()).data;
      const result =
        pending?.hasPendingPull && pending.rarity !== null && pending.card
          ? { rarity: pending.rarity, cardIndex: pending.cardIndex ?? 0, card: pending.card }
          : await requestPull.request(tier);
      setRarity(result.rarity);
      setPickedCard(result.card);
      setPhase('rising');
      window.setTimeout(() => {
        setPhase('reveal');
        if (result.rarity === 3) {
          shakeControls.start({
            x: [0, -12, 12, -8, 8, -4, 4, 0],
            y: [0, 6, -6, 3, -3, 0],
            transition: { duration: 0.6 },
          });
        }
      }, 1500);
    } finally {
      setBusy(false);
    }
  }

  async function mint() {
    if (busy) return;
    setBusy(true);
    try {
      const card = await mintCard.mint();
      setMintedCard(card);
      setPhase('minted');
    } finally {
      setBusy(false);
    }
  }

  async function copyCardImage(card: OwnedCard) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      const color = rarityByKey(card.rarity).color;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(240,237,232,0.65)';
      ctx.lineWidth = 5;
      ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);
      ctx.fillStyle = '#f0ede8';
      ctx.textAlign = 'center';
      ctx.font = '64px serif';
      ctx.fillText(card.name, canvas.width / 2, 850);
      ctx.font = '30px sans-serif';
      ctx.fillText(`${rarityByKey(card.rarity).name} #${card.serial.toString().padStart(4, '0')}`, canvas.width / 2, 910);
      ctx.font = '24px monospace';
      ctx.fillText(truncateAddress(card.owner, 5), canvas.width / 2, 960);
      ctx.font = '160px serif';
      ctx.fillText('ENSHRINED', canvas.width / 2, 560);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Copy failed');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('Image copied');
    } catch {
      toast.error('Copy failed', { description: 'Clipboard access is blocked in this browser.' });
    }
  }

  const currentRarity = rarity === null ? null : rarityByKey(rarity);
  const previewCard =
    currentRarity && pickedCard && address
      ? { rarity: currentRarity.key, name: pickedCard.name, image: pickedCard.image, serial: 0, owner: address }
      : null;
  const mintedDisplayCard = mintedCard;

  if (!portalReady) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[300] overflow-y-auto overscroll-contain bg-black px-4 py-5 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Gacha card reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={shakeControls}
        className="relative mx-auto flex min-h-[100dvh] w-full max-w-5xl items-center justify-center py-10"
      >
        {phase !== 'minted' && (
          <button
            aria-label="Close"
            className="fixed right-4 top-4 z-[320] flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 text-foreground/70 transition-colors hover:bg-white/12 hover:text-foreground"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        <AnimatePresence mode="wait">
          {(phase === 'shuffle' || phase === 'choose') && (
            <motion.div
              key="choose"
              className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="text-center">
                <h2 className="font-display text-2xl text-gold-glow sm:text-3xl md:text-4xl">
                  {phase === 'shuffle' ? 'Shuffling fate...' : 'Choose your destiny'}
                </h2>
                <p className="mt-2 text-sm text-foreground/52">
                  {phase === 'choose' ? 'Tap a card to reveal.' : 'The cards align with your ritual.'}
                </p>
              </div>
              <div className="grid w-full max-w-3xl grid-cols-3 gap-3 sm:gap-5">
                {[0, 1, 2].map((id) => (
                  <motion.button
                    key={id}
                    disabled={phase !== 'choose' || busy}
                    onClick={chooseCard}
                    className="relative aspect-[3/4] w-full rounded-lg border border-mystic/45 gradient-mystic shadow-mystic disabled:cursor-default"
                    initial={{ y: -80, opacity: 0, rotate: -6 }}
                    animate={
                      phase === 'shuffle'
                        ? { y: [0, -18, 0], x: [0, 18, -18, 0], rotate: [0, 5, -5, 0], opacity: 1 }
                        : { y: 0, x: 0, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 1.25, delay: id * 0.12 }}
                    whileHover={phase === 'choose' ? { y: -16, scale: 1.05 } : undefined}
                    whileTap={phase === 'choose' ? { scale: 0.97 } : undefined}
                  >
                    <span className="absolute inset-3 flex items-center justify-center rounded-md border border-white/14 text-foreground/82">
                      <StarIcon className="h-10 w-10" />
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'rising' && currentRarity && previewCard && (
            <motion.div
              key="rising"
              className="relative flex w-full flex-col items-center"
              initial={{ y: '110vh', opacity: 0, filter: 'blur(20px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
                <div className="mx-auto w-full max-w-[15rem] sm:max-w-[16rem]">
                  <CardDisplay card={previewCard} size="lg" />
                </div>
              </motion.div>
              {[0, 0.16].map((delay) => (
                <motion.div
                  key={delay}
                  className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: currentRarity.color }}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 7, opacity: 0 }}
                  transition={{ duration: 1.15, delay: 1.25 + delay, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          )}

          {phase === 'reveal' && currentRarity && previewCard && (
            <motion.div
              key="reveal"
              className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center shadow-[0_24px_90px_rgba(0,0,0,0.55)] sm:max-w-md sm:px-6"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <div>
                <h2 className="font-display text-2xl text-gold-glow sm:text-3xl">Fate Revealed</h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-foreground/40">{currentRarity.name} pull</p>
              </div>
              <div className="mx-auto w-full max-w-[15rem] sm:max-w-[16rem]">
                <CardDisplay card={previewCard} size="lg" />
              </div>
              <div className="max-w-xs text-sm leading-relaxed text-foreground/58">
                This result is saved on-chain until you mint. Refreshing will not lose the card.
              </div>
              <motion.button
                className="w-full max-w-xs rounded-full gradient-mystic px-6 py-3 text-sm font-semibold text-foreground shadow-mystic disabled:opacity-55"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                disabled={busy}
                onClick={mint}
              >
                {busy ? 'Minting...' : 'Mint Card (0.005 RITUAL)'}
              </motion.button>
            </motion.div>
          )}

          {phase === 'minted' && mintedDisplayCard && (
            <motion.div
              key="minted"
              className="fixed inset-0 z-[310] overflow-y-auto bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                className="fixed right-4 top-4 z-[320] rounded-full border border-white/10 bg-white/8 p-2 text-foreground/60 hover:text-foreground"
                onClick={onClose}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 px-4 py-16">
                <div className="text-center">
                  <h2 className="font-display text-3xl text-gold-glow sm:text-4xl">Congratulations</h2>
                  <p className="mt-2 text-sm text-foreground/55">Your card has been enshrined forever on-chain</p>
                </div>

                <div className="w-full max-w-[15rem] sm:max-w-[16rem]">
                  <CardDisplay card={mintedDisplayCard} size="lg" />
                </div>

                <div className="flex w-full max-w-xs flex-col gap-3 pb-4">
                  <button
                    className="rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(mintedDisplayCard))}`,
                        '_blank',
                        'noopener',
                      )
                    }
                  >
                    Share to X
                  </button>
                  <button
                    className="rounded-full gradient-mystic px-5 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
                    onClick={() => {
                      router.push('/collection');
                      onClose();
                    }}
                  >
                    View Collection
                  </button>
                  <button
                    className="rounded-full border border-white/15 bg-white/6 px-5 py-3 text-sm text-foreground transition-colors hover:bg-white/10"
                    onClick={() => copyCardImage(mintedDisplayCard)}
                  >
                    Copy Image
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'reveal' && currentRarity && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {revealParticles
              .slice(0, currentRarity.key === 3 ? 80 : currentRarity.key === 2 ? 35 : currentRarity.key === 1 ? 36 : 30)
              .map((particle) => (
                <motion.span
                  key={particle.id}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${particle.left}%`,
                    top: currentRarity.key === 3 ? '-2rem' : '50%',
                    background: currentRarity.color,
                    boxShadow: `0 0 12px ${currentRarity.color}`,
                  }}
                  initial={{ opacity: 0.9, x: 0, y: 0 }}
                  animate={currentRarity.key === 3 ? { opacity: 0, y: '110vh' } : { opacity: 0, x: particle.x, y: particle.y }}
                  transition={{ duration: currentRarity.key === 3 ? 2.4 : 1.35, delay: particle.delay, ease: 'easeOut' }}
                />
              ))}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
