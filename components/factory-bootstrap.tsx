'use client'

import { useEffect, useState } from 'react'
import {
  useAccount,
  useChainId,
  useDeployContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { CheckCircle2, Copy, ExternalLink, Loader2, Rocket, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FACTORY_ABI } from '@/lib/contracts'
import { FACTORY_BYTECODE } from '@/lib/factory-bytecode'
import { saveFactoryAddress, useFactoryAddress } from '@/hooks/use-factory'
import { EXPLORER_URL, robinhoodChain } from '@/lib/chain'
import { cn } from '@/lib/utils'

export function FactoryBootstrap({ className }: { className?: string }) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const factory = useFactoryAddress()

  const { deployContract, data: hash, isPending, error, reset } = useDeployContract()
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const [deployed, setDeployed] = useState<`0x${string}` | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!receipt?.contractAddress) return
    setDeployed(receipt.contractAddress)
    saveFactoryAddress(receipt.contractAddress)
  }, [receipt])

  const wrongChain = isConnected && chainId !== robinhoodChain.id
  const busy = isPending || isConfirming

  const deploy = () => {
    deployContract({ abi: FACTORY_ABI, bytecode: FACTORY_BYTECODE, args: [] })
  }

  const copy = async () => {
    if (!deployed) return
    try {
      await navigator.clipboard.writeText(deployed)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be blocked.
    }
  }

  if (factory) return null

  if (deployed) {
    return (
      <div className={cn('panel flex items-start gap-3 p-4', className)}>
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-medium">RobinFi is live on this browser.</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Vault creation, deposits and management are now enabled. Factory{' '}
            <span className="numeric text-foreground">{deployed.slice(0, 8)}…{deployed.slice(-6)}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
            >
              <Copy className="size-3" /> {copied ? 'Copied' : 'Copy address'}
            </button>
            <a
              href={`${EXPLORER_URL}/address/${deployed}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="size-3" /> Explorer
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('panel flex flex-col gap-3 border-accent/25 bg-accent/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
          <Rocket className="size-4" />
        </span>
        <div className="text-sm">
          <p className="font-medium">Activate RobinFi on this network</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            One signature deploys the vault factory, which turns on creation, deposits and
            management. You pay testnet gas.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        {wrongChain ? (
          <Button
            type="button"
            onClick={() => switchChain({ chainId: robinhoodChain.id })}
            className="rounded-full"
          >
            Switch network
          </Button>
        ) : (
          <Button
            type="button"
            onClick={deploy}
            disabled={!isConnected || busy}
            className="rounded-full"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {isPending ? 'Confirm in wallet' : 'Deploying'}
              </>
            ) : (
              'Deploy factory'
            )}
          </Button>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-[11px] text-destructive">
            <TriangleAlert className="size-3 shrink-0" />
            {error.message.split('\n')[0]}
          </p>
        )}

        {hash && !error && (
          <button
            type="button"
            onClick={() => reset()}
            className="text-[11px] text-muted-foreground underline-offset-4 hover:underline"
          >
            {isConfirming ? 'Confirming…' : 'Transaction sent · start over'}
          </button>
        )}
      </div>
    </div>
  )
}
