'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function CreateVaultView() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assets: [] as string[],
    initialDeposit: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('[v0] Creating vault:', formData)
    setIsLoading(false)
    setFormData({ name: '', description: '', assets: [], initialDeposit: '' })
  }

  const toggleAsset = (asset: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.includes(asset)
        ? prev.assets.filter(a => a !== asset)
        : [...prev.assets, asset]
    }))
  }

  const availableAssets = ['USDC', 'USDT', 'ETH', 'WBTC', 'DAI', 'AAVE']

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-robin-gray-light mb-2">Create New Vault</h2>
        <p className="text-robin-gray">Set up a new vault with your custom strategy</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-robin-darker border border-robin-gray-dark rounded-lg p-8">
        <div className="space-y-6">
          {/* Vault Name */}
          <div>
            <Label htmlFor="name" className="text-robin-gray-light mb-2 block">
              Vault Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., My Strategy"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-robin-dark border-robin-gray-dark text-robin-gray-light placeholder:text-robin-gray"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-robin-gray-light mb-2 block">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Describe your vault strategy"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-robin-dark border-robin-gray-dark text-robin-gray-light placeholder:text-robin-gray"
              required
            />
          </div>

          {/* Asset Selection */}
          <div>
            <Label className="text-robin-gray-light mb-3 block">
              Select Assets
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {availableAssets.map(asset => (
                <button
                  key={asset}
                  type="button"
                  onClick={() => toggleAsset(asset)}
                  className={`p-3 rounded border transition-colors ${
                    formData.assets.includes(asset)
                      ? 'bg-robin-teal border-robin-teal text-robin-dark'
                      : 'border-robin-gray-dark bg-robin-dark text-robin-gray-light hover:border-robin-teal'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Deposit */}
          <div>
            <Label htmlFor="deposit" className="text-robin-gray-light mb-2 block">
              Initial Deposit (Optional)
            </Label>
            <Input
              id="deposit"
              type="number"
              placeholder="0.00"
              value={formData.initialDeposit}
              onChange={(e) => setFormData(prev => ({ ...prev, initialDeposit: e.target.value }))}
              className="bg-robin-dark border-robin-gray-dark text-robin-gray-light placeholder:text-robin-gray"
              step="0.01"
              min="0"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.name || !formData.description || formData.assets.length === 0}
            className="w-full bg-robin-teal text-robin-dark hover:bg-robin-teal-light font-semibold py-6 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Vault...
              </>
            ) : (
              'Create Vault'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
