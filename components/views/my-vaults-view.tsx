'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { VaultCard } from '@/components/vault-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Vault {
  id: string
  name: string
  description: string
  apy: number
  tvl: string
  assets: string[]
  balance: string
}

interface MyVaultsViewProps {
  onSelectVault?: (vaultId: string) => void
}

export function MyVaultsView({ onSelectVault }: MyVaultsViewProps) {
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
          name: 'Tech Diversified',
          description: 'Exposure to TSLA, AMZN, NFLX',
          apy: 15.2,
          tvl: '$4.2M',
          assets: ['TSLA', 'AMZN', 'NFLX'],
          balance: '$12,500',
        },
        {
          id: '2',
          name: 'Growth Portfolio',
          description: 'PLTR, AMD, and balanced assets',
          apy: 22.8,
          tvl: '$2.8M',
          assets: ['PLTR', 'AMD', 'TSLA'],
          balance: '$8,750',
        },
      ])
    } else {
      setVaults([])
    }
  }, [isConnected, address])

  if (!isHydrated || !isConnected) {
    return (
      <div className="py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Vaults</h2>
          <p className="text-muted-foreground">Manage and monitor your vault positions</p>
        </div>
        <div className="glass-card-dark p-12 rounded-2xl text-center">
          <p className="text-muted-foreground mb-4">Connect your wallet to view your vaults</p>
          <p className="text-sm text-muted-foreground">Use the Connect Wallet button in the header to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">My Vaults</h2>
          <p className="text-muted-foreground">Manage and monitor your vault positions</p>
        </div>
      </div>

      {vaults.length === 0 ? (
        <div className="glass-card-dark p-12 rounded-2xl text-center">
          <p className="text-muted-foreground mb-4">No vaults yet</p>
          <p className="text-sm text-muted-foreground">Create a new vault to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <div key={vault.id} onClick={() => onSelectVault?.(vault.id)} className="cursor-pointer">
              <VaultCard
                {...vault}
                onSelect={() => onSelectVault?.(vault.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
