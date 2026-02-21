'use client'

import { useState } from 'react'
import { VaultCard } from '@/components/vault-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface ExploreVaultsViewProps {
  onSelectVault?: (vaultId: string) => void
}

const FEATURED_VAULTS = [
  {
    id: 'tech-leaders',
    name: 'Tech Leaders',
    description: 'TSLA, AMZN, NFLX exposure',
    apy: 18.5,
    tvl: '$8.4M',
    assets: ['TSLA', 'AMZN', 'NFLX'],
  },
  {
    id: 'enterprise-growth',
    name: 'Enterprise Growth',
    description: 'PLTR, AMD, TSLA portfolio',
    apy: 22.3,
    tvl: '$5.2M',
    assets: ['PLTR', 'AMD', 'TSLA'],
  },
  {
    id: 'innovation-fund',
    name: 'Innovation Fund',
    description: 'Balanced tech and growth stocks',
    apy: 19.7,
    tvl: '$6.8M',
    assets: ['AMZN', 'NFLX', 'PLTR'],
  },
  {
    id: 'semiconductor-play',
    name: 'Semiconductor Play',
    description: 'AMD and advanced tech focus',
    apy: 25.1,
    tvl: '$3.1M',
    assets: ['AMD', 'TSLA', 'AMZN'],
  },
  {
    id: 'streaming-kings',
    name: 'Streaming Kings',
    description: 'Netflix and digital media leaders',
    apy: 21.2,
    tvl: '$4.6M',
    assets: ['NFLX', 'AMZN', 'PLTR'],
  },
  {
    id: 'balanced-portfolio',
    name: 'Balanced Mix',
    description: 'Diversified across all 5 stocks',
    apy: 20.4,
    tvl: '$7.2M',
    assets: ['TSLA', 'AMZN', 'NFLX', 'PLTR', 'AMD'],
  },
]

export function ExploreVaultsView({ onSelectVault }: ExploreVaultsViewProps) {
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
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Explore Vaults</h2>
        <p className="text-muted-foreground mb-6">Discover and invest in community vaults</p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vaults by name or assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card-dark border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="md:w-48 glass-card-dark border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card-dark border-border">
              <SelectItem value="apy" className="text-foreground">Sort by APY</SelectItem>
              <SelectItem value="tvl" className="text-foreground">Sort by TVL</SelectItem>
              <SelectItem value="name" className="text-foreground">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVaults.map((vault) => (
          <div key={vault.id} onClick={() => onSelectVault?.(vault.id)} className="cursor-pointer">
            <VaultCard
              {...vault}
              onSelect={() => onSelectVault?.(vault.id)}
            />
          </div>
        ))}
      </div>

      {filteredVaults.length === 0 && (
        <div className="glass-card-dark p-12 rounded-2xl text-center">
          <p className="text-muted-foreground mb-2">No vaults found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
