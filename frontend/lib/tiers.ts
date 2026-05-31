export type TierKey = 0 | 1 | 2 | 3;
export type RarityKey = 0 | 1 | 2 | 3;

export const TIERS: Array<{
  key: TierKey;
  name: string;
  threshold: number;
  accent: string;
  gradientClass: string;
  glow: string;
  aurora: string;
  image: string;
  lore: string;
}> = [
  {
    key: 0,
    name: 'Initiate',
    threshold: 5,
    accent: '#a0714f',
    gradientClass: 'gradient-bronze',
    glow: 'var(--glow-bronze)',
    aurora: '#2a1a0a',
    image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeibqhzjvvd7o4c23rkv73fsgrlytxp3gzoeqqsnjh34www4wyrkhhe',
    lore: 'The ritual has begun. Your journey into the unknown starts here.',
  },
  {
    key: 1,
    name: 'Ascendant',
    threshold: 10,
    accent: '#9aa8bc',
    gradientClass: 'gradient-silver',
    glow: 'var(--glow-silver)',
    aurora: '#0a1a2a',
    image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeici4m34tnar6fdyk7wzgcr5npf3aypdyojdm7nlsq3qcrxufwclky',
    lore: 'You have proven your dedication. The network acknowledges your presence.',
  },
  {
    key: 2,
    name: 'Ritualist',
    threshold: 20,
    accent: '#4ade80',
    gradientClass: 'gradient-emerald',
    glow: 'var(--glow-emerald)',
    aurora: '#0a2a0a',
    image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeiho5qjnczxkwwbi2bcojrhujqcw7deydopcqor6e47cmhlkowzxvy',
    lore: 'Few reach this path. The flames of Ritual now burn within you.',
  },
  {
    key: 3,
    name: 'Radiant',
    threshold: 30,
    accent: '#f0c060',
    gradientClass: 'gradient-gold',
    glow: 'var(--glow-gold)',
    aurora: '#2a1a00',
    image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeiagl2hlqva6cafymndjroy7wzqoehqym6lq5hh53l66tw6reuifya',
    lore: 'You are Enshrined. Your name echoes across the decentralized realm.',
  },
];

export const RARITIES = [
  { key: 0 as const, name: 'Common', color: '#9aa8bc', gradient: 'var(--gradient-silver)' },
  { key: 1 as const, name: 'Rare', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)' },
  { key: 2 as const, name: 'Epic', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #4ade80 100%)' },
  { key: 3 as const, name: 'Legendary', color: '#f0c060', gradient: 'var(--gradient-gold)' },
];

export const CARD_DATA = {
  common: [
    {
      id: 'SIG-001',
      name: 'Siggy The Busker',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Busker.png',
    },
    {
      id: 'SIG-002',
      name: 'Siggy The Chef',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Cheff.png',
    },
    {
      id: 'SIG-003',
      name: 'Siggy The Cadet',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Cadet.png',
    },
  ],
  rare: [
    {
      id: 'SIG-004',
      name: 'Siggy The Samurai',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Samurai.png',
    },
    {
      id: 'SIG-005',
      name: 'Siggy The Hacker',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TheHacker.png',
    },
    {
      id: 'SIG-006',
      name: 'Siggy The Alchemist',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Thealchemist.png',
    },
    {
      id: 'SIG-007',
      name: 'Siggy The Shadow Knight',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/ShadowKnight.png',
    },
  ],
  epic: [
    {
      id: 'SIG-008',
      name: 'Siggy The Thunder God',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/ThunderGod.png',
    },
    {
      id: 'SIG-009',
      name: 'Siggy The Pharaoh',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/pharoh.png',
    },
    {
      id: 'SIG-010',
      name: 'Siggy The Angel Knight',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/AngelKnight.png',
    },
    {
      id: 'SIG-011',
      name: 'Siggy The Dragon Rider',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/DragonRider.png',
    },
    {
      id: 'SIG-012',
      name: 'Siggy The Void Mage',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/VoidMage.png',
    },
  ],
  legendary: [
    {
      id: 'SIG-013',
      name: 'Siggy The Ritual God',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/God.png',
    },
    {
      id: 'SIG-014',
      name: 'Siggy The Time Keeper',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TimeKeeper.png',
    },
    {
      id: 'SIG-015',
      name: 'Siggy The Dark Emperor',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/DarkEmperor.png',
    },
    {
      id: 'SIG-016',
      name: 'Siggy The Celestial',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TheCelestial.png',
    },
    {
      id: 'SIG-017',
      name: 'Siggy The Last Guardian',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TheLastGuardian.png',
    },
    {
      id: 'SIG-018',
      name: 'Siggy Prime',
      image: 'https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/SiggyPrime.png',
    },
  ],
} as const;

export function tierForTxCount(txCount: number): TierKey | null {
  let current: TierKey | null = null;
  for (const tier of TIERS) {
    if (txCount >= tier.threshold) current = tier.key;
  }
  return current;
}

export function nextTier(txCount: number) {
  return TIERS.find((tier) => txCount < tier.threshold) ?? null;
}

export function tierByKey(key: TierKey) {
  return TIERS.find((tier) => tier.key === key) ?? TIERS[0];
}

export function rarityByKey(key: RarityKey) {
  return RARITIES.find((rarity) => rarity.key === key) ?? RARITIES[0];
}
