import { defineChain } from 'viem'

/**
 * Robinhood Chain testnet. Chain ID, RPC and explorer are the network's public
 * testnet endpoints; override the RPC with NEXT_PUBLIC_ROBINHOOD_RPC_URL if the
 * network publishes a new one.
 */
export const robinhoodChain = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ?? 'https://rpc.testnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Chain Explorer',
      url: 'https://explorer.testnet.chain.robinhood.com',
    },
  },
  testnet: true,
})

export const EXPLORER_URL = robinhoodChain.blockExplorers.default.url
