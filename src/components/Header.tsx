import { Link } from "@tanstack/react-router";
import { useApp, truncateAddr } from "@/lib/store";

export function Header() {
  const { address, disconnect } = useApp();
  return (
    <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 md:px-10 md:py-5">
      {address ? (
        <Link to="/" className="font-display text-lg md:text-2xl tracking-wide text-glow shrink-0">
          Enshrined
        </Link>
      ) : (
        <span />
      )}
      <nav className="flex items-center gap-3 md:gap-6 text-xs md:text-sm flex-wrap justify-end">

        {address && (
          <>
            <Link to="/dashboard" className="nav-link text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground", "data-active": "true" } as never}>
              Dashboard
            </Link>
            <Link to="/collection" className="nav-link text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground", "data-active": "true" } as never}>
              Collection
            </Link>
            <Link to="/hall-of-fame" className="nav-link text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground", "data-active": "true" } as never}>
              Hall of Fame
            </Link>
            <button
              onClick={disconnect}
              className="rounded-full border border-border bg-card/40 px-3 py-1.5 font-mono text-xs text-foreground/90 hover:border-primary/50 hover:text-foreground transition backdrop-blur"
              title="Disconnect"
            >
              {truncateAddr(address)}
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
