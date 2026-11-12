'use client'

import { useEffect, useState } from 'react'
import { useAccount, useBalance, useChainId, useConnect, useConnectors, useDisconnect, useSwitchChain } from 'wagmi'
import { AlertTriangle, ArrowRight, Check, ChevronDown, Copy, ExternalLink, Loader2, LogOut, Wallet } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EXPLORER_URL, robinhoodChain } from '@/lib/chain'
import { walletName, type Eip1193Provider } from '@/lib/wallet'
import { formatEth, shortAddress } from '@/lib/vaults'
import { cn } from '@/lib/utils'

export function WalletButton({
  className,
  label = 'Connect wallet',
  variant = 'primary',
}: {
  className?: string
  label?: string
  variant?: 'primary' | 'outline'
}) {
  const { isConnected } = useAccount()
  const [open, setOpen] = useState(false)

  if (isConnected) return <WalletChip />

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.99]',
          variant === 'primary'
            ? 'bg-primary text-primary-foreground hover:brightness-110'
            : 'border border-border text-foreground hover:border-primary/40 hover:text-primary',
          className,
        )}
      >
        {label}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </button>
      <ConnectSheet open={open} onOpenChange={setOpen} />
    </>
  )
}

export function ConnectSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const connectors = useConnectors()
  const { connectAsync, isPending, error } = useConnect()
  const [detected, setDetected] = useState<Eip1193Provider | undefined>()

  useEffect(() => {
    setDetected(typeof window !== 'undefined' ? window.ethereum : undefined)
  }, [])

  const handleConnect = async () => {
    const connector = connectors[0]
    if (!connector) return
    try {
      await connectAsync({ connector, chainId: robinhoodChain.id })
      onOpenChange(false)
    } catch {
      // Error surfaced below.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 rounded-2xl border-border bg-card p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium">Connect a wallet</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Use a browser wallet to create vaults and deposit on Robinhood Chain.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={handleConnect}
              disabled={isPending || !detected}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 p-3.5 text-left transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="grid size-9 place-items-center rounded-lg border border-border bg-secondary/60">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wallet className="size-4 text-primary" />
                )}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">
                  {detected ? walletName(detected) : 'Browser wallet'}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {detected
                    ? 'Detected in this browser'
                    : 'No wallet extension detected'}
                </span>
              </span>
              {detected ? (
                <ArrowRight className="size-4 text-muted-foreground" />
              ) : (
                <ExternalLink className="size-4 text-muted-foreground" />
              )}
            </button>

            {!detected && (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Install a wallet to continue
              </a>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error.message.split('\n')[0]}
            </p>
          )}

          <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
            RobinFi runs on {robinhoodChain.name}. Testnet software — no real funds.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function WalletChip({ className }: { className?: string }) {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const chainId = useChainId()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const onCorrectChain = chainId === robinhoodChain.id

  const copy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        <button
          type="button"
          onClick={() =>
            onCorrectChain ? undefined : switchChain({ chainId: robinhoodChain.id })
          }
          className={cn(
            'hidden items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition-colors sm:flex',
            onCorrectChain
              ? 'border-border/80 text-muted-foreground hover:text-foreground'
              : 'border-destructive/40 text-destructive',
          )}
          title={onCorrectChain ? robinhoodChain.name : 'Switch network'}
        >
          {isSwitching ? (
            <Loader2 className="size-3 animate-spin" />
          ) : onCorrectChain ? (
            <span className="size-1.5 rounded-full bg-primary" />
          ) : (
            <AlertTriangle className="size-3" />
          )}
          {onCorrectChain ? 'Robinhood' : 'Wrong network'}
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-sm transition-colors hover:border-primary/40"
        >
          <span className="numeric pl-2 text-muted-foreground">
            {balance ? `${formatEth(Number(balance.value) / 1e18, 3)} ETH` : '—'}
          </span>
          <span className="numeric rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
            {shortAddress(address)}
          </span>
          <ChevronDown className="mr-1 size-3.5 text-muted-foreground" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-medium">Your wallet</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {robinhoodChain.name}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="eyebrow">Address</p>
              <p className="numeric mt-1 break-all text-sm">{address}</p>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={`${EXPLORER_URL}/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  <ExternalLink className="size-3" /> Explorer
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="eyebrow">Balance</p>
                <p className="numeric mt-1 text-sm">
                  {balance
                    ? `${formatEth(Number(balance.value) / 1e18, 4)} ${balance.symbol}`
                    : '—'}
                </p>
              </div>
              {!onCorrectChain && (
                <button
                  type="button"
                  onClick={() => switchChain({ chainId: robinhoodChain.id })}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Switch chain
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                disconnect()
                setOpen(false)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="size-3.5" /> Disconnect
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
