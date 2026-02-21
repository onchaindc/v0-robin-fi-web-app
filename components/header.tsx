'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="border-b border-robin-gray-dark bg-robin-darker">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-robin-teal flex items-center justify-center">
            <span className="font-serif font-bold text-robin-dark">R</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-robin-teal">RobinFi</h1>
        </div>
        <ConnectButton />
      </div>
    </header>
  )
}
