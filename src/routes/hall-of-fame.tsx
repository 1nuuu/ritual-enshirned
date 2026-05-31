import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Crown, Trophy, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { ParticleBackground } from "@/components/ParticleBackground";

export const Route = createFileRoute("/hall-of-fame")({
  component: HallOfFame,
  head: () => ({
    meta: [
      { title: "Hall of Fame — Enshrined" },
      { name: "description", content: "Legendary holders and top collectors on Enshrined." },
    ],
  }),
});

const FIRST_ENSHRINED = {
  address: "0x7a3f9c12e4b5d8a1f6e9b2c7d4a8e3f0b1c5d6e9",
  timestamp: "2025-03-14 19:42 UTC",
};

const LEGENDARY_CARDS = [
  { name: "Thunderclad Sovereign", owner: "0x7a3f…d6e9", date: "2025-03-14", emoji: "⚡" },
  { name: "Radiant Tyrant", owner: "0x4b2e…a8c1", date: "2025-03-18", emoji: "👑" },
  { name: "Stormcrown Cat", owner: "0x9d1f…b3e7", date: "2025-03-22", emoji: "🌩️" },
  { name: "Divine Verdict", owner: "0x6c8a…f2d4", date: "2025-04-02", emoji: "⚖️" },
  { name: "Thunderclad Sovereign", owner: "0x2e7b…c9a3", date: "2025-04-09", emoji: "⚡" },
  { name: "Radiant Tyrant", owner: "0x8f1c…e6b2", date: "2025-04-15", emoji: "👑" },
  { name: "Stormcrown Cat", owner: "0x3a9d…d1f5", date: "2025-04-21", emoji: "🌩️" },
];

const TOP_COLLECTORS = [
  { rank: 1, address: "0x7a3f…d6e9", cards: 47, top: "Legendary" },
  { rank: 2, address: "0x4b2e…a8c1", cards: 39, top: "Legendary" },
  { rank: 3, address: "0x9d1f…b3e7", cards: 33, top: "Legendary" },
  { rank: 4, address: "0x6c8a…f2d4", cards: 28, top: "Epic" },
  { rank: 5, address: "0x2e7b…c9a3", cards: 24, top: "Epic" },
  { rank: 6, address: "0x8f1c…e6b2", cards: 21, top: "Epic" },
  { rank: 7, address: "0x3a9d…d1f5", cards: 18, top: "Rare" },
];

function HallOfFame() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground density={40} />
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1
            className="font-display text-5xl md:text-6xl"
            style={{
              background: "linear-gradient(135deg, oklch(0.92 0.16 90) 0%, oklch(0.65 0.15 70) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 40px oklch(0.82 0.16 90 / 0.4)",
              filter: "drop-shadow(0 0 24px oklch(0.82 0.16 90 / 0.5))",
            }}
          >
            Hall of Fame
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Where the Enshrined are remembered.
          </p>
        </motion.div>

        {/* First Enshrined */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-12 rounded-2xl border p-8 backdrop-blur-xl glow-gold"
          style={{
            borderColor: "oklch(0.82 0.16 90 / 0.4)",
            background: "linear-gradient(135deg, oklch(0.18 0.04 90 / 0.5), oklch(0.12 0.02 280 / 0.6))",
          }}
        >
          <div className="flex items-start gap-5">
            <div
              className="rounded-full p-4"
              style={{
                background: "oklch(0.82 0.16 90 / 0.15)",
                boxShadow: "0 0 30px oklch(0.82 0.16 90 / 0.4)",
              }}
            >
              <Crown className="h-8 w-8 text-gold" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.3em] text-gold">First Enshrined</div>
              <div className="mt-2 font-mono text-lg text-foreground/90 break-all">
                {FIRST_ENSHRINED.address}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Ascended to Radiant Ritualist on {FIRST_ENSHRINED.timestamp}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Legendary Pulls */}
        <section className="mt-12">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="font-display text-2xl" style={{ color: "oklch(0.92 0.14 90)" }}>
              Legendary Pulls
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Every legendary card ever minted.</p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {LEGENDARY_CARDS.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="card-lift rounded-2xl border bg-gradient-gold p-1"
                style={{ borderColor: "oklch(0.82 0.16 90 / 0.5)", boxShadow: "var(--glow-gold)" }}
              >
                <div className="rounded-xl bg-background/40 p-4 backdrop-blur">
                  <div className="aspect-[3/4] rounded-lg bg-gradient-gold flex items-center justify-center text-5xl">
                    {c.emoji}
                  </div>
                  <div className="mt-3 font-display text-base text-foreground">{c.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground truncate">{c.owner}</div>
                  <div className="text-[10px] text-muted-foreground">{c.date}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Collectors */}
        <section className="mt-12">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="font-display text-2xl" style={{ color: "oklch(0.92 0.14 90)" }}>
              Top Collectors
            </h2>
          </div>

          <div
            className="mt-6 overflow-hidden rounded-2xl border backdrop-blur-xl"
            style={{
              borderColor: "oklch(0.82 0.16 90 / 0.3)",
              background: "linear-gradient(135deg, oklch(0.18 0.04 90 / 0.3), oklch(0.12 0.02 280 / 0.5))",
            }}
          >
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Wallet</th>
                  <th className="px-5 py-3 text-right">Cards</th>
                  <th className="px-5 py-3 text-right">Highest</th>
                </tr>
              </thead>
              <tbody>
                {TOP_COLLECTORS.map((c) => (
                  <tr
                    key={c.rank}
                    className="border-t transition hover:bg-gold/5"
                    style={{ borderColor: "oklch(0.82 0.16 90 / 0.15)" }}
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`font-display text-xl ${c.rank <= 3 ? "text-gold text-glow" : "text-muted-foreground"}`}
                      >
                        #{c.rank}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">{c.address}</td>
                    <td className="px-5 py-4 text-right font-display text-lg">{c.cards}</td>
                    <td className="px-5 py-4 text-right text-xs uppercase tracking-wider text-gold">
                      {c.top}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
