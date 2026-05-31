export function walletConnect(parameters: {
  projectId: string;
  showQrModal?: boolean;
  isNewChainsStale?: boolean;
  [key: string]: unknown;
}): import('wagmi').CreateConnectorFn;
