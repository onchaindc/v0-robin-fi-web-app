export const CONTRACTS = {
  FACTORY_ADDRESS: '0xaF83e70D5a2676644BE5F677bA9eAe2ff31AeE69', // Update after deployment
  STOCK_TOKENS: {
    TSLA: '0x0000000000000000000000000000000000000001',
    AMZN: '0x0000000000000000000000000000000000000002',
    NFLX: '0x0000000000000000000000000000000000000003',
    PLTR: '0x0000000000000000000000000000000000000004',
    AMD: '0x0000000000000000000000000000000000000005',
  }
}

export const VAULT_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' }
    ],
    outputs: [{ name: 'shares', type: 'uint256' }]
  },
  {
    name: 'redeem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' }
    ],
    outputs: [{ name: 'assets', type: 'uint256' }]
  },
  {
    name: 'rebalance',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'totalAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  }
] as const

export const FACTORY_ABI = [
  {
    name: 'createVault',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'stockTokens', type: 'address[]' },
      { name: 'allocations', type: 'uint256[]' }
    ],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'getAllVaults',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }]
  },
  {
    name: 'getVaultsByCreator',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: '', type: 'address[]' }]
  }
] as const