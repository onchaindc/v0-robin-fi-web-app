'use client'

import React, { useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  rabbyWallet,
  zerionWallet,
  trustWallet,
  injectedWallet,
  braveWallet,
  okxWallet,
  phantomWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets'
import '@rainbow-me/rainbowkit/styles.css'
import { ThemeProvider, useTheme } from './theme-provider'
import { robinhoodChain } from '@/lib/chain'

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
  ''

/**
 * Most RainbowKit wallets connect over WalletConnect. Registering them with a
 * placeholder project ID makes every attempt fail with a generic RPC error, so
 * only expose injected wallets until a real project ID is configured.
 */
const connectors = projectId
  ? connectorsForWallets(
      [
        {
          groupName: 'Popular',
          wallets: [
            metaMaskWallet,
            rabbyWallet,
            rainbowWallet,
            zerionWallet,
            coinbaseWallet,
            trustWallet,
          ],
        },
        {
          groupName: 'More',
          wallets: [
            injectedWallet,
            okxWallet,
            braveWallet,
            phantomWallet,
            ledgerWallet,
            walletConnectWallet,
          ],
        },
      ],
      { appName: 'RobinFi', projectId },
    )
  : connectorsForWallets([{ groupName: 'Installed', wallets: [injectedWallet] }], {
      appName: 'RobinFi',
      projectId,
    })

const config = createConfig({
  connectors,
  chains: [robinhoodChain],
  transports: {
    [robinhoodChain.id]: http(
      process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ??
        robinhoodChain.rpcUrls.default.http[0],
    ),
  },
  ssr: true,
})

function RainbowKitWithTheme({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  const rkTheme =
    theme === 'light'
      ? lightTheme({
          accentColor: '#22c55e',
          accentColorForeground: '#000',
          borderRadius: 'medium',
        })
      : darkTheme({
          accentColor: '#22c55e',
          accentColorForeground: '#000',
          borderRadius: 'medium',
        })

  return <RainbowKitProvider theme={rkTheme}>{children}</RainbowKitProvider>
}

export function Web3Providers({ children }: { children: React.ReactNode }) {
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
        <QueryClientProvider client={queryClient}>
          <RainbowKitWithTheme>{children}</RainbowKitWithTheme>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
