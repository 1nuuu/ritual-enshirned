import type { Address } from 'viem';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

export const BADGE_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS || ZERO_ADDRESS
) as Address;
export const GACHA_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS || ZERO_ADDRESS
) as Address;
export const CARD_NFT_ADDRESS = (
  process.env.NEXT_PUBLIC_CARD_NFT_ADDRESS || ZERO_ADDRESS
) as Address;
export const CONSUMER_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONSUMER_CONTRACT_ADDRESS || ZERO_ADDRESS
) as Address;

export const BADGE_DEPLOY_BLOCK = BigInt(26_786_959);
export const CARD_NFT_DEPLOY_BLOCK = BigInt(26_786_960);

export function isConfiguredAddress(address: Address) {
  return address !== ZERO_ADDRESS;
}

export const BADGE_ABI = [
  {
    type: 'function',
    name: 'CLAIM_FEE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'THRESHOLDS',
    stateMutability: 'view',
    inputs: [{ type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'claimBadge',
    stateMutability: 'payable',
    inputs: [
      { name: 'tier', type: 'uint8' },
      { name: 'infernetProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getClaimedTiers',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'uint8[]' }],
  },
  {
    type: 'function',
    name: 'hasClaimed',
    stateMutability: 'view',
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'tier', type: 'uint8' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'event',
    name: 'BadgeClaimed',
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'tier', type: 'uint8' },
      { indexed: false, name: 'txCount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
] as const;

export const GACHA_ABI = [
  {
    type: 'function',
    name: 'requestPull',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tier', type: 'uint8' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'pendingPull',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      { name: 'rarity', type: 'uint8' },
      { name: 'cardIndex', type: 'uint8' },
      { name: 'exists', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'hasPendingPull',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'event',
    name: 'GachaResult',
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'tier', type: 'uint8' },
      { indexed: false, name: 'rarity', type: 'uint8' },
      { indexed: false, name: 'cardIndex', type: 'uint8' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
] as const;

export const CARD_NFT_ABI = [
  {
    type: 'function',
    name: 'MINT_FEE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenOfOwnerByIndex',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'cardMeta',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'rarity', type: 'uint8' },
      { name: 'cardIndex', type: 'uint8' },
      { name: 'name', type: 'string' },
      { name: 'serial', type: 'uint256' },
      { name: 'ipfsImage', type: 'string' },
      { name: 'owner', type: 'address' },
    ],
  },
  {
    type: 'function',
    name: 'mintCard',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'event',
    name: 'CardMinted',
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'rarity', type: 'uint8' },
      { indexed: false, name: 'cardIndex', type: 'uint8' },
      { indexed: false, name: 'name', type: 'string' },
      { indexed: false, name: 'serial', type: 'uint256' },
      { indexed: false, name: 'ipfsImage', type: 'string' },
    ],
  },
] as const;

export const CONSUMER_ABI = [
  {
    type: 'function',
    name: 'JOB_TYPE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'verifyTxCountProof',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tier', type: 'uint8' },
      { name: 'proof', type: 'bytes' },
    ],
    outputs: [
      { name: 'wallet', type: 'address' },
      { name: 'txCount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
] as const;
