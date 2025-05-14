"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, sepolia } from "wagmi/chains";

export default getDefaultConfig({
  appName: "Commit-Reveal2 Demo",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [anvil, sepolia],
  ssr: false,
});
