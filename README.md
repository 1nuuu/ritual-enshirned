# Enshrined 🔮

> *Prove your Ritual. Claim your Badge. Pull your Destiny.*

Enshrined is a Web3 collectible card dApp built on **Ritual Chain** — a blockchain designed for on-chain AI computation. Your transaction history on Ritual Chain determines your badge tier, which unlocks gacha card pulls and NFT minting.

---

## What is Enshrined?

Enshrined turns your on-chain activity into a collectible experience. The more transactions you've made on Ritual Chain, the higher your badge tier — and the better your chances of pulling rare card NFTs.

Think of it like this:
- Your **TX count** = your proof of participation
- Your **Badge** = your rank in the Ritual ecosystem  
- Your **Card NFT** = a collectible reward, unique to your wallet

---

## How It Works

```
Connect Wallet
      ↓
App reads your TX count on Ritual Chain
      ↓
Eligible for a Badge tier? → Claim Badge (0.001 RITUAL)
      ↓
Badge claimed → Pull Your Destiny (gacha reveal)
      ↓
Card rarity determined on-chain → Mint Card NFT (0.005 RITUAL)
      ↓
Card lives in your Collection forever
```

---

## Badge Tiers

| Tier | TX Required | Card Rarity Pool |
|------|-------------|-----------------|
| 🟤 Initiate | ≥ 5 TX | Common 95%, Rare 5% |
| ⚪ Ascendant | ≥ 10 TX | Rare 90%, Epic 10% |
| 🟢 Ritualist | ≥ 20 TX | Epic 97%, Legendary 3% |
| 🟡 Radiant Ritualist | ≥ 30 TX | Epic 15%, Legendary 85% |

Badges are **Soulbound Tokens (SBT)** — non-transferable, permanently tied to your wallet.

---

## Card Collection

18 unique cards across 4 rarities, all featuring **Siggy** — the Ritual mascot:

| Rarity | Cards | Border |
|--------|-------|--------|
| Common | 3 cards | Silver |
| Rare | 4 cards | Blue |
| Epic | 5 cards | Purple |
| Legendary | 6 cards | Gold |

All card artwork is stored on **IPFS via Pinata** for permanent decentralized storage.

---

## Tech Stack

### Ritual Chain Integration
- **Network**: Ritual Chain (Chain ID: 1979)
- **RPC**: `https://rpc.ritualfoundation.org`
- **EIP-712 Signed Attestation**: Off-chain TX count verification signed by a trusted proof signer, verified on-chain by `BadgeContract` — inspired by Ritual's Infernet attestation pattern
- **On-chain Randomness**: `block.prevrandao` + `block.timestamp` + `msg.sender` for gacha card selection

### Smart Contracts (Solidity ^0.8.24)
| Contract | Description |
|----------|-------------|
| `BadgeContract` | Soulbound ERC-721, EIP-712 proof verification, 4 badge tiers |
| `GachaContract` | Rarity roll logic, pending pull state management |
| `CardNFT` | ERC-721 Enumerable, 18 card templates, on-chain metadata |
| `EnshrionedConsumer` | EIP-712 attestation consumer pattern |

### Frontend
- **Next.js 14** App Router + TypeScript
- **wagmi v2** + **viem** — wallet connection and contract interaction
- **TanStack Query v5** — on-chain data fetching and caching
- **Framer Motion** — animations and gacha reveal effects
- **Tailwind CSS** — styling with custom design tokens
- **Zustand** — UI state management
- **Sonner** — toast notifications

### Infrastructure
- **Foundry** — smart contract development, testing, deployment
- **Pinata/IPFS** — card artwork and badge image storage
- **Vercel** — frontend deployment

---

## Getting Started

### Prerequisites
- MetaMask or any EVM wallet
- Some RITUAL tokens on Ritual Chain (for gas + fees)
- At least 5 transactions on Ritual Chain

### Add Ritual Chain to Your Wallet

| Field | Value |
|-------|-------|
| Network Name | Ritual Chain |
| RPC URL | `https://rpc.ritualfoundation.org` |
| Chain ID | 1979 |
| Symbol | RITUAL |
| Explorer | `https://explorer.ritualfoundation.org` |

### How to Use

1. **Visit the app** and click **Connect Wallet**
2. **Dashboard** shows your TX count and eligible badge tier
3. Click **Claim Badge (0.001 RITUAL)** on your eligible tier
4. Watch the **Badge Ceremony** animation
5. The **Pull Your Destiny** overlay appears — click to open gacha
6. **Tap a card** to reveal your fate
7. Click **Mint Card (0.005 RITUAL)** to mint your NFT
8. View your cards in **Collection**
9. Check **Hall of Fame** to see top collectors and legendary pulls

---

## Smart Contract Addresses (Ritual Chain)

| Contract | Address |
|----------|---------|
| BadgeContract | `0x09b9F8177D179954694a5E2216C53eA7653d14Af` |
| GachaContract | `0xEe6A322Bd2af5405fFd7b37e867a2e3E38279F6F` |
| CardNFT | `0x17202C6B4E89F18B93243D3a338D449d99eD9037` |
| EnshrionedConsumer | `0x133164486A59D1d147a287A587024Be64bdBAbF8` |

---

## Project Structure

```
enshrined/
├── contracts/              # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── BadgeContract.sol
│   │   ├── GachaContract.sol
│   │   ├── CardNFT.sol
│   │   └── EnshrionedConsumer.sol
│   ├── test/
│   └── script/Deploy.s.sol
└── frontend/               # Next.js 14 App Router
    ├── app/
    │   ├── page.tsx           # Landing
    │   ├── dashboard/         # Badge claim + gacha
    │   ├── collection/        # NFT collection
    │   └── hall-of-fame/      # Leaderboard
    ├── components/
    ├── hooks/                 # wagmi + contract hooks
    └── lib/                   # contracts ABI, tiers, utils
```

---

## Local Development

```bash
# Clone repo
git clone https://github.com/Starknight50/ritual-enshirned.git
cd ritual-enshirned

# Install frontend dependencies
cd frontend
npm install

# Copy env example
cp .env.local.example .env.local
# Fill in your contract addresses and WalletConnect project ID

# Run dev server
npm run dev
```

For contract development:
```bash
cd contracts
forge build
forge test -vv
```

---

## Team

### 👑 STAR KNIGHT — Project Owner & Initiator
- Project concept and vision
- Game design: badge tier system, card rarity mechanics, gacha drop rates
- Card artwork direction (18 Siggy Multiverse cards)
- Community and ecosystem strategy
- Twitter: [@starknight50x](https://x.com/starknight50x)

### ⚙️ Yourinuu — Lead Developer
- Full-stack development from scratch
- Smart contract architecture and implementation (BadgeContract, GachaContract, CardNFT, EnshrionedConsumer)
- EIP-712 proof verification system replacing deprecated Infernet SDK
- Frontend rebuild from Lovable prototype to production Next.js app
- Performance optimization (bundle size reduction from 372 kB to 91 kB)
- On-chain data indexing (Hall of Fame, leaderboard, stats)
- Deployment pipeline and infrastructure setup
- Twitter : https://x.com/yourinuu

---

## Acknowledgements

- Built on [Ritual Chain](https://ritual.net) — the home of on-chain AI
- Card artwork created for the Siggy Multiverse universe
- Inspired by Ritual's Infernet attestation patterns

---

*Powered by Ritual | Made by [@STAR KNIGHT (❖,❖)](https://x.com/starknight50x)*
