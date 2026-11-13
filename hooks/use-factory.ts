'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'robinfi.factory'
const ENV_FACTORY = process.env.NEXT_PUBLIC_FACTORY_ADDRESS

const listeners = new Set<() => void>()

function isValidAddress(value?: string | null): value is `0x${string}` {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value))
}

function storedFactory(): `0x${string}` | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return isValidAddress(value) ? value : null
  } catch {
    return null
  }
}

function envFactory(): `0x${string}` | null {
  return isValidAddress(ENV_FACTORY) ? ENV_FACTORY : null
}

export function saveFactoryAddress(address: `0x${string}`) {
  try {
    window.localStorage.setItem(STORAGE_KEY, address)
  } catch {
    // Storage can be blocked in private modes.
  }
  listeners.forEach((listener) => listener())
}

/** Factory address for this browser: user-deployed override, then build config. */
export function useFactoryAddress(): `0x${string}` | null {
  const [factory, setFactory] = useState<`0x${string}` | null>(() => envFactory())

  useEffect(() => {
    const sync = () => setFactory(storedFactory() ?? envFactory())

    sync()
    listeners.add(sync)
    window.addEventListener('storage', sync)
    return () => {
      listeners.delete(sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return factory
}
