import { parseAbi } from 'viem'

/**
 * Address of the deployed RobinFiFactory. Set NEXT_PUBLIC_FACTORY_ADDRESS in the
 * environment after running `npm run deploy` inside robinfi-contracts.
 */
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ??
  ZERO_ADDRESS) as `0x${string}`

export const isFactoryConfigured = FACTORY_ADDRESS !== ZERO_ADDRESS

export const FACTORY_ABI = parseAbi([
  'function createVault(string name, string symbol, string description, address[] stockTokens, uint256[] allocationsBps) payable returns (address vault)',
  'function getAllVaults() view returns (address[])',
  'function getVaultsByCreator(address creator) view returns (address[])',
  'function vaultCount() view returns (uint256)',
  'event VaultCreated(address indexed vault, address indexed creator, string name, string symbol, uint256 seededWith)',
])

export const VAULT_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function description() view returns (string)',
  'function creator() view returns (address)',
  'function createdAt() view returns (uint64)',
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function basket() view returns (address[] tokens, uint256[] weightsBps)',
  'function deposit(uint256 assets, address receiver) payable returns (uint256 shares)',
  'function redeem(uint256 shares, address receiver, address owner) returns (uint256 assets)',
  'function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)',
  'function rebalance(address[] tokens, uint256[] weightsBps)',
])

/** Stock tokens used to build baskets. Replace with live tokenized equities when available. */
export const STOCK_TOKENS = [
  { symbol: 'TSLA', name: 'Tesla', address: '0x0000000000000000000000000000000000000001' },
  { symbol: 'AMZN', name: 'Amazon', address: '0x0000000000000000000000000000000000000002' },
  { symbol: 'NFLX', name: 'Netflix', address: '0x0000000000000000000000000000000000000003' },
  { symbol: 'PLTR', name: 'Palantir', address: '0x0000000000000000000000000000000000000004' },
  { symbol: 'AMD', name: 'AMD', address: '0x0000000000000000000000000000000000000005' },
] as const

export type StockSymbol = (typeof STOCK_TOKENS)[number]['symbol']

export function stockBySymbol(symbol: string) {
  return STOCK_TOKENS.find((token) => token.symbol === symbol)
}

export function addressToSymbol(address: string): string {
  const token = STOCK_TOKENS.find(
    (item) => item.address.toLowerCase() === address.toLowerCase(),
  )
  return token?.symbol ?? `${address.slice(0, 6)}…${address.slice(-4)}`
}

export const BPS_DENOMINATOR = 10_000
