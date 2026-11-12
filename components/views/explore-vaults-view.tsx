'use client'

import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { Info, Search } from 'lucide-react'
import { VaultCard } from '@/components/vault-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAllVaultAddresses, useVaultSummaries } from '@/hooks/use-vaults'
import { isFactoryConfigured } from '@/lib/contracts'
import { PREVIEW_VAULTS, toVaultView } from '@/lib/vaults'

interface ExploreVaultsViewProps {
  onSelectVault?: (vaultAddress: string) => void
}

export function ExploreVaultsView({ onSelectVault }: ExploreVaultsViewProps) {
  const { address } = useAccount()
  const { addresses, isLoading, isError } = useAllVaultAddresses()
  const { vaults } = useVaultSummaries(addresses, address)

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('tvl')

  const onChain = useMemo(() => vaults.map(toVaultView), [vaults])
  const usingPreview = onChain.length === 0
  const source = usingPreview ? PREVIEW_VAULTS : onChain

  const filtered = useMemo(() => {
    return source
      .filter(
        (vault) =>
          vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vault.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vault.tokens.some((token) =>
            token.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
      .sort((a, b) => {
        if (sortBy === 'tvl') return b.tvlEth - a.tvlEth
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'position') return b.balanceEth - a.balanceEth
        return 0
      })
  }, [source, searchTerm, sortBy])

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h2 className="display mt-3 text-4xl">Explore vaults</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Every basket is deployed by its creator and readable on-chain. Deposit ETH to take a
            position.
          </p>
        </div>
        <span className="numeric rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
          {source.length} vault{source.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, symbol or ticker…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 rounded-xl border-border bg-card pl-10 text-sm"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card text-sm md:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tvl">Highest TVL</SelectItem>
            <SelectItem value="position">Your position</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {usingPreview && !isLoading && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] p-4 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-muted-foreground">
            {isError
              ? 'The factory could not be reached on this network. Check the RPC and factory address — the baskets below are samples.'
              : isFactoryConfigured
                ? 'No vaults have been created yet — these are sample baskets. Create the first one to see it here.'
                : 'The factory is not deployed on this network yet, so these are sample baskets. Deploy the contracts and set NEXT_PUBLIC_FACTORY_ADDRESS to go live.'}
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="panel h-80 animate-pulse bg-secondary/30" />
            ))
          : filtered.map((vault) => {
              const address = vault.address
              return (
                <VaultCard
                  key={address ?? vault.name}
                  vault={vault}
                  onSelect={
                    address && onSelectVault
                      ? () => onSelectVault(address)
                      : undefined
                  }
                />
              )
            })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="panel mt-8 p-14 text-center">
          <p className="font-serif text-xl">Nothing matches that search</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a ticker like TSLA, or clear the filters.
          </p>
        </div>
      )}
    </div>
  )
}
