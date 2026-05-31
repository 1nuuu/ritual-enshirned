import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Header } from "@/components/Header";
import { useApp, TIERS } from "@/lib/store";
import badgeInitiate from "@/assets/badge-initiate.png";
import badgeAscendant from "@/assets/badge-ascendant.png";
import badgeRitualist from "@/assets/badge-ritualist.png";
import badgeRadiant from "@/assets/badge-radiant.png";

const BADGE_IMAGES: Record<string, string> = {
  initiate: badgeInitiate,
  ascendant: badgeAscendant,
  ritualist: badgeRitualist,
  radiant: badgeRadiant,
};

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { address, connect } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (address) navigate({ to: "/dashboard" });
  }, [address, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground density={90} />

      {/* Floating background badges */}
      <div className="pointer-events-none absolute inset-0">
        {TIERS.map((t, i) => (
          <img
            key={t.key}
            src={BADGE_IMAGES[t.key]}
            alt={t.label}
            className="absolute float-slow"
            style={{
              top: `${10 + i * 20}%`,
              left: i % 2 === 0 ? `${5 + i * 4}%` : undefined,
              right: i % 2 === 1 ? `${5 + i * 4}%` : undefined,
              width: 120,
              height: 140,
              objectFit: "contain",
              opacity: 0.15,
              filter: "blur(3px) brightness(0.3)",
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      <Header />

      <main className="relative z-10 mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-[2.5rem] sm:text-6xl md:text-8xl font-semibold text-glow leading-none">
            Enshrined
          </h1>
          <p className="mx-auto mt-4 sm:mt-6 max-w-xl font-display text-base sm:text-xl md:text-2xl text-muted-foreground italic">
            Prove your Ritual. Claim your Badge. Pull your Destiny.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={connect}
          className="btn-premium mt-8 sm:mt-12 rounded-full bg-gradient-mystic px-7 py-3 sm:px-10 sm:py-4 text-sm sm:text-base font-medium text-primary-foreground glow-mystic ring-1 ring-primary/50"
        >
          Connect Wallet
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          Your on-chain history reveals your tier.
        </motion.p>
      </main>

    </div>
  );
}
