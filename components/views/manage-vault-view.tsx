'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowUpRight, ArrowDownLeft, RotateCw, CheckCircle2, XCircle } from 'lucide-react'
import { VAULT_ABI } from '@/lib/contracts'

interface ManageVaultViewProps {
  vaultId: string
}

export function ManageVaultView({ vaultId }: ManageVaultViewProps) {
  const { address, isConnected } = useAccount()
  const [action, setAction] = useState<'deposit' | 'withdraw' | 'rebalance'>('deposit')
  const [amount, setAmount] = useState('')
  const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Read vault data
  const { data: vaultName } = useReadContract({
    address: vaultId as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'name',
  })

  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: vaultId as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: totalAssets } = useReadContract({
    address: vaultId as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
  })

  // Write contract hook
  const { writeContract, data: txHash, isPending } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Handle transaction success/error
  useState(() => {
    if (isSuccess) {
      setTxStatus('success')
      setAmount('')
      refetchBalance()
      setTimeout(() => setTxStatus('idle'), 3000)
    }
  })

  const handleTransaction = () => {
    if (!amount && action !== 'rebalance') return
    if (!address) return

    try {
      if (action === 'deposit') {
        writeContract({
          address: vaultId as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'deposit',
          args: [parseEther(amount), address],
          value: parseEther(amount),
        })
      } else if (action === 'withdraw') {
        writeContract({
          address: vaultId as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'redeem',
          args: [parseEther(amount), address, address],
        })
      } else if (action === 'rebalance') {
        writeContract({
          address: vaultId as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'rebalance',
        })
      }
    } catch (error) {
      console.error('Transaction error:', error)
      setTxStatus('error')
      setTimeout(() => setTxStatus('idle'), 3000)
    }
  }

  const isLoading = isPending || isConfirming

  if (!isConnected) {
    return (
      <div className="py-8">
        <div className="glass-card-dark p-12 rounded-2xl text-center">
          <p className="text-muted-foreground mb-4">Connect your wallet to manage vaults</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Success/Error Toast */}
      {txStatus !== 'idle' && (
        <div className={`fixed top-20 right-4 z-50 glass-card-dark p-4 rounded-xl border ${txStatus === 'success' ? 'border-primary' : 'border-destructive'
          } flex items-center gap-3`}>
          {txStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Transaction successful!</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-destructive" />
              <span>Transaction failed</span>
            </>
          )}
        </div>
      )}

      {/* Vault Header */}
      <div className="mb-8 pb-8 border-b border-border">
        <h2 className="text-3xl font-bold mb-2">{vaultName || 'Loading...'}</h2>
        <p className="text-muted-foreground mb-6">Vault ID: {vaultId.slice(0, 6)}...{vaultId.slice(-4)}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card-dark p-4 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
            <p className="text-2xl font-bold text-primary">
              {userBalance ? formatEther(userBalance as bigint) : '0'} shares
            </p>
          </div>
          <div className="glass-card-dark p-4 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Total Assets</p>
            <p className="text-2xl font-bold text-primary">
              {totalAssets ? formatEther(totalAssets as bigint) : '0'} ETH
            </p>
          </div>
          <div className="glass-card-dark p-4 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Your Value</p>
            <p className="text-2xl font-bold text-primary">
              {userBalance && totalAssets
                ? formatEther(((userBalance as bigint) * (totalAssets as bigint)) / BigInt(10 ** 18))
                : '0'} ETH
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="glass-card-dark p-6 rounded-2xl space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-4">Manage Position</h3>

              {/* Action Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(['deposit', 'withdraw', 'rebalance'] as const).map((actionType) => (
                  <button
                    key={actionType}
                    onClick={() => setAction(actionType)}
                    disabled={isLoading}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${action === actionType
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                  >
                    {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              {action !== 'rebalance' && (
                <div className="space-y-2 mb-4">
                  <Label htmlFor="amount">
                    Amount ({action === 'deposit' ? 'ETH' : 'Shares'})
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleTransaction}
                disabled={isLoading || (!amount && action !== 'rebalance')}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPending ? 'Sign in wallet...' : 'Confirming...'}
                  </>
                ) : (
                  <>
                    {action === 'deposit' && <ArrowDownLeft className="w-4 h-4" />}
                    {action === 'withdraw' && <ArrowUpRight className="w-4 h-4" />}
                    {action === 'rebalance' && <RotateCw className="w-4 h-4" />}
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card-dark p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-4">Portfolio Composition</h3>
            <div className="text-muted-foreground text-sm">
              Portfolio composition data will be available after contract deployment
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}