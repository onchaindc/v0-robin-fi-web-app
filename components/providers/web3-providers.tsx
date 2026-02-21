'use client'

import React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

// Create Wagmi config with Robinhood Testnet
const config = createConfig({
  chains: [
    {
      id: 2020,
      name: 'Robinhood Testnet',
      nativeCurrency: { name: 'XRD', symbol: 'XRD', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://babylon-testnet.rpc.radixdlt.com:443/'] },
      },
      blockExplorers: {
        default: { name: 'Radix Explorer', url: 'https://testnet.radixscan.io' },
      },
    },
  ] as const,
  transports: {
    2020: http('https://babylon-testnet.rpc.radixdlt.com:443/'),
  },
})

const queryClient = new QueryClient()

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
