'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { encodeAbiParameters, parseEther, type Address, type Hex } from 'viem';
import { useAccount, useChainId, useConfig } from 'wagmi';
import { BADGE_ABI, BADGE_CONTRACT_ADDRESS, isConfiguredAddress } from '@/lib/contracts';
import { useUIStore } from '@/lib/store';
import type { TierKey } from '@/lib/tiers';
import { ritualPublicClient } from '@/lib/ritualClient';
import { ritualChain } from '@/lib/wagmi';
import { friendlyError } from '@/lib/utils';

interface TxCountProofResponse {
  address?: Address;
  wallet?: Address;
  txCount?: string | number;
  tx_count?: string | number;
  timestamp?: string | number;
  signature?: Hex;
}

export function useTxCount(address?: Address) {
  return useQuery({
    queryKey: ['tx-count', address],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!address) return 0;
      return ritualPublicClient.getTransactionCount({ address });
    },
    staleTime: 30_000,
  });
}

export function useClaimedTiers(address?: Address) {
  return useQuery({
    queryKey: ['claimed-tiers', address, BADGE_CONTRACT_ADDRESS],
    enabled: Boolean(address && isConfiguredAddress(BADGE_CONTRACT_ADDRESS)),
    queryFn: async () => {
      if (!address || !isConfiguredAddress(BADGE_CONTRACT_ADDRESS)) return [] as TierKey[];
      const tiers = await ritualPublicClient.readContract({
        address: BADGE_CONTRACT_ADDRESS,
        abi: BADGE_ABI,
        functionName: 'getClaimedTiers',
        args: [address],
      });
      return tiers.map((tier) => Number(tier) as TierKey);
    },
    staleTime: 20_000,
  });
}

async function requestTxCountProof(wallet: Address, tier: TierKey) {
  const endpoint = process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT?.trim() || '/api/verify-txcount';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      job_type: 'verify-txcount',
      input: { address: wallet, chain_id: 1979, tier },
    }),
  });

  if (!response.ok) {
    let message = 'Verification endpoint rejected the request.';
    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody.error) message = errorBody.error;
    } catch {
      // Keep the generic verification message when the endpoint returns non-JSON.
    }
    throw new Error(message);
  }

  const json = (await response.json()) as TxCountProofResponse | { proof?: TxCountProofResponse };
  const proof = 'proof' in json && json.proof ? json.proof : (json as TxCountProofResponse);
  const proofAddress = proof.address ?? proof.wallet;
  const txCount = proof.txCount ?? proof.tx_count;

  if (!proofAddress || txCount === undefined || proof.timestamp === undefined || !proof.signature) {
    throw new Error('Verification response is incomplete.');
  }

  return encodeAbiParameters(
    [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'bytes' }],
    [proofAddress, BigInt(txCount), BigInt(proof.timestamp), proof.signature],
  );
}

export function useClaimBadge() {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const queryClient = useQueryClient();
  const setPendingPullTier = useUIStore((state) => state.setPendingPullTier);

  async function claim(tier: TierKey) {
    if (!address) throw new Error('Connect your wallet first.');
    if (!isConfiguredAddress(BADGE_CONTRACT_ADDRESS)) throw new Error('Badge contract address is not configured.');

    const { switchChain, writeContract } = await import('@wagmi/core');
    const { toast } = await import('sonner');
    const toastId = toast.loading('Verifying your transactions on Ritual...');
    try {
      if (chainId !== ritualChain.id) {
        await switchChain(config, { chainId: ritualChain.id });
      }

      const proof = await requestTxCountProof(address, tier);
      toast.loading('Claiming badge...', { id: toastId });

      const hash = await writeContract(config, {
        address: BADGE_CONTRACT_ADDRESS,
        abi: BADGE_ABI,
        functionName: 'claimBadge',
        args: [tier, proof],
        value: parseEther('0.001'),
        chainId: ritualChain.id,
        account: address,
      });

      await ritualPublicClient.waitForTransactionReceipt({ hash });
      setPendingPullTier(tier);
      await queryClient.invalidateQueries({ queryKey: ['claimed-tiers', address] });
      toast.success('Badge claimed!', { id: toastId, description: 'Your ritual is recorded on-chain.' });
      return hash;
    } catch (error) {
      toast.error('Transaction failed', { id: toastId, description: friendlyError(error) });
      throw error;
    }
  }

  return { claim };
}
