import { NextResponse, type NextRequest } from 'next/server';
import {
  createPublicClient,
  defineChain,
  getAddress,
  http,
  isAddress,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CHAIN_ID = 1979;
const PROOF_SIGNER_ABI = [
  {
    type: 'function',
    name: 'proofSigner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const;

const ritualChain = defineChain({
  id: CHAIN_ID,
  name: 'Ritual Chain',
  nativeCurrency: { name: 'Ritual', symbol: 'RITUAL', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? 'https://rpc.ritualfoundation.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Ritual Explorer', url: 'https://explorer.ritualfoundation.org' },
  },
});

type VerifyRequest = {
  job_type?: string;
  input?: {
    address?: string;
    wallet?: string;
    chain_id?: number;
    chainId?: number;
    tier?: number;
  };
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let body: VerifyRequest;
  try {
    body = (await request.json()) as VerifyRequest;
  } catch {
    return jsonError('Invalid verification request.');
  }

  if (body.job_type !== 'verify-txcount') {
    return jsonError('Unsupported verification job.');
  }

  const walletInput = body.input?.address ?? body.input?.wallet;
  const chainId = body.input?.chain_id ?? body.input?.chainId;
  const tierInput = body.input?.tier;

  if (!walletInput || !isAddress(walletInput)) {
    return jsonError('Wallet address is invalid.');
  }
  if (chainId !== CHAIN_ID) {
    return jsonError('Unsupported chain for verification.');
  }
  if (typeof tierInput !== 'number' || !Number.isInteger(tierInput) || tierInput < 0 || tierInput > 3) {
    return jsonError('Badge tier is invalid.');
  }
  const tier = tierInput as 0 | 1 | 2 | 3;

  const badgeAddress = process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS;
  if (!badgeAddress || !isAddress(badgeAddress)) {
    return jsonError('Badge contract address is not configured.', 500);
  }

  const privateKey = process.env.PROOF_SIGNER_PRIVATE_KEY as Hex | undefined;
  if (!privateKey) {
    return jsonError('Verification signer is not configured.', 500);
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    return jsonError('Verification signer is invalid.', 500);
  }

  const wallet = getAddress(walletInput);
  const verifyingContract = getAddress(badgeAddress);
  const rpcUrl = process.env.RITUAL_RPC_URL ?? process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? 'https://rpc.ritualfoundation.org';

  try {
    const account = privateKeyToAccount(privateKey);
    const publicClient = createPublicClient({
      chain: ritualChain,
      transport: http(rpcUrl),
    });
    const [txCount, block, onchainProofSigner] = await Promise.all([
      publicClient.getTransactionCount({ address: wallet as Address }),
      publicClient.getBlock({ blockTag: 'latest' }),
      publicClient.readContract({
        address: verifyingContract,
        abi: PROOF_SIGNER_ABI,
        functionName: 'proofSigner',
      }),
    ]);

    if (getAddress(onchainProofSigner) !== getAddress(account.address)) {
      return jsonError('Verification signer does not match the deployed BadgeContract.', 500);
    }

    const timestamp = Number(block.timestamp);

    const signature = await account.signTypedData({
      domain: {
        name: 'EnshrinedBadge',
        version: '1',
        chainId: CHAIN_ID,
        verifyingContract,
      },
      types: {
        TxCountProof: [
          { name: 'wallet', type: 'address' },
          { name: 'txCount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'tier', type: 'uint8' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
      },
      primaryType: 'TxCountProof',
      message: {
        wallet,
        txCount: BigInt(txCount),
        timestamp: BigInt(timestamp),
        tier,
        chainId: BigInt(CHAIN_ID),
        verifyingContract,
      },
    });

    return NextResponse.json({
      address: wallet,
      txCount: txCount.toString(),
      timestamp,
      signature,
    });
  } catch (error) {
    console.error('verify-txcount failed', error);
    return jsonError('Unable to verify wallet transactions right now.', 502);
  }
}
