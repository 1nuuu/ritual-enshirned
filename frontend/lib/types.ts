import type { Address, Hex } from 'viem';
import type { RarityKey } from './tiers';

export interface OwnedCard {
  tokenId: bigint;
  rarity: RarityKey;
  cardIndex?: number;
  name: string;
  serial: bigint;
  image: string;
  owner: Address;
  txHash?: Hex;
}

export interface LeaderboardRow {
  owner: Address;
  cards: number;
  highestRarity: RarityKey;
}

export interface LegendaryPull {
  owner: Address;
  tokenId: bigint;
  name: string;
  timestamp: number;
  txHash?: Hex;
  image?: string;
}
