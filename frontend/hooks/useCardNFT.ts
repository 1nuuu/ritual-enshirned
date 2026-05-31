'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decodeEventLog, parseEther, type Address } from 'viem';
import { useAccount, useChainId, useConfig } from 'wagmi';
import { CARD_NFT_ABI, CARD_NFT_ADDRESS, isConfiguredAddress } from '@/lib/contracts';
import type { RarityKey } from '@/lib/tiers';
import type { OwnedCard } from '@/lib/types';
import { friendlyError } from '@/lib/utils';
import { ritualPublicClient } from '@/lib/ritualClient';
import { ritualChain } from '@/lib/wagmi';

const OWNED_CARDS_QUERY_VERSION = 'v4';

type CardMetaResult = Partial<{
  rarity: number;
  cardIndex: number;
  name: string;
  serial: bigint | number;
  ipfsImage: string;
  owner: Address;
}> & {
  [index: number]: unknown;
};

export function useOwnedCards(address?: Address) {
  return useQuery({
    queryKey: ['owned-cards', address, CARD_NFT_ADDRESS, OWNED_CARDS_QUERY_VERSION],
    enabled: Boolean(address && isConfiguredAddress(CARD_NFT_ADDRESS)),
    queryFn: async () => {
      if (!address || !isConfiguredAddress(CARD_NFT_ADDRESS)) return [] as OwnedCard[];
      const balance = await ritualPublicClient.readContract({
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      const cards: OwnedCard[] = [];
      for (let index = BigInt(0); index < balance; index += BigInt(1)) {
        const tokenId = await ritualPublicClient.readContract({
          address: CARD_NFT_ADDRESS,
          abi: CARD_NFT_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, index],
        });
        const meta = await ritualPublicClient.readContract({
          address: CARD_NFT_ADDRESS,
          abi: CARD_NFT_ABI,
          functionName: 'cardMeta',
          args: [tokenId],
        });
        const cardMeta = meta as CardMetaResult;
        const rarity = cardMeta.rarity ?? cardMeta[0];
        const cardIndex = cardMeta.cardIndex ?? cardMeta[1];
        const name = cardMeta.name ?? cardMeta[2];
        const serial = cardMeta.serial ?? cardMeta[3];
        const ipfsImage = cardMeta.ipfsImage ?? cardMeta[4] ?? '';
        const owner = cardMeta.owner ?? cardMeta[5] ?? address;
        const serialValue =
          typeof serial === 'bigint'
            ? serial
            : typeof serial === 'number' || typeof serial === 'string'
              ? BigInt(serial)
              : tokenId;

        if (!ipfsImage) {
          console.warn(`Card #${tokenId.toString()} is missing ipfsImage in CardNFT.cardMeta.`);
        }

        cards.push({
          tokenId,
          rarity: Number(rarity) as RarityKey,
          cardIndex: Number(cardIndex),
          name: String(name || `Card #${tokenId.toString()}`),
          serial: serialValue,
          image: String(ipfsImage),
          owner: owner as Address,
        });
      }
      return cards;
    },
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

export function useMintCard() {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const queryClient = useQueryClient();

  async function mint() {
    if (!address) throw new Error('Connect your wallet first.');
    if (!isConfiguredAddress(CARD_NFT_ADDRESS)) throw new Error('CardNFT address is not configured.');

    const { switchChain, writeContract } = await import('@wagmi/core');
    const { toast } = await import('sonner');
    const toastId = toast.loading('Minting card...');
    try {
      if (chainId !== ritualChain.id) await switchChain(config, { chainId: ritualChain.id });
      const hash = await writeContract(config, {
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'mintCard',
        value: parseEther('0.005'),
        chainId: ritualChain.id,
        account: address,
      });
      const receipt = await ritualPublicClient.waitForTransactionReceipt({ hash });
      const parsed = receipt.logs
        .map((log) => {
          try {
            return decodeEventLog({ abi: CARD_NFT_ABI, data: log.data, topics: log.topics });
          } catch {
            return null;
          }
        })
        .find((event) => event?.eventName === 'CardMinted');

      if (!parsed || parsed.eventName !== 'CardMinted') throw new Error('Mint event was not found.');
      const args = parsed.args;
      const card: OwnedCard = {
        owner: args.owner,
        tokenId: args.tokenId,
        rarity: Number(args.rarity) as RarityKey,
        cardIndex: Number(args.cardIndex),
        name: args.name,
        serial: args.serial,
        image: args.ipfsImage,
        txHash: hash,
      };

      await queryClient.invalidateQueries({ queryKey: ['owned-cards', address] });
      await queryClient.invalidateQueries({ queryKey: ['owned-card-count', address] });
      await queryClient.invalidateQueries({ queryKey: ['pending-pull', address] });
      toast.success('Card minted!', { id: toastId, description: `${card.name} is now on-chain.` });
      return card;
    } catch (error) {
      toast.error('Mint failed', { id: toastId, description: friendlyError(error) });
      throw error;
    }
  }

  return { mint };
}
