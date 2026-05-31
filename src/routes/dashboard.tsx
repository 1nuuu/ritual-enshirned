import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { ParticleBackground } from "@/components/ParticleBackground";
import { BadgeShield } from "@/components/BadgeShield";
import { GachaOverlay } from "@/components/GachaOverlay";
import { CountUp } from "@/components/CountUp";
import { BadgeCeremony } from "@/components/BadgeCeremony";
import { StatsCards } from "@/components/StatsCards";
import { Progress } from "@/components/ui/progress";
import {
  TIERS,
  nextTier,
  tierForTxCount,
  truncateAddr,
  useApp,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { address, txCount, claimedTiers, pendingPullTier, claimBadge } = useApp();
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [ceremonyTier, setCeremonyTier] = useState<typeof TIERS[number] | null>(null);
  const [showGacha, setShowGacha] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const current = tierForTxCount(txCount);
  const next = nextTier(txCount);
  const eligible = current !== null;
  const progressTarget = next?.threshold ?? TIERS[TIERS.length - 1].threshold;
  const progressFrom = current?.threshold ?? 0;
  const pct = next
    ? ((txCount - progressFrom) / (progressTarget - progressFrom)) * 100
    : 100;

  useEffect(() => {
    if (!address) navigate({ to: "/" });
  }, [address, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setProgressValue(pct), 350);
    return () => clearTimeout(t);
  }, [pct]);

  if (!address) return null;

  async function handleClaim(tierKey: string) {
    setClaiming(tierKey);
    const id = toast.loading("Submitting…");
    await new Promise((r) => setTimeout(r, 1500));
    claimBadge(tierKey as never);
    toast.success("Badge claimed!", { id, description: "Your ritual is recorded on-chain." });
    setClaiming(null);
    const t = TIERS.find((t) => t.key === tierKey);
    if (t) setCeremonyTier(t);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground density={50} />
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-32">
        {/* Wallet panel */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card/40 p-4 sm:p-6 backdrop-blur"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[0.7rem] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground">Wallet</div>
              <div className="mt-1 font-mono text-[1.05rem] sm:text-lg break-all">{truncateAddr(address)}</div>
              
            </div>
            <div className="flex-1 md:max-w-md">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[0.8rem] sm:text-sm text-muted-foreground">Transactions</span>
                <span className="font-display text-2xl sm:text-3xl text-glow">
                  <CountUp value={txCount} />
                </span>
              </div>
              <Progress value={progressValue} className="h-2 bg-muted" />
              <div className="mt-2 text-[0.7rem] sm:text-xs text-muted-foreground">
                {next
                  ? `${next.threshold - txCount} more TX to reach ${next.label}`
                  : "Maximum tier reached. You stand at the apex."}
              </div>
            </div>
          </div>
        </motion.section>


        <StatsCards />

        {/* Not eligible state */}
        {!eligible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center backdrop-blur"
          >
            <h2 className="font-display text-3xl">Not Eligible</h2>
            <p className="mt-2 text-muted-foreground">
              You need at least <span className="text-foreground">5 transactions</span> to enter the rite.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transact more, then return to claim your first badge.
            </p>
          </motion.div>
        )}

        {/* Tiers grid */}
        <section className="mt-12">
          <h2 className="font-display text-xl sm:text-2xl text-glow">The Four Tiers</h2>
          <p className="text-[0.8rem] sm:text-sm text-muted-foreground">Unlock each by ascending the chain.</p>


          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => {
              const unlocked = txCount >= tier.threshold;
              const claimed = claimedTiers.includes(tier.key);
              return (
                <motion.div
                  key={tier.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: TIERS.indexOf(tier) * 0.08 }}
                  className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/30 p-6 backdrop-blur"
                >
                  <div className={unlocked && !claimed ? "breathe" : undefined}>
                    <BadgeShield tier={tier} locked={!unlocked} size="md" />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">{tier.description}</p>
                  <div className="relative min-h-[3rem] px-2">
                    <p
                      className={`text-center font-serif italic text-xs leading-relaxed text-muted-foreground/80 transition ${
                        unlocked ? "" : "blur-sm select-none"
                      }`}
                    >
                      “{tier.lore}”
                    </p>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Unlock to reveal
                        </span>
                      </div>
                    )}
                  </div>
                  {claimed ? (
                    <div className="rounded-full bg-emerald/10 px-3 py-1 text-xs text-emerald">✓ Claimed</div>
                  ) : unlocked ? (
                    <button
                      onClick={() => handleClaim(tier.key)}
                      disabled={claiming !== null}
                      className={`btn-premium rounded-full ${tier.gradient} px-5 py-2 text-sm font-medium text-foreground ring-1 ring-foreground/10 ${tier.glow} disabled:opacity-60`}
                    >
                      {claiming === tier.key ? "Claiming…" : "Claim Badge"}
                    </button>
                  ) : (
                    <div className="text-xs text-muted-foreground">Locked</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pull gacha CTA */}
        <AnimatePresence>
          {pendingPullTier && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 sm:bottom-6 left-1/2 z-30 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto max-w-sm"
            >
              <button
                onClick={() => setShowGacha(true)}
                className="btn-premium w-full rounded-full bg-gradient-mystic px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-primary-foreground glow-mystic ring-1 ring-primary/50"
              >
                ✨ Pull Your Destiny
              </button>
            </motion.div>

          )}
        </AnimatePresence>

        <AnimatePresence>
          {ceremonyTier && (
            <BadgeCeremony tier={ceremonyTier} onClose={() => setCeremonyTier(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGacha && pendingPullTier && (
            <GachaOverlay tier={pendingPullTier} onClose={() => setShowGacha(false)} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
