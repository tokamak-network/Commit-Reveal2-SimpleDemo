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

      // Check if this is a dispute case (single secret) or normal case (array of secrets)
      if (
        args?.[0] &&
        typeof args[0] === "string" &&
        args[0].startsWith("0x")
      ) {
        // Dispute case - single secret
        const secret = args[0] as `0x${string}`;
        return {
          functionName,
          secretList: [secret],
          packedRevealOrder: undefined,
          rsList: [],
          vList: [],
          cvList: [keccak256(keccak256(secret))],
        };
      } else if (functionName === "generateRandomNumberWhenSomeCvsAreOnChain") {
        // Special case for generateRandomNumberWhenSomeCvsAreOnChain
        const allSecrets = args?.[0] as `0x${string}`[];
        const packedRevealOrder = args?.[3] as bigint;

        return {
          functionName,
          secretList: allSecrets || [],
          packedRevealOrder,
          rsList: [], // Ignored for this function
          vList: [], // Ignored for this function
          cvList: [], // Ignored for this function
        };
      } else {
        // Normal case - array of secrets with signatures (generateRandomNumber)
        const secretSigList = (Array.isArray(args?.[0]) ? args[0] : []) as {
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
      }
    } catch (error) {
      console.error("Error decoding input:", error);
      return null;
    }
  }, [input]);
}
