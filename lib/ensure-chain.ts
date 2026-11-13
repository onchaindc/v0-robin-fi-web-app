import { numberToHex } from 'viem'
import { robinhoodChain } from './chain'

type Eip1193Provider = {
  request: (args: { method: string; params?: readonly unknown[] | object }) => Promise<unknown>
}

function injectedProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as { ethereum?: Eip1193Provider }).ethereum
}

/**
 * Switches to Robinhood Chain, adding it to the wallet first when the wallet
 * has never seen it. Plain wallet_switchEthereumChain fails with 4902 for
 * unknown chains, which wallets surface as a generic RPC error.
 */
export async function ensureRobinhoodChain(provider?: Eip1193Provider) {
  const target = provider ?? injectedProvider()
  if (!target) return false

  try {
    await target.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: numberToHex(robinhoodChain.id) }],
    })
  } catch (error) {
    if ((error as { code?: number })?.code !== 4902) throw error

    await target.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: numberToHex(robinhoodChain.id),
          chainName: robinhoodChain.name,
          nativeCurrency: robinhoodChain.nativeCurrency,
          rpcUrls: [...robinhoodChain.rpcUrls.default.http],
          blockExplorerUrls: [robinhoodChain.blockExplorers.default.url],
        },
      ],
    })
  }

  return true
}
