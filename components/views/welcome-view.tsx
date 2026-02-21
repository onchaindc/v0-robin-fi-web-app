'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { TrendingUp, BarChart3, Lock } from 'lucide-react'

export function WelcomeView() {
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 pt-12">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-primary to-robin-pink bg-clip-text text-transparent">
            Diversify Your Portfolio in One Click
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Deposit ETH and get instant exposure to tokenized stocks on Robinhood Chain
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card-dark p-6 rounded-2xl">
              <p className="text-2xl font-bold text-primary mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Trading</p>
            </div>
            <div className="glass-card-dark p-6 rounded-2xl">
              <p className="text-2xl font-bold text-primary mb-2">5</p>
              <p className="text-sm text-muted-foreground">Stock Tokens</p>
            </div>
            <div className="glass-card-dark p-6 rounded-2xl">
              <p className="text-2xl font-bold text-primary mb-2">ERC-4626</p>
              <p className="text-sm text-muted-foreground">Standard</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-12">
            <ConnectButton />
          </div>

          <p className="text-sm text-muted-foreground">
            Built on Arbitrum • Robinhood Chain Testnet
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card-dark p-8 rounded-3xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Diversification</h3>
            <p className="text-muted-foreground">
              Get exposure to TSLA, AMZN, NFLX, PLTR, and AMD in a single transaction
            </p>
          </div>

          <div className="glass-card-dark p-8 rounded-3xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Auto-Rebalancing</h3>
            <p className="text-muted-foreground">
              Vaults automatically rebalance to maintain your desired allocation
            </p>
          </div>

          <div className="glass-card-dark p-8 rounded-3xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">DeFi Composability</h3>
            <p className="text-muted-foreground">
              Use vault shares in other DeFi protocols for additional yield
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
