'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { cn } from '@/lib/utils'

/**
 * Same wallet modal experience as Flat Signal (RainbowKit).
 * Drop-in replacements for the old custom connect sheet.
 */
export function WalletButton({
  className,
  label = 'Connect wallet',
}: {
  className?: string
  label?: string
  variant?: 'primary' | 'outline'
}) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none' as const,
                userSelect: 'none' as const,
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className={cn(
                      'group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.99]',
                      className,
                    )}
                  >
                    {label}
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="hidden items-center gap-1.5 rounded-full border border-border/80 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={chain.name ?? 'Chain'}
                        src={chain.iconUrl}
                        className="size-3.5 rounded-full"
                      />
                    )}
                    {chain.name}
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="rounded-full border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40"
                  >
                    {account.displayName}
                    {account.displayBalance ? ` · ${account.displayBalance}` : ''}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

/** Connected chip — same as WalletButton when already connected */
export function WalletChip({ className }: { className?: string }) {
  return <WalletButton className={className} />
}

/** Optional full RainbowKit button if needed elsewhere */
export function RainbowConnect({ className }: { className?: string }) {
  return (
    <div className={className}>
      <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
    </div>
  )
}
