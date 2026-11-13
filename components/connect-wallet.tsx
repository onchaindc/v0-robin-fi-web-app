'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
  X,
} from 'lucide-react'
import { EXPLORER_URL, robinhoodChain } from '@/lib/chain'
import { setActiveProvider } from '@/lib/wallet'
import { setWalletConnectUriHandler, walletConnectProjectId } from '@/lib/wallet-connect'
import { useDetectedWallets, type DetectedWallet } from '@/hooks/use-detected-wallets'
import { formatEth, shortAddress } from '@/lib/vaults'
import { cn } from '@/lib/utils'

const MOBILE_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    initial: 'M',
    color: '#f6851b',
    download: 'https://metamask.io/download/',
    deepLink: (uri: string) =>
      `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`,
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    initial: 'C',
    color: '#0052ff',
    download: 'https://www.coinbase.com/wallet/downloads',
    deepLink: (uri: string) =>
      `https://go.cb-w.com/wc?uri=${encodeURIComponent(uri)}`,
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    initial: 'T',
    color: '#3375bb',
    download: 'https://trustwallet.com/download',
    deepLink: (uri: string) =>
      `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`,
  },
  {
    id: 'rabby',
    name: 'Rabby',
    initial: 'R',
    color: '#8697ff',
    download: 'https://rabby.io/',
    // Rabby mobile uses standard WC / universal link fallback
    deepLink: (uri: string) => uri,
  },
] as const

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

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

