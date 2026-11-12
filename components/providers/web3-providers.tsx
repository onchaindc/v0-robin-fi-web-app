'use client'

import React, { useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { robinhoodChain } from '@/lib/chain'
import { injectedConnector } from '@/lib/wallet'

const config = createConfig({
  chains: [robinhoodChain],
  connectors: [injectedConnector],
  transports: {
    [robinhoodChain.id]: http(
      process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ?? 'https://rpc.testnet.chain.robinhood.com',
    ),
  },
  ssr: true,
})

export function Web3Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient per app instance, created lazily on the client.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  )

  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
