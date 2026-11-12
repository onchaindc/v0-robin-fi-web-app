# RobinFi contracts

Solidity 0.8.20 contracts for RobinFi index vaults on Robinhood Chain Testnet.

## Contracts

- `contracts/VaultFactory.sol` — permissionless factory. `createVault` deploys a vault
  and optionally seeds it with the ETH sent with the call.
- `contracts/RobinFiVault.sol` — ETH vault with ERC-20 shares and ERC-4626 style
  accounting (`deposit`, `redeem`, `withdraw`, `convertToShares`, `totalAssets`).
  Basket tokens and target weights (bps) are stored on-chain.
- `contracts/MockStockToken.sol` — ERC-20 stand-in for a tokenized equity address on
  testnet.

## Setup

```bash
npm install
```

Create `.env`:

```
PRIVATE_KEY=0x...
ROBINHOOD_RPC_URL=https://rpc.testnet.chain.robinhood.com
```

## Compile and deploy

```bash
npx hardhat compile
npx tsx scripts/deploy.ts
```

The deploy script prints the factory address and the five stock token addresses.
Put the factory address into the frontend's `NEXT_PUBLIC_FACTORY_ADDRESS`.

## Tests

There is no test suite yet. `npx solc@0.8.20 --bin contracts/*.sol` compiles the
sources; Hardhat's network config targets `46630` (Robinhood Chain Testnet).
