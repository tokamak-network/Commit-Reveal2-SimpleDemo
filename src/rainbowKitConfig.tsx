"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { anvil, sepolia } from "wagmi/chains";

export default getDefaultConfig({
  appName: "Commit-Reveal2 Demo",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [anvil, sepolia],
  ssr: false,
  transports: {
    [anvil.id]: http(),
    [sepolia.id]: http("https://sepolia.drpc.org", {
      batch: {
        batchSize: 1,
        wait: 500,
      },
      timeout: 15000,
    }),
  },
});
