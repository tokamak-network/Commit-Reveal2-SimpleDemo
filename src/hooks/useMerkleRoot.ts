"use client";

import { chainsToContracts, commitReveal2Abi } from "@/constants";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useChainId, useConfig } from "wagmi";

export function useMerkleRoot(
  round: bigint | undefined,
  trialNum: bigint | undefined,
  refreshTrigger?: number // 리프레시 트리거로 사용될 값
) {
  const config = useConfig();
  const chainId = useChainId();
  const contracts = chainsToContracts[chainId];
  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  useEffect(() => {
    if (round === undefined || trialNum === undefined) return;

    let isMounted = true;
    let isLoading = false;

    const fetchMerkleRoot = async () => {
      if (!isMounted || isLoading) return;

      isLoading = true;
      try {
        const res = await readContract(config, {
          abi: commitReveal2Abi,
          address: contracts.commitReveal2 as `0x${string}`,
          functionName: "getMerkleRoot",
          args: [round, trialNum],
          blockTag: "latest",
        });

        if (isMounted) {
          const [root, submitted] = res as [`0x${string}`, boolean];
          setMerkleRoot(submitted ? root : null);
        }
      } catch (error) {
        console.error("Error fetching merkle root:", error);
      } finally {
        isLoading = false;
      }
    };

    fetchMerkleRoot();

    return () => {
      isMounted = false;
    };
  }, [round, trialNum, config, contracts, refreshTrigger]);

  return merkleRoot;
}
