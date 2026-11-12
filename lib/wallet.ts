import { createConnector } from 'wagmi'
import { numberToHex, type Address } from 'viem'
import { robinhoodChain } from './chain'

type RequestArguments = {
  method: string
  params?: readonly unknown[] | object
}

export type Eip1193Provider = {
  request: (args: RequestArguments) => Promise<unknown>
  on?: (event: string, listener: (...args: never[]) => void) => void
  removeListener?: (event: string, listener: (...args: never[]) => void) => void
  isMetaMask?: boolean
  isRabby?: boolean
  isBraveWallet?: boolean
  isCoinbaseWallet?: boolean
  providers?: Eip1193Provider[]
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

function getInjectedProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined
  return window.ethereum
}

export function walletName(provider?: Eip1193Provider): string {
  if (!provider) return 'Browser wallet'
  if (provider.isRabby) return 'Rabby'
  if (provider.isBraveWallet) return 'Brave Wallet'
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet'
  if (provider.isMetaMask) return 'MetaMask'
  return 'Browser wallet'
}

export const injectedConnector = createConnector((config) => {
  let accounts: readonly Address[] = []
  let chainId: number | undefined

  async function requireProvider(): Promise<Eip1193Provider> {
    const provider = getInjectedProvider()
    if (!provider) {
      throw new Error('No browser wallet detected. Install MetaMask or another EIP-1193 wallet.')
    }
    return provider
  }

  async function switchTo(target: number) {
    const provider = await requireProvider()
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: numberToHex(target) }],
      })
    } catch (error) {
      const code = (error as { code?: number }).code
      if (code !== 4902) throw error
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: numberToHex(robinhoodChain.id),
            chainName: robinhoodChain.name,
            nativeCurrency: robinhoodChain.nativeCurrency,
            rpcUrls: [robinhoodChain.rpcUrls.default.http[0]],
            blockExplorerUrls: [robinhoodChain.blockExplorers.default.url],
          },
        ],
      })
    }
  }

  return {
    id: 'injected',
    name: 'Browser wallet',
    type: 'injected',

    async setup() {
      const provider = getInjectedProvider()
      if (!provider?.on) return

      const onAccountsChanged = (next: never[]) => {
        const list = next as unknown as Address[]
        accounts = list
        if (list.length === 0) {
          config.emitter.emit('disconnect')
        } else {
          config.emitter.emit('change', { accounts: list })
        }
      }
      const onChainChanged = (next: never) => {
        const id = Number(next)
        chainId = id
        config.emitter.emit('change', { chainId: id })
      }
      const onDisconnect = () => {
        accounts = []
        config.emitter.emit('disconnect')
      }

      provider.on('accountsChanged', onAccountsChanged)
      provider.on('chainChanged', onChainChanged)
      provider.on('disconnect', onDisconnect)
    },

    async connect<withCapabilities extends boolean = false>({
      chainId: targetChainId,
      withCapabilities,
    }: { chainId?: number; withCapabilities?: boolean | withCapabilities } = {}) {
      const provider = await requireProvider()

      accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as Address[]

      chainId = Number(await provider.request({ method: 'eth_chainId' }))

      const wanted = targetChainId ?? robinhoodChain.id
      if (wanted && wanted !== chainId) {
        await switchTo(wanted)
        chainId = wanted
      }

      const result: {
        accounts: readonly { address: Address; capabilities: Record<string, unknown> }[] | readonly Address[]
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

    async switchChain({ chainId: target }) {
      await switchTo(target)
      chainId = target
      config.emitter.emit('change', { chainId: target })
      const chain = config.chains.find((item) => item.id === target)
      if (!chain) throw new Error(`Chain ${target} is not configured`)
      return chain
    },

    async disconnect() {
      accounts = []
      chainId = undefined
    },

    async getAccounts() {
      return accounts
    },

    async getChainId() {
      if (chainId) return chainId
      const provider = getInjectedProvider()
      if (!provider) return robinhoodChain.id
      const id = Number(await provider.request({ method: 'eth_chainId' }))
      chainId = id
      return id
    },

    async getProvider() {
      return requireProvider()
    },

    async isAuthorized() {
      const provider = getInjectedProvider()
      if (!provider) return false
      try {
        const existing = (await provider.request({ method: 'eth_accounts' })) as Address[]
        accounts = existing
        return existing.length > 0
      } catch {
        return false
      }
    },

    onAccountsChanged(next) {
      accounts = next as Address[]
      config.emitter.emit('change', { accounts: accounts })
    },

    onChainChanged(next) {
      chainId = Number(next)
      config.emitter.emit('change', { chainId: Number(next) })
    },

    onDisconnect() {
      accounts = []
      config.emitter.emit('disconnect')
    },
  }
})
