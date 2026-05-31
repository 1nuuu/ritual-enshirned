import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

import { toast } from "sonner";
import { CardDisplay, rarityStyle } from "./CardDisplay";
import {
  fakeTxHash,
  pickCardName,
  rollRarity,
  useApp,
  type CardItem,
  type Rarity,
  type TierKey,
} from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  tier: TierKey;
  onClose: () => void;
}

type Phase = "shuffle" | "choose" | "rising" | "reveal" | "minted";

const RARITY_COLOR: Record<Rarity, string> = {
  common: "oklch(0.92 0.01 260)",
  rare: "oklch(0.65 0.18 240)",
  epic: "oklch(0.65 0.17 155)",
  legendary: "oklch(0.82 0.16 90)",
};

export function GachaOverlay({ tier, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("shuffle");
  const [card, setCard] = useState<CardItem | null>(null);
  const [minting, setMinting] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const { address, cards, addCard, consumePull } = useApp();
  const shakeControls = useAnimationControls();

  useEffect(() => {
    const t = setTimeout(() => setPhase("choose"), 1800);
    return () => clearTimeout(t);
  }, []);

  function pickCard(_idx: number) {
    if (phase !== "choose" || !address) return;
    const rarity = rollRarity(tier);
    const c: CardItem = {
      id: crypto.randomUUID(),
      serial: cards.length + 1,
      name: pickCardName(rarity),
      rarity,
      owner: address,
      txHash: "",
      mintedAt: 0,
    };
    setCard(c);
    setPhase("rising");
    // After rise + flip duration → reveal effects
    setTimeout(() => {
      setPhase("reveal");
      if (rarity === "legendary") {
        setFlashOn(true);
        setTimeout(() => setFlashOn(false), 500);
        shakeControls.start({
          x: [0, -14, 14, -10, 10, -4, 4, 0],
          y: [0, 6, -6, 4, -4, 2, -2, 0],
          transition: { duration: 0.6 },
        });
      }
    }, 1500);
  }

  async function mint() {
    if (!card) return;
    setMinting(true);
    const id = toast.loading("Minting…");
    await new Promise((r) => setTimeout(r, 1600));
    const final: CardItem = { ...card, txHash: fakeTxHash(), mintedAt: Date.now() };
    addCard(final);
    consumePull();
    toast.success("Card minted!", { id, description: `${final.name} • ${final.rarity}` });
    setCard(final);
    setMinting(false);
    setPhase("minted");
  }

  function skipMint() {
    consumePull();
    onClose();
  }

  const rarityColor = card ? RARITY_COLOR[card.rarity] : "white";

  return (
    <motion.div
      initial={{ opacity: 0, backgroundColor: "rgba(0,0,0,0)" }}
      animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0.92)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center backdrop-blur-md px-4 py-6 sm:p-6 overflow-y-auto"
    >

      <motion.div animate={shakeControls} className="contents">

      {/* Spotlight (during rise/reveal) */}
      {(phase === "rising" || phase === "reveal") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${
              card ? rarityColor : "white"
            }22 0%, transparent 45%), radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 70%)`,
          }}
        />
      )}

      {/* Legendary full-screen flash */}
      <AnimatePresence>
        {flashOn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-[60] bg-gold/80"
          />
        )}
      </AnimatePresence>

      <button
        onClick={phase === "reveal" ? skipMint : onClose}
        className="absolute right-6 top-6 z-20 text-sm text-muted-foreground hover:text-foreground"
      >
        Close ✕
      </button>

      <AnimatePresence mode="wait">
        {(phase === "shuffle" || phase === "choose") && (
          <motion.div
            key="cards"
            className="flex flex-col items-center gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl text-glow">
                {phase === "shuffle" ? "Shuffling fate…" : "Choose your destiny"}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                {phase === "shuffle" ? "The cards align with your ritual." : "Tap a card to reveal."}
              </p>
            </div>
            <div className="flex gap-3 sm:gap-6 max-w-full overflow-x-auto px-2 snap-x">
              {[0, 1, 2].map((i) => (
                <motion.button
                  key={i}
                  onClick={() => pickCard(i)}
                  disabled={phase !== "choose"}
                  initial={{ y: -100, opacity: 0, rotate: -10 }}
                  animate={
                    phase === "shuffle"
                      ? { y: [0, -20, 0], opacity: 1, rotate: [0, 5, -5, 0], x: [0, 20, -20, 0] }
                      : { y: 0, opacity: 1, rotate: 0, x: 0 }
                  }
                  transition={
                    phase === "shuffle"
                      ? { duration: 1.4, delay: i * 0.1, repeat: 0 }
                      : { type: "spring", stiffness: 120, delay: i * 0.08 }
                  }
                  whileHover={phase === "choose" ? { y: -16, scale: 1.05 } : undefined}
                  className="relative h-56 w-36 sm:h-72 sm:w-52 shrink-0 snap-center rounded-2xl bg-gradient-mystic glow-mystic ring-1 ring-primary/40 cursor-pointer disabled:cursor-default"
                >
                  <div className="absolute inset-2 rounded-xl border border-foreground/10 flex items-center justify-center">
                    <div className="font-display text-5xl sm:text-6xl text-glow opacity-80">✦</div>
                  </div>
                </motion.button>
              ))}
            </div>

          </motion.div>
        )}

        {/* Rising phase: card emerges from bottom with motion blur, then flips */}
        {phase === "rising" && card && (
          <motion.div
            key="rising"
            initial={{ y: 600, opacity: 0, filter: "blur(20px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <motion.div
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <CardDisplay card={card} size="lg" flat />
            </motion.div>
            {/* Shockwave ripple */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.4, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 pointer-events-none"
              style={{ borderColor: rarityColor }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 5, opacity: 0 }}
              transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full border pointer-events-none"
              style={{ borderColor: rarityColor }}
            />
          </motion.div>
        )}

        {phase === "reveal" && card && (
          <motion.div
            key="reveal"
            className="flex flex-col items-center gap-8 relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className={cn("rounded-3xl p-1", rarityStyle(card.rarity).glow)}>
              <CardDisplay card={card} size="lg" flat />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={mint}
                disabled={minting}
                className="btn-premium rounded-full bg-gradient-mystic px-6 py-3 font-medium text-primary-foreground glow-mystic ring-1 ring-primary/50 disabled:opacity-60"
              >
                {minting ? "Minting…" : "Mint this Card"}
              </button>
              <button
                onClick={skipMint}
                className="rounded-full px-6 py-3 text-sm text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}

        {phase === "minted" && card && (
          <motion.div
            key="minted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-start sm:justify-center gap-5 sm:gap-7 bg-black/95 backdrop-blur-md overflow-y-auto px-4 py-8"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="fixed right-4 top-4 z-[80] rounded-full bg-foreground/10 px-4 py-2 text-sm text-foreground/90 ring-1 ring-foreground/20 backdrop-blur hover:bg-foreground/20"
            >
              Close ✕
            </button>

            <motion.h3
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-center"
              style={{ color: "oklch(0.82 0.16 90)", textShadow: "0 0 24px oklch(0.82 0.16 90 / 0.6)" }}
            >
              🎉 Congratulations!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-sm sm:text-base text-muted-foreground italic text-center px-4 font-sans"
            >
              Your card has been enshrined forever on-chain
            </motion.p>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={cn("rounded-3xl p-1", rarityStyle(card.rarity).glow)}
            >
              <CardDisplay card={card} size="lg" flat />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="flex flex-col items-stretch gap-3 w-full max-w-xs"
            >
              <ShareButton card={card} />
              <ViewCollectionButton onClose={onClose} />
              <div className="flex justify-center">
                <CopyImageButton card={card} />
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Rarity-specific particle effects on reveal */}
      {phase === "reveal" && card && <RarityEffects rarity={card.rarity} />}

      </motion.div>
    </motion.div>
  );
}

function RarityEffects({ rarity }: { rarity: Rarity }) {
  if (rarity === "common") {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
            animate={{
              x: (Math.random() - 0.5) * 500,
              y: (Math.random() - 0.5) * 500,
              opacity: 0,
              scale: 1,
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
          />
        ))}
      </div>
    );
  }

  if (rarity === "rare") {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        {[0, 0.2, 0.4].map((d, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 1.6, delay: d, ease: "easeOut" }}
            className="absolute h-40 w-40 rounded-full border-2"
            style={{ borderColor: "oklch(0.65 0.18 240)", boxShadow: "0 0 30px oklch(0.65 0.18 240)" }}
          />
        ))}
      </div>
    );
  }

  if (rarity === "epic") {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full z-0 overflow-hidden">
        {Array.from({ length: 35 }).map((_, i) => {
          const left = Math.random() * 100;
          const size = 6 + Math.random() * 10;
          return (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0.9, scale: 0.8 }}
              animate={{ y: -window.innerHeight, opacity: 0, scale: 0.2 }}
              transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.6, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                bottom: 0,
                width: size,
                height: size,
                background: "radial-gradient(circle, oklch(0.85 0.2 145), oklch(0.45 0.18 155) 60%, transparent)",
                filter: "blur(1px)",
              }}
            />
          );
        })}
      </div>
    );
  }

  // legendary: gold particle rain from top
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => {
        const left = Math.random() * 100;
        return (
          <motion.div
            key={i}
            initial={{ y: -40, opacity: 1, rotate: 0 }}
            animate={{ y: window.innerHeight + 40, opacity: 0.8, rotate: 360 }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 1.2, ease: "easeIn" }}
            className="absolute h-2 w-2"
            style={{
              left: `${left}%`,
              background: "oklch(0.82 0.16 90)",
              boxShadow: "0 0 8px oklch(0.82 0.16 90)",
            }}
          />
        );
      })}
    </div>
  );
}
function ViewCollectionButton({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => { onClose(); navigate({ to: "/collection" }); }}
      className="btn-premium inline-flex items-center justify-center gap-2 rounded-full bg-gradient-mystic px-5 py-3 text-sm font-medium text-primary-foreground ring-1 ring-primary/50 glow-mystic"
    >
      View Collection →
    </button>
  );
}


function shareText(card: CardItem): string {
  switch (card.rarity) {
    case "common":
      return `Just pulled ${card.name} from Enshrined! 🎴 Claim your badge and test your luck! #Ritual #Enshrined #Web3`;
    case "rare":
      return `Just pulled a Rare ${card.name} on Enshrined! ✨ #Ritual #Enshrined`;
    case "epic":
      return `EPIC PULL on Enshrined! 🔥 ${card.name} is mine! #Ritual #Enshrined`;
    case "legendary":
      return `LEGENDARY! 👑 ${card.name} just dropped on Enshrined! Only a few exist. #Ritual #Enshrined #LFG`;
  }
}

