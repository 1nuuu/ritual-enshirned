'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAbiItem, type AbiEvent, type Address } from 'viem';
import {
  BADGE_DEPLOY_BLOCK,
  BADGE_CONTRACT_ADDRESS,
  CARD_NFT_DEPLOY_BLOCK,
  CARD_NFT_ADDRESS,
  isConfiguredAddress,
} from '@/lib/contracts';
import type { LeaderboardRow, LegendaryPull } from '@/lib/types';
import type { RarityKey } from '@/lib/tiers';
import { ritualPublicClient } from '@/lib/ritualClient';

const badgeClaimedEvent = parseAbiItem(
  'event BadgeClaimed(address indexed owner,uint8 tier,uint256 txCount,uint256 timestamp)',
) as AbiEvent;
const cardMintedEvent = parseAbiItem(
  'event CardMinted(address indexed owner,uint256 indexed tokenId,uint8 rarity,uint8 cardIndex,string name,uint256 serial,string ipfsImage)',
) as AbiEvent;

async function getLogsChunked(params: {
  address: Address;
  event: AbiEvent;
  fromBlock: bigint;
  toBlock: bigint | 'latest';
  chunkSize?: bigint;
}) {
  const chunkSize = params.chunkSize ?? BigInt(5_000);
  const to = params.toBlock === 'latest' ? await ritualPublicClient.getBlockNumber() : params.toBlock;
  const logs: any[] = [];
  let from = params.fromBlock;

  while (from <= to) {
    const end = from + chunkSize > to ? to : from + chunkSize;
    const chunk = await ritualPublicClient.getLogs({
      address: params.address,
      event: params.event,
      fromBlock: from,
      toBlock: end,
    });
    logs.push(...chunk);
    from = end + BigInt(1);
  }

  return logs;
}

export function useLeaderboard(address?: Address) {
  return useQuery({
    queryKey: ['leaderboard', BADGE_CONTRACT_ADDRESS, CARD_NFT_ADDRESS],
    enabled: Boolean(isConfiguredAddress(BADGE_CONTRACT_ADDRESS) && isConfiguredAddress(CARD_NFT_ADDRESS)),
    queryFn: async () => {
      if (!isConfiguredAddress(BADGE_CONTRACT_ADDRESS) || !isConfiguredAddress(CARD_NFT_ADDRESS)) {
        return emptyLeaderboard(address);
      }

      let badgeLogs: Awaited<ReturnType<typeof getLogsChunked>>;
      let cardLogs: Awaited<ReturnType<typeof getLogsChunked>>;

      try {
        [badgeLogs, cardLogs] = await Promise.all([
          getLogsChunked({
            address: BADGE_CONTRACT_ADDRESS,
            event: badgeClaimedEvent,
            fromBlock: BADGE_DEPLOY_BLOCK,
            toBlock: 'latest',
          }),
          getLogsChunked({
            address: CARD_NFT_ADDRESS,
            event: cardMintedEvent,
            fromBlock: CARD_NFT_DEPLOY_BLOCK,
            toBlock: 'latest',
          }),
        ]);
        console.log('Badge logs:', badgeLogs.length);
        console.log('Card logs:', cardLogs.length);
      } catch (error) {
        console.error('Failed to load Hall of Fame logs:', error);
        throw error;
      }

      const holders = new Set<string>();
      let firstRadiant: { owner: Address; timestamp: bigint } | null = null;
      for (const log of badgeLogs) {
        if (!log.args.owner) continue;
        holders.add(log.args.owner.toLowerCase());
        if (Number(log.args.tier) === 3 && !firstRadiant) {
          firstRadiant = { owner: log.args.owner, timestamp: log.args.timestamp ?? BigInt(0) };
        }
      }

      const legendaryPullLogs = [];
      const collectorMap = new Map<string, LeaderboardRow>();
      for (const log of cardLogs) {
        if (!log.args.owner || log.args.rarity === undefined) continue;
        const key = log.args.owner.toLowerCase();
        const current = collectorMap.get(key) ?? { owner: log.args.owner, cards: 0, highestRarity: 0 as RarityKey };
        current.cards += 1;
        current.highestRarity = Math.max(current.highestRarity, Number(log.args.rarity)) as RarityKey;
        collectorMap.set(key, current);

        if (Number(log.args.rarity) === 3) legendaryPullLogs.push(log);
      }

      const legendaryPulls: LegendaryPull[] = await Promise.all(
        legendaryPullLogs.map(async (log) => {
          const block = log.blockNumber ? await ritualPublicClient.getBlock({ blockNumber: log.blockNumber }) : null;
          return {
            owner: log.args.owner!,
            tokenId: log.args.tokenId ?? BigInt(0),
            name: log.args.name ?? 'Legendary Card',
            timestamp: Number(block?.timestamp ?? 0),
            txHash: log.transactionHash,
            image: log.args.ipfsImage,
          };
        }),
      );

      const leaderboard = Array.from(collectorMap.values()).sort((a, b) => b.cards - a.cards || b.highestRarity - a.highestRarity);
      const rank = address ? leaderboard.findIndex((row) => row.owner.toLowerCase() === address.toLowerCase()) + 1 : 0;
      const firstEnshrined = firstRadiant
        ? { address: firstRadiant.owner, timestamp: Number(firstRadiant.timestamp) }
        : null;
      const topCollectors = leaderboard.map((row) => ({
        address: row.owner,
        count: row.cards,
        highestRarity: row.highestRarity,
      }));

      return {
        totalHolders: holders.size,
        legendaries: legendaryPulls.length,
        rank: rank > 0 ? rank : null,
        firstRadiant,
        firstEnshrined,
        legendaryPulls,
        leaderboard,
        topCollectors,
      };
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}

export function useContractStats(address?: Address) {
  return useLeaderboard(address);
}

function emptyLeaderboard(_address?: Address) {
  return {
    totalHolders: 0,
    legendaries: 0,
    rank: null as number | null,
    firstRadiant: null as { owner: Address; timestamp: bigint } | null,
    firstEnshrined: null as { address: Address; timestamp: number } | null,
    legendaryPulls: [] as LegendaryPull[],
    leaderboard: [] as LeaderboardRow[],
    topCollectors: [] as Array<{ address: Address; count: number; highestRarity: RarityKey }>,
  };
}
