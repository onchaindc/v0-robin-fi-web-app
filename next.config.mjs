/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@rainbow-me/rainbowkit', '@wagmi/core', 'wagmi', 'viem'],
  webpack: (config) => {
    // Optional Coinbase CDP / x402 modules pulled in by RainbowKit connectors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@x402/evm': false,
      '@x402/core': false,
      '@x402/svm': false,
    }
    config.externals = config.externals || []
    if (Array.isArray(config.externals)) {
      config.externals.push({
        '@x402/evm': 'commonjs @x402/evm',
        '@x402/core': 'commonjs @x402/core',
        '@x402/svm': 'commonjs @x402/svm',
      })
    }
    return config
  },
}

export default nextConfig
