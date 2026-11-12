'use client'

import { useEffect, useState } from 'react'
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  QrCode,
  Wallet,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EXPLORER_URL, robinhoodChain } from '@/lib/chain'
import { setActiveProvider } from '@/lib/wallet'
import {
  setWalletConnectUriHandler,
  walletConnectProjectId,
} from '@/lib/wallet-connect'
import { useDetectedWallets, type DetectedWallet } from '@/hooks/use-detected-wallets'
import { formatEth, shortAddress } from '@/lib/vaults'
import { cn } from '@/lib/utils'

const POPULAR_WALLETS = [
  { name: 'MetaMask', initial: 'M', color: '#f6851b', href: 'https://metamask.io/download/' },
  {
    name: 'Coinbase Wallet',
    initial: 'C',
    color: '#0052ff',
    href: 'https://www.coinbase.com/wallet/downloads',
  },
  { name: 'Rabby', initial: 'R', color: '#8697ff', href: 'https://rabby.io/' },
  { name: 'Trust Wallet', initial: 'T', color: '#3375bb', href: 'https://trustwallet.com/download' },
] as const

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
  const detected = useDetectedWallets()
  const connectors = useConnectors()
  const { connectAsync, isPending, error, reset } = useConnect()

  const [pairingUri, setPairingUri] = useState<string>()
  const [activeId, setActiveId] = useState<string>()
  const [copied, setCopied] = useState(false)

  const injectedConnector = connectors.find((connector) => connector.id === 'injected')
  const wcConnector = connectors.find((connector) => connector.id === 'walletConnect')

  useEffect(() => {
    if (open) return
    setPairingUri(undefined)
    setActiveId(undefined)
    setWalletConnectUriHandler(undefined)
    reset()
  }, [open, reset])

  const handleInjected = async (wallet: DetectedWallet) => {
    if (!injectedConnector) return
    setActiveId(wallet.id)
    setActiveProvider(wallet.provider)

    try {
      await connectAsync({ connector: injectedConnector, chainId: robinhoodChain.id })
      onOpenChange(false)
    } catch {
      // Error shown below.
    }
  }

  const handleWalletConnect = async () => {
    if (!wcConnector) return
    setActiveId('walletConnect')
    setWalletConnectUriHandler((uri) => setPairingUri(uri))

    try {
      await connectAsync({ connector: wcConnector, chainId: robinhoodChain.id })
      onOpenChange(false)
    } catch {
      // Error shown below.
    }
  }

  const copyUri = async () => {
    if (!pairingUri) return
    try {
      await navigator.clipboard.writeText(pairingUri)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 rounded-2xl border-border bg-card p-0">
        {pairingUri ? (
          <div className="p-6">
            <button
              type="button"
              onClick={() => {
                setPairingUri(undefined)
                setActiveId(undefined)
                reset()
              }}
              className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> All wallets
            </button>

            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-medium">
                Scan with WalletConnect
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Open your mobile wallet and scan this code to pair.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col items-center">
              <div className="rounded-2xl bg-white p-4">
                <QRCodeSVG value={pairingUri} size={196} marginSize={0} />
              </div>

              <div className="mt-5 flex items-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={copyUri}
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy pairing link'}
                </button>
                <a
                  href={pairingUri}
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  Open in wallet <ExternalLink className="size-3" />
                </a>
              </div>

              <p className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
                {activeId === 'walletConnect' && isPending && (
                  <Loader2 className="size-3 animate-spin" />
                )}
                Waiting for approval on your phone…
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-medium">Connect a wallet</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Choose a wallet to create vaults and deposit on {robinhoodChain.name}.
              </DialogDescription>
            </DialogHeader>

            <section className="mt-6">
              <p className="eyebrow">Installed</p>

              {detected.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {detected.map((wallet) => (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => handleInjected(wallet)}
                      disabled={isPending}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-left transition-colors hover:border-primary/40 disabled:opacity-60"
                    >
                      <WalletAvatar name={wallet.name} icon={wallet.icon} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{wallet.name}</span>
                        <span className="block text-[11px] text-muted-foreground">Detected</span>
                      </span>
                      {activeId === wallet.id && isPending ? (
                        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                      ) : (
                        <ArrowRight className="size-3.5 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                  No browser wallet detected. Install one below, or pair a mobile wallet with
                  WalletConnect.
                </p>
              )}
            </section>

            <section className="mt-6">
              <p className="eyebrow">WalletConnect</p>

              {walletConnectProjectId && wcConnector ? (
                <button
                  type="button"
                  onClick={handleWalletConnect}
                  disabled={isPending}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-left transition-colors hover:border-primary/40 disabled:opacity-60"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-[#3b99fc]/15 text-[#6cb4ff]">
                    <QrCode className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">WalletConnect</span>
                    <span className="block text-[11px] text-muted-foreground">
                      Scan a QR code with any mobile wallet
                    </span>
                  </span>
                  {activeId === 'walletConnect' && isPending ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ArrowRight className="size-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-border/70 bg-background/30 p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary/60 text-muted-foreground">
                    <QrCode className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">WalletConnect</span>
                    <span className="block text-[11px] leading-relaxed text-muted-foreground">
                      Add a WalletConnect project ID to enable QR pairing. Use the{' '}
                      <a
                        href="https://cloud.reown.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        Reown dashboard
                      </a>{' '}
                      and set <code className="text-foreground">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code>.
                    </span>
                  </span>
                </div>
              )}
            </section>

            <section className="mt-6">
              <p className="eyebrow">More wallets</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {POPULAR_WALLETS.map((wallet) => (
                  <a
                    key={wallet.name}
                    href={wallet.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:border-primary/40"
                  >
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: wallet.color }}
                    >
                      {wallet.initial}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{wallet.name}</span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </section>

            {error && (
              <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {error.message.split('\n')[0]}
              </p>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
              RobinFi runs on {robinhoodChain.name}. Testnet software — no real funds.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function WalletAvatar({ name, icon }: { name: string; icon?: string }) {
  if (icon) {
    return (
      // Wallet icons come from the extension's EIP-6963 announcement.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={icon} alt="" className="size-9 shrink-0 rounded-lg" />
    )
  }

  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-secondary/60">
      <Wallet className="size-4 text-primary" />
      <span className="sr-only">{name}</span>
    </span>
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
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked outside secure contexts.
    }
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