function Sheet({
  open,
  onClose,
  titleId,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  titleId: string
  children: React.ReactNode
  className?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted || !open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mounted, open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          'relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
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
  const mobile = isMobileDevice()

  const [pairingUri, setPairingUri] = useState<string>()
  const [activeId, setActiveId] = useState<string>()
  const [copied, setCopied] = useState(false)
  const [pendingDeepLink, setPendingDeepLink] = useState<
    ((uri: string) => string) | null
  >(null)

  const injectedConnector = connectors.find((c) => c.id === 'injected')
  const wcConnector = connectors.find((c) => c.id === 'walletConnect')

  const close = () => onOpenChange(false)

  useEffect(() => {
    if (open) return
    setPairingUri(undefined)
    setActiveId(undefined)
    setPendingDeepLink(null)
    setWalletConnectUriHandler(undefined)
    reset()
  }, [open, reset])

  useEffect(() => {
    return () => setWalletConnectUriHandler(undefined)
  }, [])

  const handleInjected = async (wallet: DetectedWallet) => {
    if (!injectedConnector) return
    setActiveId(wallet.id)
    setActiveProvider(wallet.provider)

    try {
      await connectAsync({ connector: injectedConnector, chainId: robinhoodChain.id })
      close()
    } catch {
      // Error shown below.
    }
  }

  const startWalletConnect = async (deepLinkFn?: (uri: string) => string) => {
    if (!wcConnector) return
    setActiveId(deepLinkFn ? 'mobile-wallet' : 'walletConnect')
    setPendingDeepLink(() => deepLinkFn ?? null)
    setPairingUri('pending')

    setWalletConnectUriHandler((uri) => {
      if (!uri) return
      setPairingUri(uri)
      // On mobile, auto-open the chosen wallet app with the WC URI
      if (deepLinkFn && typeof window !== 'undefined') {
        const link = deepLinkFn(uri)
        // Slight delay so QR state is set before leaving the page
        setTimeout(() => {
          window.location.href = link
        }, 150)
      }
    })

    try {
      await connectAsync({ connector: wcConnector, chainId: robinhoodChain.id })
      close()
    } catch {
      setPairingUri(undefined)
      setPendingDeepLink(null)
    }
  }

  const copyUri = async () => {
    if (!pairingUri || pairingUri === 'pending') return
    try {
      await navigator.clipboard.writeText(pairingUri)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked.
    }
  }

  return (
    <Sheet open={open} onClose={close} titleId="connect-wallet-title">
      {pairingUri ? (
        <div>
          <button
            type="button"
            onClick={() => {
              setPairingUri(undefined)
              setActiveId(undefined)
              setPendingDeepLink(null)
              reset()
            }}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> All wallets
          </button>

          <h2 id="connect-wallet-title" className="pr-8 font-serif text-2xl font-medium">
            {mobile && pendingDeepLink ? 'Opening wallet…' : 'Scan with WalletConnect'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mobile && pendingDeepLink
              ? 'If the app did not open, scan the code or tap Open in wallet.'
              : 'Open your mobile wallet and scan this code to pair.'}
          </p>

          <div className="mt-6 flex flex-col items-center">
            {pairingUri === 'pending' ? (
              <div className="grid size-[228px] place-items-center rounded-2xl border border-border bg-background/50">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-4">
                <QRCodeSVG value={pairingUri} size={196} marginSize={0} />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={copyUri}
                disabled={pairingUri === 'pending'}
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? 'Copied' : 'Copy pairing link'}
              </button>
              {pairingUri !== 'pending' && (
                <a
                  href={
                    pendingDeepLink ? pendingDeepLink(pairingUri) : pairingUri
                  }
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  Open in wallet <ExternalLink className="size-3" />
                </a>
              )}
            </div>

            <p className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
              {isPending && <Loader2 className="size-3 animate-spin" />}
              Waiting for approval in your wallet…
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h2 id="connect-wallet-title" className="pr-8 font-serif text-2xl font-medium">
            Connect a wallet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a wallet to create vaults and deposit on {robinhoodChain.name}.
          </p>

          {/* Installed browser extensions (desktop / in-app browsers) */}
          <section className="mt-6">
            <p className="eyebrow">Installed</p>

            {detected.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                {mobile
                  ? 'On mobile, use a wallet app below. Browser extensions only work on desktop.'
                  : 'No browser wallet detected. Install one below, or pair with WalletConnect.'}
              </p>
            )}
          </section>

          {/* Mobile: connect directly into wallet apps */}
          {mobile && walletConnectProjectId && wcConnector && (
            <section className="mt-6">
              <p className="eyebrow">Open wallet app</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {MOBILE_WALLETS.map((wallet) => (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => startWalletConnect(wallet.deepLink)}
                    disabled={isPending}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-left transition-colors hover:border-primary/40 disabled:opacity-60"
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: wallet.color }}
                    >
                      {wallet.initial}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{wallet.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        Opens the app to approve
                      </span>
                    </span>
                    {activeId === 'mobile-wallet' && isPending ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <ArrowRight className="size-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6">
            <p className="eyebrow">WalletConnect</p>

            {walletConnectProjectId && wcConnector ? (
              <button
                type="button"
                onClick={() => startWalletConnect()}
                disabled={isPending}
                className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-left transition-colors hover:border-primary/40 disabled:opacity-60"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-[#3b99fc]/15 text-[#6cb4ff]">
                  <QrCode className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">WalletConnect</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {mobile ? 'Show QR / pair any wallet' : 'Scan a QR code with any mobile wallet'}
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
                    Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and allowlist{' '}
                    <code className="text-[10px]">robinfi-app.vercel.app</code> at
                    dashboard.reown.com, then redeploy.
                  </span>
                </span>
              </div>
            )}
          </section>

          {!mobile && (
            <section className="mt-6">
              <p className="eyebrow">Get a wallet</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MOBILE_WALLETS.map((wallet) => (
                  <a
                    key={wallet.id}
                    href={wallet.download}
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
          )}

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
    </Sheet>
  )
}

function WalletAvatar({ name, icon }: { name: string; icon?: string }) {
  if (icon) {
    return (
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
          onClick={() => (onCorrectChain ? undefined : switchChain({ chainId: robinhoodChain.id }))}
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
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-1.5 py-1.5 text-sm transition-colors hover:border-primary/40 sm:gap-2 sm:px-2"
        >
          <span className="numeric hidden pl-1.5 text-muted-foreground sm:inline">
            {balance ? `${formatEth(Number(balance.value) / 1e18, 3)} ETH` : '—'}
          </span>
          <span className="numeric rounded-full bg-secondary px-2 py-1 text-[11px] font-medium sm:px-2.5 sm:text-xs">
            {shortAddress(address)}
          </span>
          <ChevronDown className="mr-0.5 size-3.5 text-muted-foreground sm:mr-1" />
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} titleId="wallet-title" className="sm:max-w-sm">
        <h2 id="wallet-title" className="pr-8 font-serif text-xl font-medium">
          Your wallet
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{robinhoodChain.name}</p>

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
                {balance ? `${formatEth(Number(balance.value) / 1e18, 4)} ${balance.symbol}` : '—'}
              </p>
            </div>
            {!onCorrectChain && (
              <button
                type="button"
                onClick={() => switchChain({ chainId: robinhoodChain.id })}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Switch network
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              disconnect()
              setOpen(false)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Disconnect
          </button>
        </div>
      </Sheet>
    </>
  )
}
