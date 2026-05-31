'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Providers } from '@/app/providers';
import { ConnectButton } from './ConnectButton';

function LandingConnectInner() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  useEffect(() => {
    if (isConnected) router.push('/dashboard');
  }, [isConnected, router]);

  return <ConnectButton />;
}

export function LandingConnect() {
  return (
    <Providers>
      <LandingConnectInner />
    </Providers>
  );
}
