"use client";

import { commitReveal2Abi } from "@/constants";
import { useMemo } from "react";
import { decodeFunctionData, keccak256 } from "viem";

export function useDecodedInput(input: `0x${string}` | undefined) {
  return useMemo(() => {
    if (!input) return null;

    try {
      const { functionName, args } = decodeFunctionData({
        abi: commitReveal2Abi,
        data: input,
      });

      const secretSigList = args?.[0] as {
        secret: `0x${string}`;
        rs: { r: `0x${string}`; s: `0x${string}` };
      }[];
      const packedRevealOrder = args?.[2] as bigint;
      const packedVs = args?.[1] as bigint;

      const secretList = secretSigList.map(({ secret }) => secret);
      const rsList = secretSigList.map(({ rs }) => rs);
      const cvList = secretList.map((secret) => keccak256(keccak256(secret)));

      const packedBytes = new Uint8Array(secretSigList.length);
      let temp = packedVs;
      for (let i = 0; i < secretSigList.length; i++) {
        packedBytes[i] = Number(temp & BigInt(0xff));
        temp >>= BigInt(8);
      }
      const vList = Array.from(packedBytes).slice(0, secretSigList.length);

      return {
        functionName,
        secretList,
        packedRevealOrder,
        rsList,
        vList,
        cvList,
      };
    } catch (error) {
      console.error("Error decoding input:", error);
      return null;
    }
  }, [input]);
}
