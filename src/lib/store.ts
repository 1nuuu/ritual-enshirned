import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TierKey = "initiate" | "ascendant" | "ritualist" | "radiant";
export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Tier {
  key: TierKey;
  label: string;
  emoji: string;
  threshold: number;
  glow: string;
  gradient: string;
  description: string;
  motif: string;
  lore: string;
}

export const TIERS: Tier[] = [
  { key: "initiate",  label: "Initiate",          emoji: "🥉", threshold: 5,  glow: "glow-bronze",  gradient: "bg-gradient-bronze",  description: "First steps on the path.",        motif: "Black cat & sprout",       lore: "The ritual has begun. Your journey into the unknown starts here." },
  { key: "ascendant", label: "Ascendant",         emoji: "🥈", threshold: 10, glow: "glow-silver",  gradient: "bg-gradient-silver",  description: "Wisdom begins to take root.",     motif: "Lion-cat & laurel",        lore: "You have proven your dedication. The network acknowledges your presence." },
  { key: "ritualist", label: "Ritualist",         emoji: "🟢", threshold: 20, glow: "glow-emerald", gradient: "bg-gradient-emerald", description: "Bound to the sacred fire.",       motif: "Hooded cat & flame",       lore: "Few reach this path. The flames of Ritual now burn within you." },
  { key: "radiant",   label: "Radiant Ritualist", emoji: "💛", threshold: 30, glow: "glow-gold",    gradient: "bg-gradient-gold",    description: "Crowned in divine thunder.",      motif: "Armored cat & lightning",  lore: "You are Enshrined. Your name echoes across the decentralized realm." },
];

export function tierForTxCount(tx: number): Tier | null {
  let current: Tier | null = null;
  for (const t of TIERS) if (tx >= t.threshold) current = t;
  return current;
}
export function nextTier(tx: number): Tier | null {
  return TIERS.find((t) => tx < t.threshold) ?? null;
}

export interface CardItem {
  id: string;
  serial: number;
  name: string;
  rarity: Rarity;
  owner: string;
  txHash: string;
  mintedAt: number;
}

interface AppState {
  address: string | null;
  txCount: number;
  claimedTiers: TierKey[];
  pendingPullTier: TierKey | null; // a tier whose pull hasn't been done yet
  cards: CardItem[];
  connect: () => void;
  disconnect: () => void;
  claimBadge: (tier: TierKey) => void;
  consumePull: () => void;
  addCard: (c: CardItem) => void;
}

function randAddr(): string {
  const chars = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 40; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      address: null,
      txCount: 0,
      claimedTiers: [],
      pendingPullTier: null,
      cards: [],
      connect: () =>
        set(() => ({
          address: randAddr(),
          // Simulated TX count from Ritual Testnet — biased to be interesting
          txCount: Math.floor(Math.random() * 45),
          claimedTiers: [],
          pendingPullTier: null,
        })),
      disconnect: () => set({ address: null, txCount: 0, claimedTiers: [], pendingPullTier: null }),
      claimBadge: (tier) =>
        set((s) =>
          s.claimedTiers.includes(tier)
            ? s
            : { claimedTiers: [...s.claimedTiers, tier], pendingPullTier: tier },
        ),
      consumePull: () => set({ pendingPullTier: null }),
      addCard: (c) => set((s) => ({ cards: [c, ...s.cards] })),
    }),
    { name: "enshrined-state" },
  ),
);

export function truncateAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

// Gacha pull according to badge tier
const POOLS: Record<TierKey, Array<{ rarity: Rarity; weight: number }>> = {
  initiate:  [{ rarity: "common", weight: 70 }, { rarity: "rare", weight: 30 }],
  ascendant: [{ rarity: "common", weight: 40 }, { rarity: "rare", weight: 45 }, { rarity: "epic", weight: 15 }],
  ritualist: [{ rarity: "rare",   weight: 40 }, { rarity: "epic", weight: 45 }, { rarity: "legendary", weight: 15 }],
  radiant:   [{ rarity: "epic",   weight: 30 }, { rarity: "legendary", weight: 70 }],
};

export function rollRarity(tier: TierKey): Rarity {
  const pool = POOLS[tier];
  const total = pool.reduce((a, b) => a + b.weight, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    if ((r -= p.weight) <= 0) return p.rarity;
  }
  return pool[pool.length - 1].rarity;
}

const CARD_NAMES: Record<Rarity, string[]> = {
  common:    ["Sprout Kitten", "First Step", "Whisper of Dawn", "Sapling Familiar"],
  rare:      ["Lion of Laurel", "Sage Cat", "Silver Oracle", "Wisdom's Echo"],
  epic:      ["Hooded Acolyte", "Ember Ritualist", "Circle of Flame", "Verdant Hex"],
  legendary: ["Thunderclad Sovereign", "Radiant Tyrant", "Stormcrown Cat", "Divine Verdict"],
};
export function pickCardName(r: Rarity): string {
  const arr = CARD_NAMES[r];
  return arr[Math.floor(Math.random() * arr.length)];
}
export function fakeTxHash(): string {
  const chars = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}
