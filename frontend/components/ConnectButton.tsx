'use client';

import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi';
import { truncateAddress } from '@/lib/utils';

export function ConnectButton({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const connectors = useConnectors();
  const { connect, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [walletConnectPending, setWalletConnectPending] = useState(false);
  const displayConnectors = [
    ...connectors.filter(
      (connector) =>
        !(
          connector.type === 'injected' &&
          (connector.name === 'Browser Wallet' || connector.name === 'Injected')
        ) && connector.type !== 'walletConnect',
    ),
    ...connectors.filter((connector) => connector.type === 'walletConnect'),
  ];
  const hasWalletConnect = displayConnectors.some((connector) => connector.type === 'walletConnect');

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function connectWalletConnect() {
    setWalletConnectPending(true);
    try {
      const { walletConnect } = await import('@/lib/walletConnectConnector');
      await connectAsync({
        connector: walletConnect({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
          showQrModal: true,
        }),
      });
      setOpen(false);
    } finally {
      setWalletConnectPending(false);
    }
  }

  if (isConnected && address) {
    const connectedLabel = truncateAddress(address, compact ? 3 : 6);

    return (
      <div className="relative">
        <m.button
          className={`group flex min-w-0 items-center rounded-full border border-white/15 bg-white/6 backdrop-blur transition-colors hover:border-white/25 hover:bg-white/10 ${
            compact ? 'h-8 max-w-[7.5rem] gap-1.5 px-2 sm:h-9 sm:max-w-[8.5rem] sm:gap-2 sm:px-2.5' : 'h-10 gap-2.5 px-4'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowDisconnect((value) => !value)}
        >
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
          <span
            className={`truncate font-mono text-foreground/85 ${
              compact ? 'max-w-[4.7rem] text-[11px] sm:max-w-[5.4rem] sm:text-xs' : 'max-w-[8rem] text-sm'
            }`}
          >
            {connectedLabel}
          </span>
          <svg
            className={`h-3 w-3 flex-shrink-0 text-foreground/40 transition-transform group-hover:text-foreground/70 ${
              compact ? 'hidden sm:block' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </m.button>
        <AnimatePresence>
          {showDisconnect && (
            <m.div
              className="absolute right-0 top-full z-[90] mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-1 shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="border-b border-white/8 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-foreground/35">Connected</div>
                <div className="mt-0.5 truncate font-mono text-xs text-foreground/70">
                  {truncateAddress(address, 6)}
                </div>
              </div>
              <button
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-foreground/72 transition-colors hover:bg-white/8 hover:text-foreground"
                onClick={() => {
                  disconnect();
                  setShowDisconnect(false);
                }}
              >
                Disconnect
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <m.button
        className={`rounded-full gradient-mystic font-semibold text-foreground shadow-mystic ${
          compact ? 'px-3 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-xs' : 'px-8 py-3'
        }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
      >
        {compact ? 'Connect' : 'Connect Wallet'}
      </m.button>

      <AnimatePresence>
        {open && (
          <m.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <m.div
              className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-6"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/8 text-foreground/60 transition-colors hover:bg-white/12 hover:text-foreground"
                onClick={() => setOpen(false)}
                aria-label="Close wallet selector"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              <h3 className="mb-1 pr-10 font-display text-lg text-foreground sm:text-xl">Connect Wallet</h3>
              <p className="mb-6 text-xs text-foreground/55">Choose your wallet to enter Enshrined</p>

              <div className="flex flex-col gap-2">
                {displayConnectors.map((connector) => {
                  const displayName = connector.name === 'Injected' ? 'Browser Wallet' : connector.name;

                  return (
                    <m.button
                      key={connector.uid}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-white/15 hover:bg-white/8 disabled:opacity-50"
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isPending || walletConnectPending}
                      onClick={() => {
                        connect({ connector });
                        setOpen(false);
                      }}
                    >
                      {connector.type === 'walletConnect' ? (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/20 text-sm font-bold text-blue-400">
                          WC
                        </div>
                      ) : connector.icon ? (
                        <img src={connector.icon} alt={connector.name} className="h-9 w-9 flex-shrink-0 rounded-lg" />
                      ) : (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 text-foreground/70"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12 2.75 14.8 9.2l6.45 2.8-6.45 2.8L12 21.25 9.2 14.8 2.75 12 9.2 9.2 12 2.75Z" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div>{displayName}</div>
                        {connector.type === 'walletConnect' && (
                          <div className="text-[11px] text-foreground/45">Scan with mobile wallet</div>
                        )}
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        className="ml-auto h-4 w-4 flex-shrink-0 text-foreground/30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </m.button>
                  );
                })}

                {!hasWalletConnect && (
                  <m.button
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-white/15 hover:bg-white/8 disabled:opacity-50"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isPending || walletConnectPending}
                    onClick={connectWalletConnect}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/20 text-sm font-bold text-blue-400">
                      WC
                    </div>
                    <div className="min-w-0">
                      <div>{walletConnectPending ? 'Opening WalletConnect...' : 'WalletConnect'}</div>
                      <div className="text-[11px] text-foreground/45">Scan with mobile wallet</div>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-auto h-4 w-4 flex-shrink-0 text-foreground/30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </m.button>
                )}
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
