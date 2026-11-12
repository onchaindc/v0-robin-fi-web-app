'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { TrendingUp, Vote, Globe } from 'lucide-react'

export function WelcomeView() {
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 pt-12">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-primary to-robin-pink bg-clip-text text-transparent">
            Ownership + Voice on Robinhood Chain
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            One-click diversified exposure to Stock Tokens. Holding assets is only half of ownership — use $WIF to have a real voice in what gets built next.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card-dark p-6 rounded-2xl">
              <p className="text-2xl font-bold text-primary mb-2">4663</p>
              <p className="text-sm text-muted-foreground">Robinhood Chain</p>
            </div>
            <div className="glass-card-dark p-6 rounded-2xl">
              <p className="text-2xl font-bold text-primary mb-2">$WIF</p>
              <p className="text-sm text-muted-foreground">Vote & Burn</p>
            </div>
            <div className="glass-card-dark p-6 rounded-2xl">
              <p className="text-2xl font-bold text-primary mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Stock Tokens</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-12">
            <ConnectButton />
          </div>

          <p className="text-sm text-muted-foreground">
            Built for the World Is Flat Hackathon • $10k prizes • Talent is everywhere
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card-dark p-8 rounded-3xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Stock Exposure</h3>
            <p className="text-muted-foreground">
              Deposit and get exposure to TSLA, AAPL, NVDA, AMZN and more Stock Tokens in one click.
            </p>
          </div>

          <div className="glass-card-dark p-8 rounded-3xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Vote className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Have a Voice</h3>
            <p className="text-muted-foreground">
              Use $WIF (0x5173...4773) to vote on World Is Fair events. Votes burn, activity grows the ecosystem.
            </p>
          </div>

          <div className="glass-card-dark p-8 rounded-3xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">World Is Flat</h3>
            <p className="text-muted-foreground">
              Where you’re born shouldn’t limit what you build. Opportunity on equal ground.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
