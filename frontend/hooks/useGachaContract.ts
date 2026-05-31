'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decodeEventLog, type Address } from 'viem';
import { useAccount, useChainId, useConfig } from 'wagmi';
import { CARD_NFT_ABI, CARD_NFT_ADDRESS, GACHA_ABI, GACHA_CONTRACT_ADDRESS, isConfiguredAddress } from '@/lib/contracts';
import { CARD_DATA, type RarityKey, type TierKey } from '@/lib/tiers';
import { ritualPublicClient } from '@/lib/ritualClient';
import { ritualChain } from '@/lib/wagmi';
import { friendlyError } from '@/lib/utils';

const rarityKeys = ['common', 'rare', 'epic', 'legendary'] as const;

interface PullResult {
  rarity: RarityKey;
  cardIndex: number;
  card: (typeof CARD_DATA)[(typeof rarityKeys)[number]][number];
}

function cardForPull(rarity: RarityKey, cardIndex: number): PullResult {
  const pool = CARD_DATA[rarityKeys[rarity]];
  const card = pool[cardIndex] ?? pool[0];
  return { rarity, cardIndex, card };
}

async function readPendingPull(address: Address): Promise<PullResult | null> {
  const [rarityRaw, cardIndexRaw, exists] = await ritualPublicClient.readContract({
    address: GACHA_CONTRACT_ADDRESS,
    abi: GACHA_ABI,
    functionName: 'pendingPull',
    args: [address],
  });
  if (!exists) return null;
  return cardForPull(Number(rarityRaw) as RarityKey, Number(cardIndexRaw));
}

export function usePendingPull(address?: Address) {
  return useQuery({
    queryKey: ['pending-pull', address, GACHA_CONTRACT_ADDRESS],
    enabled: Boolean(address && isConfiguredAddress(GACHA_CONTRACT_ADDRESS)),
    queryFn: async () => {
      if (!address || !isConfiguredAddress(GACHA_CONTRACT_ADDRESS)) {
        return { hasPendingPull: false, rarity: null as RarityKey | null, cardIndex: null as number | null, card: null as PullResult['card'] | null };
      }
      const result = await readPendingPull(address);
      if (!result) return { hasPendingPull: false, rarity: null as RarityKey | null, cardIndex: null as number | null, card: null as PullResult['card'] | null };
      return { hasPendingPull: true, ...result };
    },
    staleTime: 10_000,
  });
}

export function useOwnedCardCount(address?: Address) {
  return useQuery({
    queryKey: ['owned-card-count', address, CARD_NFT_ADDRESS],
    enabled: Boolean(address && isConfiguredAddress(CARD_NFT_ADDRESS)),
    queryFn: async () => {
      if (!address || !isConfiguredAddress(CARD_NFT_ADDRESS)) return 0;
      const balance = await ritualPublicClient.readContract({
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      return Number(balance);
    },
    staleTime: 20_000,
  });
}

export function useRequestPull() {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const queryClient = useQueryClient();

  async function request(tier: TierKey) {
    if (!address) throw new Error('Connect your wallet first.');
    if (!isConfiguredAddress(GACHA_CONTRACT_ADDRESS)) throw new Error('Gacha contract address is not configured.');

    const { switchChain, writeContract } = await import('@wagmi/core');
    const { toast } = await import('sonner');
    const toastId = toast.loading('Opening fate on Ritual...');
    try {
      const pending = await readPendingPull(address);
      if (pending) {
        await queryClient.invalidateQueries({ queryKey: ['pending-pull', address] });
        toast.success('Fate revealed', { id: toastId });
        return pending;
      }

      if (chainId !== ritualChain.id) await switchChain(config, { chainId: ritualChain.id });
      const hash = await writeContract(config, {
        address: GACHA_CONTRACT_ADDRESS,
        abi: GACHA_ABI,
        functionName: 'requestPull',
        args: [tier],
        chainId: ritualChain.id,
        account: address,
      });
      const receipt = await ritualPublicClient.waitForTransactionReceipt({ hash });
      let result: PullResult | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: GACHA_ABI,
            data: log.data,
            topics: log.topics,
            eventName: 'GachaResult',
          });
          result = cardForPull(Number(decoded.args.rarity) as RarityKey, Number(decoded.args.cardIndex));
          break;
        } catch {}
      }

      result ??= await readPendingPull(address);
      if (!result) throw new Error('Gacha result was not found.');

      await queryClient.invalidateQueries({ queryKey: ['pending-pull', address] });
      toast.success('Fate revealed', { id: toastId });
      return result;
    } catch (error) {
      toast.error('Pull failed', { id: toastId, description: friendlyError(error) });
      throw error;
    }
  }

  return { request };
}
