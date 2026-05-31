'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ConnectButton } from './ConnectButton';

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname === '/') return null;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/collection', label: 'Collection' },
    { href: '/hall-of-fame', label: 'Hall of Fame' },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[80] border-b border-white/8 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="mx-auto grid h-12 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2.5 sm:h-16 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
        <button
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/7 text-foreground/75 transition-colors hover:border-white/22 hover:bg-white/10 hover:text-foreground md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>

        <Link
          href="/dashboard"
          prefetch={true}
          className="min-w-0 truncate font-display text-xs text-gold-glow transition-opacity hover:opacity-80 sm:text-lg md:text-lg"
        >
          Enshrined
        </Link>

        <nav className="hidden items-center justify-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-white/10 text-foreground'
                  : 'text-foreground/55 hover:bg-white/6 hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2 md:col-start-3">
          <ConnectButton compact />
        </div>
      </div>

      {menuOpen && (
        <div className="mx-2.5 mt-2 flex flex-col gap-1 rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              onClick={() => setMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-white/10 text-foreground'
                  : 'text-foreground/55 hover:bg-white/6 hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
