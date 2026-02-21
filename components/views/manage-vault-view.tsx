'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface VaultDetails {
  id: string
  name: string
  balance: string
  apy: number
  rebalanceFrequency: string
}

export function ManageVaultView() {
  const { isConnected } = useAccount()
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedVault, setSelectedVault] = useState<VaultDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<'deposit' | 'withdraw' | 'rebalance'>('deposit')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const mockVaults: VaultDetails[] = [
    {
      id: '1',
      name: 'Stable Growth',
      balance: '$5,000.00',
      apy: 12.5,
      rebalanceFrequency: 'Monthly',
    },
    {
      id: '2',
      name: 'Yield Max',
      balance: '$2,500.00',
      apy: 28.3,
      rebalanceFrequency: 'Weekly',
    },
  ]

  const handleTransaction = async () => {
    if (!selectedVault || !amount) return

    setIsLoading(true)
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log(`[v0] ${action} transaction:`, {
      vault: selectedVault.name,
      amount,
    })

    setIsLoading(false)
    setAmount('')
  }

  if (!isHydrated || !isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-robin-gray-light mb-2">Manage Vault</h2>
          <p className="text-robin-gray">Deposit, withdraw, or rebalance your vault</p>
        </div>
        <div className="text-center py-12 bg-robin-darker rounded-lg border border-robin-gray-dark">
          <p className="text-robin-gray mb-4">Connect your wallet to manage vaults</p>
          <p className="text-robin-gray text-sm">Use the Connect Wallet button in the header to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-robin-gray-light mb-2">Manage Vault</h2>
        <p className="text-robin-gray">Deposit, withdraw, or rebalance your vault</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vault Selection */}
        <div>
          <Label className="text-robin-gray-light mb-3 block">Select Vault</Label>
          <div className="space-y-2">
            {mockVaults.map(vault => (
              <button
                key={vault.id}
                onClick={() => setSelectedVault(vault)}
                className={`w-full p-4 rounded border text-left transition-colors ${
                  selectedVault?.id === vault.id
                    ? 'bg-robin-teal border-robin-teal text-robin-dark'
                    : 'border-robin-gray-dark bg-robin-darker text-robin-gray-light hover:border-robin-teal'
                }`}
              >
                <div className="font-semibold">{vault.name}</div>
                <div className={`text-sm ${selectedVault?.id === vault.id ? 'text-robin-dark/70' : 'text-robin-gray'}`}>
                  {vault.balance}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Management Panel */}
        {selectedVault && (
          <div className="lg:col-span-2">
            {/* Vault Details */}
            <div className="bg-robin-darker border border-robin-gray-dark rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-robin-gray-light mb-4">{selectedVault.name}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-robin-gray-dark">
                <div>
                  <p className="text-robin-gray text-sm">Current Balance</p>
                  <p className="text-xl font-semibold text-robin-teal">{selectedVault.balance}</p>
                </div>
                <div>
                  <p className="text-robin-gray text-sm">APY</p>
                  <p className="text-xl font-semibold text-robin-teal">{selectedVault.apy}%</p>
                </div>
              </div>

              <div>
                <p className="text-robin-gray text-sm">Rebalance Frequency</p>
                <p className="text-robin-gray-light">{selectedVault.rebalanceFrequency}</p>
              </div>
            </div>

            {/* Action Tabs */}
            <div className="space-y-4">
              <div className="flex gap-2 mb-6">
                {(['deposit', 'withdraw', 'rebalance'] as const).map(act => (
                  <button
                    key={act}
                    onClick={() => setAction(act)}
                    className={`px-4 py-2 rounded font-semibold transition-colors ${
                      action === act
                        ? 'bg-robin-teal text-robin-dark'
                        : 'bg-robin-darker border border-robin-gray-dark text-robin-gray-light hover:border-robin-teal'
                    }`}
                  >
                    {act.charAt(0).toUpperCase() + act.slice(1)}
                  </button>
                ))}
              </div>

              {/* Action Form */}
              <div className="bg-robin-darker border border-robin-gray-dark rounded-lg p-6">
                {action !== 'rebalance' && (
                  <div className="mb-4">
                    <Label htmlFor="amount" className="text-robin-gray-light mb-2 block">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-robin-dark border-robin-gray-dark text-robin-gray-light placeholder:text-robin-gray"
                      step="0.01"
                      min="0"
                    />
                  </div>
                )}

                <Button
                  onClick={handleTransaction}
                  disabled={isLoading || (action !== 'rebalance' && !amount)}
                  className="w-full bg-robin-teal text-robin-dark hover:bg-robin-teal-light font-semibold py-6 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : action === 'deposit' ? (
                    <>
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      Deposit
                    </>
                  ) : action === 'withdraw' ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw
                    </>
                  ) : (
                    'Rebalance Vault'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!selectedVault && (
          <div className="lg:col-span-2 bg-robin-darker border border-robin-gray-dark rounded-lg p-8 text-center">
            <p className="text-robin-gray">Select a vault to manage</p>
          </div>
        )}
      </div>
    </div>
  )
}
