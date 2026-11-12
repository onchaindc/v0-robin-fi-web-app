'use client'

import { useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import {
  BPS_DENOMINATOR,
  FACTORY_ABI,
  FACTORY_ADDRESS,
  VAULT_ABI,
  isFactoryConfigured,
} from '@/lib/contracts'

export type VaultSummary = {
  address: `0x${string}`
  name: string
  symbol: string
  description: string
  creator: `0x${string}`
  totalAssets: bigint
  totalSupply: bigint
  tokens: `0x${string}`[]
  weights: number[]
  balance: bigint
}

export function useAllVaultAddresses() {
  const query = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getAllVaults',
    query: { enabled: isFactoryConfigured, staleTime: 0 },
  })

  return {
    addresses: (query.data ?? []) as `0x${string}`[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export function useCreatorVaultAddresses(creator?: `0x${string}`) {
  const query = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getVaultsByCreator',
    args: creator ? [creator] : undefined,
    query: { enabled: isFactoryConfigured && Boolean(creator), staleTime: 0 },
  })

  return {
    addresses: (query.data ?? []) as `0x${string}`[],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

/** Reads metadata, NAV and the connected account's share balance for each vault. */
export function useVaultSummaries(addresses: readonly `0x${string}`[], account?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: addresses.flatMap((address) => [
      { address, abi: VAULT_ABI, functionName: 'name' as const },
      { address, abi: VAULT_ABI, functionName: 'symbol' as const },
      { address, abi: VAULT_ABI, functionName: 'description' as const },
      { address, abi: VAULT_ABI, functionName: 'creator' as const },
      { address, abi: VAULT_ABI, functionName: 'totalAssets' as const },
      { address, abi: VAULT_ABI, functionName: 'totalSupply' as const },
      { address, abi: VAULT_ABI, functionName: 'basket' as const },
      {
        address,
        abi: VAULT_ABI,
        functionName: 'balanceOf' as const,
        args: [account ?? '0x0000000000000000000000000000000000000000'] as const,
      },
    ]),
    query: { enabled: addresses.length > 0 },
  })

  const vaults = useMemo<VaultSummary[]>(() => {
    if (!data) return []

    return addresses.flatMap((address, index) => {
      const offset = index * 8
      const name = data[offset]?.result as string | undefined
      if (!name) return []
      const symbol = (data[offset + 1]?.result as string | undefined) ?? 'VLT'

      const basket = data[offset + 6]?.result as
        | readonly [`0x${string}`[], readonly bigint[]]
        | undefined

      return [
        {
          address,
          name,
          symbol,
          description: (data[offset + 2]?.result as string | undefined) ?? '',
          creator: (data[offset + 3]?.result as `0x${string}` | undefined) ?? address,
          totalAssets: (data[offset + 4]?.result as bigint | undefined) ?? 0n,
          totalSupply: (data[offset + 5]?.result as bigint | undefined) ?? 0n,
          tokens: (basket?.[0] ?? []) as `0x${string}`[],
          weights: (basket?.[1] ?? []).map((weight) => Number(weight) / BPS_DENOMINATOR),
          balance: (data[offset + 7]?.result as bigint | undefined) ?? 0n,
        },
      ]
    })
  }, [addresses, data])

  return { vaults, isLoading, refetch }
}

/** Reads a single vault's metadata and the account's position. */
export function useVault(address?: `0x${string}`, account?: `0x${string}`) {
  const contracts = address
    ? [
        { address, abi: VAULT_ABI, functionName: 'name' as const },
        { address, abi: VAULT_ABI, functionName: 'symbol' as const },
        { address, abi: VAULT_ABI, functionName: 'description' as const },
        { address, abi: VAULT_ABI, functionName: 'creator' as const },
        { address, abi: VAULT_ABI, functionName: 'totalAssets' as const },
        { address, abi: VAULT_ABI, functionName: 'totalSupply' as const },
        { address, abi: VAULT_ABI, functionName: 'basket' as const },
        {
          address,
          abi: VAULT_ABI,
          functionName: 'balanceOf' as const,
          args: [account ?? '0x0000000000000000000000000000000000000000'] as const,
        },
      ]
    : []

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: Boolean(address) },
  })

  // Memoised so consumers can safely depend on the object in effects.
  const vault = useMemo<VaultSummary | null>(() => {
    const basketData = data?.[6]?.result as
      | readonly [`0x${string}`[], readonly bigint[]]
      | undefined

    if (!address || !data?.[0]?.result) return null

    return {
      address,
      name: data[0].result as string,
      symbol: (data[1]?.result as string | undefined) ?? 'VLT',
      description: (data[2]?.result as string | undefined) ?? '',
      creator: (data[3]?.result as `0x${string}` | undefined) ?? address,
      totalAssets: (data[4]?.result as bigint | undefined) ?? 0n,
      totalSupply: (data[5]?.result as bigint | undefined) ?? 0n,
      tokens: (basketData?.[0] ?? []) as `0x${string}`[],
      weights: (basketData?.[1] ?? []).map((weight) => Number(weight) / BPS_DENOMINATOR),
      balance: (data[7]?.result as bigint | undefined) ?? 0n,
    }
  }, [address, data])

  return { vault, isLoading, refetch }
}
