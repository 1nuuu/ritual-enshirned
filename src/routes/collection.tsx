import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { ParticleBackground } from "@/components/ParticleBackground";
import { CardDisplay } from "@/components/CardDisplay";
import { useApp, type Rarity } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/collection")({
  component: Collection,
});

const FILTERS: Array<{ key: "all" | Rarity; label: string }> = [
  { key: "all", label: "All" },
  { key: "common", label: "Common" },
  { key: "rare", label: "Rare" },
  { key: "epic", label: "Epic" },
  { key: "legendary", label: "Legendary" },
];

function Collection() {
  const { address, cards } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  useEffect(() => {
    if (!address) navigate({ to: "/" });
  }, [address, navigate]);

  const visible = useMemo(
    () => (filter === "all" ? cards : cards.filter((c) => c.rarity === filter)),
    [cards, filter],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground density={40} />
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl text-glow">Your Collection</h1>
            <p className="text-sm text-muted-foreground">
              {cards.length} card{cards.length === 1 ? "" : "s"} enshrined on Ritual Testnet.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs uppercase tracking-wider transition",
                  filter === f.key
                    ? "bg-primary text-primary-foreground glow-mystic"
                    : "border border-border bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="mt-20 rounded-2xl border border-border bg-card/30 p-12 text-center backdrop-blur">
            <div className="text-5xl">🕯️</div>
            <h2 className="mt-4 font-display text-2xl">Your collection awaits.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {cards.length === 0
                ? "Claim a badge to begin."
                : "No cards match this rarity yet."}
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-full bg-gradient-mystic px-6 py-2.5 text-sm text-primary-foreground glow-mystic ring-1 ring-primary/50 hover:brightness-110"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <motion.div
            layout
            className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {visible.map((card) => (
              <motion.div key={card.id} layout className="flex flex-col gap-2">
                <CardDisplay card={card} />
                <div className="px-1 text-[10px] text-muted-foreground">
                  <div className="truncate font-mono">tx: {card.txHash.slice(0, 10)}…{card.txHash.slice(-6)}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
