import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { http } from "viem";
import type { Chain } from "viem";

const robinhoodTestnet: Chain = {
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com/rpc"] },
    public: { http: ["https://rpc.testnet.chain.robinhood.com/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      // use the explorer URL from Robinhood docs if they provide one for your build
      url: "https://docs.robinhood.com/chain/",
    },
  },
};

const config = getDefaultConfig({
  appName: "RobinFi",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [robinhoodTestnet],
  transports: {
    [robinhoodTestnet.id]: http("https://rpc.testnet.chain.robinhood.com/rpc"),
  },
});