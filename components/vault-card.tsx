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
  onSelect?: () => void
}

export function VaultCard({ id, name, description, apy, tvl, assets, onSelect }: VaultCardProps) {
  return (
    <div className="border border-robin-gray-dark rounded-lg p-6 bg-robin-dark hover:border-robin-teal transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-robin-gray-light">{name}</h3>
          <p className="text-sm text-robin-gray mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-robin-darker rounded-full">
          <TrendingUp className="w-4 h-4 text-robin-teal" />
          <span className="text-sm font-semibold text-robin-teal">{apy}%</span>
        </div>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-robin-gray-dark">
        <div className="flex justify-between">
          <span className="text-sm text-robin-gray">TVL</span>
          <span className="text-sm font-semibold text-robin-gray-light">{tvl}</span>
        </div>
        <div>
          <span className="text-sm text-robin-gray block mb-2">Assets</span>
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => (
              <span key={asset} className="text-xs px-2 py-1 bg-robin-darker rounded text-robin-gray-light">
                {asset}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={onSelect}
        className="w-full bg-robin-teal text-robin-dark hover:bg-robin-teal-light font-semibold"
      >
        Select Vault
        <ArrowUpRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
