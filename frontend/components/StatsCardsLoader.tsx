'use client';

import type { Address } from 'viem';
import { useContractStats } from '@/hooks/useLeaderboard';
import { StatsCards } from './StatsCards';

export function StatsCardsLoader({ address }: { address?: Address }) {
  const statsQuery = useContractStats(address);

  return (
    <StatsCards
      totalHolders={statsQuery.data?.totalHolders ?? 0}
      legendaries={statsQuery.data?.legendaries ?? 0}
      rank={statsQuery.data?.rank ?? null}
      loading={statsQuery.isLoading}
    />
  );
}