function ShareButton({ card }: { card: CardItem }) {
  const onShare = () => {
    const text = encodeURIComponent(shareText(card));
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };
  return (
    <button
      onClick={onShare}
      className="btn-premium inline-flex items-center gap-2 rounded-full bg-foreground/10 px-5 py-3 text-sm font-medium text-foreground ring-1 ring-foreground/20 backdrop-blur hover:bg-foreground/15"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M18.244 2H21.5l-7.5 8.572L23 22h-6.844l-5.36-6.99L4.6 22H1.34l8.04-9.19L1 2h7l4.84 6.41L18.244 2Zm-2.4 18h1.86L7.27 4H5.3l10.544 16Z" />
      </svg>
      Share My Pull
    </button>
  );
}

const RARITY_HEX: Record<Rarity, [string, string]> = {
  common: ["#9ca0a8", "#5d6168"],
  rare: ["#5ea2e8", "#2858a8"],
  epic: ["#4fc78a", "#1e6b48"],
  legendary: ["#f0c95a", "#9a6a1a"],
};

async function cardToBlob(card: CardItem): Promise<Blob | null> {
  const W = 600;
  const H = 800;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const [c1, c2] = RARITY_HEX[card.rarity];
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "700 22px Inter, sans-serif";
  ctx.fillText(card.rarity.toUpperCase(), 50, 70);
  ctx.textAlign = "right";
  ctx.font = "500 18px monospace";
  ctx.fillText(`#${String(card.serial).padStart(4, "0")}`, W - 50, 70);
  ctx.textAlign = "center";
  ctx.font = "700 180px serif";
  const emoji = { common: "🐾", rare: "🦁", epic: "🔮", legendary: "⚡" }[card.rarity];
  ctx.fillText(emoji, W / 2, H / 2 + 40);
  ctx.font = "600 38px 'Cormorant Garamond', serif";
  ctx.fillText(card.name, W / 2, H - 120);
  ctx.font = "500 16px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(`${card.owner.slice(0, 10)}…${card.owner.slice(-6)}`, W / 2, H - 80);
  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("ENSHRINED", W / 2, H - 45);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

function CopyImageButton({ card }: { card: CardItem }) {
  const onCopy = async () => {
    try {
      const blob = await cardToBlob(card);
      if (!blob) throw new Error("blob fail");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Card image copied!", { description: "Paste it anywhere." });
    } catch {
      toast.error("Couldn't copy image", { description: "Your browser blocked clipboard access." });
    }
  };
  return (
    <button
      onClick={onCopy}
      className="btn-premium inline-flex items-center gap-2 rounded-full bg-foreground/10 px-5 py-3 text-sm font-medium text-foreground ring-1 ring-foreground/20 backdrop-blur hover:bg-foreground/15"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      Copy Image
    </button>
  );
}
