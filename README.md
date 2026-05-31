# Enshrined

Standalone Ritual Chain dApp for soulbound badge claims and gacha card mints.

## Structure

- `contracts/` - Foundry contracts, tests, deploy script.
- `frontend/` - Next.js 14 App Router frontend.
- `.ritual-build/progress.json` - Ritual skill checkpoint.

## Ritual Chain

- Chain ID: `1979`
- RPC: `https://rpc.ritualfoundation.org`
- Explorer: `https://explorer.ritualfoundation.org`
- Native token: `RITUAL`

## Current Deploy Status

Contracts are deployed on Ritual Chain.

| Contract | Address |
| --- | --- |
| BadgeContract | `0xe92De90C26ECa062EA9273fD7c04903803244FA3` |
| GachaContract | `0xD4A7E3989b3C171cA318B794f57Bf123163A8dB3` |
| CardNFT | `0x5F9f1df9594917a94A1367b87668aae1f2315377` |
| EnshrionedConsumer | `0x965d9D266fe69548B30037e1123430D14E5FeFB2` |

The current Ritual skill says Infernet is deprecated and must not be used. The `claimBadge(uint8 tier, bytes infernetProof)` ABI is preserved, but the proof bytes are an EIP-712 signed tx-count attestation:

```solidity
abi.encode(address wallet, uint256 txCount, uint256 timestamp, bytes signature)
```

## Contracts

```powershell
cd C:\Users\ibnub\ritual-enshirned\contracts
C:\Users\ibnub\.foundry\bin\forge.exe build
C:\Users\ibnub\.foundry\bin\forge.exe test -vv
```

Deploy command:

```powershell
cd C:\Users\ibnub\ritual-enshirned\contracts
copy .env.example .env
# Fill PRIVATE_KEY and PROOF_SIGNER in .env
C:\Users\ibnub\.foundry\bin\forge.exe script script/Deploy.s.sol:DeployScript --rpc-url $env:RITUAL_RPC_URL --broadcast -vvvv
```

The four deployed addresses are already present in `frontend/.env.local`.

## Frontend

```powershell
cd C:\Users\ibnub\ritual-enshirned\frontend
copy .env.local.example .env.local
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Required `.env.local` values:

```env
NEXT_PUBLIC_RITUAL_RPC_URL=https://rpc.ritualfoundation.org
NEXT_PUBLIC_VERIFICATION_ENDPOINT=/api/verify-txcount
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS=0xe92De90C26ECa062EA9273fD7c04903803244FA3
NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS=0xD4A7E3989b3C171cA318B794f57Bf123163A8dB3
NEXT_PUBLIC_CARD_NFT_ADDRESS=0x5F9f1df9594917a94A1367b87668aae1f2315377
NEXT_PUBLIC_CONSUMER_CONTRACT_ADDRESS=0x965d9D266fe69548B30037e1123430D14E5FeFB2
PROOF_SIGNER_PRIVATE_KEY=
```

`PROOF_SIGNER_PRIVATE_KEY` is server-only and signs the local tx-count verification response used by `/api/verify-txcount`. Never expose it with a `NEXT_PUBLIC_` prefix.

## Verification Run

- `forge build` - pass.
- `forge test -vv` - 13 tests pass.
- Ritual RPC chain id - `1979`.
- `forge script script/Deploy.s.sol:DeployScript --rpc-url https://rpc.ritualfoundation.org --broadcast -vvvv` - deployed.
- `npm run build` in `frontend/` - pass, with wallet transitive optional-dependency warnings.
- `npm run typecheck` in `frontend/` - pass.
- Local browser check at `http://127.0.0.1:3000/` and `/dashboard` - renders.
