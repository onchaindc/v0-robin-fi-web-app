'use client'

import { useState } from 'react'
import { VaultCard } from '@/components/vault-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

const FEATURED_VAULTS = [
  {
    id: 'stable-growth',
    name: 'Stable Growth',
    description: 'Low-risk stable coin strategy',
    apy: 12.5,
    tvl: '$2.4M',
    assets: ['USDC', 'USDT'],
  },
  {
    id: 'yield-max',
    name: 'Yield Max',
    description: 'High-yield liquidity protocol',
    apy: 28.3,
    tvl: '$1.8M',
    assets: ['ETH', 'WBTC'],
  },
  {
    id: 'balanced-portfolio',
    name: 'Balanced Portfolio',
    description: 'Mixed assets with rebalancing',
    apy: 18.7,
    tvl: '$5.2M',
    assets: ['USDC', 'ETH', 'AAVE'],
  },
  {
    id: 'crypto-growth',
    name: 'Crypto Growth',
    description: 'Long-term cryptocurrency strategy',
    apy: 35.2,
    tvl: '$3.1M',
    assets: ['ETH', 'WBTC', 'SOL'],
  },
  {
    id: 'defi-pioneer',
    name: 'DeFi Pioneer',
    description: 'Advanced DeFi yield farming',
    apy: 42.1,
    tvl: '$6.8M',
    assets: ['AAVE', 'COMP', 'USDC'],
  },
  {
    id: 'stablecoin-pro',
    name: 'Stablecoin Pro',
    description: 'Premium stablecoin farming',
    apy: 15.8,
    tvl: '$4.5M',
    assets: ['USDC', 'USDT', 'DAI'],
  },
]

export function ExploreVaultsView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('apy')

  const filteredVaults = FEATURED_VAULTS
    .filter(vault =>
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'apy') return b.apy - a.apy
      if (sortBy === 'tvl') {
        const aVal = parseInt(a.tvl.replace(/[^0-9]/g, ''))
        const bVal = parseInt(b.tvl.replace(/[^0-9]/g, ''))
        return bVal - aVal
      }
      return 0
    })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-robin-gray-light mb-6">Explore Vaults</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-robin-gray" />
            <Input
              placeholder="Search vaults..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-robin-darker border-robin-gray-dark text-robin-gray-light placeholder:text-robin-gray"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-robin-darker border-robin-gray-dark text-robin-gray-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-robin-darker border-robin-gray-dark">
              <SelectItem value="apy" className="text-robin-gray-light">Sort by APY</SelectItem>
              <SelectItem value="tvl" className="text-robin-gray-light">Sort by TVL</SelectItem>
              <SelectItem value="name" className="text-robin-gray-light">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVaults.map((vault) => (
          <VaultCard
            key={vault.id}
            {...vault}
            onSelect={() => console.log('Selected vault:', vault.id)}
          />
        ))}
      </div>

      {filteredVaults.length === 0 && (
        <div className="text-center py-12 bg-robin-darker rounded-lg border border-robin-gray-dark">
          <p className="text-robin-gray mb-2">No vaults found</p>
          <p className="text-robin-gray text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
