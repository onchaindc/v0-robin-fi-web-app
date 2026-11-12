import { formatEther } from 'viem'
import { addressToSymbol } from './contracts'
import type { VaultSummary } from '@/hooks/use-vaults'

export type VaultView = {
  address: `0x${string}` | null
  name: string
  symbol: string
  description: string
  creator?: string
  tvlEth: number
  shares: number
  tokens: string[]
  weights: number[]
  balanceEth: number
  isPreview: boolean
}

export function toVaultView(vault: VaultSummary): VaultView {
  const totalAssets = Number(formatEther(vault.totalAssets))
  const balance = Number(formatEther(vault.balance))

  return {
    address: vault.address,
    name: vault.name,
    symbol: vault.symbol,
    description: vault.description,
    creator: vault.creator,
    tvlEth: totalAssets,
    shares: Number(formatEther(vault.totalSupply)),
    tokens: vault.tokens.map(addressToSymbol),
    weights: vault.weights,
    balanceEth: balance,
    isPreview: false,
  }
}

/**
 * Sample baskets shown only while the factory is not deployed on the connected
 * network. They are always labelled as previews in the UI.
 */
export const PREVIEW_VAULTS: VaultView[] = [
  {
    address: null,
    name: 'Tech Leaders',
    symbol: 'TECH',
    description: 'The five names that still set the tone for global equities.',
    tvlEth: 84.2,
    shares: 84.2,
    tokens: ['TSLA', 'AMZN', 'NFLX'],
    weights: [0.4, 0.35, 0.25],
    balanceEth: 0,
    isPreview: true,
  },
  {
    address: null,
    name: 'Enterprise Growth',
    symbol: 'GRWTH',
    description: 'Data infrastructure and semis, weighted for momentum.',
    tvlEth: 52.7,
    shares: 52.7,
    tokens: ['PLTR', 'AMD', 'TSLA'],
    weights: [0.45, 0.3, 0.25],
    balanceEth: 0,
    isPreview: true,
  },
  {
    address: null,
    name: 'Balanced Mix',
    symbol: 'MIX',
    description: 'Equal-weight across every tokenized name in the index.',
    tvlEth: 71.8,
    shares: 71.8,
    tokens: ['TSLA', 'AMZN', 'NFLX', 'PLTR', 'AMD'],
    weights: [0.2, 0.2, 0.2, 0.2, 0.2],
    balanceEth: 0,
    isPreview: true,
  },
]

export function formatEth(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '0'
  if (value > 0 && value < 0.0001) return '<0.0001'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}

export function shortAddress(address?: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
