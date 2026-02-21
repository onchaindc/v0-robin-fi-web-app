'use client'

import { Button } from '@/components/ui/button'
import { ArrowUpRight, TrendingUp } from 'lucide-react'

interface VaultCardProps {
  id: string
  name: string
  description: string
  apy: number
  tvl: string
  assets: string[]
  balance?: string
  onSelect?: () => void
}

export function VaultCard({ id, name, description, apy, tvl, assets, balance, onSelect }: VaultCardProps) {
  return (
    <div className="glass-card-dark p-6 rounded-2xl hover:border-primary/40 transition-all duration-300 hover:shadow-lg cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full ml-4 flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{apy}%</span>
        </div>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-border">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">TVL</span>
          <span className="text-sm font-semibold text-foreground">{tvl}</span>
        </div>
        {balance && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            <span className="text-sm font-semibold text-foreground">{balance}</span>
          </div>
        )}
        <div>
          <span className="text-sm text-muted-foreground block mb-2">Assets</span>
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => (
              <span key={asset} className="text-xs px-2 py-1 bg-primary/10 rounded-md text-primary font-medium">
                {asset}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={onSelect}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all"
      >
        View Details
        <ArrowUpRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
