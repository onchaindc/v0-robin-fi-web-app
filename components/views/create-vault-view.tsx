'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check } from 'lucide-react'

const STOCK_TOKENS = ['TSLA', 'AMZN', 'NFLX', 'PLTR', 'AMD']

export function CreateVaultView() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    assets: [] as string[],
    allocation: 'equal' as 'equal' | 'custom',
    initialDeposit: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('[v0] Creating vault:', formData)
    setIsLoading(false)
    setFormData({ name: '', symbol: '', description: '', assets: [], allocation: 'equal', initialDeposit: '' })
    setStep(1)
  }

  const toggleAsset = (asset: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.includes(asset)
        ? prev.assets.filter(a => a !== asset)
        : [...prev.assets, asset].slice(0, 5)
    }))
  }

  const isStepValid = () => {
    if (step === 1) return formData.name && formData.symbol
    if (step === 2) return formData.assets.length > 0
    return true
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Create New Vault</h2>
          <p className="text-muted-foreground">
            Step {step} of 3: {step === 1 ? 'Vault Details' : step === 2 ? 'Select Assets' : 'Review & Deploy'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-dark p-8 rounded-2xl space-y-6">
          {/* Step 1: Vault Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-foreground mb-2 block font-medium">
                  Vault Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Tech Leaders Portfolio"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-card border-border"
                  required
                />
              </div>

              <div>
                <Label htmlFor="symbol" className="text-foreground mb-2 block font-medium">
                  Vault Symbol
                </Label>
                <Input
                  id="symbol"
                  placeholder="e.g., TECH"
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  maxLength={5}
                  className="glass-card border-border"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground mb-2 block font-medium">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Describe your vault strategy"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="glass-card border-border"
                />
              </div>
            </div>
          )}

          {/* Step 2: Asset Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-foreground mb-3 block font-medium">
                  Select Stock Tokens ({formData.assets.length}/5)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {STOCK_TOKENS.map(asset => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => toggleAsset(asset)}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        formData.assets.includes(asset)
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'border-border bg-muted/10 text-foreground hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{asset}</span>
                        {formData.assets.includes(asset) && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-foreground mb-3 block font-medium">
                  Allocation Strategy
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['equal', 'custom'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, allocation: type }))}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        formData.allocation === type
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'border-border bg-muted/10 text-foreground hover:border-primary/50'
                      }`}
                    >
                      {type === 'equal' ? 'Equal Weight' : 'Custom'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/20 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vault Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium">{formData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assets</span>
                  <span className="font-medium">{formData.assets.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allocation</span>
                  <span className="font-medium">{formData.allocation === 'equal' ? 'Equal Weight' : 'Custom'}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="initialDeposit" className="text-foreground mb-2 block font-medium">
                  Initial Deposit (Optional)
                </Label>
                <Input
                  id="initialDeposit"
                  type="number"
                  placeholder="0.0 ETH"
                  value={formData.initialDeposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialDeposit: e.target.value }))}
                  className="glass-card border-border"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !isStepValid()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {step === 3 ? 'Creating...' : 'Next...'}
                </>
              ) : (
                step === 3 ? 'Create Vault' : 'Next'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
