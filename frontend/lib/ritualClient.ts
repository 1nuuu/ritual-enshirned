import { createPublicClient, http } from 'viem';
import { ritualChain } from '@/lib/wagmi';

export const ritualPublicClient = createPublicClient({
  chain: ritualChain,
  transport: http(process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? 'https://rpc.ritualfoundation.org'),
});
