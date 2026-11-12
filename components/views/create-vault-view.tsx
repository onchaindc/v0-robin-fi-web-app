'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { decodeEventLog, parseEther } from 'viem'
import { ArrowLeft, ArrowRight, Check, Info, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FACTORY_ABI, FACTORY_ADDRESS, STOCK_TOKENS, isFactoryConfigured } from '@/lib/contracts'
import { robinhoodChain } from '@/lib/chain'
import { cn } from '@/lib/utils'

interface CreateVaultViewProps {
  onCreated?: (vaultAddress: string) => void
}

type AllocationMode = 'equal' | 'custom'

const STEPS = ['Details', 'Basket', 'Review'] as const

export function CreateVaultView({ onCreated }: CreateVaultViewProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [step, setStep] = useState(0)

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<string[]>(['TSLA', 'AMZN', 'NFLX'])
  const [mode, setMode] = useState<AllocationMode>('equal')
  const [customWeights, setCustomWeights] = useState<Record<string, string>>({})
  const [initialDeposit, setInitialDeposit] = useState('')
  const [formError, setFormError] = useState('')

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const wrongChain = isConnected && chainId !== robinhoodChain.id

  const weightedTokens = useMemo(() => {
    if (selected.length === 0) return []

    if (mode === 'equal') {
      const base = Math.floor(10_000 / selected.length)
      const remainder = 10_000 - base * selected.length
      return selected.map((token, index) => ({
        symbol: token,
        bps: base + (index === 0 ? remainder : 0),
      }))
    }

    return selected.map((token) => ({
      symbol: token,
      bps: Math.round(Number.parseFloat(customWeights[token] ?? '0') * 100) || 0,
    }))
  }, [selected, mode, customWeights])

  const totalBps = weightedTokens.reduce((sum, token) => sum + token.bps, 0)

  useEffect(() => {
    if (!isSuccess || !receipt) return

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: FACTORY_ABI,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === 'VaultCreated') {
          onCreated?.(decoded.args.vault)
          break
        }
      } catch {
        // Not a factory event, keep scanning.
      }
    }
  }, [isSuccess, receipt, onCreated])

  const toggleToken = (symbol: string) => {
    setSelected((previous) =>
      previous.includes(symbol)
        ? previous.filter((item) => item !== symbol)
        : [...previous, symbol].slice(0, 5),
    )
  }

  const customValid =
    mode === 'equal' ||
    (totalBps === 10_000 && weightedTokens.every((token) => token.bps > 0))

  const canContinue =
    step === 0
      ? name.trim().length > 0 && symbol.trim().length > 0
      : step === 1
        ? selected.length > 0 && customValid
        : true

  const distributeEvenly = () => {
    if (selected.length === 0) return
    const base = Math.floor(10_000 / selected.length)
    const remainder = 10_000 - base * selected.length
    const next: Record<string, string> = {}
    selected.forEach((token, index) => {
      const bps = base + (index === 0 ? remainder : 0)
      next[token] = (bps / 100).toFixed(2)
    })
    setCustomWeights(next)
  }

  const handleNext = () => {
    if (!canContinue) return
    if (step < 2) {
      setStep(step + 1)
      return
    }
    submit()
  }

  const submit = () => {
    if (!isFactoryConfigured) return

    let deposit = 0n
    try {
      deposit = parseEther(initialDeposit || '0')
    } catch {
      setFormError('Enter a valid ETH amount for the initial deposit.')
      return
    }

    const tokens = weightedTokens
      .map((token) => STOCK_TOKENS.find((stock) => stock.symbol === token.symbol))
      .filter((token): token is (typeof STOCK_TOKENS)[number] => Boolean(token))

    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createVault',
      args: [
        name.trim(),
        symbol.trim().toUpperCase(),
        description.trim(),
        tokens.map((token) => token.address as `0x${string}`),
        weightedTokens.map((token) => BigInt(token.bps)),
      ],
      value: deposit,
    })
    setFormError('')
  }

  const isSubmitting = isPending || isConfirming

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <p className="eyebrow">Launch</p>
      <h2 className="display mt-3 text-4xl">Create a vault</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Define a basket, set the weights, and deploy a standard ERC-4626 index.
      </p>

      <ol className="mt-8 flex items-center gap-3 text-xs">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                'numeric grid size-6 shrink-0 place-items-center rounded-full border text-[11px]',
                index < step
                  ? 'border-primary bg-primary text-primary-foreground'
                  : index === step
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground',
              )}
            >
              {index < step ? <Check className="size-3" /> : index + 1}
            </span>
            <span className={index === step ? 'text-foreground' : 'text-muted-foreground'}>
              {label}
            </span>
            {index < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          handleNext()
        }}
        className="panel mt-6 space-y-6 p-7 sm:p-9"
      >
        {step === 0 && (
          <div className="space-y-6">
            <Field label="Vault name" hint="Shown in the marketplace">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tech Leaders Portfolio"
                maxLength={48}
                className="h-11 rounded-xl bg-background/60"
                required
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Share symbol" hint="Ticker for your vault shares">
                <Input
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                  placeholder="TECH"
                  maxLength={8}
                  className="h-11 rounded-xl bg-background/60 uppercase tracking-widest"
                  required
                />
              </Field>
              <Field label="Initial deposit" hint="Optional, in ETH">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.001"
                  min="0"
                  value={initialDeposit}
                  onChange={(event) => {
                    setInitialDeposit(event.target.value)
                    setFormError('')
                  }}
                  placeholder="0.0"
                  className="h-11 rounded-xl bg-background/60"
                />
              </Field>
            </div>

            <Field label="Description" hint="One line on the strategy">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Concentrated exposure to the companies defining the next decade."
                maxLength={160}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background/60 px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/50"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-7">
            <div>
              <Label className="text-sm font-medium">Select constituents</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to five tokenized stocks. {selected.length}/5 selected.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {STOCK_TOKENS.map((token) => {
                  const isSelected = selected.includes(token.symbol)
                  return (
                    <button
                      key={token.symbol}
                      type="button"
                      onClick={() => toggleToken(token.symbol)}
                      className={cn(
                        'rounded-xl border p-3.5 text-left transition-all',
                        isSelected
                          ? 'border-primary/60 bg-primary/[0.08]'
                          : 'border-border hover:border-primary/30',
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="numeric text-sm font-semibold tracking-wide">
                          {token.symbol}
                        </span>
                        {isSelected && <Check className="size-3.5 text-primary" />}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {token.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Allocation</Label>
              <div className="mt-3 inline-flex rounded-full border border-border p-1">
                {(['equal', 'custom'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMode(option)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                      mode === option
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {option === 'equal' ? 'Equal weight' : 'Custom'}
                  </button>
                ))}
              </div>

              {mode === 'custom' && (
                <div className="mt-5 space-y-3">
                  {selected.map((token) => (
                    <div key={token} className="flex items-center gap-3">
                      <span className="numeric w-16 text-sm">{token}</span>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={customWeights[token] ?? ''}
                          onChange={(event) =>
                            setCustomWeights((previous) => ({
                              ...previous,
                              [token]: event.target.value,
                            }))
                          }
                          placeholder="0"
                          className="h-10 rounded-lg bg-background/60 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={cn(
                        'numeric text-xs',
                        customValid ? 'text-primary' : 'text-accent',
                      )}
                    >
                      {totalBps / 100}% allocated ·{' '}
                      {totalBps !== 10_000
                        ? 'must total 100%'
                        : weightedTokens.some((token) => token.bps === 0)
                          ? 'every weight must be above 0%'
                          : 'balanced'}
                    </p>
                    <button
                      type="button"
                      onClick={distributeEvenly}
                      className="text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      Distribute evenly
                    </button>
                  </div>
                </div>
              )}

              {mode === 'equal' && selected.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {weightedTokens.map((token) => (
                    <span
                      key={token.symbol}
                      className="numeric rounded-md bg-secondary/60 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {token.symbol} {(token.bps / 100).toFixed(2)}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border/80 bg-background/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-2xl">{name || 'Untitled vault'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description || 'A tokenized equity basket.'}
                  </p>
                </div>
                <span className="numeric rounded-md border border-border px-2 py-1 text-[11px] tracking-widest text-muted-foreground">
                  {symbol || '—'}
                </span>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/70 pt-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="eyebrow">Constituents</dt>
                  <dd className="numeric mt-1">{selected.length}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Allocation</dt>
                  <dd className="mt-1 capitalize">{mode} weight</dd>
                </div>
                <div>
                  <dt className="eyebrow">Initial deposit</dt>
                  <dd className="numeric mt-1">{initialDeposit || '0'} ETH</dd>
                </div>
              </dl>

              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-secondary">
                {weightedTokens.map((token) => (
                  <span
                    key={token.symbol}
                    className="h-full bg-primary"
                    style={{ width: `${token.bps / 100}%` }}
                  />
                ))}
              </div>
            </div>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Deploying costs testnet gas. You can rebalance weights and deposit more later from
              the manage screen.
            </p>
          </div>
        )}

        {(formError || error) && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            {formError || error?.message.split('\n')[0]}
          </p>
        )}

        {!isFactoryConfigured && (
          <p className="flex items-start gap-2 rounded-lg border border-accent/25 bg-accent/[0.06] p-3 text-xs text-muted-foreground">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-accent" />
            The factory address is not configured, so a vault cannot be deployed from this build
            yet. Deploy the contracts, then set NEXT_PUBLIC_FACTORY_ADDRESS.
          </p>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || isSubmitting}
            className="rounded-full text-muted-foreground"
          >
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </Button>

          {wrongChain ? (
            <Button
              type="button"
              onClick={() => switchChain({ chainId: robinhoodChain.id })}
              className="rounded-full"
            >
              Switch to Robinhood Chain
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!canContinue || isSubmitting || !isFactoryConfigured}
              className="rounded-full px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isPending ? 'Confirm in wallet' : 'Deploying'}
                </>
              ) : step === 2 ? (
                'Deploy vault'
              ) : (
                <>
                  Continue <ArrowRight className="ml-1.5 size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {hash && (
        <p className="mt-4 truncate text-center text-xs text-muted-foreground">
          Transaction {hash.slice(0, 10)}…{hash.slice(-6)}
          {isSuccess ? ' confirmed' : ' submitted'}
        </p>
      )}
      {!isPending && !isConfirming && hash && !isSuccess && (
        <button
          type="button"
          onClick={() => reset()}
          className="mx-auto mt-2 block text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Start over
        </button>
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}
