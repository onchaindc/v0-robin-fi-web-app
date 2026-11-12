'use client'

import { ArrowUpRight } from 'lucide-react'
import { formatEth, shortAddress, type VaultView } from '@/lib/vaults'

interface VaultCardProps {
  vault: VaultView
  onSelect?: () => void
}

export function VaultCard({ vault, onSelect }: VaultCardProps) {
  const allocations = vault.tokens.map((token, index) => ({
    token,
    weight: vault.weights[index] ?? 0,
  }))

  return (
    <article className="panel group flex h-full flex-col p-6 transition-all hover:border-primary/30 hover:shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="numeric rounded-md border border-border/80 px-1.5 py-0.5 text-[10px] tracking-[0.14em] text-muted-foreground">
              {vault.symbol}
            </span>
            {vault.isPreview && (
              <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-accent">
                Preview
              </span>
            )}
          </div>
          <h3 className="mt-3 truncate font-serif text-2xl">{vault.name}</h3>
        </div>
        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
        {vault.description || 'A tokenized equity basket managed on-chain.'}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border/70 py-4">
        <div>
          <p className="eyebrow">TVL</p>
          <p className="numeric mt-1.5 text-lg">
            {formatEth(vault.tvlEth)} <span className="text-xs text-muted-foreground">ETH</span>
          </p>
        </div>
        <div>
          <p className="eyebrow">{vault.balanceEth > 0 ? 'Your position' : 'Shares'}</p>
          <p className="numeric mt-1.5 text-lg">
            {formatEth(vault.balanceEth > 0 ? vault.balanceEth : vault.shares)}{' '}
            <span className="text-xs text-muted-foreground">
              {vault.balanceEth > 0 ? 'ETH' : 'issued'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        {allocations.map((allocation, index) => (
          <span
            key={`${allocation.token}-${index}`}
            className="h-full"
            style={{
              width: `${(allocation.weight || 1 / Math.max(allocations.length, 1)) * 100}%`,
              opacity: 1 - index * 0.14,
              backgroundColor: 'var(--primary)',
            }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {allocations.map((allocation) => (
          <span
            key={allocation.token}
            className="numeric rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] tracking-wide text-muted-foreground"
          >
            {allocation.token} {Math.round(allocation.weight * 100)}%
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between pt-1">
        <span className="text-[11px] text-muted-foreground">
          {vault.creator ? `By ${shortAddress(vault.creator)}` : 'Sample basket'}
        </span>
        <button
          type="button"
          onClick={onSelect}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
        >
          Open vault
        </button>
      </div>
    </article>
  )
}
