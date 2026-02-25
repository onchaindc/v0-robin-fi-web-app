'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowUpRight, ArrowDownLeft, RotateCw } from 'lucide-react'

interface ManageVaultViewProps {
  vaultId: string
}

interface VaultDetails {
  id: string
  name: string
  description: string
  balance: string
  apy: number
  tvl: string
  assets: string[]
}

const VAULT_DATA: Record<string, VaultDetails> = {
  '1': {
    id: '1',
    name: 'Tech Diversified',
    description: 'Exposure to TSLA, AMZN, NFLX',
    balance: '$12,500',
    apy: 15.2,
    tvl: '$4.2M',
    assets: ['TSLA', 'AMZN', 'NFLX'],
  },
  '2': {
    id: '2',
    name: 'Growth Portfolio',
    description: 'PLTR, AMD, and balanced assets',
    balance: '$8,750',
    apy: 22.8,
    tvl: '$2.8M',
    assets: ['PLTR', 'AMD', 'TSLA'],
  },
  'tech-leaders': {
    id: 'tech-leaders',
    name: 'Tech Leaders',
    description: 'TSLA, AMZN, NFLX exposure',
    balance: '$0',
    apy: 18.5,
    tvl: '$8.4M',
    assets: ['TSLA', 'AMZN', 'NFLX'],
  },
}

export function ManageVaultView({ vaultId }: ManageVaultViewProps) {
  const { isConnected } = useAccount()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<'deposit' | 'withdraw' | 'rebalance'>('deposit')
  const [amount, setAmount] = useState('')

  const vault = VAULT_DATA[vaultId]

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleTransaction = async () => {
    if (!amount) return

    setIsLoading(true)
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log(`[v0] ${action} transaction:`, {
      vault: vault.name,
      amount,
    })

    setIsLoading(false)
    setAmount('')
  }

  if (!isHydrated || !isConnected) {
    return (
      <div className="py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Manage Vault</h2>
          <p className="text-muted-foreground">Deposit, withdraw, or rebalance your vault</p>
        </div>
        <div className="glass-card-dark p-12 rounded-2xl text-center">
          <p className="text-muted-foreground mb-4">Connect your wallet to manage vaults</p>
          <p className="text-sm text-muted-foreground">Use the Connect Wallet button in the header to get started</p>
        </div>
      </div>
    )
  }

  if (!vault) {
    return (
      <div className="py-8">
        <div className="glass-card-dark p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">Vault not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Vault Header */}
      <div className="mb-8 pb-8 border-b border-border">
        <h2 className="text-3xl font-bold mb-2">{vault.name}</h2>
        <p className="text-muted-foreground mb-6">{vault.description}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card-dark p-4 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
            <p className="text-2xl font-bold text-primary">{vault.balance}</p>
          </div>
          <div className="glass-card-dark p-4 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">APY</p>
            <p className="text-2xl font-bold text-primary">{vault.apy}%</p>
          </div>
          <div className="glass-card-dark p-4 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Total TVL</p>
            <p className="text-2xl font-bold text-primary">{vault.tvl}</p>
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
                  <Label htmlFor="amount" className="text-foreground">
                    Amount ({action === 'deposit' ? 'ETH' : 'Shares'})
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="glass-card border-border"
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
                    Processing...
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
            <div className="space-y-3">
              {vault.assets.map((asset) => (
                <div key={asset} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <span className="font-medium">{asset}</span>
                  <span className="text-sm text-muted-foreground">{Math.round(100 / vault.assets.length)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
