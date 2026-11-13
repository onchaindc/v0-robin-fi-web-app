/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@rainbow-me/rainbowkit'],
  webpack: (config) => {
    // Optional modules referenced by the MetaMask, WalletConnect, and Coinbase
    // SDKs. They are not needed in the browser, but Next treats the unresolved
    // imports as build errors unless they are aliased away.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
      '@x402/evm': false,
      '@x402/core': false,
      '@x402/svm': false,
    }
    return config
  },
}

export default nextConfig
