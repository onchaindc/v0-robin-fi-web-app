'use client'

import { useEffect, useState } from 'react'
import { walletName, type Eip1193Provider } from '@/lib/wallet'

export type DetectedWallet = {
  id: string
  name: string
  icon?: string
  rdns?: string
  provider: Eip1193Provider
}

type AnnounceDetail = {
  info: { uuid: string; name: string; icon: string; rdns: string }
  provider: Eip1193Provider
}

/** EIP-6963 multi-wallet discovery with a window.ethereum fallback. */
export function useDetectedWallets() {
  const [wallets, setWallets] = useState<DetectedWallet[]>([])

  useEffect(() => {
    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent<AnnounceDetail>).detail
      if (!detail?.info || !detail?.provider) return

      setWallets((previous) => {
        if (previous.some((wallet) => wallet.provider === detail.provider)) return previous
        return [
          ...previous,
          {
            id: detail.info.uuid,
            name: detail.info.name,
            icon: detail.info.icon,
            rdns: detail.info.rdns,
            provider: detail.provider,
          },
        ]
      })
    }

    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    // Older wallets only inject window.ethereum.
    const timer = setTimeout(() => {
      const injected = window.ethereum
      if (!injected) return
      setWallets((previous) =>
        previous.length > 0
          ? previous
          : [{ id: 'injected', name: walletName(injected), provider: injected }],
      )
    }, 120)

    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
      clearTimeout(timer)
    }
  }, [])

  return wallets
}
