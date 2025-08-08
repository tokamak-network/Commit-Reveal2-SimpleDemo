"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { anvil, optimismSepolia, sepolia } from "wagmi/chains";

export default getDefaultConfig({
  appName: "Commit-Reveal2 Demo",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [anvil, sepolia, optimismSepolia],
  ssr: false,
  transports: {
    [anvil.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http("https://sepolia.drpc.org", {
      batch: {
        batchSize: 1,
        wait: 500,
      },
      timeout: 15000,
    }),
    [optimismSepolia.id]: http("https://sepolia.optimism.io", {
      batch: {
        batchSize: 1,
        wait: 500,
      },
      timeout: 15000,
    }),
  },
});
