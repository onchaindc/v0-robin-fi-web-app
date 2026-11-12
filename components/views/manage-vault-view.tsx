'use client'

import { useEffect, useState } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { formatEther, parseEther } from 'viem'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RotateCw,
  TriangleAlert,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVault } from '@/hooks/use-vaults'
import { VAULT_ABI } from '@/lib/contracts'
import { EXPLORER_URL, robinhoodChain } from '@/lib/chain'
import { formatEth, shortAddress } from '@/lib/vaults'
import { cn } from '@/lib/utils'

interface ManageVaultViewProps {
  vaultAddress: `0x${string}`
}

type Action = 'deposit' | 'withdraw' | 'rebalance'

export function ManageVaultView({ vaultAddress }: ManageVaultViewProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { vault, isLoading, refetch } = useVault(vaultAddress, address)

  const [action, setAction] = useState<Action>('deposit')
  const [amount, setAmount] = useState('')
  const [weights, setWeights] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({ hash })

  const isCreator = Boolean(
    address && vault && address.toLowerCase() === vault.creator.toLowerCase(),
  )

  useEffect(() => {
    if (!vault) return
    setWeights(
      Object.fromEntries(
        vault.tokens.map((token, index) => [token, String((vault.weights[index] ?? 0) * 100)]),
      ),
    )
  }, [vault])

  useEffect(() => {
    if (!isSuccess) return
    setStatus('success')
    setAmount('')
    refetch()
    const timer = setTimeout(() => setStatus('idle'), 4000)
    return () => clearTimeout(timer)
  }, [isSuccess, refetch])

  useEffect(() => {
    if (!isReceiptError) return
    setStatus('error')
    const timer = setTimeout(() => setStatus('idle'), 4000)
    return () => clearTimeout(timer)
  }, [isReceiptError])

  const isLoadingTx = isPending || isConfirming
  const wrongChain = isConnected && chainId !== robinhoodChain.id

  const userShares = vault ? Number(formatEther(vault.balance)) : 0
  const totalAssets = vault ? Number(formatEther(vault.totalAssets)) : 0
  const totalSupply = vault ? Number(formatEther(vault.totalSupply)) : 0
  const positionValue = totalSupply > 0 ? (userShares * totalAssets) / totalSupply : 0

  const rebalanceEntries = vault
    ? vault.tokens.map((token, index) => ({
        token,
        label: token,
        original: (vault.weights[index] ?? 0) * 100,
        value: weights[token] ?? String((vault.weights[index] ?? 0) * 100),
      }))
    : []
  const rebalanceTotal = rebalanceEntries.reduce(
    (sum, entry) => sum + (Number.parseFloat(entry.value) || 0),
    0,
  )

  const handleTransaction = () => {
    if (!address || !vault) return

    if (action === 'deposit') {
      if (!amount) return
      writeContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [parseEther(amount), address],
        value: parseEther(amount),
      })
    } else if (action === 'withdraw') {
      if (!amount) return
      writeContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'redeem',
        args: [parseEther(amount), address, address],
      })
    } else {
      writeContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'rebalance',
        args: [
          vault.tokens,
          rebalanceEntries.map((entry) => BigInt(Math.round((Number.parseFloat(entry.value) || 0) * 100))),
        ],
      })
    }
  }

  const canSubmit =
    action === 'rebalance'
      ? isCreator && Math.round(rebalanceTotal) === 100
      : Boolean(amount) && Number(amount) > 0

  if (isLoading && !vault) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-secondary/50" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-secondary/40" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-secondary/30" />
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {status !== 'idle' && (
        <div
          className={cn(
            'fixed right-4 top-20 z-50 flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3 text-sm shadow-xl',
            status === 'success' ? 'border-primary/40' : 'border-destructive/40',
          )}
        >
          {status === 'success' ? (
            <>
              <CheckCircle2 className="size-4 text-primary" /> Transaction confirmed
            </>
          ) : (
            <>
              <XCircle className="size-4 text-destructive" /> Transaction failed
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="numeric rounded-md border border-border px-2 py-0.5 text-[11px] tracking-[0.14em] text-muted-foreground">
              {vault?.symbol ?? '—'}
            </span>
            <span className="text-xs text-muted-foreground">{shortAddress(vaultAddress)}</span>
          </div>
          <h2 className="display mt-3 text-4xl">{vault?.name ?? 'Vault'}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {vault?.description || 'A tokenized equity basket managed on-chain.'}
          </p>
        </div>
        <a
          href={`${EXPLORER_URL}/address/${vaultAddress}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Explorer <ExternalLink className="size-3" />
        </a>
      </div>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/70 sm:grid-cols-3">
        {[
          { label: 'Total assets', value: `${formatEth(totalAssets, 4)} ETH` },
          { label: 'Your shares', value: formatEth(userShares, 4) },
          { label: 'Your position', value: `${formatEth(positionValue, 4)} ETH` },
        ].map((stat) => (
          <div key={stat.label} className="bg-card p-6">
            <dt className="eyebrow">{stat.label}</dt>
            <dd className="numeric mt-2 font-serif text-2xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6 sm:p-7">
          <h3 className="font-serif text-xl">Manage position</h3>

          <div className="mt-5 inline-flex w-full rounded-full border border-border p-1">
            {(['deposit', 'withdraw', 'rebalance'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setAction(option)
                  reset()
                }}
                disabled={isLoadingTx}
                className={cn(
                  'flex-1 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  action === option
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                  option === 'rebalance' && !isCreator && 'opacity-50',
                )}
              >
                {option}
              </button>
            ))}
          </div>

          {action !== 'rebalance' ? (
            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="amount" className="text-sm">
                  Amount
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {action === 'deposit'
                    ? 'ETH'
                    : `Shares · max ${formatEth(userShares, 4)}`}
                </span>
              </div>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.001"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.0"
                disabled={isLoadingTx}
                className="mt-2 h-11 rounded-xl bg-background/60"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {action === 'deposit'
                  ? 'Shares are minted against the vault’s current NAV.'
                  : 'Redeeming burns shares and returns your pro-rata ETH.'}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {!isCreator && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  Only the vault creator can rebalance this basket.
                </p>
              )}
              {rebalanceEntries.map((entry) => (
                <div key={entry.token} className="flex items-center gap-3">
                  <span className="w-24 truncate text-xs text-muted-foreground">
                    {entry.label.slice(0, 6)}…{entry.label.slice(-4)}
                  </span>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={entry.value}
                      onChange={(event) =>
                        setWeights((previous) => ({
                          ...previous,
                          [entry.token]: event.target.value,
                        }))
                      }
                      disabled={!isCreator || isLoadingTx}
                      className="h-9 rounded-lg bg-background/60 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              ))}
              <p
                className={cn(
                  'numeric text-xs',
                  Math.round(rebalanceTotal) === 100 ? 'text-primary' : 'text-accent',
                )}
              >
                {rebalanceTotal}% allocated
                {Math.round(rebalanceTotal) === 100 ? ' · valid' : ' · must equal 100%'}
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error.message.split('\n')[0]}
            </p>
          )}

          <div className="mt-6">
            {wrongChain ? (
              <Button
                type="button"
                onClick={() => switchChain({ chainId: robinhoodChain.id })}
                className="w-full rounded-full"
              >
                Switch to Robinhood Chain
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleTransaction}
                disabled={!canSubmit || isLoadingTx}
                className="w-full rounded-full"
              >
                {isLoadingTx ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {isPending ? 'Confirm in wallet' : 'Confirming'}
                  </>
                ) : (
                  <>
                    {action === 'deposit' && <ArrowDownLeft className="mr-2 size-4" />}
                    {action === 'withdraw' && <ArrowUpRight className="mr-2 size-4" />}
                    {action === 'rebalance' && <RotateCw className="mr-2 size-4" />}
                    {action === 'deposit'
                      ? 'Deposit ETH'
                      : action === 'withdraw'
                        ? 'Redeem shares'
                        : 'Rebalance'}
                  </>
                )}
              </Button>
            )}
          </div>

          {hash && (
            <a
              href={`${EXPLORER_URL}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block truncate text-center text-[11px] text-muted-foreground hover:text-primary"
            >
              {hash.slice(0, 12)}…{hash.slice(-8)}
            </a>
          )}
        </div>

        <div className="panel p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl">Basket</h3>
            <span className="numeric text-xs text-muted-foreground">
              {vault?.tokens.length ?? 0} names
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {vault?.tokens.map((token, index) => {
              const weight = vault.weights[index] ?? 0
              return (
                <div key={token}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="numeric text-muted-foreground">
                      {token.slice(0, 6)}…{token.slice(-4)}
                    </span>
                    <span className="numeric">{(weight * 100).toFixed(2)}%</span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary/80"
                      style={{ width: `${Math.min(weight * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {(!vault || vault.tokens.length === 0) && (
              <p className="text-sm text-muted-foreground">
                Basket data is not available from this vault.
              </p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/70 pt-5 text-sm">
            <div>
              <p className="eyebrow">Creator</p>
              <p className="mt-1.5 text-xs">{shortAddress(vault?.creator)}</p>
            </div>
            <div>
              <p className="eyebrow">Supply</p>
              <p className="numeric mt-1.5 text-xs">{formatEth(totalSupply, 4)} shares</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
