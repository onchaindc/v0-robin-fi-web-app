# RobinFi

Permissionless index vaults for tokenized equities. Create a basket, deploy it as an
ERC-4626-style vault, and let anyone deposit ETH for instant diversification.

Built for Robinhood Chain Testnet (chain ID `46630`).

## What's in here

| Path | Purpose |
| --- | --- |
| `app/` | Next.js 14 App Router shell, global theme, fonts |
| `components/landing.tsx` | Marketing page shown before a wallet connects |
| `components/robinfi-app.tsx` | App shell: wallet gate and vault tab routing |
| `components/views/` | Explore, My vaults, Create, Manage |
| `components/connect-wallet.tsx` | Wallet connect sheet and account chip |
| `lib/chain.ts` | Robinhood Chain definition |
| `lib/contracts.ts` | Factory/vault ABIs, addresses, basket tokens |
| `lib/wallet.ts` | Minimal EIP-1193 injected connector |
| `hooks/use-vaults.ts` | On-chain vault and position reads |
| `robinfi-contracts/` | Hardhat project: factory, vault, deploy script |

## Run locally

```bash
pnpm install
pnpm dev
```

The dev server binds `0.0.0.0:3000`.

## Contracts

```bash
cd robinfi-contracts
npm install
# PRIVATE_KEY and optional ROBINHOOD_RPC_URL in .env
npx hardhat compile
npx tsx scripts/deploy.ts
```

`scripts/deploy.ts` deploys five testnet stock tokens plus `VaultFactory` and prints:

```json
{ "FACTORY_ADDRESS": "0x…", "STOCK_TOKENS": { "TSLA": "0x…" } }
```

Wire the factory into the frontend with `NEXT_PUBLIC_FACTORY_ADDRESS` (in `.env.local`
or Settings → Environment). Until it is set, Explore shows clearly-labelled sample
baskets and vault creation is disabled.

### Contracts

- **`VaultFactory`** — `createVault(name, symbol, description, tokens, allocationsBps)`
  is payable; any ETH sent seeds the new vault for the creator. Enforces 1–12
  constituents and weights summing to 10,000 bps.
- **`RobinFiVault`** — ETH-denominated vault with ERC-20 shares, `deposit`, `redeem`,
  `withdraw`, NAV conversion, and creator-only `rebalance(tokens, weightsBps)`.
  Weights and basket addresses are stored on-chain and readable via `basket()`.
- **`MockStockToken`** — plain ERC-20 used as a stand-in testnet equity address.

The basket is strategy metadata today; execution against a DEX/stock-token market
maker is the next contract milestone.

## Frontend behaviour

- Wallet connect uses any injected EIP-1193 wallet (MetaMask, Rabby, Brave, Coinbase
  extension) and switches/adds Robinhood Chain automatically.
- Explore reads `getAllVaults()`, My vaults reads `getVaultsByCreator()` plus live
  share balances, and Create calls `createVault` with the initial deposit attached.
- Manage reads name, description, NAV, supply and basket, and supports deposit,
  redeem and (creator-only) rebalance.

## Checks

```bash
npx tsc --noEmit          # app typecheck
npx solc@0.8.20 --bin robinfi-contracts/contracts/*.sol   # contract syntax check
```
