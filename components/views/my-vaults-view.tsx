'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { VaultCard } from '@/components/vault-card'

interface Vault {
  id: string
  name: string
  description: string
  apy: number
  tvl: string
  assets: string[]
  balance: string
}

export function MyVaultsView() {
  const { address, isConnected } = useAccount()
  const [vaults, setVaults] = useState<Vault[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Simulate loading user's vaults
    if (isConnected && address) {
      setVaults([
        {
          id: '1',
          name: 'Stable Growth',
          description: 'Low-risk stable coin strategy',
          apy: 12.5,
          tvl: '$2.4M',
          assets: ['USDC', 'USDT'],
          balance: '$5,000',
        },
        {
          id: '2',
          name: 'Yield Max',
          description: 'High-yield liquidity protocol',
          apy: 28.3,
          tvl: '$1.8M',
          assets: ['ETH', 'WBTC'],
          balance: '$2,500',
        },
      ])
    } else {
      setVaults([])
    }
  }, [isConnected, address])

  if (!isHydrated || !isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-robin-gray-light mb-2">My Vaults</h2>
          <p className="text-robin-gray">Manage and monitor your vault positions</p>
        </div>
        <div className="text-center py-12 bg-robin-darker rounded-lg border border-robin-gray-dark">
          <p className="text-robin-gray mb-4">Connect your wallet to view your vaults</p>
          <p className="text-robin-gray text-sm">Use the Connect Wallet button in the header to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-robin-gray-light mb-2">My Vaults</h2>
        <p className="text-robin-gray">Manage and monitor your vault positions</p>
      </div>

      {vaults.length === 0 ? (
        <div className="text-center py-12 bg-robin-darker rounded-lg border border-robin-gray-dark">
          <p className="text-robin-gray mb-4">No vaults yet</p>
          <p className="text-robin-gray text-sm">Create a new vault to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              {...vault}
              onSelect={() => console.log('Selected vault:', vault.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
