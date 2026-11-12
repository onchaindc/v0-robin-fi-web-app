import { createConnector } from 'wagmi'
import { numberToHex, type Address } from 'viem'
import { robinhoodChain } from './chain'
import type { Eip1193Provider } from './wallet'
import type { EthereumProvider as WalletConnectProviderClass } from '@walletconnect/ethereum-provider'

type WCProvider = Awaited<ReturnType<typeof WalletConnectProviderClass.init>>

export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

let uriHandler: ((uri?: string) => void) | undefined

/** The connect modal uses this to render its own QR code. */
export function setWalletConnectUriHandler(handler?: (uri?: string) => void) {
  uriHandler = handler
}

const metadata = {
  name: 'RobinFi',
  description: 'Tokenized equity index vaults on Robinhood Chain',
  url: 'https://robinfi.app',
  icons: [] as string[],
}

export const walletConnectConnector = createConnector((config) => {
  let providerPromise: Promise<WCProvider> | undefined
  let accounts: readonly Address[] = []
  let chainId: number = robinhoodChain.id

  async function getWalletConnectProvider(): Promise<WCProvider> {
    if (!providerPromise) {
      providerPromise = (async () => {
        const { EthereumProvider } = await import('@walletconnect/ethereum-provider')

        const provider = await EthereumProvider.init({
          projectId: walletConnectProjectId ?? '',
          chains: [robinhoodChain.id],
          optionalChains: [],
          showQrModal: false,
          rpcMap: {
            [robinhoodChain.id]: robinhoodChain.rpcUrls.default.http[0],
          },
          metadata: {
            ...metadata,
            url: typeof window !== 'undefined' ? window.location.origin : metadata.url,
          },
        })

        provider.on('display_uri', (uri: string) => uriHandler?.(uri))
        provider.on('accountsChanged', (next: string[]) => {
          accounts = next as Address[]
          config.emitter.emit('change', { accounts })
        })
        provider.on('chainChanged', (next: string) => {
          chainId = Number(next)
          config.emitter.emit('change', { chainId })
        })
        provider.on('disconnect', () => {
          accounts = []
          uriHandler?.(undefined)
          config.emitter.emit('disconnect')
        })

        return provider
      })()
    }

    return providerPromise
  }

  return {
    id: 'walletConnect',
    name: 'WalletConnect',
    type: 'walletConnect',

    async connect<withCapabilities extends boolean = false>({
      chainId: targetChainId,
      withCapabilities,
    }: { chainId?: number; withCapabilities?: boolean | withCapabilities } = {}) {
      const provider = await getWalletConnectProvider()
      await provider.connect({
        chains: [targetChainId ?? robinhoodChain.id],
        rpcMap: {
          [robinhoodChain.id]: robinhoodChain.rpcUrls.default.http[0],
        },
      })

      accounts = (provider.accounts ?? []) as Address[]
      chainId = Number(provider.chainId ?? robinhoodChain.id)

      const result: {
        accounts:
          | readonly { address: Address; capabilities: Record<string, unknown> }[]
          | readonly Address[]
        chainId: number
      } = {
        accounts: withCapabilities
          ? accounts.map((address) => ({ address, capabilities: {} }))
          : accounts,
        chainId,
      }

      return result as {
        accounts: withCapabilities extends true
          ? readonly { address: Address; capabilities: Record<string, unknown> }[]
          : readonly Address[]
        chainId: number
      }
    },

    async disconnect() {
      const provider = await getWalletConnectProvider()
      await provider.disconnect()
      accounts = []
      uriHandler?.(undefined)
    },

    async getAccounts() {
      const provider = await getWalletConnectProvider()
      return (provider.accounts ?? accounts) as readonly Address[]
    },

    async getChainId() {
      const provider = await getWalletConnectProvider()
      return Number(provider.chainId ?? chainId)
    },

    async getProvider() {
      const provider = await getWalletConnectProvider()
      return provider as unknown as Eip1193Provider
    },

    async isAuthorized() {
      if (!providerPromise) return false
      const provider = await getWalletConnectProvider()
      return Boolean(provider.session && (provider.accounts?.length ?? 0) > 0)
    },

    async switchChain({ chainId: target }) {
      const provider = await getWalletConnectProvider()
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: numberToHex(target) }],
      })
      chainId = target
      config.emitter.emit('change', { chainId: target })
      const chain = config.chains.find((item) => item.id === target)
      if (!chain) throw new Error(`Chain ${target} is not configured`)
      return chain
    },

    onAccountsChanged(next) {
      accounts = next as Address[]
      config.emitter.emit('change', { accounts: accounts })
    },

    onChainChanged(next) {
      chainId = Number(next)
      config.emitter.emit('change', { chainId })
    },

    onDisconnect() {
      accounts = []
      config.emitter.emit('disconnect')
    },
  }
})
