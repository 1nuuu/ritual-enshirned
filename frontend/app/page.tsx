'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const IntroScreen = dynamic(() => import('@/components/IntroScreen').then((mod) => ({ default: mod.IntroScreen })), {
  ssr: false,
});
const ParticleBackground = dynamic(
  () => import('@/components/ParticleBackground').then((mod) => ({ default: mod.ParticleBackground })),
  { ssr: false },
);
const CustomCursor = dynamic(() => import('@/components/CustomCursor').then((mod) => ({ default: mod.CustomCursor })), {
  ssr: false,
});
const LandingConnect = dynamic(
  () => import('@/components/LandingConnect').then((mod) => ({ default: mod.LandingConnect })),
  {
    ssr: false,
    loading: () => (
      <button className="rounded-full gradient-mystic px-8 py-3 font-semibold text-foreground shadow-mystic">
        Connect Wallet
      </button>
    ),
  },
);

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] px-4 sm:px-6 lg:px-8"
      style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.16), transparent 38rem), #0a0a0f' }}
    >
      <IntroScreen />
      <ParticleBackground density={16} />
      <section className="landing-hero relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <h1 className="font-display text-5xl text-gold-glow sm:text-6xl md:text-8xl">Enshrined</h1>
        <p className="mt-5 w-full max-w-2xl text-base italic text-foreground/58 md:text-xl">
          Prove your Ritual. Claim your Badge. Pull your Destiny.
        </p>
        <div className="mt-9">
          <LandingConnect />
        </div>
        <p className="mt-4 text-xs text-foreground/38">Your on-chain history reveals your tier.</p>
      </section>
      <CustomCursor />
    </main>
  );
}
