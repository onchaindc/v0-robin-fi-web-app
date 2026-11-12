'use client'

import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { ArrowRight, Compass, Plus, Wallet } from 'lucide-react'
import { VaultCard } from '@/components/vault-card'
import { useAllVaultAddresses, useCreatorVaultAddresses, useVaultSummaries } from '@/hooks/use-vaults'
import { formatEth, toVaultView } from '@/lib/vaults'

interface MyVaultsViewProps {
  onSelectVault?: (vaultAddress: string) => void
  onCreate?: () => void
  onExplore?: () => void
}

export function MyVaultsView({ onSelectVault, onCreate, onExplore }: MyVaultsViewProps) {
  const { address } = useAccount()
  const { addresses: createdAddresses, isLoading: isLoadingCreated } =
    useCreatorVaultAddresses(address)
  const { addresses: allAddresses } = useAllVaultAddresses()

  const { vaults: createdVaults } = useVaultSummaries(createdAddresses, address)
  const { vaults: allVaults } = useVaultSummaries(allAddresses, address)

  const positions = useMemo(
    () => allVaults.map(toVaultView).filter((vault) => vault.balanceEth > 0),
    [allVaults],
  )
  const created = useMemo(() => createdVaults.map(toVaultView), [createdVaults])

  const deposited = positions.reduce((sum, vault) => sum + vault.balanceEth, 0)
  const isLoading = isLoadingCreated && created.length === 0

  if (!isLoading && positions.length === 0 && created.length === 0) {
    return (
      <div className="animate-fade-up">
        <p className="eyebrow">Portfolio</p>
        <h2 className="display mt-3 text-4xl">My vaults</h2>

        <div className="panel mt-8 overflow-hidden">
          <div className="grid gap-10 p-10 md:grid-cols-[1.1fr_0.9fr] md:p-14">
            <div>
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-secondary/50 text-primary">
                <Wallet className="size-5" />
              </span>
              <h3 className="display mt-6 text-3xl">An empty bag, for now.</h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Deposit into an existing basket for instant diversification, or launch your own
                index and seed it in the same transaction.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onExplore}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                >
                  <Compass className="size-4" /> Explore vaults
                </button>
                <button
                  type="button"
                  onClick={onCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Plus className="size-4" /> Create a vault
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/80 p-6">
              <p className="eyebrow">What you get</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  'Transferable shares in your basket',
                  'Live NAV, read straight from the vault',
                  'Deposit and redeem whenever you want',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h2 className="display mt-3 text-4xl">My vaults</h2>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="size-4" /> New vault
        </button>
      </div>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/70 sm:grid-cols-3">
        {[
          { label: 'Deposited', value: `${formatEth(deposited)} ETH` },
          { label: 'Positions', value: `${positions.length}` },
          { label: 'Vaults created', value: `${created.length}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-card p-6">
            <dt className="eyebrow">{stat.label}</dt>
            <dd className="numeric mt-2 font-serif text-2xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {positions.length > 0 && (
        <section className="mt-12">
          <h3 className="font-serif text-2xl">Your positions</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {positions.map((vault) => (
              <VaultCard
                key={vault.address}
                vault={vault}
                onSelect={() => vault.address && onSelectVault?.(vault.address)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl">Vaults you created</h3>
          <button
            type="button"
            onClick={onExplore}
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Browse all
          </button>
        </div>

        {created.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {created.map((vault) => (
              <VaultCard
                key={vault.address}
                vault={vault}
                onSelect={() => vault.address && onSelectVault?.(vault.address)}
              />
            ))}
          </div>
        ) : (
          <div className="panel mt-5 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              You have not launched a vault yet.{' '}
              <button
                type="button"
                onClick={onCreate}
                className="text-primary underline-offset-4 hover:underline"
              >
                Create your first index
              </button>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
