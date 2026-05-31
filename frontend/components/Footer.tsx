'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[60] border-t border-white/8 bg-[#0a0a0f]/88 px-3 py-2 text-center text-[11px] leading-tight text-foreground/42 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl truncate">
        Powered by Ritual | Made by{' '}
        <a className="text-foreground/62 transition-colors hover:text-gold" href="https://x.com/starknight50x" target="_blank" rel="noreferrer">
          @STAR KNIGHT (❖,❖)
        </a>
      </div>
    </footer>
  );
}
