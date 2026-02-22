"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { http } from "viem";
import type { ReactNode } from "react";
import type { Chain } from "viem";

const queryClient = new QueryClient();

const robinhoodTestnet: Chain = {
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com/rpc"] },
    public: { http: ["https://rpc.testnet.chain.robinhood.com/rpc"] },
  },
  blockExplorers: {
    default: { name: "Robinhood", url: "https://docs.robinhood.com/chain/" },
  },
};

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default_test_id_robinfi";

const config = getDefaultConfig({
  appName: "RobinFi",
  projectId: projectId,
  chains: [robinhoodTestnet],
  transports: {
    [robinhoodTestnet.id]: http("https://rpc.testnet.chain.robinhood.com/rpc"),
  },
});

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
