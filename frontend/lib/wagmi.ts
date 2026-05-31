import { createConfig, http } from 'wagmi';
import { injected } from '@wagmi/core';
import { defineChain } from 'viem';

export const ritualChain = defineChain({
  id: 1979,
  name: 'Ritual Chain',
  nativeCurrency: { name: 'Ritual', symbol: 'RITUAL', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? 'https://rpc.ritualfoundation.org'] },
  },
  blockExplorers: {
    default: { name: 'Ritual Explorer', url: 'https://explorer.ritualfoundation.org' },
  },
  contracts: {
    multicall3: { address: '0x5577Ea679673Ec7508E9524100a188E7600202a3' },
  },
});

export const wagmiConfig = createConfig({
  chains: [ritualChain],
  connectors: [injected()],
  transports: { [ritualChain.id]: http(process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? 'https://rpc.ritualfoundation.org') },
  ssr: true,
});
