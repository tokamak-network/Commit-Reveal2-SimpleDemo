"use client";

import { decodeFunctionData } from "viem";
import { commitReveal2Abi } from "@/constants";

export function useDecodedRevealOrder(input: `0x${string}` | undefined) {
  if (!input) return [];

  const { functionName, args } = decodeFunctionData({
    abi: commitReveal2Abi,
    data: input,
  });

  const packedRevealOrder = args?.[2] as bigint;
  const secretSigList = args?.[0] as { secret: `0x${string}` }[];
  const packedBytes = new Uint8Array(secretSigList.length);
  let temp = packedRevealOrder;
  for (let i = 0; i < secretSigList.length; i++) {
    packedBytes[i] = Number(temp & BigInt(0xff));
    temp >>= BigInt(8);
  }

  const revealOrder = Array.from(packedBytes).slice(0, secretSigList.length);
  const revealRows = revealOrder.map((nodeIndex, i) => ({
    revealOrder: i + 1,
    nodeIndex,
    secret: secretSigList?.[nodeIndex]?.secret,
  }));

  return revealRows;
}
