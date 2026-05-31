import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError, type Address, type Hex } from 'viem';

export function truncateAddress(address?: string, size = 4) {
  if (!address) return '';
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`;
}

export function explorerTxUrl(hash?: string) {
  return hash ? `https://explorer.ritualfoundation.org/tx/${hash}` : 'https://explorer.ritualfoundation.org';
}

export function friendlyError(error: unknown) {
  if (error instanceof UserRejectedRequestError) return 'Request rejected in wallet.';
  if (error instanceof ContractFunctionRevertedError) return 'The contract rejected this action.';
  if (error instanceof BaseError) {
    const text = error.shortMessage.toLowerCase();
    if (text.includes('insufficient funds')) return 'Insufficient RITUAL for this transaction.';
    if (text.includes('user rejected')) return 'Request rejected in wallet.';
    if (text.includes('chain')) return 'Please switch to Ritual Chain and try again.';
    return error.shortMessage;
  }
  if (error instanceof Error) {
    const text = error.message.toLowerCase();
    if (text.includes('verification signer')) return 'Verification service is not using the deployed BadgeContract signer.';
    if (text.includes('badge contract address')) return 'Badge contract address is not configured.';
    if (text.includes('wallet address')) return 'Wallet address is invalid.';
    if (text.includes('badge tier')) return 'Badge tier is invalid.';
    if (text.includes('unsupported chain')) return 'Please switch to Ritual Chain and try again.';
    if (text.includes('unable to verify')) return 'Verification service could not reach Ritual. Please try again.';
    if (text.includes('verification endpoint')) return 'Verification service rejected the request.';
  }
  return 'Something went wrong. Please try again.';
}

export function parseTokenUri(uri: string) {
  if (!uri.startsWith('data:application/json;base64,')) return null;
  const raw = uri.replace('data:application/json;base64,', '');
  try {
    return JSON.parse(atob(raw)) as {
      name: string;
      image: string;
      attributes?: Array<{ trait_type: string; value: string | number }>;
    };
  } catch {
    return null;
  }
}

export function encodeProofPayload(proof: {
  address: Address;
  txCount: bigint | number | string;
  timestamp: bigint | number | string;
  signature: Hex;
}) {
  return proof;
}
